import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { SHORE_FISHING } from '../config'
import { shorePlayerWorld } from '../playerWorld'

const desired = new Vector3()
const lookAt = new Vector3()
const lookTarget = new Vector3()
const offset = new Vector3(
  SHORE_FISHING.cameraFollow.x,
  SHORE_FISHING.cameraFollow.y,
  SHORE_FISHING.cameraFollow.z,
)

/** 通常はプレイヤー追従。キャスト中はアバターと餌の中点が注視点。 */
export function ShoreFishingCamera() {
  useFrame(({ camera }, delta) => {
    const p = shorePlayerWorld
    const follow = 1 - Math.exp(-delta * 4.2)

    if (p.bobberActive) {
      // アバターと浮きの中間を画面の中心に
      lookTarget.set((p.x + p.bobberX) * 0.5, SHORE_FISHING.cameraLookY, (p.z + p.bobberZ) * 0.5)
      // カメラ位置はプレイヤー背後を基本に、中点へ少し寄せる
      desired
        .set((p.x * 0.65 + lookTarget.x * 0.35), 0, (p.z * 0.65 + lookTarget.z * 0.35))
        .add(offset)
    } else {
      lookTarget.set(p.x, SHORE_FISHING.cameraLookY, p.z)
      desired.set(p.x, 0, p.z).add(offset)
    }

    lookAt.lerp(lookTarget, follow)
    camera.position.lerp(desired, follow)
    camera.lookAt(lookAt)
  })

  return null
}
