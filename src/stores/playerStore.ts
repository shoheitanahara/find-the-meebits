import { create } from 'zustand'
import { DEFAULT_PLAYER_MEEBIT_ID, PLAYER_START_POSITION } from '../game/gameConfig'
import type { Vector3Tuple } from '../types/game'

type PlayerState = {
  meebitNumber: number
  position: Vector3Tuple
  rotationY: number
  isMoving: boolean
  isRunning: boolean
  movementLocked: boolean
  setMeebitNumber: (meebitNumber: number) => void
  setPlayerTransform: (position: Vector3Tuple, rotationY: number) => void
  setMovementState: (isMoving: boolean, isRunning: boolean) => void
  setMovementLocked: (movementLocked: boolean) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  meebitNumber: DEFAULT_PLAYER_MEEBIT_ID,
  position: [PLAYER_START_POSITION[0], PLAYER_START_POSITION[1], PLAYER_START_POSITION[2]],
  rotationY: Math.PI,
  isMoving: false,
  isRunning: false,
  movementLocked: false,
  setMeebitNumber: (meebitNumber) => set({ meebitNumber }),
  setPlayerTransform: (position, rotationY) => set({ position, rotationY }),
  setMovementState: (isMoving, isRunning) => set({ isMoving, isRunning }),
  setMovementLocked: (movementLocked) => set({ movementLocked }),
}))
