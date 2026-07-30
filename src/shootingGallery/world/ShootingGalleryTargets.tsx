import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, MeshStandardMaterial } from 'three'
import {
  getDifficultyPhase,
  SHOOTING_GALLERY,
  type TargetKind,
  type TargetMotion,
} from '../config'
import { useShootingGalleryStore } from '../store'

export type TargetRuntime = {
  id: number
  kind: TargetKind
  motion: TargetMotion
  lane: 0 | 1 | 2
  small: boolean
  baseX: number
  baseY: number
  baseZ: number
  amp: number
  speed: number
  phase: number
  alive: boolean
  visible: boolean
  hitAt: number | null
  lifeT: number
  lifeDuration: number
  hiddenUntil: number
  x: number
  y: number
  z: number
}

type SpawnPlan = {
  kind: TargetKind
  motion: TargetMotion
  lane: 0 | 1 | 2
  small: boolean
}

const POOL_SIZE = SHOOTING_GALLERY.maxActiveTargets + 4
let nextTargetId = 1

/** シーン外から参照する的ランタイム（レイキャスト用） */
export const shootingTargetsRuntime: {
  targets: TargetRuntime[]
  groups: Map<number, Group>
} = {
  targets: [],
  groups: new Map(),
}

function pickMidGameMotion(roll: number): TargetMotion {
  if (roll < 0.45) return 'vertical'
  if (roll < 0.7) return 'horizontal'
  return 'brief'
}

function pickLateGameMotion(roll: number): TargetMotion {
  if (roll < 0.5) return 'horizontal'
  if (roll < 0.75) return 'vertical'
  return 'trolley'
}

function pickMovingMotion(roll: number): TargetMotion {
  return roll < 0.5 ? 'horizontal' : 'vertical'
}

function pickSpawnPlan(phase: 0 | 1 | 2, canSpawnRed: boolean): SpawnPlan {
  const lane = Math.floor(Math.random() * 3) as 0 | 1 | 2
  if (phase === 0) {
    const kinds: TargetKind[] = ['plate', 'star', 'can', 'bottle', 'animal']
    return {
      kind: kinds[Math.floor(Math.random() * kinds.length)]!,
      motion: 'static',
      lane,
      small: false,
    }
  }
  if (phase === 1) {
    const roll = Math.random()
    if (canSpawnRed && roll < SHOOTING_GALLERY.redTargetSpawnChance[phase]) {
      return { kind: 'red', motion: 'horizontal', lane, small: false }
    }
    const kinds: TargetKind[] = ['plate', 'star', 'can', 'bottle', 'animal', 'trolley']
    const small = Math.random() < 0.45
    return {
      kind: kinds[Math.floor(Math.random() * kinds.length)]!,
      motion: small ? pickMidGameMotion(roll) : pickMovingMotion(roll),
      lane,
      small,
    }
  }
  const specialTargetRoll = Math.random()
  if (canSpawnRed && specialTargetRoll < SHOOTING_GALLERY.redTargetSpawnChance[phase]) {
    return { kind: 'red', motion: 'horizontal', lane, small: false }
  }
  const roll = Math.random()
  if (roll < 0.14) {
    return {
      kind: 'gold',
      motion: pickMovingMotion(Math.random()),
      lane,
      small: true,
    }
  }
  const kinds: TargetKind[] = ['plate', 'star', 'can', 'bottle', 'animal', 'trolley']
  const small = Math.random() < 0.55
  return {
    kind: kinds[Math.floor(Math.random() * kinds.length)]!,
    motion: pickLateGameMotion(roll),
    lane,
    small,
  }
}

function targetMinX(y: number) {
  const { lowerMin, upperMin, upperThresholdY } = SHOOTING_GALLERY.targetXRange
  return y >= upperThresholdY ? upperMin : lowerMin
}

