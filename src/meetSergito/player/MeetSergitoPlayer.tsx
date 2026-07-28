import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, MathUtils, Vector2, Vector3 } from 'three'
import { applyVRMLocomotion } from '../../avatar/VRMLocomotion'
import { useKeyboardControls } from '../../avatar/useKeyboardControls'
import { useVRMModel } from '../../avatar/useVRMModel'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { useDialogueStore } from '../../dialogue/dialogueStore'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { isTouchUiMode } from '../../game/perfConfig'
import { usePlayerStore } from '../../stores/playerStore'
import { useTouchControlsStore } from '../../stores/touchControlsStore'
import { playSfx } from '../../ui/sfx'
import { resolveWorkshopMovement } from '../collisions'
import { MEET_SERGITO, SERGITO_NPC_ID } from '../config'
import { useMeetSergitoControlsStore } from '../controlsStore'
import { setMeetSergitoPlayerWorld } from '../playerWorld'
import { useMeetSergitoStore } from '../store'

const movement = new Vector2()
const cameraPosition = new Vector3()
const cameraTarget = new Vector3()
const playerPosition = new Vector3()
const npcPosition = new Vector3()
const midpoint = new Vector3()
const dialogueDirection = new Vector3()
const dialogueSide = new Vector3()
const dialogueCameraDirectionAlt = new Vector3()
const dialogueCandidatePosition = new Vector3()
const dialogueCameraHeight = new Vector3(0, 2.35, 0)
const dialogueLookAtHeight = new Vector3(0, 1.55, 0)
const mobileDialogueCameraHeight = new Vector3(0, 2.1, 0)
const mobileDialogueLookAtHeight = new Vector3(0, 1.15, 0)
const WALK_STEP_INTERVAL_SEC = 0.25
const WALK_BOB_FREQUENCY = 10.5

