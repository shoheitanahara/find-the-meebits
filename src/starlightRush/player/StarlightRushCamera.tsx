import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import { STARLIGHT_RUSH } from '../config'
import { starlightRideRuntime } from '../ridePath'
import { useStarlightRushStore } from '../store'

const cameraPosition = new Vector3()
const lookTarget = new Vector3()
const lookDirection = new Vector3()
const cameraRight = new Vector3()
const worldUp = new Vector3(0, 1, 0)
const localOffset = new Vector3()
const localLook = new Vector3()

/** 船の後方三人称。レール姿勢に追従しつつ照準で視線を振る。 */
export function StarlightRushCamera() {
  const { camera } = useThree()

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const { cameraOffset, cameraLookAhead, cameraLookY, cameraAimYawMax, cameraAimPitchMax } =
      STARLIGHT_RUSH
    const { aimX, aimY } = useStarlightRushStore.getState()
    const ride = starlightRideRuntime

    localOffset.set(cameraOffset.x, cameraOffset.y, cameraOffset.z)
    localOffset.applyQuaternion(ride.quaternion)
    cameraPosition.copy(ride.position).add(localOffset)

    localLook.set(0, cameraLookY, -cameraLookAhead)
    localLook.applyQuaternion(ride.quaternion)
    lookTarget.copy(ride.position).add(localLook)

    lookDirection.copy(lookTarget).sub(cameraPosition).normalize()
    lookDirection.applyAxisAngle(worldUp, -aimX * cameraAimYawMax)
    cameraRight.crossVectors(lookDirection, worldUp).normalize()
    if (cameraRight.lengthSq() > 1e-6) {
      lookDirection.applyAxisAngle(cameraRight, aimY * cameraAimPitchMax)
    }
    lookTarget.copy(cameraPosition).addScaledVector(lookDirection, 16)

    const lerp = 1 - Math.exp(-dt * STARLIGHT_RUSH.cameraFollowLerp)
    camera.position.lerp(cameraPosition, lerp)
    camera.lookAt(lookTarget)

    // 終盤ワープで FOV を少し広げる
    const warp = starlightRideRuntime.warpBoost
    const cam = camera as typeof camera & { fov?: number }
    if (typeof cam.fov === 'number') {
      cam.fov = MathUtils.lerp(STARLIGHT_RUSH.cameraFov, STARLIGHT_RUSH.cameraFov + 10, warp)
      cam.updateProjectionMatrix?.()
    }
  })

  return null
}
