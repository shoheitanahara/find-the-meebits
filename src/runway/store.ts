import { create } from 'zustand'
import type { MeebitTraitMap } from '../data/meebitTraits'
import { getLocale } from '../i18n/locale'
import { recordRunwayVisit } from '../park/dailyRecords'
import type { DailyThemeTrait } from '../top/dailyFeatured'
import { formatRunwayThemeLabel } from './dailyRunway'

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
  emptySeatIndices: number[]
  roamerIds: number[]
  /** 着席中の座席 index。null なら立位 */
  playerSeatIndex: number | null
  /** 近くの空席（Sit 表示用） */
  nearestEmptySeatIndex: number | null
  start: (payload: {
    themeTrait: DailyThemeTrait
    matchingIds: number[]
    audienceIds: number[]
    emptySeatIndices: number[]
    roamerIds: number[]
  }) => void
  setOnScreen: (model: RunwayShowModel | null) => void
  pushRecentId: (meebitNumber: number) => void
  pickNextModelId: () => number | null
  setNearestEmptySeatIndex: (seatIndex: number | null) => void
  sitAtSeat: (seatIndex: number) => void
  standUp: () => void
}

export const useRunwayStore = create<RunwayState>((set, get) => ({
  phase: 'title',
  themeTrait: null,
  onScreen: null,
  matchingIds: [],
  recentIds: [],
  audienceIds: [],
  emptySeatIndices: [],
  roamerIds: [],
  playerSeatIndex: null,
  nearestEmptySeatIndex: null,
  start: ({ themeTrait, matchingIds, audienceIds, emptySeatIndices, roamerIds }) => {
    recordRunwayVisit(formatRunwayThemeLabel(themeTrait, getLocale()))
    set({
      phase: 'playing',
      themeTrait,
      matchingIds,
      audienceIds,
      emptySeatIndices,
      roamerIds,
      recentIds: [],
      onScreen: null,
      playerSeatIndex: null,
      nearestEmptySeatIndex: null,
    })
  },
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
  setNearestEmptySeatIndex: (nearestEmptySeatIndex) =>
    set((state) =>
      state.nearestEmptySeatIndex === nearestEmptySeatIndex
        ? state
        : { nearestEmptySeatIndex },
    ),
  sitAtSeat: (seatIndex) => {
    const { emptySeatIndices, playerSeatIndex } = get()
    if (playerSeatIndex !== null) return
    if (!emptySeatIndices.includes(seatIndex)) return
    set({ playerSeatIndex: seatIndex, nearestEmptySeatIndex: null })
  },
  standUp: () => set({ playerSeatIndex: null }),
}))
