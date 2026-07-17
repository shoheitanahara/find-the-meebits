import { ui } from '../i18n/ui'

export type GameMode = 'challenge' | 'enjoy'

export const DEFAULT_GAME_MODE: GameMode = 'challenge'

export function isTimedGameMode(gameMode: GameMode) {
  return gameMode === 'challenge'
}

export function getGameModeLabel(gameMode: GameMode) {
  return gameMode === 'challenge' ? ui().challenge : ui().enjoy
}

export function getGameModeDescription(gameMode: GameMode) {
  return gameMode === 'challenge' ? ui().challengeDesc : ui().enjoyDesc
}
