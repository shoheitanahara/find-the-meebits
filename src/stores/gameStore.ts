import { create } from 'zustand'
import {
  CREATOR_NPC_ID,
  DEFAULT_PLAYER_MEEBIT_ID,
  GAME_TIME_LIMIT_SECONDS,
  PLAYER_START_POSITION,
} from '../game/gameConfig'
import { getWarmupLoadDistance } from '../game/perfConfig'
import { DEFAULT_GAME_MODE, type GameMode, isTimedGameMode } from '../game/gameMode'
import { getDevBootstrapConfig } from '../game/devBootstrap'
import { getProgressionStep, getStageLabel, type StageKind } from '../game/gameProgression'
import { pickRandomTargetNpcIds } from '../game/targetSelection'
import { clearActiveVrmNpcIds, setActiveVrmNpcIds } from '../npc/vrmLodState'
import { preloadVrm, finalizeVrmInstancePoolEviction, resetVrmInstancePoolForStageChange } from '../avatar/vrmInstancePool'
import { resetPlayerWorldState } from '../avatar/playerWorldState'
import { clearTargetPreviewCacheExcept } from '../ui/targetPreviewCache'
import { getVrmSculptureMeebitIds } from '../world/worldLandmarks'
import { buildNpcProfiles } from '../npc/npcGeneration'
import type { NPCProfile } from '../npc/npcTypes'
import type { LoadingStatus } from '../types/game'
import { useDialogueStore } from '../dialogue/dialogueStore'
import { playSfx, unlockAudioIfNeeded } from '../ui/sfx'
import { useNpcStore } from './npcStore'
import { usePlayerStore } from './playerStore'

type GamePhase = 'intro' | 'preparing' | 'playing' | 'cleared' | 'timedOut' | 'conquered'

type GameState = {
  gameMode: GameMode
  gamePhase: GamePhase
  progressionIndex: number
  activeNpcCount: number
  stage: number
  stageKind: StageKind
  targetNpcIds: string[]
  foundTargetNpcIds: string[]
  clearedNpcId: string | null
  startedAt: number | null
  preparedAt: number | null
  clearTimeSeconds: number | null
  npcProfiles: NPCProfile[]
  npcLayoutVersion: number
  npcResetVersion: number
  playerModelStatus: LoadingStatus
  playerModelError: string | null
  tipsAcknowledged: boolean
  setGameMode: (gameMode: GameMode) => void
  acknowledgeTips: () => void
  startGame: () => void
  beginPlaying: () => void
  clearGame: (foundNpcId: string) => void
  timeUp: () => void
  continueToNextStage: () => void
  retryStage: () => void
  resetGame: () => void
  rerollTargets: () => void
  setNpcProfiles: (npcProfiles: NPCProfile[]) => void
  setPlayerModelLoading: () => void
  setPlayerModelReady: () => void
  setPlayerModelError: (message: string) => void
}

