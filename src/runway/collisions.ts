import { RUNWAY } from './config'

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

/** 壁・ベンチ・スクリーン台・ランウェイの簡易衝突 */
function buildObstacles(): ObstacleBox[] {
  const { roomHalfX, roomMinZ, roomMaxZ, benches, screen, runwayHalfWidth, runwayStartZ, runwayEndZ, entranceHalf } =
    RUNWAY
  const wallT = 0.35
  const runwayCenterZ = (runwayStartZ + runwayEndZ) / 2
  const runwayHalfLength = (runwayEndZ - runwayStartZ) / 2 + 0.15
  const boxes: ObstacleBox[] = [
    // 奥壁
    boxFromCenter(0, roomMinZ - wallT, roomHalfX + wallT, wallT),
    // 手前壁（入口を広めに空ける）
    boxFromCenter(-(roomHalfX + entranceHalf) / 2, roomMaxZ + wallT, (roomHalfX - entranceHalf) / 2, wallT),
    boxFromCenter((roomHalfX + entranceHalf) / 2, roomMaxZ + wallT, (roomHalfX - entranceHalf) / 2, wallT),
    boxFromCenter(-(roomHalfX + wallT), (roomMinZ + roomMaxZ) / 2, wallT, (roomMaxZ - roomMinZ) / 2 + wallT),
    boxFromCenter(roomHalfX + wallT, (roomMinZ + roomMaxZ) / 2, wallT, (roomMaxZ - roomMinZ) / 2 + wallT),
    // 背面スクリーン台
    boxFromCenter(screen.x, screen.z - 0.2, screen.width / 2 + 0.2, 0.45),
    // ランウェイ本体（プレイヤー侵入禁止）
    boxFromCenter(0, runwayCenterZ, runwayHalfWidth + 0.2, runwayHalfLength),
  ]

  for (const bench of benches) {
    boxes.push(boxFromCenter(bench.x, bench.z, 0.45, 1.25))
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

export function isRunwayPositionWalkable(x: number, z: number, radius = RUNWAY.playerRadius) {
  const { roomHalfX, roomMinZ, roomMaxZ } = RUNWAY
  if (x < -roomHalfX + radius || x > roomHalfX - radius) return false
  if (z < roomMinZ + radius || z > roomMaxZ - radius) return false
  for (const box of OBSTACLES) {
    if (circleHitsBox(x, z, radius, box)) return false
  }
  return true
}

export function resolveRunwayMovement(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  radius = RUNWAY.playerRadius,
) {
  if (isRunwayPositionWalkable(toX, toZ, radius)) {
    return { x: toX, z: toZ }
  }
  if (isRunwayPositionWalkable(toX, fromZ, radius)) {
    return { x: toX, z: fromZ }
  }
  if (isRunwayPositionWalkable(fromX, toZ, radius)) {
    return { x: fromX, z: toZ }
  }
  return { x: fromX, z: fromZ }
}
