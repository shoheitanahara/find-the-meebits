import { getLocale } from '../i18n/locale'
import { getJstDateKey } from '../top/dailyFeatured'

/** 来場証1行 */
export type VisitPassLine = {
  id: string
  label: string
  detail: string
}

const KEYS = {
  street: 'meebits-8th-street-daily-v1',
  find: 'meebits-find-daily-v1',
  traits: 'meebits-traits-daily-v1',
  runway: 'meebits-runway-daily-v1',
  closet: 'meebits-closet-daily-v1',
  sergito: 'meebits-sergito-daily-v1',
  starlight: 'meebits-starlight-best-daily',
  shooting: 'meebits-shooting-best-daily',
  mountain: 'meebits-mountain-progress-v3',
  neon: 'meebits-jerry-mountain-progress-v1',
} as const

type DailyEnvelope = { dateKey: string }

type ScorePayload = DailyEnvelope & { score: number }
type HeightPayload = DailyEnvelope & { heightBestM?: number; unlockedStage?: number }
type StreetPayload = DailyEnvelope & { cleared: true; clearTimeSeconds: number }
type HuntPayload = DailyEnvelope & { stageNumber: number; clearTimeSeconds: number | null }
type RunwayPayload = DailyEnvelope & { visited: true; themeLabel?: string }
type ClosetPayload = DailyEnvelope & { meebitNumber: number }
type SergitoPayload = DailyEnvelope & { talked: true }

export function readDailyJson<T extends DailyEnvelope>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as T
    if (!parsed || parsed.dateKey !== getJstDateKey()) return null
    return parsed
  } catch {
    return null
  }
}

export function writeDailyJson<T extends DailyEnvelope>(key: string, payload: T) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify({ ...payload, dateKey: getJstDateKey() }))
  } catch {
    /* ignore */
  }
}