function chooseSpawnPosition(
  motion: TargetMotion,
  horizontalMargin: number,
  existingTargets: TargetRuntime[],
) {
  const verticalAmp = SHOOTING_GALLERY.targetMotionAmplitude.vertical
  const activeTargets = existingTargets.filter((target) => target.alive)
  let bestPosition = { x: 0, y: 1.5 }
  let bestDistanceSq = -1

  for (let attempt = 0; attempt < 14; attempt += 1) {
    const y =
      motion === 'vertical'
        ? MathUtils.randFloat(
            SHOOTING_GALLERY.targetYRange.min + verticalAmp,
            SHOOTING_GALLERY.targetYRange.max - verticalAmp,
          )
        : MathUtils.randFloat(
            SHOOTING_GALLERY.targetYRange.min + 0.1,
            SHOOTING_GALLERY.targetYRange.max - 0.1,
          )
    const x = MathUtils.randFloat(
      targetMinX(y) + horizontalMargin,
      SHOOTING_GALLERY.targetXRange.max - horizontalMargin,
    )
    const nearestDistanceSq =
      activeTargets.length === 0
        ? Number.POSITIVE_INFINITY
        : Math.min(
            ...activeTargets.map((target) => {
              const dx = x - target.x
              const dy = (y - target.y) * 1.45
              return dx * dx + dy * dy
            }),
          )

    if (nearestDistanceSq > bestDistanceSq) {
      bestPosition = { x, y }
      bestDistanceSq = nearestDistanceSq
    }
  }

  return bestPosition
}

function createTarget(
  plan: SpawnPlan,
  elapsed: number,
  existingTargets: TargetRuntime[],
): TargetRuntime {
  const laneZ = SHOOTING_GALLERY.laneZ[plan.lane]
  const speedBoost = plan.lane === 0 ? 1.25 : plan.lane === 1 ? 1.05 : 0.9
  const phaseSpeed = 0.7 + getDifficultyPhase(elapsed) * 0.35
  const isSmall = plan.small || plan.kind === 'gold'
  const amp = isSmall
    ? SHOOTING_GALLERY.targetMotionAmplitude.small
    : SHOOTING_GALLERY.targetMotionAmplitude.normal
  const motion = plan.motion
  const horizontalMargin =
    motion === 'horizontal' || motion === 'trolley'
      ? amp
      : motion === 'vertical'
        ? amp * 0.35
        : 0
  const { x: baseX, y: baseY } = chooseSpawnPosition(
    motion,
    horizontalMargin,
    existingTargets,
  )
  return {
    id: nextTargetId++,
    kind: plan.kind,
    motion,
    lane: plan.lane,
    small: isSmall,
    baseX,
    baseY,
    baseZ: laneZ + MathUtils.randFloat(-0.15, 0.15),
    amp,
    speed: (0.55 + Math.random() * 0.55) * speedBoost * phaseSpeed,
    phase: Math.random() * Math.PI * 2,
    alive: true,
    visible: plan.motion !== 'pop' && plan.motion !== 'brief',
    hitAt: null,
    lifeT: 0,
    lifeDuration:
      motion === 'brief'
        ? 1.6 + Math.random() * 0.8
        : plan.kind === 'red'
          ? 2.6 + Math.random() * 0.8
          : 4.2 + Math.random() * 1.4,
    hiddenUntil:
      plan.motion === 'pop' || plan.motion === 'brief'
        ? performance.now() + 400 + Math.random() * 900
        : 0,
    x: baseX,
    y: baseY,
    z: laneZ,
  }
}

function desiredActiveCount(phase: 0 | 1 | 2) {
  if (phase === 0) return 4
  if (phase === 1) return 7
  return 9
}

function staggerTargetsAcrossDifficultyTransition(targets: TargetRuntime[]) {
  let transitionIndex = 0
  for (const target of targets) {
    if (!target.alive || !target.visible) continue
    const minimumRemainingSec =
      SHOOTING_GALLERY.difficultyTransitionGraceSec +
      transitionIndex * SHOOTING_GALLERY.difficultyTransitionStaggerSec
    target.lifeDuration = Math.max(
      target.lifeDuration,
      target.lifeT + minimumRemainingSec,
    )
    transitionIndex += 1
  }
}

