import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils } from 'three'
import { applyVRMLocomotion, getNpcWalkPhaseOffset } from '../../avatar/VRMLocomotion'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { useVRMModel } from '../../avatar/useVRMModel'
import { useDialogueStore } from '../../dialogue/dialogueStore'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import {
  findMarketWalkerClearYaw,
  isMarketWalkerPositionWalkable,
  pickMarketWalkerClearPoint,
  resolveMarketWalkerStep,
} from '../collisions'
import { OPEN_SEA_MARKET } from '../config'
import { marketNpcPositions, openSeaMarketPlayerWorld } from '../playerWorld'
import { useOpenSeaMarketStore } from '../store'

const WALKER_RADIUS = 0.4
const PLAYER_STOP_DISTANCE = 2.7
const MIN_PLAYER_PAUSE_SECONDS = 2.2
const MAX_PLAYER_PAUSE_SECONDS = 4.2
const LOOK_AHEAD = 1.35
/** 通路方向（±Z / ±X）を優先して曲がる */
const AISLE_YAWS = [0, Math.PI, Math.PI / 2, -Math.PI / 2] as const

const WALKER_PATTERNS = [
  { walkSeconds: [4.5, 8] as const, idleSeconds: [0.8, 1.8] as const, turnSpread: Math.PI * 0.35 },
  { walkSeconds: [3, 6] as const, idleSeconds: [1.5, 3] as const, turnSpread: Math.PI * 0.65 },
  { walkSeconds: [2, 4.5] as const, idleSeconds: [3, 5.5] as const, turnSpread: Math.PI * 0.5 },
] as const

type WalkerSpawn = {
  meebitId: number
  x: number
  z: number
  rotationY: number
  walkPattern: 0 | 1 | 2
}

function getWalkerStoppedForPlayer(options: {
  distance: number
  nowSec: number
  pauseUntilRef: { current: number }
  pauseSeed: number
}) {
  const { distance, nowSec, pauseUntilRef, pauseSeed } = options
  if (distance > PLAYER_STOP_DISTANCE) {
    pauseUntilRef.current = 0
    return false
  }
  if (pauseUntilRef.current <= 0) {
    const pauseNoise = ((Math.imul(pauseSeed, 2654435761) >>> 0) % 1000) / 1000
    pauseUntilRef.current =
      nowSec +
      MIN_PLAYER_PAUSE_SECONDS +
      pauseNoise * (MAX_PLAYER_PAUSE_SECONDS - MIN_PLAYER_PAUSE_SECONDS)
  }
  return nowSec < pauseUntilRef.current
}

function pickAisleBiasedYaw(currentYaw: number, turnSpread: number) {
  if (Math.random() < 0.55) {
    const base = AISLE_YAWS[Math.floor(Math.random() * AISLE_YAWS.length)]!
    return base + MathUtils.randFloatSpread(0.28)
  }
  return currentYaw + MathUtils.randFloatSpread(turnSpread)
}

function createWalkerSpawns(meebitIds: readonly number[]): WalkerSpawn[] {
  const spawns: WalkerSpawn[] = []
  let attempts = 0
  const maxAttempts = Math.max(80, meebitIds.length * 120)

  while (spawns.length < meebitIds.length && attempts < maxAttempts) {
    attempts += 1
    const point = pickMarketWalkerClearPoint(
      (attempts * 2654435761) ^ (meebitIds[spawns.length] ?? 1) * 97,
      WALKER_RADIUS,
    )
    if (!point) continue
    if (spawns.some((s) => Math.hypot(s.x - point.x, s.z - point.z) < 2.4)) continue
    const meebitId = meebitIds[spawns.length]
    if (meebitId == null) break
    const yaw = AISLE_YAWS[spawns.length % AISLE_YAWS.length]!
    spawns.push({
      meebitId,
      x: point.x,
      z: point.z,
      rotationY: yaw + MathUtils.randFloatSpread(0.2),
      walkPattern: (spawns.length % WALKER_PATTERNS.length) as 0 | 1 | 2,
    })
  }

  while (spawns.length < meebitIds.length) {
    const meebitId = meebitIds[spawns.length]
    if (meebitId == null) break
    const index = spawns.length
    const point =
      pickMarketWalkerClearPoint(0x0ea11d ^ meebitId * 13, WALKER_RADIUS) ?? {
        x: 0,
        z: (index - meebitIds.length / 2) * 2.2,
      }
    spawns.push({
      meebitId,
      x: point.x,
      z: point.z,
      rotationY: AISLE_YAWS[index % AISLE_YAWS.length]!,
      walkPattern: (index % WALKER_PATTERNS.length) as 0 | 1 | 2,
    })
  }
  return spawns
}

