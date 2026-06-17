import { NPC_COLLISION_RADIUS, collidesWithObstacles } from './collision'
import { PLAYER_START_POSITION, WORLD_RADIUS } from '../game/gameConfig'

const SPAWN_RADIUS = WORLD_RADIUS * 0.72
const WORLD_EDGE_MARGIN = 6
const PLAYER_START_EXCLUSION_RADIUS = 12
const MIN_NPC_SPACING = 1.15
const SPAWN_CHECK_RADIUS = NPC_COLLISION_RADIUS + 0.2

export function isValidNpcSpawn(
  x: number,
  z: number,
  existingSpawns: Array<[number, number]> = [],
): boolean {
  if (collidesWithObstacles(x, z, SPAWN_CHECK_RADIUS)) {
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
): [number, number] {
  for (let attempt = 0; attempt < 128; attempt++) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.sqrt(Math.random()) * SPAWN_RADIUS
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    if (isValidNpcSpawn(x, z, existingSpawns)) {
      return [round(x), round(z)]
    }
  }

  const fallbackIndex = existingSpawns.length
  const fallbackAngle = fallbackIndex * 2.399963 + Math.random() * 0.5
  const fallbackRadius = 14 + (fallbackIndex % 28) * 2
  const fallbackX = Math.cos(fallbackAngle) * fallbackRadius
  const fallbackZ = Math.sin(fallbackAngle) * fallbackRadius

  if (isValidNpcSpawn(fallbackX, fallbackZ, existingSpawns)) {
    return [round(fallbackX), round(fallbackZ)]
  }

  return [round(fallbackX), round(fallbackZ)]
}

function round(value: number) {
  return Math.round(value * 100) / 100
}
