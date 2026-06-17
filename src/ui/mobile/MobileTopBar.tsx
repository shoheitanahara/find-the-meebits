import { useEffect, useState } from 'react'
import { getNpcById } from '../../npc/npcData'
import { useGameStore } from '../../stores/gameStore'
import { getTimerDisplay } from '../gameTimerDisplay'
import { TargetPreview } from '../TargetPreview'

export function MobileTopBar() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const stage = useGameStore((state) => state.stage)
  const activeNpcCount = useGameStore((state) => state.activeNpcCount)
  const targetNpcId = useGameStore((state) => state.targetNpcId)
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

  const targetNpc = getNpcById(targetNpcId)
  const { label, value, urgent } = getTimerDisplay(gamePhase, startedAt, clearTimeSeconds)

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:hidden">
      <div
        className={`rounded-2xl border px-3 py-2 shadow-xl backdrop-blur-md ${
          urgent
            ? 'border-red-400/40 bg-red-950/90 text-red-50'
            : isAnswerReveal
              ? 'border-amber-300/40 bg-amber-950/90 text-amber-50'
              : 'border-white/20 bg-neutral-950/90 text-white'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              Stage {stage}
            </p>
            <p className="truncate text-xs font-bold text-neutral-200">{activeNpcCount} Meebits</p>
          </div>
          <div className="text-center">
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              {label}
            </p>
            <p className="text-xl font-black tabular-nums leading-tight">{value}</p>
          </div>
          {targetNpc ? (
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 text-right">
                <p
                  className={`text-[0.55rem] font-semibold uppercase tracking-[0.2em] ${
                    isAnswerReveal ? 'text-amber-200/90' : 'text-neutral-400'
                  }`}
                >
                  {isAnswerReveal ? 'Answer' : 'Target'}
                </p>
                <p className="text-sm font-black">#{targetNpc.meebitNumber}</p>
              </div>
              <TargetPreview
                meebitNumber={targetNpc.meebitNumber}
                modelScale={1}
                sizeClassName="h-14 w-14 shrink-0"
              />
            </div>
          ) : (
            <div className="w-14" />
          )}
        </div>
      </div>
    </header>
  )
}
