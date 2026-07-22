import { MathUtils } from 'three'
import { FEATURED_BOARD_POSITION } from './dailyFeatured'
import { PARK_HUB } from './parkLayout'
import { TOP_ATTRACTIONS } from './topConfig'

/** プレイヤーの水平当たり半径。 */
export const PLAYER_COLLISION_RADIUS = 0.42

/** NPC 用は少し小さめにして通りやすくする。 */
export const NPC_COLLISION_RADIUS = 0.36

type ObstacleBox = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

type ObstacleCircle = {
  x: number
  z: number
  radius: number
}

/**
 * ベンチ配置（見た目と共有）。
 * 外側レーン寄りに置き、アトラクション建物・入口の動線は空ける。
 */
export const BENCH_PLACEMENTS = [
  [-28, 12, Math.PI / 2],
  [28, 12, -Math.PI / 2],
  [-28, 3, Math.PI / 2],
  [28, 4, -Math.PI / 2],
  [-28, -5, Math.PI / 2],
  [22, 8, -Math.PI / 2],
  [-32, -11, Math.PI / 2],
  [10, 13.5, 0],
] as const

/**
 * 街灯の足元座標（見た目と共有）。
 * 中央並木レーン + 中間レーン。入口正面には置かない。
 */
export const LAMP_POSITIONS: Array<[number, number]> = [
  // 中央通り沿い
  [-10, 12],
  [10, 12],
  [-10, 5],
  [10, 5],
  [-10, -1],
  [10, -1],
  [-10, -8],
  [10, -8],
  // 中間レーン（建物と柵のあいだ）
  [-22, 10],
  [20, 11],
  [-22, 2],
  [22, 2],
  [-22, -7],
  // 外周寄り（入口 X を避ける）
  [-34, 8],
  [34, 12],
  [-34, -1],
  [34, 4],
]

/**
 * ベンチ横オブジェ（夏はパラソル）。
 * 天蓋半径 ≈1.3 を見越し、建物 AABB から十分離す。
 */
export const PLANTER_POSITIONS: Array<[number, number]> = [
  [-28, 14.5],
  [28, 14.5],
  [-28, 1],
  [28, 2],
  [-28, -8],
  [24, 10],
]

const FOUNTAIN_CENTER = { x: 0, z: 3.4 }
const FOUNTAIN_RADIUS = 2.05

/** ベンチのローカル半サイズ（座席 2.25 × 0.65）。 */
const BENCH_LOCAL_HALF_X = 1.18
const BENCH_LOCAL_HALF_Z = 0.42

/** 看板の半サイズ。 */
const INFO_BOARD_HALF_X = 1.55
const INFO_BOARD_HALF_Z = 0.55

/** 主役説明看板の半サイズ（コンパクト2列表示）。 */
const FEATURED_BOARD_HALF_X = 1.75
const FEATURED_BOARD_HALF_Z = 0.5

const LAMP_RADIUS = 0.38
/** パラソル天蓋ぶんも少し広めに取る */
const PLANTER_RADIUS = 1.15

function boxFromCenter(
  centerX: number,
  centerZ: number,
  halfX: number,
  halfZ: number,
): ObstacleBox {
  return {
    minX: centerX - halfX,
    maxX: centerX + halfX,
    minZ: centerZ - halfZ,
    maxZ: centerZ + halfZ,
  }
}

/**
 * アトラクション建物の当たり。
 * 各棟の footprint に合わせ、左右の翼 + 背面でドア中央を空けて入口まで歩けるようにする。
 */
