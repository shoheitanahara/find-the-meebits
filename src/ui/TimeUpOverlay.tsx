import { useEffect } from 'react'
import { ui } from '../i18n/ui'
import { PLAYER_START_POSITION } from '../game/gameConfig'
import { resetPlayerWorldState } from '../avatar/playerWorldState'
import { getProgressionStep, getStageLabel } from '../game/gameProgression'
import { getNpcById } from '../npc/npcData'
import { getRemainingTargetNpcIds, useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { SP_MINI_MAP_BOTTOM_OFFSET, SP_MINI_MAP_LEFT_OFFSET, SP_MINI_MAP_OUTER_WIDTH } from './MiniMap'
import { TargetPreview } from './TargetPreview'
import { playSfx, unlockAudioIfNeeded } from './sfx'

function getTimeUpPreviewLayout(targetCount: number) {
  if (targetCount >= 3) {
    return {
      previewSize: 'h-24 w-24 rounded-xl',
      gridClass: 'grid grid-cols-2 gap-2',
      containerClass: 'w-[12.5rem]',
    }
  }

  if (targetCount >= 2) {
    return {
      previewSize: 'h-28 w-28 rounded-xl',
      gridClass: 'flex flex-wrap gap-2',
      containerClass: 'w-auto',
    }
  }

  return {
    previewSize: 'h-40 w-40',
    gridClass: 'grid grid-cols-1',
    containerClass: 'w-auto',
  }
}

export function TimeUpOverlay() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const venueId = useGameStore((state) => state.venueId)
  const progressionIndex = useGameStore((state) => state.progressionIndex)
  const activeNpcCount = useGameStore((state) => state.activeNpcCount)
  const targetNpcIds = useGameStore((state) => state.targetNpcIds)
  const foundTargetNpcIds = useGameStore((state) => state.foundTargetNpcIds)
  const retryStage = useGameStore((state) => state.retryStage)
  const resetGame = useGameStore((state) => state.resetGame)
  const remainingTargetNpcIds = getRemainingTargetNpcIds(targetNpcIds, foundTargetNpcIds)
  const targetNpcs = remainingTargetNpcIds
    .map((id) => getNpcById(id))
    .filter((npc): npc is NonNullable<typeof npc> => npc !== null)
  const t = ui()
  const step = getProgressionStep(progressionIndex, venueId)
  const stageLabel = step ? getStageLabel(step) : t.stage
  const isVisible = gamePhase === 'timedOut' && targetNpcs.length > 0
  const targetNumbersLabel = targetNpcs.map((npc) => `#${npc.meebitNumber}`).join(', ')
  const previewLayout = getTimeUpPreviewLayout(targetNpcs.length)
  const useCompactPreviewGrid = targetNpcs.length >= 3

  const handleRetry = () => {
    unlockAudioIfNeeded()
    playSfx('uiConfirm')
    resetPlayerWorldState(
      [PLAYER_START_POSITION[0], PLAYER_START_POSITION[1], PLAYER_START_POSITION[2]],
      Math.PI,
    )
    usePlayerStore.getState().setMovementLocked(false)
    retryStage()
  }

  const handleBackToTitle = () => {
    unlockAudioIfNeeded()
    playSfx('uiClick')
    resetGame()
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
      handleRetry()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isVisible, retryStage])

  if (!isVisible) {
    return null
  }

  return (
    <>
      <div
        className="pointer-events-none absolute z-40 lg:hidden"
        style={{
          bottom: SP_MINI_MAP_BOTTOM_OFFSET,
          left: `calc(${SP_MINI_MAP_LEFT_OFFSET} + ${SP_MINI_MAP_OUTER_WIDTH} + 0.5rem)`,
        }}
      >
        <section className="pointer-events-auto w-[min(46vw,13.5rem)] rounded-2xl border border-amber-300/35 bg-neutral-950/88 px-3.5 py-3 text-white shadow-lg backdrop-blur-md">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-amber-300/95">
            {t.timeUpAnswerReveal}
          </p>
          <p className="mt-1 text-xs leading-snug text-neutral-300">
            <span className="font-bold text-amber-200">{targetNumbersLabel}</span> {t.timeUpMobileHint}
          </p>
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-full bg-amber-400 px-2.5 py-2 text-[0.65rem] font-black uppercase tracking-[0.1em] text-neutral-950 transition active:bg-amber-300"
              onClick={handleRetry}
            >
              {t.retry}
            </button>
            <button
              type="button"
              className="flex-1 rounded-full border border-white/25 px-2.5 py-2 text-[0.65rem] font-black uppercase tracking-[0.1em] text-white transition active:bg-white/10"
              onClick={handleBackToTitle}
            >
              {t.titleBtn}
            </button>
          </div>
        </section>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 hidden justify-center p-4 sm:p-6 lg:flex">
        <section className="pointer-events-auto grid w-full max-w-3xl items-start gap-4 rounded-[2rem] border border-amber-300/35 bg-neutral-950/92 p-5 text-white shadow-2xl backdrop-blur-md sm:grid-cols-[auto_1fr] sm:p-6">
          <div className={`${previewLayout.gridClass} ${previewLayout.containerClass} shrink-0`}>
            {targetNpcs.map((npc, index) => (
              <div
                key={npc.id}
                className={
                  useCompactPreviewGrid &&
                  targetNpcs.length % 2 === 1 &&
                  index === targetNpcs.length - 1
                    ? 'col-span-2 mx-auto'
                    : ''
                }
              >
                <TargetPreview
                  meebitNumber={npc.meebitNumber}
                  sizeClassName={`mx-auto ${previewLayout.previewSize}`}
                />
                {targetNpcs.length > 1 ? (
                  <p className="mt-1 text-center text-xs font-black text-amber-200">#{npc.meebitNumber}</p>
                ) : null}
              </div>
            ))}
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300/90">{t.timeUp}</p>
            <h2 className="mt-2 text-4xl font-black">{t.answerReveal}</h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-300">
              {t.stageWithMeebits(stageLabel, activeNpcCount)}.{' '}
              {targetNpcs.length > 1 ? (
                <>
                  {t.remainingTargets}{' '}
                  {targetNpcs.map((npc, index) => (
                    <span key={npc.id}>
                      {index > 0 ? (index === targetNpcs.length - 1 ? ' and ' : ', ') : ''}
                      <span className="font-black text-amber-200">#{npc.meebitNumber}</span>
                    </span>
                  ))}
                </>
              ) : (
                <>
                  {t.correctAvatar}{' '}
                  <span className="font-black text-amber-200">Meebit #{targetNpcs[0]?.meebitNumber}</span>
                </>
              )}{' '}
              {t.andGlowsGold}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full bg-amber-400 px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-neutral-950 transition hover:bg-amber-300"
                onClick={handleRetry}
              >
                {t.retryStage}
              </button>
              <button
                type="button"
                className="rounded-full border border-white/25 px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
                onClick={handleBackToTitle}
              >
                {t.titleBtn}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