/** 的プール。物理なしの座標更新 + 倒れる演出。 */
export function ShootingGalleryTargets() {
  const poolRef = useRef<Array<Group | null>>(Array.from({ length: POOL_SIZE }, () => null))
  const sessionKey = useShootingGalleryStore((state) => state.sessionKey)
  const phase = useShootingGalleryStore((state) => state.phase)
  const localTimeRef = useRef(0)
  const spawnCooldownRef = useRef(0)
  const difficultyRef = useRef<0 | 1 | 2>(0)

  useEffect(() => {
    shootingTargetsRuntime.targets = []
    shootingTargetsRuntime.groups.clear()
    localTimeRef.current = 0
    spawnCooldownRef.current = 0
    difficultyRef.current = 0
    nextTargetId = 1
    for (const group of poolRef.current) {
      if (!group) continue
      group.visible = false
      group.userData.targetId = null
      group.userData.alive = false
    }
  }, [sessionKey])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const store = useShootingGalleryStore.getState()
    if (store.phase !== 'playing' && store.phase !== 'countdown' && store.phase !== 'result') {
      return
    }

    localTimeRef.current += dt
    const elapsed =
      store.phase === 'playing' && store.startedAt
        ? (performance.now() - store.startedAt) / 1000
        : 0
    const difficulty = getDifficultyPhase(elapsed)
    const targets = shootingTargetsRuntime.targets

    if (store.phase === 'playing') {
      if (difficulty !== difficultyRef.current) {
        staggerTargetsAcrossDifficultyTransition(targets)
        difficultyRef.current = difficulty
        spawnCooldownRef.current = 0
      }
      spawnCooldownRef.current -= dt
      const aliveVisible = targets.filter((t) => t.alive && t.visible).length
      if (aliveVisible < desiredActiveCount(difficulty) && spawnCooldownRef.current <= 0) {
        const freeSlot = targets.findIndex((t) => !t.alive)
        const activeRedTargetCount = targets.filter(
          (target) => target.alive && target.kind === 'red',
        ).length
        const canSpawnRed =
          activeRedTargetCount < SHOOTING_GALLERY.maxActiveRedTargets[difficulty]
        const next = createTarget(
          pickSpawnPlan(difficulty, canSpawnRed),
          elapsed,
          targets,
        )
        if (freeSlot >= 0) {
          targets[freeSlot] = next
        } else if (targets.length < POOL_SIZE) {
          targets.push(next)
        }
        spawnCooldownRef.current =
          difficulty === 0 ? 0.75 : difficulty === 1 ? 0.45 : 0.28
      }
    }

    const now = performance.now()
    shootingTargetsRuntime.groups.clear()

    for (let i = 0; i < POOL_SIZE; i += 1) {
      const group = poolRef.current[i]
      const target = targets[i]
      if (!group) continue

      if (!target) {
        group.visible = false
        group.userData.alive = false
        continue
      }

      if (target.alive) {
        if (now < target.hiddenUntil) {
          target.visible = false
          } else {
          target.lifeT += dt
          target.visible = target.lifeT < target.lifeDuration
            if (target.lifeT >= target.lifeDuration) {
            target.alive = false
            target.visible = false
          }
        }

        const t = localTimeRef.current * target.speed + target.phase
        let x = target.baseX
        let y = target.baseY
        let z = target.baseZ
        if (target.motion === 'horizontal' || target.motion === 'trolley') {
          x = target.baseX + Math.sin(t) * target.amp
        }
        if (target.motion === 'vertical') {
          y =
            target.baseY +
            Math.sin(t) * SHOOTING_GALLERY.targetMotionAmplitude.vertical
          x = target.baseX + Math.sin(t * 0.55) * (target.amp * 0.35)
        }
        if (target.motion === 'trolley') {
          z = target.baseZ + Math.sin(t * 0.5) * 0.15
        }
        x = MathUtils.clamp(
          x,
          targetMinX(y),
          SHOOTING_GALLERY.targetXRange.max,
        )
        y = MathUtils.clamp(
          y,
          SHOOTING_GALLERY.targetYRange.min,
          SHOOTING_GALLERY.targetYRange.max,
        )
        target.x = x
        target.y = y
        target.z = z
        group.position.set(x, y, z)
        group.rotation.set(0, 0, 0)
        group.visible = target.visible
        const baseScale = target.small ? 0.72 : 1
        const remainingLifeSec = target.lifeDuration - target.lifeT
        const exitScale = MathUtils.clamp(
          remainingLifeSec / SHOOTING_GALLERY.targetExitScaleDurationSec,
          0,
          1,
        )
        group.scale.setScalar(baseScale * exitScale)
      } else if (target.hitAt !== null) {
        const fallT = Math.min(1, (now - target.hitAt) / 380)
        group.visible = fallT < 1
        group.position.set(
          target.x,
          target.y + fallT * 0.15,
          target.z - (target.kind === 'can' || target.kind === 'bottle' ? fallT * 0.8 : fallT * 0.25),
        )
        group.rotation.x = fallT * 1.2
        group.rotation.z = target.kind === 'can' || target.kind === 'bottle' ? fallT * 1.6 : 0
      } else {
        group.visible = false
      }

      group.userData.targetId = target.id
      group.userData.kind = target.kind
      group.userData.small = target.small
      group.userData.alive = target.alive && target.visible
      applyTargetLook(group, target.kind, target.small)
      shootingTargetsRuntime.groups.set(target.id, group)
    }
  })

  return (
    <group visible={phase === 'countdown' || phase === 'playing' || phase === 'result'}>
      {Array.from({ length: POOL_SIZE }, (_, index) => (
        <group
          key={index}
          ref={(node) => {
            poolRef.current[index] = node
          }}
          visible={false}
        >
          <TargetShape />
        </group>
      ))}
    </group>
  )
}

