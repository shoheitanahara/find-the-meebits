import { useEffect, useRef } from 'react'
import { PLAYER_START_POSITION } from '../game/gameConfig'
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
    usePlayerStore
      .getState()
      .setPlayerTransform(
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
    if (!isVisible) {
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
      <section className="mx-auto grid w-full max-w-2xl gap-6 rounded-[2rem] border border-white/15 bg-white p-5 text-neutral-950 shadow-2xl max-lg:my-auto sm:grid-cols-[auto_1fr] sm:p-8">
        {clearedNpc ? (
          <TargetPreview
            meebitNumber={clearedNpc.meebitNumber}
            modelScale={1.14}
            sizeClassName="mx-auto h-48 w-48 max-lg:h-36 max-lg:w-36"
          />
        ) : null}
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
            {isConquered ? 'Full Conquest' : 'Stage Clear'}
          </p>
          <h2 className="mt-3 text-4xl font-black">
            {isConquered ? 'You conquered the museum.' : 'You found it.'}
          </h2>
          <p className="mt-4 text-lg font-bold">Meebit #{clearedNpc?.meebitNumber ?? '????'}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Clear Time</p>
              <p className="mt-1 text-2xl font-black">{formatClearTime(clearTimeSeconds)}</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Stage</p>
              <p className="mt-1 text-2xl font-black">{isConquered ? 'Complete' : clearedStageLabel}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            {isConquered
              ? `You cleared Semifinal, Final, and Grand Final at ${getChallengeNpcCount()} Meebits. Full conquest complete.`
              : nextStep
                ? `Next: ${getStageLabel(nextStep)} — ${getStageDescription(nextStep)}`
                : `Next stage: ${activeNpcCount} Meebits.`}
          </p>
          <button
            type="button"
            className="mt-6 w-full rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-neutral-700 max-lg:py-4 sm:w-auto"
            onClick={handleContinue}
          >
            {isConquered ? 'Back to Title' : 'Next Stage'}
          </button>
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
