import { usePlayerStore } from '../stores/playerStore'
import type { GameMode } from './gameMode'
import { getProgressionStep, getStageLabel } from './gameProgression'

import type { VenueId } from './venueConfig'

/**
 * 開発ビルド専用の URL ブートストラップ（本番では無効）。
 *
 * 例:
 * - `?unlock=afterhours` — タイトルで After Hours ボタンを表示（localStorage 不要）
 * - `?stage=grandfinal&phase=conquered&unlock=afterhours` — 全制覇画面 → タイトルで After Hours
 * - `?venue=club&stage=1&phase=playing` — After Hours を即プレイ
 * - `?venue=club&stage=lastcall&phase=playing` — Last Call（5体）
 * - `?stage=grandfinal&phase=conquered` — Museum 全制覇画面
 */
export type DevBootstrapPhase =
  | 'intro'
  | 'preparing'
  | 'playing'
  | 'cleared'
  | 'timedout'
  | 'conquered'

export type DevBootstrapConfig = {
  venueId: VenueId
  progressionIndex: number
  phase: DevBootstrapPhase
  gameMode?: GameMode
  foundCount: number
  tipsAcknowledged: boolean
}

export type DevUnlockOverride = {
  hasConqueredMuseum: boolean
  hasConqueredClub: boolean
}

let cachedConfig: DevBootstrapConfig | null | undefined
let cachedUnlockOverride: DevUnlockOverride | null | undefined

export function getDevBootstrapConfig(): DevBootstrapConfig | null {
  if (cachedConfig !== undefined) {
    return cachedConfig
  }

  if (!import.meta.env.DEV || typeof window === 'undefined') {
    cachedConfig = null
    return null
  }

  const params = new URLSearchParams(window.location.search)
  const venueId = parseVenueId(params.get('venue'))
  const stageParam = params.get('stage')
  const phaseParam = params.get('phase')
  const unlockParam = params.get('unlock')

  if (!stageParam && !phaseParam && !unlockParam) {
    cachedConfig = null
    return null
  }

  if (!stageParam && !phaseParam) {
    cachedConfig = null
    return null
  }

  const resolvedStage = stageParam ?? '1'
  const progressionIndex = resolveProgressionIndexFromParam(resolvedStage, venueId)
  if (progressionIndex === null) {
    console.warn(`[devBootstrap] Unknown stage param: "${stageParam}"`)
    cachedConfig = null
    return null
  }

  const phase = parseDevPhase(params.get('phase'))
  const gameMode = parseGameMode(params.get('mode'))
  const foundCount = parseFoundCount(params.get('found'))
  const tipsAcknowledged = params.get('tips') !== '0'

  const config: DevBootstrapConfig = {
    venueId,
    progressionIndex,
    phase,
    gameMode,
    foundCount,
    tipsAcknowledged,
  }

  const step = getProgressionStep(progressionIndex, venueId)
  console.info(
    `[devBootstrap] ${venueId} · ${getStageLabel(step!)} (index ${progressionIndex}) · phase=${phase}` +
      (gameMode ? ` · mode=${gameMode}` : '') +
      (foundCount > 0 ? ` · found=${foundCount}` : ''),
  )

  cachedConfig = config
  return config
}

export function getDevUnlockOverride(): DevUnlockOverride | null {
  if (cachedUnlockOverride !== undefined) {
    return cachedUnlockOverride
  }

  if (!import.meta.env.DEV || typeof window === 'undefined') {
    cachedUnlockOverride = null
    return null
  }

  cachedUnlockOverride = parseDevUnlockOverride(new URLSearchParams(window.location.search).get('unlock'))
  return cachedUnlockOverride
}

export function formatDevUnlockHint(override: DevUnlockOverride) {
  const unlocked: string[] = []
  if (override.hasConqueredMuseum) {
    unlocked.push('After Hours')
  }
  if (override.hasConqueredClub) {
    unlocked.push('Club')
  }

  return unlocked.length > 0 ? `DEV · unlock: ${unlocked.join(' + ')}` : 'DEV · unlock'
}

