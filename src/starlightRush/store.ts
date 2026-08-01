import { create } from 'zustand'
import { getTabPausedMs, resetTabPauseClock } from '../systems/tabPause'
import {
  getBaseScore,
  getComboMultiplier,
  getRatingId,
  readBestScore,
  STARLIGHT_RUSH,
  writeBestScore,
  type StarlightRatingId,
} from './config'

export type StarlightPhase = 'idle' | 'countdown' | 'playing' | 'result'

export type FloatingScore = {
  id: number
  points: number
  /** 適用されたコンボ倍率（1 / 1.5 / 2） */
  comboMultiplier: number
  x: number
  y: number
  z: number
  createdAt: number
}

type StarlightState = {
  phase: StarlightPhase
  score: number
  combo: number
  remainingSec: number
  countdownValue: number
  startedAt: number | null
  lastFireAt: number
  aimX: number
  aimY: number
  aimOnTarget: boolean
  fireFlashUntil: number
  recoilUntil: number
  ratingId: StarlightRatingId | null
  bestScore: number
  floatingScores: FloatingScore[]
  sessionKey: number
  startGame: () => void
  tickCountdown: (now: number) => void
  tickPlaying: (now: number) => void
  setAim: (x: number, y: number) => void
  addAimDelta: (dx: number, dy: number) => void
  setAimOnTarget: (onTarget: boolean) => void
  tryFire: () => boolean
  registerHit: (
    kindIndex: number,
    world: { x: number; y: number; z: number },
  ) => number
  registerMiss: () => void
  finishGame: () => void
  replay: () => void
  exitToIdle: () => void
  pruneFloatingScores: (now: number) => void
}

let floatingId = 0

function clampAim(value: number, limit: number) {
  return Math.max(-limit, Math.min(limit, value))
}

function remainingFromStartedAt(startedAt: number, now: number) {
  const elapsed = (now - startedAt - getTabPausedMs()) / 1000
  return Math.max(0, STARLIGHT_RUSH.gameDurationSec - elapsed)
}

function remainingToTenths(remainingSec: number) {
  return Math.ceil(remainingSec * 10) / 10
}

export const useStarlightRushStore = create<StarlightState>((set, get) => ({
  phase: 'idle',
  score: 0,
  combo: 0,
  remainingSec: STARLIGHT_RUSH.gameDurationSec,
  countdownValue: STARLIGHT_RUSH.countdownSec,
  startedAt: null,
  lastFireAt: 0,
  aimX: 0,
  aimY: 0,
  aimOnTarget: false,
  fireFlashUntil: 0,
  recoilUntil: 0,
  ratingId: null,
  bestScore: typeof window !== 'undefined' ? readBestScore() : 0,
  floatingScores: [],
  sessionKey: 0,
  startGame: () => {
    resetTabPauseClock()
    set((state) => ({
      phase: 'countdown',
      score: 0,
      combo: 0,
      remainingSec: STARLIGHT_RUSH.gameDurationSec,
      countdownValue: STARLIGHT_RUSH.countdownSec,
      startedAt: performance.now(),
      lastFireAt: 0,
      aimX: 0,
      aimY: 0,
      aimOnTarget: false,
      fireFlashUntil: 0,
      recoilUntil: 0,
      ratingId: null,
      floatingScores: [],
      sessionKey: state.sessionKey + 1,
      bestScore: readBestScore(),
    }))
  },
  tickCountdown: (now) => {
    const state = get()
    if (state.phase !== 'countdown' || state.startedAt === null) return
    const elapsed = (now - state.startedAt - getTabPausedMs()) / 1000
    const nextValue = Math.ceil(STARLIGHT_RUSH.countdownSec - elapsed)
    if (elapsed >= STARLIGHT_RUSH.countdownSec) {
      resetTabPauseClock()
      set({
        phase: 'playing',
        countdownValue: 0,
        startedAt: performance.now(),
        remainingSec: STARLIGHT_RUSH.gameDurationSec,
      })
      return
    }
    if (nextValue !== state.countdownValue) {
      set({ countdownValue: Math.max(1, nextValue) })
    }
  },
  tickPlaying: (now) => {
    const state = get()
    if (state.phase !== 'playing' || state.startedAt === null) return
    const remaining = remainingFromStartedAt(state.startedAt, now)
    if (remaining <= 0) {
      get().finishGame()
      return
    }
    const remainingTenths = remainingToTenths(remaining)
    if (remainingTenths !== state.remainingSec) {
      set({ remainingSec: remainingTenths })
    }
  },
  setAim: (x, y) =>
    set({
      aimX: clampAim(x, STARLIGHT_RUSH.aimLimitX),
      aimY: clampAim(y, STARLIGHT_RUSH.aimLimitY),
    }),
  addAimDelta: (dx, dy) =>
    set((state) => ({
      aimX: clampAim(state.aimX + dx, STARLIGHT_RUSH.aimLimitX),
      aimY: clampAim(state.aimY + dy, STARLIGHT_RUSH.aimLimitY),
    })),
  setAimOnTarget: (aimOnTarget) =>
    set((state) => (state.aimOnTarget === aimOnTarget ? state : { aimOnTarget })),
  tryFire: () => {
    const state = get()
    if (state.phase !== 'playing') return false
    const now = performance.now()
    if (now - state.lastFireAt < STARLIGHT_RUSH.fireCooldownMs) return false
    set({
      lastFireAt: now,
      fireFlashUntil: now + 90,
      recoilUntil: now + 120,
    })
    return true
  },
  registerHit: (kindIndex, world) => {
    const state = get()
    if (state.phase !== 'playing') return 0

    const nextCombo = state.combo + 1
    const multiplier = getComboMultiplier(nextCombo)
    const base = getBaseScore(kindIndex)
    const points = Math.round(base * multiplier)
    floatingId += 1

    set({
      score: state.score + points,
      combo: nextCombo,
      floatingScores: [
        ...state.floatingScores.slice(-8),
        {
          id: floatingId,
          points,
          comboMultiplier: multiplier,
          x: world.x,
          y: world.y,
          z: world.z,
          createdAt: performance.now(),
        },
      ],
    })
    return points
  },
  registerMiss: () => {
    if (get().phase !== 'playing') return
    set({ combo: 0 })
  },
  finishGame: () => {
    const state = get()
    if (state.phase !== 'playing') return
    const bestScore = writeBestScore(state.score)
    set({
      phase: 'result',
      remainingSec: 0,
      ratingId: getRatingId(state.score),
      bestScore,
      aimOnTarget: false,
      floatingScores: [],
    })
  },
  replay: () => {
    get().startGame()
  },
  exitToIdle: () =>
    set({
      phase: 'idle',
      score: 0,
      combo: 0,
      remainingSec: STARLIGHT_RUSH.gameDurationSec,
      countdownValue: STARLIGHT_RUSH.countdownSec,
      startedAt: null,
      aimX: 0,
      aimY: 0,
      aimOnTarget: false,
      fireFlashUntil: 0,
      recoilUntil: 0,
      ratingId: null,
      floatingScores: [],
      bestScore: readBestScore(),
    }),
  pruneFloatingScores: (now) => {
    const state = get()
    if (state.floatingScores.length === 0) return
    const next = state.floatingScores.filter((item) => now - item.createdAt < 900)
    if (next.length !== state.floatingScores.length) {
      set({ floatingScores: next })
    }
  },
}))
