import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils } from 'three'
import { applyVRMLocomotion, getNpcWalkPhaseOffset } from '../../avatar/VRMLocomotion'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { useVRMModel } from '../../avatar/useVRMModel'
import { INTERACTION_DISTANCE, VRM_WORLD_SCALE } from '../../game/gameConfig'
import { isWorkshopPositionWalkable } from '../collisions'
import { MEET_SERGITO } from '../config'
import { meetSergitoPlayerWorld } from '../playerWorld'
import { getWorkshopWalkerMeebitIds } from './workshopFigureLayout'

const WALKER_WALK_SPEED = 1.15
const WALKER_RADIUS = 0.36
const PLAYER_STOP_DISTANCE = INTERACTION_DISTANCE + 1
const MIN_PLAYER_PAUSE_SECONDS = 2.2
const MAX_PLAYER_PAUSE_SECONDS = 4.2

/** パーク TopNpc と同じ歩行パターン */
const WALKER_PATTERNS = [
  { walkSeconds: [4.5, 8] as const, idleSeconds: [0.8, 1.8] as const, turnSpread: Math.PI * 0.35 },
  { walkSeconds: [3, 6] as const, idleSeconds: [1.5, 3] as const, turnSpread: Math.PI * 0.65 },
  { walkSeconds: [2, 4.5] as const, idleSeconds: [3, 5.5] as const, turnSpread: Math.PI * 0.5 },
] as const

type WalkerSpawn = {
  meebitNumber: number
  x: number
  z: number
  rotationY: number
  walkPattern: 0 | 1 | 2
}

function seededNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

function createWalkerSpawns(meebitIds: readonly number[]): WalkerSpawn[] {
  const spawns: WalkerSpawn[] = []
  let attempts = 0
  const maxAttempts = meebitIds.length * 100

  while (spawns.length < meebitIds.length && attempts < maxAttempts) {
    attempts += 1
    const x = MathUtils.randFloat(-6.5, 6.5)
    const z = MathUtils.randFloat(-4.5, 7.5)

    if (!isWorkshopPositionWalkable(x, z, WALKER_RADIUS)) continue
    if (spawns.some((spawn) => Math.hypot(spawn.x - x, spawn.z - z) < 2.0)) continue
    // Sergito / プレイヤー開始付近は避ける
    if (Math.hypot(x - MEET_SERGITO.sergito.x, z - MEET_SERGITO.sergito.z) < 2.8) continue
    if (Math.hypot(x - MEET_SERGITO.playerStart.x, z - MEET_SERGITO.playerStart.z) < 2.2) continue

    const meebitNumber = meebitIds[spawns.length]
    if (meebitNumber === undefined) break

    spawns.push({
      meebitNumber,
      x,
      z,
      rotationY: Math.random() * Math.PI * 2,
      walkPattern: (spawns.length % WALKER_PATTERNS.length) as 0 | 1 | 2,
    })
  }

  while (spawns.length < meebitIds.length) {
    const meebitNumber = meebitIds[spawns.length]
    if (meebitNumber === undefined) break
    const index = spawns.length
    const angle = (index / meebitIds.length) * Math.PI * 2
    const x = Math.cos(angle) * 3.5
    const z = 1.5 + Math.sin(angle) * 2.5
    spawns.push({
      meebitNumber,
      x,
      z,
      rotationY: angle + Math.PI,
      walkPattern: (index % WALKER_PATTERNS.length) as 0 | 1 | 2,
    })
  }

  return spawns
}

function getWalkerStoppedForPlayer({
  distance,
  elapsedTime,
  pauseSeed,
  playerPauseUntilRef,
}: {
  distance: number
  elapsedTime: number
  pauseSeed: number
  playerPauseUntilRef: { current: number }
}) {
  if (distance > PLAYER_STOP_DISTANCE) {
    playerPauseUntilRef.current = 0
    return false
  }

  if (playerPauseUntilRef.current === 0) {
    const pauseNoise = seededNoise(pauseSeed * 4.17 + elapsedTime * 0.41)
    playerPauseUntilRef.current =
      elapsedTime +
      MIN_PLAYER_PAUSE_SECONDS +
      pauseNoise * (MAX_PLAYER_PAUSE_SECONDS - MIN_PLAYER_PAUSE_SECONDS)
  }

  return elapsedTime < playerPauseUntilRef.current
}

