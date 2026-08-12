import { create } from 'zustand'
import type { ListedMeebit } from '../opensea/types'
import { setMarketGalleryGateOpenings } from './collisions'
import { OPEN_SEA_MARKET } from './config'
import { pickInitialRoomIndex } from './pickSessionListings'

export type MarketBootPhase = 'loading' | 'ready'

export type MarketRoomIndex = 0 | 1 | 2

/** どちらのゲートから入室したか（到着スポーン用） */
export type MarketGateEntry = 'fromWest' | 'fromEast'

export type MarketSpawnPose = {
  x: number
  z: number
  rotationY: number
}

function spawnPoseForEntry(entry: MarketGateEntry | null): MarketSpawnPose {
  const { playerStart, roomHalfX, galleryGate } = OPEN_SEA_MARKET
  if (entry === 'fromEast') {
    // 東ゲートから入室 → 部屋の右下手前（+X / +Z）、中央（-X）へ向く
    return {
      x: roomHalfX - galleryGate.spawnInsetX,
      z: galleryGate.spawnZ,
      rotationY: -Math.PI / 2,
    }
  }
  if (entry === 'fromWest') {
    // 西ゲートから入室 → 部屋の左下手前（-X / +Z）、中央（+X）へ向く
    return {
      x: -roomHalfX + galleryGate.spawnInsetX,
      z: galleryGate.spawnZ,
      rotationY: Math.PI / 2,
    }
  }
  return { ...playerStart }
}

