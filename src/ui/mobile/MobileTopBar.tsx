import { useEffect, useState } from 'react'
import { getStageLabel, getProgressionStep } from '../../game/gameProgression'
import { getNpcById } from '../../npc/npcData'
import { useGameStore } from '../../stores/gameStore'
import { getTimerDisplay, shouldShowGameTimer } from '../gameTimerDisplay'
import { getGameModeLabel } from '../../game/gameMode'
import { FoundTargetIcon } from '../FoundTargetIcon'
import { StageRetryButton } from '../StageRetryButton'
import { TARGET_HUD_PREVIEW_PRIORITY } from '../targetPreviewCache'
import { TargetPreview } from '../TargetPreview'
import { PlayerMeebitLabel } from '../PlayerMeebitLabel'

function getTargetStackLayout(targetCount: number) {
  if (targetCount >= 5) {
    return {
      previewSize: 'h-[3.825rem] w-[3.825rem]',
      modelScale: 1.05,
      cameraDistance: 4.25,
      cameraY: 1.45,
      modelYOffset: -1.2,
      stackGap: 'gap-1',
      itemGap: 'gap-1.5',
      itemPadding: 'px-1.5 py-1',
      idClassName: 'min-w-[3.15rem] text-right text-[0.7rem] font-black leading-none text-white',
      foundIconSize: 'size-6',
    }
  }

  if (targetCount >= 4) {
    return {
      previewSize: 'h-10 w-10',
      modelScale: 1.0,
      cameraDistance: 3.85,
      cameraY: 1.5,
      modelYOffset: -1.1,
      stackGap: 'gap-0.5',
      itemGap: 'gap-1',
      itemPadding: 'px-1 py-0.5',
      idClassName: 'min-w-[2rem] text-right text-[0.65rem] font-black leading-none text-white',
      foundIconSize: 'size-3.5',
    }
  }

  return {
    previewSize: 'h-[4.5rem] w-[4.5rem]',
    modelScale: 1.1,
    cameraDistance: 3.6,
    cameraY: 1.55,
    modelYOffset: -1.05,
    stackGap: 'gap-1',
    itemGap: 'gap-1.5',
    itemPadding: 'px-1.5 py-1',
    idClassName: 'min-w-[2.25rem] text-right text-[0.7rem] font-black leading-none text-white',
    foundIconSize: 'size-4',
  }
}

