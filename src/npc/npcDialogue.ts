import { CREATOR_NPC_ID } from '../game/gameConfig'
import { useGameStore } from '../stores/gameStore'
import { useNpcStore } from '../stores/npcStore'
import { usePlayerStore } from '../stores/playerStore'
import { getNpcById } from './npcData'
import type { DialogueLine, NPCProfile } from './npcTypes'
import { CLUB_CREATOR_DIALOGUE_LINES, CLUB_WANDERER_DIALOGUE_POOL } from './npcClubDialogue'
import { WANDERER_DIALOGUE_POOL } from './npcDialoguePool'
import { buildTargetLocationHint } from './npcTargetHint'

const TARGET_HINT_CHANCE = 0.25

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

  const { targetNpcIds, foundTargetNpcIds } = useGameStore.getState()
  const unfoundTargetNpcIds = targetNpcIds.filter(
    (id) => id !== npc.id && !foundTargetNpcIds.includes(id),
  )
  if (unfoundTargetNpcIds.length === 0) {
    return null
  }

  const hintTargetId = unfoundTargetNpcIds[Math.floor(Math.random() * unfoundTargetNpcIds.length)]
  const targetNpc = getNpcById(hintTargetId)
  if (!targetNpc) {
    return null
  }

  const playerPosition = usePlayerStore.getState().position
  const targetPosition = useNpcStore.getState().npcPositions[hintTargetId] ?? targetNpc.position
  const text = buildTargetLocationHint(
    playerPosition,
    targetPosition,
    talkCount + hintTargetId.length + npc.meebitNumber,
    useGameStore.getState().venueId,
  )

  return toDialogueLine(npc.id, talkCount, -1, text, 'hint')
}

export function selectDialogueLines(npc: NPCProfile, talkCount: number): DialogueLine[] {
  const venueId = useGameStore.getState().venueId

  if (npc.id === CREATOR_NPC_ID) {
    const creatorLines = venueId === 'club' ? CLUB_CREATOR_DIALOGUE_LINES : npc.dialogues
    return [pickOneLine(creatorLines, npc.meebitNumber, talkCount)]
  }

  const hintLine = maybeBuildTargetHintLine(npc, talkCount)
  if (hintLine) {
    return [hintLine]
  }

  const wandererPool = venueId === 'club' ? CLUB_WANDERER_DIALOGUE_POOL : WANDERER_DIALOGUE_POOL
  const poolIndex = seededIndex(npc.meebitNumber + npc.id.length, talkCount, wandererPool.length)
  const text = wandererPool[poolIndex]

  return [toDialogueLine(npc.id, talkCount, poolIndex, text)]
}
