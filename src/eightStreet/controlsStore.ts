import { create } from 'zustand'

type EightStreetControlsState = {
  moveX: number
  moveY: number
  /** Accumulated touch-drag look deltas (pixels); consumed each frame. */
  lookDeltaX: number
  lookDeltaY: number
  /** Mobile: true when move stick is near the edge */
  sprint: boolean
  setMove: (x: number, y: number, sprint?: boolean) => void
  resetMove: () => void
  addLookDelta: (dx: number, dy: number) => void
  consumeLookDelta: () => { lookDeltaX: number; lookDeltaY: number }
}

export const useEightStreetControlsStore = create<EightStreetControlsState>((set, get) => ({
  moveX: 0,
  moveY: 0,
  lookDeltaX: 0,
  lookDeltaY: 0,
  sprint: false,
  setMove: (moveX, moveY, sprint = false) => set({ moveX, moveY, sprint }),
  resetMove: () => set({ moveX: 0, moveY: 0, sprint: false }),
  addLookDelta: (dx, dy) =>
    set((state) => ({
      lookDeltaX: state.lookDeltaX + dx,
      lookDeltaY: state.lookDeltaY + dy,
    })),
  consumeLookDelta: () => {
    const { lookDeltaX, lookDeltaY } = get()
    if (lookDeltaX !== 0 || lookDeltaY !== 0) {
      set({ lookDeltaX: 0, lookDeltaY: 0 })
    }
    return { lookDeltaX, lookDeltaY }
  },
}))
