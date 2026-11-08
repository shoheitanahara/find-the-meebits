import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, MathUtils, Vector2, Vector3 } from 'three'
import { applyVRMLocomotion, applyVRMSitPose, getAudienceBreathParams } from '../../avatar/VRMLocomotion'
import { useKeyboardControls } from '../../avatar/useKeyboardControls'
import { useVRMModel } from '../../avatar/useVRMModel'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { usePlayerStore } from '../../stores/playerStore'
import { useTouchControlsStore } from '../../stores/touchControlsStore'
import { playSfx } from '../../ui/sfx'
import { resolveCinemaMovement } from '../collisions'
import { CINEMA } from '../config'
import { useCinemaControlsStore } from '../controlsStore'
import { setCinemaPlayerWorld } from '../playerWorld'
import {
  CINEMA_SEAT_Y,
  findNearestEmptySeat,
  getCinemaSeatSlot,
  resolveCinemaStandUpPosition,
} from '../cinemaSeats'
import { useCinemaStore } from '../store'

const movement = new Vector2()
const cameraPosition = new Vector3()
const cameraTarget = new Vector3()
const WALK_STEP_INTERVAL_SEC = 0.25
const WALK_BOB_FREQUENCY = 10.5

export function CinemaPlayer({ enabled }: { enabled: boolean }) {
  const { gl } = useThree()
  const groupRef = useRef<Group>(null)
  const xRef = useRef<number>(CINEMA.playerStart.x)
  const zRef = useRef<number>(CINEMA.playerStart.z)
  const rotationYRef = useRef<number>(CINEMA.playerStart.rotationY)
  const lookYawRef = useRef(0)
  const lookPitchRef = useRef(0)
  const lockedRef = useRef(false)
  const localTimeRef = useRef(0)
  const footstepTimerRef = useRef(0)
  const keys = useKeyboardControls()
  const meebitNumber = usePlayerStore((state) => state.meebitNumber)
  const playerSeatIndex = useCinemaStore((state) => state.playerSeatIndex)
  const emptySeatIndices = useCinemaStore((state) => state.emptySeatIndices)
  const setNearestEmptySeatIndex = useCinemaStore((state) => state.setNearestEmptySeatIndex)
  const { vrmRef, vrmScene, update } = useVRMModel(meebitNumber, true, 0, true, true)
  const prevSeatRef = useRef<number | null>(null)
  const breathParams = useMemo(() => getAudienceBreathParams(meebitNumber), [meebitNumber])

  useEffect(() => {
    if (prevSeatRef.current !== null && playerSeatIndex === null) {
      const stand = resolveCinemaStandUpPosition(prevSeatRef.current)
      if (stand) {
        xRef.current = stand.x
        zRef.current = stand.z
        rotationYRef.current = stand.rotationY
      }
    }
    prevSeatRef.current = playerSeatIndex
  }, [playerSeatIndex])

  useEffect(() => {
    if (!enabled && playerSeatIndex !== null) {
      useCinemaStore.getState().standUp()
    }
  }, [enabled, playerSeatIndex])

  useEffect(() => {
    if (!enabled) {
      lookYawRef.current = 0
      lookPitchRef.current = 0
      return
    }

    const onMouseMove = (event: MouseEvent) => {
      if (!lockedRef.current) return
      lookYawRef.current -= event.movementX * CINEMA.mouseLookSensitivity
      lookPitchRef.current = MathUtils.clamp(
        lookPitchRef.current + event.movementY * CINEMA.mouseLookSensitivity,
        -CINEMA.orbitPitchMaxDown,
        CINEMA.orbitPitchMaxUp,
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
    const isSitting = playerSeatIndex !== null

    const look = useCinemaControlsStore.getState().consumeLookDelta()
    if (look.lookDeltaX !== 0 || look.lookDeltaY !== 0) {
      const sens = CINEMA.touchLookSensitivity
      lookYawRef.current -= look.lookDeltaX * sens
      lookPitchRef.current = MathUtils.clamp(
        lookPitchRef.current + look.lookDeltaY * sens,
        -CINEMA.orbitPitchMaxDown,
        CINEMA.orbitPitchMaxUp,
      )
    }

    const keyboard = keys.current
    const touch = useTouchControlsStore.getState()

    if (!isSitting) {
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
    } else {
      movement.set(0, 0)
      useTouchControlsStore.getState().resetJoystick()
    }

    const moving = !isSitting && movement.lengthSq() > 0.01
    const lookYaw = lookYawRef.current
    const forwardX = -Math.sin(lookYaw)
    const forwardZ = -Math.cos(lookYaw)
    const rightX = Math.cos(lookYaw)
    const rightZ = -Math.sin(lookYaw)

    if (isSitting) {
      const seat = getCinemaSeatSlot(playerSeatIndex)
      if (seat) {
        xRef.current = seat.x
        zRef.current = seat.z
        rotationYRef.current = seat.rotationY
      }
      setNearestEmptySeatIndex(null)
    } else if (moving) {
      const worldX = rightX * movement.x + forwardX * -movement.y
      const worldZ = rightZ * movement.x + forwardZ * -movement.y
      const nextX = xRef.current + worldX * CINEMA.moveSpeed * dt
      const nextZ = zRef.current + worldZ * CINEMA.moveSpeed * dt
      const resolved = resolveCinemaMovement(xRef.current, zRef.current, nextX, nextZ)
      xRef.current = resolved.x
      zRef.current = resolved.z
      rotationYRef.current = Math.atan2(worldX, worldZ)

      footstepTimerRef.current += dt
      if (footstepTimerRef.current >= WALK_STEP_INTERVAL_SEC) {
        footstepTimerRef.current -= WALK_STEP_INTERVAL_SEC
        playSfx('footstep')
      }

      setNearestEmptySeatIndex(findNearestEmptySeat(xRef.current, zRef.current, emptySeatIndices))
    } else {
      footstepTimerRef.current = 0
      setNearestEmptySeatIndex(findNearestEmptySeat(xRef.current, zRef.current, emptySeatIndices))
    }

    setCinemaPlayerWorld(xRef.current, zRef.current)

    const group = groupRef.current
    if (group) {
      const groundY = CINEMA.playerGroundY
      group.position.set(xRef.current, isSitting ? CINEMA_SEAT_Y : groundY, zRef.current)
      group.rotation.y = rotationYRef.current
      if (!isSitting) {
        group.position.y =
          groundY +
          (moving ? Math.abs(Math.sin(localTimeRef.current * WALK_BOB_FREQUENCY)) * 0.022 : 0)
      }
    }

    if (isSitting) {
      applyVRMSitPose(vrmRef.current, {
        elapsedTime: localTimeRef.current,
        ...breathParams,
      })
    } else {
      applyVRMLocomotion(vrmRef.current, {
        elapsedTime: localTimeRef.current,
        isMoving: moving,
        isRunning: moving,
        idleOffset: 0.2,
        walkPhaseOffset: 0.15,
      })
    }
    update(dt)

    const pitch = lookPitchRef.current
    const flatDist = Math.hypot(CINEMA.cameraFollow.x, CINEMA.cameraFollow.z)
    const orbitDist = flatDist * Math.cos(pitch)
    const offsetX = Math.sin(lookYaw) * orbitDist
    const offsetZ = Math.cos(lookYaw) * orbitDist
    const offsetY = CINEMA.cameraFollow.y + Math.sin(pitch) * flatDist

    const camX = MathUtils.clamp(
      xRef.current + offsetX,
      -CINEMA.roomHalfX + 1.2,
      CINEMA.roomHalfX - 1.2,
    )
    const camZ = MathUtils.clamp(
      zRef.current + offsetZ,
      CINEMA.roomMinZ + 2.5,
      CINEMA.roomMaxZ - 0.8,
    )
    cameraPosition.set(camX, offsetY, camZ)
    cameraTarget.set(xRef.current, CINEMA.cameraLookY, zRef.current)
    state.camera.position.lerp(cameraPosition, 1 - Math.exp(-dt * 8))
    state.camera.lookAt(cameraTarget)
  })

  return (
    <group
      ref={groupRef}
      position={[CINEMA.playerStart.x, CINEMA.playerGroundY, CINEMA.playerStart.z]}
      rotation={[0, CINEMA.playerStart.rotationY, 0]}
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
