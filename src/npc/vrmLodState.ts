import { getNpcVrmAlwaysLoadDistance, getStageReadyMinCount, getStageReadyRatio } from '../game/perfConfig'
import { isNpcWithinVrmRange } from './vrmLodUtils'
import type { NPCProfile } from './npcTypes'
import type { Vector3Tuple } from '../types/game'

const activeVrmNpcIds = new Set<string>()
const readyVrmNpcIds = new Set<string>()

export function getActiveVrmNpcIdsSnapshot() {
  return new Set(activeVrmNpcIds)
}

export function isNpcVrmActive(npcId: string) {
  return activeVrmNpcIds.has(npcId)
}

export function setNpcVrmReady(npcId: string, ready: boolean) {
  if (ready) {
    readyVrmNpcIds.add(npcId)
    return
  }

  readyVrmNpcIds.delete(npcId)
}

export function clearNpcVrmReady() {
  readyVrmNpcIds.clear()
}

export function getStageVrmReadiness(
  playerPosition?: Vector3Tuple,
  npcProfiles: NPCProfile[] = [],
  npcPositions: Record<string, Vector3Tuple> = {},
) {
  const activeIds = getActiveVrmNpcIdsSnapshot()

  if (activeIds.size === 0) {
    return { activeCount: 0, readyCount: 0, ratio: 0, isReady: false, nearCount: 0, nearReady: 0 }
  }

  let readyCount = 0

  for (const npcId of activeIds) {
    if (readyVrmNpcIds.has(npcId)) {
      readyCount += 1
    }
  }

  const ratio = readyCount / activeIds.size
  const nearRing = getNearRingVrmReadiness(playerPosition, npcProfiles, npcPositions)

  return {
    activeCount: activeIds.size,
    readyCount,
    ratio,
    nearCount: nearRing.nearCount,
    nearReady: nearRing.nearReady,
    isReady:
      readyCount >= getStageReadyMinCount() &&
      ratio >= getStageReadyRatio() &&
      nearRing.isComplete,
  }
}

export function getNearRingVrmReadiness(
  playerPosition: Vector3Tuple | undefined,
  npcProfiles: NPCProfile[],
  npcPositions: Record<string, Vector3Tuple>,
) {
  if (!playerPosition) {
    return { nearCount: 0, nearReady: 0, isComplete: true }
  }

  let nearCount = 0
  let nearReady = 0

  for (const npc of npcProfiles) {
    const npcPosition = npcPositions[npc.id] ?? npc.position
    const distance = Math.hypot(
      playerPosition[0] - npcPosition[0],
      playerPosition[2] - npcPosition[2],
    )

    if (distance > getNpcVrmAlwaysLoadDistance()) {
      continue
    }

    if (!isNpcWithinVrmRange(distance, playerPosition, npcPosition, false)) {
      continue
    }

    nearCount += 1

    if (isNpcVrmActive(npc.id) && readyVrmNpcIds.has(npc.id)) {
      nearReady += 1
    }
  }

  return {
    nearCount,
    nearReady,
    isComplete: nearCount === 0 || nearReady === nearCount,
  }
}

export function setActiveVrmNpcIds(nextIds: Iterable<string>) {
  const nextSet = new Set(nextIds)

  if (areSetsEqual(activeVrmNpcIds, nextSet)) {
    return
  }

  for (const npcId of activeVrmNpcIds) {
    if (!nextSet.has(npcId)) {
      readyVrmNpcIds.delete(npcId)
    }
  }

  activeVrmNpcIds.clear()
  for (const npcId of nextSet) {
    activeVrmNpcIds.add(npcId)
  }
}

function areSetsEqual(left: Set<string>, right: Set<string>) {
  if (left.size !== right.size) {
    return false
  }

  for (const id of left) {
    if (!right.has(id)) {
      return false
    }
  }

  return true
}

export function clearActiveVrmNpcIds() {
  activeVrmNpcIds.clear()
  readyVrmNpcIds.clear()
}
