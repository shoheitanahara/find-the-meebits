/** After Hours ambient loop — served from /public/audio */
export const CLUB_BGM_URL = '/audio/club-bgm.mp3'

/** Keep under footsteps / UI SFX; club should feel distant */
export const CLUB_BGM_VOLUME = 0.11

export function isClubBgmPlaybackPhase(gamePhase: string) {
  return (
    gamePhase === 'preparing' ||
    gamePhase === 'playing' ||
    gamePhase === 'timedOut' ||
    gamePhase === 'cleared'
  )
}
