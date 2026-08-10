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
import { resolveMarketMovement } from '../collisions'
import { OPEN_SEA_MARKET } from '../config'
import { useOpenSeaMarketControlsStore } from '../controlsStore'
import { marketNpcPositions, setOpenSeaMarketPlayerWorld } from '../playerWorld'
import { useOpenSeaMarketStore } from '../store'

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

export function MarketPlayer() {
  const { gl } = useThree()
  const groupRef = useRef<Group>(null)
  const xRef = useRef<number>(OPEN_SEA_MARKET.playerStart.x)
  const zRef = useRef<number>(OPEN_SEA_MARKET.playerStart.z)
  const rotationYRef = useRef<number>(OPEN_SEA_MARKET.playerStart.rotationY)
  const lookYawRef = useRef(0)
  const lookPitchRef = useRef(0)
  const lockedRef = useRef(false)
  const localTimeRef = useRef(0)
  const footstepTimerRef = useRef(0)
  const keys = useKeyboardControls()
  const movementLocked = usePlayerStore((state) => state.movementLocked)
  const bootPhase = useOpenSeaMarketStore((state) => state.bootPhase)
  const setPlayerVrmReady = useOpenSeaMarketStore((state) => state.setPlayerVrmReady)
  const meebitNumber = usePlayerStore((state) => state.meebitNumber)
  const { vrmRef, vrmScene, status, update } = useVRMModel(meebitNumber, true, 0, true, true)
  const controlsLocked = movementLocked || bootPhase !== 'ready'

  useEffect(() => {
    if (status === 'error' || (status === 'ready' && vrmScene)) {
      setPlayerVrmReady(true)
    }
    if (vrmScene) {
      // VRM は cast のみ。receive するとスキン自己影で斜線（shadow acne）が出る
      vrmScene.traverse((obj) => {
        if ('isMesh' in obj && obj.isMesh) {
          obj.castShadow = true
          obj.receiveShadow = false
        }
      })
    }
  }, [setPlayerVrmReady, status, vrmScene])

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!lockedRef.current) return
      if (useOpenSeaMarketStore.getState().bootPhase !== 'ready') return
      lookYawRef.current -= event.movementX * OPEN_SEA_MARKET.mouseLookSensitivity
      lookPitchRef.current = MathUtils.clamp(
        lookPitchRef.current + event.movementY * OPEN_SEA_MARKET.mouseLookSensitivity,
        -OPEN_SEA_MARKET.orbitPitchMaxDown,
        OPEN_SEA_MARKET.orbitPitchMaxUp,
      )
    }
    const onClick = () => {
      if (useOpenSeaMarketStore.getState().bootPhase !== 'ready') return
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

    const look = useOpenSeaMarketControlsStore.getState().consumeLookDelta()
    if (!controlsLocked && (look.lookDeltaX !== 0 || look.lookDeltaY !== 0)) {
      const sens = OPEN_SEA_MARKET.touchLookSensitivity
      lookYawRef.current -= look.lookDeltaX * sens
      lookPitchRef.current = MathUtils.clamp(
        lookPitchRef.current + look.lookDeltaY * sens,
        -OPEN_SEA_MARKET.orbitPitchMaxDown,
        OPEN_SEA_MARKET.orbitPitchMaxUp,
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
      const nextX = xRef.current + worldX * OPEN_SEA_MARKET.moveSpeed * dt
      const nextZ = zRef.current + worldZ * OPEN_SEA_MARKET.moveSpeed * dt
      const resolved = resolveMarketMovement(xRef.current, zRef.current, nextX, nextZ)
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

    setOpenSeaMarketPlayerWorld(xRef.current, zRef.current, rotationYRef.current, moving)

    const group = groupRef.current
    if (group) {
      const groundY = OPEN_SEA_MARKET.playerGroundY
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
    const groundY = OPEN_SEA_MARKET.playerGroundY
    const activeId = dialogue.activeNpcId
    const talkingTokenId =
      dialogue.isOpen && typeof activeId === 'string' && activeId.startsWith('opensea-')
        ? Number(activeId.replace('opensea-', ''))
        : null
    const talkNpcPos =
      talkingTokenId != null && Number.isFinite(talkingTokenId)
        ? marketNpcPositions.get(talkingTokenId)
        : undefined

    if (talkNpcPos) {
      playerPosition.set(xRef.current, groundY, zRef.current)
      npcPosition.set(talkNpcPos.x, groundY, talkNpcPos.z)
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
      const {
        roomHalfX,
        roomMinZ,
        roomMaxZ,
        cameraRoomMarginX,
        cameraRoomMarginZNear,
        cameraRoomMarginZFar,
      } = OPEN_SEA_MARKET
      const camMinX = -roomHalfX + cameraRoomMarginX
      const camMaxX = roomHalfX - cameraRoomMarginX
      const camMinZ = roomMinZ + cameraRoomMarginZNear
      const camMaxZ = roomMaxZ - cameraRoomMarginZFar

      const isCameraInside = (pos: Vector3) =>
        pos.x >= camMinX && pos.x <= camMaxX && pos.z >= camMinZ && pos.z <= camMaxZ

      let bestScore = Number.POSITIVE_INFINITY

      for (const sideSign of [-1, 1] as const) {
        dialogueCameraDirectionAlt
          .copy(dialogueSide)
          .multiplyScalar(sideSign * sideScale)
          .addScaledVector(dialogueDirection, forwardScale)
          .normalize()

        let dist = cameraDistance
        let placedInside = false
        for (let attempt = 0; attempt < 8; attempt += 1) {
          dialogueCandidatePosition
            .copy(midpoint)
            .addScaledVector(dialogueCameraDirectionAlt, dist)
            .add(camHeight)
          if (isCameraInside(dialogueCandidatePosition)) {
            placedInside = true
            break
          }
          dist *= 0.72
        }

        if (!placedInside) {
          dialogueCandidatePosition.x = MathUtils.clamp(
            dialogueCandidatePosition.x,
            camMinX,
            camMaxX,
          )
          dialogueCandidatePosition.z = MathUtils.clamp(
            dialogueCandidatePosition.z,
            camMinZ,
            camMaxZ,
          )
        }

        const travelCost = dialogueCandidatePosition.distanceToSquared(state.camera.position)
        const cameraSideBias =
          dialogueCandidatePosition.z < midpoint.z ? 18 : dialogueCandidatePosition.z > midpoint.z ? -2 : 0
        const shrinkPenalty = (cameraDistance - dist) * 14
        const score = travelCost + cameraSideBias + shrinkPenalty

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
    const flatDist = Math.hypot(OPEN_SEA_MARKET.cameraFollow.x, OPEN_SEA_MARKET.cameraFollow.z)
    const orbitDist = flatDist * Math.cos(pitch)
    const offsetX = Math.sin(lookYaw) * orbitDist
    const offsetZ = Math.cos(lookYaw) * orbitDist
    const offsetY = OPEN_SEA_MARKET.cameraFollow.y + Math.sin(pitch) * flatDist

    const camX = MathUtils.clamp(
      xRef.current + offsetX,
      -OPEN_SEA_MARKET.roomHalfX + OPEN_SEA_MARKET.cameraRoomMarginX,
      OPEN_SEA_MARKET.roomHalfX - OPEN_SEA_MARKET.cameraRoomMarginX,
    )
    const camZ = MathUtils.clamp(
      zRef.current + offsetZ,
      OPEN_SEA_MARKET.roomMinZ + OPEN_SEA_MARKET.cameraRoomMarginZNear,
      OPEN_SEA_MARKET.roomMaxZ - OPEN_SEA_MARKET.cameraRoomMarginZFar,
    )
    cameraPosition.set(camX, offsetY, camZ)
    cameraTarget.set(xRef.current, OPEN_SEA_MARKET.cameraLookY, zRef.current)
    state.camera.position.lerp(cameraPosition, 1 - Math.exp(-dt * 8))
    state.camera.lookAt(cameraTarget)
  })

  return (
    <group
      ref={groupRef}
      position={[
        OPEN_SEA_MARKET.playerStart.x,
        OPEN_SEA_MARKET.playerGroundY,
        OPEN_SEA_MARKET.playerStart.z,
      ]}
      rotation={[0, OPEN_SEA_MARKET.playerStart.rotationY, 0]}
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