export function formatDevBootstrapHint(config: DevBootstrapConfig) {
  const step = getProgressionStep(config.progressionIndex, config.venueId)
  const unlock = getDevUnlockOverride()
  const stageHint = step ? `${config.venueId} · ${getStageLabel(step)} · ${config.phase}` : 'bootstrap'
  const unlockHint = unlock ? ` · ${formatDevUnlockHint(unlock).replace('DEV · ', '')}` : ''

  return `DEV · ${stageHint}${unlockHint}`
}

export function applyDevBootstrapSideEffects(phase: DevBootstrapPhase) {
  const shouldLockMovement = phase === 'intro' || phase === 'preparing' || phase === 'cleared' || phase === 'conquered'

  usePlayerStore.getState().setMovementLocked(shouldLockMovement)
}

function parseVenueId(value: string | null): VenueId {
  return value?.trim().toLowerCase() === 'club' ? 'club' : 'museum'
}

export function resolveProgressionIndexFromParam(value: string, venueId: VenueId = 'museum') {
  const normalized = value.trim().toLowerCase().replace(/[\s_-]/g, '')

  if (venueId === 'club') {
    const clubAliases: Record<string, number> = {
      lastcall: 4,
    }

    if (normalized in clubAliases) {
      return clubAliases[normalized]
    }

    const stageNumber = Number(value)
    if (Number.isInteger(stageNumber) && stageNumber >= 1 && stageNumber <= 5) {
      return stageNumber - 1
    }

    return null
  }

  const aliases: Record<string, number> = {
    semi: 5,
    semifinal: 5,
    final: 6,
    grandfinal: 7,
  }

  if (normalized in aliases) {
    return aliases[normalized]
  }

  const stageNumber = Number(value)
  if (Number.isInteger(stageNumber) && stageNumber >= 1 && stageNumber <= 8) {
    return stageNumber - 1
  }

  return null
}

function parseDevPhase(value: string | null): DevBootstrapPhase {
  const normalized = (value ?? 'intro').trim().toLowerCase().replace(/[\s_-]/g, '')

  switch (normalized) {
    case 'preparing':
    case 'prepare':
      return 'preparing'
    case 'playing':
    case 'play':
      return 'playing'
    case 'cleared':
    case 'clear':
      return 'cleared'
    case 'timedout':
    case 'timeout':
    case 'timeup':
      return 'timedout'
    case 'conquered':
    case 'win':
    case 'complete':
      return 'conquered'
    default:
      return 'intro'
  }
}

function parseGameMode(value: string | null): GameMode | undefined {
  const normalized = value?.trim().toLowerCase()

  if (normalized === 'challenge' || normalized === 'timed') {
    return 'challenge'
  }

  if (normalized === 'enjoy' || normalized === 'free') {
    return 'enjoy'
  }

  return undefined
}

function parseFoundCount(value: string | null) {
  if (!value) {
    return 0
  }

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) {
    return 0
  }

  return parsed
}

function parseDevUnlockOverride(value: string | null): DevUnlockOverride | null {
  if (!value?.trim()) {
    return null
  }

  const tokens = value
    .trim()
    .toLowerCase()
    .split(/[,+\s]+/)
    .map((token) => token.replace(/[\s_-]/g, ''))
    .filter(Boolean)

  if (tokens.length === 0) {
    return null
  }

  const hasConqueredMuseum = tokens.some((token) =>
    token === 'museum' || token === 'afterhours' || token === 'afterhour' || token === 'all',
  )
  const hasConqueredClub = tokens.some((token) => token === 'club' || token === 'all')

  if (!hasConqueredMuseum && !hasConqueredClub) {
    console.warn(`[devBootstrap] Unknown unlock param: "${value}"`)
    return null
  }

  return { hasConqueredMuseum, hasConqueredClub }
}
