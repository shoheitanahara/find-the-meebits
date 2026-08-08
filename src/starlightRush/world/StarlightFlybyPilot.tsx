import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Vector3 } from 'three'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { applyVRMSeatedShootingPose } from '../../avatar/VRMLocomotion'
import { useVRMModel } from '../../avatar/useVRMModel'
import { applyHandPropFit } from '../../avatar/vrmHandPropFit'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { ShootingPistol } from '../../shootingGallery/world/ShootingPistol'
import { STARLIGHT_RUSH } from '../config'
import type { StarlightFlybyPilot } from '../dailyStarlightFlyby'
import { StarlightShip } from './StarlightShip'

const handWorld = new Vector3()
const IDLE_PISTOL = { fireFlashUntil: 0, recoilUntil: 0 }

type StarlightFlybyPilotViewProps = {
  pilot: StarlightFlybyPilot
}

/**
 * 僚機 1 機分。船 + 着席射撃ポーズ Meebit + 銃（装飾・ヒット対象外）。
 * 親がライドローカル位置を更新する。
 */
export function StarlightFlybyPilotView({ pilot }: StarlightFlybyPilotViewProps) {
  const rootRef = useRef<Group>(null)
  const pistolAnchorRef = useRef<Group>(null)
  const { flyby } = STARLIGHT_RUSH
  // exclusive: プール clone だと humanoid 姿勢が効かず T ポーズになる
  const { vrmRef, vrmScene, update } = useVRMModel(
    pilot.meebitNumber,
    true,
    flyby.vrmLoadPriority,
    true,
    true,
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    applyVRMSeatedShootingPose(vrmRef.current, {
      aimPitch: pilot.aimPitch,
      recoil: 0,
    })
    followRightHand()
    update(dt)
  })

  const followRightHand = () => {
    const vrm = vrmRef.current
    const pistol = pistolAnchorRef.current
    const root = rootRef.current
    if (!vrm || !pistol || !root) return
    const hand =
      vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightHand) ??
      vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightLowerArm)
    if (!hand) {
      pistol.position.set(0.28, 1.1, 0.22)
      pistol.rotation.set(0, 0, 0)
      return
    }
    hand.getWorldPosition(handWorld)
    root.worldToLocal(handWorld)
    applyHandPropFit(vrm, root, {
      handLocal: handWorld,
      target: pistol.position,
      handOffsetY: STARLIGHT_RUSH.pistolHandOffsetY,
      handOffsetZ: STARLIGHT_RUSH.pistolHandOffsetZ,
    })
    pistol.rotation.set(-pilot.aimPitch, 0, 0)
  }

  const { pilotLocal, shipLocal, craftRotationY, faceLight } = flyby

  return (
    <group rotation={[0, craftRotationY, 0]}>
      <StarlightShip position={[shipLocal.x, shipLocal.y, shipLocal.z]} scale={0.92} />
      <group
        ref={rootRef}
        position={[pilotLocal.x, pilotLocal.y, pilotLocal.z]}
        rotation={[0, pilotLocal.rotationY, 0]}
      >
        {/* 顔正面のキーライト — すれ違い時に表情が読めるように */}
        <pointLight
          position={[faceLight.position[0], faceLight.position[1], faceLight.position[2]]}
          intensity={faceLight.intensity}
          distance={faceLight.distance}
          color={faceLight.color}
          decay={2}
        />
        {vrmScene ? (
          <primitive object={vrmScene} scale={VRM_WORLD_SCALE * 0.95} />
        ) : (
          <MeebitSilhouette />
        )}
        <group ref={pistolAnchorRef} position={[0.28, 1.1, 0.22]}>
          <ShootingPistol visible getFireTiming={() => IDLE_PISTOL} />
        </group>
      </group>
    </group>
  )
}
