import { create } from 'zustand'
import { MOUNTAIN } from './config'

export type MountainPhase = 'title' | 'playing' | 'cleared'

type MountainState = {
  phase: MountainPhase
  elapsedSec: number
  heightBest: number
  playerY: number
  start: () => void
  clear: () => void
  backToTitle: () => void
  tickElapsed: (dt: number) => void
  reportHeight: (y: number) => void
}

export const useMountainStore = create<MountainState>((set, get) => ({
  phase: 'title',
  elapsedSec: 0,
  heightBest: MOUNTAIN.start.y,
  playerY: MOUNTAIN.start.y,
  start: () =>
    set({
      phase: 'playing',
      elapsedSec: 0,
      heightBest: MOUNTAIN.start.y,
      playerY: MOUNTAIN.start.y,
    }),
  clear: () => set({ phase: 'cleared' }),
  backToTitle: () => set({ phase: 'title', elapsedSec: 0 }),
  tickElapsed: (dt) => {
    if (get().phase !== 'playing') return
    set((state) => ({ elapsedSec: state.elapsedSec + dt }))
  },
  reportHeight: (y) =>
    set((state) => ({
      playerY: y,
      heightBest: Math.max(state.heightBest, y),
    })),
}))
