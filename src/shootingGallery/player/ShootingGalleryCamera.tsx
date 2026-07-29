import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { SHOOTING_GALLERY } from '../config'
import { useShootingGalleryStore } from '../store'

const cameraPosition = new Vector3()
const lookTarget = new Vector3()
const lookDirection = new Vector3()
const cameraRight = new Vector3()
const worldUp = new Vector3(0, 1, 0)

/** 右肩越しの固定位置から、中央照準に合わせてカメラの向きを追従させる。 */
export function ShootingGalleryCamera() {
  const { camera } = useThree()

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const {
      playerAnchor,
      cameraOffset,
      cameraLookY,
      cameraAimYawMax,
      cameraAimPitchMax,
    } = SHOOTING_GALLERY
    const { aimX, aimY } = useShootingGalleryStore.getState()

    cameraPosition.set(
      playerAnchor.x + cameraOffset.x,
      cameraOffset.y,
      playerAnchor.z + cameraOffset.z,
    )

    // 射撃場中央へ向く基準ベクトルを yaw / pitch で回す。
    // カメラ位置は固定し、視線だけを動かすため構図が大きく崩れない。
    lookTarget.set(playerAnchor.x, cameraLookY, playerAnchor.z - 6.5)
    lookDirection.copy(lookTarget).sub(cameraPosition).normalize()
    lookDirection.applyAxisAngle(worldUp, -aimX * cameraAimYawMax)
    cameraRight.crossVectors(lookDirection, worldUp).normalize()
    lookDirection.applyAxisAngle(cameraRight, aimY * cameraAimPitchMax)
    lookTarget.copy(cameraPosition).addScaledVector(lookDirection, 12)

    camera.position.lerp(cameraPosition, 1 - Math.exp(-dt * 10))
    camera.lookAt(lookTarget)
  })

  return null
}
