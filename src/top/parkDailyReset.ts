import type { Locale } from '../i18n/locale'

/** 次のパーク日替わり（UTC 0:00）までのミリ秒。 */
export function getMsUntilParkDailyReset(now = new Date()): number {
  const nextUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0,
  )
  const remaining = nextUtcMidnight - now.getTime()
  return remaining <= 0 ? 24 * 60 * 60 * 1000 : remaining
}

/** 例: `あと5時間23分` / `in 5h 23m` */
export function formatParkResetCountdown(ms: number, locale: Locale): string {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60_000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (locale === 'ja') {
    if (hours <= 0) return `あと${minutes}分`
    if (minutes <= 0) return `あと${hours}時間`
    return `あと${hours}時間${minutes}分`
  }

  if (hours <= 0) return `in ${minutes}m`
  if (minutes <= 0) return `in ${hours}h`
  return `in ${hours}h ${minutes}m`
}

/** 次リセット時刻を端末ローカル時刻で表示。例: `8:00` / `午前8:00` */
export function formatParkResetLocalClock(msUntilReset: number, locale: Locale, now = new Date()): string {
  const resetAt = new Date(now.getTime() + msUntilReset)
  return new Intl.DateTimeFormat(locale === 'ja' ? 'ja-JP' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(resetAt)
}

export function getParkDailyResetCopy(locale: Locale, now = new Date()) {
  const ms = getMsUntilParkDailyReset(now)
  const countdown = formatParkResetCountdown(ms, locale)
  const localClock = formatParkResetLocalClock(ms, locale, now)

  if (locale === 'ja') {
    return {
      title: '毎日リセット',
      summary: 'パークの来場者・記録・コースは毎日リセットされます（UTC 0:00 ／ 日本時間 9:00）。',
      countdownLine: `次のリセットまで ${countdown}（あなたの地域では ${localClock}）`,
    }
  }

  return {
    title: 'Daily reset',
    summary: 'Park guests, records, and courses reset every day at midnight UTC (9:00 Japan time).',
    countdownLine: `Next reset ${countdown} (at ${localClock} your time)`,
  }
}
