import { CLUB } from './config'

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
  const { roomHalfX, roomMinZ, roomMaxZ, screen, entranceHalf } = CLUB
  const wallT = 0.35
  return [
    boxFromCenter(0, roomMinZ - wallT, roomHalfX + wallT, wallT),
    boxFromCenter(-(roomHalfX + entranceHalf) / 2, roomMaxZ + wallT, (roomHalfX - entranceHalf) / 2, wallT),
    boxFromCenter((roomHalfX + entranceHalf) / 2, roomMaxZ + wallT, (roomHalfX - entranceHalf) / 2, wallT),
    boxFromCenter(-(roomHalfX + wallT), (roomMinZ + roomMaxZ) / 2, wallT, (roomMaxZ - roomMinZ) / 2 + wallT),
    boxFromCenter(roomHalfX + wallT, (roomMinZ + roomMaxZ) / 2, wallT, (roomMaxZ - roomMinZ) / 2 + wallT),
    boxFromCenter(screen.x, screen.z - 0.25, screen.width / 2 + 0.25, 0.5),
  ]
}

const OBSTACLES = buildObstacles()

function circleHitsBox(x: number, z: number, radius: number, box: ObstacleBox) {
  const nearestX = Math.min(Math.max(x, box.minX), box.maxX)
  const nearestZ = Math.min(Math.max(z, box.minZ), box.maxZ)
  const dx = x - nearestX
  const dz = z - nearestZ
  return dx * dx + dz * dz < radius * radius
}

export function isClubPositionWalkable(x: number, z: number, radius = CLUB.playerRadius) {
  const { roomHalfX, roomMinZ, roomMaxZ } = CLUB
  if (x < -roomHalfX + radius || x > roomHalfX - radius) return false
  if (z < roomMinZ + radius || z > roomMaxZ - radius) return false
  for (const box of OBSTACLES) {
    if (circleHitsBox(x, z, radius, box)) return false
  }
  return true
}

export function resolveClubMovement(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  radius = CLUB.playerRadius,
) {
  if (isClubPositionWalkable(toX, toZ, radius)) return { x: toX, z: toZ }
  if (isClubPositionWalkable(toX, fromZ, radius)) return { x: toX, z: fromZ }
  if (isClubPositionWalkable(fromX, toZ, radius)) return { x: fromX, z: toZ }
  return { x: fromX, z: fromZ }
}
