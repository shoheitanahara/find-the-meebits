import { GAME_TIME_LIMIT_SECONDS } from '../game/gameConfig'
import { getRemainingSeconds, useGameStore } from '../stores/gameStore'

export function getTimerDisplay(
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

export function formatTimerSeconds(seconds: number) {
  const clamped = Math.max(0, seconds)
  const minutes = Math.floor(clamped / 60)
  const remainingSeconds = Math.floor(clamped % 60)
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}
