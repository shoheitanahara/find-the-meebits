import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils } from 'three'
import {
  applyVRMFishingPose,
  getNpcWalkPhaseOffset,
  type FishingAction,
} from '../../avatar/VRMLocomotion'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { useVRMModel } from '../../avatar/useVRMModel'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { getDailyParkLineup } from '../../top/dailyFeatured'
import { canStandOnIsland, distToWater, getIslandTiles } from '../islandTiles'
import { SHORE_FISHING } from '../config'
import { FishingRod } from './FishingTackle'

const NPC_RADIUS = 0.38
const ARRIVE_DIST = 1.15
const STUCK_SECONDS = 1.6

const NPC_PATTERNS = [
  { fishSeconds: [3.5, 7] as const },
  { fishSeconds: [4.5, 9] as const },
  { fishSeconds: [3, 6.5] as const },
] as const

/** 島上の初期スポーン候補（プレイヤー開始付近は避ける） */
const SPAWN_CANDIDATES = [
  { x: -4.2, z: 1.2 },
  { x: 4.0, z: -1.5 },
  { x: -2.5, z: -3.8 },
  { x: 3.2, z: 3.5 },
  { x: 0.5, z: -4.5 },
  { x: -5.0, z: -1.0 },
] as const

type ShorePoint = { x: number; z: number; angle: number }

type NpcSpawn = {
  meebitNumber: number
  x: number
  z: number
  rotationY: number
  pattern: 0 | 1 | 2
}

function seededNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

/** 海岸タイル中心をウェイポイント化（対岸移動の目的地） */
function buildShoreWaypoints(): ShorePoint[] {
  const points: ShorePoint[] = []
  for (const tile of getIslandTiles()) {
    if (distToWater(tile.tx, tile.tz) !== 1) continue
    const x = tile.tx + 0.5
    const z = tile.tz + 0.5
    if (!canStandOnIsland(x, z, NPC_RADIUS)) continue
    points.push({ x, z, angle: Math.atan2(x, z) })
  }
  return points
}

let cachedWaypoints: ShorePoint[] | null = null
function shoreWaypoints() {
  if (!cachedWaypoints) cachedWaypoints = buildShoreWaypoints()
  return cachedWaypoints
}

function createSpawns(meebitIds: readonly number[]): NpcSpawn[] {
  const used = new Set<string>()
  const spawns: NpcSpawn[] = []
  const start = SHORE_FISHING.playerStart

  for (let i = 0; i < meebitIds.length; i++) {
    const meebitNumber = meebitIds[i]
    if (meebitNumber === undefined) break

    let placed: { x: number; z: number } | null = null
    for (let attempt = 0; attempt < SPAWN_CANDIDATES.length * 2; attempt++) {
      const cand = SPAWN_CANDIDATES[(i + attempt) % SPAWN_CANDIDATES.length]!
      const jitterX = (seededNoise(meebitNumber * 0.17 + attempt) - 0.5) * 1.2
      const jitterZ = (seededNoise(meebitNumber * 0.31 + attempt * 1.7) - 0.5) * 1.2
      const x = cand.x + jitterX
      const z = cand.z + jitterZ
      const key = `${Math.round(x)},${Math.round(z)}`
      if (used.has(key)) continue
      if (!canStandOnIsland(x, z, NPC_RADIUS)) continue
      if (Math.hypot(x - start.x, z - start.z) < 2.8) continue
      if (spawns.some((s) => Math.hypot(s.x - x, s.z - z) < 2.2)) continue
      placed = { x, z }
      used.add(key)
      break
    }

    const pos = placed ?? { x: (i - 1) * 3.2, z: -2.5 }
    spawns.push({
      meebitNumber,
      x: pos.x,
      z: pos.z,
      rotationY: Math.atan2(pos.x, pos.z),
      pattern: (i % NPC_PATTERNS.length) as 0 | 1 | 2,
    })
  }
  return spawns
}

/** 今いる岸の反対側寄りを優先して次の目的地を選ぶ */
function pickOppositeShoreGoal(
  fromX: number,
  fromZ: number,
  waypoints: ShorePoint[],
  rng: () => number,
): ShorePoint | null {
  if (waypoints.length === 0) return null
  const fromAngle = Math.atan2(fromX, fromZ)
  const minDist = 5.5

  // 角度差が大きい（対岸）かつ距離がある点を集める
  const opposite: ShorePoint[] = []
  const far: ShorePoint[] = []
  for (const p of waypoints) {
    const dist = Math.hypot(p.x - fromX, p.z - fromZ)
    if (dist < minDist) continue
    far.push(p)
    let dAng = Math.abs(p.angle - fromAngle)
    if (dAng > Math.PI) dAng = Math.PI * 2 - dAng
    if (dAng > Math.PI * 0.55) opposite.push(p)
  }

  const pool = opposite.length > 0 ? opposite : far.length > 0 ? far : waypoints
  return pool[Math.floor(rng() * pool.length)] ?? null
}

