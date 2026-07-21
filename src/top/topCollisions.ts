import { MathUtils } from 'three'
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

/** ベンチ配置（見た目と共有）。rotationY は足元の向き。 */
export const BENCH_PLACEMENTS = [
  [-16.8, 8, Math.PI / 2],
  [16.8, 8, -Math.PI / 2],
  [-16.8, -1.5, Math.PI / 2],
  [16.8, -1.5, -Math.PI / 2],
] as const

/** 街灯の足元座標（見た目と共有）。 */
export const LAMP_POSITIONS: Array<[number, number]> = [
  [-8.5, 10],
  [8.5, 10],
  [-8.5, 5],
  [8.5, 5],
  [-8.5, 0],
  [8.5, 0],
  [-17.5, 10],
  [17.5, 10],
  [-18, 0],
  [18, 0],
]

/** 花壇プランターの足元座標（見た目と共有）。 */
export const PLANTER_POSITIONS: Array<[number, number]> = [
  [-17, 12],
  [17, 12],
  [-17, 3.2],
  [17, 3.2],
]

const FOUNTAIN_CENTER = { x: 0, z: 3.4 }
const FOUNTAIN_RADIUS = 2.05

/** 建物本体（box 7×5）と入口ドア幅。入口は通り抜け可能にして自動遷移を残す。 */
const BUILDING_HALF_WIDTH = 3.5
const BUILDING_HALF_DEPTH = 2.5
const DOOR_HALF_WIDTH = 1.2
/** 正面から奥へ開けるアルコーブ深さ（建物内部に少し入れる）。 */
const DOOR_ALCOVE_DEPTH = 2.05

/** ベンチのローカル半サイズ（座席 2.25 × 0.65）。 */
const BENCH_LOCAL_HALF_X = 1.18
const BENCH_LOCAL_HALF_Z = 0.42

/** 看板の半サイズ。 */
const INFO_BOARD_HALF_X = 1.55
const INFO_BOARD_HALF_Z = 0.55

const LAMP_RADIUS = 0.38
const PLANTER_RADIUS = 0.85

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
 * 左右の翼 + 背面ブロックでドア中央を空け、入口トリガーまで歩けるようにする。
 */
function buildAttractionObstacles(): ObstacleBox[] {
  const boxes: ObstacleBox[] = []

  for (const attraction of TOP_ATTRACTIONS) {
    const { x: ax, z: az } = attraction
    const wingWidth = BUILDING_HALF_WIDTH - DOOR_HALF_WIDTH
    const wingCenterOffset = DOOR_HALF_WIDTH + wingWidth / 2

    // 左右の翼（建物全奥行き）
    boxes.push(
      boxFromCenter(ax - wingCenterOffset, az, wingWidth / 2, BUILDING_HALF_DEPTH),
      boxFromCenter(ax + wingCenterOffset, az, wingWidth / 2, BUILDING_HALF_DEPTH),
    )

    // 背面ブロック（正面アルコーブを残す）
    const backHalfDepth = (BUILDING_HALF_DEPTH * 2 - DOOR_ALCOVE_DEPTH) / 2
    const backCenterZ = az - BUILDING_HALF_DEPTH + backHalfDepth
    boxes.push(boxFromCenter(ax, backCenterZ, BUILDING_HALF_WIDTH, backHalfDepth))

    // 入口脇の説明看板
    const infoBoardX = ax + (ax > 0 ? -4.2 : 4.2)
    const infoBoardZ = az + 3.25
    boxes.push(boxFromCenter(infoBoardX, infoBoardZ, INFO_BOARD_HALF_X, INFO_BOARD_HALF_Z))
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

const PARK_BOX_OBSTACLES = [...buildAttractionObstacles(), ...buildBenchObstacles()]
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
