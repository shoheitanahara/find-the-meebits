import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { SHORE_FISHING } from '../config'
import { shorePlayerWorld } from '../playerWorld'

const desired = new Vector3()
const lookAt = new Vector3()
const offset = new Vector3(
  SHORE_FISHING.cameraFollow.x,
  SHORE_FISHING.cameraFollow.y,
  SHORE_FISHING.cameraFollow.z,
)

/** パークと同じ固定オフセット追従。 */
export function ShoreFishingCamera() {
  useFrame(({ camera }, delta) => {
    desired.set(shorePlayerWorld.x, 0, shorePlayerWorld.z).add(offset)
    lookAt.set(shorePlayerWorld.x, SHORE_FISHING.cameraLookY, shorePlayerWorld.z)
    camera.position.lerp(desired, 1 - Math.exp(-delta * 5))
    camera.lookAt(lookAt)
  })

  return null
}
