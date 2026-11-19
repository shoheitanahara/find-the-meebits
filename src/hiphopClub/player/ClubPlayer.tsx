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
import { resolveClubMovement } from '../collisions'
import { CLUB } from '../config'
import { useClubControlsStore } from '../controlsStore'
import { setClubPlayerWorld } from '../playerWorld'

const movement = new Vector2()
const cameraPosition = new Vector3()
const cameraTarget = new Vector3()
const WALK_STEP_INTERVAL_SEC = 0.25
const WALK_BOB_FREQUENCY = 10.5

/** ダンスフロア歩行専用（座る処理なし） */
export function ClubPlayer({ enabled }: { enabled: boolean }) {
  const { gl } = useThree()
  const groupRef = useRef<Group>(null)
  const xRef = useRef<number>(CLUB.playerStart.x)
  const zRef = useRef<number>(CLUB.playerStart.z)
  const rotationYRef = useRef<number>(CLUB.playerStart.rotationY)
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
      lookYawRef.current -= event.movementX * CLUB.mouseLookSensitivity
      lookPitchRef.current = MathUtils.clamp(
        lookPitchRef.current + event.movementY * CLUB.mouseLookSensitivity,
        -CLUB.orbitPitchMaxDown,
        CLUB.orbitPitchMaxUp,
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

    const look = useClubControlsStore.getState().consumeLookDelta()
    if (look.lookDeltaX !== 0 || look.lookDeltaY !== 0) {
      const sens = CLUB.touchLookSensitivity
      lookYawRef.current -= look.lookDeltaX * sens
      lookPitchRef.current = MathUtils.clamp(
        lookPitchRef.current + look.lookDeltaY * sens,
        -CLUB.orbitPitchMaxDown,
        CLUB.orbitPitchMaxUp,
      )
    }

    const keyboard = keys.current
    const touch = useTouchControlsStore.getState()
    movement.set(0, 0)
    if (keyboard.forward) movement.y -= 1
    if (keyboard.backward) movement.y += 1
    if (keyboard.left) movement.x -= 1
    if (keyboard.right) movement.x += 1
    if (touch.joystickActive) {
      movement.x = touch.joystickX
      movement.y = touch.joystickY
    }
    if (movement.lengthSq() > 1) movement.normalize()

    const moving = movement.lengthSq() > 0.01
    const lookYaw = lookYawRef.current
    const forwardX = -Math.sin(lookYaw)
    const forwardZ = -Math.cos(lookYaw)
    const rightX = Math.cos(lookYaw)
    const rightZ = -Math.sin(lookYaw)

    if (moving) {
      const worldX = rightX * movement.x + forwardX * -movement.y
      const worldZ = rightZ * movement.x + forwardZ * -movement.y
      const nextX = xRef.current + worldX * CLUB.moveSpeed * dt
      const nextZ = zRef.current + worldZ * CLUB.moveSpeed * dt
      const resolved = resolveClubMovement(xRef.current, zRef.current, nextX, nextZ)
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

    setClubPlayerWorld(xRef.current, zRef.current)

    const group = groupRef.current
    if (group) {
      const groundY = CLUB.playerGroundY
      group.position.set(
        xRef.current,
        groundY + (moving ? Math.abs(Math.sin(localTimeRef.current * WALK_BOB_FREQUENCY)) * 0.022 : 0),
        zRef.current,
      )
      group.rotation.y = rotationYRef.current
    }

    applyVRMLocomotion(vrmRef.current, {
      elapsedTime: localTimeRef.current,
      isMoving: moving,
      isRunning: moving,
      idleOffset: 0.2,
      walkPhaseOffset: 0.15,
    })
    update(dt)

    const pitch = lookPitchRef.current
    const flatDist = Math.hypot(CLUB.cameraFollow.x, CLUB.cameraFollow.z)
    const orbitDist = flatDist * Math.cos(pitch)
    const offsetX = Math.sin(lookYaw) * orbitDist
    const offsetZ = Math.cos(lookYaw) * orbitDist
    const offsetY = CLUB.cameraFollow.y + Math.sin(pitch) * flatDist

    // 左右・入口側の壁ではカメラを部屋に押し込めない。壁の裏まで回り込み、
    // 間に入った壁は CameraOcclusionFader が透かす（押し込めると向きが不自然になる）。
    // 奥（スクリーン側）だけは、映像の重ね合わせがずれないよう手前に留める。
    const camX = xRef.current + offsetX
    const camZ = Math.max(zRef.current + offsetZ, CLUB.roomMinZ + 2.5)
    cameraPosition.set(camX, offsetY, camZ)
    cameraTarget.set(xRef.current, CLUB.cameraLookY, zRef.current)
    state.camera.position.lerp(cameraPosition, 1 - Math.exp(-dt * 8))
    state.camera.lookAt(cameraTarget)
  })

  return (
    <group
      ref={groupRef}
      position={[CLUB.playerStart.x, CLUB.playerGroundY, CLUB.playerStart.z]}
      rotation={[0, CLUB.playerStart.rotationY, 0]}
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
