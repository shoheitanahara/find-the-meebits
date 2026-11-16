import { JAZZ_BAR, JAZZ_BAR_OCCUPANCY } from './config'
import { isJazzBarPositionWalkable } from './collisions'

/** 丸椅子1脚＝1席 */
export const JAZZ_BAR_TOTAL_SEATS = JAZZ_BAR.stools.length

export const JAZZ_BAR_SEAT_Y = JAZZ_BAR.audienceSeatY

/**
 * 着席位置をスクリーン側（−Z）へずらす。
 * 上下は audienceSeatY。左右にはずらさない。
 */
const SEAT_FORWARD_Z = -0.22

export type JazzBarSeatSlot = {
  index: number
  /** 着席ワールド位置 */
  x: number
  z: number
  /** Sit 判定用の椅子中心 */
  stoolX: number
  stoolZ: number
  /** 着席時の体・顔の向き（スクリーン側） */
  rotationY: number
  /** 立ち上がり用。テーブル外側 */
  approachYaw: number
  stoolIndex: number
}

const SEAT_SLOTS: JazzBarSeatSlot[] = buildJazzBarSeatSlots()

function buildJazzBarSeatSlots(): JazzBarSeatSlot[] {
  return JAZZ_BAR.stools.map((stool, index) => {
    const sitX = stool.x
    const sitZ = stool.z + SEAT_FORWARD_Z
    return {
      index,
      x: sitX,
      z: sitZ,
      stoolX: stool.x,
      stoolZ: stool.z,
      rotationY: Math.atan2(-sitX, JAZZ_BAR.stageFocusZ - sitZ),
      approachYaw: stool.approachYaw,
      stoolIndex: index,
    }
  })
}

export function getJazzBarSeatSlots(): readonly JazzBarSeatSlot[] {
  return SEAT_SLOTS
}

export function getJazzBarSeatSlot(seatIndex: number): JazzBarSeatSlot | null {
  return SEAT_SLOTS[seatIndex] ?? null
}

/** 丸椅子まわりなら Sit が出る距離 */
export const JAZZ_BAR_SIT_INTERACT_RADIUS = 1.7
export const JAZZ_BAR_SEAT_APPROACH_DISTANCE = 0.85

export function getSeatApproachPosition(
  seat: JazzBarSeatSlot,
  distance = JAZZ_BAR_SEAT_APPROACH_DISTANCE,
): { x: number; z: number } {
  const forwardX = Math.sin(seat.approachYaw)
  const forwardZ = Math.cos(seat.approachYaw)
  return {
    x: seat.stoolX + forwardX * distance,
    z: seat.stoolZ + forwardZ * distance,
  }
}

export function findNearestEmptySeat(
  playerX: number,
  playerZ: number,
  emptySeatIndices: readonly number[],
  maxDistance = JAZZ_BAR_SIT_INTERACT_RADIUS,
): number | null {
  const { roomHalfX, roomMinZ, roomMaxZ, playerRadius } = JAZZ_BAR
  if (
    playerX < -roomHalfX + playerRadius ||
    playerX > roomHalfX - playerRadius ||
    playerZ < roomMinZ + playerRadius ||
    playerZ > roomMaxZ - playerRadius
  ) {
    return null
  }

  let bestIndex: number | null = null
  let bestDistSq = maxDistance * maxDistance

  for (const seatIndex of emptySeatIndices) {
    const seat = getJazzBarSeatSlot(seatIndex)
    if (!seat) continue

    // 椅子中心からの距離（着席オフセットは見ない）
    const dx = playerX - seat.stoolX
    const dz = playerZ - seat.stoolZ
    const distSq = dx * dx + dz * dz
    if (distSq <= bestDistSq) {
      bestDistSq = distSq
      bestIndex = seatIndex
    }
  }

  return bestIndex
}

export function getJazzBarStandUpPosition(
  seatIndex: number,
): { x: number; z: number; rotationY: number } | null {
  const seat = getJazzBarSeatSlot(seatIndex)
  if (!seat) return null

  const forwardX = Math.sin(seat.approachYaw)
  const forwardZ = Math.cos(seat.approachYaw)
  const standOffset = JAZZ_BAR_SEAT_APPROACH_DISTANCE + 0.12

  return {
    x: seat.stoolX + forwardX * standOffset,
    z: seat.stoolZ + forwardZ * standOffset,
    rotationY: seat.rotationY,
  }
}

export function resolveJazzBarStandUpPosition(
  seatIndex: number,
): { x: number; z: number; rotationY: number } | null {
  const base = getJazzBarStandUpPosition(seatIndex)
  if (!base) return null
  const seat = getJazzBarSeatSlot(seatIndex)
  if (!seat) return base

  const forwardX = Math.sin(seat.approachYaw)
  const forwardZ = Math.cos(seat.approachYaw)
  const candidates = [base]
  for (const extra of [0.28, 0.55, 0.85, 1.15]) {
    candidates.push({
      x: base.x + forwardX * extra,
      z: base.z + forwardZ * extra,
      rotationY: base.rotationY,
    })
  }
  for (const alongZ of [0.4, 0.75, 1.05]) {
    candidates.push({
      x: base.x,
      z: base.z + alongZ,
      rotationY: base.rotationY,
    })
    candidates.push({
      x: base.x,
      z: base.z - alongZ,
      rotationY: base.rotationY,
    })
  }

  for (const candidate of candidates) {
    if (isJazzBarPositionWalkable(candidate.x, candidate.z)) return candidate
  }
  return base
}

/**
 * 日替わり空席。左・中央・右のテーブル列に空席と客を偏らせない。
 */
export function pickDailyEmptySeatIndices(rng: () => number): number[] {
  const stoolsPerTable = 4
  const tableCount = JAZZ_BAR.tables.length
  const seatsPerColumn = (tableCount / 3) * stoolsPerTable
  const targetEmpty = Math.round(JAZZ_BAR_TOTAL_SEATS * (1 - JAZZ_BAR_OCCUPANCY))
  const jitter = Math.floor(rng() * 3) - 1
  const emptyCount = Math.max(3, Math.min(JAZZ_BAR_TOTAL_SEATS - 3, targetEmpty + jitter))

  // 列ごと（0=左, 1=中央, 2=右）にほぼ均等に空席を割り当てる
  const basePerCol = Math.floor(emptyCount / 3)
  const remainder = emptyCount - basePerCol * 3
  const emptyPerCol = [basePerCol, basePerCol, basePerCol]
  for (let i = 0; i < remainder; i += 1) {
    emptyPerCol[Math.floor(rng() * 3)] += 1
  }

  const picked: number[] = []
  for (let col = 0; col < 3; col += 1) {
    const start = col * seatsPerColumn
    const indices = Array.from({ length: seatsPerColumn }, (_, i) => start + i)
    for (let i = indices.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1))
      const tmp = indices[i]
      indices[i] = indices[j]
      indices[j] = tmp
    }
    const take = Math.min(emptyPerCol[col], seatsPerColumn - 1)
    picked.push(...indices.slice(0, take))
  }

  return picked.sort((a, b) => a - b)
}

export function getOccupiedSeatIndices(emptySeatIndices: readonly number[]): number[] {
  const empty = new Set(emptySeatIndices)
  const occupied: number[] = []
  for (let i = 0; i < JAZZ_BAR_TOTAL_SEATS; i += 1) {
    if (!empty.has(i)) occupied.push(i)
  }
  return occupied
}
