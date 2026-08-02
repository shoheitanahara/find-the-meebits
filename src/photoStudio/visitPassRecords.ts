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

/** 来場証用の JST タイムスタンプ表示。 */
export function formatVisitTimestamp(now = new Date()): string {
  const locale = getLocale() === 'ja' ? 'ja-JP' : 'en-US'
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)
}
