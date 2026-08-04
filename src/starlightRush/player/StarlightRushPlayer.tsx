import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, Vector3 } from 'three'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { applyVRMShootingPose } from '../../avatar/VRMLocomotion'
import { useVRMModel } from '../../avatar/useVRMModel'
import { applyHandPropFit } from '../../avatar/vrmHandPropFit'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { usePlayerStore } from '../../stores/playerStore'
import { ShootingPistol } from '../../shootingGallery/world/ShootingPistol'
import { STARLIGHT_RUSH } from '../config'
import { useStarlightRushStore } from '../store'

const handWorld = new Vector3()

/** 宇宙船に乗った Meebit。照準に合わせて上半身と銃が連動。 */
export function StarlightRushPlayer() {
  const rootRef = useRef<Group>(null)
  const pistolAnchorRef = useRef<Group>(null)
  const recoilAmountRef = useRef(0)
  const localTimeRef = useRef(0)
  const meebitNumber = usePlayerStore((state) => state.meebitNumber)
  const { vrmRef, vrmScene, update } = useVRMModel(meebitNumber, true, 0, true, true)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    localTimeRef.current += dt
    const store = useStarlightRushStore.getState()
    const aimYawRadians = -store.aimX * STARLIGHT_RUSH.cameraAimYawMax
    const aimPitchRadians = store.aimY * STARLIGHT_RUSH.cameraAimPitchMax
    const root = rootRef.current
    const { playerLocal } = STARLIGHT_RUSH
    if (root) {
      root.position.set(playerLocal.x, playerLocal.y, playerLocal.z)
      root.rotation.y = playerLocal.rotationY + aimYawRadians
    }

    const recoilTarget = performance.now() < store.recoilUntil ? 1 : 0
    recoilAmountRef.current = MathUtils.lerp(
      recoilAmountRef.current,
      recoilTarget,
      1 - Math.exp(-dt * 18),
    )

    applyVRMShootingPose(vrmRef.current, {
      aimPitch: aimPitchRadians + Math.sin(localTimeRef.current * 1.4) * 0.003,
      recoil: recoilAmountRef.current,
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

    const { aimY } = useStarlightRushStore.getState()
    pistol.rotation.set(-aimY * STARLIGHT_RUSH.cameraAimPitchMax, 0, 0)
  }

  return (
    <group
      ref={rootRef}
      position={[
        STARLIGHT_RUSH.playerLocal.x,
        STARLIGHT_RUSH.playerLocal.y,
        STARLIGHT_RUSH.playerLocal.z,
      ]}
      rotation={[0, STARLIGHT_RUSH.playerLocal.rotationY, 0]}
    >
      {vrmScene ? (
        <primitive object={vrmScene} scale={VRM_WORLD_SCALE} />
      ) : (
        <MeebitSilhouette />
      )}
      <group ref={pistolAnchorRef} position={[0.28, 1.1, 0.22]}>
        <ShootingPistol
          visible
          getFireTiming={() => {
            const state = useStarlightRushStore.getState()
            return {
              fireFlashUntil: state.fireFlashUntil,
              recoilUntil: state.recoilUntil,
            }
          }}
        />
      </group>
    </group>
  )
}
