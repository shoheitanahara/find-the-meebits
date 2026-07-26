import { create } from 'zustand'
import type { MeebitTraitMap } from '../data/meebitTraits'
import type { DailyThemeTrait } from '../top/dailyFeatured'

export type RunwayPhase = 'title' | 'playing'

export type RunwayShowModel = {
  meebitNumber: number
  traits: MeebitTraitMap
}

type RunwayState = {
  phase: RunwayPhase
  themeTrait: DailyThemeTrait | null
  /** 背面スクリーン表示中のモデル */
  onScreen: RunwayShowModel | null
  matchingIds: number[]
  recentIds: number[]
  audienceIds: number[]
  roamerIds: number[]
  start: (payload: {
    themeTrait: DailyThemeTrait
    matchingIds: number[]
    audienceIds: number[]
    roamerIds: number[]
  }) => void
  setOnScreen: (model: RunwayShowModel | null) => void
  pushRecentId: (meebitNumber: number) => void
  pickNextModelId: () => number | null
}

export const useRunwayStore = create<RunwayState>((set, get) => ({
  phase: 'title',
  themeTrait: null,
  onScreen: null,
  matchingIds: [],
  recentIds: [],
  audienceIds: [],
  roamerIds: [],
  start: ({ themeTrait, matchingIds, audienceIds, roamerIds }) =>
    set({
      phase: 'playing',
      themeTrait,
      matchingIds,
      audienceIds,
      roamerIds,
      recentIds: [],
      onScreen: null,
    }),
  setOnScreen: (onScreen) => set({ onScreen }),
  pushRecentId: (meebitNumber) =>
    set((state) => ({
      recentIds: [...state.recentIds.slice(-11), meebitNumber],
    })),
  pickNextModelId: () => {
    const { matchingIds, recentIds } = get()
    if (matchingIds.length === 0) return null
    const recent = new Set(recentIds)
    const fresh = matchingIds.filter((id) => !recent.has(id))
    const pool = fresh.length > 0 ? fresh : matchingIds
    return pool[Math.floor(Math.random() * pool.length)] ?? null
  },
}))
