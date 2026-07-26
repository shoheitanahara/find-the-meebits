import { create } from 'zustand'
import { getClimbTheme } from './climbTheme'
import { getClimbDayKey } from './dailyClimb'
import {
  clampStageId,
  getMountainRuntime,
  getStageDef,
  loadMountainStage,
  MOUNTAIN_STAGE_COUNT,
} from './config'

export type MountainPhase = 'title' | 'playing' | 'stageCleared' | 'allCleared'

const PROGRESS_KEY = getClimbTheme().progressKey

type ProgressPayload = {
  /** JST 日付。違う日なら進捗をリセット */
  dateKey?: string
  unlockedStage?: number
  /** 当日の最高到達高度（表示m）。日替わりで消える */
  heightBestM?: number
}

function readStoredProgress(): ProgressPayload {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as ProgressPayload
  } catch {
    return {}
  }
}

/** 当日分の進捗。日付が変わっていれば Stage1・BEST0 に戻す */
function readProgress(): ProgressPayload {
  const today = getClimbDayKey()
  const stored = readStoredProgress()
  if (stored.dateKey === today) {
    return {
      dateKey: today,
      unlockedStage: clampStageId(stored.unlockedStage ?? 1),
      heightBestM: typeof stored.heightBestM === 'number' ? Math.max(0, stored.heightBestM) : 0,
    }
  }
  const fresh: ProgressPayload = { dateKey: today, unlockedStage: 1, heightBestM: 0 }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(fresh))
    } catch {
      // ignore
    }
  }
  return fresh
}

function writeProgress(patch: ProgressPayload) {
  if (typeof window === 'undefined') return
  try {
    const today = getClimbDayKey()
    const current = readProgress()
    const next = { ...current, ...patch, dateKey: today }
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({
        dateKey: today,
        unlockedStage: clampStageId(next.unlockedStage ?? 1),
        heightBestM: Math.max(0, next.heightBestM ?? 0),
      }),
    )
  } catch {
    // ignore
  }
}

function readUnlockedStage(): number {
  return clampStageId(readProgress().unlockedStage ?? 1)
}

function readHeightBestM(): number {
  const v = readProgress().heightBestM
  return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, v) : 0
}

function writeUnlockedStage(unlockedStage: number) {
  writeProgress({ unlockedStage: clampStageId(unlockedStage) })
}

function writeHeightBestM(heightBestM: number) {
  writeProgress({ heightBestM: Math.max(0, heightBestM) })
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
  /** 当日の全ステージ共通 BEST（日替わりでリセット） */
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
  /** DEV: 指定ステージまで解放（永続） */
  unlockThroughStage: (stageId: number) => void
}

function beginStage(stageId: number, heightBest: number) {
  const id = clampStageId(stageId)
  const runtime = loadMountainStage(id)
  const display = displayHeightFromPlayerY(runtime.start.y, id)
  return {
    currentStage: id,
    terrainVersion: runtime.version,
    phase: 'playing' as const,
    elapsedSec: 0,
    // ステージ開始で BEST をリセットしない（通算最高を維持）
    heightBest,
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
  heightBest: readHeightBestM(),
  playerY: getMountainRuntime().start.y,
  displayHeightM: 0,
  start: (stageId) => {
    const unlocked = get().unlockedStage
    const requested = clampStageId(stageId ?? 1)
    const id = Math.min(requested, unlocked)
    set(beginStage(id, get().heightBest))
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
    const { currentStage, heightBest } = get()
    if (currentStage >= MOUNTAIN_STAGE_COUNT) {
      set({ phase: 'allCleared' })
      return
    }
    set(beginStage(currentStage + 1, heightBest))
  },
  retryStage: () => {
    const { currentStage, heightBest } = get()
    set(beginStage(currentStage, heightBest))
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
    set((state) => {
      const heightBest = Math.max(state.heightBest, display)
      if (heightBest > state.heightBest) writeHeightBestM(heightBest)
      return {
        playerY: y,
        displayHeightM: display,
        heightBest,
      }
    })
  },
  unlockThroughStage: (stageId) => {
    const next = clampStageId(stageId)
    writeUnlockedStage(next)
    set({ unlockedStage: next })
  },
}))

/**
 * 開発ビルド専用 URL ブートストラップ。
 * 例: `/mountain?mtUnlock=all` / `/neon-stack?mtUnlock=20&mtStage=20`
 */
export function applyDevMountainBootstrap() {
  if (!import.meta.env.DEV || typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const unlockRaw = params.get('mtUnlock')
  const stageRaw = params.get('mtStage')

  if (!unlockRaw && !stageRaw) return

  const store = useMountainStore.getState()
  const theme = getClimbTheme().id

  if (unlockRaw) {
    const unlockTo =
      unlockRaw.trim().toLowerCase() === 'all'
        ? MOUNTAIN_STAGE_COUNT
        : clampStageId(Number(unlockRaw))
    store.unlockThroughStage(unlockTo)
    console.info(`[${theme}-dev] unlocked through stage ${unlockTo}`)
  }

  if (stageRaw) {
    const stageId = clampStageId(Number(stageRaw))
    // 未解放ならそのステージまで解放してから開始
    if (stageId > useMountainStore.getState().unlockedStage) {
      useMountainStore.getState().unlockThroughStage(stageId)
    }
    useMountainStore.getState().start(stageId)
    console.info(`[${theme}-dev] start stage ${stageId}`)
  }
}
