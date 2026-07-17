import { NPC_COLLISION_RADIUS, collidesWithObstacles } from './collision'
import { PLAYER_START_POSITION, WORLD_RADIUS } from '../game/gameConfig'
import type { VenueId } from '../game/venueConfig'

/** ワールド端から内側へ。ガラス壁より少し内側になるよう余裕を取る */
const WORLD_EDGE_MARGIN = 24
const PLAYER_START_EXCLUSION_RADIUS = 12
const MIN_NPC_SPACING = 1.15
const SPAWN_CHECK_RADIUS = NPC_COLLISION_RADIUS + 0.2

export function isValidNpcSpawn(
  x: number,
  z: number,
  existingSpawns: Array<[number, number]> = [],
  venueId: VenueId = 'museum',
): boolean {
  if (collidesWithObstacles(x, z, SPAWN_CHECK_RADIUS, venueId)) {
    return false
  }

  const worldLimit = WORLD_RADIUS - WORLD_EDGE_MARGIN
  if (Math.abs(x) > worldLimit || Math.abs(z) > worldLimit) {
    return false
  }

  const distanceFromPlayerStart = Math.hypot(
    x - PLAYER_START_POSITION[0],
    z - PLAYER_START_POSITION[2],
  )
  if (distanceFromPlayerStart < PLAYER_START_EXCLUSION_RADIUS) {
    return false
  }

  for (const [existingX, existingZ] of existingSpawns) {
    if (Math.hypot(x - existingX, z - existingZ) < MIN_NPC_SPACING) {
      return false
    }
  }

  return true
}

export function generateRandomNpcSpawnPosition(
  existingSpawns: Array<[number, number]>,
  venueId: VenueId = 'museum',
): [number, number] {
  const spawnRadius = WORLD_RADIUS - WORLD_EDGE_MARGIN

  for (let attempt = 0; attempt < 128; attempt++) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.sqrt(Math.random()) * spawnRadius
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    if (isValidNpcSpawn(x, z, existingSpawns, venueId)) {
      return [round(x), round(z)]
    }
  }

  const fallbackIndex = existingSpawns.length
  const fallbackAngle = fallbackIndex * 2.399963 + Math.random() * 0.5
  const fallbackRadius = Math.min(14 + (fallbackIndex % 28) * 2, spawnRadius * 0.85)
  const fallbackX = Math.cos(fallbackAngle) * fallbackRadius
  const fallbackZ = Math.sin(fallbackAngle) * fallbackRadius

  if (isValidNpcSpawn(fallbackX, fallbackZ, existingSpawns, venueId)) {
    return [round(fallbackX), round(fallbackZ)]
  }

  return [round(fallbackX), round(fallbackZ)]
}

function round(value: number) {
  return Math.round(value * 100) / 100
}
