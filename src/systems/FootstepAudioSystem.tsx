import { useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { playSfx } from '../ui/sfx'

const FOOTSTEP_INTERVAL_MS = 250

export function FootstepAudioSystem() {
  useEffect(() => {
    let lastStepAt = 0

    const intervalId = window.setInterval(() => {
      const { isMoving, movementLocked } = usePlayerStore.getState()
      const { gamePhase } = useGameStore.getState()
      const canStep =
        isMoving &&
        !movementLocked &&
        (gamePhase === 'playing' || gamePhase === 'timedOut')

      if (!canStep) {
        return
      }

      const now = Date.now()
      if (now - lastStepAt < FOOTSTEP_INTERVAL_MS) {
        return
      }

      lastStepAt = now
      playSfx('footstep')
    }, 60)

    return () => window.clearInterval(intervalId)
  }, [])

  return null
}
