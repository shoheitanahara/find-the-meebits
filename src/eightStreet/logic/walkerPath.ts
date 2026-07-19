import { EIGHT_STREET } from '../config'

export type WalkerPatternSlot = {
  slotIndex: number
  lane: number
  initialProgress: number
  speed: number
}

export type PathPose = {
  x: number
  z: number
  yaw: number
  despawned: boolean
}

const SLOT_LANES = [-0.92, 0.88, -0.55, 0.42, -0.18, 0.72, -0.78, 0.12, 0.58, -0.38] as const
const SLOT_SPEEDS = [1.12, 1.18, 1.08, 1.22, 1.15, 1.2, 1.1, 1.16, 1.14, 1.19] as const
/** Gap between walkers along the approach (meters of path). */
const PATH_SPACING = 2.4

/**
 * Lead (nearest the bend) sits just before the corner.
 * Wider PATH_SPACING pushes the last walker further down Leg B.
 */
const CORNER_APPROACH =
  PATH_SPACING * (EIGHT_STREET.meebitCount - 1) + 1.5

function shuffleCopy<T>(source: readonly T[]): T[] {
  const next = [...source]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

/**
 * Fixed cast order / spacing for the session, but lane sides are shuffled
 * so the lead Meebits are not always on the same wall.
 */
export function createSessionWalkerPattern(
  count: number = EIGHT_STREET.meebitCount,
): WalkerPatternSlot[] {
  const lanes = shuffleCopy(SLOT_LANES)
  const speeds = shuffleCopy(SLOT_SPEEDS)
  // Occasionally mirror the whole formation for more session variety.
  const mirror = Math.random() < 0.5 ? -1 : 1

  return Array.from({ length: count }, (_, i) => ({
    slotIndex: i,
    lane: Math.max(-0.95, Math.min(0.95, lanes[i % lanes.length] * mirror)),
    // i=0 nearest the corner; higher i = further down the side street.
    initialProgress: (count - 1 - i) * PATH_SPACING,
    speed: speeds[i % speeds.length],
  }))
}

/**
 * Walkers approach along Leg B (−X) just before the first corner, then Leg A (+Z).
 * Corner position is continuous — only yaw snaps 90°.
 */
export function getLPathPose(progress: number, lane: number): PathPose {
  const hw = EIGHT_STREET.halfWidth - 0.85
  const lateral = Math.max(-1, Math.min(1, lane)) * hw * 0.85
  const cornerZ = EIGHT_STREET.corner1Z

  // Start a short stretch before the bend — not deep on Leg C.
  const horizStart = lateral + CORNER_APPROACH
  const turnX = lateral
  const horizLen = Math.max(horizStart - turnX, 0.01)
  const entryZ = cornerZ + lateral

  if (progress < horizLen) {
    return { x: horizStart - progress, z: entryZ, yaw: -Math.PI / 2, despawned: false }
  }

  const zPos = entryZ + (progress - horizLen)
  return {
    x: turnX,
    z: zPos,
    yaw: 0,
    despawned: zPos > EIGHT_STREET.walkerDespawnZ,
  }
}
