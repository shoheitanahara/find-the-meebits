import { create } from 'zustand'
import {
  CREATOR_NPC_ID,
  DEFAULT_PLAYER_MEEBIT_ID,
  GAME_TIME_LIMIT_SECONDS,
  NPC_VRM_ALWAYS_LOAD_DISTANCE,
  PLAYER_START_POSITION,
} from '../game/gameConfig'
import { getProgressionStep, getStageLabel, type StageKind } from '../game/gameProgression'
import { pickRandomTargetNpcIds } from '../game/targetSelection'
import { clearActiveVrmNpcIds, setActiveVrmNpcIds } from '../npc/vrmLodState'
import { preloadVrm, resetVrmInstancePoolForStageChange } from '../avatar/vrmInstancePool'
import { buildNpcProfiles } from '../npc/npcGeneration'
import type { NPCProfile } from '../npc/npcTypes'
import type { LoadingStatus } from '../types/game'
import { useDialogueStore } from '../dialogue/dialogueStore'
import { useNpcStore } from './npcStore'
import { usePlayerStore } from './playerStore'

type GamePhase = 'intro' | 'preparing' | 'playing' | 'cleared' | 'timedOut' | 'conquered'

type GameState = {
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
  playerModelStatus: LoadingStatus
  playerModelError: string | null
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
  const progressionIndex = 0
  const step = getProgressionStep(progressionIndex)
  if (!step) {
    throw new Error('Progression step 0 is missing.')
  }

  const activeNpcCount = step.npcCount
  const npcProfiles = buildNpcProfiles(activeNpcCount)
  resetPlayerToStart()
  seedNpcPositions(npcProfiles)

  return {
    gamePhase: 'intro' as const,
    progressionIndex,
    activeNpcCount,
    stage: step.stageNumber,
    stageKind: step.kind,
    targetNpcIds: pickRandomTargetNpcIds(npcProfiles, step.targetCount),
    foundTargetNpcIds: [] as string[],
    clearedNpcId: null,
    startedAt: null,
    preparedAt: null,
    clearTimeSeconds: null,
    npcProfiles,
    npcLayoutVersion: 1,
    playerModelStatus: 'idle' as const,
    playerModelError: null,
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  ...createInitialState(),
  startGame: () => {
    softResetForGameStart()
    usePlayerStore.getState().setMovementLocked(true)

    const step = getProgressionStep(get().progressionIndex)
    if (!step) return

    set({
      gamePhase: 'preparing',
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
  clearGame: (foundNpcId) =>
    set((state) => {
      if (
        !state.targetNpcIds.includes(foundNpcId) ||
        state.foundTargetNpcIds.includes(foundNpcId)
      ) {
        return state
      }

      const clearTimeSeconds = state.startedAt ? (Date.now() - state.startedAt) / 1000 : null
      const foundTargetNpcIds = [...state.foundTargetNpcIds, foundNpcId]
      const hasRemainingTargets = state.targetNpcIds.some((id) => !foundTargetNpcIds.includes(id))

      if (hasRemainingTargets) {
        usePlayerStore.getState().setMovementLocked(false)

        return {
          foundTargetNpcIds,
          clearedNpcId: foundNpcId,
          gamePhase: 'playing' as const,
        }
      }

      const nextIndex = state.progressionIndex + 1
      const nextStep = getProgressionStep(nextIndex)

      if (!nextStep) {
        return {
          gamePhase: 'conquered' as const,
          foundTargetNpcIds,
          targetNpcIds: [],
          clearedNpcId: foundNpcId,
          clearTimeSeconds,
        }
      }

      return {
        gamePhase: 'cleared' as const,
        progressionIndex: nextIndex,
        activeNpcCount: nextStep.npcCount,
        stage: nextStep.stageNumber,
        stageKind: nextStep.kind,
        foundTargetNpcIds: [],
        targetNpcIds: [],
        clearedNpcId: foundNpcId,
        clearTimeSeconds,
      }
    }),
  timeUp: () => {
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
    resetPlayerToStart()
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

    const npcLayout = createNpcLayout(step.npcCount, state.npcLayoutVersion)
    const targetNpcIds = pickRandomTargetNpcIds(npcLayout.npcProfiles, step.targetCount, state.targetNpcIds)
    resetStageRuntimeState(collectKeepMeebitIds(npcLayout.npcProfiles, targetNpcIds))
    seedNpcPositions(npcLayout.npcProfiles)
    resetPlayerToStart()
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
    if (npc.distance > NPC_VRM_ALWAYS_LOAD_DISTANCE) break
    nextIds.add(npc.id)
  }

  setActiveVrmNpcIds(nextIds)
}

function resetPlayerToStart() {
  usePlayerStore.getState().setMeebitNumber(DEFAULT_PLAYER_MEEBIT_ID)
  usePlayerStore
    .getState()
    .setPlayerTransform(
      [PLAYER_START_POSITION[0], PLAYER_START_POSITION[1], PLAYER_START_POSITION[2]],
      Math.PI,
    )
  usePlayerStore.getState().setMovementState(false, false)
  usePlayerStore.getState().setMovementLocked(false)
}

function softResetForGameStart() {
  useNpcStore.setState({ nearestNpcId: null })
}

function resetStageRuntimeState(keepMeebitIds: number[] = []) {
  resetVrmInstancePoolForStageChange(keepMeebitIds)
  clearActiveVrmNpcIds()
  useDialogueStore.getState().closeDialogue()
  useNpcStore.setState({
    nearestNpcId: null,
    npcPositions: {},
  })
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
