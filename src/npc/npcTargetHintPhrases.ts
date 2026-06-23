import type { VenueId } from '../game/venueConfig'

export type MapZone = 'entrance' | 'front' | 'center' | 'back' | 'west' | 'east'

type VenueHintPhrases = {
  zone: Record<MapZone, string[]>
  sameZone: Record<MapZone, string[]>
  farZone: Record<MapZone, string[]>
  veryClose: string[]
  prefixes: string[]
}

const MUSEUM_HINT_PHRASES: VenueHintPhrases = {
  prefixes: ['Hint:'],
  veryClose: ['somewhere near you. Keep looking'],
  zone: {
    entrance: ['near the entrance', 'in the entrance area'],
    front: ['in the front half of the museum', 'in the front part of the gallery'],
    center: ['in the middle of the museum', 'around the center of the gallery'],
    back: ['in the back half of the museum', 'in the back part of the gallery'],
    west: ['on the west side of the museum', 'in the west area of the gallery'],
    east: ['on the east side of the museum', 'in the east area of the gallery'],
  },
  sameZone: {
    entrance: ['in this entrance area with you. Keep looking'],
    front: ['in this front area with you. Keep looking'],
    center: ['in this middle area with you. Keep looking'],
    back: ['in this back area with you. Keep looking'],
    west: ['on the west side with you. Keep looking'],
    east: ['on the east side with you. Keep looking'],
  },
  farZone: {
    entrance: ['far toward the entrance area'],
    front: ['far toward the front of the museum'],
    center: ['far toward the middle of the museum'],
    back: ['far toward the back of the museum'],
    west: ['far toward the west side of the museum'],
    east: ['far toward the east side of the museum'],
  },
}

const CLUB_HINT_PHRASES: VenueHintPhrases = {
  prefixes: ['Hint:', 'Word on the floor:'],
  veryClose: ['right nearby on the dance floor. Keep looking', 'somewhere close in this crowd. Keep looking'],
  zone: {
    entrance: ['near the entrance arch', 'by the front doors'],
    front: ['on the front of the dance floor', 'near the front lights'],
    center: ['in the middle of the dance floor', 'under the center spotlight'],
    back: ['near the DJ booth', 'in the back by the decks'],
    west: ['on the west side of the club', 'near the west VIP lounge'],
    east: ['on the east side of the club', 'near the east VIP lounge'],
  },
  sameZone: {
    entrance: ['in this entrance area with you. Keep looking'],
    front: ['on this part of the dance floor with you. Keep looking'],
    center: ['in this crowd with you. Keep looking'],
    back: ['back here by the decks with you. Keep looking'],
    west: ['on the west side with you. Keep looking'],
    east: ['on the east side with you. Keep looking'],
  },
  farZone: {
    entrance: ['far toward the entrance arch'],
    front: ['far toward the front of the dance floor'],
    center: ['far toward the center lights'],
    back: ['far toward the DJ booth'],
    west: ['far toward the west bar and VIP side'],
    east: ['far toward the east bar and VIP side'],
  },
}

export function getVenueHintPhrases(venueId: VenueId): VenueHintPhrases {
  return venueId === 'club' ? CLUB_HINT_PHRASES : MUSEUM_HINT_PHRASES
}
