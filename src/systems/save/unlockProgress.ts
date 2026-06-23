import { getDevUnlockOverride } from '../../game/devBootstrap'

const UNLOCK_STORAGE_KEY = 'meebits-world-unlock-v1'

type UnlockData = {
  hasConqueredMuseum: boolean
  hasConqueredClub: boolean
}

const defaultUnlockData: UnlockData = {
  hasConqueredMuseum: false,
  hasConqueredClub: false,
}

let cachedUnlockData: UnlockData | null = null

function readUnlockDataFromStorage(): UnlockData {
  if (typeof window === 'undefined') {
    return defaultUnlockData
  }

  try {
    const raw = window.localStorage.getItem(UNLOCK_STORAGE_KEY)
    if (!raw) {
      return defaultUnlockData
    }

    const parsed = JSON.parse(raw) as Partial<UnlockData>
    return {
      hasConqueredMuseum: parsed.hasConqueredMuseum === true,
      hasConqueredClub: parsed.hasConqueredClub === true,
    }
  } catch {
    return defaultUnlockData
  }
}

function mergeUnlockData(stored: UnlockData, devOverride: ReturnType<typeof getDevUnlockOverride>): UnlockData {
  if (!devOverride) {
    return stored
  }

  return {
    hasConqueredMuseum: stored.hasConqueredMuseum || devOverride.hasConqueredMuseum,
    hasConqueredClub: stored.hasConqueredClub || devOverride.hasConqueredClub,
  }
}

export function loadUnlockData(): UnlockData {
  if (cachedUnlockData) {
    return cachedUnlockData
  }

  cachedUnlockData = mergeUnlockData(readUnlockDataFromStorage(), getDevUnlockOverride())
  return cachedUnlockData
}

function saveUnlockData(data: UnlockData) {
  cachedUnlockData = data

  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage unavailable
  }
}

export function isAfterHoursUnlocked() {
  return loadUnlockData().hasConqueredMuseum
}

export function markMuseumConquered() {
  const current = loadUnlockData()
  if (current.hasConqueredMuseum) {
    return
  }

  saveUnlockData({
    ...current,
    hasConqueredMuseum: true,
  })
}

export function markClubConquered() {
  const current = loadUnlockData()
  if (current.hasConqueredClub) {
    return
  }

  saveUnlockData({
    ...current,
    hasConqueredClub: true,
  })
}
