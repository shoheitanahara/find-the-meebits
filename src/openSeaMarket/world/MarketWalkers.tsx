import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils } from 'three'
import { applyVRMLocomotion, getNpcWalkPhaseOffset } from '../../avatar/VRMLocomotion'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { useVRMModel } from '../../avatar/useVRMModel'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { isMarketWalkerPositionWalkable } from '../collisions'
import { OPEN_SEA_MARKET } from '../config'
import { marketNpcPositions, openSeaMarketPlayerWorld } from '../playerWorld'
import { useOpenSeaMarketStore } from '../store'
import { useDialogueStore } from '../../dialogue/dialogueStore'

const WALKER_RADIUS = 0.36
const PLAYER_STOP_DISTANCE = 2.7
const MIN_PLAYER_PAUSE_SECONDS = 2.2
const MAX_PLAYER_PAUSE_SECONDS = 4.2

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

function createWalkerSpawns(meebitIds: readonly number[]): WalkerSpawn[] {
  const spawns: WalkerSpawn[] = []
  let attempts = 0
  const maxAttempts = Math.max(40, meebitIds.length * 80)

  while (spawns.length < meebitIds.length && attempts < maxAttempts) {
    attempts += 1
    const x = MathUtils.randFloat(
      -OPEN_SEA_MARKET.walkerSpawnHalfX,
      OPEN_SEA_MARKET.walkerSpawnHalfX,
    )
    const z = MathUtils.randFloat(
      -OPEN_SEA_MARKET.walkerSpawnHalfZ,
      OPEN_SEA_MARKET.walkerSpawnHalfZ,
    )
    if (!isMarketWalkerPositionWalkable(x, z, WALKER_RADIUS)) continue
    if (spawns.some((s) => Math.hypot(s.x - x, s.z - z) < 2.0)) continue
    const meebitId = meebitIds[spawns.length]
    if (meebitId == null) break
    spawns.push({
      meebitId,
      x,
      z,
      rotationY: Math.random() * Math.PI * 2,
      walkPattern: (spawns.length % WALKER_PATTERNS.length) as 0 | 1 | 2,
    })
  }

  while (spawns.length < meebitIds.length) {
    const meebitId = meebitIds[spawns.length]
    if (meebitId == null) break
    const index = spawns.length
    const angle = (index / Math.max(meebitIds.length, 1)) * Math.PI * 2
    spawns.push({
      meebitId,
      x: Math.cos(angle) * (OPEN_SEA_MARKET.walkerSpawnHalfX * 0.45),
      z: Math.sin(angle) * (OPEN_SEA_MARKET.walkerSpawnHalfZ * 0.45),
      rotationY: angle + Math.PI,
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
        // 会話中は一時停止タイマーを延長し、閉じた直後に歩き出さない
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
        targetRotationYRef.current += (Math.random() * 2 - 1) * walkPattern.turnSpread
      }
    }

    const walking = isWalkingRef.current
    if (walking) {
      const angleDelta = Math.atan2(
        Math.sin(targetRotationYRef.current - rotationYRef.current),
        Math.cos(targetRotationYRef.current - rotationYRef.current),
      )
      rotationYRef.current += angleDelta * (1 - Math.exp(-safeDelta * 2.4))
      group.rotation.y = rotationYRef.current
      const step = OPEN_SEA_MARKET.npcWalkSpeed * safeDelta
      const nextX = group.position.x + Math.sin(rotationYRef.current) * step
      const nextZ = group.position.z + Math.cos(rotationYRef.current) * step
      if (isMarketWalkerPositionWalkable(nextX, nextZ, WALKER_RADIUS)) {
        group.position.x = nextX
        group.position.z = nextZ
      } else {
        targetRotationYRef.current += Math.PI * (0.55 + Math.random() * 0.5)
        isWalkingRef.current = false
        behaviorTimerRef.current = MathUtils.randFloat(0.4, 1.1)
      }
    }

    group.position.y = groundY
    applyVRMLocomotion(vrmRef.current, {
      elapsedTime: localTimeRef.current,
      isMoving: walking,
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
