import { RUNWAY } from './config'

type ObstacleBox = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

type BenchDef = (typeof RUNWAY.benches)[number]

function boxFromCenter(x: number, z: number, halfX: number, halfZ: number): ObstacleBox {
  return {
    minX: x - halfX,
    maxX: x + halfX,
    minZ: z - halfZ,
    maxZ: z + halfZ,
  }
}

function hasBenchNeighbor(bench: BenchDef, deltaZ: number): boolean {
  return RUNWAY.benches.some(
    (other) => other.x === bench.x && Math.abs(other.z - bench.z - deltaZ) < 0.01,
  )
}

/** 壁側列（|x|=7.8）かランウェイ側列（|x|=5.6）か */
function isWallColumnBench(bench: BenchDef): boolean {
  return Math.abs(bench.x) > 6.5
}

/** ベンチの当たり判定。座席側は mesh 幅、列間通路側は短く、前後の隣ベンチ間も詰める */
function buildRotatedBenchObstacle(bench: BenchDef): ObstacleBox {
  const {
    halfLengthOuter,
    halfLengthGap,
    halfDepthSeat,
    halfDepthAisle,
    backShift,
    rowSpacing,
  } = RUNWAY.benchCollision

  const isLeftBench = bench.rotationY > 0
  let halfLengthMinusX: number = halfLengthOuter
  let halfLengthPlusX: number = halfLengthOuter

  // local X 長辺が world Z 方向。回転に応じて「手前/奥の隣ベンチ」側だけ gap 幅に縮める
  if (isLeftBench) {
    if (hasBenchNeighbor(bench, rowSpacing)) halfLengthMinusX = halfLengthGap
    if (hasBenchNeighbor(bench, -rowSpacing)) halfLengthPlusX = halfLengthGap
  } else {
    if (hasBenchNeighbor(bench, rowSpacing)) halfLengthPlusX = halfLengthGap
    if (hasBenchNeighbor(bench, -rowSpacing)) halfLengthMinusX = halfLengthGap
  }

  const isWallColumn = isWallColumnBench(bench)
  const halfDepthPlusZ = isWallColumn ? halfDepthAisle : halfDepthSeat
  const halfDepthMinusZ = isWallColumn ? halfDepthSeat : halfDepthAisle

  const sin = Math.sin(bench.rotationY)
  const cos = Math.cos(bench.rotationY)
  const centerX = bench.x - sin * backShift
  const centerZ = bench.z - cos * backShift

  const cornerOffsets: Array<[number, number]> = [
    [-halfLengthMinusX, -halfDepthMinusZ],
    [-halfLengthMinusX, halfDepthPlusZ],
    [halfLengthPlusX, halfDepthPlusZ],
    [halfLengthPlusX, -halfDepthMinusZ],
  ]

  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity

  for (const [localX, localZ] of cornerOffsets) {
    const worldX = centerX + localX * cos + localZ * sin
    const worldZ = centerZ - localX * sin + localZ * cos
    minX = Math.min(minX, worldX)
    maxX = Math.max(maxX, worldX)
    minZ = Math.min(minZ, worldZ)
    maxZ = Math.max(maxZ, worldZ)
  }

  return { minX, maxX, minZ, maxZ }
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
    boxes.push(buildRotatedBenchObstacle(bench))
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
