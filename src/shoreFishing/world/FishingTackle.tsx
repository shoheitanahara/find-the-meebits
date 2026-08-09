import { useMemo, useRef, type MutableRefObject, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, Group, MathUtils, Quaternion, Vector3 } from 'three'
import { VRMHumanBoneName, type VRM } from '@pixiv/three-vrm'
import { applyHandPropFit } from '../../avatar/vrmHandPropFit'
import type { FishingAction } from '../../avatar/VRMLocomotion'
import { SHORE_FISHING } from '../config'
import {
  clearShoreBobberWorld,
  setShoreBobberWorld,
  setShoreRodTip,
  shorePlayerWorld,
} from '../playerWorld'
import { useShoreFishingStore, type CastPhase } from '../store'
import { VoxelFish } from './VoxelFish'

const land = new Vector3()
const hold = new Vector3()
const tmp = new Vector3()
const tipWorld = new Vector3()
const tipLocal = new Vector3()
const handWorld = new Vector3()
const lineDir = new Vector3()
const yUp = new Vector3(0, 1, 0)
const lineQuat = new Quaternion()

export function fishingActionFromCast(castPhase: CastPhase): FishingAction {
  if (castPhase === 'casting') return 'cast'
  if (castPhase === 'approach' || castPhase === 'nibble' || castPhase === 'bite') return 'wait'
  if (castPhase === 'reeling') return 'reel'
  if (castPhase === 'caught') return 'catch'
  return 'carry'
}

function castTotalSec() {
  return SHORE_FISHING.castWindupSec + SHORE_FISHING.castFlightSec
}

/** 振りかぶりが全体の何割か（腕・竿・ルアーで共有） */
export function castWindupRatio() {
  return SHORE_FISHING.castWindupSec / castTotalSec()
}

export function fishingActionT(castPhase: CastPhase, animStartedAt: number | null): number {
  if (!animStartedAt) return 0
  const now = performance.now()
  if (castPhase === 'casting') {
    return MathUtils.clamp((now - animStartedAt) / (castTotalSec() * 1000), 0, 1)
  }
  if (castPhase === 'reeling') {
    return MathUtils.clamp((now - animStartedAt) / (SHORE_FISHING.reelSec * 1000), 0, 1)
  }
  return 0
}

/** 竿のピッチ。+X = 穂先が前方。振りかぶり中は後ろ、リリースで前へ。 */
function rodPitchFor(action: FishingAction, actionT: number): number {
  if (action === 'cast') {
    const split = castWindupRatio()
    const wind = MathUtils.clamp(actionT / split, 0, 1)
    const whip = MathUtils.clamp((actionT - split) / (1 - split), 0, 1)
    if (actionT < split) return MathUtils.lerp(0.55, -0.55, wind)
    return MathUtils.lerp(-0.55, 1.2, whip * whip * (3 - 2 * whip))
  }
  if (action === 'wait') return 0.95
  if (action === 'reel') return MathUtils.lerp(0.95, 0.35, actionT)
  if (action === 'catch') return 0.25
  return 0.55
}

type FishingRodProps = {
  vrmRef: MutableRefObject<VRM | null>
  rootRef: RefObject<Group | null>
}