function createInitialState() {
  const dev = getDevBootstrapConfig()
  const progressionIndex = dev?.progressionIndex ?? 0
  const step = getProgressionStep(progressionIndex)
  if (!step) {
    throw new Error(`Progression step ${progressionIndex} is missing.`)
  }

  const activeNpcCount = step.npcCount
  const npcProfiles = buildNpcProfiles(activeNpcCount)
  resetPlayerToStart()
  seedNpcPositions(npcProfiles)

  const targetNpcIds = pickRandomTargetNpcIds(npcProfiles, step.targetCount)
  const foundTargetNpcIds = pickFoundTargetNpcIds(targetNpcIds, dev?.foundCount ?? 0)

  const base = {
    gameMode: dev?.gameMode ?? DEFAULT_GAME_MODE,
    progressionIndex,
    activeNpcCount,
    stage: step.stageNumber,
    stageKind: step.kind,
    targetNpcIds,
    foundTargetNpcIds,
    clearedNpcId: null as string | null,
    startedAt: null as number | null,
    preparedAt: null as number | null,
    clearTimeSeconds: null as number | null,
    npcProfiles,
    npcLayoutVersion: 1,
    npcResetVersion: 0,
    playerModelStatus: 'idle' as const,
    playerModelError: null,
    tipsAcknowledged: dev?.tipsAcknowledged ?? true,
  }

  if (!dev) {
    return {
      ...base,
      gamePhase: 'intro' as const,
    }
  }

  switch (dev.phase) {
    case 'preparing':
      return {
        ...base,
        gamePhase: 'preparing' as const,
        preparedAt: Date.now(),
      }
    case 'playing':
      return {
        ...base,
        gamePhase: 'playing' as const,
        startedAt: Date.now(),
      }
    case 'timedout':
      return {
        ...base,
        gamePhase: 'timedOut' as const,
        startedAt: Date.now() - 180_000,
        clearTimeSeconds: GAME_TIME_LIMIT_SECONDS,
      }
    case 'cleared': {
      const clearedProgressionIndex = progressionIndex + 1
      const nextStep = getProgressionStep(clearedProgressionIndex)

      if (!nextStep) {
        return {
          ...base,
          gamePhase: 'conquered' as const,
          clearedNpcId: targetNpcIds[targetNpcIds.length - 1] ?? null,
          foundTargetNpcIds: targetNpcIds,
          targetNpcIds: [],
          clearTimeSeconds: 72.4,
        }
      }

      return {
        ...base,
        gamePhase: 'cleared' as const,
        progressionIndex: clearedProgressionIndex,
        activeNpcCount: nextStep.npcCount,
        stage: nextStep.stageNumber,
        stageKind: nextStep.kind,
        clearedNpcId: targetNpcIds[targetNpcIds.length - 1] ?? null,
        foundTargetNpcIds: [],
        targetNpcIds: [],
        clearTimeSeconds: 72.4,
      }
    }
    case 'conquered':
      return {
        ...base,
        gamePhase: 'conquered' as const,
        clearedNpcId: targetNpcIds[targetNpcIds.length - 1] ?? null,
        foundTargetNpcIds: targetNpcIds,
        targetNpcIds: [],
        clearTimeSeconds: 142.8,
      }
    default:
      return {
        ...base,
        gamePhase: 'intro' as const,
      }
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  ...createInitialState(),
  setGameMode: (gameMode) => set({ gameMode }),
  acknowledgeTips: () => set({ tipsAcknowledged: true }),
  startGame: () => {
    softResetForGameStart()
    usePlayerStore.getState().setMovementLocked(true)

    const step = getProgressionStep(get().progressionIndex)
    if (!step) return

    set({
      gamePhase: 'preparing',
      tipsAcknowledged: false,
      clearedNpcId: null,
      clearTimeSeconds: null,
      startedAt: null,
      preparedAt: Date.now(),
      stage: step.stageNumber,
      stageKind: step.kind,
      foundTargetNpcIds: [],
    })
  },
  beginPlaying: () => {
    usePlayerStore.getState().setMovementLocked(false)

    set({
      gamePhase: 'playing',
      startedAt: Date.now(),
      preparedAt: null,
    })
  },
  clearGame: (foundNpcId) => {
    const state = get()
    if (
      !state.targetNpcIds.includes(foundNpcId) ||
      state.foundTargetNpcIds.includes(foundNpcId)
    ) {
      return
    }

    const clearTimeSeconds = state.startedAt ? (Date.now() - state.startedAt) / 1000 : null
    const foundTargetNpcIds = [...state.foundTargetNpcIds, foundNpcId]
    const hasRemainingTargets = state.targetNpcIds.some((id) => !foundTargetNpcIds.includes(id))
    const isMultiTargetStage = state.targetNpcIds.length > 1

    if (hasRemainingTargets) {
      if (isMultiTargetStage) {
        unlockAudioIfNeeded().then(() => playSfx('targetFound'))
      }

      usePlayerStore.getState().setMovementLocked(false)

      set({
        foundTargetNpcIds,
        clearedNpcId: foundNpcId,
        gamePhase: 'playing' as const,
      })
      return
    }

    const nextIndex = state.progressionIndex + 1
    const nextStep = getProgressionStep(nextIndex)

    if (!nextStep) {
      set({
        gamePhase: 'conquered' as const,
        foundTargetNpcIds,
        targetNpcIds: [],
        clearedNpcId: foundNpcId,
        clearTimeSeconds,
      })
      return
    }

    set({
      gamePhase: 'cleared' as const,
      progressionIndex: nextIndex,
      activeNpcCount: nextStep.npcCount,
      stage: nextStep.stageNumber,
      stageKind: nextStep.kind,
      foundTargetNpcIds: [],
      targetNpcIds: [],
      clearedNpcId: foundNpcId,
      clearTimeSeconds,
    })
  },
  timeUp: () => {
    if (!isTimedGameMode(get().gameMode)) {
      return
    }

    usePlayerStore.getState().setMovementLocked(false)
    set((state) => ({
      gamePhase: 'timedOut',
      clearTimeSeconds: state.startedAt ? (Date.now() - state.startedAt) / 1000 : GAME_TIME_LIMIT_SECONDS,
    }))
  },
  continueToNextStage: () => {
    const state = get()
    const step = getProgressionStep(state.progressionIndex)
    if (!step) return

    const npcLayout = createNpcLayout(step.npcCount, state.npcLayoutVersion)
    const targetNpcIds = pickRandomTargetNpcIds(npcLayout.npcProfiles, step.targetCount)
    resetStageRuntimeState(collectKeepMeebitIds(npcLayout.npcProfiles, targetNpcIds))
    seedNpcPositions(npcLayout.npcProfiles)
    resetPlayerPositionToStart()
    usePlayerStore.getState().setMovementLocked(true)
    preloadTargetVrms(npcLayout.npcProfiles, targetNpcIds)

    set({
      gamePhase: 'preparing',
      ...npcLayout,
      activeNpcCount: step.npcCount,
      targetNpcIds,
      foundTargetNpcIds: [],
      clearedNpcId: null,
      clearTimeSeconds: null,
      startedAt: null,
      preparedAt: Date.now(),
      stage: step.stageNumber,
      stageKind: step.kind,
    })
  },
  retryStage: () => {
    const state = get()
    const step = getProgressionStep(state.progressionIndex)
    if (!step) return

    const targetNpcIds = pickRandomTargetNpcIds(state.npcProfiles, step.targetCount, state.targetNpcIds)
    resetStageRuntimeStateForRetry(collectKeepMeebitIds(state.npcProfiles, targetNpcIds))
    seedNpcPositions(state.npcProfiles)
    resetPlayerPositionToStart()
    usePlayerStore.getState().setMovementLocked(true)
    preloadTargetVrms(state.npcProfiles, targetNpcIds)

    set({
      gamePhase: 'preparing',
      activeNpcCount: step.npcCount,
      targetNpcIds,
      foundTargetNpcIds: [],
      clearedNpcId: null,
      clearTimeSeconds: null,
      startedAt: null,
      preparedAt: Date.now(),
      stage: step.stageNumber,
      stageKind: step.kind,
      npcResetVersion: state.npcResetVersion + 1,
    })
  },
  resetGame: () => {
    resetStageRuntimeState()
    set(createInitialState())
  },
  rerollTargets: () =>
    set((state) => {
      const step = getProgressionStep(state.progressionIndex)
      if (!step) return state

      const targetNpcIds = pickRandomTargetNpcIds(
        state.npcProfiles,
        step.targetCount,
        state.targetNpcIds,
      )
      preloadTargetVrms(state.npcProfiles, targetNpcIds)

      return { targetNpcIds, foundTargetNpcIds: [] }
    }),
  setNpcProfiles: (npcProfiles) =>
    set((state) => {
      seedNpcPositions(npcProfiles)
      return {
        npcProfiles,
        npcLayoutVersion: state.npcLayoutVersion + 1,
      }
    }),
  setPlayerModelLoading: () => set({ playerModelStatus: 'loading', playerModelError: null }),
  setPlayerModelReady: () => set({ playerModelStatus: 'ready', playerModelError: null }),
  setPlayerModelError: (message) => set({ playerModelStatus: 'error', playerModelError: message }),
}))

