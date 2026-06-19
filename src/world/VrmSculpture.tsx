import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Mesh, MeshStandardMaterial } from 'three'
import type { Object3D } from 'three'
import { useVRMModel } from '../avatar/useVRMModel'
import { applyVRMAttentionPose } from '../avatar/VRMLocomotion'
import { PLAYER_START_POSITION, VRM_WORLD_SCALE } from '../game/gameConfig'

/** NPC がプレイヤーを向くのと同じ式で、入口（開始位置）方向を向く */
export function getEntranceFacingY(x: number, z: number) {
  const dx = PLAYER_START_POSITION[0] - x
  const dz = PLAYER_START_POSITION[2] - z
  return Math.atan2(dx, dz)
}

const SCULPTURE_PEDESTAL_TOP_Y = 0.44
/** 台座サイズはそのまま、VRM 本体だけ約1.5倍 */
const SCULPTURE_VRM_SCALE = VRM_WORLD_SCALE * 1.5

const pedestalMaterial = (
  <meshStandardMaterial color="#ffffff" roughness={0.55} metalness={0.05} />
)
const plinthMaterial = (
  <meshStandardMaterial color="#ffffff" roughness={0.45} metalness={0.05} />
)

function applyGraySculptureMaterials(root: Object3D) {
  const material = new MeshStandardMaterial({
    color: '#a8a29e',
    roughness: 0.52,
    metalness: 0.12,
  })

  root.traverse((object) => {
    if (object instanceof Mesh) {
      object.material = material
    }
  })
}

function SculpturePedestal() {
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
  facingY?: number
}

export function VrmSculpture({
  meebitId,
  position,
  facingY,
}: VrmSculptureProps) {
  const rotationY = facingY ?? getEntranceFacingY(position[0], position[2])

  // Target preview capture と同じ: exclusive ロード + attention（I）ポーズ
  const { vrmRef, vrmScene, status } = useVRMModel(meebitId, true, -150, true, true)
  const hasPosedRef = useRef(false)

  useEffect(() => {
    hasPosedRef.current = false
  }, [meebitId])

  useFrame(() => {
    if (hasPosedRef.current || status !== 'ready' || !vrmRef.current || !vrmScene) {
      return
    }

    applyVRMAttentionPose(vrmRef.current)
    vrmRef.current.update(0)
    applyGraySculptureMaterials(vrmScene)
    hasPosedRef.current = true
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <SculpturePedestal />
      {vrmScene ? (
        <group position={[0, SCULPTURE_PEDESTAL_TOP_Y, 0]}>
          <primitive object={vrmScene} scale={SCULPTURE_VRM_SCALE} />
        </group>
      ) : null}
    </group>
  )
}
