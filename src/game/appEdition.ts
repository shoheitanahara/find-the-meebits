/** App edition from URL path. v2 is trait-hunt prototype (not linked from v1 UI). */

const V2_SEGMENTS = new Set(['v2'])

export type AppEdition = 'v1' | 'v2'

export function getPathSegments(pathname = typeof window !== 'undefined' ? window.location.pathname : '/') {
  return pathname.split('/').filter(Boolean)
}

export function getAppEdition(pathname = typeof window !== 'undefined' ? window.location.pathname : '/'): AppEdition {
  const segments = getPathSegments(pathname)
  // /v2 or /jp/v2
  if (segments.includes('v2')) {
    return 'v2'
  }
  return 'v1'
}

export function isTraitHuntEdition(pathname?: string) {
  return getAppEdition(pathname) === 'v2'
}

let cachedEdition: AppEdition | null = null

export function getCachedAppEdition() {
  if (cachedEdition === null) {
    cachedEdition = getAppEdition()
  }
  return cachedEdition
}
