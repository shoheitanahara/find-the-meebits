import { MEET_SERGITO, WORKSHOP_OBSTACLES } from './config'
import { WORKSHOP_SHELF } from './world/workshopFigureLayout'

type ObstacleBox = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

/** WorkshopShelves の棚板奥行きと一致 */
const WORKSHOP_SHELF_DEPTH = 0.95
/** 見た目の壁より内側で止める（めり込み防止） */
const WALL_COLLISION_INSET = 0.4

function boxFromCenter(x: number, z: number, halfX: number, halfZ: number): ObstacleBox {
  return {
    minX: x - halfX,
    maxX: x + halfX,
    minZ: z - halfZ,
    maxZ: z + halfZ,
  }
}

function buildShelfObstacles(): ObstacleBox[] {
  const halfZ = WORKSHOP_SHELF.spanZ / 2
  const halfX = WORKSHOP_SHELF_DEPTH / 2 + 0.12
  const inset = WORKSHOP_SHELF_DEPTH / 2 + 0.06
  return [
    boxFromCenter(WORKSHOP_SHELF.leftCenterX + inset, 0, halfX, halfZ),
    boxFromCenter(WORKSHOP_SHELF.rightCenterX - inset, 0, halfX, halfZ),
  ]
}

function buildObstacles(): ObstacleBox[] {
  const { roomHalfX, roomMinZ, roomMaxZ, entranceHalf } = MEET_SERGITO
  const wallT = 0.35
  const inset = WALL_COLLISION_INSET
  const roomDepth = roomMaxZ - roomMinZ
  const roomCenterZ = (roomMinZ + roomMaxZ) / 2

  // 壁コリジョンを部屋内側へ inset ぶん寄せる
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

  for (const obstacle of WORKSHOP_OBSTACLES) {
    boxes.push(boxFromCenter(obstacle.x, obstacle.z, obstacle.halfX, obstacle.halfZ))
  }

  boxes.push(...buildShelfObstacles())

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

export function isWorkshopPositionWalkable(x: number, z: number, radius: number = MEET_SERGITO.playerRadius) {
  const { roomHalfX, roomMinZ, roomMaxZ } = MEET_SERGITO
  const margin = radius + WALL_COLLISION_INSET
  if (x < -roomHalfX + margin || x > roomHalfX - margin) return false
  if (z < roomMinZ + margin || z > roomMaxZ - margin) return false
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
  radius: number = MEET_SERGITO.playerRadius,
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
