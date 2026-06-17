import { useDialogueStore } from '../dialogue/dialogueStore'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'

export function advanceDialogue() {
  const dialogue = useDialogueStore.getState()
  if (!dialogue.isOpen) {
    return
  }

  const hasNext = dialogue.nextLine()
  if (hasNext) {
    return
  }

  const foundNpcId = dialogue.activeNpcId
  const completionAction = dialogue.closeDialogue()
  if (completionAction === 'clearGame' && foundNpcId) {
    useGameStore.getState().clearGame(foundNpcId)
    return
  }

  usePlayerStore.getState().setMovementLocked(false)
}