function MarketWalker({
  spawn,
  index,
}: {
  spawn: WalkerSpawn
  index: number
}) {
  const groupRef = useRef<Group>(null)
  const localTimeRef = useRef(index * 0.37)
  const isWalkingRef = useRef(true)
  const behaviorTimerRef = useRef(MathUtils.randFloat(2, 5))
  const rotationYRef = useRef(spawn.rotationY)
  const targetRotationYRef = useRef(spawn.rotationY)
  const playerPauseUntilRef = useRef(0)
  const blockedFramesRef = useRef(0)
  const walkPattern = WALKER_PATTERNS[spawn.walkPattern]
  const walkPhaseOffset = getNpcWalkPhaseOffset(spawn.walkPattern)
  const setWalkerVrmReady = useOpenSeaMarketStore((s) => s.setWalkerVrmReady)
  const { vrmRef, vrmScene, status, update } = useVRMModel(
    spawn.meebitId,
    true,
    120 + index,
    true,
    true,
  )

  useEffect(() => {
    if (status === 'error' || (status === 'ready' && vrmScene)) {
      setWalkerVrmReady(index)
    }
    if (vrmScene) {
      vrmScene.traverse((obj) => {
        if ('isMesh' in obj && obj.isMesh) {
          obj.castShadow = true
          obj.receiveShadow = false
        }
      })
    }
  }, [index, setWalkerVrmReady, status, vrmScene])

  useEffect(() => {
    marketNpcPositions.set(spawn.meebitId, { x: spawn.x, z: spawn.z })
    return () => {
      marketNpcPositions.delete(spawn.meebitId)
    }
  }, [spawn.meebitId, spawn.x, spawn.z])

  const nearestTalkTokenId = useOpenSeaMarketStore((s) => s.nearestTalkTokenId)
  const nearestTalkKind = useOpenSeaMarketStore((s) => s.nearestTalkKind)
  const isDialogueOpen = useDialogueStore((s) => s.isOpen)
  const showPin =
    nearestTalkTokenId === spawn.meebitId &&
    nearestTalkKind === 'guide' &&
    !isDialogueOpen

  useFrame((_, delta) => {
    const safeDelta = Math.min(Math.max(delta, 0), 0.05)
    const group = groupRef.current
    if (!group) return
    localTimeRef.current += safeDelta
    const groundY = OPEN_SEA_MARKET.playerGroundY

    // 万一台座内に埋まっていたら通路へ逃がす
    if (!isMarketWalkerPositionWalkable(group.position.x, group.position.z, WALKER_RADIUS)) {
      const clear = pickMarketWalkerClearPoint(
        spawn.meebitId ^ Math.floor(localTimeRef.current * 10),
        WALKER_RADIUS,
      )
      if (clear) {
        group.position.x = clear.x
        group.position.z = clear.z
        blockedFramesRef.current = 0
      }
    }

    marketNpcPositions.set(spawn.meebitId, {
      x: group.position.x,
      z: group.position.z,
    })

    const dialogue = useDialogueStore.getState()
    const isTalkingWithThis =
      dialogue.isOpen && dialogue.activeNpcId === `opensea-${spawn.meebitId}`

    const dx = openSeaMarketPlayerWorld.x - group.position.x
    const dz = openSeaMarketPlayerWorld.z - group.position.z
    const distance = Math.hypot(dx, dz)
    const isStoppedForPlayer =
      isTalkingWithThis ||
      getWalkerStoppedForPlayer({
        distance,
        nowSec: localTimeRef.current,
        pauseUntilRef: playerPauseUntilRef,
        pauseSeed: spawn.meebitId,
      })

    if (isStoppedForPlayer) {
      if (isTalkingWithThis) {
        playerPauseUntilRef.current = localTimeRef.current + 1.5
      }
      if (distance > 0.001) {
        const faceY = Math.atan2(dx, dz)
        rotationYRef.current = faceY
        targetRotationYRef.current = faceY
        group.rotation.y = faceY
      }
      group.position.y = groundY
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
        targetRotationYRef.current = pickAisleBiasedYaw(
          rotationYRef.current,
          walkPattern.turnSpread,
        )
      }
    }

    const walking = isWalkingRef.current
    if (walking) {
      // 少し先が塞がっていれば早めに曲げる
      const aheadX = group.position.x + Math.sin(targetRotationYRef.current) * LOOK_AHEAD
      const aheadZ = group.position.z + Math.cos(targetRotationYRef.current) * LOOK_AHEAD
      if (!isMarketWalkerPositionWalkable(aheadX, aheadZ, WALKER_RADIUS)) {
        const clearYaw = findMarketWalkerClearYaw(
          group.position.x,
          group.position.z,
          targetRotationYRef.current,
          LOOK_AHEAD,
          WALKER_RADIUS,
        )
        if (clearYaw != null) targetRotationYRef.current = clearYaw
      }

      const angleDelta = Math.atan2(
        Math.sin(targetRotationYRef.current - rotationYRef.current),
        Math.cos(targetRotationYRef.current - rotationYRef.current),
      )
      rotationYRef.current += angleDelta * (1 - Math.exp(-safeDelta * 3.2))
      group.rotation.y = rotationYRef.current

      const step = OPEN_SEA_MARKET.npcWalkSpeed * safeDelta
      const moved = resolveMarketWalkerStep(
        group.position.x,
        group.position.z,
        rotationYRef.current,
        step,
        WALKER_RADIUS,
      )
      group.position.x = moved.x
      group.position.z = moved.z

      if (moved.blocked) {
        blockedFramesRef.current += 1
        const clearYaw = findMarketWalkerClearYaw(
          group.position.x,
          group.position.z,
          rotationYRef.current + Math.PI * 0.5,
          LOOK_AHEAD,
          WALKER_RADIUS,
        )
        if (clearYaw != null) {
          targetRotationYRef.current = clearYaw
          rotationYRef.current += Math.atan2(
            Math.sin(clearYaw - rotationYRef.current),
            Math.cos(clearYaw - rotationYRef.current),
          ) * 0.45
        } else if (blockedFramesRef.current > 45) {
          const escape = pickMarketWalkerClearPoint(
            spawn.meebitId ^ Math.floor(localTimeRef.current),
            WALKER_RADIUS,
          )
          if (escape) {
            group.position.x = escape.x
            group.position.z = escape.z
            targetRotationYRef.current = pickAisleBiasedYaw(0, 0.2)
            rotationYRef.current = targetRotationYRef.current
          }
          blockedFramesRef.current = 0
        }
      } else {
        blockedFramesRef.current = 0
      }
    }

    group.position.y = groundY
    applyVRMLocomotion(vrmRef.current, {
      elapsedTime: localTimeRef.current,
      isMoving: walking && blockedFramesRef.current < 8,
      isRunning: false,
      idleOffset: index * 0.61,
      walkPhaseOffset,
    })
    update(safeDelta)
  })

  return (
    <group
      ref={groupRef}
      position={[spawn.x, OPEN_SEA_MARKET.playerGroundY, spawn.z]}
      rotation={[0, spawn.rotationY, 0]}
    >
      {vrmScene ? (
        <primitive object={vrmScene} scale={VRM_WORLD_SCALE} />
      ) : (
        <MeebitSilhouette />
      )}
      {showPin ? (
        <mesh position={[0, 2.35, 0]}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial
            color="#dc2626"
            emissive="#b91c1c"
            emissiveIntensity={0.85}
            toneMapped={false}
          />
        </mesh>
      ) : null}
    </group>
  )
}

export function MarketWalkers() {
  const walkerIds = useOpenSeaMarketStore((s) => s.sessionWalkerIds)
  const spawns = useMemo(() => createWalkerSpawns(walkerIds), [walkerIds])

  return (
    <group>
      {spawns.map((spawn, index) => (
        <MarketWalker key={spawn.meebitId} spawn={spawn} index={index} />
      ))}
    </group>
  )
}
