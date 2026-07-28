import { MEET_SERGITO, WORKSHOP_OBSTACLES } from './config'

type ObstacleBox = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

function boxFromCenter(x: number, z: number, halfX: number, halfZ: number): ObstacleBox {
  return {
    minX: x - halfX,
    maxX: x + halfX,
    minZ: z - halfZ,
    maxZ: z + halfZ,
  }
}

function buildObstacles(): ObstacleBox[] {
  const { roomHalfX, roomMinZ, roomMaxZ, entranceHalf } = MEET_SERGITO
  const wallT = 0.35
  const roomDepth = roomMaxZ - roomMinZ
  const roomCenterZ = (roomMinZ + roomMaxZ) / 2

  const boxes: ObstacleBox[] = [
    boxFromCenter(0, roomMinZ - wallT, roomHalfX + wallT, wallT),
    boxFromCenter(-(roomHalfX + entranceHalf) / 2, roomMaxZ + wallT, (roomHalfX - entranceHalf) / 2, wallT),
    boxFromCenter((roomHalfX + entranceHalf) / 2, roomMaxZ + wallT, (roomHalfX - entranceHalf) / 2, wallT),
    boxFromCenter(-(roomHalfX + wallT), roomCenterZ, wallT, roomDepth / 2 + wallT),
    boxFromCenter(roomHalfX + wallT, roomCenterZ, wallT, roomDepth / 2 + wallT),
  ]

  for (const obstacle of WORKSHOP_OBSTACLES) {
    boxes.push(boxFromCenter(obstacle.x, obstacle.z, obstacle.halfX, obstacle.halfZ))
  }

  return boxes
}

const OBSTACLES = buildObstacles()

function circleHitsBox(x: number, z: number, radius: number, box: ObstacleBox) {
  const nearestX = Math.min(Math.max(x, box.minX), box.maxX)
  const nearestZ = Math.min(Math.max(z, box.minZ), box.maxZ)
  const dx = x - nearestX
  const dz = z - nearestZ
  return dx * dx + dz * dz < radius * radius
}

export function isWorkshopPositionWalkable(x: number, z: number, radius = MEET_SERGITO.playerRadius) {
  const { roomHalfX, roomMinZ, roomMaxZ } = MEET_SERGITO
  if (x < -roomHalfX + radius || x > roomHalfX - radius) return false
  if (z < roomMinZ + radius || z > roomMaxZ - radius) return false
  for (const box of OBSTACLES) {
    if (circleHitsBox(x, z, radius, box)) return false
  }
  return true
}

export function resolveWorkshopMovement(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  radius = MEET_SERGITO.playerRadius,
) {
  if (isWorkshopPositionWalkable(toX, toZ, radius)) {
    return { x: toX, z: toZ }
  }
  if (isWorkshopPositionWalkable(toX, fromZ, radius)) {
    return { x: toX, z: fromZ }
  }
  if (isWorkshopPositionWalkable(fromX, toZ, radius)) {
    return { x: fromX, z: toZ }
  }
  return { x: fromX, z: fromZ }
}
