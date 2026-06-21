import { PLAYER_START_POSITION } from '../game/gameConfig'
import { resetPlayerWorldState } from '../avatar/playerWorldState'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { playSfx, unlockAudioIfNeeded } from './sfx'

type StageRetryButtonProps = {
  className?: string
  compact?: boolean
}

export function StageRetryButton({ className = '', compact = false }: StageRetryButtonProps) {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const retryStage = useGameStore((state) => state.retryStage)
  const canRetry = gamePhase === 'playing' || gamePhase === 'timedOut'

  if (!canRetry) {
    return null
  }

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

  return (
    <button
      type="button"
      className={`pointer-events-auto shrink-0 rounded-full border font-black uppercase tracking-[0.12em] text-white shadow-lg backdrop-blur-md transition active:scale-95 ${
        compact
          ? 'border-white/25 bg-neutral-950/85 px-2 py-0.5 text-[0.5rem] hover:bg-neutral-900'
          : 'border-white/30 bg-neutral-950/85 px-3 py-1.5 text-[0.65rem] hover:bg-neutral-900'
      } ${className}`}
      onClick={handleRetry}
    >
      Retry
    </button>
  )
}
