import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import { Box3, SkinnedMesh } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { Object3D } from 'three'
import { DEFAULT_PLAYER_MEEBIT_ID, VRM_FEET_Y_OFFSET, VRM_WORLD_SCALE } from '../game/gameConfig'

export const DEFAULT_MEEBIT_ID = DEFAULT_PLAYER_MEEBIT_ID

const _meshBox = new Box3()
const _posedBounds = new Box3()

const VRM_BASE_URL = (import.meta.env.VITE_VRM_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export function getMeebitVrmUrl(meebitId: number = DEFAULT_MEEBIT_ID) {
  // Production: Cloudflare Worker + R2 (CORS enabled).
  // Dev: leave VITE_VRM_BASE_URL empty — Vite proxies /vrm/* to wrangler dev.
  const path = `/vrm/${meebitId}.vrm`
  return VRM_BASE_URL ? `${VRM_BASE_URL}${path}` : path
}

export function loadVRM(url: string): Promise<VRM> {
  const loader = new GLTFLoader()
  loader.register((parser) => new VRMLoaderPlugin(parser))

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const vrm = gltf.userData.vrm as VRM | undefined

        if (!vrm) {
          reject(new Error('VRM data was not found in the loaded file.'))
          return
        }

        VRMUtils.removeUnnecessaryVertices(vrm.scene)
        VRMUtils.rotateVRM0(vrm)
        alignVrmFeetToGround(vrm.scene)
        enableShadows(vrm.scene)
        resolve(vrm)
      },
      undefined,
      (error) => {
        reject(error instanceof Error ? error : new Error('Could not load VRM model.'))
      },
    )
  })
}

function alignVrmFeetToGround(scene: Object3D) {
  const box = new Box3().setFromObject(scene)
  if (!Number.isFinite(box.min.y)) {
    return
  }

  // primitive の scale を考慮し、ワールド座標で足元が VRM_FEET_Y_OFFSET になるよう調整
  scene.position.y = -box.min.y + VRM_FEET_Y_OFFSET / VRM_WORLD_SCALE
}

function alignVrmFeetFlush(scene: Object3D) {
  const box = new Box3().setFromObject(scene)
  if (!Number.isFinite(box.min.y)) {
    return
  }

  scene.position.y -= box.min.y
}

/** 展示フィギュア用 — ポーズ後の SkinnedMesh bbox で足元を親原点 y=0 に合わせる */
export function alignVrmFigureFeet(vrm: VRM) {
  vrm.update(0)
  vrm.scene.updateMatrixWorld(true)

  _posedBounds.makeEmpty()
  vrm.scene.traverse((obj) => {
    if (!(obj instanceof SkinnedMesh)) {
      return
    }
    obj.computeBoundingBox()
    const bounds = obj.geometry.boundingBox
    if (!bounds) {
      return
    }
    _meshBox.copy(bounds).applyMatrix4(obj.matrix)
    _posedBounds.union(_meshBox)
  })

  if (_posedBounds.isEmpty() || !Number.isFinite(_posedBounds.min.y)) {
    alignVrmFeetFlush(vrm.scene)
    return
  }

  // ローカル最低点を親原点へ（相対移動でロード時オフセットも打ち消す）
  vrm.scene.position.y -= _posedBounds.min.y
}

function enableShadows(root: Object3D) {
  setVrmCastShadow(root, true)
  root.traverse((object) => {
    // 足を浮かせた状態で receiveShadow すると、足元に不自然な影が乗りやすい
    object.receiveShadow = false
  })
}

export function setVrmCastShadow(root: Object3D, castShadow: boolean) {
  root.traverse((object) => {
    object.castShadow = castShadow
  })
}
