import { create } from 'zustand'
import {
  CREATOR_NPC_ID,
  DEFAULT_PLAYER_MEEBIT_ID,
  GAME_TIME_LIMIT_SECONDS,
  INITIAL_NPC_COUNT,
  MAX_NPC_COUNT,
  NPC_COUNT_INCREMENT,
  NPC_VRM_ALWAYS_LOAD_DISTANCE,
  PLAYER_START_POSITION,
  getStageFromNpcCount,
  isFullyConquered,
} from '../game/gameConfig'
import { clearActiveVrmNpcIds, setActiveVrmNpcIds } from '../npc/vrmLodState'
import { preloadVrm, resetVrmInstancePool } from '../avatar/vrmInstancePool'
import { buildNpcProfiles } from '../npc/npcGeneration'
import type { NPCProfile } from '../npc/npcTypes'
import type { LoadingStatus } from '../types/game'
import { useDialogueStore } from '../dialogue/dialogueStore'
import { useNpcStore } from './npcStore'
import { usePlayerStore } from './playerStore'

type GamePhase = 'intro' | 'preparing' | 'playing' | 'cleared' | 'timedOut' | 'conquered'

type GameState = {
  gamePhase: GamePhase
  activeNpcCount: number
  stage: number
  targetNpcId: string
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
  clearGame: () => void
  timeUp: () => void
  continueToNextStage: () => void
  retryStage: () => void
  resetGame: () => void
  rerollTarget: () => void
  setNpcProfiles: (npcProfiles: NPCProfile[]) => void
  setPlayerModelLoading: () => void
  setPlayerModelReady: () => void
  setPlayerModelError: (message: string) => void
}

function createInitialState() {
  const activeNpcCount = INITIAL_NPC_COUNT
  const npcProfiles = buildNpcProfiles(activeNpcCount)
  resetPlayerToStart()
  seedNpcPositions(npcProfiles)

  return {
    gamePhase: 'intro' as const,
    activeNpcCount,
    stage: getStageFromNpcCount(activeNpcCount),
    targetNpcId: getRandomTargetNpcId(npcProfiles),
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

    set({
      gamePhase: 'preparing',
      targetNpcId: get().targetNpcId,
      clearedNpcId: null,
      clearTimeSeconds: null,
      startedAt: null,
      preparedAt: Date.now(),
      stage: getStageFromNpcCount(get().activeNpcCount),
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
  clearGame: () =>
    set((state) => {
      const clearTimeSeconds = state.startedAt ? (Date.now() - state.startedAt) / 1000 : null
      const nextNpcCount = Math.min(MAX_NPC_COUNT, state.activeNpcCount + NPC_COUNT_INCREMENT)

      if (isFullyConquered(state.activeNpcCount)) {
        return {
          gamePhase: 'conquered',
          clearedNpcId: state.targetNpcId,
          clearTimeSeconds,
        }
      }

      return {
        gamePhase: 'cleared',
        clearedNpcId: state.targetNpcId,
        clearTimeSeconds,
        activeNpcCount: nextNpcCount,
        stage: getStageFromNpcCount(nextNpcCount),
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
    const npcLayout = createNpcLayout(state.activeNpcCount, state.npcLayoutVersion)
    const targetNpcId = getRandomTargetNpcId(npcLayout.npcProfiles)
    const targetNpc = npcLayout.npcProfiles.find((npc) => npc.id === targetNpcId)
    resetStageRuntimeState()
    seedNpcPositions(npcLayout.npcProfiles)
    resetPlayerToStart()
    usePlayerStore.getState().setMovementLocked(true)

    if (targetNpc) {
      preloadVrm(targetNpc.meebitNumber, -300)
    }

    set({
      gamePhase: 'preparing',
      ...npcLayout,
      targetNpcId,
      clearedNpcId: null,
      clearTimeSeconds: null,
      startedAt: null,
      preparedAt: Date.now(),
      stage: getStageFromNpcCount(state.activeNpcCount),
    })
  },
  retryStage: () => {
    const state = get()
    const npcLayout = createNpcLayout(state.activeNpcCount, state.npcLayoutVersion)
    const targetNpcId = getRandomTargetNpcId(npcLayout.npcProfiles, state.targetNpcId)
    const targetNpc = npcLayout.npcProfiles.find((npc) => npc.id === targetNpcId)
    resetStageRuntimeState()
    seedNpcPositions(npcLayout.npcProfiles)
    resetPlayerToStart()
    usePlayerStore.getState().setMovementLocked(true)

    if (targetNpc) {
      preloadVrm(targetNpc.meebitNumber, -300)
    }

    set({
      gamePhase: 'preparing',
      ...npcLayout,
      targetNpcId,
      clearedNpcId: null,
      clearTimeSeconds: null,
      startedAt: null,
      preparedAt: Date.now(),
    })
  },
  resetGame: () => {
    resetStageRuntimeState()
    set(createInitialState())
  },
  rerollTarget: () =>
    set((state) => {
      const targetNpcId = getRandomTargetNpcId(state.npcProfiles, state.targetNpcId)
      const targetNpc = state.npcProfiles.find((npc) => npc.id === targetNpcId)

      if (targetNpc) {
        preloadVrm(targetNpc.meebitNumber, -300)
      }

      return { targetNpcId }
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

function seedNpcPositions(profiles: NPCProfile[]) {
  const npcPositions: Record<string, [number, number, number]> = {}

  for (const profile of profiles) {
    npcPositions[profile.id] = [profile.position[0], 0, profile.position[2]]
  }

  useNpcStore.setState({ nearestNpcId: null, npcPositions })
  warmStartActiveVrmNpcIds(profiles)
}

function warmStartActiveVrmNpcIds(profiles: NPCProfile[]) {
  // 次ステージ遷移直後に 1 フレームだけ active=0 になり得るので、ここで初期値を埋める。
  // ただし最初から大量に active にするとロードキューが散って「近くが先にロードされない」ので、
  // スタート地点の近場（ALWAYS_LOAD圏）に絞ってウォームスタートする。
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

function resetStageRuntimeState() {
  resetVrmInstancePool()
  clearActiveVrmNpcIds()
  useDialogueStore.getState().closeDialogue()
  useNpcStore.setState({
    nearestNpcId: null,
    npcPositions: {},
  })
}

function getRandomTargetNpcId(profiles: NPCProfile[], excludeNpcId?: string) {
  const candidates = profiles.filter((npc) => npc.id !== CREATOR_NPC_ID)

  if (candidates.length === 0) {
    return 'npc-001'
  }

  if (candidates.length === 1) {
    return candidates[0].id
  }

  let nextId = candidates[0].id

  do {
    const index = Math.floor(Math.random() * candidates.length)
    nextId = candidates[index].id
  } while (nextId === excludeNpcId)

  return nextId
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
