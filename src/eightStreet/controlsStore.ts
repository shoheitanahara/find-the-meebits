import { create } from 'zustand'

type EightStreetControlsState = {
  moveX: number
  moveY: number
  lookX: number
  lookY: number
  /** Mobile: true when move stick is near the edge */
  sprint: boolean
  setMove: (x: number, y: number, sprint?: boolean) => void
  resetMove: () => void
  setLook: (x: number, y: number) => void
  resetLook: () => void
}

export const useEightStreetControlsStore = create<EightStreetControlsState>((set) => ({
  moveX: 0,
  moveY: 0,
  lookX: 0,
  lookY: 0,
  sprint: false,
  setMove: (moveX, moveY, sprint = false) => set({ moveX, moveY, sprint }),
  resetMove: () => set({ moveX: 0, moveY: 0, sprint: false }),
  setLook: (lookX, lookY) => set({ lookX, lookY }),
  resetLook: () => set({ lookX: 0, lookY: 0 }),
}))
