import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { applyVRMSitPose, getAudienceBreathParams } from '../../avatar/VRMLocomotion'
import { useVRMModel } from '../../avatar/useVRMModel'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { JAZZ_BAR_SEAT_Y, getJazzBarSeatSlot, getOccupiedSeatIndices } from '../jazzBarSeats'
import { useJazzBarStore } from '../store'

/** スクリーン向き客席の観客（約60%占有） */
export function JazzBarAudience() {
  const audienceIds = useJazzBarStore((state) => state.audienceIds)
  const emptySeatIndices = useJazzBarStore((state) => state.emptySeatIndices)
  const phase = useJazzBarStore((state) => state.phase)

  const seats = useMemo(() => {
    const occupied = getOccupiedSeatIndices(emptySeatIndices)
    return occupied
      .map((seatIndex, audienceIndex) => {
        const slot = getJazzBarSeatSlot(seatIndex)
        const meebitNumber = audienceIds[audienceIndex]
        if (!slot || meebitNumber === undefined) return null
        return {
          seatIndex,
          meebitNumber,
          x: slot.x,
          z: slot.z,
          rotationY: slot.rotationY,
        }
      })
      .filter((seat): seat is NonNullable<typeof seat> => seat !== null)
  }, [audienceIds, emptySeatIndices])

  if (phase !== 'playing') return null

  return (
    <group>
      {seats.map((seat) => (
        <SeatedAudience
          key={`aud-${seat.seatIndex}-${seat.meebitNumber}`}
          meebitNumber={seat.meebitNumber}
          x={seat.x}
          z={seat.z}
          rotationY={seat.rotationY}
        />
      ))}
    </group>
  )
}

function SeatedAudience({
  meebitNumber,
  x,
  z,
  rotationY,
}: {
  meebitNumber: number
  x: number
  z: number
  rotationY: number
}) {
  const groupRef = useRef<Group>(null)
  const elapsedRef = useRef(0)
  const { vrmRef, vrmScene, update } = useVRMModel(meebitNumber, true, 200, true, true)
  const breathParams = useMemo(() => getAudienceBreathParams(meebitNumber), [meebitNumber])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    elapsedRef.current += dt
    applyVRMSitPose(vrmRef.current, {
      elapsedTime: elapsedRef.current,
      ...breathParams,
    })
    update(dt)
  })

  return (
    <group ref={groupRef} position={[x, JAZZ_BAR_SEAT_Y, z]} rotation={[0, rotationY, 0]}>
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