function pickFoundTargetNpcIds(targetNpcIds: string[], foundCount: number) {
  if (foundCount <= 0) {
    return []
  }

  return targetNpcIds.slice(0, Math.min(foundCount, targetNpcIds.length))
}

function createNpcLayout(activeNpcCount: number, currentLayoutVersion: number) {
  return {
    npcProfiles: buildNpcProfiles(activeNpcCount),
    npcLayoutVersion: currentLayoutVersion + 1,
  }
}

function preloadTargetVrms(profiles: NPCProfile[], targetNpcIds: string[]) {
  for (const targetNpcId of targetNpcIds) {
    const targetNpc = profiles.find((npc) => npc.id === targetNpcId)
    if (targetNpc) {
      preloadVrm(targetNpc.meebitNumber, -300)
    }
  }
}

function collectKeepMeebitIds(profiles: NPCProfile[], targetNpcIds: string[]) {
  const keepIds = new Set<number>([usePlayerStore.getState().meebitNumber])

  for (const targetNpcId of targetNpcIds) {
    const targetNpc = profiles.find((npc) => npc.id === targetNpcId)
    if (targetNpc) {
      keepIds.add(targetNpc.meebitNumber)
    }
  }

  for (const meebitId of getVrmSculptureMeebitIds()) {
    keepIds.add(meebitId)
  }

  return [...keepIds]
}

