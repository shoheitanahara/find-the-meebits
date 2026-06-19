import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Group } from 'three'
import { PLAYER_START_POSITION, VRM_WORLD_SCALE } from '../game/gameConfig'
import {
  acquireVrmSculptureScene,
  releaseVrmSculptureScene,
} from './vrmSculptureCache'
import type { VrmSculpturePedestal } from './worldLandmarks'

/** NPC がプレイヤーを向くのと同じ式で、入口（開始位置）方向を向く */
export function getEntranceFacingY(x: number, z: number) {
  const dx = PLAYER_START_POSITION[0] - x
  const dz = PLAYER_START_POSITION[2] - z
  return Math.atan2(dx, dz)
}

const SCULPTURE_PEDESTAL_TOP_Y = 0.44
/** 台座サイズはそのまま、VRM 本体だけ約1.5倍 */
export const SCULPTURE_VRM_SCALE = VRM_WORLD_SCALE * 1.5

const lightPedestalMaterial = (
  <meshStandardMaterial color="#ffffff" roughness={0.55} metalness={0.05} />
)
const lightPlinthMaterial = (
  <meshStandardMaterial color="#ffffff" roughness={0.45} metalness={0.05} />
)
const darkPedestalMaterial = (
  <meshStandardMaterial color="#1c1917" roughness={0.72} />
)
const darkPlinthMaterial = (
  <meshStandardMaterial color="#292524" roughness={0.68} />
)

function getPedestalMaterials(pedestal: VrmSculpturePedestal): {
  pedestalMaterial: ReactNode
  plinthMaterial: ReactNode
} {
  if (pedestal === 'dark') {
    return { pedestalMaterial: darkPedestalMaterial, plinthMaterial: darkPlinthMaterial }
  }

  return { pedestalMaterial: lightPedestalMaterial, plinthMaterial: lightPlinthMaterial }
}

function SculpturePedestal({ pedestal }: { pedestal: VrmSculpturePedestal }) {
  const { pedestalMaterial, plinthMaterial } = getPedestalMaterials(pedestal)

  return (
    <>
      <mesh castShadow receiveShadow position={[0, 0.09, 0]}>
        <boxGeometry args={[2.6, 0.18, 2.6]} />
        {pedestalMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.24, 0]}>
        <boxGeometry args={[1.85, 0.16, 1.85]} />
        {plinthMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.38, 0]}>
        <boxGeometry args={[1.15, 0.12, 1.15]} />
        {plinthMaterial}
      </mesh>
    </>
  )
}

type VrmSculptureProps = {
  meebitId: number
  position: [number, number, number]
  pedestal: VrmSculpturePedestal
  facingY?: number
}

export function VrmSculpture({
  meebitId,
  position,
  pedestal,
  facingY,
}: VrmSculptureProps) {
  const rotationY = facingY ?? getEntranceFacingY(position[0], position[2])
  const [sculptureScene, setSculptureScene] = useState<Group | null>(null)

  useEffect(() => {
    let activeScene: Group | null = null
    let cancelled = false

    acquireVrmSculptureScene(meebitId).then((scene) => {
      if (cancelled) {
        releaseVrmSculptureScene(meebitId, scene)
        return
      }

      activeScene = scene
      setSculptureScene(scene)
    })

    return () => {
      cancelled = true
      if (activeScene) {
        releaseVrmSculptureScene(meebitId, activeScene)
      }
      setSculptureScene(null)
    }
  }, [meebitId])

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <SculpturePedestal pedestal={pedestal} />
      {sculptureScene ? (
        <group position={[0, SCULPTURE_PEDESTAL_TOP_Y, 0]}>
          <primitive object={sculptureScene} scale={SCULPTURE_VRM_SCALE} />
        </group>
      ) : null}
    </group>
  )
}
