import { PLAYER_START_POSITION } from '../game/gameConfig'
import { usePlayerStore } from '../stores/playerStore'
import type { Vector3Tuple } from '../types/game'

type PlayerWorldState = {
  x: number
  y: number
  z: number
  rotationY: number
  isMoving: boolean
  isRunning: boolean
}

const world: PlayerWorldState = {
  x: PLAYER_START_POSITION[0],
  y: PLAYER_START_POSITION[1],
  z: PLAYER_START_POSITION[2],
  rotationY: Math.PI,
  isMoving: false,
  isRunning: false,
}

let storeSyncTimer = 0
const STORE_SYNC_INTERVAL_SEC = 0.1

export function getPlayerWorldState() {
  return world
}

export function getPlayerWorldPosition(): Vector3Tuple {
  return [world.x, world.y, world.z]
}

export function setPlayerWorldTransform(x: number, z: number, rotationY: number) {
  world.x = x
  world.z = z
  world.rotationY = rotationY
}

export function setPlayerWorldMovement(isMoving: boolean, isRunning: boolean) {
  world.isMoving = isMoving
  world.isRunning = isRunning
}

export function resetPlayerWorldState(position: Vector3Tuple, rotationY: number) {
  world.x = position[0]
  world.y = position[1]
  world.z = position[2]
  world.rotationY = rotationY
  world.isMoving = false
  world.isRunning = false
  storeSyncTimer = 0
  syncPlayerWorldStateToStore(true)
}

export function syncPlayerWorldStateToStore(force = false) {
  usePlayerStore.getState().setPlayerTransform([world.x, world.y, world.z], world.rotationY)
  usePlayerStore.getState().setMovementState(world.isMoving, world.isRunning)
  if (force) {
    storeSyncTimer = 0
  }
}

export function tickPlayerWorldStoreSync(delta: number) {
  const store = usePlayerStore.getState()

  if (world.isMoving !== store.isMoving || world.isRunning !== store.isRunning) {
    syncPlayerWorldStateToStore(true)
    return
  }

  storeSyncTimer += delta
  if (storeSyncTimer < STORE_SYNC_INTERVAL_SEC) {
    return
  }

  storeSyncTimer = 0
  syncPlayerWorldStateToStore()
}
