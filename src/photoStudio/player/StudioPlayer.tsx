import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, Object3D, Vector3 } from 'three'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { useVRMModel } from '../../avatar/useVRMModel'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { ShootingPistol } from '../../shootingGallery/world/ShootingPistol'
import { PHOTO_STUDIO } from '../config'
import { applyStudioPose } from '../poses'
import { applyStudioVrmShading } from '../studioVrmShading'
import { usePhotoStudioStore } from '../store'
import { StudioSitChair } from '../world/StudioSitChair'

const handWorld = new Vector3()

/** 射撃ポーズ時はフラッシュ／リコイルを出さない。 */
const IDLE_PISTOL_TIMING = { fireFlashUntil: 0, recoilUntil: 0 }

function enableStudioShadows(root: Object3D) {
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return
    obj.castShadow = true
    obj.receiveShadow = false
  })
}

/** スタジオ中央のプレイヤー Meebit（位置固定・ドラッグで回転）。 */
export function StudioPlayer() {
  const rootRef = useRef<Group>(null)
  const pistolAnchorRef = useRef<Group>(null)
  const meebitNumber = usePhotoStudioStore((state) => state.meebitNumber)
  const poseId = usePhotoStudioStore((state) => state.poseId)
  const rotYaw = usePhotoStudioStore((state) => state.rotYaw)
  const { vrmRef, vrmScene, status, update } = useVRMModel(meebitNumber, true, 0, true, true)
  const isShoot = poseId === 'shoot'

  useEffect(() => {
    if (status !== 'ready' || !vrmRef.current) return
    applyStudioVrmShading(vrmRef.current)
    enableStudioShadows(vrmRef.current.scene)
  }, [status, meebitNumber, vrmRef, vrmScene])

  useFrame((_, delta) => {
    applyStudioPose(vrmRef.current, poseId)
    if (isShoot) {
      followRightHand()
    }
    update(Math.min(delta, 0.05))
  })

  /** 射的場と同じく、右手ボーンを銃のグリップ基点として追従。 */
  const followRightHand = () => {
    const vrm = vrmRef.current
    const pistol = pistolAnchorRef.current
    const root = rootRef.current
    if (!vrm || !pistol || !root) return
    const hand =
      vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightHand) ??
      vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightLowerArm)
    const { handOffsetY, handOffsetZ, fallbackPosition } = PHOTO_STUDIO.shootPistol
    if (!hand) {
      pistol.position.set(
        fallbackPosition[0],
        fallbackPosition[1],
        fallbackPosition[2],
      )
      pistol.rotation.set(0, 0, 0)
      return
    }
    hand.getWorldPosition(handWorld)
    root.worldToLocal(handWorld)
    pistol.position.copy(handWorld)
    pistol.position.y += handOffsetY
    pistol.position.z += handOffsetZ
    pistol.rotation.set(0, 0, 0)
  }

  return (
    <group
      ref={rootRef}
      position={[0, PHOTO_STUDIO.modelGroundY, 0]}
      rotation={[0, rotYaw, 0]}
    >
      {poseId === 'sit' ? <StudioSitChair /> : null}
      {vrmScene ? (
        <primitive object={vrmScene} scale={VRM_WORLD_SCALE * PHOTO_STUDIO.modelScale} />
      ) : (
        <MeebitSilhouette />
      )}
      {isShoot ? (
        <group
          ref={pistolAnchorRef}
          position={[
            PHOTO_STUDIO.shootPistol.fallbackPosition[0],
            PHOTO_STUDIO.shootPistol.fallbackPosition[1],
            PHOTO_STUDIO.shootPistol.fallbackPosition[2],
          ]}
        >
          <ShootingPistol
            visible
            getFireTiming={() => IDLE_PISTOL_TIMING}
          />
        </group>
      ) : null}
    </group>
  )
}
