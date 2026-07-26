import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Group, MathUtils, Vector2, Vector3 } from 'three'
import { applyVRMLocomotion } from '../../avatar/VRMLocomotion'
import { useKeyboardControls } from '../../avatar/useKeyboardControls'
import { useVRMModel } from '../../avatar/useVRMModel'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { usePlayerStore } from '../../stores/playerStore'
import { useTouchControlsStore } from '../../stores/touchControlsStore'
import { playSfx } from '../../ui/sfx'
import { resolveRunwayMovement } from '../collisions'
import { RUNWAY } from '../config'
import { setRunwayPlayerWorld } from '../playerWorld'

const movement = new Vector2()
const cameraPosition = new Vector3()
const cameraTarget = new Vector3()
const WALK_STEP_INTERVAL_SEC = 0.34

/** パークと同系統の 3rd person 歩行（カメラは室内にクランプ） */
export function RunwayPlayer({ enabled }: { enabled: boolean }) {
  const groupRef = useRef<Group>(null)
  const xRef = useRef(RUNWAY.playerStart.x)
  const zRef = useRef(RUNWAY.playerStart.z)
  const rotationYRef = useRef(RUNWAY.playerStart.rotationY)
  const localTimeRef = useRef(0)
  const footstepTimerRef = useRef(0)
  const keys = useKeyboardControls()
  const meebitNumber = usePlayerStore((state) => state.meebitNumber)
  const { vrmRef, vrmScene, update } = useVRMModel(meebitNumber, true, 0, true, true)

  useFrame((state, delta) => {
    if (!enabled) return

    const dt = Math.min(delta, 0.05)
    localTimeRef.current += dt

    const keyboard = keys.current
    const touch = useTouchControlsStore.getState()

    movement.set(0, 0)
    if (keyboard.left) movement.x -= 1
    if (keyboard.right) movement.x += 1
    if (keyboard.forward) movement.y -= 1
    if (keyboard.backward) movement.y += 1

    if (touch.joystickActive) {
      movement.x = touch.joystickX
      movement.y = touch.joystickY
    }

    if (movement.lengthSq() > 1) movement.normalize()

    const moving = movement.lengthSq() > 0.01

    if (moving) {
      const nextX = xRef.current + movement.x * RUNWAY.moveSpeed * dt
      const nextZ = zRef.current + movement.y * RUNWAY.moveSpeed * dt
      const resolved = resolveRunwayMovement(xRef.current, zRef.current, nextX, nextZ)
      xRef.current = resolved.x
      zRef.current = resolved.z
      rotationYRef.current = Math.atan2(movement.x, movement.y)

      footstepTimerRef.current += dt
      if (footstepTimerRef.current >= WALK_STEP_INTERVAL_SEC) {
        footstepTimerRef.current -= WALK_STEP_INTERVAL_SEC
        playSfx('footstep')
      }
    } else {
      footstepTimerRef.current = 0
    }

    setRunwayPlayerWorld(xRef.current, zRef.current)

    const group = groupRef.current
    if (group) {
      group.position.set(xRef.current, 0.06, zRef.current)
      group.rotation.y = rotationYRef.current
      group.position.y = 0.06 + Math.sin(localTimeRef.current * 1.6) * (moving ? 0.03 : 0.01)
    }

    applyVRMLocomotion(vrmRef.current, {
      elapsedTime: localTimeRef.current,
      isMoving: moving,
      idleOffset: 0.2,
      walkPhaseOffset: 0.15,
    })
    update(dt)

    // 室内に収まるよう追従（南壁の外に出ると真っ暗になる）
    const camX = MathUtils.clamp(
      xRef.current + RUNWAY.cameraFollow.x,
      -RUNWAY.roomHalfX + 1.2,
      RUNWAY.roomHalfX - 1.2,
    )
    const camZ = MathUtils.clamp(
      zRef.current + RUNWAY.cameraFollow.z,
      RUNWAY.roomMinZ + 2.5,
      RUNWAY.roomMaxZ - 0.8,
    )
    cameraPosition.set(camX, RUNWAY.cameraFollow.y, camZ)
    // 少し前方（ランウェイ側）を見て、俯瞰感を抑える
    cameraTarget.set(xRef.current, RUNWAY.cameraLookY, zRef.current - 2.4)
    state.camera.position.lerp(cameraPosition, 1 - Math.exp(-dt * 6))
    state.camera.lookAt(cameraTarget)
  })

  return (
    <group
      ref={groupRef}
      position={[RUNWAY.playerStart.x, 0.06, RUNWAY.playerStart.z]}
      rotation={[0, RUNWAY.playerStart.rotationY, 0]}
    >
      {vrmScene ? (
        <primitive object={vrmScene} scale={VRM_WORLD_SCALE} />
      ) : (
        <group position={[0, 0.05, 0]}>
          <MeebitSilhouette />
        </group>
      )}
    </group>
  )
}
