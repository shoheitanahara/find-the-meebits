import { getLocale } from '../i18n/locale'
import { getRatingId as getShootingRatingId } from '../shootingGallery/config'
import { shootingGalleryUi } from '../shootingGallery/i18n'
import { getRatingId as getShoreFishingRatingId } from '../shoreFishing/config'
import { ratingLabel as shoreFishingRatingLabel } from '../shoreFishing/i18n'
import { getRatingId as getStarlightRatingId } from '../starlightRush/config'
import { starlightRushUi } from '../starlightRush/i18n'
import { getUtcDateKey } from '../top/dailyFeatured'

/** 来場証1行（常時枠。未記録は detail が空表示用） */
export type VisitPassLine = {
  id: string
  label: string
  detail: string
  /** 今日の実記録があるか */
  filled: boolean
}

const KEYS = {
  street: 'meebits-8th-street-daily-v1',
  find: 'meebits-find-daily-v1',
  traits: 'meebits-traits-daily-v1',
  runway: 'meebits-runway-daily-v1',
  closet: 'meebits-closet-daily-v1',
  sergito: 'meebits-sergito-daily-v1',
  opensea: 'meebits-opensea-daily-v1',
  starlight: 'meebits-starlight-best-daily',
  shooting: 'meebits-shooting-best-daily',
  fishing: 'meebits-shore-fishing-best',
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
type OpenSeaPayload = DailyEnvelope & { visited: true }

export function readDailyJson<T extends DailyEnvelope>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as T
    if (!parsed || parsed.dateKey !== getUtcDateKey()) return null
    return parsed
  } catch {
    return null
  }
}

export function writeDailyJson<T extends DailyEnvelope>(key: string, payload: T) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify({ ...payload, dateKey: getUtcDateKey() }))
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
  writeDailyJson(KEYS.street, { dateKey: getUtcDateKey(), cleared: true, clearTimeSeconds: time })
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

  writeDailyJson(key, { dateKey: getUtcDateKey(), stageNumber, clearTimeSeconds })
}

/** Runway: 入場（テーマ名があれば更新）。 */
export function recordRunwayVisit(themeLabel?: string) {
  const prev = readDailyJson<RunwayPayload>(KEYS.runway)
  writeDailyJson(KEYS.runway, {
    dateKey: getUtcDateKey(),
    visited: true,
    themeLabel: themeLabel?.trim() || prev?.themeLabel,
  })
}

/** Look Locker: Wear した Meebit。 */
export function recordClosetWear(meebitNumber: number) {
  writeDailyJson(KEYS.closet, {
    dateKey: getUtcDateKey(),
    meebitNumber: Math.max(1, Math.floor(meebitNumber)),
  })
}

/** Meet Sergito: 会話開始。 */
export function recordSergitoTalk() {
  writeDailyJson(KEYS.sergito, { dateKey: getUtcDateKey(), talked: true })
}

/** OpenSea Market: 入場。 */
export function recordOpenSeaVisit() {
  writeDailyJson(KEYS.opensea, { dateKey: getUtcDateKey(), visited: true })
}

function scoreDetail(score: number, locale: 'en' | 'ja') {
  return score.toLocaleString(locale === 'ja' ? 'ja-JP' : 'en-US')
}

/** スコア系: `12,450 · Sharpshooter` */
function scoreWithRatingDetail(score: number, ratingLabel: string, locale: 'en' | 'ja') {
  if (score <= 0) return null
  return `${scoreDetail(score, locale)} · ${ratingLabel}`
}

/**
 * 登山系: 高度 + クリア済み最高ステージ。
 * unlockedStage は「次に遊べる」なので、クリア数は unlockedStage - 1。
 */
function climbDetail(payload: HeightPayload | null, locale: 'en' | 'ja') {
  if (!payload) return null
  const height = Math.floor(payload.heightBestM ?? 0)
  const clearedStages = Math.max(0, (payload.unlockedStage ?? 1) - 1)
  if (height <= 0 && clearedStages <= 0) return null

  const parts: string[] = []
  if (height > 0) parts.push(`${height}m`)
  if (clearedStages > 0) {
    parts.push(locale === 'ja' ? `ステージ${clearedStages}クリア` : `Stage ${clearedStages} clear`)
  }
  return parts.join(' · ')
}

