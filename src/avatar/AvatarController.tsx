import { useFrame } from '@react-three/fiber'
import { Vector2 } from 'three'
import { PLAYER_COLLISION_RADIUS, resolveMovement } from '../collision/collision'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { useKeyboardControls } from './useKeyboardControls'

const MOVE_SPEED = 7

const moveVector = new Vector2()

export function AvatarController() {
  const controlsRef = useKeyboardControls()

  useFrame((_, delta) => {
    const controls = controlsRef.current
    const gamePhase = useGameStore.getState().gamePhase
    const player = usePlayerStore.getState()

    const canMove = gamePhase === 'playing' || gamePhase === 'timedOut'

    if (player.movementLocked || !canMove) {
      player.setMovementState(false, false)
      return
    }

    moveVector.set(0, 0)

    if (controls.forward) moveVector.y -= 1
    if (controls.backward) moveVector.y += 1
    if (controls.left) moveVector.x -= 1
    if (controls.right) moveVector.x += 1

    const isMoving = moveVector.lengthSq() > 0

    if (!isMoving) {
      player.setMovementState(false, false)
      return
    }

    moveVector.normalize()

    const nextX = player.position[0] + moveVector.x * MOVE_SPEED * delta
    const nextZ = player.position[2] + moveVector.y * MOVE_SPEED * delta
    const resolved = resolveMovement(
      player.position[0],
      player.position[2],
      nextX,
      nextZ,
      PLAYER_COLLISION_RADIUS,
    )
    const rotationY = Math.atan2(moveVector.x, moveVector.y)

    player.setPlayerTransform([resolved.x, 0, resolved.z], rotationY)
    player.setMovementState(true, true)
  })

  return null
}
