import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, type Group } from 'three'
import { applyVRMLocomotion, getNpcWalkPhaseOffset } from '../../avatar/VRMLocomotion'
import { useVRMModel } from '../../avatar/useVRMModel'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { isClubPositionWalkable } from '../collisions'
import { createClubNpcSpawns, type ClubNpcSpawn } from '../clubDancers'
import { CLUB } from '../config'
import { useClubStore } from '../store'
import { OCCLUDER_USER_DATA } from '../../world/CameraOcclusionFader'

const NPC_WALK_SPEED = 1.05

const WALK_PATTERNS = [
  { walkSeconds: [4.5, 8], idleSeconds: [0.8, 1.8], turnSpread: Math.PI * 0.35 },
  { walkSeconds: [3, 6], idleSeconds: [1.5, 3], turnSpread: Math.PI * 0.65 },
  { walkSeconds: [2, 4.5], idleSeconds: [3, 5.5], turnSpread: Math.PI * 0.5 },
] as const

/** パーク群衆と同じく、散らばったスポーンから自然に歩く */
export function ClubAudience() {
  const audienceIds = useClubStore((state) => state.audienceIds)
  const phase = useClubStore((state) => state.phase)

  // ID は日次固定。位置・向きは入場ごとにランダム（パークと同じ）
  const spawns = useMemo(() => createClubNpcSpawns(audienceIds), [audienceIds])

  if (phase !== 'playing') return null

  return (
    <group>
      {spawns.map((spawn, index) => (
        <FloorWalker
          key={`npc-${spawn.meebitNumber}-${index}`}
          spawn={spawn}
          index={index}
        />
      ))}
    </group>
  )
}

function FloorWalker({ spawn, index }: { spawn: ClubNpcSpawn; index: number }) {
  const groupRef = useRef<Group>(null)
  const walkPattern = WALK_PATTERNS[spawn.walkPattern]
  const isWalkingRef = useRef((index * 17) % 10 > 3)
  const behaviorTimerRef = useRef(
    isWalkingRef.current
      ? walkPattern.walkSeconds[0] +
          ((index * 0.37) % 1) * (walkPattern.walkSeconds[1] - walkPattern.walkSeconds[0])
      : walkPattern.idleSeconds[0] +
          ((index * 0.53) % 1) * (walkPattern.idleSeconds[1] - walkPattern.idleSeconds[0]),
  )
  const rotationYRef = useRef(spawn.rotationY)
  const targetRotationYRef = useRef(spawn.rotationY)
  const localTimeRef = useRef(index * 0.37)
  const walkPhaseOffset = getNpcWalkPhaseOffset(spawn.walkPattern)
  const { vrmRef, vrmScene, update } = useVRMModel(spawn.meebitNumber, true, 120 + index, true, true)

  useFrame((_, delta) => {
    const safeDelta = Math.min(Math.max(delta, 0), 0.05)
    const group = groupRef.current
    localTimeRef.current += safeDelta

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

      const nextX = group.position.x + Math.sin(rotationYRef.current) * NPC_WALK_SPEED * safeDelta
      const nextZ = group.position.z + Math.cos(rotationYRef.current) * NPC_WALK_SPEED * safeDelta

      if (isClubPositionWalkable(nextX, nextZ)) {
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
        CLUB.playerGroundY + 0.06 + Math.sin(localTimeRef.current * 1.6 + walkPhaseOffset) * 0.03
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
    <group
      userData={OCCLUDER_USER_DATA}
      ref={groupRef}
      position={[spawn.x, CLUB.playerGroundY + 0.06, spawn.z]}
      rotation={[0, spawn.rotationY, 0]}
    >
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
