import { useDialogueStore } from '../../dialogue/dialogueStore'
import { getTargetFoundLines } from '../../i18n/dialogue'
import { getNpcById } from '../../npc/npcData'
import { selectDialogueLines } from '../../npc/npcDialogue'
import { useGameStore } from '../../stores/gameStore'
import { useNpcStore } from '../../stores/npcStore'
import { usePlayerStore } from '../../stores/playerStore'
import { getMeebitTalkCount, recordMeebitTalk } from '../save/localStorage'
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
    recordMeebitTalk(npc.meebitNumber, usePlayerStore.getState().position)
    usePlayerStore.getState().setMovementLocked(true)
    const foundLines = getTargetFoundLines(game.venueId)
    const foundLine = foundLines[npc.meebitNumber % foundLines.length]
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

  const talkCount = getMeebitTalkCount(npc.meebitNumber)
  const lines = selectDialogueLines(npc, talkCount)
  const playerPosition = usePlayerStore.getState().position

  recordMeebitTalk(npc.meebitNumber, playerPosition)
  usePlayerStore.getState().setMovementLocked(true)
  dialogue.openDialogue(targetNpcId, lines)
  return true
}