function buildAttractionObstacles(): ObstacleBox[] {
  const boxes: ObstacleBox[] = []

  for (const attraction of TOP_ATTRACTIONS) {
    const { x: ax, z: az, footprint, infoBoardLocal } = attraction
    const { halfWidth, halfDepth, doorHalfWidth, alcoveDepth, extraBoxes } = footprint
    const wingWidth = halfWidth - doorHalfWidth
    const wingCenterOffset = doorHalfWidth + wingWidth / 2

    boxes.push(
      boxFromCenter(ax - wingCenterOffset, az, wingWidth / 2, halfDepth),
      boxFromCenter(ax + wingCenterOffset, az, wingWidth / 2, halfDepth),
    )

    const backHalfDepth = (halfDepth * 2 - alcoveDepth) / 2
    const backCenterZ = az - halfDepth + backHalfDepth
    boxes.push(boxFromCenter(ax, backCenterZ, halfWidth, backHalfDepth))

    for (const extra of extraBoxes ?? []) {
      boxes.push(boxFromCenter(ax + extra.x, az + extra.z, extra.halfX, extra.halfZ))
    }

    boxes.push(
      boxFromCenter(ax + infoBoardLocal[0], az + infoBoardLocal[1], INFO_BOARD_HALF_X, INFO_BOARD_HALF_Z),
    )
  }

  return boxes
}

function buildBenchObstacles(): ObstacleBox[] {
  return BENCH_PLACEMENTS.map(([x, z, rotationY]) => {
    // ±90° 回転時はローカル X/Z を入れ替える。
    const rotated = Math.abs(Math.cos(rotationY)) < 0.1
    const halfX = rotated ? BENCH_LOCAL_HALF_Z : BENCH_LOCAL_HALF_X
    const halfZ = rotated ? BENCH_LOCAL_HALF_X : BENCH_LOCAL_HALF_Z
    return boxFromCenter(x, z, halfX, halfZ)
  })
}

function buildFeaturedBoardObstacle(): ObstacleBox {
  return boxFromCenter(
    FEATURED_BOARD_POSITION[0],
    FEATURED_BOARD_POSITION[2],
    FEATURED_BOARD_HALF_X,
    FEATURED_BOARD_HALF_Z,
  )
}

/** 左右の柵。見た目の railingX と一致させる。 */
function buildRailingObstacles(): ObstacleBox[] {
  const { railingX, railingHalfThickness, railingZ, railingHalfLength } = PARK_HUB
  return [
    boxFromCenter(-railingX, railingZ, railingHalfThickness, railingHalfLength),
    boxFromCenter(railingX, railingZ, railingHalfThickness, railingHalfLength),
  ]
}

function buildCircleObstacles(): ObstacleCircle[] {
  const circles: ObstacleCircle[] = [
    { x: FOUNTAIN_CENTER.x, z: FOUNTAIN_CENTER.z, radius: FOUNTAIN_RADIUS },
  ]

  for (const [x, z] of LAMP_POSITIONS) {
    circles.push({ x, z, radius: LAMP_RADIUS })
  }
  for (const [x, z] of PLANTER_POSITIONS) {
    circles.push({ x, z, radius: PLANTER_RADIUS })
  }

  return circles
}

const PARK_BOX_OBSTACLES = [
  ...buildAttractionObstacles(),
  ...buildBenchObstacles(),
  buildFeaturedBoardObstacle(),
  ...buildRailingObstacles(),
]
const PARK_CIRCLE_OBSTACLES = buildCircleObstacles()

function collidesWithBox(x: number, z: number, radius: number, box: ObstacleBox) {
  const closestX = MathUtils.clamp(x, box.minX, box.maxX)
  const closestZ = MathUtils.clamp(z, box.minZ, box.maxZ)
  const dx = x - closestX
  const dz = z - closestZ
  return dx * dx + dz * dz < radius * radius
}

function collidesWithCircle(x: number, z: number, radius: number, circle: ObstacleCircle) {
  const dx = x - circle.x
  const dz = z - circle.z
  const minDistance = radius + circle.radius
  return dx * dx + dz * dz < minDistance * minDistance
}

