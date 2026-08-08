import { create } from 'zustand'
import { getTabPausedMs, resetTabPauseClock } from '../systems/tabPause'
import {
  castLandingFrom,
  getFishKind,
  getRatingId,
  isNearShore,
  pickFishKindId,
  pickNibbleCount,
  readBestScore,
  SHORE_FISHING,
  writeBestScore,
  type FishKindId,
  type ShoreFishingRatingId,
} from './config'
import { shorePlayerWorld } from './playerWorld'

export type ShorePhase = 'idle' | 'countdown' | 'playing' | 'result'

export type CastPhase =
  | 'ready'
  | 'casting'
  | 'approach'
  | 'nibble'
  | 'bite'
  | 'reeling'
  | 'caught'
  | 'miss'
  | 'cooldown'

export type SessionCatch = {
  id: number
  fishId: FishKindId
  score: number
  atSec: number
}

export type CastPoint = { x: number; y: number; z: number }

type ShoreState = {
  phase: ShorePhase
  castPhase: CastPhase
  score: number
  remainingSec: number
  countdownValue: number
  startedAt: number | null
  ratingId: ShoreFishingRatingId | null
  bestScore: number
  sessionKey: number
  catches: SessionCatch[]
  pendingFishId: FishKindId | null
  nibbleTotal: number
  nibbleIndex: number
  nextEventAt: number | null
  biteUntil: number | null
  animStartedAt: number | null
  lastCatch: SessionCatch | null
  promptFlash: 'none' | 'nibble' | 'bite' | 'catch' | 'miss' | 'empty'
  nearShore: boolean
  bobberLand: CastPoint | null
  castOrigin: { x: number; z: number; rotationY: number } | null
  startGame: () => void
  tickCountdown: (now: number) => void
  tickPlaying: (now: number) => void
  setNearShore: (nearShore: boolean) => void
  tryCast: () => boolean
  /** 着水後：近い影の魚種を確定。null なら空振り */
  claimShadowBite: (fishId: FishKindId | null) => void
  tryHook: () => boolean
  finishGame: () => void
  replay: () => void
  exitToIdle: () => void
}

let catchSeq = 0

function remainingFromStartedAt(startedAt: number, now: number) {
  const elapsed = (now - startedAt - getTabPausedMs()) / 1000
  return Math.max(0, SHORE_FISHING.gameDurationSec - elapsed)
}

function remainingToTenths(remainingSec: number) {
  return Math.ceil(remainingSec * 10) / 10
}

function randRange(min: number, max: number) {
  return min + Math.random() * (max - min)
}

const idleCast = {
  castPhase: 'ready' as const,
  pendingFishId: null,
  nibbleTotal: 0,
  nibbleIndex: 0,
  nextEventAt: null,
  biteUntil: null,
  animStartedAt: null,
  promptFlash: 'none' as const,
  bobberLand: null as CastPoint | null,
  castOrigin: null as { x: number; z: number; rotationY: number } | null,
}

/** 竿を出している間は歩けない */
export function isShoreFishingBusy(castPhase: CastPhase) {
  return castPhase !== 'ready'
}

