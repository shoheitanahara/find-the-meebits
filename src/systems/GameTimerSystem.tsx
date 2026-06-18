import { useEffect } from 'react'
import { GAME_TIME_LIMIT_SECONDS } from '../game/gameConfig'
import { isTimedGameMode } from '../game/gameMode'
import { getElapsedSeconds, useGameStore } from '../stores/gameStore'
import { useDialogueStore } from '../dialogue/dialogueStore'

export function GameTimerSystem() {
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const game = useGameStore.getState()

      if (!isTimedGameMode(game.gameMode) || game.gamePhase !== 'playing' || game.startedAt === null) {
        return
      }

      if (getElapsedSeconds(game.startedAt) < GAME_TIME_LIMIT_SECONDS) {
        return
      }

      if (useDialogueStore.getState().isOpen) {
        useDialogueStore.getState().closeDialogue()
      }

      game.timeUp()
    }, 100)

    return () => window.clearInterval(intervalId)
  }, [])

  return null
}
