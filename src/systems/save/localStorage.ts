import { PLAYER_START_POSITION } from '../../game/gameConfig'
import type { Vector3Tuple } from '../../types/game'

export type SaveData = {
  visitedMeebitNumbers: number[]
  talkedCountByMeebit: Record<string, number>
  lastPlayerPosition: Vector3Tuple
}

const STORAGE_KEY = 'meebits-world-save-v2'

const defaultSaveData: SaveData = {
  visitedMeebitNumbers: [],
  talkedCountByMeebit: {},
  lastPlayerPosition: [PLAYER_START_POSITION[0], PLAYER_START_POSITION[1], PLAYER_START_POSITION[2]],
}

let cachedSaveData: SaveData | null = null

function meebitTalkKey(meebitNumber: number) {
  return String(meebitNumber)
}

function readSaveDataFromStorage(): SaveData {
  if (typeof window === 'undefined') {
    return defaultSaveData
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return defaultSaveData
    }

    const parsed = JSON.parse(raw) as Partial<SaveData>
    return {
      visitedMeebitNumbers: Array.isArray(parsed.visitedMeebitNumbers)
        ? parsed.visitedMeebitNumbers.filter((value) => typeof value === 'number')
        : [],
      talkedCountByMeebit:
        parsed.talkedCountByMeebit && typeof parsed.talkedCountByMeebit === 'object'
          ? parsed.talkedCountByMeebit
          : {},
      lastPlayerPosition: isVector3Tuple(parsed.lastPlayerPosition)
        ? parsed.lastPlayerPosition
        : defaultSaveData.lastPlayerPosition,
    }
  } catch {
    return defaultSaveData
  }
}

export function loadSaveData(): SaveData {
  if (cachedSaveData) {
    return cachedSaveData
  }

  cachedSaveData = readSaveDataFromStorage()
  return cachedSaveData
}

export function saveSaveData(data: SaveData) {
  cachedSaveData = data

  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage unavailable — game continues without persistence
  }
}

export function resetNpcTalkSaveData() {
  saveSaveData({
    ...defaultSaveData,
  })
}

export function getMeebitTalkCount(meebitNumber: number) {
  return loadSaveData().talkedCountByMeebit[meebitTalkKey(meebitNumber)] ?? 0
}

export function recordMeebitTalk(meebitNumber: number, playerPosition: Vector3Tuple): SaveData {
  const current = loadSaveData()
  const key = meebitTalkKey(meebitNumber)
  const talkedCount = (current.talkedCountByMeebit[key] ?? 0) + 1
  const visitedMeebitNumbers = current.visitedMeebitNumbers.includes(meebitNumber)
    ? current.visitedMeebitNumbers
    : [...current.visitedMeebitNumbers, meebitNumber]

  const next: SaveData = {
    visitedMeebitNumbers,
    talkedCountByMeebit: {
      ...current.talkedCountByMeebit,
      [key]: talkedCount,
    },
    lastPlayerPosition: playerPosition,
  }

  saveSaveData(next)
  return next
}

export function savePlayerPosition(position: Vector3Tuple) {
  const current = loadSaveData()
  const previous = current.lastPlayerPosition

  if (
    Math.abs(previous[0] - position[0]) < 0.15 &&
    Math.abs(previous[2] - position[2]) < 0.15
  ) {
    return
  }

  saveSaveData({
    ...current,
    lastPlayerPosition: position,
  })
}

function isVector3Tuple(value: unknown): value is Vector3Tuple {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((component) => typeof component === 'number' && Number.isFinite(component))
  )
}
