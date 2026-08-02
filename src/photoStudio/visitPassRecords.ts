import { getLocale } from '../i18n/locale'
import { readBestScore as readShootingBest } from '../shootingGallery/config'
import { readBestScore as readStarlightBest } from '../starlightRush/config'

export type VisitPassRecord = {
  id: 'starlight' | 'shooting'
  label: string
  score: number
}

/** 今日プレイ済み（デイリーベスト > 0）のアトラクション記録。 */
export function collectTodayVisitRecords(): VisitPassRecord[] {
  const locale = getLocale()
  const records: VisitPassRecord[] = []

  const starlight = readStarlightBest()
  if (starlight > 0) {
    records.push({
      id: 'starlight',
      label: locale === 'ja' ? 'スターライト・ラッシュ' : 'Starlight Rush',
      score: starlight,
    })
  }

  const shooting = readShootingBest()
  if (shooting > 0) {
    records.push({
      id: 'shooting',
      label: locale === 'ja' ? 'シューティングギャラリー' : 'Shooting Gallery',
      score: shooting,
    })
  }

  return records
}

/** 来場証用の日時（端末のローカルタイムゾーン）。 */
export function formatVisitTimestamp(now = new Date()): string {
  const locale = getLocale() === 'ja' ? 'ja-JP' : 'en-US'
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)
}

/**
 * 端末タイムゾーンの短い表示。
 * 例: `JST (UTC+9)` / `PDT (UTC-7)`
 */
export function getVisitTimezoneLabel(now = new Date()): string {
  const locale = getLocale() === 'ja' ? 'ja-JP' : 'en-US'
  const shortName = readTimeZoneName(now, locale, 'short')
  const offsetName = readTimeZoneName(now, locale, 'shortOffset')
  const offset = (offsetName ?? '').replace(/^GMT/i, 'UTC')

  if (shortName && offset && shortName !== offsetName && !/^GMT|[+-]\d/i.test(shortName)) {
    return `${shortName} (${offset})`
  }
  if (offset) return offset
  if (shortName) return shortName
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local'
}

function readTimeZoneName(
  now: Date,
  locale: string,
  timeZoneName: 'short' | 'shortOffset',
): string | null {
  try {
    const part = new Intl.DateTimeFormat(locale, {
      timeZoneName,
      hour: 'numeric',
    })
      .formatToParts(now)
      .find((entry) => entry.type === 'timeZoneName')
    return part?.value ?? null
  } catch {
    return null
  }
}
