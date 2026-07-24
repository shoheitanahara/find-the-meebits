/**
 * Mt. Meeb の装飾 Meebit NPC（ステージあたり 5 体）。
 * レーン拘束なし — 歩ける地面の上を自然に徘徊する。
 */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, type Group } from 'three'
import { applyVRMLocomotion, getNpcWalkPhaseOffset } from '../../avatar/VRMLocomotion'
import { useVRMModel } from '../../avatar/useVRMModel'
import { preloadVrm } from '../../avatar/vrmInstancePool'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import {
  getMountainColumns,
  getMountainRuntime,
  pathCenterX,
  type MountainStageDef,
} from '../config'
import { useMountainStore } from '../store'

const NPC_COUNT = 5
const FRACTIONS = [0.14, 0.32, 0.5, 0.68, 0.86] as const
const WALK_SPEED = 1.2
const ROAM_RADIUS = 7.5
const MAX_STEP = 1.05
const WALK_SECONDS: [number, number] = [2.4, 5.2]
const IDLE_SECONDS: [number, number] = [1.4, 3.2]
const TURN_SPREAD = 1.4

type TrailNpcSpawn = {
  meebitNumber: number
  x: number
  y: number
  z: number
  rotationY: number
  speed: number
}

function hashSeed(seed: number, a: number, b = 0) {
  const n = Math.sin(seed * 12.9898 + a * 78.233 + b * 37.719) * 43758.5453
  return n - Math.floor(n)
}

/** 足場の高さ。穴・遠すぎる柱は null */
function surfaceYAt(x: number, z: number): number | null {
  const columns = getMountainColumns()
  const rx = Math.round(x)
  const rz = Math.round(z)
  let best: number | undefined
  let bestDist = Infinity
  for (const col of columns) {
    if (col.h <= 0) continue
    const d = Math.abs(col.x - rx) + Math.abs(col.z - rz)
    if (d < bestDist) {
      bestDist = d
      best = col.h
    }
    if (d === 0) break
  }
  if (best === undefined || bestDist > 1) return null
  return best + 0.02
}

function isWalkable(x: number, z: number, fromY: number): number | null {
  const y = surfaceYAt(x, z)
  if (y === null) return null
  if (Math.abs(y - fromY) > MAX_STEP) return null
  return y
}

function findSpawnOnGround(def: MountainStageDef, slot: number): { x: number; y: number; z: number } {
  const span = def.zStart - def.zEnd
  const t = FRACTIONS[slot] ?? (slot + 0.5) / NPC_COUNT
  const zHome = Math.round(def.zStart - t * span)
  const cx = pathCenterX(zHome)

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const ox = (hashSeed(def.seed, slot, 10 + attempt) - 0.5) * 6
    const oz = (hashSeed(def.seed, slot, 40 + attempt) - 0.5) * 4
    const x = cx + ox
    const z = zHome + oz
    const y = surfaceYAt(x, z)
    if (y !== null) return { x, y, z }
  }

  const x = cx
  const z = zHome
  return { x, y: surfaceYAt(x, z) ?? def.startElev + 0.02, z }
}

function buildStageNpcSpawns(def: MountainStageDef): TrailNpcSpawn[] {
  const spawns: TrailNpcSpawn[] = []
  const usedIds = new Set<number>()

  for (let slot = 0; slot < NPC_COUNT; slot += 1) {
    const pos = findSpawnOnGround(def, slot)
    let meebitNumber = 1 + Math.floor(hashSeed(def.seed, slot, 99) * 20000)
    let guard = 0
    while (usedIds.has(meebitNumber) && guard < 8) {
      meebitNumber = 1 + Math.floor(hashSeed(def.seed, slot, 100 + guard) * 20000)
      guard += 1
    }
    usedIds.add(meebitNumber)

    spawns.push({
      meebitNumber,
      x: pos.x,
      y: pos.y,
      z: pos.z,
      rotationY: hashSeed(def.seed, slot, 7) * Math.PI * 2,
      speed: WALK_SPEED * (0.85 + hashSeed(def.seed, slot, 8) * 0.4),
    })
  }

  return spawns
}

