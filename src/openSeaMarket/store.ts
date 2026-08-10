import { create } from 'zustand'
import type { ListedMeebit } from '../opensea/types'

export type MarketBootPhase = 'loading' | 'ready'

type MarketState = {
  bootPhase: MarketBootPhase
  playerVrmReady: boolean
  walkersExpected: number
  walkersReadyCount: number
  listings: ListedMeebit[]
  /** セッション固定の出現メンバー */
  sessionListings: ListedMeebit[]
  listingsLoaded: boolean
  listingsError: string | null
  nearestTalkTokenId: number | null
  resetBoot: () => void
  setListings: (
    listings: ListedMeebit[],
    sessionListings: ListedMeebit[],
    error?: string | null,
  ) => void
  setPlayerVrmReady: (ready: boolean) => void
  setWalkersExpected: (n: number) => void
  setWalkerVrmReady: (index: number) => void
  /** walker 待ちで固まらないよう強制 ready */
  forceReady: () => void
  setNearestTalkTokenId: (tokenId: number | null) => void
}

const readyWalkerIndices = new Set<number>()

function computeBootPhase(state: {
  listingsLoaded: boolean
  playerVrmReady: boolean
  walkersReadyCount: number
  walkersExpected: number
}): MarketBootPhase {
  if (!state.listingsLoaded) return 'loading'
  if (!state.playerVrmReady) return 'loading'
  if (state.walkersReadyCount < state.walkersExpected) return 'loading'
  return 'ready'
}

export const useOpenSeaMarketStore = create<MarketState>((set, get) => ({
  bootPhase: 'loading',
  playerVrmReady: false,
  walkersExpected: 0,
  walkersReadyCount: 0,
  listings: [],
  sessionListings: [],
  listingsLoaded: false,
  listingsError: null,
  nearestTalkTokenId: null,

  resetBoot: () => {
    readyWalkerIndices.clear()
    set({
      bootPhase: 'loading',
      playerVrmReady: false,
      walkersExpected: 0,
      walkersReadyCount: 0,
      listings: [],
      sessionListings: [],
      listingsLoaded: false,
      listingsError: null,
      nearestTalkTokenId: null,
    })
  },

  setListings: (listings, sessionListings, error = null) => {
    const next = {
      ...get(),
      listings,
      sessionListings,
      listingsLoaded: true,
      listingsError: error,
      walkersExpected: sessionListings.length,
      walkersReadyCount: 0,
    }
    readyWalkerIndices.clear()
    set({
      listings,
      sessionListings,
      listingsLoaded: true,
      listingsError: error,
      walkersExpected: sessionListings.length,
      walkersReadyCount: 0,
      bootPhase: computeBootPhase(next),
    })
  },

  setPlayerVrmReady: (playerVrmReady) => {
    const next = { ...get(), playerVrmReady }
    set({ playerVrmReady, bootPhase: computeBootPhase(next) })
  },

  setWalkersExpected: (walkersExpected) => {
    const next = { ...get(), walkersExpected }
    set({ walkersExpected, bootPhase: computeBootPhase(next) })
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

  setNearestTalkTokenId: (nearestTalkTokenId) => set({ nearestTalkTokenId }),
}))
