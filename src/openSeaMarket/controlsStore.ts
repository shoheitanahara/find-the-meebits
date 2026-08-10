import { create } from 'zustand'

type ControlsState = {
  lookDeltaX: number
  lookDeltaY: number
  addLookDelta: (dx: number, dy: number) => void
  consumeLookDelta: () => { lookDeltaX: number; lookDeltaY: number }
}

export const useOpenSeaMarketControlsStore = create<ControlsState>((set, get) => ({
  lookDeltaX: 0,
  lookDeltaY: 0,
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
