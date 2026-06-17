import { PLAYER_START_POSITION } from '../../game/gameConfig'
import type { Vector3Tuple } from '../../types/game'

export type SaveData = {
  visitedNPCIds: string[]
  talkedCountByNPC: Record<string, number>
  lastPlayerPosition: Vector3Tuple
}

const STORAGE_KEY = 'meebits-world-save-v1'

const defaultSaveData: SaveData = {
  visitedNPCIds: [],
  talkedCountByNPC: {},
  lastPlayerPosition: [PLAYER_START_POSITION[0], PLAYER_START_POSITION[1], PLAYER_START_POSITION[2]],
}

export function loadSaveData(): SaveData {
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
      visitedNPCIds: Array.isArray(parsed.visitedNPCIds) ? parsed.visitedNPCIds : [],
      talkedCountByNPC:
        parsed.talkedCountByNPC && typeof parsed.talkedCountByNPC === 'object'
          ? parsed.talkedCountByNPC
          : {},
      lastPlayerPosition: isVector3Tuple(parsed.lastPlayerPosition)
        ? parsed.lastPlayerPosition
        : defaultSaveData.lastPlayerPosition,
    }
  } catch {
    return defaultSaveData
  }
}

export function saveSaveData(data: SaveData) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage unavailable — game continues without persistence
  }
}

export function recordNpcTalk(npcId: string, playerPosition: Vector3Tuple): SaveData {
  const current = loadSaveData()
  const talkedCount = (current.talkedCountByNPC[npcId] ?? 0) + 1
  const visitedNPCIds = current.visitedNPCIds.includes(npcId)
    ? current.visitedNPCIds
    : [...current.visitedNPCIds, npcId]

  const next: SaveData = {
    visitedNPCIds,
    talkedCountByNPC: {
      ...current.talkedCountByNPC,
      [npcId]: talkedCount,
    },
    lastPlayerPosition: playerPosition,
  }

  saveSaveData(next)
  return next
}

export function savePlayerPosition(position: Vector3Tuple) {
  const current = loadSaveData()
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
