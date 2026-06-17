import { useDialogueStore } from '../../dialogue/dialogueStore'
import { getNpcById } from '../../npc/npcData'
import { selectDialogueLines } from '../../npc/npcDialogue'
import { useGameStore } from '../../stores/gameStore'
import { useNpcStore } from '../../stores/npcStore'
import { usePlayerStore } from '../../stores/playerStore'
import { loadSaveData, recordNpcTalk } from '../save/localStorage'

export function interactWithNearestNpc(): boolean {
  const dialogue = useDialogueStore.getState()
  if (dialogue.isOpen) {
    return false
  }

  const game = useGameStore.getState()
  if (game.gamePhase !== 'playing') {
    return false
  }

  const targetNpcId = useNpcStore.getState().nearestNpcId
  if (!targetNpcId) {
    return false
  }

  const npc = getNpcById(targetNpcId)
  if (!npc) {
    return false
  }

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
    return true
  }

  const saveData = loadSaveData()
  const talkCount = saveData.talkedCountByNPC[targetNpcId] ?? 0
  const lines = selectDialogueLines(npc, talkCount)
  const playerPosition = usePlayerStore.getState().position

  recordNpcTalk(targetNpcId, playerPosition)
  usePlayerStore.getState().setMovementLocked(true)
  dialogue.openDialogue(targetNpcId, lines)
  return true
}
