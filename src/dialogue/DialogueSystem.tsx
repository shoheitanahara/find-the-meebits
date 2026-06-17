import { useEffect } from 'react'
import { advanceDialogue } from './advanceDialogue'
import { useDialogueStore } from './dialogueStore'
import { interactWithNearestNpc } from '../systems/interaction/interactWithNearestNpc'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'

export function DialogueSystem() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const dialogue = useDialogueStore.getState()

      if (event.code === 'Escape' && dialogue.isOpen) {
        event.preventDefault()
        closeDialogue()
        return
      }

      if (dialogue.isOpen) {
        if (event.code === 'Enter' || event.code === 'KeyE' || event.code === 'Space') {
          event.preventDefault()
          advanceDialogue()
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

function closeDialogue() {
  const dialogue = useDialogueStore.getState()
  const foundNpcId = dialogue.activeNpcId
  const completionAction = dialogue.closeDialogue()

  if (completionAction === 'clearGame' && foundNpcId) {
    useGameStore.getState().clearGame(foundNpcId)
    return
  }

  usePlayerStore.getState().setMovementLocked(false)
}
