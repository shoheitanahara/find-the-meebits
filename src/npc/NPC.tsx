import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import { Group, Vector3 } from 'three'
import { FallbackMeebit } from '../avatar/FallbackMeebit'
import { applyVRMLocomotion, getNpcWalkPhaseOffset } from '../avatar/VRMLocomotion'
import { getPlayerWorldPosition } from '../avatar/playerWorldState'
import { useVRMModel } from '../avatar/useVRMModel'
import { useDialogueStore } from '../dialogue/dialogueStore'
import { collidesWithObstacles, NPC_COLLISION_RADIUS } from '../collision/collision'
import { INTERACTION_DISTANCE, VRM_WORLD_SCALE, WORLD_RADIUS } from '../game/gameConfig'
import {
  getNpcFarUpdateDistance,
  getNpcFarUpdateSkipDivisor,
  shouldNpcCastShadow,
} from '../game/perfConfig'
import { setVrmCastShadow } from '../avatar/VRMLoader'
import { isNpcVrmActive, setNpcVrmReady } from './vrmLodState'
import { useGameStore } from '../stores/gameStore'
import { useNpcStore } from '../stores/npcStore'
import type { NPCProfile } from './npcTypes'
import { TargetAnswerGlow } from './TargetAnswerGlow'

const WALK_SPEED = 1.15
const TURN_INTERVAL = 1.6
const CENTER_PULL_START = WORLD_RADIUS * 0.65
const STRONG_CENTER_PULL_START = WORLD_RADIUS * 0.86
const HARD_BOUNDARY_LIMIT = WORLD_RADIUS - 2
const RANDOM_PAUSE_CHANCE = 0.22
const MIN_RANDOM_PAUSE_SECONDS = 1.1
const MAX_RANDOM_PAUSE_SECONDS = 3.3
const PLAYER_STOP_DISTANCE = INTERACTION_DISTANCE + 1
const MIN_PLAYER_PAUSE_SECONDS = 2.2
const MAX_PLAYER_PAUSE_SECONDS = 4.2

type NPCProps = {
  profile: NPCProfile
}

