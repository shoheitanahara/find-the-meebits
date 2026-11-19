/**
 * カメラと「見たい相手」（プレイヤー・会話中の NPC）のあいだにある物を半透明にする。
 *
 * - 透かす単位は userData.occluder が付いたグループ（建物・木・街灯など）ごと。
 *   建物の一部だけが消えて看板や光る部分が宙に浮かないよう、まとめて透かす。
 * - 判定はカメラから相手へ数本のレイ。さらにカメラが物の範囲に入り込んだときも透かす
 *   （物の内側からはレイが面に当たらないため）。
 * - 素材は他の物と共有されていることがあるので、透かす物だけ複製して差し替え、
 *   元に戻ったら元の素材へ戻して複製は破棄する。
 * - 床・背景・キャラクターには目印を付けないので判定の対象外（軽さのため）。
 */
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import {
  Box3,
  type Camera,
  type Material,
  type Mesh,
  type Object3D,
  Raycaster,
  Vector3,
} from 'three'

/** 透かす単位のグループに付ける userData */
export const OCCLUDER_USER_DATA = { occluder: true } as const

/** 透かしたときの不透明度 */
const FADED_OPACITY = 0.22
/** 透過の出し入れの速さ（大きいほど速い） */
const FADE_SPEED = 10
/** 判定は数フレームおき */
const CHECK_EVERY_FRAMES = 2
/** 物の範囲（バウンディングボックス）の取り直し間隔 */
const BOUNDS_REFRESH_FRAMES = 45
/** レイの終点を相手の手前で止める距離（相手自身に当てない） */
const TARGET_MARGIN = 0.35
/** カメラが範囲に入ったとみなす余白 */
const CAMERA_INSIDE_MARGIN = 0.25

type MeshState = {
  mesh: Mesh
  originalMaterial: Material | Material[]
  originalVisible: boolean
  /** 複製した素材（透過できる素材だけ） */
  clones: Material[] | null
  baseOpacities: number[]
}

type FadeEntry = {
  root: Object3D
  opacity: number
  target: number
  meshes: MeshState[]
}

function isFadeableMaterial(material: Material) {
  const m = material as Material & {
    isMeshStandardMaterial?: boolean
    isMeshBasicMaterial?: boolean
    isMeshLambertMaterial?: boolean
    isMeshPhongMaterial?: boolean
    /** troika（drei の Text）の派生素材。複製するとシェーダーが壊れる */
    isDerivedMaterial?: boolean
  }
  if (m.isDerivedMaterial) return false
  return Boolean(
    m.isMeshStandardMaterial || m.isMeshBasicMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial,
  )
}

function findOccluderRoot(object: Object3D): Object3D | null {
  let current: Object3D | null = object
  while (current) {
    if (current.userData?.occluder) return current
    current = current.parent
  }
  return null
}

function collectOccluderRoots(scene: Object3D): Object3D[] {
  const roots: Object3D[] = []
  scene.traverse((object) => {
    // 入れ子の目印は外側だけを採用する
    if (object.userData?.occluder && !findOccluderRoot(object.parent ?? scene)) {
      roots.push(object)
    }
  })
  return roots
}

function beginFade(root: Object3D): FadeEntry {
  const meshes: MeshState[] = []
  root.traverse((object) => {
    const mesh = object as Mesh
    if (!mesh.isMesh) return
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    const fadeable = materials.every(isFadeableMaterial)
    if (!fadeable) {
      // 文字（troika）などは複製せず、薄くなったら表示ごと消す
      meshes.push({
        mesh,
        originalMaterial: mesh.material,
        originalVisible: mesh.visible,
        clones: null,
        baseOpacities: [],
      })
      return
    }
    const clones = materials.map((material) => {
      const clone = material.clone()
      clone.transparent = true
      clone.depthWrite = false
      return clone
    })
    meshes.push({
      mesh,
      originalMaterial: mesh.material,
      originalVisible: mesh.visible,
      clones,
      baseOpacities: materials.map((material) => material.opacity),
    })
    mesh.material = Array.isArray(mesh.material) ? clones : clones[0]
  })
  return { root, opacity: 1, target: FADED_OPACITY, meshes }
}