function TargetShape() {
  return (
    <group>
      {/* 全種類でシルエットを統一し、厚み・リム・同心円で質感を出す。 */}
      <mesh name="target-rim" rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.12, 40]} />
        <meshStandardMaterial color="#4a3428" roughness={0.4} metalness={0.35} />
      </mesh>
      <mesh name="target-face" position={[0, 0, 0.066]}>
        <circleGeometry args={[0.445, 40]} />
        <meshStandardMaterial color="#dfd0a8" roughness={0.48} metalness={0.08} />
      </mesh>
      <mesh name="target-outer-ring" position={[0, 0, 0.072]}>
        <ringGeometry args={[0.29, 0.355, 40]} />
        <meshStandardMaterial color="#a63f32" roughness={0.42} />
      </mesh>
      <mesh name="target-inner-ring" position={[0, 0, 0.076]}>
        <ringGeometry args={[0.13, 0.19, 32]} />
        <meshStandardMaterial color="#f2e7c8" roughness={0.44} />
      </mesh>
      <mesh name="target-center" position={[0, 0, 0.08]}>
        <circleGeometry args={[0.105, 28]} />
        <meshStandardMaterial color="#334f58" roughness={0.34} metalness={0.2} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * 0.405, Math.sin(angle) * 0.405, 0.082]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.022, 0.022, 0.018, 10]} />
          <meshStandardMaterial color="#d6b977" metalness={0.7} roughness={0.24} />
        </mesh>
      ))}
    </group>
  )
}

function applyTargetLook(group: Group, kind: TargetKind, small: boolean) {
  const lookId = `${kind}:${small}`
  if (group.userData.renderedLook === lookId) return

  const isGold = kind === 'gold'
  const isRed = kind === 'red'
  const palette = isGold
    ? {
        rim: '#8a5a16',
        face: '#e2b43d',
        outer: '#fff0a8',
        inner: '#b77a16',
        center: '#fff4bd',
        emissive: '#b56b08',
      }
    : isRed
      ? {
          rim: '#58161c',
          face: '#b92d38',
          outer: '#ffe0d2',
          inner: '#6e111b',
          center: '#f4c3b3',
          emissive: '#6f0710',
        }
      : small
        ? {
            rim: '#35424c',
            face: '#91a4b0',
            outer: '#e2ecf0',
            inner: '#536d79',
            center: '#243943',
            emissive: '#000000',
          }
        : {
            rim: '#4a3428',
            face: '#dfd0a8',
            outer: '#a63f32',
            inner: '#f2e7c8',
            center: '#334f58',
            emissive: '#000000',
          }

  group.traverse((child) => {
    if (!child.name.startsWith('target-') || !('material' in child)) return
    const material = (child as { material?: MeshStandardMaterial }).material
    if (!material) return
    const color =
      child.name === 'target-rim'
        ? palette.rim
        : child.name === 'target-face'
          ? palette.face
          : child.name === 'target-outer-ring'
            ? palette.outer
            : child.name === 'target-inner-ring'
              ? palette.inner
              : palette.center
    material.color.set(color)
    material.emissive.set(palette.emissive)
    material.emissiveIntensity = isGold ? 0.42 : isRed ? 0.2 : 0
    material.metalness = isGold ? 0.52 : child.name === 'target-rim' ? 0.35 : 0.08
  })
  group.userData.renderedLook = lookId
}

export function markTargetHit(targetId: number) {
  const target = shootingTargetsRuntime.targets.find((t) => t.id === targetId)
  if (!target || !target.alive) return null
  target.alive = false
  target.visible = false
  target.hitAt = performance.now()
  return target
}