/** 右手に追従する釣り竿。歩行中も常に持つ。 */
export function FishingRod({ vrmRef, rootRef }: FishingRodProps) {
  const rodRef = useRef<Group>(null)
  const shaftRef = useRef<Group>(null)

  useFrame(() => {
    const rod = rodRef.current
    const shaft = shaftRef.current
    const root = rootRef.current
    const vrm = vrmRef.current
    if (!rod || !shaft || !root) return

    const store = useShoreFishingStore.getState()
    const show = store.phase === 'playing' || store.phase === 'countdown'
    rod.visible = show
    if (!show) return

    const action = fishingActionFromCast(store.castPhase)
    const actionT = fishingActionT(store.castPhase, store.animStartedAt)

    // 右手ボーンへ追従
    if (vrm) {
      const hand =
        vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightHand) ??
        vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightLowerArm)
      if (hand) {
        hand.getWorldPosition(handWorld)
        root.worldToLocal(handWorld)
        applyHandPropFit(vrm, root, {
          handLocal: handWorld,
          target: rod.position,
          handOffsetX: SHORE_FISHING.rodHand.handOffsetX,
          handOffsetY: SHORE_FISHING.rodHand.handOffsetY,
          handOffsetZ: SHORE_FISHING.rodHand.handOffsetZ,
        })
      } else {
        const fb = SHORE_FISHING.rodHand.fallbackPosition
        rod.position.set(fb[0], fb[1], fb[2])
      }
    } else {
      const fb = SHORE_FISHING.rodHand.fallbackPosition
      rod.position.set(fb[0], fb[1], fb[2])
    }

    // 穂先を前方へ（+rotation.x）。背中側へ倒さない
    shaft.rotation.x = rodPitchFor(action, actionT)
    shaft.rotation.z = action === 'carry' ? -0.08 : -0.04

    // 穂先ワールド座標をライン用に公開
    tipLocal.set(0, SHORE_FISHING.rodHand.length, 0)
    shaft.localToWorld(tipLocal)
    setShoreRodTip(tipLocal.x, tipLocal.y, tipLocal.z)
  })

  return (
    <group ref={rodRef} visible={false}>
      <group ref={shaftRef}>
        {/* グリップ */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.028, 0.032, 0.16, 8]} />
          <meshStandardMaterial color="#3a2818" roughness={0.75} />
        </mesh>
        {/* 竿本体（+Y = 穂先） */}
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.028, 1.2, 6]} />
          <meshStandardMaterial color="#8a6238" roughness={0.65} />
        </mesh>
        <mesh position={[0, 1.42, 0]} castShadow>
          <cylinderGeometry args={[0.008, 0.014, 0.45, 6]} />
          <meshStandardMaterial color="#d2b896" roughness={0.4} metalness={0.15} />
        </mesh>
      </group>
    </group>
  )
}

