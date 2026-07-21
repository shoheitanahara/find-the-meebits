import { create } from 'zustand'

export type AttractionId = 'find' | 'traits' | 'street'

type TopState = {
  started: boolean
  meebitNumber: number
  x: number
  z: number
  rotationY: number
  isMoving: boolean
  nearestAttraction: AttractionId | null
  start: (
    meebitNumber: number,
    spawn?: { x: number; z: number; rotationY: number },
  ) => void
  setMovement: (x: number, z: number, rotationY: number, isMoving: boolean) => void
  setNearestAttraction: (attraction: AttractionId | null) => void
}

export const useTopStore = create<TopState>((set) => ({
  started: false,
  meebitNumber: 4274,
  x: 0,
  z: 8,
  rotationY: Math.PI,
  isMoving: false,
  nearestAttraction: null,
  start: (meebitNumber, spawn) =>
    set({
      started: true,
      meebitNumber,
      x: spawn?.x ?? 0,
      z: spawn?.z ?? 8,
      rotationY: spawn?.rotationY ?? Math.PI,
      isMoving: false,
      nearestAttraction: null,
    }),
  setMovement: (x, z, rotationY, isMoving) =>
    set({ x, z, rotationY, isMoving }),
  setNearestAttraction: (nearestAttraction) => set({ nearestAttraction }),
}))
