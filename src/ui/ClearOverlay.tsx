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
  const playerMeebitNumber = usePlayerStore((state) => state.meebitNumber)
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
    <div className="pointer-events-auto absolute inset-0 z-50 overflow-y-auto bg-neutral-950/75 p-4 backdrop-blur-sm max-lg:py-[max(1rem,env(safe-area-inset-top))] lg:grid lg:place-items-center lg:p-6">
      <section
        className={
          isConquered
            ? 'mx-auto grid w-full max-w-3xl gap-6 rounded-[2rem] border-2 border-yellow-400 bg-yellow-50 p-5 text-neutral-950 shadow-2xl max-lg:my-auto sm:grid-cols-[auto_1fr] sm:p-8'
            : 'mx-auto grid w-full max-w-2xl gap-6 rounded-[2rem] border border-white/15 bg-white p-5 text-neutral-950 shadow-2xl max-lg:my-auto sm:grid-cols-[auto_1fr] sm:p-8'
        }
      >
        {isConquered ? (
          <div className="mx-auto flex flex-row items-end justify-center gap-4 max-lg:mx-auto lg:mx-0 lg:flex-col lg:items-start lg:gap-4">
            {clearedNpc ? (
              <ConqueredAvatarPreview label="Final Target" meebitNumber={clearedNpc.meebitNumber} />
            ) : null}
            <ConqueredAvatarPreview label="You" meebitNumber={playerMeebitNumber} />
          </div>
        ) : clearedNpc ? (
          <TargetPreview
            meebitNumber={clearedNpc.meebitNumber}
            modelScale={1.14}
            sizeClassName="mx-auto h-48 w-48 max-lg:h-36 max-lg:w-36"
          />
        ) : null}
        <div className="text-center sm:text-left">
          <p
            className={
              isConquered
                ? 'text-xs font-semibold uppercase tracking-[0.35em] text-yellow-600'
                : 'text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500'
            }
          >
            {isConquered ? 'Full Conquest' : 'Stage Clear'}
          </p>
          <h2 className={`mt-3 text-4xl font-black ${isConquered ? 'text-yellow-500' : ''}`}>
            {isConquered ? 'You conquered the museum.' : 'You found it.'}
          </h2>
          {!isConquered ? (
            <p className="mt-4 text-lg font-bold">Meebit #{clearedNpc?.meebitNumber ?? '????'}</p>
          ) : (
            <p className="mt-4 text-sm font-semibold text-neutral-600">
              {clearedNpc ? `Final target #${clearedNpc.meebitNumber}` : null}
              {clearedNpc ? ' · ' : null}
              You #{playerMeebitNumber}
            </p>
          )}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div
              className={
                isConquered
                  ? 'rounded-2xl border border-yellow-300 bg-white p-4'
                  : 'rounded-2xl border border-neutral-200 bg-neutral-50 p-4'
              }
            >
              <p
                className={
                  isConquered
                    ? 'text-xs font-semibold uppercase tracking-[0.25em] text-yellow-600'
                    : 'text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500'
                }
              >
                Clear Time
              </p>
              <p className="mt-1 text-2xl font-black">{formatClearTime(clearTimeSeconds)}</p>
            </div>
            <div
              className={
                isConquered
                  ? 'rounded-2xl border border-yellow-300 bg-white p-4'
                  : 'rounded-2xl border border-neutral-200 bg-neutral-50 p-4'
              }
            >
              <p
                className={
                  isConquered
                    ? 'text-xs font-semibold uppercase tracking-[0.25em] text-yellow-600'
                    : 'text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500'
                }
              >
                Stage
              </p>
              <p className="mt-1 text-2xl font-black">{isConquered ? 'Complete' : clearedStageLabel}</p>
            </div>
          </div>
          <p className={`mt-4 text-sm leading-relaxed ${isConquered ? 'text-neutral-700' : 'text-neutral-600'}`}>
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
                ? 'mt-6 w-full rounded-full bg-yellow-400 px-6 py-3.5 text-sm font-black uppercase tracking-[0.25em] text-neutral-950 transition hover:bg-yellow-300 max-lg:py-4 sm:w-auto'
                : 'mt-6 w-full rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-neutral-700 max-lg:py-4 sm:w-auto'
            }
            onClick={handleContinue}
          >
            {isConquered ? 'Back to Title' : 'Next Stage'}
          </button>
          {isConquered ? (
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Click to continue
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

type ConqueredAvatarPreviewProps = {
  label: string
  meebitNumber: number
}

function ConqueredAvatarPreview({ label, meebitNumber }: ConqueredAvatarPreviewProps) {
  return (
    <div className="text-center lg:text-left">
      <div className="overflow-hidden rounded-[1.75rem] border-2 border-yellow-400 bg-white">
        <TargetPreview
          meebitNumber={meebitNumber}
          sizeClassName="h-32 w-32 rounded-none border-0 lg:h-44 lg:w-44"
        />
      </div>
      <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-yellow-600">{label}</p>
      <p className="mt-0.5 text-base font-black">#{meebitNumber}</p>
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
