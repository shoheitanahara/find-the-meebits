import { useFrame } from '@react-three/fiber'
import { CREATOR_NPC_ID, NPC_MAX_CONCURRENT_VRM, NPC_VRM_ALWAYS_LOAD_DISTANCE, PLAYER_START_POSITION } from '../game/gameConfig'
import { useDialogueStore } from '../dialogue/dialogueStore'
import { useGameStore } from '../stores/gameStore'
import { useNpcStore } from '../stores/npcStore'
import { usePlayerStore } from '../stores/playerStore'
import { getActiveVrmNpcIdsSnapshot, setActiveVrmNpcIds } from './vrmLodState'
import { isNpcWithinVrmRange } from './vrmLodUtils'

type LodCandidate = {
  id: string
  distance: number
}

function isForcedVrmNpc(
  npcId: string,
  dialogueNpcId: string | null,
  targetNpcId: string,
  nearestNpcId: string | null,
) {
  return (
    npcId === CREATOR_NPC_ID ||
    npcId === dialogueNpcId ||
    npcId === targetNpcId ||
    npcId === nearestNpcId
  )
}

function selectActiveVrmNpcIds(
  candidates: LodCandidate[],
  forcedNpcIds: string[],
  maxConcurrent: number,
) {
  const sorted = [...candidates].sort((left, right) => left.distance - right.distance)
  const activeIds = new Set<string>()
  const forcedSet = new Set(forcedNpcIds)

  for (const forcedId of forcedNpcIds) {
    activeIds.add(forcedId)
  }

  for (const candidate of sorted) {
    if (activeIds.size >= maxConcurrent) {
      break
    }

    activeIds.add(candidate.id)
  }

  if (activeIds.size <= maxConcurrent) {
    return activeIds
  }

  const rankedActive = sorted.filter((candidate) => activeIds.has(candidate.id))

  while (activeIds.size > maxConcurrent) {
    const farthestRemovable = [...rankedActive]
      .reverse()
      .find((candidate) => !forcedSet.has(candidate.id))

    if (!farthestRemovable) {
      break
    }

    activeIds.delete(farthestRemovable.id)
  }

  return activeIds
}

export function NPCVrmLodSystem() {
  useFrame(() => {
    const gamePhase = useGameStore.getState().gamePhase

    if (gamePhase !== 'intro' && gamePhase !== 'preparing' && gamePhase !== 'playing' && gamePhase !== 'timedOut') {
      setActiveVrmNpcIds([])
      return
    }

    const playerPosition =
      gamePhase === 'intro' || gamePhase === 'preparing'
        ? ([
            PLAYER_START_POSITION[0],
            PLAYER_START_POSITION[1],
            PLAYER_START_POSITION[2],
          ] as [number, number, number])
        : usePlayerStore.getState().position
    const npcProfiles = useGameStore.getState().npcProfiles
    const targetNpcId = useGameStore.getState().targetNpcId
    const dialogueNpcId = useDialogueStore.getState().activeNpcId
    const nearestNpcId = useNpcStore.getState().nearestNpcId
    const npcPositions = useNpcStore.getState().npcPositions
    const previousActiveIds = getActiveVrmNpcIdsSnapshot()
    const eligibleCandidates: LodCandidate[] = []
    const isWarmupPhase = gamePhase === 'intro' || gamePhase === 'preparing'

    for (const npc of npcProfiles) {
      const npcPosition = npcPositions[npc.id] ?? npc.position
      const dx = playerPosition[0] - npcPosition[0]
      const dz = playerPosition[2] - npcPosition[2]
      const distance = Math.hypot(dx, dz)
      const wasActive = previousActiveIds.has(npc.id)
      const isForced = isForcedVrmNpc(npc.id, dialogueNpcId, targetNpcId, nearestNpcId)
      const inRange = isNpcWithinVrmRange(distance, playerPosition, npcPosition, wasActive)

      if (!inRange && !isForced) {
        continue
      }

      // スタート前/準備中は「近場優先」しないとロードキューが散って ready が増えにくい。
      if (isWarmupPhase && !isForced && distance > NPC_VRM_ALWAYS_LOAD_DISTANCE) {
        continue
      }

      eligibleCandidates.push({ id: npc.id, distance })
    }

    const forcedNpcIds = [
      CREATOR_NPC_ID,
      dialogueNpcId,
      targetNpcId,
      nearestNpcId,
    ].filter((npcId): npcId is string => Boolean(npcId))

    setActiveVrmNpcIds(
      selectActiveVrmNpcIds(eligibleCandidates, forcedNpcIds, NPC_MAX_CONCURRENT_VRM),
    )
  })

  return null
}