function huntDetail(payload: HuntPayload | null, locale: 'en' | 'ja') {
  if (!payload) return null
  const stage =
    locale === 'ja' ? `ステージ ${payload.stageNumber}` : `Stage ${payload.stageNumber}`
  if (payload.clearTimeSeconds == null) return stage
  return `${stage} · ${formatClearTimeDetail(payload.clearTimeSeconds)}`
}

const EMPTY = '—'

/**
 * 来場証用: 全アトラクションを固定順で返す（未プレイは —）。
 * Photo Booth 自身は含めない。
 * スコア系は称号、登山はクリアステージも併記する。
 */
export function collectVisitPassLines(): VisitPassLine[] {
  const locale = getLocale()

  const starlight = readDailyJson<ScorePayload>(KEYS.starlight)
  const shooting = readDailyJson<ScorePayload>(KEYS.shooting)
  const fishing = readDailyJson<ScorePayload>(KEYS.fishing)
  const mountain = readDailyJson<HeightPayload>(KEYS.mountain)
  const neon = readDailyJson<HeightPayload>(KEYS.neon)
  const street = readDailyJson<StreetPayload>(KEYS.street)
  const find = readDailyJson<HuntPayload>(KEYS.find)
  const traits = readDailyJson<HuntPayload>(KEYS.traits)
  const runway = readDailyJson<RunwayPayload>(KEYS.runway)
  const closet = readDailyJson<ClosetPayload>(KEYS.closet)
  const sergito = readDailyJson<SergitoPayload>(KEYS.sergito)
  const opensea = readDailyJson<OpenSeaPayload>(KEYS.opensea)

  const line = (
    id: string,
    label: string,
    detail: string | null,
  ): VisitPassLine => ({
    id,
    label,
    detail: detail && detail.trim() ? detail : EMPTY,
    filled: Boolean(detail && detail.trim()),
  })

  const shootingRating =
    shooting && shooting.score > 0
      ? shootingGalleryUi().rating[getShootingRatingId(shooting.score)]
      : ''
  const starlightRating =
    starlight && starlight.score > 0
      ? starlightRushUi().rating[getStarlightRatingId(starlight.score)]
      : ''
  const fishingRating =
    fishing && fishing.score > 0
      ? shoreFishingRatingLabel(getShoreFishingRatingId(fishing.score))
      : ''

  return [
    line(
      'starlight',
      locale === 'ja' ? 'スターライト・ラッシュ' : 'Starlight Rush',
      starlight ? scoreWithRatingDetail(starlight.score, starlightRating, locale) : null,
    ),
    line(
      'shooting',
      locale === 'ja' ? 'シューティングギャラリー' : 'Shooting Gallery',
      shooting ? scoreWithRatingDetail(shooting.score, shootingRating, locale) : null,
    ),
    line(
      'fishing',
      locale === 'ja' ? 'ショアフィッシング' : 'Shore Fishing',
      fishing ? scoreWithRatingDetail(fishing.score, fishingRating, locale) : null,
    ),
    line('mountain', 'Mt. Meeb', climbDetail(mountain, locale)),
    line(
      'neon',
      locale === 'ja' ? 'ジェリーマウンテン' : 'Jerry Mountain',
      climbDetail(neon, locale),
    ),
    line(
      'street',
      locale === 'ja' ? '8番ストリート' : '8th Street',
      street?.cleared
        ? locale === 'ja'
          ? `クリア ${formatClearTimeDetail(street.clearTimeSeconds)}`
          : `Clear ${formatClearTimeDetail(street.clearTimeSeconds)}`
        : null,
    ),
    line('find', 'Find the Meebit', huntDetail(find, locale)),
    line(
      'traits',
      locale === 'ja' ? 'トレイトハント' : 'Trait Hunt',
      huntDetail(traits, locale),
    ),
    line(
      'runway',
      'Meebits Runway',
      runway?.visited
        ? (() => {
            const theme = runway.themeLabel?.trim()
            return theme ? `Visited · ${theme}` : 'Visited'
          })()
        : null,
    ),
    line(
      'closet',
      locale === 'ja' ? 'ルックロッカー' : 'Look Locker',
      closet?.meebitNumber ? `#${closet.meebitNumber}` : null,
    ),
    line(
      'sergito',
      'Meet Sergito',
      sergito?.talked ? 'Visited' : null,
    ),
    line(
      'opensea',
      'OpenSea Market',
      opensea?.visited ? 'Visited' : null,
    ),
  ]
}
