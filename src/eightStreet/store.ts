import { create } from 'zustand'
import { loadMeebitTraitsDataset } from '../data/meebitTraits'
import { EIGHT_STREET } from './config'
import { generateRound, type GeneratedRound, type RoundKind } from './logic/generateRound'
import { isAnswerCorrect, type PlayerAnswer } from './logic/judgeAnswer'
import { selectBaseMeebitIds } from './logic/selectBaseMeebits'
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
  /** Increments immediately on a resolved turn — wraps the player into the next street. */
  loopKey: number
  /** Blocks double answers while the next cast is preparing. */
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
  setHowToPlayOpen: (open: boolean) => void
  startGame: () => Promise<void>
  submitAnswer: (answer: PlayerAnswer) => void
  playAgain: () => void
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
  setHowToPlayOpen: (howToPlayOpen) => set({ howToPlayOpen }),
  startGame: async () => {
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
    })

    await loadMeebitTraitsDataset()
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
      const progress = Math.min(state.progress + 1, EIGHT_STREET.targetProgress)
      const normalStreak = kind === 'normal' ? state.normalStreak + 1 : 0
      const anomalyStreak = kind === 'anomaly' ? state.anomalyStreak + 1 : 0
      // Forward keeps marching through the exit fog; turn-back uses the entrance fog.
      const handoff: 'continue' | 'restart' = answer === 'normal' ? 'continue' : 'restart'

      if (progress >= EIGHT_STREET.targetProgress) {
        const clearTimeSeconds = state.startedAt
          ? (Date.now() - state.startedAt) / 1000
          : null
        set({
          progress,
          normalStreak,
          anomalyStreak,
          phase: 'cleared',
          clearTimeSeconds,
          isAdvancing: false,
          handoff: 'continue',
          loopKey: state.loopKey + 1,
          roundKey: state.roundKey + 1,
        })
        return
      }

      // Sign updates + player wraps immediately — no toast / loading UI.
      const advanceId = state.advanceId + 1
      set({
        progress,
        normalStreak,
        anomalyStreak,
        isAdvancing: true,
        advanceId,
        handoff,
        loopKey: state.loopKey + 1,
      })

      void (async () => {
        const latest = get()
        const nextRoundNumber = latest.roundNumber + 1
        const currentRound = await buildNextRound({
          roundNumber: nextRoundNumber,
          streetProgress: latest.progress,
          baseMeebitIds: latest.baseMeebitIds,
          walkerPattern: latest.walkerPattern,
          normalStreak: latest.normalStreak,
          anomalyStreak: latest.anomalyStreak,
        })
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
      })()
      return
    }

    // Wrong: wall sign silently returns to 0th Street.
    const advanceId = state.advanceId + 1
    set({
      progress: 0,
      mistakeCount: state.mistakeCount + 1,
      normalStreak: 0,
      anomalyStreak: 0,
      isAdvancing: true,
      advanceId,
      handoff: 'restart',
      loopKey: state.loopKey + 1,
    })

    void (async () => {
      const latest = get()
      const nextRoundNumber = latest.roundNumber + 1
      const currentRound = await buildNextRound({
        roundNumber: nextRoundNumber,
        streetProgress: 0,
        baseMeebitIds: latest.baseMeebitIds,
        walkerPattern: latest.walkerPattern,
        normalStreak: 0,
        anomalyStreak: 0,
      })
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
    })()
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
    })
  },
}))
