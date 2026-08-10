import { MARKET_OBSTACLES, OPEN_SEA_MARKET } from './config'

type ObstacleBox = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

const WALL_COLLISION_INSET = 0.35

function boxFromCenter(x: number, z: number, halfX: number, halfZ: number): ObstacleBox {
  return {
    minX: x - halfX,
    maxX: x + halfX,
    minZ: z - halfZ,
    maxZ: z + halfZ,
  }
}

function buildObstacles(): ObstacleBox[] {
  const { roomHalfX, roomMinZ, roomMaxZ, entranceHalf } = OPEN_SEA_MARKET
  const wallT = 0.35
  const inset = WALL_COLLISION_INSET
  const roomDepth = roomMaxZ - roomMinZ
  const roomCenterZ = (roomMinZ + roomMaxZ) / 2

  const boxes: ObstacleBox[] = [
    boxFromCenter(0, roomMinZ + inset - wallT, roomHalfX + wallT, wallT),
    boxFromCenter(
      -(roomHalfX + entranceHalf) / 2,
      roomMaxZ - inset + wallT,
      (roomHalfX - entranceHalf) / 2,
      wallT,
    ),
    boxFromCenter(
      (roomHalfX + entranceHalf) / 2,
      roomMaxZ - inset + wallT,
      (roomHalfX - entranceHalf) / 2,
      wallT,
    ),
    boxFromCenter(-(roomHalfX - inset + wallT), roomCenterZ, wallT, roomDepth / 2 + wallT),
    boxFromCenter(roomHalfX - inset + wallT, roomCenterZ, wallT, roomDepth / 2 + wallT),
  ]

  for (const o of MARKET_OBSTACLES) {
    boxes.push(boxFromCenter(o.x, o.z, o.halfX, o.halfZ))
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

export function isMarketPositionWalkable(
  x: number,
  z: number,
  radius: number = OPEN_SEA_MARKET.playerRadius,
) {
  for (const box of OBSTACLES) {
    if (circleHitsBox(x, z, radius, box)) return false
  }
  return true
}

/** NPC 用 — 壁から離して対話カメラの壁抜けを減らす */
export function isMarketWalkerPositionWalkable(
  x: number,
  z: number,
  radius: number = 0.36,
) {
  const { roomHalfX, roomMinZ, roomMaxZ, walkerWallMargin } = OPEN_SEA_MARKET
  if (Math.abs(x) > roomHalfX - walkerWallMargin) return false
  if (z < roomMinZ + walkerWallMargin || z > roomMaxZ - walkerWallMargin) return false
  return isMarketPositionWalkable(x, z, radius)
}

export function resolveMarketMovement(fromX: number, fromZ: number, toX: number, toZ: number) {
  const radius = OPEN_SEA_MARKET.playerRadius
  if (isMarketPositionWalkable(toX, toZ, radius)) return { x: toX, z: toZ }
  if (isMarketPositionWalkable(toX, fromZ, radius)) return { x: toX, z: fromZ }
  if (isMarketPositionWalkable(fromX, toZ, radius)) return { x: fromX, z: toZ }
  return { x: fromX, z: fromZ }
}