export function NPC({ profile }: NPCProps) {
  const rootRef = useRef<Group>(null)
  const currentPositionRef = useRef(new Vector3(...profile.position))
  const directionRef = useRef(profile.rotation[1])
  const nextTurnAtRef = useRef(0)
  const pauseUntilRef = useRef(0)
  const playerPauseUntilRef = useRef(0)
  const storeUpdateTimerRef = useRef(0)
  const isNearest = useNpcStore((state) => state.nearestNpcId === profile.id)
  const isDialogueActive = useDialogueStore((state) => state.activeNpcId === profile.id)
  const isTarget = useGameStore(
    (state) =>
      state.targetNpcIds.includes(profile.id) && !state.foundTargetNpcIds.includes(profile.id),
  )
  const isAnswerRevealed = useGameStore(
    (state) =>
      state.gamePhase === 'timedOut' &&
      state.targetNpcIds.includes(profile.id) &&
      !state.foundTargetNpcIds.includes(profile.id),
  )
  const npcResetVersion = useGameStore((state) => state.npcResetVersion)
  const [shouldLoadVRM, setShouldLoadVRM] = useState(() => isNpcVrmActive(profile.id))
  const [loadPriority, setLoadPriority] = useState(9999)
  const shouldLoadVRMRef = useRef(shouldLoadVRM)
  const { vrmRef, vrmScene, status, update } = useVRMModel(
    profile.meebitNumber,
    shouldLoadVRM,
    loadPriority,
    true,
    true,
  )
  const walkPhaseOffset = getNpcWalkPhaseOffset(profile.meebitNumber)
  const farUpdatePhaseRef = useRef(profile.meebitNumber % getNpcFarUpdateSkipDivisor())

  useLayoutEffect(() => {
    currentPositionRef.current.set(profile.position[0], profile.position[1], profile.position[2])
    directionRef.current = profile.rotation[1]
    nextTurnAtRef.current = 0
    pauseUntilRef.current = 0
    playerPauseUntilRef.current = 0
    storeUpdateTimerRef.current = 0
    useNpcStore.getState().setNpcPosition(profile.id, [profile.position[0], 0, profile.position[2]])

    if (rootRef.current) {
      rootRef.current.position.set(profile.position[0], profile.position[1], profile.position[2])
    }

    const wantsVrm = isNpcVrmActive(profile.id)
    shouldLoadVRMRef.current = wantsVrm
    if (wantsVrm) {
      const playerPosition = getPlayerWorldPosition()
      const distance = Math.hypot(
        playerPosition[0] - profile.position[0],
        playerPosition[2] - profile.position[2],
      )
      setLoadPriority(distance)
    }
    setShouldLoadVRM(wantsVrm)
  }, [profile.id, profile.meebitNumber, profile.position, profile.rotation, npcResetVersion])

  useEffect(() => {
    if (shouldLoadVRM && status === 'ready') {
      if (vrmScene) {
        setVrmCastShadow(vrmScene, shouldNpcCastShadow())
      }
      setNpcVrmReady(profile.id, true)
      return () => setNpcVrmReady(profile.id, false)
    }

    setNpcVrmReady(profile.id, false)
    return () => setNpcVrmReady(profile.id, false)
  }, [profile.id, shouldLoadVRM, status, vrmScene])

  useFrame((state, delta) => {
    const root = rootRef.current
    if (!root) return

    const gamePhase = useGameStore.getState().gamePhase
    const currentPosition = currentPositionRef.current
    const playerPosition = getPlayerWorldPosition()
    const dx = playerPosition[0] - currentPosition.x
    const dz = playerPosition[2] - currentPosition.z
    const distance = Math.hypot(dx, dz)
    const isPaused = state.clock.elapsedTime < pauseUntilRef.current
    const isStoppedForPlayer = getIsStoppedForPlayer({
      distance,
      elapsedTime: state.clock.elapsedTime,
      isDialogueActive,
      meebitNumber: profile.meebitNumber,
      playerPauseUntilRef,
    })
    const isWalking = gamePhase === 'playing' && !isPaused && !isStoppedForPlayer
    const shouldFacePlayer = isStoppedForPlayer || (gamePhase === 'timedOut' && isTarget)
    const wantsVrm = isNpcVrmActive(profile.id)

    if (wantsVrm !== shouldLoadVRMRef.current) {
      if (wantsVrm) {
        setLoadPriority(distance)
      }
      shouldLoadVRMRef.current = wantsVrm
      setShouldLoadVRM(wantsVrm)
    }

    const isFarNpc = distance > getNpcFarUpdateDistance()
    const farUpdateSkipDivisor = getNpcFarUpdateSkipDivisor()
    const frameBucket = Math.floor(state.clock.elapsedTime * 20)
    const skipDetailedUpdate =
      isFarNpc &&
      frameBucket % farUpdateSkipDivisor !== farUpdatePhaseRef.current &&
      !isAnswerRevealed

    if (skipDetailedUpdate) {
      root.position.set(currentPosition.x, profile.position[1], currentPosition.z)
      if (isTarget) {
        useNpcStore.getState().setNpcPosition(profile.id, [currentPosition.x, 0, currentPosition.z])
      }
      return
    }

    if (isWalking) {
      if (state.clock.elapsedTime >= nextTurnAtRef.current) {
        const actionSeed = seededNoise(profile.meebitNumber * 1.71 + state.clock.elapsedTime * 0.93)
        const turnSeed = seededNoise(profile.meebitNumber * 2.31 + state.clock.elapsedTime * 1.37)

        if (actionSeed > 0.82) {
          directionRef.current += Math.PI + (turnSeed - 0.5) * 0.8
        } else if (actionSeed > 0.66) {
          directionRef.current += (turnSeed > 0.5 ? 1 : -1) * (Math.PI * 0.55 + turnSeed * 0.55)
        } else if (actionSeed < RANDOM_PAUSE_CHANCE) {
          pauseUntilRef.current =
            state.clock.elapsedTime +
            MIN_RANDOM_PAUSE_SECONDS +
            turnSeed * (MAX_RANDOM_PAUSE_SECONDS - MIN_RANDOM_PAUSE_SECONDS)
        } else {
          directionRef.current += (turnSeed - 0.5) * 1.8
        }

        nextTurnAtRef.current = state.clock.elapsedTime + TURN_INTERVAL + turnSeed * 2.2
      }

      steerTowardCenterNearBoundary(currentPosition, directionRef)

      const previousX = currentPosition.x
      const previousZ = currentPosition.z
      currentPosition.x += Math.sin(directionRef.current) * WALK_SPEED * delta
      currentPosition.z += Math.cos(directionRef.current) * WALK_SPEED * delta
      clampToGallerySquare(currentPosition, directionRef)

      if (
        collidesWithObstacles(
          currentPosition.x,
          currentPosition.z,
          NPC_COLLISION_RADIUS,
          useGameStore.getState().venueId,
        )
      ) {
        currentPosition.x = previousX
        currentPosition.z = previousZ
        directionRef.current += Math.PI * 0.55 + seededNoise(profile.meebitNumber + state.clock.elapsedTime) * 0.9
      }
    }

    if (shouldLoadVRMRef.current) {
      applyVRMLocomotion(vrmRef.current, {
        elapsedTime: state.clock.elapsedTime,
        isMoving: isWalking,
        idleOffset: profile.position[0] + profile.position[2],
        walkPhaseOffset,
      })
      update(delta)
    }

    if (shouldFacePlayer) {
      root.rotation.y = Math.atan2(dx, dz)
    } else {
      root.rotation.y = directionRef.current
    }

    const bob = Math.sin(state.clock.elapsedTime * 1.6 + walkPhaseOffset) * 0.03
    root.position.set(currentPosition.x, profile.position[1] + bob, currentPosition.z)

    storeUpdateTimerRef.current += delta
    const positionStoreInterval = isFarNpc ? (farUpdateSkipDivisor >= 5 ? 0.75 : 0.5) : 0.25
    if (isAnswerRevealed || storeUpdateTimerRef.current >= positionStoreInterval) {
      storeUpdateTimerRef.current = 0
      useNpcStore.getState().setNpcPosition(profile.id, [currentPosition.x, 0, currentPosition.z])
    }
  })

  return (
    <group ref={rootRef} rotation={[0, profile.rotation[1], 0]}>
      {vrmScene ? <primitive object={vrmScene} scale={VRM_WORLD_SCALE} /> : <MeebitSilhouette />}
      {status === 'error' ? <FallbackMeebit /> : null}
      {isNearest ? <InteractionPin /> : null}
      {isAnswerRevealed ? <TargetAnswerGlow /> : null}
    </group>
  )
}

