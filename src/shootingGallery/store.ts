import { create } from 'zustand'
import { getTabPausedMs, resetTabPauseClock } from '../systems/tabPause'
import {
  getBaseScore,
  getComboMultiplier,
  getRatingId,
  SHOOTING_GALLERY,
  type ShootingRatingId,
  type TargetKind,
} from './config'

export type ShootingPhase = 'idle' | 'countdown' | 'playing' | 'result'

export type FloatingScore = {
  id: number
  points: number
  x: number
  y: number
  z: number
  createdAt: number
}

type ShootingState = {
  phase: ShootingPhase
  score: number
  combo: number
  remainingSec: number
  countdownValue: number
  startedAt: number | null
  lastFireAt: number
  /** 正規化照準 -1..1（画面中央が 0） */
  aimX: number
  aimY: number
  aimOnTarget: boolean
  fireFlashUntil: number
  recoilUntil: number
  ratingId: ShootingRatingId | null
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
    kind: TargetKind,
    small: boolean,
    bullseye: boolean,
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
  return Math.max(0, SHOOTING_GALLERY.gameDurationSec - elapsed)
}

/** カウントダウン表示用に、残り時間を100ms単位で切り上げる。 */
function remainingToTenths(remainingSec: number) {
  return Math.ceil(remainingSec * 10) / 10
}

export const useShootingGalleryStore = create<ShootingState>((set, get) => ({
  phase: 'idle',
  score: 0,
  combo: 0,
  remainingSec: SHOOTING_GALLERY.gameDurationSec,
  countdownValue: SHOOTING_GALLERY.countdownSec,
  startedAt: null,
  lastFireAt: 0,
  aimX: 0,
  aimY: 0,
  aimOnTarget: false,
  fireFlashUntil: 0,
  recoilUntil: 0,
  ratingId: null,
  floatingScores: [],
  sessionKey: 0,
  startGame: () => {
    resetTabPauseClock()
    set((state) => ({
      phase: 'countdown',
      score: 0,
      combo: 0,
      remainingSec: SHOOTING_GALLERY.gameDurationSec,
      countdownValue: SHOOTING_GALLERY.countdownSec,
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
    }))
  },
  tickCountdown: (now) => {
    const state = get()
    if (state.phase !== 'countdown' || state.startedAt === null) return
    const elapsed = (now - state.startedAt - getTabPausedMs()) / 1000
    const nextValue = Math.ceil(SHOOTING_GALLERY.countdownSec - elapsed)
    if (elapsed >= SHOOTING_GALLERY.countdownSec) {
      resetTabPauseClock()
      set({
        phase: 'playing',
        countdownValue: 0,
        startedAt: performance.now(),
        remainingSec: SHOOTING_GALLERY.gameDurationSec,
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
      aimX: clampAim(x, SHOOTING_GALLERY.aimLimitX),
      aimY: clampAim(y, SHOOTING_GALLERY.aimLimitY),
    }),
  addAimDelta: (dx, dy) =>
    set((state) => ({
      aimX: clampAim(state.aimX + dx, SHOOTING_GALLERY.aimLimitX),
      aimY: clampAim(state.aimY + dy, SHOOTING_GALLERY.aimLimitY),
    })),
  setAimOnTarget: (aimOnTarget) =>
    set((state) => (state.aimOnTarget === aimOnTarget ? state : { aimOnTarget })),
  tryFire: () => {
    const state = get()
    if (state.phase !== 'playing') return false
    const now = performance.now()
    if (now - state.lastFireAt < SHOOTING_GALLERY.fireCooldownMs) return false
    set({
      lastFireAt: now,
      fireFlashUntil: now + 90,
      recoilUntil: now + 120,
    })
    return true
  },
  registerHit: (kind, small, bullseye, world) => {
    const state = get()
    if (state.phase !== 'playing') return 0

    const isPenalty = kind === 'red'
    const nextCombo = isPenalty ? 0 : state.combo + 1
    const multiplier = isPenalty ? 1 : getComboMultiplier(nextCombo)
    const base = getBaseScore(kind, small)
    const bullseyeMultiplier =
      bullseye && !isPenalty ? SHOOTING_GALLERY.score.bullseyeMultiplier : 1
    const points = Math.round(base * (isPenalty ? 1 : multiplier) * bullseyeMultiplier)
    const nextScore = Math.max(0, state.score + points)
    floatingId += 1

    set({
      score: nextScore,
      combo: nextCombo,
      floatingScores: [
        ...state.floatingScores.slice(-8),
        {
          id: floatingId,
          points,
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
    set({
      phase: 'result',
      remainingSec: 0,
      ratingId: getRatingId(state.score),
      aimOnTarget: false,
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
      remainingSec: SHOOTING_GALLERY.gameDurationSec,
      countdownValue: SHOOTING_GALLERY.countdownSec,
      startedAt: null,
      aimX: 0,
      aimY: 0,
      aimOnTarget: false,
      fireFlashUntil: 0,
      recoilUntil: 0,
      ratingId: null,
      floatingScores: [],
    }),
  pruneFloatingScores: (now) => {
    const state = get()
    if (state.floatingScores.length === 0) return
    const next = state.floatingScores.filter((item) => now - item.createdAt < 700)
    if (next.length !== state.floatingScores.length) {
      set({ floatingScores: next })
    }
  },
}))