function ShoreFishingNpc({ spawn, index }: { spawn: NpcSpawn; index: number }) {
  const groupRef = useRef<Group>(null)
  const pattern = NPC_PATTERNS[spawn.pattern]
  const modeRef = useRef<'walk' | 'fish'>(index % 2 === 0 ? 'fish' : 'walk')
  const fishTimerRef = useRef(MathUtils.randFloat(pattern.fishSeconds[0], pattern.fishSeconds[1]))
  const goalRef = useRef<ShorePoint | null>(null)
  const stuckTimerRef = useRef(0)
  const rotationYRef = useRef(spawn.rotationY)
  const targetRotationYRef = useRef(spawn.rotationY)
  const localTimeRef = useRef(index * 0.41)
  const actionRef = useRef<FishingAction>(modeRef.current === 'fish' ? 'wait' : 'carry')
  const walkPhaseOffset = getNpcWalkPhaseOffset(spawn.pattern)
  const groundY = SHORE_FISHING.playerGroundY
  const waypoints = useMemo(() => shoreWaypoints(), [])

  const { vrmRef, vrmScene, update } = useVRMModel(
    spawn.meebitNumber,
    true,
    90 + index,
    true,
    true,
  )

  const beginWalkToOpposite = (x: number, z: number) => {
    const goal = pickOppositeShoreGoal(x, z, waypoints, Math.random)
    goalRef.current = goal
    if (goal) {
      targetRotationYRef.current = Math.atan2(goal.x - x, goal.z - z)
    } else {
      targetRotationYRef.current += MathUtils.randFloatSpread(Math.PI * 0.8)
    }
    modeRef.current = 'walk'
    actionRef.current = 'carry'
    stuckTimerRef.current = 0
  }

  const beginFish = (x: number, z: number) => {
    modeRef.current = 'fish'
    goalRef.current = null
    // 沖（島の外向き）を向く
    targetRotationYRef.current = Math.atan2(x, z)
    actionRef.current = 'wait'
    fishTimerRef.current = MathUtils.randFloat(pattern.fishSeconds[0], pattern.fishSeconds[1])
  }

  useFrame((_, delta) => {
    const dt = Math.min(Math.max(delta, 0), 0.05)
    const group = groupRef.current
    if (!group) return
    localTimeRef.current += dt

    if (modeRef.current === 'fish') {
      fishTimerRef.current -= dt
      if (fishTimerRef.current <= 0) {
        beginWalkToOpposite(group.position.x, group.position.z)
      }
    } else {
      // walk: 目的の対岸へ向かう
      const goal = goalRef.current
      if (!goal) {
        beginWalkToOpposite(group.position.x, group.position.z)
      } else {
        const dist = Math.hypot(goal.x - group.position.x, goal.z - group.position.z)
        targetRotationYRef.current = Math.atan2(
          goal.x - group.position.x,
          goal.z - group.position.z,
        )
        if (dist < ARRIVE_DIST) {
          beginFish(group.position.x, group.position.z)
        }
      }
    }

    const angleDelta = Math.atan2(
      Math.sin(targetRotationYRef.current - rotationYRef.current),
      Math.cos(targetRotationYRef.current - rotationYRef.current),
    )
    rotationYRef.current += angleDelta * (1 - Math.exp(-dt * 3.2))
    group.rotation.y = rotationYRef.current

    const walking = modeRef.current === 'walk'
    if (walking) {
      const speed = SHORE_FISHING.npcWalkSpeed
      const nextX = group.position.x + Math.sin(rotationYRef.current) * speed * dt
      const nextZ = group.position.z + Math.cos(rotationYRef.current) * speed * dt

      if (canStandOnIsland(nextX, nextZ, NPC_RADIUS)) {
        group.position.x = nextX
        group.position.z = nextZ
        actionRef.current = 'carry'
        stuckTimerRef.current = 0
      } else {
        // 角で引っかかったら少し横へ迂回してから再狙う
        stuckTimerRef.current += dt
        const side = index % 2 === 0 ? 1 : -1
        rotationYRef.current += side * MathUtils.randFloat(0.35, 0.7)
        targetRotationYRef.current = rotationYRef.current
        if (stuckTimerRef.current > STUCK_SECONDS) {
          beginWalkToOpposite(group.position.x, group.position.z)
        }
      }
    }

    group.position.y =
      groundY + (walking ? Math.abs(Math.sin(localTimeRef.current * 10.5)) * 0.02 : 0)

    applyVRMFishingPose(vrmRef.current, {
      elapsedTime: localTimeRef.current,
      isMoving: walking,
      isRunning: false,
      idleOffset: index * 0.61,
      walkPhaseOffset,
      action: actionRef.current,
      actionT: 0,
    })
    update(dt)
  })

  return (
    <group
      ref={groupRef}
      position={[spawn.x, groundY, spawn.z]}
      rotation={[0, spawn.rotationY, 0]}
    >
      {vrmScene ? (
        <primitive object={vrmScene} scale={VRM_WORLD_SCALE} />
      ) : (
        <group position={[0, 0.05, 0]}>
          <MeebitSilhouette />
        </group>
      )}
      <FishingRod
        vrmRef={vrmRef}
        rootRef={groupRef}
        alwaysShow
        actionOverrideRef={actionRef}
        actionTOverride={0}
        publishTip={false}
      />
    </group>
  )
}

/**
 * 島を歩く釣り人 NPC。対岸の岸辺へ歩き、そこで釣る仕草を繰り返す。
 */
export function ShoreFishingNpcs() {
  const [meebitIds, setMeebitIds] = useState<number[]>([])

  useEffect(() => {
    let cancelled = false
    void getDailyParkLineup()
      .then((lineup) => {
        if (cancelled) return
        const ids = lineup.seaVisitors
          .slice(0, SHORE_FISHING.npcCount)
          .map((v) => v.meebitNumber)
        setMeebitIds(ids)
      })
      .catch(() => {
        if (!cancelled) setMeebitIds([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const spawns = useMemo(() => createSpawns(meebitIds), [meebitIds])

  if (spawns.length === 0) return null

  return (
    <group>
      {spawns.map((spawn, index) => (
        <ShoreFishingNpc key={spawn.meebitNumber} spawn={spawn} index={index} />
      ))}
    </group>
  )
}
