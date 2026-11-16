import { JAZZ_BAR } from './config'

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
  const {
    roomHalfX,
    roomMinZ,
    roomMaxZ,
    stools,
    tables,
    screen,
    entranceHalf,
    stoolCollisionHalf,
    tableCollisionHalf,
  } = JAZZ_BAR
  const wallT = 0.35
  const boxes: ObstacleBox[] = [
    boxFromCenter(0, roomMinZ - wallT, roomHalfX + wallT, wallT),
    boxFromCenter(-(roomHalfX + entranceHalf) / 2, roomMaxZ + wallT, (roomHalfX - entranceHalf) / 2, wallT),
    boxFromCenter((roomHalfX + entranceHalf) / 2, roomMaxZ + wallT, (roomHalfX - entranceHalf) / 2, wallT),
    boxFromCenter(-(roomHalfX + wallT), (roomMinZ + roomMaxZ) / 2, wallT, (roomMaxZ - roomMinZ) / 2 + wallT),
    boxFromCenter(roomHalfX + wallT, (roomMinZ + roomMaxZ) / 2, wallT, (roomMaxZ - roomMinZ) / 2 + wallT),
    boxFromCenter(screen.x, screen.z - 0.25, screen.width / 2 + 0.25, 0.5),
  ]

  for (const stool of stools) {
    boxes.push(boxFromCenter(stool.x, stool.z, stoolCollisionHalf, stoolCollisionHalf))
  }
  for (const table of tables) {
    boxes.push(boxFromCenter(table.x, table.z, tableCollisionHalf, tableCollisionHalf))
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

export function isJazzBarPositionWalkable(x: number, z: number, radius = JAZZ_BAR.playerRadius) {
  const { roomHalfX, roomMinZ, roomMaxZ } = JAZZ_BAR
  if (x < -roomHalfX + radius || x > roomHalfX - radius) return false
  if (z < roomMinZ + radius || z > roomMaxZ - radius) return false
  for (const box of OBSTACLES) {
    if (circleHitsBox(x, z, radius, box)) return false
  }
  return true
}

export function resolveJazzBarMovement(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  radius = JAZZ_BAR.playerRadius,
) {
  if (isJazzBarPositionWalkable(toX, toZ, radius)) return { x: toX, z: toZ }
  if (isJazzBarPositionWalkable(toX, fromZ, radius)) return { x: toX, z: fromZ }
  if (isJazzBarPositionWalkable(fromX, toZ, radius)) return { x: fromX, z: toZ }
  return { x: fromX, z: fromZ }
}
