import { useEffect, useState } from 'react'
import { getStageLabel, getProgressionStep } from '../../game/gameProgression'
import { getNpcById } from '../../npc/npcData'
import { useGameStore } from '../../stores/gameStore'
import { getTimerDisplay } from '../gameTimerDisplay'
import { TargetPreview } from '../TargetPreview'

function getTargetStackLayout(targetCount: number) {
  if (targetCount >= 5) {
    return {
      previewSize: 'h-9 w-9',
      modelScale: 1.0,
      stackGap: 'gap-0.5',
      itemGap: 'gap-1',
      itemPadding: 'px-1 py-0.5',
      idClassName: 'min-w-[1.85rem] text-right text-[0.6rem] font-black leading-none text-white',
    }
  }

  if (targetCount >= 4) {
    return {
      previewSize: 'h-10 w-10',
      modelScale: 1.02,
      stackGap: 'gap-0.5',
      itemGap: 'gap-1',
      itemPadding: 'px-1 py-0.5',
      idClassName: 'min-w-[2rem] text-right text-[0.65rem] font-black leading-none text-white',
    }
  }

  return {
    previewSize: 'h-[4.5rem] w-[4.5rem]',
    modelScale: 1.1,
    stackGap: 'gap-1',
    itemGap: 'gap-1.5',
    itemPadding: 'px-1.5 py-1',
    idClassName: 'min-w-[2.25rem] text-right text-[0.7rem] font-black leading-none text-white',
  }
}

export function MobileTopBar() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const progressionIndex = useGameStore((state) => state.progressionIndex)
  const activeNpcCount = useGameStore((state) => state.activeNpcCount)
  const targetNpcIds = useGameStore((state) => state.targetNpcIds)
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

  const step = getProgressionStep(progressionIndex)
  const stageLabel = step ? getStageLabel(step) : 'Stage'
  const targetNpcs = targetNpcIds
    .map((id) => getNpcById(id))
    .filter((npc): npc is NonNullable<typeof npc> => npc !== null)
  const targetLayout = getTargetStackLayout(targetNpcs.length)
  const { label, value, urgent } = getTimerDisplay(gamePhase, startedAt, clearTimeSeconds)
  const barTone = urgent
    ? 'border-red-400/40 bg-red-950/90 text-red-50'
    : isAnswerReveal
      ? 'border-amber-300/40 bg-amber-950/90 text-amber-50'
      : 'border-white/20 bg-neutral-950/90 text-white'

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 md:hidden">
      <div className="px-2.5 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div
          className={`w-[min(54vw,22rem)] rounded-2xl border px-2.5 py-1.5 shadow-xl backdrop-blur-md ${barTone}`}
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3">
            <div className="min-w-0">
              <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                {stageLabel}
              </p>
              <p className="truncate text-[0.65rem] font-bold text-neutral-300">{activeNpcCount} Meebits</p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[0.55rem] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                {label}
              </p>
              <p className="text-lg font-black tabular-nums leading-tight">{value}</p>
            </div>
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
          {targetNpcs.map((npc) => (
            <div
              key={npc.id}
              className={`flex items-center rounded-xl border shadow-lg backdrop-blur-md ${targetLayout.itemGap} ${targetLayout.itemPadding} ${
                isAnswerReveal
                  ? 'border-amber-300/40 bg-amber-950/90'
                  : 'border-white/20 bg-neutral-950/90'
              }`}
            >
              <p className={targetLayout.idClassName}>#{npc.meebitNumber}</p>
              <TargetPreview
                meebitNumber={npc.meebitNumber}
                modelScale={targetLayout.modelScale}
                cameraDistance={3.05}
                modelYOffset={-1.0}
                sizeClassName={`${targetLayout.previewSize} shrink-0 rounded-lg`}
              />
            </div>
          ))}
        </div>
      ) : null}
    </header>
  )
}
