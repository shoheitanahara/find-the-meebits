import { getLocale } from '../locale'
import {
  CLUB_CREATOR_DIALOGUE_JA,
  CLUB_FIRST_MEETING_JA,
  CLUB_RETURNING_JA,
  CLUB_TARGET_FOUND_JA,
} from './clubJa'
import {
  MUSEUM_CREATOR_DIALOGUE_JA,
  MUSEUM_FIRST_MEETING_JA,
  MUSEUM_RETURNING_JA,
  MUSEUM_TARGET_FOUND_JA,
} from './museumJa'
import {
  CLUB_CREATOR_DIALOGUE_LINES,
  CLUB_FIRST_MEETING_DIALOGUE,
  CLUB_RETURNING_DIALOGUE,
  CLUB_TARGET_FOUND_LINES,
} from '../../npc/npcClubDialogue'
import {
  MUSEUM_FIRST_MEETING_DIALOGUE,
  MUSEUM_RETURNING_DIALOGUE,
  MUSEUM_TARGET_FOUND_LINES,
} from '../../npc/npcDialoguePool'
import type { DialogueLine } from '../../npc/npcTypes'
import type { VenueId } from '../../game/venueConfig'

export function getFirstMeetingDialogue(venueId: VenueId): string[] {
  if (getLocale() === 'ja') {
    return venueId === 'club' ? CLUB_FIRST_MEETING_JA : MUSEUM_FIRST_MEETING_JA
  }

  return venueId === 'club' ? CLUB_FIRST_MEETING_DIALOGUE : MUSEUM_FIRST_MEETING_DIALOGUE
}

export function getReturningDialogue(venueId: VenueId): string[] {
  if (getLocale() === 'ja') {
    return venueId === 'club' ? CLUB_RETURNING_JA : MUSEUM_RETURNING_JA
  }

  return venueId === 'club' ? CLUB_RETURNING_DIALOGUE : MUSEUM_RETURNING_DIALOGUE
}

export function getTargetFoundLines(venueId: VenueId): readonly string[] {
  if (getLocale() === 'ja') {
    return venueId === 'club' ? CLUB_TARGET_FOUND_JA : MUSEUM_TARGET_FOUND_JA
  }

  return venueId === 'club' ? CLUB_TARGET_FOUND_LINES : MUSEUM_TARGET_FOUND_LINES
}

export function getMuseumCreatorDialogueJa(): DialogueLine[] {
  return MUSEUM_CREATOR_DIALOGUE_JA
}

export function getClubCreatorDialogue(): DialogueLine[] {
  return getLocale() === 'ja' ? CLUB_CREATOR_DIALOGUE_JA : CLUB_CREATOR_DIALOGUE_LINES
}
