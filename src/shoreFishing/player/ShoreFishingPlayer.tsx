import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Vector2 } from 'three'
import { applyVRMFishingPose } from '../../avatar/VRMLocomotion'
import { useKeyboardControls } from '../../avatar/useKeyboardControls'
import { useVRMModel } from '../../avatar/useVRMModel'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { usePlayerStore } from '../../stores/playerStore'
import { useTouchControlsStore } from '../../stores/touchControlsStore'
import { playSfx } from '../../ui/sfx'
import { resolveIslandMovement } from '../collisions'
import { isNearShore, SHORE_FISHING } from '../config'
import { resetShorePlayerWorld, setShorePlayerWorld } from '../playerWorld'
import { isShoreFishingBusy, useShoreFishingStore } from '../store'
import {
  FishingRod,
  castWindupRatio,
  fishingActionFromCast,
  fishingActionT,
} from '../world/FishingTackle'

const movement = new Vector2()
const WALK_STEP_INTERVAL_SEC = 0.25
const WALK_BOB_FREQUENCY = 10.5

/** 孤島をパークと同じ WASD / ジョイスティックで歩く。竿は常に右手。 */
export function ShoreFishingPlayer() {
  const groupRef = useRef<Group>(null)
  const xRef = useRef(SHORE_FISHING.playerStart.x)
  const zRef = useRef(SHORE_FISHING.playerStart.z)
  const rotationYRef = useRef(SHORE_FISHING.playerStart.rotationY)
  const localTimeRef = useRef(0)
  const footstepTimerRef = useRef(0)
  const keys = useKeyboardControls()
  const sessionKey = useShoreFishingStore((s) => s.sessionKey)
  const meebitNumber = usePlayerStore((state) => state.meebitNumber)
  const movementLocked = usePlayerStore((state) => state.movementLocked)
  const { vrmRef, vrmScene, update } = useVRMModel(meebitNumber, true, 0, true, true)

  useEffect(() => {
    xRef.current = SHORE_FISHING.playerStart.x
    zRef.current = SHORE_FISHING.playerStart.z
    rotationYRef.current = SHORE_FISHING.playerStart.rotationY
    resetShorePlayerWorld()
  }, [sessionKey])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    localTimeRef.current += dt

    const store = useShoreFishingStore.getState()
    const phase = store.phase
    const fishingBusy = isShoreFishingBusy(store.castPhase)
    const canWalk =
      (phase === 'playing' || phase === 'countdown') && !fishingBusy && !movementLocked

    const keyboard = keys.current
    const touch = useTouchControlsStore.getState()
    movement.set(0, 0)

    if (canWalk) {
      if (touch.joystickActive) {
        movement.set(touch.joystickX, touch.joystickY)
      } else {
        if (keyboard.forward) movement.y -= 1
        if (keyboard.backward) movement.y += 1
        if (keyboard.left) movement.x -= 1
        if (keyboard.right) movement.x += 1
      }
    } else if (touch.joystickActive) {
      useTouchControlsStore.getState().resetJoystick()
    }

    const moving = canWalk && movement.lengthSq() > 0.001
    if (moving) {
      movement.normalize()
      const nextX = xRef.current + movement.x * SHORE_FISHING.moveSpeed * dt
      const nextZ = zRef.current + movement.y * SHORE_FISHING.moveSpeed * dt
      const resolved = resolveIslandMovement(xRef.current, zRef.current, nextX, nextZ)
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

    setShorePlayerWorld(xRef.current, zRef.current, rotationYRef.current, moving)
    store.setNearShore(isNearShore(xRef.current, zRef.current))

    const group = groupRef.current
    const groundY = SHORE_FISHING.playerGroundY
    if (group) {
      group.position.set(xRef.current, groundY, zRef.current)
      group.rotation.y = rotationYRef.current
      group.position.y =
        groundY + (moving ? Math.abs(Math.sin(localTimeRef.current * WALK_BOB_FREQUENCY)) * 0.022 : 0)
    }

    const action = fishingActionFromCast(store.castPhase)
    const actionT = fishingActionT(store.castPhase, store.animStartedAt)
    applyVRMFishingPose(vrmRef.current, {
      elapsedTime: localTimeRef.current,
      isMoving: moving,
      isRunning: moving,
      idleOffset: 0.2,
      walkPhaseOffset: 0.15,
      action: phase === 'playing' || phase === 'countdown' ? action : 'carry',
      actionT,
      castWindupRatio: castWindupRatio(),
    })
    update(dt)
  })

  return (
    <group
      ref={groupRef}
      position={[
        SHORE_FISHING.playerStart.x,
        SHORE_FISHING.playerGroundY,
        SHORE_FISHING.playerStart.z,
      ]}
      rotation={[0, SHORE_FISHING.playerStart.rotationY, 0]}
    >
      {vrmScene ? (
        <primitive object={vrmScene} scale={VRM_WORLD_SCALE} />
      ) : (
        <MeebitSilhouette />
      )}
      <FishingRod vrmRef={vrmRef} rootRef={groupRef} />
    </group>
  )
}
