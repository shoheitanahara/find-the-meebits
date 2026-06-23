import type { VenueId } from '../game/venueConfig'

export type GameTip = {
  title: string
  body: string
}

export const MUSEUM_GAME_TIPS: GameTip[] = [
  {
    title: 'Red marker',
    body: 'Walk up to a Meebit. A red dot above them means you can talk.',
  },
  {
    title: 'Friendly NPCs',
    body: 'Everyone in the museum is on your team. Chat often — someone may surprise you with a hint.',
  },
  {
    title: 'Find your target',
    body: 'Match the target shown in the corner. Wrong Meebit? Keep searching and keep talking.',
  },
]

export const CLUB_GAME_TIPS: GameTip[] = [
  {
    title: 'Red marker',
    body: 'Walk up to a Meebit on the floor. A red dot above them means you can talk.',
  },
  {
    title: 'Club crowd',
    body: 'Everyone in After Hours is fair game to chat with. Someone near the bar, DJ booth, or VIP lounge might drop a hint.',
  },
  {
    title: 'Find your target',
    body: 'Match the target in the corner. Wrong face? Keep moving through the lights and keep talking.',
  },
]

/** @deprecated Use getGameTipsForVenue instead */
export const GAME_TIPS = MUSEUM_GAME_TIPS

export function getGameTipsForVenue(venueId: VenueId): GameTip[] {
  return venueId === 'club' ? CLUB_GAME_TIPS : MUSEUM_GAME_TIPS
}

export function getLoadingLabelForVenue(venueId: VenueId) {
  return venueId === 'club' ? 'Loading the club' : 'Loading the museum'
}
