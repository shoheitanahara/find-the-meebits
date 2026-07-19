import { create } from 'zustand'
import { loadMeebitTraitsDataset } from '../data/meebitTraits'
import { EIGHT_STREET } from './config'
import { generateRound, type GeneratedRound, type RoundKind } from './logic/generateRound'
import { isAnswerCorrect, type PlayerAnswer } from './logic/judgeAnswer'
import { selectBaseMeebitIds } from './logic/selectBaseMeebits'
import { beginSimilarScanSession } from './logic/selectSimilarMeebit'
import { createSessionWalkerPattern, type WalkerPatternSlot } from './logic/walkerPath'

/** No transition UI — only title / first load / playing / cleared. */
export type EightStreetPhase = 'title' | 'loading' | 'playing' | 'cleared'

type EightStreetState = {
  phase: EightStreetPhase
  howToPlayOpen: boolean
  progress: number
  mistakeCount: number
  roundNumber: number
  normalStreak: number
  anomalyStreak: number
  baseMeebitIds: number[]
  walkerPattern: WalkerPatternSlot[]
  currentRound: GeneratedRound | null
  startedAt: number | null
  clearTimeSeconds: number | null
  roundKey: number
  /** Increments after wash fades in — teleports player into the next street. */
  loopKey: number
  /** True while the white wash is up (fade + teleport + cast swap). */
  isAdvancing: boolean
  /** Bumped on each advance; stale async round builds must not unlock judging. */
  advanceId: number
  /**
   * How the next street should hand off the player camera.
   * `spawn` = first start clear of the fog bank.
   * `continue` = wrap from the forward exit into the entrance fog.
   * `restart` = wrong / turn-back → emerge from the same entrance fog.
   */
  handoff: 'spawn' | 'continue' | 'restart' | null
  /**
   * Absolute spawn pose for one play session; re-rolled on each Start.
   * Keeps wraps consistent while varying runs across reloads.
   */
  sessionSpawnX: number
  sessionLandZ: number
  sessionStartZ: number
  sessionSpawnYaw: number
  setHowToPlayOpen: (open: boolean) => void
  startGame: () => Promise<void>
  submitAnswer: (answer: PlayerAnswer) => void
  playAgain: () => void
}

