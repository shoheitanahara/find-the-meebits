import type { VenueId } from '../game/venueConfig'

type VenueBgmConfig = {
  url: string
  volume: number
}

/** Ambient loops — served from /public/audio (or VITE_BGM_BASE_URL when set). */
export const VENUE_BGM: Record<VenueId, VenueBgmConfig> = {
  museum: {
    url: '/audio/museum-bgm.mp3',
    volume: 0.7,
  },
  club: {
    url: '/audio/club-bgm.mp3',
    volume: 0.11,
  },
}

const BGM_BASE_URL = (import.meta.env.VITE_BGM_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export function resolveVenueBgmUrl(venueId: VenueId) {
  const path = VENUE_BGM[venueId].url
  return BGM_BASE_URL ? `${BGM_BASE_URL}${path}` : path
}

export function isVenueBgmPlaybackPhase(gamePhase: string) {
  return (
    gamePhase === 'preparing' ||
    gamePhase === 'playing' ||
    gamePhase === 'timedOut' ||
    gamePhase === 'cleared'
  )
}
