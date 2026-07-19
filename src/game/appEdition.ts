/** App edition from URL path. */

export type AppEdition = 'v1' | 'v2' | '8th-street'

export function getPathSegments(pathname = typeof window !== 'undefined' ? window.location.pathname : '/') {
  return pathname.split('/').filter(Boolean)
}

export function getAppEdition(pathname = typeof window !== 'undefined' ? window.location.pathname : '/'): AppEdition {
  const segments = getPathSegments(pathname)
  if (segments.includes('8th-street')) {
    return '8th-street'
  }
  if (segments.includes('v2')) {
    return 'v2'
  }
  return 'v1'
}

export function isTraitHuntEdition(pathname?: string) {
  return getAppEdition(pathname) === 'v2'
}

export function isEightStreetEdition(pathname?: string) {
  return getAppEdition(pathname) === '8th-street'
}

let cachedEdition: AppEdition | null = null

export function getCachedAppEdition() {
  if (cachedEdition === null) {
    cachedEdition = getAppEdition()
  }
  return cachedEdition
}
