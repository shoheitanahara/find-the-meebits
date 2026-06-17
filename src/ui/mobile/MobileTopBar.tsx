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
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 px-2.5 pt-[max(0.5rem,env(safe-area-inset-top))] md:hidden">
      <div
        className={`rounded-2xl border px-2.5 py-1.5 shadow-xl backdrop-blur-md ${
          urgent
            ? 'border-red-400/40 bg-red-950/90 text-red-50'
            : isAnswerReveal
              ? 'border-amber-300/40 bg-amber-950/90 text-amber-50'
              : 'border-white/20 bg-neutral-950/90 text-white'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 shrink">
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Stage {stage}
            </p>
            <p className="truncate text-[0.65rem] font-bold text-neutral-300">{activeNpcCount} Meebits</p>
          </div>

          <div className="shrink-0 text-center">
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              {label}
            </p>
            <p className="text-lg font-black tabular-nums leading-tight">{value}</p>
          </div>

          {targetNpc ? (
            <div className="flex min-w-0 shrink-0 items-center gap-1.5">
              <div className="min-w-0 text-right">
                <p
                  className={`text-[0.55rem] font-semibold uppercase tracking-[0.15em] ${
                    isAnswerReveal ? 'text-amber-200/90' : 'text-neutral-400'
                  }`}
                >
                  {isAnswerReveal ? 'Answer' : 'Target'}
                </p>
                <p className="text-sm font-black leading-tight">#{targetNpc.meebitNumber}</p>
              </div>
              <TargetPreview
                meebitNumber={targetNpc.meebitNumber}
                modelScale={1.12}
                cameraDistance={3.05}
                modelYOffset={-1.00}
                sizeClassName="h-[4.25rem] w-[4.25rem] shrink-0 rounded-xl"
              />
            </div>
          ) : (
            <div className="w-[4.25rem]" />
          )}
        </div>
      </div>
    </header>
  )
}
