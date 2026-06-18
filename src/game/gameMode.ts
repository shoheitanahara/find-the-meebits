export type GameMode = 'challenge' | 'enjoy'

export const DEFAULT_GAME_MODE: GameMode = 'challenge'

export function isTimedGameMode(gameMode: GameMode) {
  return gameMode === 'challenge'
}

export function getGameModeLabel(gameMode: GameMode) {
  return gameMode === 'challenge' ? 'Challenge' : 'Enjoy'
}

export function getGameModeDescription(gameMode: GameMode) {
  if (gameMode === 'challenge') {
    return '3 minutes per stage. Beat the clock through all 8 stages.'
  }

  return 'No timer. Take your time and find every target.'
}
