import { MathUtils } from 'three'
import { FEATURED_BOARD_POSITION, FOUNTAIN_CENTER_Z } from './dailyFeatured'
import { getAttractionsForZone } from './topConfig'
import {
  DEFAULT_PARK_ZONE,
  getParkZone,
  type ParkZoneId,
} from './parkZones'
import {
  buildBridgeRailingBoxes,
  buildPerimeterObstacleBoxes,
  buildPerimeterSpec,
  buildSealedGateObstacleBoxes,
} from './parkPerimeterSpec'

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

const FOUNTAIN_CENTER = { x: 0, z: FOUNTAIN_CENTER_Z }
const FOUNTAIN_RADIUS = 2.05

const BENCH_LOCAL_HALF_X = 1.18
const BENCH_LOCAL_HALF_Z = 0.42
const INFO_BOARD_HALF_X = 1.55
const INFO_BOARD_HALF_Z = 0.55
const FEATURED_BOARD_HALF_X = 1.75
const FEATURED_BOARD_HALF_Z = 0.5
const LAMP_RADIUS = 0.38
const PLANTER_RADIUS = 1.15
/** 木の幹・根元（株シリンダー半径 ≈0.82） */
const TREE_RADIUS = 0.9
const GATE_PILLAR_HALF = 0.35
/** 斜めゲートの岩塔は円で近似（回転に強い） */
const GATE_ROCK_RADIUS = 1.35
const GATE_ROCK_OUTER_RADIUS = 0.75
/** Coming Soon 建設中棟の半サイズ（見た目 footprint に合わせる） */
const COMING_SOON_HALF_X = 3.35
const COMING_SOON_HALF_Z = 3.1

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