type MarketState = {
  bootPhase: MarketBootPhase
  playerVrmReady: boolean
  pedestalsExpected: number
  pedestalsReadyCount: number
  walkersExpected: number
  walkersReadyCount: number
  listings: ListedMeebit[]
  /** 西・MAIN・東（長さ roomCount。欠室は []） */
  sessionGalleries: ListedMeebit[][]
  activeRoomIndex: MarketRoomIndex
  /** 現在ギャラリーの台座（sessionGalleries[activeRoomIndex]） */
  sessionPedestalListings: ListedMeebit[]
  /** 案内歩行NPC（listing 非紐づけ） */
  sessionWalkerIds: number[]
  listingsLoaded: boolean
  listingsError: string | null
  nearestTalkTokenId: number | null
  /** listing = 台座彫刻 / guide = 歩行案内NPC */
  nearestTalkKind: 'listing' | 'guide' | null
  /** ギャラリー切替中（フェード＋台座再ロード） */
  isSwitchingGallery: boolean
  /** プレイヤーをスポーンへ戻す合図 */
  spawnRevision: number
  /** 直近のギャラリー入室スポーン */
  pendingSpawn: MarketSpawnPose
  resetBoot: () => void
  setSession: (
    listings: ListedMeebit[],
    sessionGalleries: ListedMeebit[][],
    sessionWalkerIds: number[],
    error?: string | null,
  ) => void
  setActiveRoom: (roomIndex: MarketRoomIndex, entry?: MarketGateEntry | null) => void
  finishGallerySwitch: () => void
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

function emptyGalleries(): ListedMeebit[][] {
  return Array.from({ length: OPEN_SEA_MARKET.roomCount }, () => [])
}

function asRoomIndex(index: number): MarketRoomIndex {
  if (index <= 0) return 0
  if (index >= 2) return 2
  return 1
}

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
  sessionGalleries: emptyGalleries(),
  activeRoomIndex: asRoomIndex(OPEN_SEA_MARKET.defaultRoomIndex),
  sessionPedestalListings: [],
  sessionWalkerIds: [],
  listingsLoaded: false,
  listingsError: null,
  nearestTalkTokenId: null,
  nearestTalkKind: null,
  isSwitchingGallery: false,
  spawnRevision: 0,
  pendingSpawn: { ...OPEN_SEA_MARKET.playerStart },

  resetBoot: () => {
    readyPedestalIndices.clear()
    readyWalkerIndices.clear()
    setMarketGalleryGateOpenings({ west: false, east: false, entrance: false })
    set({
      bootPhase: 'loading',
      playerVrmReady: false,
      pedestalsExpected: 0,
      pedestalsReadyCount: 0,
      walkersExpected: 0,
      walkersReadyCount: 0,
      listings: [],
      sessionGalleries: emptyGalleries(),
      activeRoomIndex: asRoomIndex(OPEN_SEA_MARKET.defaultRoomIndex),
      sessionPedestalListings: [],
      sessionWalkerIds: [],
      listingsLoaded: false,
      listingsError: null,
      nearestTalkTokenId: null,
      nearestTalkKind: null,
      isSwitchingGallery: false,
      spawnRevision: 0,
      pendingSpawn: { ...OPEN_SEA_MARKET.playerStart },
    })
  },

  setSession: (listings, sessionGalleries, sessionWalkerIds, error = null) => {
    readyPedestalIndices.clear()
    readyWalkerIndices.clear()
    const galleries =
      sessionGalleries.length >= OPEN_SEA_MARKET.roomCount
        ? sessionGalleries.slice(0, OPEN_SEA_MARKET.roomCount)
        : [
            ...sessionGalleries,
            ...emptyGalleries().slice(sessionGalleries.length),
          ]
    const activeRoomIndex = asRoomIndex(pickInitialRoomIndex(galleries))
    const sessionPedestalListings = galleries[activeRoomIndex] ?? []
    const westOpen =
      activeRoomIndex > 0 && (galleries[activeRoomIndex - 1]?.length ?? 0) > 0
    const eastOpen =
      activeRoomIndex < OPEN_SEA_MARKET.roomCount - 1 &&
      (galleries[activeRoomIndex + 1]?.length ?? 0) > 0
    setMarketGalleryGateOpenings({
      west: westOpen,
      east: eastOpen,
      entrance: activeRoomIndex === OPEN_SEA_MARKET.defaultRoomIndex,
    })
    const next = {
      ...get(),
      listings,
      sessionGalleries: galleries,
      activeRoomIndex,
      sessionPedestalListings,
      sessionWalkerIds,
      listingsLoaded: true,
      listingsError: error,
      pedestalsExpected: sessionPedestalListings.length,
      pedestalsReadyCount: 0,
      walkersExpected: sessionWalkerIds.length,
      walkersReadyCount: 0,
      isSwitchingGallery: false,
    }
    set({
      listings,
      sessionGalleries: galleries,
      activeRoomIndex,
      sessionPedestalListings,
      sessionWalkerIds,
      listingsLoaded: true,
      listingsError: error,
      pedestalsExpected: sessionPedestalListings.length,
      pedestalsReadyCount: 0,
      walkersExpected: sessionWalkerIds.length,
      walkersReadyCount: 0,
      isSwitchingGallery: false,
      nearestTalkTokenId: null,
      nearestTalkKind: null,
      pendingSpawn: { ...OPEN_SEA_MARKET.playerStart },
      bootPhase: computeBootPhase(next),
    })
  },

  setActiveRoom: (roomIndex, entry = null) => {
    const state = get()
    if (state.activeRoomIndex === roomIndex) return
    const listings = state.sessionGalleries[roomIndex] ?? []
    const westOpen =
      roomIndex > 0 && (state.sessionGalleries[roomIndex - 1]?.length ?? 0) > 0
    const eastOpen =
      roomIndex < OPEN_SEA_MARKET.roomCount - 1 &&
      (state.sessionGalleries[roomIndex + 1]?.length ?? 0) > 0
    setMarketGalleryGateOpenings({
      west: westOpen,
      east: eastOpen,
      entrance: roomIndex === OPEN_SEA_MARKET.defaultRoomIndex,
    })
    readyPedestalIndices.clear()
    const pendingSpawn = spawnPoseForEntry(entry)
    set({
      activeRoomIndex: roomIndex,
      sessionPedestalListings: listings,
      pedestalsExpected: listings.length,
      pedestalsReadyCount: 0,
      nearestTalkTokenId: null,
      nearestTalkKind: null,
      isSwitchingGallery: true,
      spawnRevision: state.spawnRevision + 1,
      pendingSpawn,
    })
    if (listings.length === 0) {
      set({ isSwitchingGallery: false })
    }
  },

  finishGallerySwitch: () => set({ isSwitchingGallery: false }),

  setPlayerVrmReady: (playerVrmReady) => {
    const next = { ...get(), playerVrmReady }
    set({ playerVrmReady, bootPhase: computeBootPhase(next) })
  },

  setPedestalVrmReady: (index) => {
    readyPedestalIndices.add(index)
    const pedestalsReadyCount = readyPedestalIndices.size
    const state = get()
    const next = { ...state, pedestalsReadyCount }
    const patch: Partial<MarketState> = {
      pedestalsReadyCount,
      bootPhase: computeBootPhase(next),
    }
    if (
      state.isSwitchingGallery &&
      pedestalsReadyCount >= state.pedestalsExpected
    ) {
      patch.isSwitchingGallery = false
    }
    set(patch)
  },

  setWalkerVrmReady: (index) => {
    readyWalkerIndices.add(index)
    const walkersReadyCount = readyWalkerIndices.size
    const next = { ...get(), walkersReadyCount }
    set({ walkersReadyCount, bootPhase: computeBootPhase(next) })
  },

  forceReady: () => {
    set({ bootPhase: 'ready', listingsLoaded: true, isSwitchingGallery: false })
  },

  setNearestTalkTarget: (tokenId, kind = null) =>
    set({
      nearestTalkTokenId: tokenId,
      nearestTalkKind: tokenId == null ? null : kind,
    }),
}))
