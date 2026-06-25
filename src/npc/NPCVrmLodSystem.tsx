import { useFrame } from '@react-three/fiber'
import {
  CREATOR_NPC_ID,
  INTERACTION_DISTANCE,
  PLAYER_START_POSITION,
} from '../game/gameConfig'
import { getNpcMaxConcurrentVrm, getWarmupLoadDistance } from '../game/perfConfig'
import { getPlayerWorldPosition } from '../avatar/playerWorldState'
import { useDialogueStore } from '../dialogue/dialogueStore'
import { useGameStore } from '../stores/gameStore'
import { useNpcStore } from '../stores/npcStore'
import { getActiveVrmNpcIdsSnapshot, setActiveVrmNpcIds } from './vrmLodState'
import { isNpcWithinVrmRange } from './vrmLodUtils'
import type { Vector3Tuple } from '../types/game'

type LodCandidate = {
  id: string
  distance: number
}

type NpcDistanceEntry = {
  id: string
  distance: number
  position: Vector3Tuple
}

function isForcedVrmNpc(
  npcId: string,
  dialogueNpcId: string | null,
  nearestNpcId: string | null,
) {
  return npcId === CREATOR_NPC_ID || npcId === dialogueNpcId || npcId === nearestNpcId
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
    const isDialogueOpen = useDialogueStore.getState().isOpen

    if (gamePhase !== 'intro' && gamePhase !== 'preparing' && gamePhase !== 'playing' && gamePhase !== 'timedOut') {
      setActiveVrmNpcIds([])
      useNpcStore.getState().setNearestNpcId(null)
      return
    }

    const playerPosition =
      gamePhase === 'intro' || gamePhase === 'preparing'
        ? ([
            PLAYER_START_POSITION[0],
            PLAYER_START_POSITION[1],
            PLAYER_START_POSITION[2],
          ] as [number, number, number])
        : getPlayerWorldPosition()
    const npcProfiles = useGameStore.getState().npcProfiles
    const dialogueNpcId = useDialogueStore.getState().activeNpcId
    const npcPositions = useNpcStore.getState().npcPositions
    const previousActiveIds = getActiveVrmNpcIdsSnapshot()
    const isWarmupPhase = gamePhase === 'intro' || gamePhase === 'preparing'
    const canDetectInteraction = gamePhase === 'playing' && !isDialogueOpen
    const distanceEntries: NpcDistanceEntry[] = []

    for (const npc of npcProfiles) {
      const npcPosition = npcPositions[npc.id] ?? npc.position
      const dx = playerPosition[0] - npcPosition[0]
      const dz = playerPosition[2] - npcPosition[2]

      distanceEntries.push({
        id: npc.id,
        distance: Math.hypot(dx, dz),
        position: npcPosition,
      })
    }

    let nearestNpcId: string | null = null
    let nearestDistance = Infinity

    if (canDetectInteraction) {
      for (const entry of distanceEntries) {
        if (entry.distance <= INTERACTION_DISTANCE && entry.distance < nearestDistance) {
          nearestDistance = entry.distance
          nearestNpcId = entry.id
        }
      }
    }

    useNpcStore.getState().setNearestNpcId(nearestNpcId)

    const eligibleCandidates: LodCandidate[] = []

    for (const entry of distanceEntries) {
      const wasActive = previousActiveIds.has(entry.id)
      const isForced = isForcedVrmNpc(entry.id, dialogueNpcId, nearestNpcId)
      const inRange = isNpcWithinVrmRange(entry.distance, playerPosition, entry.position, wasActive)

      if (!inRange && !isForced) {
        continue
      }

      if (isWarmupPhase && !isForced && entry.distance > getWarmupLoadDistance()) {
        continue
      }

      eligibleCandidates.push({ id: entry.id, distance: entry.distance })
    }

    const forcedNpcIds = [CREATOR_NPC_ID, dialogueNpcId, nearestNpcId].filter(
      (npcId): npcId is string => Boolean(npcId),
    )

    setActiveVrmNpcIds(
      selectActiveVrmNpcIds(eligibleCandidates, forcedNpcIds, getNpcMaxConcurrentVrm()),
    )
  })

  return null
}