export const useShoreFishingStore = create<ShoreState>((set, get) => ({
  phase: 'idle',
  castPhase: 'ready',
  score: 0,
  remainingSec: SHORE_FISHING.gameDurationSec,
  countdownValue: SHORE_FISHING.countdownSec,
  startedAt: null,
  ratingId: null,
  bestScore: typeof window !== 'undefined' ? readBestScore() : 0,
  sessionKey: 0,
  catches: [],
  pendingFishId: null,
  nibbleTotal: 0,
  nibbleIndex: 0,
  nextEventAt: null,
  biteUntil: null,
  animStartedAt: null,
  lastCatch: null,
  promptFlash: 'none',
  nearShore: false,
  bobberLand: null,
  castOrigin: null,

  startGame: () => {
    resetTabPauseClock()
    set({
      phase: 'countdown',
      score: 0,
      remainingSec: SHORE_FISHING.gameDurationSec,
      countdownValue: SHORE_FISHING.countdownSec,
      startedAt: performance.now(),
      ratingId: null,
      catches: [],
      lastCatch: null,
      nearShore: false,
      sessionKey: get().sessionKey + 1,
      bestScore: readBestScore(),
      ...idleCast,
    })
  },

  setNearShore: (nearShore) => {
    if (get().nearShore !== nearShore) set({ nearShore })
  },

  tickCountdown: (now) => {
    const { phase, startedAt } = get()
    if (phase !== 'countdown' || startedAt === null) return
    const elapsed = (now - startedAt - getTabPausedMs()) / 1000
    const left = Math.max(0, Math.ceil(SHORE_FISHING.countdownSec - elapsed))
    if (left !== get().countdownValue) set({ countdownValue: left })
    if (elapsed >= SHORE_FISHING.countdownSec) {
      resetTabPauseClock()
      set({
        phase: 'playing',
        startedAt: performance.now(),
        remainingSec: SHORE_FISHING.gameDurationSec,
        countdownValue: 0,
        ...idleCast,
      })
    }
  },

  tickPlaying: (now) => {
    const state = get()
    if (state.phase !== 'playing' || state.startedAt === null) return

    const remainingSec = remainingFromStartedAt(state.startedAt, now)
    if (remainingSec <= 0) {
      get().finishGame()
      return
    }
    const rounded = remainingToTenths(remainingSec)
    if (rounded !== state.remainingSec) set({ remainingSec: rounded })

    const { castPhase, nextEventAt, biteUntil, nibbleIndex, nibbleTotal } = state

    if (castPhase === 'casting' && nextEventAt !== null && now >= nextEventAt) {
      // 着水後は魚が寄るまで待つ（影なしで自動終了しない）
      set({
        castPhase: 'approach',
        nextEventAt: null,
        animStartedAt: null,
        promptFlash: 'none',
      })
      return
    }

    if (castPhase === 'approach' && nextEventAt !== null && now >= nextEventAt) {
      // 影未確定の間は nextEventAt を立てない（待機継続）
      if (!state.pendingFishId) return
      if (nibbleTotal <= 1) {
        set({
          castPhase: 'bite',
          nibbleIndex: 1,
          nextEventAt: null,
          biteUntil: now + SHORE_FISHING.biteWindowSec * 1000,
          promptFlash: 'bite',
        })
      } else {
        set({
          castPhase: 'nibble',
          nibbleIndex: 1,
          nextEventAt:
            now + randRange(SHORE_FISHING.nibbleGapSec.min, SHORE_FISHING.nibbleGapSec.max) * 1000,
          promptFlash: 'nibble',
        })
      }
      return
    }

    if (castPhase === 'nibble' && nextEventAt !== null && now >= nextEventAt) {
      const nextIndex = nibbleIndex + 1
      if (nextIndex >= nibbleTotal) {
        set({
          castPhase: 'bite',
          nibbleIndex: nextIndex,
          nextEventAt: null,
          biteUntil: now + SHORE_FISHING.biteWindowSec * 1000,
          promptFlash: 'bite',
        })
      } else {
        set({
          nibbleIndex: nextIndex,
          nextEventAt:
            now + randRange(SHORE_FISHING.nibbleGapSec.min, SHORE_FISHING.nibbleGapSec.max) * 1000,
          promptFlash: 'nibble',
        })
      }
      return
    }

    if (castPhase === 'bite' && biteUntil !== null && now >= biteUntil) {
      set({
        castPhase: 'miss',
        biteUntil: null,
        nextEventAt: now + SHORE_FISHING.missCooldownSec * 1000,
        pendingFishId: null,
        animStartedAt: null,
        promptFlash: 'miss',
      })
      return
    }

    if (castPhase === 'reeling' && nextEventAt !== null && now >= nextEventAt) {
      set({
        castPhase: 'caught',
        nextEventAt: now + SHORE_FISHING.catchShowSec * 1000,
        animStartedAt: null,
        promptFlash: 'catch',
      })
      return
    }

    if (
      (castPhase === 'caught' || castPhase === 'miss' || castPhase === 'cooldown') &&
      nextEventAt !== null &&
      now >= nextEventAt
    ) {
      set({
        ...idleCast,
        lastCatch: castPhase === 'caught' ? state.lastCatch : null,
      })
    }
  },

  tryCast: () => {
    const { phase, castPhase, nearShore } = get()
    if (phase !== 'playing' || castPhase !== 'ready') return false
    const { x, z, rotationY } = shorePlayerWorld
    if (!nearShore && !isNearShore(x, z)) return false

    const land = castLandingFrom(x, z, rotationY)
    const now = performance.now()
    const castTotalSec = SHORE_FISHING.castWindupSec + SHORE_FISHING.castFlightSec
    // 釣果は着水後、餌に一番近い魚影から決める（ここでは未定）
    set({
      castPhase: 'casting',
      pendingFishId: null,
      nibbleTotal: 0,
      nibbleIndex: 0,
      nextEventAt: now + castTotalSec * 1000,
      biteUntil: null,
      animStartedAt: now,
      lastCatch: null,
      promptFlash: 'none',
      bobberLand: land,
      castOrigin: { x, z, rotationY },
    })
    return true
  },

  /** 近くの魚影が餌に反応したときのセット。null では自動終了しない */
  claimShadowBite: (fishId: FishKindId | null) => {
    const { phase, castPhase, pendingFishId } = get()
    if (phase !== 'playing' || castPhase !== 'approach') return
    if (!fishId || pendingFishId) return
    const now = performance.now()
    const approach =
      randRange(SHORE_FISHING.approachSec.min, SHORE_FISHING.approachSec.max) * 1000
    set({
      pendingFishId: fishId,
      nibbleTotal: pickNibbleCount(),
      nibbleIndex: 0,
      nextEventAt: now + approach,
      promptFlash: 'none',
    })
  },

  tryHook: () => {
    const state = get()
    if (state.phase !== 'playing') return false
    const now = performance.now()

    // 魚が来る前：自分で引けばキャスト取りやめ（自動では終わらない）
    if (state.castPhase === 'approach' && !state.pendingFishId) {
      set({ ...idleCast, lastCatch: null })
      return true
    }

    if (
      state.castPhase === 'nibble' ||
      state.castPhase === 'approach' ||
      state.castPhase === 'casting'
    ) {
      set({
        castPhase: 'miss',
        biteUntil: null,
        nextEventAt: now + SHORE_FISHING.missCooldownSec * 1000,
        pendingFishId: null,
        animStartedAt: null,
        promptFlash: 'miss',
      })
      return false
    }

    if (state.castPhase !== 'bite' || state.biteUntil === null || now > state.biteUntil) {
      return false
    }

    const fishId = state.pendingFishId ?? pickFishKindId()
    const fish = getFishKind(fishId)
    const atSec =
      state.startedAt === null
        ? 0
        : (now - state.startedAt - getTabPausedMs()) / 1000
    const entry: SessionCatch = {
      id: ++catchSeq,
      fishId,
      score: fish.score,
      atSec,
    }
    set({
      castPhase: 'reeling',
      score: state.score + fish.score,
      catches: [...state.catches, entry],
      lastCatch: entry,
      pendingFishId: fishId,
      biteUntil: null,
      animStartedAt: now,
      nextEventAt: now + SHORE_FISHING.reelSec * 1000,
      promptFlash: 'catch',
    })
    return true
  },

  finishGame: () => {
    const { score, bestScore } = get()
    const ratingId = getRatingId(score)
    const nextBest = Math.max(bestScore, score)
    if (nextBest > bestScore) writeBestScore(nextBest)
    set({
      phase: 'result',
      remainingSec: 0,
      ratingId,
      bestScore: nextBest,
      ...idleCast,
    })
  },

  replay: () => {
    get().startGame()
  },

  exitToIdle: () => {
    set({
      phase: 'idle',
      score: 0,
      remainingSec: SHORE_FISHING.gameDurationSec,
      countdownValue: SHORE_FISHING.countdownSec,
      startedAt: null,
      ratingId: null,
      catches: [],
      lastCatch: null,
      nearShore: false,
      ...idleCast,
    })
  },
}))
