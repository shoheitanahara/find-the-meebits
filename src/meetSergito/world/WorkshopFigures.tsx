import { useLayoutEffect, useMemo } from 'react'
import { applyVRMFigurePose } from '../../avatar/VRMLocomotion'
import { alignVrmFigureFeet } from '../../avatar/VRMLoader'
import { useVRMModel } from '../../avatar/useVRMModel'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { useMeetSergitoStore } from '../store'
import {
  getWorkshopFigureDateKey,
  getWorkshopFigurePlacements,
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

function WorkshopFigure({
  placement,
  index,
}: {
  placement: WorkshopFigurePlacement
  index: number
}) {
  const { vrmRef, vrmScene, status } = useVRMModel(placement.meebitId, true, 4500, false, true)
  const setFigureVrmReady = useMeetSergitoStore((state) => state.setFigureVrmReady)
  const figureScale = VRM_WORLD_SCALE * placement.scale

  // ファイル取得だけでなく、ポーズ・解像度加工・足元合わせまで終えてから ready
  useLayoutEffect(() => {
    if (status === 'error') {
      setFigureVrmReady(index)
      return
    }
    const vrm = vrmRef.current
    if (!vrm || status !== 'ready' || !vrmScene) return

    applyVRMFigurePose(vrm)
    applyWorkshopFigureVrmQuality(vrm)
    alignVrmFigureFeet(vrm)
    vrm.update(0)
    setFigureVrmReady(index)
  }, [index, setFigureVrmReady, status, vrmRef, vrmScene])

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
  const dateKey = useMemo(() => getWorkshopFigureDateKey(), [])
  const placements = useMemo(() => getWorkshopFigurePlacements(), [])

  return (
    <group key={dateKey}>
      {placements.map((placement, index) => (
        <WorkshopFigure
          key={`fig-${dateKey}-${index}-${placement.meebitId}`}
          placement={placement}
          index={index}
        />
      ))}
    </group>
  )
}