export function MobileTopBar() {
  const gameMode = useGameStore((state) => state.gameMode)
  const gamePhase = useGameStore((state) => state.gamePhase)
  const venueId = useGameStore((state) => state.venueId)
  const progressionIndex = useGameStore((state) => state.progressionIndex)
  const activeNpcCount = useGameStore((state) => state.activeNpcCount)
  const targetNpcIds = useGameStore((state) => state.targetNpcIds)
  const foundTargetNpcIds = useGameStore((state) => state.foundTargetNpcIds)
  const startedAt = useGameStore((state) => state.startedAt)
  const clearTimeSeconds = useGameStore((state) => state.clearTimeSeconds)
  const [, setTick] = useState(0)

  const isAnswerReveal = gamePhase === 'timedOut'
  const isVisible =
    gamePhase === 'preparing' ||
    gamePhase === 'playing' ||
    gamePhase === 'timedOut' ||
    gamePhase === 'cleared' ||
    gamePhase === 'conquered'

  useEffect(() => {
    const intervalId = window.setInterval(() => setTick((value) => value + 1), 100)
    return () => window.clearInterval(intervalId)
  }, [])

  if (!isVisible) {
    return null
  }

  const step = getProgressionStep(progressionIndex, venueId)
  const stageLabel = step ? getStageLabel(step) : 'Stage'
  const targetNpcs = targetNpcIds
    .map((id) => getNpcById(id))
    .filter((npc): npc is NonNullable<typeof npc> => npc !== null)
  const targetLayout = getTargetStackLayout(targetNpcs.length)
  const showTimer = shouldShowGameTimer(gameMode)
  const showRetry = gamePhase === 'playing' || gamePhase === 'timedOut'
  const timerDisplay = showTimer ? getTimerDisplay(gamePhase, startedAt, clearTimeSeconds, gameMode) : null
  const urgent = timerDisplay?.urgent ?? false
  const barTone = urgent
    ? 'border-red-400/40 bg-red-950/90 text-red-50'
    : isAnswerReveal
      ? 'border-amber-300/40 bg-amber-950/90 text-amber-50'
      : 'border-white/20 bg-neutral-950/90 text-white'

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 lg:hidden">
      <div className="px-2.5 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div
          className={`${showTimer ? 'w-[min(54vw,22rem)]' : 'w-[min(42vw,16rem)]'} rounded-2xl border px-2.5 py-1.5 shadow-xl backdrop-blur-md ${barTone}`}
        >
          <div
            className={
              showTimer
                ? 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3'
                : 'min-w-0'
            }
          >
            <div className="min-w-0">
              <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                {stageLabel}
              </p>
              <p className="truncate text-[0.65rem] font-bold text-neutral-300">{activeNpcCount} Meebits</p>
              <PlayerMeebitLabel className="mt-0.5 text-[0.6rem] font-bold text-neutral-200" />
              {!showTimer ? (
                <p className="mt-0.5 text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {getGameModeLabel(gameMode)}
                </p>
              ) : null}
            </div>

            {showTimer && timerDisplay ? (
              <div className="flex shrink-0 flex-col items-center gap-0.5">
                <div className="text-center">
                  <p className="text-[0.55rem] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                    {timerDisplay.label}
                  </p>
                  <p className="text-lg font-black tabular-nums leading-tight">{timerDisplay.value}</p>
                </div>
                {showRetry ? <StageRetryButton compact /> : null}
              </div>
            ) : showRetry ? (
              <StageRetryButton compact />
            ) : null}
          </div>
        </div>
      </div>

      {targetNpcs.length > 0 ? (
        <div
          className={`absolute right-2.5 top-[max(0.5rem,env(safe-area-inset-top))] z-10 flex flex-col items-end ${targetLayout.stackGap}`}
        >
          <p
            className={`pr-0.5 text-[0.5rem] font-semibold uppercase tracking-[0.18em] ${
              isAnswerReveal ? 'text-amber-200/90' : 'text-neutral-400'
            }`}
          >
            {isAnswerReveal ? 'Answer' : targetNpcs.length > 1 ? 'Targets' : 'Target'}
          </p>
          {targetNpcs.map((npc) => {
            const isFound = foundTargetNpcIds.includes(npc.id)

            return (
            <div
              key={npc.id}
              className={`flex items-center rounded-xl border shadow-lg backdrop-blur-md ${targetLayout.itemGap} ${targetLayout.itemPadding} ${
                isAnswerReveal
                  ? 'border-amber-300/40 bg-amber-950/90'
                  : isFound
                    ? 'border-emerald-400/35 bg-neutral-950/90'
                    : 'border-white/20 bg-neutral-950/90'
              }`}
            >
              <p
                className={`${targetLayout.idClassName} ${isFound ? 'text-emerald-300' : ''}`}
              >
                #{npc.meebitNumber}
              </p>
              <div className="relative shrink-0">
                <TargetPreview
                  meebitNumber={npc.meebitNumber}
                  capturePriority={TARGET_HUD_PREVIEW_PRIORITY}
                  modelScale={targetLayout.modelScale}
                  cameraDistance={targetLayout.cameraDistance}
                  cameraY={targetLayout.cameraY}
                  modelYOffset={targetLayout.modelYOffset}
                  sizeClassName={`${targetLayout.previewSize} rounded-lg ${isFound ? 'opacity-55' : ''}`}
                />
                {isFound ? (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-emerald-500/15">
                    <FoundTargetIcon className={`${targetLayout.foundIconSize} text-emerald-300`} />
                  </span>
                ) : null}
              </div>
            </div>
            )
          })}
        </div>
      ) : null}
    </header>
  )
}