function applyOpacity(entry: FadeEntry) {
  for (const state of entry.meshes) {
    if (!state.clones) {
      state.mesh.visible = state.originalVisible && entry.opacity > 0.55
      continue
    }
    state.clones.forEach((clone, index) => {
      clone.opacity = state.baseOpacities[index] * entry.opacity
    })
  }
}

function endFade(entry: FadeEntry, restore: boolean) {
  for (const state of entry.meshes) {
    if (restore) {
      state.mesh.material = state.originalMaterial
      state.mesh.visible = state.originalVisible
    }
    state.clones?.forEach((clone) => clone.dispose())
  }
}

/**
 * @param getTargets 見たい相手のワールド座標（毎回呼ぶ）。空なら何もしない
 */
export function CameraOcclusionFader({ getTargets }: { getTargets: () => Vector3[] }) {
  const scene = useThree((state) => state.scene)
  const entries = useRef(new Map<Object3D, FadeEntry>())
  const roots = useRef<Object3D[]>([])
  const bounds = useRef(new Map<Object3D, Box3>())
  const frame = useRef(0)
  const raycaster = useRef(new Raycaster())
  const direction = useRef(new Vector3())

  useEffect(() => {
    const map = entries.current
    return () => {
      map.forEach((entry) => endFade(entry, true))
      map.clear()
    }
  }, [])

  useFrame(({ camera }, delta) => {
    frame.current += 1

    if (frame.current % BOUNDS_REFRESH_FRAMES === 1) {
      roots.current = collectOccluderRoots(scene)
      bounds.current.clear()
      for (const root of roots.current) {
        bounds.current.set(root, new Box3().setFromObject(root))
      }
    }

    if (frame.current % CHECK_EVERY_FRAMES === 0) {
      const occluding = findOccluding(camera, getTargets(), roots.current, bounds.current, raycaster.current, direction.current)
      for (const root of occluding) {
        const entry = entries.current.get(root)
        if (entry) entry.target = FADED_OPACITY
        else entries.current.set(root, beginFade(root))
      }
      entries.current.forEach((entry, root) => {
        if (!occluding.has(root)) entry.target = 1
      })
    }

    const step = 1 - Math.exp(-delta * FADE_SPEED)
    entries.current.forEach((entry, root) => {
      // ゾーン切替などでシーンから外れた物は、戻さずに複製だけ捨てる
      if (!isInScene(root, scene)) {
        endFade(entry, false)
        entries.current.delete(root)
        return
      }
      entry.opacity += (entry.target - entry.opacity) * step
      if (entry.target === 1 && entry.opacity > 0.985) {
        endFade(entry, true)
        entries.current.delete(root)
        return
      }
      applyOpacity(entry)
    })
  })

  return null
}

function isInScene(object: Object3D, scene: Object3D) {
  let current: Object3D | null = object
  while (current) {
    if (current === scene) return true
    current = current.parent
  }
  return false
}

function findOccluding(
  camera: Camera,
  targets: Vector3[],
  roots: Object3D[],
  bounds: Map<Object3D, Box3>,
  raycaster: Raycaster,
  direction: Vector3,
): Set<Object3D> {
  const result = new Set<Object3D>()
  if (targets.length === 0 || roots.length === 0) return result
  const origin = camera.position

  // カメラが物の範囲に入り込んでいる（内側からはレイが当たらない）
  for (const root of roots) {
    const box = bounds.get(root)
    if (box && !box.isEmpty() && box.distanceToPoint(origin) <= CAMERA_INSIDE_MARGIN) {
      result.add(root)
    }
  }

  for (const target of targets) {
    direction.subVectors(target, origin)
    const distance = direction.length()
    if (distance <= TARGET_MARGIN) continue
    direction.normalize()
    raycaster.set(origin, direction)
    raycaster.near = 0
    raycaster.far = distance - TARGET_MARGIN
    for (const hit of raycaster.intersectObjects(roots, true)) {
      const root = findOccluderRoot(hit.object)
      if (root) result.add(root)
    }
  }
  return result
}
