import { usePlayerStore } from '../stores/playerStore'
import type { GameMode } from './gameMode'
import { getProgressionStep, getStageLabel } from './gameProgression'

/**
 * 開発ビルド専用の URL ブートストラップ（本番では無効）。
 *
 * 例:
 * - `?stage=grandfinal` — Grand Final のタイトル画面から開始
 * - `?stage=8&phase=playing` — Grand Final を即プレイ
 * - `?stage=final&phase=cleared` — Final クリア後の続行画面
 * - `?stage=grandfinal&phase=conquered` — 全制覇画面
 * - `?stage=semifinal&phase=timedout&found=1` — Semifinal で 1 体発見後にタイムアップ
 * - `?mode=enjoy` — タイマーなし
 * - `?tips=0` — preparing 時に Tips を表示
 */
export type DevBootstrapPhase =
  | 'intro'
  | 'preparing'
  | 'playing'
  | 'cleared'
  | 'timedout'
  | 'conquered'

export type DevBootstrapConfig = {
  progressionIndex: number
  phase: DevBootstrapPhase
  gameMode?: GameMode
  foundCount: number
  tipsAcknowledged: boolean
}

let cachedConfig: DevBootstrapConfig | null | undefined

export function getDevBootstrapConfig(): DevBootstrapConfig | null {
  if (cachedConfig !== undefined) {
    return cachedConfig
  }

  if (!import.meta.env.DEV || typeof window === 'undefined') {
    cachedConfig = null
    return null
  }

  const params = new URLSearchParams(window.location.search)
  const stageParam = params.get('stage')

  if (!stageParam) {
    cachedConfig = null
    return null
  }

  const progressionIndex = resolveProgressionIndexFromParam(stageParam)
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
    progressionIndex,
    phase,
    gameMode,
    foundCount,
    tipsAcknowledged,
  }

  const step = getProgressionStep(progressionIndex)
  console.info(
    `[devBootstrap] ${getStageLabel(step!)} (index ${progressionIndex}) · phase=${phase}` +
      (gameMode ? ` · mode=${gameMode}` : '') +
      (foundCount > 0 ? ` · found=${foundCount}` : ''),
  )

  cachedConfig = config
  return config
}

export function formatDevBootstrapHint(config: DevBootstrapConfig) {
  const step = getProgressionStep(config.progressionIndex)
  return step ? `DEV · ${getStageLabel(step)} · ${config.phase}` : 'DEV bootstrap'
}

export function applyDevBootstrapSideEffects(phase: DevBootstrapPhase) {
  const shouldLockMovement = phase === 'intro' || phase === 'preparing' || phase === 'cleared' || phase === 'conquered'

  usePlayerStore.getState().setMovementLocked(shouldLockMovement)
}

export function resolveProgressionIndexFromParam(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[\s_-]/g, '')

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
