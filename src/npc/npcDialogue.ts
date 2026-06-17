import { CREATOR_NPC_ID } from '../game/gameConfig'
import { useGameStore } from '../stores/gameStore'
import { useNpcStore } from '../stores/npcStore'
import { usePlayerStore } from '../stores/playerStore'
import { getNpcById } from './npcData'
import type { DialogueLine, NPCProfile } from './npcTypes'
import { WANDERER_DIALOGUE_POOL } from './npcDialoguePool'
import { buildTargetLocationHint } from './npcTargetHint'

const TARGET_HINT_CHANCE = 0.2

function seededIndex(seed: number, talkCount: number, length: number) {
  const value = Math.sin(seed * 12.9898 + talkCount * 78.233) * 43758.5453
  return Math.floor((value - Math.floor(value)) * length)
}

function toDialogueLine(
  npcId: string,
  talkCount: number,
  index: number,
  text: string,
  category: DialogueLine['category'] = 'daily',
): DialogueLine {
  return {
    id: `${npcId}-talk-${talkCount}-${index}`,
    text,
    category,
  }
}

function pickOneLine(lines: DialogueLine[], seed: number, talkCount: number): DialogueLine {
  if (lines.length === 0) {
    return toDialogueLine('npc-unknown', talkCount, 0, 'Not your target.')
  }

  const index = seededIndex(seed, talkCount, lines.length)
  return lines[index]
}

function maybeBuildTargetHintLine(npc: NPCProfile, talkCount: number): DialogueLine | null {
  if (Math.random() >= TARGET_HINT_CHANCE) {
    return null
  }

  const targetNpcId = useGameStore.getState().targetNpcId
  if (!targetNpcId || targetNpcId === npc.id) {
    return null
  }

  const targetNpc = getNpcById(targetNpcId)
  if (!targetNpc) {
    return null
  }

  const playerPosition = usePlayerStore.getState().position
  const targetPosition = useNpcStore.getState().npcPositions[targetNpcId] ?? targetNpc.position
  const text = buildTargetLocationHint(playerPosition, targetPosition)

  return toDialogueLine(npc.id, talkCount, -1, text, 'hint')
}

export function selectDialogueLines(npc: NPCProfile, talkCount: number): DialogueLine[] {
  if (npc.id === CREATOR_NPC_ID) {
    return [pickOneLine(npc.dialogues, npc.meebitNumber, talkCount)]
  }

  const hintLine = maybeBuildTargetHintLine(npc, talkCount)
  if (hintLine) {
    return [hintLine]
  }

  const poolIndex = seededIndex(npc.meebitNumber + npc.id.length, talkCount, WANDERER_DIALOGUE_POOL.length)
  const text = WANDERER_DIALOGUE_POOL[poolIndex]

  return [toDialogueLine(npc.id, talkCount, poolIndex, text)]
}