/** 指定位置がパーク内オブジェクトと重なるか。 */
export function collidesWithParkObstacles(x: number, z: number, radius: number) {
  for (const box of PARK_BOX_OBSTACLES) {
    if (collidesWithBox(x, z, radius, box)) return true
  }
  for (const circle of PARK_CIRCLE_OBSTACLES) {
    if (collidesWithCircle(x, z, radius, circle)) return true
  }
  return false
}

/**
 * AABB から円を押し出す。貫通が浅い軸方向へ戻す。
 * 複数障害が重なる場合は呼び出し側で繰り返し解決する。
 */
function pushOutOfBox(x: number, z: number, radius: number, box: ObstacleBox) {
  if (!collidesWithBox(x, z, radius, box)) return { x, z }

  const closestX = MathUtils.clamp(x, box.minX, box.maxX)
  const closestZ = MathUtils.clamp(z, box.minZ, box.maxZ)
  let dx = x - closestX
  let dz = z - closestZ

  // 中心が箱の内側にいる場合は、最も近い面へ押し出す。
  if (Math.abs(dx) < 1e-6 && Math.abs(dz) < 1e-6) {
    const toMinX = x - box.minX
    const toMaxX = box.maxX - x
    const toMinZ = z - box.minZ
    const toMaxZ = box.maxZ - z
    const minPen = Math.min(toMinX, toMaxX, toMinZ, toMaxZ)
    if (minPen === toMinX) return { x: box.minX - radius, z }
    if (minPen === toMaxX) return { x: box.maxX + radius, z }
    if (minPen === toMinZ) return { x, z: box.minZ - radius }
    return { x, z: box.maxZ + radius }
  }

  const distance = Math.hypot(dx, dz)
  const scale = radius / Math.max(distance, 1e-6)
  return {
    x: closestX + dx * scale,
    z: closestZ + dz * scale,
  }
}

function pushOutOfCircle(x: number, z: number, radius: number, circle: ObstacleCircle) {
  const dx = x - circle.x
  const dz = z - circle.z
  const minDistance = radius + circle.radius
  const distance = Math.hypot(dx, dz)

  if (distance >= minDistance) return { x, z }

  if (distance < 1e-6) {
    return { x: circle.x + minDistance, z: circle.z }
  }

  const scale = minDistance / distance
  return {
    x: circle.x + dx * scale,
    z: circle.z + dz * scale,
  }
}

/**
 * 移動先をパーク障害物から解決する。
 * スライド（軸分離）→ 押し出しの順で、壁沿いに歩けるようにする。
 */
export function resolveParkMovement(
  currentX: number,
  currentZ: number,
  nextX: number,
  nextZ: number,
  radius: number,
): { x: number; z: number } {
  if (!collidesWithParkObstacles(nextX, nextZ, radius)) {
    return { x: nextX, z: nextZ }
  }

  // X だけ進む / Z だけ進む（壁沿いスライド）
  if (!collidesWithParkObstacles(nextX, currentZ, radius)) {
    return { x: nextX, z: currentZ }
  }
  if (!collidesWithParkObstacles(currentX, nextZ, radius)) {
    return { x: currentX, z: nextZ }
  }

  // 両方だめなら押し出しでめり込みを解消
  let x = nextX
  let z = nextZ
  for (let pass = 0; pass < 3; pass += 1) {
    for (const box of PARK_BOX_OBSTACLES) {
      const resolved = pushOutOfBox(x, z, radius, box)
      x = resolved.x
      z = resolved.z
    }
    for (const circle of PARK_CIRCLE_OBSTACLES) {
      const resolved = pushOutOfCircle(x, z, radius, circle)
      x = resolved.x
      z = resolved.z
    }
  }

  if (!collidesWithParkObstacles(x, z, radius)) {
    return { x, z }
  }

  return { x: currentX, z: currentZ }
}

/** NPC の歩行可能判定。障害物との重なりを拒否する。 */
export function isParkPositionWalkable(x: number, z: number, radius = NPC_COLLISION_RADIUS) {
  return !collidesWithParkObstacles(x, z, radius)
}
