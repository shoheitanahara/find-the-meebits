import { useEffect } from 'react'
import { useDialogueStore } from '../dialogue/dialogueStore'
import { interactWithNearestNpc } from '../systems/interaction/interactWithNearestNpc'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'

export function DialogueSystem() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const dialogue = useDialogueStore.getState()

      if (event.code === 'Escape' && dialogue.isOpen) {
        event.preventDefault()
        finishDialogue()
        return
      }

      if (dialogue.isOpen) {
        if (event.code === 'Enter' || event.code === 'KeyE' || event.code === 'Space') {
          event.preventDefault()
          const hasNext = dialogue.nextLine()
          if (!hasNext) {
            finishDialogue()
          }
        }
        return
      }

      if (event.code !== 'KeyE') {
        return
      }

      event.preventDefault()
      interactWithNearestNpc()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return null
}

function finishDialogue() {
  const completionAction = useDialogueStore.getState().closeDialogue()

  if (completionAction === 'clearGame') {
    useGameStore.getState().clearGame()
    return
  }

  usePlayerStore.getState().setMovementLocked(false)
}
