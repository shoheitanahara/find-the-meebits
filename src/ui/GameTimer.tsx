import { useEffect, useState } from 'react'
import { getTimerDisplay } from './gameTimerDisplay'
import { useGameStore } from '../stores/gameStore'

export function GameTimer() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const startedAt = useGameStore((state) => state.startedAt)
  const clearTimeSeconds = useGameStore((state) => state.clearTimeSeconds)
  const [, setTick] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => setTick((value) => value + 1), 100)
    return () => window.clearInterval(intervalId)
  }, [])

  const { label, value, urgent } = getTimerDisplay(gamePhase, startedAt, clearTimeSeconds)

  return (
    <div className="pointer-events-none absolute left-1/2 top-5 z-30 hidden -translate-x-1/2 md:block">
      <section
        className={`rounded-full border px-5 py-2 text-center shadow-xl shadow-black/20 backdrop-blur-md ${
          urgent
            ? 'border-red-400/50 bg-red-950/85 text-red-100'
            : 'border-white/30 bg-neutral-950/85 text-white'
        }`}
      >
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-neutral-400">{label}</p>
        <p className="text-2xl font-black tabular-nums tracking-tight">{value}</p>
      </section>
    </div>
  )
}