function buildAttractionObstacles(zoneId: ParkZoneId): ObstacleBox[] {
  const boxes: ObstacleBox[] = []

  for (const attraction of getAttractionsForZone(zoneId)) {
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

function buildBenchObstacles(zoneId: ParkZoneId): ObstacleBox[] {
  return getParkZone(zoneId).benches.map(([x, z, rotationY]) => {
    const rotated = Math.abs(Math.cos(rotationY)) < 0.1
    const halfX = rotated ? BENCH_LOCAL_HALF_Z : BENCH_LOCAL_HALF_X
    const halfZ = rotated ? BENCH_LOCAL_HALF_X : BENCH_LOCAL_HALF_Z
    return boxFromCenter(x, z, halfX, halfZ)
  })
}

function gateLocalToWorld(
  gate: { x: number; z: number; yaw?: number },
  localX: number,
  localZ: number,
) {
  const yaw = gate.yaw ?? 0
  const cos = Math.cos(yaw)
  const sin = Math.sin(yaw)
  return {
    x: gate.x + localX * cos - localZ * sin,
    z: gate.z + localX * sin + localZ * cos,
  }
}

/** 真向きゲートの門柱（AABB） */
function buildGatePillarObstacles(zoneId: ParkZoneId): ObstacleBox[] {
  const boxes: ObstacleBox[] = []
  for (const gate of getParkZone(zoneId).gates) {
    // 斜め山門は円で扱う
    if (gate.theme === 'mountain' && (gate.yaw ?? 0) !== 0) continue

    const pillarZ = gate.halfWidth * 0.95
    if (gate.theme === 'mountain') {
      const a = gateLocalToWorld(gate, 0.15, -pillarZ)
      const b = gateLocalToWorld(gate, 0.15, pillarZ)
      boxes.push(
        boxFromCenter(a.x, a.z, 1.35, 1.45),
        boxFromCenter(b.x, b.z, 1.35, 1.45),
      )
    } else {
      const a = gateLocalToWorld(gate, 0, -pillarZ)
      const b = gateLocalToWorld(gate, 0, pillarZ)
      boxes.push(
        boxFromCenter(a.x, a.z, GATE_PILLAR_HALF, GATE_PILLAR_HALF),
        boxFromCenter(b.x, b.z, GATE_PILLAR_HALF, GATE_PILLAR_HALF),
      )
    }
  }
  return boxes
}

/** 斜め山門の岩塔（円。向きに依存しない） */
function buildGateRockCircles(zoneId: ParkZoneId): ObstacleCircle[] {
  const circles: ObstacleCircle[] = []
  for (const gate of getParkZone(zoneId).gates) {
    if (gate.theme !== 'mountain' || (gate.yaw ?? 0) === 0) continue

    const pillarZ = gate.halfWidth * 0.95
    for (const side of [-1, 1] as const) {
      const core = gateLocalToWorld(gate, 0.2, side * pillarZ)
      circles.push({ x: core.x, z: core.z, radius: GATE_ROCK_RADIUS })
      const outer = gateLocalToWorld(gate, 0.35, side * (pillarZ + 1.15))
      circles.push({ x: outer.x, z: outer.z, radius: GATE_ROCK_OUTER_RADIUS })
    }
  }
  return circles
}

function buildComingSoonObstacles(zoneId: ParkZoneId): ObstacleBox[] {
  return (getParkZone(zoneId).comingSoonSlots ?? []).map((slot) =>
    boxFromCenter(slot.x, slot.z, COMING_SOON_HALF_X, COMING_SOON_HALF_Z),
  )
}

function buildFeaturedBoardObstacle(zoneId: ParkZoneId): ObstacleBox[] {
  if (!getParkZone(zoneId).hasFeaturedBoard) return []
  return [
    boxFromCenter(
      FEATURED_BOARD_POSITION[0],
      FEATURED_BOARD_POSITION[2],
      FEATURED_BOARD_HALF_X,
      FEATURED_BOARD_HALF_Z,
    ),
  ]
}

/** ゲート開口の半幅（柵の切れ目）。斜め時は投影幅を使う */
function gateOpeningHalf(gate: { halfWidth: number; alcoveDepth: number; yaw?: number }) {
  const yaw = gate.yaw ?? 0
  const projected =
    gate.halfWidth * Math.abs(Math.cos(yaw)) + gate.alcoveDepth * Math.abs(Math.sin(yaw))
  return projected + 1.1
}

function buildRailingObstacles(zoneId: ParkZoneId): ObstacleBox[] {
  const zone = getParkZone(zoneId)
  if (zone.perimeter) return []

  const { railingX, railingHalfThickness, railingZ, railingHalfLength } = zone.layout
  const boxes: ObstacleBox[] = []

  for (const side of [-1, 1] as const) {
    const x = side * railingX
    const gate = zone.gates.find((g) => Math.sign(g.x) === side)
    if (!gate) {
      boxes.push(boxFromCenter(x, railingZ, railingHalfThickness, railingHalfLength))
      continue
    }

    const openHalf = gateOpeningHalf(gate)
    const openMin = gate.z - openHalf
    const openMax = gate.z + openHalf
    const railMin = railingZ - railingHalfLength
    const railMax = railingZ + railingHalfLength

    if (openMin > railMin + 0.3) {
      const mid = (railMin + openMin) * 0.5
      const half = (openMin - railMin) * 0.5
      boxes.push(boxFromCenter(x, mid, railingHalfThickness, half))
    }
    if (openMax < railMax - 0.3) {
      const mid = (openMax + railMax) * 0.5
      const half = (railMax - openMax) * 0.5
      boxes.push(boxFromCenter(x, mid, railingHalfThickness, half))
    }
  }

  return boxes
}

function buildPerimeterObstacles(zoneId: ParkZoneId): ObstacleBox[] {
  const zone = getParkZone(zoneId)
  if (!zone.perimeter) return []
  const spec = buildPerimeterSpec(zone.layout, zone.perimeter, zone.gates)
  return [
    ...buildPerimeterObstacleBoxes(spec),
    ...buildBridgeRailingBoxes(spec),
    ...buildSealedGateObstacleBoxes(spec),
  ].map((box) => boxFromCenter(box.x, box.z, box.halfX, box.halfZ))
}

function buildCircleObstacles(zoneId: ParkZoneId): ObstacleCircle[] {
  const zone = getParkZone(zoneId)
  const circles: ObstacleCircle[] = []

  if (zone.hasFountain) {
    circles.push({ x: FOUNTAIN_CENTER.x, z: FOUNTAIN_CENTER.z, radius: FOUNTAIN_RADIUS })
  }
  for (const [x, z] of zone.lamps) {
    circles.push({ x, z, radius: LAMP_RADIUS })
  }
  for (const [x, z] of zone.planters) {
    circles.push({ x, z, radius: PLANTER_RADIUS })
  }
  for (const [x, z] of zone.trees) {
    circles.push({ x, z, radius: TREE_RADIUS })
  }
  circles.push(...buildGateRockCircles(zoneId))

  return circles
}

let activeObstacleZone: ParkZoneId = DEFAULT_PARK_ZONE
let PARK_BOX_OBSTACLES: ObstacleBox[] = []
let PARK_CIRCLE_OBSTACLES: ObstacleCircle[] = []

function rebuildObstacles(zoneId: ParkZoneId) {
  activeObstacleZone = zoneId
  PARK_BOX_OBSTACLES = [
    ...buildAttractionObstacles(zoneId),
    ...buildBenchObstacles(zoneId),
    ...buildFeaturedBoardObstacle(zoneId),
    ...buildRailingObstacles(zoneId),
    ...buildPerimeterObstacles(zoneId),
    ...buildGatePillarObstacles(zoneId),
    ...buildComingSoonObstacles(zoneId),
  ]
  PARK_CIRCLE_OBSTACLES = buildCircleObstacles(zoneId)
}

rebuildObstacles(DEFAULT_PARK_ZONE)

/** ゾーン切替時に衝突セットを差し替える。 */
export function setParkCollisionZone(zoneId: ParkZoneId) {
  if (zoneId === activeObstacleZone) return
  rebuildObstacles(zoneId)
}

/** UI 用: 現在ゾーンのベンチ配置 */
export function getZoneBenchPlacements(zoneId: ParkZoneId) {
  return getParkZone(zoneId).benches
}

export function getZoneLampPositions(zoneId: ParkZoneId) {
  return getParkZone(zoneId).lamps
}

export function getZonePlanterPositions(zoneId: ParkZoneId) {
  return getParkZone(zoneId).planters
}

/** @deprecated 互換。Plaza の静的配置が必要な場合のみ。 */
export const BENCH_PLACEMENTS = getParkZone('plaza').benches
export const LAMP_POSITIONS = getParkZone('plaza').lamps
export const PLANTER_POSITIONS = getParkZone('plaza').planters

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

export function collidesWithParkObstacles(x: number, z: number, radius: number) {
  for (const box of PARK_BOX_OBSTACLES) {
    if (collidesWithBox(x, z, radius, box)) return true
  }
  for (const circle of PARK_CIRCLE_OBSTACLES) {
    if (collidesWithCircle(x, z, radius, circle)) return true
  }
  return false
}

function pushOutOfBox(x: number, z: number, radius: number, box: ObstacleBox) {
  if (!collidesWithBox(x, z, radius, box)) return { x, z }

  const closestX = MathUtils.clamp(x, box.minX, box.maxX)
  const closestZ = MathUtils.clamp(z, box.minZ, box.maxZ)
  let dx = x - closestX
  let dz = z - closestZ

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

  if (!collidesWithParkObstacles(nextX, currentZ, radius)) {
    return { x: nextX, z: currentZ }
  }
  if (!collidesWithParkObstacles(currentX, nextZ, radius)) {
    return { x: currentX, z: nextZ }
  }

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

export function isParkPositionWalkable(x: number, z: number, radius = NPC_COLLISION_RADIUS) {
  return !collidesWithParkObstacles(x, z, radius)
}
