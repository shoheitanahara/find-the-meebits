import { CREATOR_NPC_ID } from '../game/gameConfig'
import { useGameStore } from '../stores/gameStore'
import { useNpcStore } from '../stores/npcStore'
import { usePlayerStore } from '../stores/playerStore'
import { getNpcById } from './npcData'
import type { DialogueLine, NPCProfile } from './npcTypes'
import {
  CLUB_CREATOR_DIALOGUE_LINES,
  CLUB_FIRST_MEETING_DIALOGUE,
  CLUB_RETURNING_DIALOGUE,
} from './npcClubDialogue'
import {
  MUSEUM_FIRST_MEETING_DIALOGUE,
  MUSEUM_RETURNING_DIALOGUE,
} from './npcDialoguePool'
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
    return toDialogueLine('npc-unknown', talkCount, 0, 'I do not think I am your target, but hello anyway.')
  }

  const index = seededIndex(seed, talkCount, lines.length)
  return lines[index]
}

function pickWandererLine(npc: NPCProfile, talkCount: number, venueId: 'museum' | 'club'): string {
  const isFirstMeeting = talkCount === 0
  const pool =
    venueId === 'club'
      ? isFirstMeeting
        ? CLUB_FIRST_MEETING_DIALOGUE
        : CLUB_RETURNING_DIALOGUE
      : isFirstMeeting
        ? MUSEUM_FIRST_MEETING_DIALOGUE
        : MUSEUM_RETURNING_DIALOGUE

  const index = seededIndex(npc.meebitNumber + npc.id.length, talkCount, pool.length)
  return pool[index]
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

  const poolIndex = seededIndex(npc.meebitNumber + npc.id.length, talkCount, 10_000)
  const text = pickWandererLine(npc, talkCount, venueId)

  return [toDialogueLine(npc.id, talkCount, poolIndex, text)]
}
