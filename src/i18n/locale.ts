export type Locale = 'en' | 'ja'

const JP_PATH_PREFIX = '/jp'

export function getLocaleFromPathname(pathname = typeof window !== 'undefined' ? window.location.pathname : '/'): Locale {
  if (pathname === JP_PATH_PREFIX || pathname.startsWith(`${JP_PATH_PREFIX}/`)) {
    return 'ja'
  }

  return 'en'
}

let cachedLocale: Locale | null = null

/** URL ベースのロケール（ページ読み込み時に確定） */
export function getLocale(): Locale {
  if (cachedLocale === null) {
    cachedLocale = getLocaleFromPathname()
  }

  return cachedLocale
}

export function isJapanese() {
  return getLocale() === 'ja'
}

export function getLocaleHomePath(
  locale: Locale,
  pathname = typeof window !== 'undefined' ? window.location.pathname : '/',
) {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.includes('find-the-meebit')) {
    return locale === 'ja' ? '/jp/find-the-meebit' : '/find-the-meebit'
  }

  if (segments.includes('8th-street')) {
    return locale === 'ja' ? '/jp/8th-street' : '/8th-street'
  }

  if (segments.includes('v2')) {
    return locale === 'ja' ? '/jp/v2' : '/v2'
  }

  // Park hub (`/` / `/jp`) and any other path.
  return locale === 'ja' ? JP_PATH_PREFIX : '/'
}

/** 開発時のホットリロード用。通常は不要 */
export function resetLocaleCache() {
  cachedLocale = null
}