/** ワールド空間の浮き・ライン・釣り上げ魚。 */
export function FishingWorldFx() {
  const bobberRef = useRef<Group>(null)
  const fishRef = useRef<Group>(null)
  const lineRef = useRef<Group>(null)
  const dipRef = useRef(0)
  const lastNibbleRef = useRef(0)

  const castPhase = useShoreFishingStore((s) => s.castPhase)
  const nibbleIndex = useShoreFishingStore((s) => s.nibbleIndex)
  const pendingFishId = useShoreFishingStore((s) => s.pendingFishId)
  const lastCatch = useShoreFishingStore((s) => s.lastCatch)
  const animStartedAt = useShoreFishingStore((s) => s.animStartedAt)
  const bobberLand = useShoreFishingStore((s) => s.bobberLand)
  const castOrigin = useShoreFishingStore((s) => s.castOrigin)
  const phase = useShoreFishingStore((s) => s.phase)

  const castCurve = useMemo(() => {
    if (!bobberLand || !castOrigin) return null
    const start = new Vector3(
      castOrigin.x + Math.sin(castOrigin.rotationY) * 0.4,
      1.85,
      castOrigin.z + Math.cos(castOrigin.rotationY) * 0.4,
    )
    const mid = new Vector3(
      (start.x + bobberLand.x) * 0.5,
      3.2,
      (start.z + bobberLand.z) * 0.5,
    )
    const end = new Vector3(bobberLand.x, bobberLand.y, bobberLand.z)
    return new CatmullRomCurve3([start, mid, end])
  }, [bobberLand, castOrigin])

  useFrame((_, delta) => {
    const bobber = bobberRef.current
    const fish = fishRef.current
    const line = lineRef.current
    if (!bobber) return

    if (phase !== 'playing' || !bobberLand || !castOrigin) {
      bobber.visible = false
      if (fish) fish.visible = false
      if (line) line.visible = false
      clearShoreBobberWorld()
      return
    }

    tipWorld.set(shorePlayerWorld.tipX, shorePlayerWorld.tipY, shorePlayerWorld.tipZ)

    land.set(bobberLand.x, bobberLand.y, bobberLand.z)
    hold.set(
      castOrigin.x + Math.sin(castOrigin.rotationY) * SHORE_FISHING.catchHoldDistance,
      SHORE_FISHING.catchHoldY,
      castOrigin.z + Math.cos(castOrigin.rotationY) * SHORE_FISHING.catchHoldDistance,
    )

    if (castPhase === 'casting' && animStartedAt && castCurve) {
      bobber.visible = true
      if (fish) fish.visible = false
      const elapsed = performance.now() - animStartedAt
      const windupMs = SHORE_FISHING.castWindupSec * 1000
      // 振りかぶり中は穂先に留め、リリース後にだけ飛ばす
      if (elapsed < windupMs) {
        bobber.position.copy(tipWorld)
      } else {
        const t = MathUtils.clamp(
          (elapsed - windupMs) / (SHORE_FISHING.castFlightSec * 1000),
          0,
          1,
        )
        castCurve.getPoint(t, tmp)
        bobber.position.copy(tmp)
      }
      dipRef.current = 0
    } else if (castPhase === 'approach' || castPhase === 'nibble' || castPhase === 'bite') {
      bobber.visible = true
      if (fish) fish.visible = false
      if (castPhase === 'nibble' && nibbleIndex !== lastNibbleRef.current) {
        lastNibbleRef.current = nibbleIndex
        dipRef.current = 0.22
      }
      if (castPhase === 'bite') {
        dipRef.current = MathUtils.lerp(dipRef.current, 0.42, 1 - Math.exp(-delta * 20))
      } else if (castPhase === 'nibble') {
        dipRef.current = MathUtils.lerp(dipRef.current, 0, 1 - Math.exp(-delta * 7))
      } else {
        dipRef.current = MathUtils.lerp(dipRef.current, 0, 1 - Math.exp(-delta * 8))
      }
      const bob = castPhase === 'bite' ? 0 : Math.sin(performance.now() * 0.004) * 0.03
      bobber.position.set(land.x, land.y - dipRef.current + bob, land.z)
    } else if (castPhase === 'reeling' && animStartedAt) {
      bobber.visible = true
      const t = MathUtils.clamp(
        (performance.now() - animStartedAt) / (SHORE_FISHING.reelSec * 1000),
        0,
        1,
      )
      const ease = 1 - (1 - t) * (1 - t)
      const arc = pendingFishId ? 1.55 : 1.1
      tmp.set(
        MathUtils.lerp(land.x, hold.x, ease),
        MathUtils.lerp(land.y, hold.y, ease) + Math.sin(ease * Math.PI) * arc,
        MathUtils.lerp(land.z, hold.z, ease),
      )
      bobber.position.copy(tmp)
      if (fish) {
        // 空の引き上げでは前回釣果メッシュを出さない
        fish.visible = Boolean(pendingFishId)
        if (fish.visible) {
          fish.position.copy(tmp)
          fish.rotation.set(ease * 0.9, ease * Math.PI * 1.6, ease * 0.35)
        }
      }
    } else if (castPhase === 'caught') {
      bobber.visible = false
      if (fish) {
        fish.visible = true
        fish.position.copy(hold)
        fish.rotation.set(0.35, 0.4, 0.1)
      }
    } else {
      bobber.visible = false
      if (fish) fish.visible = false
    }

    if (bobber.visible) {
      setShoreBobberWorld(bobber.position.x, bobber.position.y, bobber.position.z)
    } else if (fish?.visible) {
      setShoreBobberWorld(fish.position.x, fish.position.y, fish.position.z)
    } else {
      clearShoreBobberWorld()
    }

    if (line) {
      const draw =
        castPhase === 'casting' ||
        castPhase === 'approach' ||
        castPhase === 'nibble' ||
        castPhase === 'bite' ||
        castPhase === 'reeling' ||
        castPhase === 'caught'
      line.visible = draw && (bobber.visible || Boolean(fish?.visible))
      if (line.visible) {
        const to = bobber.visible ? bobber.position : fish!.position
        lineDir.copy(to).sub(tipWorld)
        const len = lineDir.length()
        if (len > 0.05) {
          line.position.copy(tipWorld).addScaledVector(lineDir, 0.5)
          lineQuat.setFromUnitVectors(yUp, tmp.copy(lineDir).normalize())
          line.quaternion.copy(lineQuat)
          line.scale.set(1, len, 1)
        }
      }
    }
  })

  const fishId = pendingFishId ?? (castPhase === 'caught' ? lastCatch?.fishId : null) ?? null

  return (
    <group>
      <group ref={bobberRef} visible={false}>
        <mesh>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#e04040" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
        </mesh>
      </group>
      <group ref={lineRef} visible={false}>
        <mesh>
          <cylinderGeometry args={[0.006, 0.006, 1, 4]} />
          <meshBasicMaterial color="#d8d0c0" transparent opacity={0.55} />
        </mesh>
      </group>
      <group ref={fishRef} visible={false}>
        {fishId ? <VoxelFish key={fishId} fishId={fishId} /> : null}
      </group>
    </group>
  )
}
