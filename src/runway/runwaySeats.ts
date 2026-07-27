import { RUNWAY } from './config'
import { isRunwayPositionWalkable } from './collisions'

/** ベンチ1脚あたり2席 × 16脚 */
export const RUNWAY_TOTAL_SEATS = RUNWAY.benches.length * 2

/** ベンチローカル: 座面中心 (0,0,0)、背もたれは -Z */
const SEAT_ALONG = [-0.55, 0.55] as const
/** 背もたれ前面 ≈ -0.22 付近まで寄せる */
export const RUNWAY_SEAT_DEPTH = 0.3
/** VRM 原点は足元。着席ポーズ後の腰高さに合わせて座面に載せる */
export const RUNWAY_SEAT_Y = RUNWAY.audienceSeatY

export type RunwaySeatSlot = {
  index: number
  x: number
  z: number
  rotationY: number
  benchIndex: number
}

const SEAT_SLOTS: RunwaySeatSlot[] = buildRunwaySeatSlots()

function buildRunwaySeatSlots(): RunwaySeatSlot[] {
  const slots: RunwaySeatSlot[] = []
  let index = 0

  RUNWAY.benches.forEach((bench, benchIndex) => {
    const cos = Math.cos(bench.rotationY)
    const sin = Math.sin(bench.rotationY)

    for (const along of SEAT_ALONG) {
      const worldX = bench.x + along * cos + RUNWAY_SEAT_DEPTH * sin
      const worldZ = bench.z - along * sin + RUNWAY_SEAT_DEPTH * cos
      const rotationY = Math.atan2(-worldX, RUNWAY.pauseZ - worldZ)

      slots.push({ index, x: worldX, z: worldZ, rotationY, benchIndex })
      index += 1
    }
  })

  return slots
}

export function getRunwaySeatSlots(): readonly RunwaySeatSlot[] {
  return SEAT_SLOTS
}

export function getRunwaySeatSlot(seatIndex: number): RunwaySeatSlot | null {
  return SEAT_SLOTS[seatIndex] ?? null
}

/** 空席に近づいたとき Sit を出す距離（通路側の接近点基準） */
export const RUNWAY_SIT_INTERACT_RADIUS = 1.3
/** 座席から通路側へ出した Sit 判定・立ち位置の距離 */
export const RUNWAY_SEAT_APPROACH_DISTANCE = 0.82

export function getSeatApproachPosition(
  seat: RunwaySeatSlot,
  distance = RUNWAY_SEAT_APPROACH_DISTANCE,
): { x: number; z: number } {
  const forwardX = Math.sin(seat.rotationY)
  const forwardZ = Math.cos(seat.rotationY)
  return {
    x: seat.x + forwardX * distance,
    z: seat.z + forwardZ * distance,
  }
}

export function findNearestEmptySeat(
  playerX: number,
  playerZ: number,
  emptySeatIndices: readonly number[],
  maxDistance = RUNWAY_SIT_INTERACT_RADIUS,
): number | null {
  if (!isRunwayPositionWalkable(playerX, playerZ)) {
    return null
  }

  let bestIndex: number | null = null
  let bestDistSq = maxDistance * maxDistance

  for (const seatIndex of emptySeatIndices) {
    const seat = getRunwaySeatSlot(seatIndex)
    if (!seat) continue

    const approach = getSeatApproachPosition(seat)
    const dx = playerX - approach.x
    const dz = playerZ - approach.z
    const distSq = dx * dx + dz * dz
    if (distSq <= bestDistSq) {
      bestDistSq = distSq
      bestIndex = seatIndex
    }
  }

  return bestIndex
}

/** 立ち上がり時にベンチ前へ一歩出す */
export function getRunwayStandUpPosition(seatIndex: number): { x: number; z: number; rotationY: number } | null {
  const seat = getRunwaySeatSlot(seatIndex)
  if (!seat) return null

  const forwardX = Math.sin(seat.rotationY)
  const forwardZ = Math.cos(seat.rotationY)
  const standOffset = RUNWAY_SEAT_APPROACH_DISTANCE + 0.1

  return {
    x: seat.x + forwardX * standOffset,
    z: seat.z + forwardZ * standOffset,
    rotationY: seat.rotationY,
  }
}

/** 立ち上がり位置がベンチ判定に被る場合、通路側へずらす */
export function resolveRunwayStandUpPosition(
  seatIndex: number,
): { x: number; z: number; rotationY: number } | null {
  const base = getRunwayStandUpPosition(seatIndex)
  if (!base) return null

  const seat = getRunwaySeatSlot(seatIndex)
  if (!seat) return base

  const forwardX = Math.sin(seat.rotationY)
  const forwardZ = Math.cos(seat.rotationY)
  const candidates: Array<{ x: number; z: number }> = [{ x: base.x, z: base.z }]

  for (const extra of [0.28, 0.55, 0.85]) {
    candidates.push({
      x: base.x + forwardX * extra,
      z: base.z + forwardZ * extra,
    })
  }
  // 列間（Runway 手前 = +Z）へ逃がす — 奥列席から立ち上がったとき用
  for (const dz of [0.4, 0.75, 1.05]) {
    candidates.push({ x: base.x, z: base.z + dz })
    candidates.push({
      x: base.x + forwardX * 0.35,
      z: base.z + forwardZ * 0.35 + dz,
    })
  }

  for (const candidate of candidates) {
    if (isRunwayPositionWalkable(candidate.x, candidate.z)) {
      return { x: candidate.x, z: candidate.z, rotationY: base.rotationY }
    }
  }

  return base
}

/** 日替わり空席（4〜8席） */
export function pickDailyEmptySeatIndices(rng: () => number): number[] {
  const minEmpty = 4
  const maxEmpty = 8
  const emptyCount = minEmpty + Math.floor(rng() * (maxEmpty - minEmpty + 1))

  const indices = Array.from({ length: RUNWAY_TOTAL_SEATS }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = indices[i]
    indices[i] = indices[j]
    indices[j] = tmp
  }

  return indices.slice(0, emptyCount).sort((a, b) => a - b)
}

export function getOccupiedSeatIndices(emptySeatIndices: readonly number[]): number[] {
  const empty = new Set(emptySeatIndices)
  const occupied: number[] = []
  for (let i = 0; i < RUNWAY_TOTAL_SEATS; i += 1) {
    if (!empty.has(i)) occupied.push(i)
  }
  return occupied
}
