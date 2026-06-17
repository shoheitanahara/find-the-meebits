import { useEffect, useState } from 'react'
import { GAME_TIME_LIMIT_SECONDS } from '../game/gameConfig'
import { getElapsedSeconds, getRemainingSeconds, useGameStore } from '../stores/gameStore'

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
    <div className="pointer-events-none absolute left-1/2 top-5 z-30 -translate-x-1/2">
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

function getTimerDisplay(
  gamePhase: ReturnType<typeof useGameStore.getState>['gamePhase'],
  startedAt: number | null,
  clearTimeSeconds: number | null,
) {
  if (gamePhase === 'preparing') {
    return {
      label: 'Starting Soon',
      value: formatTimerSeconds(GAME_TIME_LIMIT_SECONDS),
      urgent: false,
    }
  }

  if (gamePhase === 'playing') {
    const remaining = getRemainingSeconds(startedAt)
    return {
      label: 'Time Left',
      value: formatTimerSeconds(remaining),
      urgent: remaining <= 30,
    }
  }

  if (gamePhase === 'timedOut') {
    return {
      label: 'Time Up',
      value: '0:00',
      urgent: true,
    }
  }

  if (gamePhase === 'cleared' || gamePhase === 'conquered') {
    return {
      label: 'Clear Time',
      value: formatTimerSeconds(clearTimeSeconds ?? 0),
      urgent: false,
    }
  }

  return {
    label: 'Time Limit',
    value: formatTimerSeconds(GAME_TIME_LIMIT_SECONDS),
    urgent: false,
  }
}

function formatTimerSeconds(seconds: number) {
  const clamped = Math.max(0, seconds)
  const minutes = Math.floor(clamped / 60)
  const remainingSeconds = Math.floor(clamped % 60)
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}
