import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
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
import { useRunwayControlsStore } from '../controlsStore'
import { setRunwayPlayerWorld } from '../playerWorld'

const movement = new Vector2()
const cameraPosition = new Vector3()
const cameraTarget = new Vector3()
const WALK_STEP_INTERVAL_SEC = 0.34

/**
 * パークと同系統の 3rd person 歩行。
 * カメラ距離・高さは従来どおり、マウス／タッチで左右・後ろを見回せる。
 */
export function RunwayPlayer({ enabled }: { enabled: boolean }) {
  const { gl } = useThree()
  const groupRef = useRef<Group>(null)
  const xRef = useRef<number>(RUNWAY.playerStart.x)
  const zRef = useRef<number>(RUNWAY.playerStart.z)
  const rotationYRef = useRef<number>(RUNWAY.playerStart.rotationY)
  const lookYawRef = useRef(0)
  const lookPitchRef = useRef(0)
  const lockedRef = useRef(false)
  const localTimeRef = useRef(0)
  const footstepTimerRef = useRef(0)
  const keys = useKeyboardControls()
  const meebitNumber = usePlayerStore((state) => state.meebitNumber)
  const { vrmRef, vrmScene, update } = useVRMModel(meebitNumber, true, 0, true, true)

  useEffect(() => {
    if (!enabled) {
      lookYawRef.current = 0
      lookPitchRef.current = 0
      return
    }

    const onMouseMove = (event: MouseEvent) => {
      if (!lockedRef.current) return
      lookYawRef.current -= event.movementX * RUNWAY.mouseLookSensitivity
      lookPitchRef.current = MathUtils.clamp(
        lookPitchRef.current + event.movementY * RUNWAY.mouseLookSensitivity,
        -RUNWAY.orbitPitchMaxDown,
        RUNWAY.orbitPitchMaxUp,
      )
    }
    const onClick = () => {
      if (document.pointerLockElement !== gl.domElement) {
        void gl.domElement.requestPointerLock()
      }
    }
    const onPointerLockChange = () => {
      lockedRef.current = document.pointerLockElement === gl.domElement
    }

    window.addEventListener('mousemove', onMouseMove)
    gl.domElement.addEventListener('click', onClick)
    document.addEventListener('pointerlockchange', onPointerLockChange)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      gl.domElement.removeEventListener('click', onClick)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      if (document.pointerLockElement === gl.domElement) document.exitPointerLock()
      lockedRef.current = false
    }
  }, [enabled, gl])

  useFrame((state, delta) => {
    if (!enabled) return

    const dt = Math.min(delta, 0.05)
    localTimeRef.current += dt

    const look = useRunwayControlsStore.getState().consumeLookDelta()
    if (look.lookDeltaX !== 0 || look.lookDeltaY !== 0) {
      const sens = RUNWAY.touchLookSensitivity
      lookYawRef.current -= look.lookDeltaX * sens
      lookPitchRef.current = MathUtils.clamp(
        lookPitchRef.current - look.lookDeltaY * sens,
        -RUNWAY.orbitPitchMaxDown,
        RUNWAY.orbitPitchMaxUp,
      )
    }

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
    const lookYaw = lookYawRef.current
    // カメラが向いている水平方向に合わせて移動（W = 画面奥）
    const forwardX = -Math.sin(lookYaw)
    const forwardZ = -Math.cos(lookYaw)
    const rightX = Math.cos(lookYaw)
    const rightZ = -Math.sin(lookYaw)

    if (moving) {
      const worldX = rightX * movement.x + forwardX * -movement.y
      const worldZ = rightZ * movement.x + forwardZ * -movement.y
      const nextX = xRef.current + worldX * RUNWAY.moveSpeed * dt
      const nextZ = zRef.current + worldZ * RUNWAY.moveSpeed * dt
      const resolved = resolveRunwayMovement(xRef.current, zRef.current, nextX, nextZ)
      xRef.current = resolved.x
      zRef.current = resolved.z
      rotationYRef.current = Math.atan2(worldX, worldZ)

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

    const pitch = lookPitchRef.current
    const flatDist = Math.hypot(RUNWAY.cameraFollow.x, RUNWAY.cameraFollow.z)
    const orbitDist = flatDist * Math.cos(pitch)
    const offsetX = Math.sin(lookYaw) * orbitDist
    const offsetZ = Math.cos(lookYaw) * orbitDist
    const offsetY = RUNWAY.cameraFollow.y + Math.sin(pitch) * flatDist

    const camX = MathUtils.clamp(
      xRef.current + offsetX,
      -RUNWAY.roomHalfX + 1.2,
      RUNWAY.roomHalfX - 1.2,
    )
    const camZ = MathUtils.clamp(
      zRef.current + offsetZ,
      RUNWAY.roomMinZ + 2.5,
      RUNWAY.roomMaxZ - 0.8,
    )
    cameraPosition.set(camX, offsetY, camZ)
    cameraTarget.set(xRef.current, RUNWAY.cameraLookY, zRef.current)
    state.camera.position.lerp(cameraPosition, 1 - Math.exp(-dt * 8))
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
