import { WORLD_RADIUS } from '../game/gameConfig'
import { WORLD_OBSTACLES, type ObstacleBox } from './obstacles'

export const PLAYER_COLLISION_RADIUS = 0.45
export const NPC_COLLISION_RADIUS = 0.35

export function circleIntersectsBox(
  centerX: number,
  centerZ: number,
  radius: number,
  box: ObstacleBox,
): boolean {
  const closestX = Math.max(box.minX, Math.min(centerX, box.maxX))
  const closestZ = Math.max(box.minZ, Math.min(centerZ, box.maxZ))
  const deltaX = centerX - closestX
  const deltaZ = centerZ - closestZ

  return deltaX * deltaX + deltaZ * deltaZ < radius * radius
}

export function collidesWithObstacles(
  centerX: number,
  centerZ: number,
  radius: number,
  obstacles: ObstacleBox[] = WORLD_OBSTACLES,
): boolean {
  for (const obstacle of obstacles) {
    if (circleIntersectsBox(centerX, centerZ, radius, obstacle)) {
      return true
    }
  }

  return false
}

export function clampToWorldBounds(x: number, z: number) {
  return {
    x: Math.max(-WORLD_RADIUS, Math.min(WORLD_RADIUS, x)),
    z: Math.max(-WORLD_RADIUS, Math.min(WORLD_RADIUS, z)),
  }
}

export function resolveMovement(
  currentX: number,
  currentZ: number,
  nextX: number,
  nextZ: number,
  radius: number,
): { x: number; z: number } {
  const clamped = clampToWorldBounds(nextX, nextZ)
  let x = clamped.x
  let z = clamped.z

  if (!collidesWithObstacles(x, z, radius)) {
    return { x, z }
  }

  const slideX = clampToWorldBounds(nextX, currentZ)
  if (!collidesWithObstacles(slideX.x, slideX.z, radius)) {
    return { x: slideX.x, z: slideX.z }
  }

  const slideZ = clampToWorldBounds(currentX, nextZ)
  if (!collidesWithObstacles(slideZ.x, slideZ.z, radius)) {
    return { x: slideZ.x, z: slideZ.z }
  }

  return { x: currentX, z: currentZ }
}