export function formatClearTimeDetail(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return '--:--'
  const total = Math.max(0, Math.floor(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** 8th Street: クリア時。ベストタイム（短い方）を残す。 */
export function recordStreetClear(clearTimeSeconds: number | null) {
  const time =
    clearTimeSeconds != null && Number.isFinite(clearTimeSeconds)
      ? Math.max(0, clearTimeSeconds)
      : 0
  const prev = readDailyJson<StreetPayload>(KEYS.street)
  if (prev && prev.clearTimeSeconds > 0 && (time <= 0 || prev.clearTimeSeconds <= time)) {
    return
  }
  writeDailyJson(KEYS.street, { dateKey: getJstDateKey(), cleared: true, clearTimeSeconds: time })
}

/** Find / Trait Hunt: 最高ステージ優先、同ステージなら短いクリアタイム。 */
export function recordHuntStageClear(options: {
  edition: 'find' | 'traits'
  stageNumber: number
  clearTimeSeconds: number | null
}) {
  const key = options.edition === 'traits' ? KEYS.traits : KEYS.find
  const prev = readDailyJson<HuntPayload>(key)
  const stageNumber = Math.max(1, Math.floor(options.stageNumber))
  const clearTimeSeconds =
    options.clearTimeSeconds != null && Number.isFinite(options.clearTimeSeconds)
      ? Math.max(0, options.clearTimeSeconds)
      : null

  if (prev) {
    if (prev.stageNumber > stageNumber) return
    if (
      prev.stageNumber === stageNumber &&
      prev.clearTimeSeconds != null &&
      clearTimeSeconds != null &&
      prev.clearTimeSeconds <= clearTimeSeconds
    ) {
      return
    }
    if (prev.stageNumber === stageNumber && prev.clearTimeSeconds != null && clearTimeSeconds == null) {
      return
    }
  }

  writeDailyJson(key, { dateKey: getJstDateKey(), stageNumber, clearTimeSeconds })
}

/** Runway: 入場（テーマ名があれば更新）。 */
export function recordRunwayVisit(themeLabel?: string) {
  const prev = readDailyJson<RunwayPayload>(KEYS.runway)
  writeDailyJson(KEYS.runway, {
    dateKey: getJstDateKey(),
    visited: true,
    themeLabel: themeLabel?.trim() || prev?.themeLabel,
  })
}

/** Look Locker: Wear した Meebit。 */
export function recordClosetWear(meebitNumber: number) {
  writeDailyJson(KEYS.closet, {
    dateKey: getJstDateKey(),
    meebitNumber: Math.max(1, Math.floor(meebitNumber)),
  })
}

/** Meet Sergito: 会話開始。 */
export function recordSergitoTalk() {
  writeDailyJson(KEYS.sergito, { dateKey: getJstDateKey(), talked: true })
}

function scoreDetail(score: number, locale: 'en' | 'ja') {
  return score.toLocaleString(locale === 'ja' ? 'ja-JP' : 'en-US')
}

/** 来場証用: 今日記録があるアトラクションをすべて集約。 */
export function collectVisitPassLines(): VisitPassLine[] {
  const locale = getLocale()
  const lines: VisitPassLine[] = []

  const starlight = readDailyJson<ScorePayload>(KEYS.starlight)
  if (starlight && starlight.score > 0) {
    lines.push({
      id: 'starlight',
      label: locale === 'ja' ? 'スターライト・ラッシュ' : 'Starlight Rush',
      detail: scoreDetail(starlight.score, locale),
    })
  }

  const shooting = readDailyJson<ScorePayload>(KEYS.shooting)
  if (shooting && shooting.score > 0) {
    lines.push({
      id: 'shooting',
      label: locale === 'ja' ? 'シューティングギャラリー' : 'Shooting Gallery',
      detail: scoreDetail(shooting.score, locale),
    })
  }

  const mountain = readDailyJson<HeightPayload>(KEYS.mountain)
  if (mountain && (mountain.heightBestM ?? 0) > 0) {
    lines.push({
      id: 'mountain',
      label: 'Mt. Meeb',
      detail: `${Math.floor(mountain.heightBestM ?? 0)}m`,
    })
  }

  const neon = readDailyJson<HeightPayload>(KEYS.neon)
  if (neon && (neon.heightBestM ?? 0) > 0) {
    lines.push({
      id: 'neon',
      label: locale === 'ja' ? 'ジェリーマウンテン' : 'Jerry Mountain',
      detail: `${Math.floor(neon.heightBestM ?? 0)}m`,
    })
  }

  const street = readDailyJson<StreetPayload>(KEYS.street)
  if (street?.cleared) {
    const time = formatClearTimeDetail(street.clearTimeSeconds)
    lines.push({
      id: 'street',
      label: locale === 'ja' ? '8番ストリート' : '8th Street',
      detail: locale === 'ja' ? `クリア ${time}` : `Clear ${time}`,
    })
  }

  const find = readDailyJson<HuntPayload>(KEYS.find)
  if (find) {
    lines.push({
      id: 'find',
      label: 'Find the Meebit',
      detail:
        locale === 'ja'
          ? `ステージ ${find.stageNumber}`
          : `Stage ${find.stageNumber}`,
    })
  }

  const traits = readDailyJson<HuntPayload>(KEYS.traits)
  if (traits) {
    lines.push({
      id: 'traits',
      label: locale === 'ja' ? 'トレイトハント' : 'Trait Hunt',
      detail:
        locale === 'ja'
          ? `ステージ ${traits.stageNumber}`
          : `Stage ${traits.stageNumber}`,
    })
  }

  const runway = readDailyJson<RunwayPayload>(KEYS.runway)
  if (runway?.visited) {
    lines.push({
      id: 'runway',
      label: 'Meebits Runway',
      detail: runway.themeLabel?.trim()
        ? runway.themeLabel
        : locale === 'ja'
          ? '入場'
          : 'Visited',
    })
  }

  const closet = readDailyJson<ClosetPayload>(KEYS.closet)
  if (closet?.meebitNumber) {
    lines.push({
      id: 'closet',
      label: locale === 'ja' ? 'ルックロッカー' : 'Look Locker',
      detail: `#${closet.meebitNumber}`,
    })
  }

  const sergito = readDailyJson<SergitoPayload>(KEYS.sergito)
  if (sergito?.talked) {
    lines.push({
      id: 'sergito',
      label: 'Meet Sergito',
      detail: locale === 'ja' ? '会話済' : 'Visited',
    })
  }

  return lines
}
