import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils } from 'three'
import { applyVRMLocomotion, getNpcWalkPhaseOffset } from '../../avatar/VRMLocomotion'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { useVRMModel } from '../../avatar/useVRMModel'
import { useDialogueStore } from '../../dialogue/dialogueStore'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import type { ListedMeebit } from '../../opensea/types'
import { isMarketPositionWalkable } from '../collisions'
import { OPEN_SEA_MARKET } from '../config'
import { marketNpcPositions, openSeaMarketPlayerWorld } from '../playerWorld'
import { useOpenSeaMarketStore } from '../store'

const WALKER_RADIUS = 0.36
const PLAYER_STOP_DISTANCE = OPEN_SEA_MARKET.talkRadius + 0.35
const MIN_PLAYER_PAUSE_SECONDS = 2.2
const MAX_PLAYER_PAUSE_SECONDS = 4.2

const WALKER_PATTERNS = [
  { walkSeconds: [4.5, 8] as const, idleSeconds: [0.8, 1.8] as const, turnSpread: Math.PI * 0.35 },
  { walkSeconds: [3, 6] as const, idleSeconds: [1.5, 3] as const, turnSpread: Math.PI * 0.65 },
  { walkSeconds: [2, 4.5] as const, idleSeconds: [3, 5.5] as const, turnSpread: Math.PI * 0.5 },
] as const

type WalkerSpawn = {
  listing: ListedMeebit
  x: number
  z: number
  rotationY: number
  walkPattern: 0 | 1 | 2
}

function seededNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

