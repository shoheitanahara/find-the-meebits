import { useEffect } from 'react'
import { getNpcById } from '../npc/npcData'
import { selectDialogueLines } from '../npc/npcDialogue'
import { loadSaveData, recordNpcTalk } from '../systems/save/localStorage'
import { useGameStore } from '../stores/gameStore'
import { useNpcStore } from '../stores/npcStore'
import { usePlayerStore } from '../stores/playerStore'
import { useDialogueStore } from './dialogueStore'

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

      const game = useGameStore.getState()
      if (game.gamePhase !== 'playing') {
        return
      }

      const targetNpcId = useNpcStore.getState().nearestNpcId
      if (!targetNpcId) return

      const npc = getNpcById(targetNpcId)
      if (!npc) return

      event.preventDefault()

      if (targetNpcId === game.targetNpcId) {
        recordNpcTalk(targetNpcId, usePlayerStore.getState().position)
        usePlayerStore.getState().setMovementLocked(true)
        dialogue.openDialogue(
          targetNpcId,
          [
            {
              id: `${targetNpcId}-target-found`,
              text: `Meebit #${npc.meebitNumber}: You found me. Nice eye.`,
              category: 'greeting',
            },
          ],
          'clearGame',
        )
        return
      }

      const saveData = loadSaveData()
      const talkCount = saveData.talkedCountByNPC[targetNpcId] ?? 0
      const lines = selectDialogueLines(npc, talkCount)
      const playerPosition = usePlayerStore.getState().position

      recordNpcTalk(targetNpcId, playerPosition)
      usePlayerStore.getState().setMovementLocked(true)
      dialogue.openDialogue(targetNpcId, lines)
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