function WorkshopWalker({ spawn, index }: { spawn: WalkerSpawn; index: number }) {
  const groupRef = useRef<Group>(null)
  const walkPattern = WALKER_PATTERNS[spawn.walkPattern]
  const isWalkingRef = useRef((index * 17) % 10 > 3)
  const behaviorTimerRef = useRef(
    isWalkingRef.current
      ? walkPattern.walkSeconds[0] +
          ((index * 0.37) % 1) * (walkPattern.walkSeconds[1] - walkPattern.walkSeconds[0])
      : walkPattern.idleSeconds[0] +
          ((index * 0.53) % 1) * (walkPattern.idleSeconds[1] - walkPattern.idleSeconds[0]),
  )
  const playerPauseUntilRef = useRef(0)
  const rotationYRef = useRef(spawn.rotationY)
  const targetRotationYRef = useRef(spawn.rotationY)
  const localTimeRef = useRef(index * 0.37)
  const walkPhaseOffset = getNpcWalkPhaseOffset(spawn.walkPattern)
  const groundY = MEET_SERGITO.playerGroundY
  const { vrmRef, vrmScene, update } = useVRMModel(spawn.meebitNumber, true, 80 + index, true, true)

  useFrame((state, delta) => {
    const safeDelta = Math.min(Math.max(delta, 0), 0.05)
    const group = groupRef.current
    localTimeRef.current += safeDelta

    const playerReady = meetSergitoPlayerWorld.ready
    const dx = group && playerReady ? meetSergitoPlayerWorld.x - group.position.x : 0
    const dz = group && playerReady ? meetSergitoPlayerWorld.z - group.position.z : 0
    const distance = Math.hypot(dx, dz)
    const isStoppedForPlayer =
      playerReady &&
      getWalkerStoppedForPlayer({
        distance,
        elapsedTime: state.clock.elapsedTime,
        pauseSeed: spawn.meebitNumber,
        playerPauseUntilRef,
      })

    if (isStoppedForPlayer && group) {
      const faceY = Math.atan2(dx, dz)
      rotationYRef.current = faceY
      targetRotationYRef.current = faceY
      group.rotation.y = faceY
      group.position.y = groundY + 0.06
      applyVRMLocomotion(vrmRef.current, {
        elapsedTime: localTimeRef.current,
        isMoving: false,
        isRunning: false,
        idleOffset: index * 0.61,
        walkPhaseOffset,
      })
      update(safeDelta)
      return
    }

    behaviorTimerRef.current -= safeDelta

    if (behaviorTimerRef.current <= 0) {
      isWalkingRef.current = !isWalkingRef.current
      behaviorTimerRef.current = isWalkingRef.current
        ? MathUtils.randFloat(walkPattern.walkSeconds[0], walkPattern.walkSeconds[1])
        : MathUtils.randFloat(walkPattern.idleSeconds[0], walkPattern.idleSeconds[1])

      if (isWalkingRef.current) {
        targetRotationYRef.current += MathUtils.randFloatSpread(walkPattern.turnSpread)
      }
    }

    if (group && isWalkingRef.current) {
      const angleDelta = Math.atan2(
        Math.sin(targetRotationYRef.current - rotationYRef.current),
        Math.cos(targetRotationYRef.current - rotationYRef.current),
      )
      rotationYRef.current += angleDelta * (1 - Math.exp(-safeDelta * 2.4))

      const nextX = group.position.x + Math.sin(rotationYRef.current) * WALKER_WALK_SPEED * safeDelta
      const nextZ = group.position.z + Math.cos(rotationYRef.current) * WALKER_WALK_SPEED * safeDelta

      if (isWorkshopPositionWalkable(nextX, nextZ, WALKER_RADIUS)) {
        group.position.x = nextX
        group.position.z = nextZ
      } else {
        rotationYRef.current += MathUtils.randFloat(Math.PI * 0.55, Math.PI * 1.15)
        targetRotationYRef.current = rotationYRef.current
        behaviorTimerRef.current = Math.min(behaviorTimerRef.current, 0.6)
      }
      group.rotation.y = rotationYRef.current
    }

    if (group) {
      group.position.y =
        groundY + 0.06 + Math.sin(localTimeRef.current * 1.6 + walkPhaseOffset) * 0.03
    }

    applyVRMLocomotion(vrmRef.current, {
      elapsedTime: localTimeRef.current,
      isMoving: isWalkingRef.current,
      isRunning: false,
      idleOffset: index * 0.61,
      walkPhaseOffset,
    })
    update(safeDelta)
  })

  return (
    <group ref={groupRef} position={[spawn.x, groundY, spawn.z]} rotation={[0, spawn.rotationY, 0]}>
      {vrmScene ? (
        <primitive object={vrmScene} scale={VRM_WORLD_SCALE} />
      ) : (
        <group position={[0, 0.05, 0]}>
          <MeebitSilhouette />
        </group>
      )}
    </group>
  )
}

/** 棚に並ぶフィギュアと同じ ID から 4 体が部屋を歩き回る（会話なし） */
export function WorkshopWalkers() {
  const meebitIds = useMemo(() => getWorkshopWalkerMeebitIds(), [])
  const spawns = useMemo(() => createWalkerSpawns(meebitIds), [meebitIds])

  return (
    <group>
      {spawns.map((spawn, index) => (
        <WorkshopWalker key={`walker-${spawn.meebitNumber}`} spawn={spawn} index={index} />
      ))}
    </group>
  )
}
