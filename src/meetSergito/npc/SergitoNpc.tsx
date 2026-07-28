import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { applyVRMLocomotion } from '../../avatar/VRMLocomotion'
import { useVRMModel } from '../../avatar/useVRMModel'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { useDialogueStore } from '../../dialogue/dialogueStore'
import { MEET_SERGITO, SERGITO_MEEBIT_ID } from '../config'
import { meetSergitoPlayerWorld } from '../playerWorld'
import { useMeetSergitoStore } from '../store'

export function SergitoNpc() {
  const groupRef = useRef<Group>(null)
  const rotationRef = useRef<number>(MEET_SERGITO.sergito.rotationY)
  const localTimeRef = useRef(0)
  const { vrmRef, vrmScene, update } = useVRMModel(SERGITO_MEEBIT_ID, true, 0, true, true)
  const canTalkToSergito = useMeetSergitoStore((state) => state.canTalkToSergito)
  const setCanTalkToSergito = useMeetSergitoStore((state) => state.setCanTalkToSergito)
  const isDialogueOpen = useDialogueStore((state) => state.isOpen)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    localTimeRef.current += dt

    const { x: px, z: pz, ready } = meetSergitoPlayerWorld
    const { x: sx, z: sz } = MEET_SERGITO.sergito
    const sergitoTalkRadius = MEET_SERGITO.sergitoTalkRadius
    const dx = px - sx
    const dz = pz - sz
    const dist = Math.hypot(dx, dz)

    if (ready) {
      setCanTalkToSergito(dist <= sergitoTalkRadius)
    }

    const group = groupRef.current
    if (group) {
      if (ready && (dist <= sergitoTalkRadius || isDialogueOpen)) {
        rotationRef.current = Math.atan2(dx, dz)
      } else {
        rotationRef.current = MEET_SERGITO.sergito.rotationY + Math.sin(localTimeRef.current * 0.35) * 0.08
      }
      group.rotation.y = rotationRef.current
    }

    applyVRMLocomotion(vrmRef.current, {
      elapsedTime: localTimeRef.current,
      isMoving: false,
      isRunning: false,
      idleOffset: SERGITO_MEEBIT_ID * 0.01,
      walkPhaseOffset: 0.4,
    })
    update(dt)
  })

  const { x, z } = MEET_SERGITO.sergito

  return (
    <group ref={groupRef} position={[x, MEET_SERGITO.playerGroundY, z]} rotation={[0, MEET_SERGITO.sergito.rotationY, 0]}>
      {vrmScene ? (
        <primitive object={vrmScene} scale={VRM_WORLD_SCALE} />
      ) : (
        <group position={[0, 0.05, 0]}>
          <MeebitSilhouette />
        </group>
      )}
      {canTalkToSergito && !isDialogueOpen ? <SergitoInteractionPin /> : null}
    </group>
  )
}

/** パーク NPC と同じ赤い近接マーカー */
function SergitoInteractionPin() {
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
