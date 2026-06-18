import type { Vector3Tuple } from '../types/game'
import { buildHintLandmarks } from '../world/worldLandmarks'

/** かなり近いときだけ「すぐ近く」ヒント */
const VERY_CLOSE_DISTANCE = 14
/** ランドマーク（木・彫刻・ベンチ）— エリア内の目印 */
const LANDMARK_RADIUS = 10
/** 別エリアかつ遠いときは、エリア名だけに留める */
const FAR_ACROSS_MUSEUM = 48

const LANDMARKS = buildHintLandmarks()

/** 博物館を6エリアに分割（東西は可、NE など8方向は使わない） */
type MapZone = 'entrance' | 'front' | 'center' | 'back' | 'west' | 'east'

const ZONE_PHRASES: Record<MapZone, string[]> = {
  entrance: ['near the entrance', 'in the entrance area'],
  front: ['in the front half of the museum', 'in the front part of the gallery'],
  center: ['in the middle of the museum', 'around the center of the gallery'],
  back: ['in the back half of the museum', 'in the back part of the gallery'],
  west: ['on the west side of the museum', 'in the west area of the gallery'],
  east: ['on the east side of the museum', 'in the east area of the gallery'],
}

const SAME_ZONE_PHRASES: Record<MapZone, string[]> = {
  entrance: ['in this entrance area with you. Keep looking'],
  front: ['in this front area with you. Keep looking'],
  center: ['in this middle area with you. Keep looking'],
  back: ['in this back area with you. Keep looking'],
  west: ['on the west side with you. Keep looking'],
  east: ['on the east side with you. Keep looking'],
}

const FAR_ZONE_PHRASES: Record<MapZone, string[]> = {
  entrance: ['far toward the entrance area'],
  front: ['far toward the front of the museum'],
  center: ['far toward the middle of the museum'],
  back: ['far toward the back of the museum'],
  west: ['far toward the west side of the museum'],
  east: ['far toward the east side of the museum'],
}

const VERY_CLOSE_PHRASES = ['somewhere near you. Keep looking']

const HINT_PREFIXES = ['Hint:']

export function buildTargetLocationHint(
  playerPosition: Vector3Tuple,
  targetPosition: Vector3Tuple,
  seed = 0,
): string {
  const targetX = targetPosition[0]
  const targetZ = targetPosition[2]
  const distance = Math.hypot(targetX - playerPosition[0], targetZ - playerPosition[2])
  const prefix = pickFrom(HINT_PREFIXES, seed)

  if (distance < VERY_CLOSE_DISTANCE) {
    const phrase = pickFrom(VERY_CLOSE_PHRASES, seed + 1)
    return `${prefix} your target is ${phrase}.`
  }

  const landmarkPhrase = getNearestLandmarkPhrase(targetX, targetZ, seed + 2)
  if (landmarkPhrase) {
    return `${prefix} your target is ${landmarkPhrase}.`
  }

  const targetZone = classifyZone(targetX, targetZ)
  const playerZone = classifyZone(playerPosition[0], playerPosition[2])

  if (targetZone === playerZone) {
    const phrase = pickFrom(SAME_ZONE_PHRASES[targetZone], seed + 3)
    return `${prefix} your target is ${phrase}.`
  }

  if (distance >= FAR_ACROSS_MUSEUM) {
    const phrase = pickFrom(FAR_ZONE_PHRASES[targetZone], seed + 4)
    return `${prefix} your target is ${phrase}.`
  }

  const phrase = pickFrom(ZONE_PHRASES[targetZone], seed + 4)
  return `${prefix} your target is ${phrase}.`
}

export function classifyZone(x: number, z: number): MapZone {
  if (x < -26) {
    return 'west'
  }

  if (x > 26) {
    return 'east'
  }

  if (z > 36) {
    return 'entrance'
  }

  if (z < -26) {
    return 'back'
  }

  if (z > 6) {
    return 'front'
  }

  return 'center'
}

function getNearestLandmarkPhrase(x: number, z: number, seed: number) {
  let nearest: (typeof LANDMARKS)[number] | null = null
  let nearestDistance = LANDMARK_RADIUS

  for (const landmark of LANDMARKS) {
    const distance = Math.hypot(x - landmark.x, z - landmark.z)
    if (distance < nearestDistance) {
      nearest = landmark
      nearestDistance = distance
    }
  }

  if (!nearest) {
    return null
  }

  return pickFrom(nearest.phrases, seed)
}

function pickFrom<T>(options: T[], seed: number) {
  const index = Math.abs(Math.floor(Math.sin(seed * 12.9898) * 43758.5453)) % options.length
  return options[index]
}