export function MeetSergitoPlayer() {
  const { gl } = useThree()
  const groupRef = useRef<Group>(null)
  const xRef = useRef<number>(MEET_SERGITO.playerStart.x)
  const zRef = useRef<number>(MEET_SERGITO.playerStart.z)
  const rotationYRef = useRef<number>(MEET_SERGITO.playerStart.rotationY)
  const lookYawRef = useRef(0)
  const lookPitchRef = useRef(0)
  const lockedRef = useRef(false)
  const localTimeRef = useRef(0)
  const footstepTimerRef = useRef(0)
  const keys = useKeyboardControls()
  const movementLocked = usePlayerStore((state) => state.movementLocked)
  const bootPhase = useMeetSergitoStore((state) => state.bootPhase)
  const setPlayerVrmReady = useMeetSergitoStore((state) => state.setPlayerVrmReady)
  const meebitNumber = usePlayerStore((state) => state.meebitNumber)
  const { vrmRef, vrmScene, status, update } = useVRMModel(meebitNumber, true, 0, true, true)
  const controlsLocked = movementLocked || bootPhase !== 'ready'

  useEffect(() => {
    if (status === 'error' || (status === 'ready' && vrmScene)) {
      setPlayerVrmReady(true)
    }
  }, [setPlayerVrmReady, status, vrmScene])

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!lockedRef.current) return
      if (useMeetSergitoStore.getState().bootPhase !== 'ready') return
      lookYawRef.current -= event.movementX * MEET_SERGITO.mouseLookSensitivity
      lookPitchRef.current = MathUtils.clamp(
        lookPitchRef.current + event.movementY * MEET_SERGITO.mouseLookSensitivity,
        -MEET_SERGITO.orbitPitchMaxDown,
        MEET_SERGITO.orbitPitchMaxUp,
      )
    }
    const onClick = () => {
      if (useMeetSergitoStore.getState().bootPhase !== 'ready') return
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
  }, [gl])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    localTimeRef.current += dt

    const look = useMeetSergitoControlsStore.getState().consumeLookDelta()
    if (!controlsLocked && (look.lookDeltaX !== 0 || look.lookDeltaY !== 0)) {
      const sens = MEET_SERGITO.touchLookSensitivity
      lookYawRef.current -= look.lookDeltaX * sens
      lookPitchRef.current = MathUtils.clamp(
        lookPitchRef.current + look.lookDeltaY * sens,
        -MEET_SERGITO.orbitPitchMaxDown,
        MEET_SERGITO.orbitPitchMaxUp,
      )
    }

    const keyboard = keys.current
    const touch = useTouchControlsStore.getState()

    movement.set(0, 0)
    if (!controlsLocked) {
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

    const moving = !controlsLocked && movement.lengthSq() > 0.01
    const lookYaw = lookYawRef.current
    const forwardX = -Math.sin(lookYaw)
    const forwardZ = -Math.cos(lookYaw)
    const rightX = Math.cos(lookYaw)
    const rightZ = -Math.sin(lookYaw)

    if (moving) {
      const worldX = rightX * movement.x + forwardX * -movement.y
      const worldZ = rightZ * movement.x + forwardZ * -movement.y
      const nextX = xRef.current + worldX * MEET_SERGITO.moveSpeed * dt
      const nextZ = zRef.current + worldZ * MEET_SERGITO.moveSpeed * dt
      const resolved = resolveWorkshopMovement(xRef.current, zRef.current, nextX, nextZ)
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

    setMeetSergitoPlayerWorld(xRef.current, zRef.current)

    const group = groupRef.current
    if (group) {
      const groundY = MEET_SERGITO.playerGroundY
      group.position.set(xRef.current, groundY, zRef.current)
      group.rotation.y = rotationYRef.current
      group.position.y =
        groundY + (moving ? Math.abs(Math.sin(localTimeRef.current * WALK_BOB_FREQUENCY)) * 0.022 : 0)
    }

    applyVRMLocomotion(vrmRef.current, {
      elapsedTime: localTimeRef.current,
      isMoving: moving,
      isRunning: moving,
      idleOffset: 0.2,
      walkPhaseOffset: 0.15,
    })
    update(dt)

    const dialogue = useDialogueStore.getState()
    const isMobile = isTouchUiMode()
    const groundY = MEET_SERGITO.playerGroundY

    if (dialogue.isOpen && dialogue.activeNpcId === SERGITO_NPC_ID) {
      playerPosition.set(xRef.current, groundY, zRef.current)
      npcPosition.set(MEET_SERGITO.sergito.x, groundY, MEET_SERGITO.sergito.z)
      midpoint.copy(playerPosition).add(npcPosition).multiplyScalar(0.5)
      dialogueDirection.copy(playerPosition).sub(npcPosition)

      if (dialogueDirection.lengthSq() < 0.001) {
        dialogueDirection.set(0, 0, 1)
      }

      dialogueDirection.normalize()
      dialogueSide.set(-dialogueDirection.z, 0, dialogueDirection.x).normalize()

      const sideScale = isMobile ? 0.55 : 0.72
      const forwardScale = isMobile ? 0.35 : 0.48
      const cameraDistance = isMobile ? 5.8 : 4.6
      const camHeight = isMobile ? mobileDialogueCameraHeight : dialogueCameraHeight
      const lookHeight = isMobile ? mobileDialogueLookAtHeight : dialogueLookAtHeight

      let bestScore = Number.POSITIVE_INFINITY

      for (const sideSign of [-1, 1] as const) {
        dialogueCameraDirectionAlt
          .copy(dialogueSide)
          .multiplyScalar(sideSign * sideScale)
          .addScaledVector(dialogueDirection, forwardScale)
          .normalize()

        dialogueCandidatePosition
          .copy(midpoint)
          .addScaledVector(dialogueCameraDirectionAlt, cameraDistance)
          .add(camHeight)

        const travelCost = dialogueCandidatePosition.distanceToSquared(state.camera.position)
        const cameraSideBias =
          dialogueCandidatePosition.z < midpoint.z ? 18 : dialogueCandidatePosition.z > midpoint.z ? -2 : 0
        const score = travelCost + cameraSideBias

        if (score < bestScore) {
          bestScore = score
          cameraPosition.copy(dialogueCandidatePosition)
        }
      }

      cameraTarget.copy(midpoint).add(lookHeight)
      state.camera.position.lerp(cameraPosition, 1 - Math.exp(-dt * 8))
      state.camera.lookAt(cameraTarget)
      return
    }

    const pitch = lookPitchRef.current
    const flatDist = Math.hypot(MEET_SERGITO.cameraFollow.x, MEET_SERGITO.cameraFollow.z)
    const orbitDist = flatDist * Math.cos(pitch)
    const offsetX = Math.sin(lookYaw) * orbitDist
    const offsetZ = Math.cos(lookYaw) * orbitDist
    const offsetY = MEET_SERGITO.cameraFollow.y + Math.sin(pitch) * flatDist

    const camX = MathUtils.clamp(
      xRef.current + offsetX,
      -MEET_SERGITO.roomHalfX + 1.0,
      MEET_SERGITO.roomHalfX - 1.0,
    )
    const camZ = MathUtils.clamp(
      zRef.current + offsetZ,
      MEET_SERGITO.roomMinZ + 2.5,
      MEET_SERGITO.roomMaxZ - 1.0,
    )
    cameraPosition.set(camX, offsetY, camZ)
    cameraTarget.set(xRef.current, MEET_SERGITO.cameraLookY, zRef.current)
    state.camera.position.lerp(cameraPosition, 1 - Math.exp(-dt * 8))
    state.camera.lookAt(cameraTarget)
  })

  return (
    <group
      ref={groupRef}
      position={[MEET_SERGITO.playerStart.x, MEET_SERGITO.playerGroundY, MEET_SERGITO.playerStart.z]}
      rotation={[0, MEET_SERGITO.playerStart.rotationY, 0]}
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
