import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { applyVRMLocomotion, getNpcWalkPhaseOffset } from '../../avatar/VRMLocomotion'
import { useVRMModel } from '../../avatar/useVRMModel'
import { preloadVrm } from '../../avatar/vrmInstancePool'
import type { WalkerSpawn } from '../logic/generateRound'
import { getLPathPose } from '../logic/walkerPath'
import { useEightStreetStore } from '../store'

/**
 * Crowd of walkers. Keyed by slotIndex so formation members stay mounted;
 * anomaly swaps only remount the changed Meebit ID via useVRMModel.
 */
export function MeebitWalkerCrowd() {
  const round = useEightStreetStore((state) => state.currentRound)
  const roundKey = useEightStreetStore((state) => state.roundKey)
  const phase = useEightStreetStore((state) => state.phase)

  const walkers = round?.walkers ?? []

  useEffect(() => {
    for (const walker of walkers) {
      preloadVrm(walker.meebitNumber, -50)
    }
  }, [walkers, roundKey])

  if (phase === 'title' || phase === 'cleared' || walkers.length === 0) {
    return null
  }

  return (
    <group>
      {walkers.map((walker) => (
        <MeebitWalker
          key={`slot-${walker.slotIndex}`}
          spawn={walker}
          roundKey={roundKey}
        />
      ))}
    </group>
  )
}

function MeebitWalker({ spawn, roundKey }: { spawn: WalkerSpawn; roundKey: number }) {
  const groupRef = useRef<Group>(null)
  const progressRef = useRef(spawn.initialProgress)
  const localTimeRef = useRef(0)
  const phaseOffset = useMemo(
    () => getNpcWalkPhaseOffset(spawn.meebitNumber + spawn.slotIndex),
    [spawn.meebitNumber, spawn.slotIndex],
  )
  const { vrmRef, vrmScene, update } = useVRMModel(
    spawn.meebitNumber,
    true,
    80,
    true,
    // Exclusive: pooled clones share a template VRM whose bones are not the
    // visible skeleton, so locomotion would never reach the on-screen mesh.
    true,
  )

  const startPose = getLPathPose(spawn.initialProgress, spawn.lane)

  useEffect(() => {
    progressRef.current = spawn.initialProgress
    const pose = getLPathPose(spawn.initialProgress, spawn.lane)
    if (groupRef.current) {
      groupRef.current.visible = true
      groupRef.current.position.set(pose.x, 0, pose.z)
      groupRef.current.rotation.y = pose.yaw
    }
  }, [roundKey, spawn.initialProgress, spawn.lane])

  useFrame((_, delta) => {
    const safeDelta = Math.min(Math.max(delta, 0), 0.05)
    localTimeRef.current += safeDelta
    progressRef.current += spawn.speed * safeDelta

    const pose = getLPathPose(progressRef.current, spawn.lane)
    const group = groupRef.current
    if (!group) return

    if (pose.despawned) {
      group.visible = false
    } else {
      group.visible = true
      group.position.set(pose.x, 0, pose.z)
      group.rotation.y = pose.yaw
    }

    if (vrmRef.current) {
      applyVRMLocomotion(vrmRef.current, {
        elapsedTime: localTimeRef.current,
        isMoving: !pose.despawned,
        idleOffset: spawn.slotIndex * 0.7,
        walkPhaseOffset: phaseOffset,
      })
    }
    update(safeDelta)
  })

  return (
    <group ref={groupRef} position={[startPose.x, 0, startPose.z]} rotation={[0, startPose.yaw, 0]}>
      {vrmScene ? (
        <primitive object={vrmScene} />
      ) : (
        <mesh position={[0, 0.9, 0]}>
          <capsuleGeometry args={[0.28, 1.1, 4, 8]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      )}
    </group>
  )
}
