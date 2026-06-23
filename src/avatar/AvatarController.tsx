import { useFrame } from '@react-three/fiber'
import { Vector2 } from 'three'
import { PLAYER_COLLISION_RADIUS, resolveMovement } from '../collision/collision'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { useTouchControlsStore } from '../stores/touchControlsStore'
import {
  getPlayerWorldState,
  setPlayerWorldMovement,
  setPlayerWorldTransform,
  syncPlayerWorldStateToStore,
  tickPlayerWorldStoreSync,
} from './playerWorldState'
import { useKeyboardControls } from './useKeyboardControls'

const MOVE_SPEED = 7

const moveVector = new Vector2()

export function AvatarController() {
  const controlsRef = useKeyboardControls()

  useFrame((_, delta) => {
    const controls = controlsRef.current
    const gamePhase = useGameStore.getState().gamePhase
    const player = usePlayerStore.getState()
    const world = getPlayerWorldState()

    const canMove = gamePhase === 'playing' || gamePhase === 'timedOut'

    if (player.movementLocked || !canMove) {
      if (world.isMoving || world.isRunning) {
        setPlayerWorldMovement(false, false)
        syncPlayerWorldStateToStore(true)
      }
      return
    }

    moveVector.set(0, 0)

    const touch = useTouchControlsStore.getState()
    if (touch.joystickActive) {
      moveVector.set(touch.joystickX, touch.joystickY)
    } else {
      if (controls.forward) moveVector.y -= 1
      if (controls.backward) moveVector.y += 1
      if (controls.left) moveVector.x -= 1
      if (controls.right) moveVector.x += 1
    }

    const isMoving = moveVector.lengthSq() > 0

    if (!isMoving) {
      if (world.isMoving || world.isRunning) {
        setPlayerWorldMovement(false, false)
        syncPlayerWorldStateToStore(true)
      }
      return
    }

    moveVector.normalize()

    const nextX = world.x + moveVector.x * MOVE_SPEED * delta
    const nextZ = world.z + moveVector.y * MOVE_SPEED * delta
    const resolved = resolveMovement(
      world.x,
      world.z,
      nextX,
      nextZ,
      PLAYER_COLLISION_RADIUS,
      useGameStore.getState().venueId,
    )
    const rotationY = Math.atan2(moveVector.x, moveVector.y)

    setPlayerWorldTransform(resolved.x, resolved.z, rotationY)
    setPlayerWorldMovement(true, true)
    tickPlayerWorldStoreSync(delta)
  })

  return null
}
