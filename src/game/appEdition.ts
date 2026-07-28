/** App edition from URL path. */

export type AppEdition =
  | 'v1'
  | 'v2'
  | '8th-street'
  | 'mountain'
  | 'neon'
  | 'runway'
  | 'closet'
  | 'sergito'
  | 'top'

export function getPathSegments(pathname = typeof window !== 'undefined' ? window.location.pathname : '/') {
  return pathname.split('/').filter(Boolean)
}

export function getAppEdition(pathname = typeof window !== 'undefined' ? window.location.pathname : '/'): AppEdition {
  const segments = getPathSegments(pathname)
  if (segments.includes('look-locker')) {
    return 'closet'
  }
  if (segments.includes('meet-sergito')) {
    return 'sergito'
  }
  if (segments.includes('runway')) {
    return 'runway'
  }
  if (segments.includes('neon-stack')) {
    return 'neon'
  }
  if (segments.includes('mountain')) {
    return 'mountain'
  }
  if (segments.includes('8th-street')) {
    return '8th-street'
  }
  if (segments.includes('v2')) {
    return 'v2'
  }
  if (segments.includes('find-the-meebit')) {
    return 'v1'
  }
  // `/` and `/jp` are the park hub.
  return 'top'
}

export function isTraitHuntEdition(pathname?: string) {
  return getAppEdition(pathname) === 'v2'
}

export function isEightStreetEdition(pathname?: string) {
  return getAppEdition(pathname) === '8th-street'
}

export function isMountainEdition(pathname?: string) {
  const edition = getAppEdition(pathname)
  return edition === 'mountain' || edition === 'neon'
}

let cachedEdition: AppEdition | null = null

export function getCachedAppEdition() {
  if (cachedEdition === null) {
    cachedEdition = getAppEdition()
  }
  return cachedEdition
}
