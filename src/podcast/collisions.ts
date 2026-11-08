import { PODCAST } from './config'

type ObstacleBox = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

type BenchDef = (typeof PODCAST.benches)[number]

function boxFromCenter(x: number, z: number, halfX: number, halfZ: number): ObstacleBox {
  return {
    minX: x - halfX,
    maxX: x + halfX,
    minZ: z - halfZ,
    maxZ: z + halfZ,
  }
}

/** 正面向きベンチ（rotationY ≈ π）の AABB */
function buildBenchObstacle(bench: BenchDef): ObstacleBox {
  const { halfLength, halfDepthSeat, halfDepthAisle, backShift } = PODCAST.benchCollision
  // 背もたれ側 = +Z（入口）、座席側 = −Z（スクリーン）
  const centerZ = bench.z + backShift
  return boxFromCenter(bench.x, centerZ, halfLength, (halfDepthSeat + halfDepthAisle) / 2 + 0.08)
}

function buildObstacles(): ObstacleBox[] {
  const { roomHalfX, roomMinZ, roomMaxZ, benches, screen, entranceHalf } = PODCAST
  const wallT = 0.35
  const boxes: ObstacleBox[] = [
    boxFromCenter(0, roomMinZ - wallT, roomHalfX + wallT, wallT),
    boxFromCenter(-(roomHalfX + entranceHalf) / 2, roomMaxZ + wallT, (roomHalfX - entranceHalf) / 2, wallT),
    boxFromCenter((roomHalfX + entranceHalf) / 2, roomMaxZ + wallT, (roomHalfX - entranceHalf) / 2, wallT),
    boxFromCenter(-(roomHalfX + wallT), (roomMinZ + roomMaxZ) / 2, wallT, (roomMaxZ - roomMinZ) / 2 + wallT),
    boxFromCenter(roomHalfX + wallT, (roomMinZ + roomMaxZ) / 2, wallT, (roomMaxZ - roomMinZ) / 2 + wallT),
    boxFromCenter(screen.x, screen.z - 0.25, screen.width / 2 + 0.25, 0.5),
  ]

  for (const bench of benches) {
    boxes.push(buildBenchObstacle(bench))
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

export function isPodcastPositionWalkable(x: number, z: number, radius = PODCAST.playerRadius) {
  const { roomHalfX, roomMinZ, roomMaxZ } = PODCAST
  if (x < -roomHalfX + radius || x > roomHalfX - radius) return false
  if (z < roomMinZ + radius || z > roomMaxZ - radius) return false
  for (const box of OBSTACLES) {
    if (circleHitsBox(x, z, radius, box)) return false
  }
  return true
}

export function resolvePodcastMovement(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  radius = PODCAST.playerRadius,
) {
  if (isPodcastPositionWalkable(toX, toZ, radius)) return { x: toX, z: toZ }
  if (isPodcastPositionWalkable(toX, fromZ, radius)) return { x: toX, z: fromZ }
  if (isPodcastPositionWalkable(fromX, toZ, radius)) return { x: fromX, z: toZ }
  return { x: fromX, z: fromZ }
}
