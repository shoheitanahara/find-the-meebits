import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, Vector3 } from 'three'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { applyVRMShootingPose } from '../../avatar/VRMLocomotion'
import { useVRMModel } from '../../avatar/useVRMModel'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { usePlayerStore } from '../../stores/playerStore'
import { SHOOTING_GALLERY } from '../config'
import { useShootingGalleryStore } from '../store'
import { ShootingPistol } from '../world/ShootingPistol'

const handWorld = new Vector3()

/** 射撃位置に固定されたプレイヤー。照準に合わせて上半身と銃が連動。 */
export function ShootingGalleryPlayer() {
  const rootRef = useRef<Group>(null)
  const pistolAnchorRef = useRef<Group>(null)
  const recoilAmountRef = useRef(0)
  const localTimeRef = useRef(0)
  const meebitNumber = usePlayerStore((state) => state.meebitNumber)
  const { vrmRef, vrmScene, update } = useVRMModel(meebitNumber, true, 0, true, true)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    localTimeRef.current += dt
    const store = useShootingGalleryStore.getState()
    const aimYawRadians = -store.aimX * SHOOTING_GALLERY.cameraAimYawMax
    const aimPitchRadians = -store.aimY * SHOOTING_GALLERY.cameraAimPitchMax
    const root = rootRef.current
    const { playerAnchor } = SHOOTING_GALLERY
    if (root) {
      root.position.set(playerAnchor.x, playerAnchor.y, playerAnchor.z)
      root.rotation.y = playerAnchor.rotationY + aimYawRadians
    }

    const recoilTarget = performance.now() < store.recoilUntil ? 1 : 0
    recoilAmountRef.current = MathUtils.lerp(
      recoilAmountRef.current,
      recoilTarget,
      1 - Math.exp(-dt * 18),
    )

    // スタート前も同じ構えを維持し、Tポーズへの切り替わりを防ぐ。
    applyVRMShootingPose(vrmRef.current, {
      aimPitch: aimPitchRadians + Math.sin(localTimeRef.current * 1.4) * 0.003,
      recoil: recoilAmountRef.current,
    })
    followRightHand()
    update(dt)
  })

  /** 右手ボーンを銃のグリップ基点として、位置を直接追従させる。 */
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
    pistol.position.copy(handWorld)
    pistol.position.y += SHOOTING_GALLERY.pistolHandOffsetY

    const { aimY } = useShootingGalleryStore.getState()
    pistol.rotation.set(
      -aimY * SHOOTING_GALLERY.cameraAimPitchMax,
      0,
      0,
    )
  }

  return (
    <group
      ref={rootRef}
      position={[
        SHOOTING_GALLERY.playerAnchor.x,
        SHOOTING_GALLERY.playerAnchor.y,
        SHOOTING_GALLERY.playerAnchor.z,
      ]}
      rotation={[0, SHOOTING_GALLERY.playerAnchor.rotationY, 0]}
    >
      {vrmScene ? (
        <primitive object={vrmScene} scale={VRM_WORLD_SCALE} />
      ) : (
        <MeebitSilhouette />
      )}
      <group ref={pistolAnchorRef} position={[0.28, 1.1, 0.22]}>
        <ShootingPistol visible />
      </group>
    </group>
  )
}
