import { useEffect, useRef } from 'react'
import { PLAYER_START_POSITION } from '../game/gameConfig'
import { resetPlayerWorldState } from '../avatar/playerWorldState'
import { getProgressionStep, getStageDescription, getStageLabel, getChallengeNpcCount } from '../game/gameProgression'
import { getNpcById } from '../npc/npcData'
import { getCurrentStageLabel, useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { TargetPreview } from './TargetPreview'
import { playSfx, unlockAudioIfNeeded } from './sfx'

export function ClearOverlay() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const clearedNpcId = useGameStore((state) => state.clearedNpcId)
  const clearTimeSeconds = useGameStore((state) => state.clearTimeSeconds)
  const progressionIndex = useGameStore((state) => state.progressionIndex)
  const activeNpcCount = useGameStore((state) => state.activeNpcCount)
  const continueToNextStage = useGameStore((state) => state.continueToNextStage)
  const resetGame = useGameStore((state) => state.resetGame)
  const clearedNpc = clearedNpcId ? getNpcById(clearedNpcId) : null
  const isVisible = gamePhase === 'cleared' || gamePhase === 'conquered'
  const isConquered = gamePhase === 'conquered'
  const clearedStep = getProgressionStep(isConquered ? progressionIndex : progressionIndex - 1)
  const nextStep = isConquered ? null : getProgressionStep(progressionIndex)
  const wasVisibleRef = useRef(false)

  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) {
      unlockAudioIfNeeded()
      playSfx('clear')
    }

    wasVisibleRef.current = isVisible
  }, [isVisible])

  const handleContinue = () => {
    unlockAudioIfNeeded()
    playSfx('uiConfirm')
    resetPlayerWorldState(
      [PLAYER_START_POSITION[0], PLAYER_START_POSITION[1], PLAYER_START_POSITION[2]],
      Math.PI,
    )
    usePlayerStore.getState().setMovementLocked(false)

    if (isConquered) {
      resetGame()
      return
    }

    continueToNextStage()
  }

  useEffect(() => {
    if (!isVisible || isConquered) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Enter') return
      if (event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      event.preventDefault()
      handleContinue()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isVisible, isConquered, continueToNextStage, resetGame])

  if (!isVisible) {
    return null
  }

  const clearedStageLabel = clearedStep ? getStageLabel(clearedStep) : getCurrentStageLabel(progressionIndex)

  return (
    <div
      className={
        isConquered
          ? 'pointer-events-auto absolute inset-0 z-50 overflow-y-auto bg-gradient-to-b from-amber-950/90 via-neutral-950/85 to-amber-950/90 p-4 backdrop-blur-sm max-lg:py-[max(1rem,env(safe-area-inset-top))] lg:grid lg:place-items-center lg:p-6'
          : 'pointer-events-auto absolute inset-0 z-50 overflow-y-auto bg-neutral-950/75 p-4 backdrop-blur-sm max-lg:py-[max(1rem,env(safe-area-inset-top))] lg:grid lg:place-items-center lg:p-6'
      }
    >
      <section
        className={
          isConquered
            ? 'relative mx-auto grid w-full max-w-2xl gap-6 overflow-hidden rounded-[2rem] border border-amber-300/70 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 p-5 text-amber-950 shadow-[0_24px_80px_rgba(251,191,36,0.35)] max-lg:my-auto sm:grid-cols-[auto_1fr] sm:p-8'
            : 'mx-auto grid w-full max-w-2xl gap-6 rounded-[2rem] border border-white/15 bg-white p-5 text-neutral-950 shadow-2xl max-lg:my-auto sm:grid-cols-[auto_1fr] sm:p-8'
        }
      >
        {isConquered ? (
          <>
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-yellow-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-amber-400/25 blur-3xl" />
          </>
        ) : null}
        {clearedNpc ? (
          <TargetPreview
            meebitNumber={clearedNpc.meebitNumber}
            modelScale={1.14}
            sizeClassName={
              isConquered
                ? 'relative z-10 mx-auto h-48 w-48 rounded-[1.75rem] border-2 border-amber-300/80 bg-gradient-to-b from-amber-100 to-yellow-50 shadow-[0_12px_40px_rgba(245,158,11,0.25)] max-lg:h-36 max-lg:w-36'
                : 'mx-auto h-48 w-48 max-lg:h-36 max-lg:w-36'
            }
          />
        ) : null}
        <div className={`text-center sm:text-left ${isConquered ? 'relative z-10' : ''}`}>
          <p
            className={
              isConquered
                ? 'text-xs font-semibold uppercase tracking-[0.35em] text-amber-700'
                : 'text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500'
            }
          >
            {isConquered ? 'Full Conquest' : 'Stage Clear'}
          </p>
          <h2
            className={
              isConquered
                ? 'mt-3 bg-gradient-to-r from-amber-800 via-yellow-700 to-amber-900 bg-clip-text text-4xl font-black text-transparent'
                : 'mt-3 text-4xl font-black'
            }
          >
            {isConquered ? 'You conquered the museum.' : 'You found it.'}
          </h2>
          <p className={`mt-4 text-lg font-bold ${isConquered ? 'text-amber-900' : ''}`}>
            Meebit #{clearedNpc?.meebitNumber ?? '????'}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div
              className={
                isConquered
                  ? 'rounded-2xl border border-amber-300/70 bg-white/55 p-4 shadow-sm'
                  : 'rounded-2xl border border-neutral-200 bg-neutral-50 p-4'
              }
            >
              <p
                className={
                  isConquered
                    ? 'text-xs font-semibold uppercase tracking-[0.25em] text-amber-700'
                    : 'text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500'
                }
              >
                Clear Time
              </p>
              <p className={`mt-1 text-2xl font-black ${isConquered ? 'text-amber-950' : ''}`}>
                {formatClearTime(clearTimeSeconds)}
              </p>
            </div>
            <div
              className={
                isConquered
                  ? 'rounded-2xl border border-amber-300/70 bg-white/55 p-4 shadow-sm'
                  : 'rounded-2xl border border-neutral-200 bg-neutral-50 p-4'
              }
            >
              <p
                className={
                  isConquered
                    ? 'text-xs font-semibold uppercase tracking-[0.25em] text-amber-700'
                    : 'text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500'
                }
              >
                Stage
              </p>
              <p className={`mt-1 text-2xl font-black ${isConquered ? 'text-amber-950' : ''}`}>
                {isConquered ? 'Complete' : clearedStageLabel}
              </p>
            </div>
          </div>
          <p className={`mt-4 text-sm leading-relaxed ${isConquered ? 'text-amber-900/80' : 'text-neutral-600'}`}>
            {isConquered
              ? `You cleared Semifinal, Final, and Grand Final at ${getChallengeNpcCount()} Meebits. Full conquest complete.`
              : nextStep
                ? `Next: ${getStageLabel(nextStep)} — ${getStageDescription(nextStep)}`
                : `Next stage: ${activeNpcCount} Meebits.`}
          </p>
          <button
            type="button"
            className={
              isConquered
                ? 'mt-6 w-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-6 py-3.5 text-sm font-black uppercase tracking-[0.25em] text-amber-950 shadow-lg shadow-amber-500/35 transition hover:from-amber-400 hover:via-yellow-300 hover:to-amber-400 max-lg:py-4 sm:w-auto'
                : 'mt-6 w-full rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-neutral-700 max-lg:py-4 sm:w-auto'
            }
            onClick={handleContinue}
          >
            {isConquered ? 'Back to Title' : 'Next Stage'}
          </button>
          {isConquered ? (
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/70">
              Click to continue
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function formatClearTime(seconds: number | null) {
  if (seconds === null) {
    return '--:--'
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  const centiseconds = Math.floor((seconds % 1) * 100)

  if (minutes === 0) {
    return `${remainingSeconds}.${String(centiseconds).padStart(2, '0')}s`
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}
