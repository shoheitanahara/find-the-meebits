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

  const completionAction = dialogue.closeDialogue()
  if (completionAction === 'clearGame') {
    useGameStore.getState().clearGame()
    return
  }

  usePlayerStore.getState().setMovementLocked(false)
}