function MeebitSilhouette() {
  return (
    <group scale={0.52}>
      <mesh receiveShadow position={[0, 0.28, -0.04]}>
        <boxGeometry args={[0.78, 0.56, 0.5]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[-0.24, 0.95, 0]}>
        <boxGeometry args={[0.28, 1.2, 0.34]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[0.24, 0.95, 0]}>
        <boxGeometry args={[0.28, 1.2, 0.34]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[0, 1.75, 0]}>
        <boxGeometry args={[0.9, 1.25, 0.48]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[-0.58, 1.72, 0]}>
        <boxGeometry args={[0.28, 1.12, 0.28]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[0.58, 1.72, 0]}>
        <boxGeometry args={[0.28, 1.12, 0.28]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[0, 2.55, 0]}>
        <boxGeometry args={[1.08, 0.82, 0.72]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[0, 3.02, -0.03]}>
        <boxGeometry args={[1.2, 0.34, 0.78]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
    </group>
  )
}

function InteractionPin() {
  const pinRef = useRef<Group>(null)

  useFrame((state) => {
    if (!pinRef.current) {
      return
    }

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

function getIsStoppedForPlayer({
  distance,
  elapsedTime,
  isDialogueActive,
  meebitNumber,
  playerPauseUntilRef,
}: {
  distance: number
  elapsedTime: number
  isDialogueActive: boolean
  meebitNumber: number
  playerPauseUntilRef: MutableRefObject<number>
}) {
  if (isDialogueActive) {
    return true
  }

  if (distance > PLAYER_STOP_DISTANCE) {
    playerPauseUntilRef.current = 0
    return false
  }

  if (playerPauseUntilRef.current === 0) {
    const pauseSeed = seededNoise(meebitNumber * 4.17 + elapsedTime * 0.41)
    playerPauseUntilRef.current =
      elapsedTime +
      MIN_PLAYER_PAUSE_SECONDS +
      pauseSeed * (MAX_PLAYER_PAUSE_SECONDS - MIN_PLAYER_PAUSE_SECONDS)
  }

  return elapsedTime < playerPauseUntilRef.current
}

function steerTowardCenterNearBoundary(position: Vector3, directionRef: MutableRefObject<number>) {
  const distanceFromCenter = Math.max(Math.abs(position.x), Math.abs(position.z))

  if (distanceFromCenter < CENTER_PULL_START) {
    return
  }

  const inwardDirection = Math.atan2(-position.x, -position.z)
  const noise = (seededNoise(position.x * 3.17 + position.z * 1.91) - 0.5) * 0.45
  const pullProgress = Math.min(
    1,
    (distanceFromCenter - CENTER_PULL_START) / (HARD_BOUNDARY_LIMIT - CENTER_PULL_START),
  )
  const steerAmount =
    distanceFromCenter > STRONG_CENTER_PULL_START ? 0.22 + pullProgress * 0.12 : 0.06 + pullProgress * 0.08

  directionRef.current = lerpAngle(directionRef.current, inwardDirection + noise, steerAmount)
}

function clampToGallerySquare(position: Vector3, directionRef: MutableRefObject<number>) {
  const limit = WORLD_RADIUS - 2
  const clampedX = Math.max(-limit, Math.min(limit, position.x))
  const clampedZ = Math.max(-limit, Math.min(limit, position.z))
  const wasClamped = clampedX !== position.x || clampedZ !== position.z

  position.x = clampedX
  position.z = clampedZ

  if (wasClamped) {
    directionRef.current = Math.atan2(-position.x, -position.z)
  }
}

function lerpAngle(from: number, to: number, amount: number) {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + delta * amount
}

function seededNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}
