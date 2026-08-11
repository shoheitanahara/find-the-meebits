import { MARKET_OBSTACLES, OPEN_SEA_MARKET } from './config'
import { MARKET_PEDESTAL_PLACEMENTS } from './marketLandmarks'

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

/** 左右ゲート / 手前EXIT開口 */
let openWestGate = true
let openEastGate = true
/** MAIN のみ手前壁に出口開口 */
let openEntranceWall = true

function buildSideWallBoxes(
  side: 'west' | 'east',
  open: boolean,
): ObstacleBox[] {
  const { roomHalfX, roomMinZ, roomMaxZ, galleryGate } = OPEN_SEA_MARKET
  const wallT = 0.35
  const inset = WALL_COLLISION_INSET
  const wallX = side === 'west' ? -(roomHalfX - inset + wallT) : roomHalfX - inset + wallT
  const gateMin = galleryGate.z - galleryGate.halfWidth
  const gateMax = galleryGate.z + galleryGate.halfWidth

  if (!open) {
    const roomDepth = roomMaxZ - roomMinZ
    return [boxFromCenter(wallX, (roomMinZ + roomMaxZ) / 2, wallT, roomDepth / 2 + wallT)]
  }

  const boxes: ObstacleBox[] = []
  // 奥側セグメント
  if (gateMin > roomMinZ + 0.2) {
    const segCenter = (roomMinZ + gateMin) / 2
    const segHalf = (gateMin - roomMinZ) / 2
    boxes.push(boxFromCenter(wallX, segCenter, wallT, segHalf))
  }
  // 手前側セグメント
  if (gateMax < roomMaxZ - 0.2) {
    const segCenter = (gateMax + roomMaxZ) / 2
    const segHalf = (roomMaxZ - gateMax) / 2
    boxes.push(boxFromCenter(wallX, segCenter, wallT, segHalf))
  }
  return boxes
}

function buildEntranceWallBoxes(): ObstacleBox[] {
  const { roomHalfX, roomMaxZ, entranceHalf } = OPEN_SEA_MARKET
  const wallT = 0.35
  const inset = WALL_COLLISION_INSET
  const z = roomMaxZ - inset + wallT

  if (!openEntranceWall) {
    return [boxFromCenter(0, z, roomHalfX + wallT, wallT)]
  }

  return [
    boxFromCenter(
      -(roomHalfX + entranceHalf) / 2,
      z,
      (roomHalfX - entranceHalf) / 2,
      wallT,
    ),
    boxFromCenter(
      (roomHalfX + entranceHalf) / 2,
      z,
      (roomHalfX - entranceHalf) / 2,
      wallT,
    ),
  ]
}

function buildObstacles(): ObstacleBox[] {
  const { roomHalfX, roomMinZ, pedestal } = OPEN_SEA_MARKET
  const wallT = 0.35
  const inset = WALL_COLLISION_INSET

  const boxes: ObstacleBox[] = [
    boxFromCenter(0, roomMinZ + inset - wallT, roomHalfX + wallT, wallT),
    ...buildEntranceWallBoxes(),
    ...buildSideWallBoxes('west', openWestGate),
    ...buildSideWallBoxes('east', openEastGate),
  ]

  for (const o of MARKET_OBSTACLES) {
    boxes.push(boxFromCenter(o.x, o.z, o.halfX, o.halfZ))
  }

  const half = pedestal.collisionHalf
  for (const p of MARKET_PEDESTAL_PLACEMENTS) {
    boxes.push(boxFromCenter(p.x, p.z, half, half))
  }

  return boxes
}

let OBSTACLES = buildObstacles()

/** ギャラリー状態に合わせて壁開口の衝突を張り直す */
export function setMarketGalleryGateOpenings(options: {
  west: boolean
  east: boolean
  /** MAIN のとき true。WEST/EAST は手前壁を完全に塞ぐ */
  entrance?: boolean
}) {
  openWestGate = options.west
  openEastGate = options.east
  if (options.entrance !== undefined) {
    openEntranceWall = options.entrance
  }
  OBSTACLES = buildObstacles()
}

function circleHitsBox(x: number, z: number, radius: number, box: ObstacleBox) {
  const nearestX = Math.min(Math.max(x, box.minX), box.maxX)
  const nearestZ = Math.min(Math.max(z, box.minZ), box.maxZ)
  const dx = x - nearestX
  const dz = z - nearestZ
  return dx * dx + dz * dz < radius * radius
}

