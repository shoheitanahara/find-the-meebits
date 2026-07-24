import { create } from 'zustand'
import {
  clampStageId,
  getMountainRuntime,
  getStageDef,
  loadMountainStage,
  MOUNTAIN_STAGE_COUNT,
} from './config'

export type MountainPhase = 'title' | 'playing' | 'stageCleared' | 'allCleared'

const PROGRESS_KEY = 'meebits-mountain-progress-v2'

function readUnlockedStage(): number {
  if (typeof window === 'undefined') return 1
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return 1
    const parsed = JSON.parse(raw) as { unlockedStage?: number }
    return clampStageId(parsed.unlockedStage ?? 1)
  } catch {
    return 1
  }
}

function writeUnlockedStage(unlockedStage: number) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ unlockedStage: clampStageId(unlockedStage) }))
  } catch {
    // ignore
  }
}

function displayHeightFromPlayerY(playerY: number, stageId: number) {
  const def = getStageDef(stageId)
  const local = Math.max(0, playerY - def.startElev)
  return def.labelBaseM + local
}

type MountainState = {
  phase: MountainPhase
  currentStage: number
  unlockedStage: number
  terrainVersion: number
  elapsedSec: number
  heightBest: number
  playerY: number
  displayHeightM: number
  start: (stageId?: number) => void
  clearStage: () => void
  continueToNextStage: () => void
  retryStage: () => void
  backToTitle: () => void
  tickElapsed: (dt: number) => void
  reportHeight: (y: number) => void
}

function beginStage(stageId: number) {
  const id = clampStageId(stageId)
  const runtime = loadMountainStage(id)
  const display = displayHeightFromPlayerY(runtime.start.y, id)
  return {
    currentStage: id,
    terrainVersion: runtime.version,
    phase: 'playing' as const,
    elapsedSec: 0,
    heightBest: display,
    playerY: runtime.start.y,
    displayHeightM: display,
  }
}

export const useMountainStore = create<MountainState>((set, get) => ({
  phase: 'title',
  currentStage: 1,
  unlockedStage: readUnlockedStage(),
  terrainVersion: getMountainRuntime().version,
  elapsedSec: 0,
  heightBest: getMountainRuntime().start.y,
  playerY: getMountainRuntime().start.y,
  displayHeightM: 0,
  start: (stageId) => {
    const unlocked = get().unlockedStage
    const requested = clampStageId(stageId ?? 1)
    const id = Math.min(requested, unlocked)
    set(beginStage(id))
  },
  clearStage: () => {
    const { currentStage, unlockedStage } = get()
    const nextUnlocked = Math.max(unlockedStage, Math.min(MOUNTAIN_STAGE_COUNT, currentStage + 1))
    writeUnlockedStage(nextUnlocked)
    set({
      unlockedStage: nextUnlocked,
      phase: currentStage >= MOUNTAIN_STAGE_COUNT ? 'allCleared' : 'stageCleared',
    })
  },
  continueToNextStage: () => {
    const { currentStage } = get()
    if (currentStage >= MOUNTAIN_STAGE_COUNT) {
      set({ phase: 'allCleared' })
      return
    }
    set(beginStage(currentStage + 1))
  },
  retryStage: () => {
    set(beginStage(get().currentStage))
  },
  backToTitle: () =>
    set({
      phase: 'title',
      elapsedSec: 0,
    }),
  tickElapsed: (dt) => {
    if (get().phase !== 'playing') return
    set((state) => ({ elapsedSec: state.elapsedSec + dt }))
  },
  reportHeight: (y) => {
    const stageId = get().currentStage
    const display = displayHeightFromPlayerY(y, stageId)
    set((state) => ({
      playerY: y,
      displayHeightM: display,
      heightBest: Math.max(state.heightBest, display),
    }))
  },
}))
