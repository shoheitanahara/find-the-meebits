import { useLayoutEffect } from 'react'
import { applyVRMFigurePose } from '../../avatar/VRMLocomotion'
import { alignVrmFigureFeet } from '../../avatar/VRMLoader'
import { useVRMModel } from '../../avatar/useVRMModel'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import {
  WORKSHOP_FIGURE_PLACEMENTS,
  type WorkshopFigurePlacement,
} from './workshopFigureLayout'
import { applyWorkshopFigureVrmQuality } from './workshopFigureVrmQuality'

const PEDESTAL_HEIGHT = 0.055
const PEDESTAL_SIZE = 0.26

function BlackSquarePedestal() {
  return (
    <group position={[0, PEDESTAL_HEIGHT / 2, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[PEDESTAL_SIZE, PEDESTAL_HEIGHT, PEDESTAL_SIZE]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.38} metalness={0.48} />
      </mesh>
      <mesh position={[0, PEDESTAL_HEIGHT / 2 + 0.003, 0]} receiveShadow>
        <boxGeometry args={[PEDESTAL_SIZE * 0.92, 0.006, PEDESTAL_SIZE * 0.92]} />
        <meshStandardMaterial color="#18181c" roughness={0.25} metalness={0.62} />
      </mesh>
    </group>
  )
}

function WorkshopFigure({ placement }: { placement: WorkshopFigurePlacement }) {
  const { vrmRef, vrmScene } = useVRMModel(placement.meebitId, true, 4500, false, true)
  const figureScale = VRM_WORLD_SCALE * placement.scale

  useLayoutEffect(() => {
    const vrm = vrmRef.current
    if (!vrm) return
    applyVRMFigurePose(vrm)
    applyWorkshopFigureVrmQuality(vrm)
    alignVrmFigureFeet(vrm)
    vrm.update(0)
  }, [vrmRef, vrmScene])

  return (
    <group position={[placement.x, placement.y, placement.z]} rotation={[0, placement.rotationY, 0]}>
      <BlackSquarePedestal />
      {vrmScene ? (
        <group position={[0, PEDESTAL_HEIGHT - 0.05, 0]}>
          <primitive object={vrmScene} scale={figureScale} />
        </group>
      ) : null}
    </group>
  )
}

export function WorkshopFigures() {
  return (
    <group>
      {WORKSHOP_FIGURE_PLACEMENTS.map((placement, index) => (
        <WorkshopFigure key={`fig-${index}-${placement.meebitId}`} placement={placement} />
      ))}
    </group>
  )
}
