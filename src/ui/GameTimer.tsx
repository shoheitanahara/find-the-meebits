import { useEffect, useState } from 'react'
import { getTimerDisplay } from './gameTimerDisplay'
import { StageRetryButton } from './StageRetryButton'
import { useGameStore } from '../stores/gameStore'

export function GameTimer() {
  const gameMode = useGameStore((state) => state.gameMode)
  const gamePhase = useGameStore((state) => state.gamePhase)
  const startedAt = useGameStore((state) => state.startedAt)
  const clearTimeSeconds = useGameStore((state) => state.clearTimeSeconds)
  const [, setTick] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => setTick((value) => value + 1), 100)
    return () => window.clearInterval(intervalId)
  }, [])

  const timerDisplay = getTimerDisplay(gamePhase, startedAt, clearTimeSeconds, gameMode)
  const showRetry = gamePhase === 'playing' || gamePhase === 'timedOut'

  if (!timerDisplay && !showRetry) {
    return null
  }

  const urgent = timerDisplay?.urgent ?? false

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 hidden flex-col items-center gap-1 px-5 pt-5 md:flex">
      {timerDisplay ? (
        <section
          className={`rounded-full border px-5 py-2 text-center shadow-xl shadow-black/20 backdrop-blur-md ${
            urgent
              ? 'border-red-400/50 bg-red-950/85 text-red-100'
              : 'border-white/30 bg-neutral-950/85 text-white'
          }`}
        >
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-neutral-400">
            {timerDisplay.label}
          </p>
          <p className="text-2xl font-black tabular-nums tracking-tight">{timerDisplay.value}</p>
        </section>
      ) : null}
      {showRetry ? <StageRetryButton /> : null}
    </div>
  )
}
