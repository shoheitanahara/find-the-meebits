import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Object3D } from 'three'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { useVRMModel } from '../../avatar/useVRMModel'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { PHOTO_STUDIO } from '../config'
import { applyStudioPose } from '../poses'
import { applyStudioVrmShading } from '../studioVrmShading'
import { usePhotoStudioStore } from '../store'

function enableStudioShadows(root: Object3D) {
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return
    obj.castShadow = true
    obj.receiveShadow = false
  })
}

/** スタジオ中央のプレイヤー Meebit（位置固定・ドラッグで回転）。 */
export function StudioPlayer() {
  const meebitNumber = usePhotoStudioStore((state) => state.meebitNumber)
  const poseId = usePhotoStudioStore((state) => state.poseId)
  const rotYaw = usePhotoStudioStore((state) => state.rotYaw)
  const { vrmRef, vrmScene, status, update } = useVRMModel(meebitNumber, true, 0, true, true)

  useEffect(() => {
    if (status !== 'ready' || !vrmRef.current) return
    applyStudioVrmShading(vrmRef.current)
    enableStudioShadows(vrmRef.current.scene)
  }, [status, meebitNumber, vrmRef, vrmScene])

  useFrame((_, delta) => {
    applyStudioPose(vrmRef.current, poseId)
    update(Math.min(delta, 0.05))
  })

  return (
    <group position={[0, PHOTO_STUDIO.modelGroundY, 0]} rotation={[0, rotYaw, 0]}>
      {vrmScene ? (
        <primitive object={vrmScene} scale={VRM_WORLD_SCALE * PHOTO_STUDIO.modelScale} />
      ) : (
        <MeebitSilhouette />
      )}
    </group>
  )
}