function isInOpenSideGate(x: number, z: number, radius: number) {
  const { roomHalfX, galleryGate } = OPEN_SEA_MARKET
  if (Math.abs(z - galleryGate.z) > galleryGate.halfWidth + radius) return false
  if (openWestGate && x < -roomHalfX + galleryGate.triggerDepth + radius * 2) return true
  if (openEastGate && x > roomHalfX - galleryGate.triggerDepth - radius * 2) return true
  return false
}

export function isMarketPositionWalkable(
  x: number,
  z: number,
  radius: number = OPEN_SEA_MARKET.playerRadius,
) {
  const { roomHalfX, roomMinZ, roomMaxZ } = OPEN_SEA_MARKET
  const margin = radius + WALL_COLLISION_INSET

  if (z < roomMinZ + margin || z > roomMaxZ - margin) return false

  const inGate = isInOpenSideGate(x, z, radius)
  if (!inGate) {
    if (x < -roomHalfX + margin || x > roomHalfX - margin) return false
  } else {
    // ゲート内は壁面まで踏み込める（入室トリガー用）
    if (x < -roomHalfX - 0.15 || x > roomHalfX + 0.15) return false
  }

  for (const box of OBSTACLES) {
    if (circleHitsBox(x, z, radius, box)) return false
  }
  return true
}

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

/** 歩行NPC用: 前進→軸スライド。成功した位置を返す */
export function resolveMarketWalkerStep(
  fromX: number,
  fromZ: number,
  yaw: number,
  step: number,
  radius: number = 0.36,
): { x: number; z: number; blocked: boolean } {
  const nextX = fromX + Math.sin(yaw) * step
  const nextZ = fromZ + Math.cos(yaw) * step
  if (isMarketWalkerPositionWalkable(nextX, nextZ, radius)) {
    return { x: nextX, z: nextZ, blocked: false }
  }
  if (isMarketWalkerPositionWalkable(nextX, fromZ, radius)) {
    return { x: nextX, z: fromZ, blocked: false }
  }
  if (isMarketWalkerPositionWalkable(fromX, nextZ, radius)) {
    return { x: fromX, z: nextZ, blocked: false }
  }
  return { x: fromX, z: fromZ, blocked: true }
}

/** 前方に開けた yaw を探す（台座まわりの引っかかり回避） */
export function findMarketWalkerClearYaw(
  x: number,
  z: number,
  preferredYaw: number,
  lookAhead: number,
  radius: number = 0.36,
): number | null {
  const deltas = [
    0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05, Math.PI * 0.5, -Math.PI * 0.5, Math.PI * 0.75,
    -Math.PI * 0.75, Math.PI,
  ]
  for (const delta of deltas) {
    const yaw = preferredYaw + delta
    const ax = x + Math.sin(yaw) * lookAhead
    const az = z + Math.cos(yaw) * lookAhead
    const mx = x + Math.sin(yaw) * (lookAhead * 0.4)
    const mz = z + Math.cos(yaw) * (lookAhead * 0.4)
    if (
      isMarketWalkerPositionWalkable(mx, mz, radius) &&
      isMarketWalkerPositionWalkable(ax, az, radius)
    ) {
      return yaw
    }
  }
  return null
}

/** 通路寄りのランダム歩行可能点（スポーン／スタック脱出用） */
export function pickMarketWalkerClearPoint(
  seed: number,
  radius: number = 0.36,
): { x: number; z: number } | null {
  let s = seed >>> 0
  const next = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
  const aisleHalf = 3.2
  for (let i = 0; i < 48; i += 1) {
    // 中央通路を優先、たまにサイド通路
    const useAisle = next() < 0.72
    const x = useAisle
      ? (next() * 2 - 1) * aisleHalf
      : (next() * 2 - 1) * OPEN_SEA_MARKET.walkerSpawnHalfX * 0.85
    const z = (next() * 2 - 1) * OPEN_SEA_MARKET.walkerSpawnHalfZ * 0.9
    if (isMarketWalkerPositionWalkable(x, z, radius)) return { x, z }
  }
  return null
}

export function resolveMarketMovement(fromX: number, fromZ: number, toX: number, toZ: number) {
  const radius = OPEN_SEA_MARKET.playerRadius
  if (isMarketPositionWalkable(toX, toZ, radius)) return { x: toX, z: toZ }
  if (isMarketPositionWalkable(toX, fromZ, radius)) return { x: toX, z: fromZ }
  if (isMarketPositionWalkable(fromX, toZ, radius)) return { x: fromX, z: toZ }
  return { x: fromX, z: fromZ }
}
