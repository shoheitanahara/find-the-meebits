import { useDialogueStore } from '../../dialogue/dialogueStore'
import { getNpcById } from '../../npc/npcData'
import { CLUB_TARGET_FOUND_LINES } from '../../npc/npcClubDialogue'
import { selectDialogueLines } from '../../npc/npcDialogue'
import { useGameStore } from '../../stores/gameStore'
import { useNpcStore } from '../../stores/npcStore'
import { usePlayerStore } from '../../stores/playerStore'
import { loadSaveData, recordNpcTalk } from '../save/localStorage'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'

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

  unlockAudioIfNeeded()
  playSfx('talk')

  if (
    game.targetNpcIds.includes(targetNpcId) &&
    !game.foundTargetNpcIds.includes(targetNpcId)
  ) {
    recordNpcTalk(targetNpcId, usePlayerStore.getState().position)
    usePlayerStore.getState().setMovementLocked(true)
    const foundLine =
      game.venueId === 'club'
        ? `Meebit #${npc.meebitNumber}: ${CLUB_TARGET_FOUND_LINES[npc.meebitNumber % CLUB_TARGET_FOUND_LINES.length]}`
        : `Meebit #${npc.meebitNumber}: You found me. Nice eye.`
    dialogue.openDialogue(
      targetNpcId,
      [
        {
          id: `${targetNpcId}-target-found`,
          text: foundLine,
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