export function MountainTrailNpcs() {
  const terrainVersion = useMountainStore((state) => state.terrainVersion)
  const phase = useMountainStore((state) => state.phase)
  const runtime = getMountainRuntime()
  const spawns = useMemo(
    () => buildStageNpcSpawns(runtime.def),
    [terrainVersion, runtime.def],
  )

  useEffect(() => {
    spawns.forEach((spawn, index) => preloadVrm(spawn.meebitNumber, 90 + index))
  }, [spawns])

  if (phase === 'title') return null

  return (
    <group key={terrainVersion}>
      {spawns.map((spawn, index) => (
        <MountainTrailNpc key={`${spawn.meebitNumber}-${index}`} spawn={spawn} index={index} />
      ))}
    </group>
  )
}

function MountainTrailNpc({ spawn, index }: { spawn: TrailNpcSpawn; index: number }) {
  const groupRef = useRef<Group>(null)
  const homeRef = useRef({ x: spawn.x, z: spawn.z })
  const localTimeRef = useRef(index * 0.41)
  const isWalkingRef = useRef((index * 17) % 10 > 2)
  const behaviorTimerRef = useRef(
    isWalkingRef.current
      ? MathUtils.lerp(WALK_SECONDS[0], WALK_SECONDS[1], (index * 0.37) % 1)
      : MathUtils.lerp(IDLE_SECONDS[0], IDLE_SECONDS[1], (index * 0.53) % 1),
  )
  const rotationYRef = useRef(spawn.rotationY)
  const targetRotationYRef = useRef(spawn.rotationY)
  const phaseOffset = useMemo(
    () => getNpcWalkPhaseOffset(spawn.meebitNumber + index * 17),
    [spawn.meebitNumber, index],
  )
  const { vrmRef, vrmScene, update } = useVRMModel(spawn.meebitNumber, true, 100 + index, true, true)

  useFrame((_, delta) => {
    const safeDelta = Math.min(Math.max(delta, 0), 0.05)
    localTimeRef.current += safeDelta
    behaviorTimerRef.current -= safeDelta
    const group = groupRef.current
    if (!group) {
      update(safeDelta)
      return
    }

    if (behaviorTimerRef.current <= 0) {
      isWalkingRef.current = !isWalkingRef.current
      behaviorTimerRef.current = isWalkingRef.current
        ? MathUtils.randFloat(WALK_SECONDS[0], WALK_SECONDS[1])
        : MathUtils.randFloat(IDLE_SECONDS[0], IDLE_SECONDS[1])
      if (isWalkingRef.current) {
        targetRotationYRef.current += MathUtils.randFloatSpread(TURN_SPREAD)
      }
    }

    if (isWalkingRef.current) {
      const angleDelta = Math.atan2(
        Math.sin(targetRotationYRef.current - rotationYRef.current),
        Math.cos(targetRotationYRef.current - rotationYRef.current),
      )
      rotationYRef.current += angleDelta * (1 - Math.exp(-safeDelta * 2.6))

      const nextX = group.position.x + Math.sin(rotationYRef.current) * spawn.speed * safeDelta
      const nextZ = group.position.z + Math.cos(rotationYRef.current) * spawn.speed * safeDelta
      const distHome = Math.hypot(nextX - homeRef.current.x, nextZ - homeRef.current.z)
      const nextY = isWalkable(nextX, nextZ, group.position.y)

      if (nextY !== null && distHome <= ROAM_RADIUS) {
        group.position.x = nextX
        group.position.z = nextZ
        group.position.y = MathUtils.lerp(group.position.y, nextY, 1 - Math.exp(-safeDelta * 12))
      } else {
        // 穴・急段差・徘徊範囲外 → 適当に向きを変える
        const turn = MathUtils.randFloat(Math.PI * 0.45, Math.PI * 1.2) * (Math.random() < 0.5 ? 1 : -1)
        rotationYRef.current += turn
        targetRotationYRef.current = rotationYRef.current
        behaviorTimerRef.current = Math.min(behaviorTimerRef.current, 0.55)
      }
      group.rotation.y = rotationYRef.current
    }

    applyVRMLocomotion(vrmRef.current, {
      elapsedTime: localTimeRef.current,
      isMoving: isWalkingRef.current,
      idleOffset: 0.2 + index * 0.35,
      walkPhaseOffset: phaseOffset,
    })
    update(safeDelta)
  })

  return (
    <group ref={groupRef} position={[spawn.x, spawn.y, spawn.z]} rotation={[0, spawn.rotationY, 0]}>
      {vrmScene ? <primitive object={vrmScene} scale={VRM_WORLD_SCALE} /> : null}
    </group>
  )
}