function randRange(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function rollSessionSpawn() {
  const landZ = randRange(EIGHT_STREET.sessionLandZMin, EIGHT_STREET.sessionLandZMax)
  // First spawn can sit a bit farther into the alley than wrap landings.
  const startZ = randRange(
    Math.max(EIGHT_STREET.sessionStartZMin, landZ - 0.35),
    EIGHT_STREET.sessionStartZMax,
  )
  return {
    // Always centered and facing down the alley — no per-session lateral / yaw jitter.
    sessionSpawnX: EIGHT_STREET.playerStartX,
    sessionLandZ: landZ,
    sessionStartZ: startZ,
    sessionSpawnYaw: 0,
  }
}

async function buildNextRound(state: {
  roundNumber: number
  streetProgress: number
  baseMeebitIds: number[]
  walkerPattern: WalkerPatternSlot[]
  normalStreak: number
  anomalyStreak: number
}) {
  return generateRound({
    roundNumber: state.roundNumber,
    streetProgress: state.streetProgress,
    baseMeebitIds: state.baseMeebitIds,
    walkerPattern: state.walkerPattern,
    normalStreak: state.normalStreak,
    anomalyStreak: state.anomalyStreak,
  })
}

/**
 * Fade screen to white, then teleport, then reveal once the next cast is ready.
 * Avoids a hard cut at the fog line.
 */
function runStreetWrap(
  get: () => EightStreetState,
  set: (
    partial:
      | Partial<EightStreetState>
      | ((state: EightStreetState) => Partial<EightStreetState>),
  ) => void,
  options: {
    handoff: 'continue' | 'restart'
    progress: number
    normalStreak: number
    anomalyStreak: number
    mistakeCount?: number
    streetProgressForRound: number
  },
) {
  const state = get()
  const advanceId = state.advanceId + 1
  const startedAt = performance.now()

  set({
    progress: options.progress,
    mistakeCount: options.mistakeCount ?? state.mistakeCount,
    normalStreak: options.normalStreak,
    anomalyStreak: options.anomalyStreak,
    isAdvancing: true,
    advanceId,
    handoff: options.handoff,
  })

  // Teleport only after the wash has bloomed opaque.
  window.setTimeout(() => {
    if (get().advanceId !== advanceId) return
    set({ loopKey: get().loopKey + 1 })
  }, EIGHT_STREET.wrapFadeInMs)

  void (async () => {
    const latest = get()
    const nextRoundNumber = latest.roundNumber + 1
    const currentRound = await buildNextRound({
      roundNumber: nextRoundNumber,
      streetProgress: options.streetProgressForRound,
      baseMeebitIds: latest.baseMeebitIds,
      walkerPattern: latest.walkerPattern,
      normalStreak: options.normalStreak,
      anomalyStreak: options.anomalyStreak,
    })
    if (get().advanceId !== advanceId) return

    const elapsed = performance.now() - startedAt
    // Stay fully white until fade-in + teleport settle, and at least wrapMinWhiteMs.
    const minHold = Math.max(
      EIGHT_STREET.wrapMinWhiteMs,
      EIGHT_STREET.wrapFadeInMs + 160,
    )
    const remaining = Math.max(0, minHold - elapsed)

    window.setTimeout(() => {
      set((prev) => {
        if (prev.advanceId !== advanceId) return prev
        return {
          phase: 'playing' as const,
          roundNumber: nextRoundNumber,
          currentRound,
          roundKey: prev.roundKey + 1,
          isAdvancing: false,
        }
      })
    }, remaining)
  })()
}

export const useEightStreetStore = create<EightStreetState>((set, get) => ({
  phase: 'title',
  howToPlayOpen: false,
  progress: 0,
  mistakeCount: 0,
  roundNumber: 0,
  normalStreak: 0,
  anomalyStreak: 0,
  baseMeebitIds: [],
  walkerPattern: [],
  currentRound: null,
  startedAt: null,
  clearTimeSeconds: null,
  roundKey: 0,
  loopKey: 0,
  isAdvancing: false,
  advanceId: 0,
  handoff: null,
  sessionSpawnX: EIGHT_STREET.playerStartX,
  sessionLandZ: EIGHT_STREET.entranceLandingZ,
  sessionStartZ: EIGHT_STREET.playerStartZ,
  sessionSpawnYaw: 0,
  setHowToPlayOpen: (howToPlayOpen) => set({ howToPlayOpen }),
  startGame: async () => {
    const spawn = rollSessionSpawn()
    set({
      phase: 'loading',
      howToPlayOpen: false,
      progress: 0,
      mistakeCount: 0,
      roundNumber: 1,
      normalStreak: 0,
      anomalyStreak: 0,
      clearTimeSeconds: null,
      startedAt: Date.now(),
      isAdvancing: false,
      advanceId: 0,
      handoff: null,
      loopKey: 0,
      ...spawn,
    })

    await loadMeebitTraitsDataset()
    beginSimilarScanSession()
    const baseMeebitIds = selectBaseMeebitIds(EIGHT_STREET.meebitCount)
    const walkerPattern = createSessionWalkerPattern(baseMeebitIds.length)
    const currentRound = await buildNextRound({
      roundNumber: 1,
      streetProgress: 0,
      baseMeebitIds,
      walkerPattern,
      normalStreak: 0,
      anomalyStreak: 0,
    })

    set((state) => ({
      phase: 'playing',
      baseMeebitIds,
      walkerPattern,
      currentRound,
      roundKey: state.roundKey + 1,
      loopKey: state.loopKey + 1,
      handoff: 'spawn',
    }))
  },
  submitAnswer: (answer) => {
    const state = get()
    if (state.phase !== 'playing' || !state.currentRound || state.isAdvancing) return

    const correct = isAnswerCorrect(answer, state.currentRound.kind)
    const kind: RoundKind = state.currentRound.kind

    if (correct) {
      const normalStreak = kind === 'normal' ? state.normalStreak + 1 : 0
      const anomalyStreak = kind === 'anomaly' ? state.anomalyStreak + 1 : 0
      // Forward keeps marching through the exit fog; turn-back uses the entrance fog.
      const handoff: 'continue' | 'restart' = answer === 'normal' ? 'continue' : 'restart'

      // Correctly resolving 8th Street ends the run (Meebits were already shown there).
      if (state.progress >= EIGHT_STREET.targetProgress) {
        const clearTimeSeconds = state.startedAt
          ? (Date.now() - state.startedAt) / 1000
          : null
        set({
          normalStreak,
          anomalyStreak,
          phase: 'cleared',
          clearTimeSeconds,
          isAdvancing: false,
          handoff: null,
        })
        return
      }

      const progress = state.progress + 1

      runStreetWrap(get, set, {
        handoff,
        progress,
        normalStreak,
        anomalyStreak,
        streetProgressForRound: progress,
      })
      return
    }

    // Wrong: wall sign silently returns to 0th Street.
    runStreetWrap(get, set, {
      handoff: 'restart',
      progress: 0,
      mistakeCount: state.mistakeCount + 1,
      normalStreak: 0,
      anomalyStreak: 0,
      streetProgressForRound: 0,
    })
  },
  playAgain: () => {
    set({
      phase: 'title',
      howToPlayOpen: false,
      progress: 0,
      mistakeCount: 0,
      roundNumber: 0,
      normalStreak: 0,
      anomalyStreak: 0,
      baseMeebitIds: [],
      walkerPattern: [],
      currentRound: null,
      startedAt: null,
      clearTimeSeconds: null,
      isAdvancing: false,
      advanceId: 0,
      handoff: null,
      loopKey: 0,
      sessionSpawnX: EIGHT_STREET.playerStartX,
      sessionLandZ: EIGHT_STREET.entranceLandingZ,
      sessionStartZ: EIGHT_STREET.playerStartZ,
      sessionSpawnYaw: 0,
    })
  },
}))