/** 近づくと一時停止 → 数秒後にまた歩き出す（パーク / Workshop と同じ） */
function getWalkerStoppedForPlayer({
  distance,
  elapsedTime,
  isDialogueActive,
  pauseSeed,
  playerPauseUntilRef,
}: {
  distance: number
  elapsedTime: number
  isDialogueActive: boolean
  pauseSeed: number
  playerPauseUntilRef: { current: number }
}) {
  if (isDialogueActive) return true

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

function createWalkerSpawns(listings: readonly ListedMeebit[]): WalkerSpawn[] {
  const spawns: WalkerSpawn[] = []
  let attempts = 0
  const maxAttempts = Math.max(40, listings.length * 80)

  while (spawns.length < listings.length && attempts < maxAttempts) {
    attempts += 1
    const x = MathUtils.randFloat(
      -OPEN_SEA_MARKET.walkerSpawnHalfX,
      OPEN_SEA_MARKET.walkerSpawnHalfX,
    )
    const z = MathUtils.randFloat(
      -OPEN_SEA_MARKET.walkerSpawnHalfZ,
      OPEN_SEA_MARKET.walkerSpawnHalfZ,
    )
    if (!isMarketPositionWalkable(x, z, WALKER_RADIUS)) continue
    if (spawns.some((s) => Math.hypot(s.x - x, s.z - z) < 2.0)) continue
    if (Math.hypot(x - OPEN_SEA_MARKET.playerStart.x, z - OPEN_SEA_MARKET.playerStart.z) < 2.4) {
      continue
    }
    const listing = listings[spawns.length]
    if (!listing) break
    spawns.push({
      listing,
      x,
      z,
      rotationY: Math.random() * Math.PI * 2,
      walkPattern: (spawns.length % WALKER_PATTERNS.length) as 0 | 1 | 2,
    })
  }

  while (spawns.length < listings.length) {
    const listing = listings[spawns.length]
    if (!listing) break
    const index = spawns.length
    const angle = (index / Math.max(listings.length, 1)) * Math.PI * 2
    spawns.push({
      listing,
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
  onPosition,
}: {
  spawn: WalkerSpawn
  index: number
  onPosition: (index: number, tokenId: number, x: number, z: number) => void
}) {
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
  const groundY = OPEN_SEA_MARKET.playerGroundY
  const npcId = `opensea-${spawn.listing.tokenId}`
  const { vrmRef, vrmScene, status, update } = useVRMModel(
    spawn.listing.tokenId,
    true,
    120 + index,
    true,
    true,
  )
  const setWalkerVrmReady = useOpenSeaMarketStore((s) => s.setWalkerVrmReady)
  const nearestTalkTokenId = useOpenSeaMarketStore((s) => s.nearestTalkTokenId)
  const isDialogueOpen = useDialogueStore((s) => s.isOpen)
  const isTalkTarget =
    nearestTalkTokenId === spawn.listing.tokenId && !isDialogueOpen

  useEffect(() => {
    if (status === 'error' || (status === 'ready' && vrmScene)) {
      setWalkerVrmReady(index)
    }
    if (vrmScene) {
      vrmScene.traverse((obj) => {
        if ('isMesh' in obj && obj.isMesh) {
          obj.castShadow = true
          obj.receiveShadow = true
        }
      })
    }
  }, [index, setWalkerVrmReady, status, vrmScene])

  useFrame((state, delta) => {
    const safeDelta = Math.min(Math.max(delta, 0), 0.05)
    const group = groupRef.current
    if (!group) return
    localTimeRef.current += safeDelta
    onPosition(index, spawn.listing.tokenId, group.position.x, group.position.z)
    marketNpcPositions.set(spawn.listing.tokenId, {
      x: group.position.x,
      z: group.position.z,
    })

    const dialogue = useDialogueStore.getState()
    const talkingToMe = dialogue.isOpen && dialogue.activeNpcId === npcId
    const playerReady = openSeaMarketPlayerWorld.ready
    const dx = playerReady ? openSeaMarketPlayerWorld.x - group.position.x : 0
    const dz = playerReady ? openSeaMarketPlayerWorld.z - group.position.z : 0
    const distance = Math.hypot(dx, dz)
    const isStoppedForPlayer =
      playerReady &&
      getWalkerStoppedForPlayer({
        distance,
        elapsedTime: state.clock.elapsedTime,
        isDialogueActive: talkingToMe,
        pauseSeed: spawn.listing.tokenId,
        playerPauseUntilRef,
      })

    if (isStoppedForPlayer) {
      if (distance > 0.001) {
        const faceY = Math.atan2(dx, dz)
        rotationYRef.current = faceY
        targetRotationYRef.current = faceY
        group.rotation.y = faceY
      }
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
        targetRotationYRef.current += (Math.random() * 2 - 1) * walkPattern.turnSpread
      }
    }

    const angleDelta = Math.atan2(
      Math.sin(targetRotationYRef.current - rotationYRef.current),
      Math.cos(targetRotationYRef.current - rotationYRef.current),
    )
    rotationYRef.current += angleDelta * (1 - Math.exp(-safeDelta * 3.2))
    group.rotation.y = rotationYRef.current

    const walking = isWalkingRef.current
    if (walking) {
      const step = OPEN_SEA_MARKET.npcWalkSpeed * safeDelta
      const nextX = group.position.x + Math.sin(rotationYRef.current) * step
      const nextZ = group.position.z + Math.cos(rotationYRef.current) * step
      if (isMarketPositionWalkable(nextX, nextZ, WALKER_RADIUS)) {
        group.position.x = nextX
        group.position.z = nextZ
      } else {
        targetRotationYRef.current += Math.PI * (0.55 + Math.random() * 0.5)
        isWalkingRef.current = false
        behaviorTimerRef.current = MathUtils.randFloat(0.4, 1.1)
      }
    }

    group.position.y = groundY + 0.06
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
      position={[spawn.x, groundY + 0.06, spawn.z]}
      rotation={[0, spawn.rotationY, 0]}
    >
      {vrmScene ? (
        <primitive object={vrmScene} scale={VRM_WORLD_SCALE} />
      ) : (
        <MeebitSilhouette />
      )}
      {isTalkTarget ? <MarketInteractionPin /> : null}
    </group>
  )
}

/** パーク / Meet Sergito と同じ赤い近接マーカー */
function MarketInteractionPin() {
  const pinRef = useRef<Group>(null)

  useFrame((state) => {
    if (!pinRef.current) return
    pinRef.current.position.y = 2.35 + Math.sin(state.clock.elapsedTime * 4) * 0.025
  })

  return (
    <group ref={pinRef} position={[0, 2.35, 0]}>
      <mesh>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color="#b91c1c"
          roughness={0.92}
          metalness={0}
          transparent
          opacity={0.82}
        />
      </mesh>
    </group>
  )
}

export function MarketWalkers() {
  const sessionListings = useOpenSeaMarketStore((s) => s.sessionListings)
  const setNearestTalkTokenId = useOpenSeaMarketStore((s) => s.setNearestTalkTokenId)
  const spawns = useMemo(() => createWalkerSpawns(sessionListings), [sessionListings])
  const positionsRef = useRef<Array<{ tokenId: number; x: number; z: number } | undefined>>([])

  useFrame(() => {
    if (!openSeaMarketPlayerWorld.ready || useDialogueStore.getState().isOpen) {
      if (useOpenSeaMarketStore.getState().nearestTalkTokenId != null) {
        setNearestTalkTokenId(null)
      }
      return
    }
    let bestId: number | null = null
    let bestDist: number = OPEN_SEA_MARKET.talkRadius
    for (const p of positionsRef.current) {
      if (!p) continue
      const d = Math.hypot(
        openSeaMarketPlayerWorld.x - p.x,
        openSeaMarketPlayerWorld.z - p.z,
      )
      if (d <= bestDist) {
        bestDist = d
        bestId = p.tokenId
      }
    }
    if (useOpenSeaMarketStore.getState().nearestTalkTokenId !== bestId) {
      setNearestTalkTokenId(bestId)
    }
  })

  return (
    <>
      {spawns.map((spawn, index) => (
        <MarketWalker
          key={spawn.listing.tokenId}
          spawn={spawn}
          index={index}
          onPosition={(i, tokenId, x, z) => {
            positionsRef.current[i] = { tokenId, x, z }
          }}
        />
      ))}
    </>
  )
}
