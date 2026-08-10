import { create } from 'zustand'
import type { ListedMeebit } from '../opensea/types'

export type MarketBootPhase = 'loading' | 'ready'

type MarketState = {
  bootPhase: MarketBootPhase
  playerVrmReady: boolean
  pedestalsExpected: number
  pedestalsReadyCount: number
  walkersExpected: number
  walkersReadyCount: number
  listings: ListedMeebit[]
  /** 台座展示（出品） */
  sessionPedestalListings: ListedMeebit[]
  /** 案内歩行NPC（listing 非紐づけ） */
  sessionWalkerIds: number[]
  listingsLoaded: boolean
  listingsError: string | null
  nearestTalkTokenId: number | null
  /** listing = 台座彫刻 / guide = 歩行案内NPC */
  nearestTalkKind: 'listing' | 'guide' | null
  resetBoot: () => void
  setSession: (
    listings: ListedMeebit[],
    sessionPedestalListings: ListedMeebit[],
    sessionWalkerIds: number[],
    error?: string | null,
  ) => void
  setPlayerVrmReady: (ready: boolean) => void
  setPedestalVrmReady: (index: number) => void
  setWalkerVrmReady: (index: number) => void
  forceReady: () => void
  setNearestTalkTarget: (
    tokenId: number | null,
    kind?: 'listing' | 'guide' | null,
  ) => void
}

const readyPedestalIndices = new Set<number>()
const readyWalkerIndices = new Set<number>()

function computeBootPhase(state: {
  listingsLoaded: boolean
  playerVrmReady: boolean
  pedestalsReadyCount: number
  pedestalsExpected: number
  walkersReadyCount: number
  walkersExpected: number
}): MarketBootPhase {
  if (!state.listingsLoaded) return 'loading'
  if (!state.playerVrmReady) return 'loading'
  if (state.pedestalsReadyCount < state.pedestalsExpected) return 'loading'
  if (state.walkersReadyCount < state.walkersExpected) return 'loading'
  return 'ready'
}

export const useOpenSeaMarketStore = create<MarketState>((set, get) => ({
  bootPhase: 'loading',
  playerVrmReady: false,
  pedestalsExpected: 0,
  pedestalsReadyCount: 0,
  walkersExpected: 0,
  walkersReadyCount: 0,
  listings: [],
  sessionPedestalListings: [],
  sessionWalkerIds: [],
  listingsLoaded: false,
  listingsError: null,
  nearestTalkTokenId: null,
  nearestTalkKind: null,

  resetBoot: () => {
    readyPedestalIndices.clear()
    readyWalkerIndices.clear()
    set({
      bootPhase: 'loading',
      playerVrmReady: false,
      pedestalsExpected: 0,
      pedestalsReadyCount: 0,
      walkersExpected: 0,
      walkersReadyCount: 0,
      listings: [],
      sessionPedestalListings: [],
      sessionWalkerIds: [],
      listingsLoaded: false,
      listingsError: null,
      nearestTalkTokenId: null,
      nearestTalkKind: null,
    })
  },

  setSession: (listings, sessionPedestalListings, sessionWalkerIds, error = null) => {
    readyPedestalIndices.clear()
    readyWalkerIndices.clear()
    const next = {
      ...get(),
      listings,
      sessionPedestalListings,
      sessionWalkerIds,
      listingsLoaded: true,
      listingsError: error,
      pedestalsExpected: sessionPedestalListings.length,
      pedestalsReadyCount: 0,
      walkersExpected: sessionWalkerIds.length,
      walkersReadyCount: 0,
    }
    set({
      listings,
      sessionPedestalListings,
      sessionWalkerIds,
      listingsLoaded: true,
      listingsError: error,
      pedestalsExpected: sessionPedestalListings.length,
      pedestalsReadyCount: 0,
      walkersExpected: sessionWalkerIds.length,
      walkersReadyCount: 0,
      bootPhase: computeBootPhase(next),
    })
  },

  setPlayerVrmReady: (playerVrmReady) => {
    const next = { ...get(), playerVrmReady }
    set({ playerVrmReady, bootPhase: computeBootPhase(next) })
  },

  setPedestalVrmReady: (index) => {
    readyPedestalIndices.add(index)
    const pedestalsReadyCount = readyPedestalIndices.size
    const next = { ...get(), pedestalsReadyCount }
    set({ pedestalsReadyCount, bootPhase: computeBootPhase(next) })
  },

  setWalkerVrmReady: (index) => {
    readyWalkerIndices.add(index)
    const walkersReadyCount = readyWalkerIndices.size
    const next = { ...get(), walkersReadyCount }
    set({ walkersReadyCount, bootPhase: computeBootPhase(next) })
  },

  forceReady: () => {
    set({ bootPhase: 'ready', listingsLoaded: true })
  },

  setNearestTalkTarget: (tokenId, kind = null) =>
    set({
      nearestTalkTokenId: tokenId,
      nearestTalkKind: tokenId == null ? null : kind,
    }),
}))
