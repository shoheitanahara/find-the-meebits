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
import { resolveLearnArtMovement } from '../collisions'
import { LEARN_ART } from '../config'
import { useLearnArtControlsStore } from '../controlsStore'
import { setLearnArtPlayerWorld } from '../playerWorld'
import {
  LEARN_ART_SEAT_Y,
  findNearestEmptySeat,
  getLearnArtSeatSlot,
  resolveLearnArtStandUpPosition,
} from '../learnArtSeats'
import { useLearnArtStore } from '../store'

const movement = new Vector2()
const cameraPosition = new Vector3()
const cameraTarget = new Vector3()
const WALK_STEP_INTERVAL_SEC = 0.25
const WALK_BOB_FREQUENCY = 10.5

export function LearnArtPlayer({ enabled }: { enabled: boolean }) {
  const { gl } = useThree()
  const groupRef = useRef<Group>(null)
  const xRef = useRef<number>(LEARN_ART.playerStart.x)
  const zRef = useRef<number>(LEARN_ART.playerStart.z)
  const rotationYRef = useRef<number>(LEARN_ART.playerStart.rotationY)
  const lookYawRef = useRef(0)
  const lookPitchRef = useRef(0)
  const lockedRef = useRef(false)
  const localTimeRef = useRef(0)
  const footstepTimerRef = useRef(0)
  const keys = useKeyboardControls()
  const meebitNumber = usePlayerStore((state) => state.meebitNumber)
  const playerSeatIndex = useLearnArtStore((state) => state.playerSeatIndex)
  const emptySeatIndices = useLearnArtStore((state) => state.emptySeatIndices)
  const setNearestEmptySeatIndex = useLearnArtStore((state) => state.setNearestEmptySeatIndex)
  const { vrmRef, vrmScene, update } = useVRMModel(meebitNumber, true, 0, true, true)
  const prevSeatRef = useRef<number | null>(null)
  const breathParams = useMemo(() => getAudienceBreathParams(meebitNumber), [meebitNumber])

  useEffect(() => {
    if (prevSeatRef.current !== null && playerSeatIndex === null) {
      const stand = resolveLearnArtStandUpPosition(prevSeatRef.current)
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
      useLearnArtStore.getState().standUp()
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
      lookYawRef.current -= event.movementX * LEARN_ART.mouseLookSensitivity
      lookPitchRef.current = MathUtils.clamp(
        lookPitchRef.current + event.movementY * LEARN_ART.mouseLookSensitivity,
        -LEARN_ART.orbitPitchMaxDown,
        LEARN_ART.orbitPitchMaxUp,
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

    const look = useLearnArtControlsStore.getState().consumeLookDelta()
    if (look.lookDeltaX !== 0 || look.lookDeltaY !== 0) {
      const sens = LEARN_ART.touchLookSensitivity
      lookYawRef.current -= look.lookDeltaX * sens
      lookPitchRef.current = MathUtils.clamp(
        lookPitchRef.current + look.lookDeltaY * sens,
        -LEARN_ART.orbitPitchMaxDown,
        LEARN_ART.orbitPitchMaxUp,
      )
    }

    const keyboard = keys.current
    const touch = useTouchControlsStore.getState()

    const wantsMove =
      keyboard.forward ||
      keyboard.backward ||
      keyboard.left ||
      keyboard.right ||
      touch.joystickActive

    if (isSitting && wantsMove) {
      useLearnArtStore.getState().standUp()
    }

    movement.set(0, 0)
    if (!isSitting || wantsMove) {
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
      useTouchControlsStore.getState().resetJoystick()
    }

    // 今フレームで立ち上がった場合も移動を許可
    const effectivelySitting = isSitting && !wantsMove
    const moving = !effectivelySitting && movement.lengthSq() > 0.01
    const lookYaw = lookYawRef.current
    const forwardX = -Math.sin(lookYaw)
    const forwardZ = -Math.cos(lookYaw)
    const rightX = Math.cos(lookYaw)
    const rightZ = -Math.sin(lookYaw)

    if (effectivelySitting) {
      const seat = getLearnArtSeatSlot(playerSeatIndex)
      if (seat) {
        xRef.current = seat.x
        zRef.current = seat.z
        rotationYRef.current = seat.rotationY
      }
      setNearestEmptySeatIndex(null)
    } else if (moving) {
      const worldX = rightX * movement.x + forwardX * -movement.y
      const worldZ = rightZ * movement.x + forwardZ * -movement.y
      const nextX = xRef.current + worldX * LEARN_ART.moveSpeed * dt
      const nextZ = zRef.current + worldZ * LEARN_ART.moveSpeed * dt
      const resolved = resolveLearnArtMovement(xRef.current, zRef.current, nextX, nextZ)
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

    setLearnArtPlayerWorld(xRef.current, zRef.current)

    const group = groupRef.current
    if (group) {
      const groundY = LEARN_ART.playerGroundY
      group.position.set(xRef.current, effectivelySitting ? LEARN_ART_SEAT_Y : groundY, zRef.current)
      group.rotation.y = rotationYRef.current
      if (!effectivelySitting) {
        group.position.y =
          groundY +
          (moving ? Math.abs(Math.sin(localTimeRef.current * WALK_BOB_FREQUENCY)) * 0.022 : 0)
      }
    }

    if (effectivelySitting) {
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
    const flatDist = Math.hypot(LEARN_ART.cameraFollow.x, LEARN_ART.cameraFollow.z)
    const orbitDist = flatDist * Math.cos(pitch)
    const offsetX = Math.sin(lookYaw) * orbitDist
    const offsetZ = Math.cos(lookYaw) * orbitDist
    const offsetY = LEARN_ART.cameraFollow.y + Math.sin(pitch) * flatDist

    // 左右・入口側の壁ではカメラを部屋に押し込めない。壁の裏まで回り込み、
    // 間に入った壁は CameraOcclusionFader が透かす（押し込めると向きが不自然になる）。
    // 奥（スクリーン側）だけは、映像の重ね合わせがずれないよう手前に留める。
    const camX = xRef.current + offsetX
    const camZ = Math.max(zRef.current + offsetZ, LEARN_ART.roomMinZ + 2.5)
    cameraPosition.set(camX, offsetY, camZ)
    cameraTarget.set(xRef.current, LEARN_ART.cameraLookY, zRef.current)
    state.camera.position.lerp(cameraPosition, 1 - Math.exp(-dt * 8))
    state.camera.lookAt(cameraTarget)
  })

  return (
    <group
      ref={groupRef}
      position={[LEARN_ART.playerStart.x, LEARN_ART.playerGroundY, LEARN_ART.playerStart.z]}
      rotation={[0, LEARN_ART.playerStart.rotationY, 0]}
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