function seedNpcPositions(profiles: NPCProfile[]) {
  const npcPositions: Record<string, [number, number, number]> = {}

  for (const profile of profiles) {
    npcPositions[profile.id] = [profile.position[0], 0, profile.position[2]]
  }

  useNpcStore.setState({ nearestNpcId: null, npcPositions })
  warmStartActiveVrmNpcIds(profiles)
}

function warmStartActiveVrmNpcIds(profiles: NPCProfile[]) {
  const playerX = PLAYER_START_POSITION[0]
  const playerZ = PLAYER_START_POSITION[2]

  const sorted = [...profiles]
    .filter((npc) => npc.id !== CREATOR_NPC_ID)
    .map((npc) => {
      const dx = playerX - npc.position[0]
      const dz = playerZ - npc.position[2]
      return { id: npc.id, distance: Math.hypot(dx, dz) }
    })
    .sort((a, b) => a.distance - b.distance)

  const nextIds = new Set<string>()
  nextIds.add(CREATOR_NPC_ID)

  for (const npc of sorted) {
    if (npc.distance > getWarmupLoadDistance()) break
    nextIds.add(npc.id)
  }

  setActiveVrmNpcIds(nextIds)
}

function resetPlayerPositionToStart() {
  resetPlayerWorldState(
    [PLAYER_START_POSITION[0], PLAYER_START_POSITION[1], PLAYER_START_POSITION[2]],
    Math.PI,
  )
  usePlayerStore.getState().setMovementLocked(false)
}

function resetPlayerToStart() {
  usePlayerStore.getState().setMeebitNumber(DEFAULT_PLAYER_MEEBIT_ID)
  resetPlayerPositionToStart()
}

function softResetForGameStart() {
  useNpcStore.setState({ nearestNpcId: null })
}

function resetStageRuntimeState(keepMeebitIds: number[] = []) {
  resetVrmInstancePoolForStageChange(keepMeebitIds)
  clearTargetPreviewCacheExcept(keepMeebitIds)
  clearActiveVrmNpcIds()
  useDialogueStore.getState().closeDialogue()
  useNpcStore.setState({
    nearestNpcId: null,
    npcPositions: {},
  })
}

/** リトライ: NPC 配置は維持し、ターゲット差し替え分だけ VRM プールを整理する */
function resetStageRuntimeStateForRetry(keepMeebitIds: number[] = []) {
  resetVrmInstancePoolForStageChange(keepMeebitIds)
  finalizeVrmInstancePoolEviction()
  clearTargetPreviewCacheExcept(keepMeebitIds)
  clearActiveVrmNpcIds()
  useDialogueStore.getState().closeDialogue()
  useNpcStore.setState({ nearestNpcId: null })
}

export function getRemainingTargetNpcIds(targetNpcIds: string[], foundTargetNpcIds: string[]) {
  return targetNpcIds.filter((id) => !foundTargetNpcIds.includes(id))
}

export function getElapsedSeconds(startedAt: number | null) {
  if (startedAt === null) {
    return 0
  }

  return (Date.now() - startedAt) / 1000
}

export function getRemainingSeconds(startedAt: number | null) {
  return Math.max(0, GAME_TIME_LIMIT_SECONDS - getElapsedSeconds(startedAt))
}

export function getCurrentStageLabel(progressionIndex: number) {
  const step = getProgressionStep(progressionIndex)
  return step ? getStageLabel(step) : 'Stage'
}
