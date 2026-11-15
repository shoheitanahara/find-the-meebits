import { LEARN_ART, LEARN_ART_OCCUPANCY } from './config'
import { isLearnArtPositionWalkable } from './collisions'

/** ベンチ1脚あたり2席 */
export const LEARN_ART_TOTAL_SEATS = LEARN_ART.benches.length * 2

const SEAT_ALONG = [-0.55, 0.55] as const
/** 背もたれ前面付近まで寄せる（スクリーン向き） */
export const LEARN_ART_SEAT_DEPTH = 0.3
export const LEARN_ART_SEAT_Y = LEARN_ART.audienceSeatY

export type LearnArtSeatSlot = {
  index: number
  x: number
  z: number
  rotationY: number
  benchIndex: number
}

const SEAT_SLOTS: LearnArtSeatSlot[] = buildLearnArtSeatSlots()

function buildLearnArtSeatSlots(): LearnArtSeatSlot[] {
  const slots: LearnArtSeatSlot[] = []
  let index = 0

  LEARN_ART.benches.forEach((bench, benchIndex) => {
    const cos = Math.cos(bench.rotationY)
    const sin = Math.sin(bench.rotationY)

    for (const along of SEAT_ALONG) {
      const worldX = bench.x + along * cos + LEARN_ART_SEAT_DEPTH * sin
      const worldZ = bench.z - along * sin + LEARN_ART_SEAT_DEPTH * cos
      // スクリーン（−Z）を向く
      const rotationY = Math.PI

      slots.push({ index, x: worldX, z: worldZ, rotationY, benchIndex })
      index += 1
    }
  })

  return slots
}

export function getLearnArtSeatSlots(): readonly LearnArtSeatSlot[] {
  return SEAT_SLOTS
}

export function getLearnArtSeatSlot(seatIndex: number): LearnArtSeatSlot | null {
  return SEAT_SLOTS[seatIndex] ?? null
}

export const LEARN_ART_SIT_INTERACT_RADIUS = 1.3
export const LEARN_ART_SEAT_APPROACH_DISTANCE = 0.82

export function getSeatApproachPosition(
  seat: LearnArtSeatSlot,
  distance = LEARN_ART_SEAT_APPROACH_DISTANCE,
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
  maxDistance = LEARN_ART_SIT_INTERACT_RADIUS,
): number | null {
  if (!isLearnArtPositionWalkable(playerX, playerZ)) return null

  let bestIndex: number | null = null
  let bestDistSq = maxDistance * maxDistance

  for (const seatIndex of emptySeatIndices) {
    const seat = getLearnArtSeatSlot(seatIndex)
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

export function getLearnArtStandUpPosition(
  seatIndex: number,
): { x: number; z: number; rotationY: number } | null {
  const seat = getLearnArtSeatSlot(seatIndex)
  if (!seat) return null

  const forwardX = Math.sin(seat.rotationY)
  const forwardZ = Math.cos(seat.rotationY)
  const standOffset = LEARN_ART_SEAT_APPROACH_DISTANCE + 0.1

  return {
    x: seat.x + forwardX * standOffset,
    z: seat.z + forwardZ * standOffset,
    rotationY: seat.rotationY,
  }
}

export function resolveLearnArtStandUpPosition(
  seatIndex: number,
): { x: number; z: number; rotationY: number } | null {
  const base = getLearnArtStandUpPosition(seatIndex)
  if (!base) return null

  const forwardX = Math.sin(base.rotationY)
  const forwardZ = Math.cos(base.rotationY)
  const candidates = [base]
  for (const extra of [0.28, 0.55, 0.85]) {
    candidates.push({
      x: base.x + forwardX * extra,
      z: base.z + forwardZ * extra,
      rotationY: base.rotationY,
    })
  }
  for (const dz of [0.4, 0.75, 1.05]) {
    candidates.push({ x: base.x, z: base.z + dz, rotationY: base.rotationY })
  }

  for (const candidate of candidates) {
    if (isLearnArtPositionWalkable(candidate.x, candidate.z)) return candidate
  }
  return base
}

/** 目標占有率付近の空席を日替わりで選ぶ */
export function pickDailyEmptySeatIndices(rng: () => number): number[] {
  const targetEmpty = Math.round(LEARN_ART_TOTAL_SEATS * (1 - LEARN_ART_OCCUPANCY))
  const jitter = Math.floor(rng() * 3) - 1
  const emptyCount = Math.max(2, Math.min(LEARN_ART_TOTAL_SEATS - 2, targetEmpty + jitter))

  const indices = Array.from({ length: LEARN_ART_TOTAL_SEATS }, (_, i) => i)
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
  for (let i = 0; i < LEARN_ART_TOTAL_SEATS; i += 1) {
    if (!empty.has(i)) occupied.push(i)
  }
  return occupied
}
