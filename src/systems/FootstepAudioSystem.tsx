import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { playSfx } from '../ui/sfx'

const FOOTSTEP_INTERVAL_SEC = 0.25

export function FootstepAudioSystem() {
  const stepTimerRef = useRef(0)

  useFrame((_, delta) => {
    const { isMoving, movementLocked } = usePlayerStore.getState()
    const { gamePhase } = useGameStore.getState()
    const canStep =
      isMoving &&
      !movementLocked &&
      (gamePhase === 'playing' || gamePhase === 'timedOut')

    if (!canStep) {
      stepTimerRef.current = 0
      return
    }

    stepTimerRef.current += delta
    if (stepTimerRef.current < FOOTSTEP_INTERVAL_SEC) {
      return
    }

    stepTimerRef.current -= FOOTSTEP_INTERVAL_SEC
    playSfx('footstep')
  })

  return null
}
