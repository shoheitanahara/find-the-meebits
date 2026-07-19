/**
 * Crank-shaped street (one stage):
 *
 *   Start (facing −Z)
 *     │
 *     │  Leg A (−Z, observe Meebits)
 *     │
 *     └───────→  Leg B (+X, right turn)
 *                    │
 *                    │  Leg C (−Z, left turn)
 *                    │
 *                    ↓  Continuity → warp to Start
 */
export const EIGHT_STREET = {
  title: '8th Street',
  meebitCount: 10,
  targetProgress: 8,
  halfWidth: 3.0,

  // Leg A: x=0, z goes from startZ down to corner1Z
  startZ: 6,
  /** Open return corridor behind the player (no visible end wall). */
  returnEndZ: 20,
  corner1Z: -26,

  // Leg B: z=corner1Z, x goes from 0 to corner2X
  // Long enough that the walker pack can start off-screen before the first corner.
  corner2X: 28,

  // Leg C: x=corner2X, z goes from corner1Z down to exitZ
  exitZ: -52,
  /**
   * Continue fires after the final left turn.
   */
  forwardTransitionZ: -33,

  eyeHeight: 1.65,
  moveSpeed: 3.6,
  dashSpeed: 6.5,
  fov: 70,
  pitchMaxUp: (30 * Math.PI) / 180,
  pitchMaxDown: (35 * Math.PI) / 180,
  mouseLookSensitivity: 0.0022,
  /** Mobile drag look — higher than mouse for finger-sized swipes. */
  touchLookSensitivity: 0.0065,
  /** Mobile stick: how fast yaw eases toward the stick direction. */
  stickFaceTurnSpeed: 1.5,
  stickFaceDeadzone: 0.3,

  playerStartX: 0,
  playerStartZ: 4,
  /**
   * Session spawn Z is re-rolled on each Start (X/yaw stay centered facing −Z).
   * Absolute ranges (kept clear of returnTransitionZ / walls).
   */
  sessionLandZMin: 1.35,
  sessionLandZMax: 3.4,
  sessionStartZMin: 1.8,
  sessionStartZMax: 3.6,

  /**
   * Turn-back fires as soon as the player walks past this on leg A.
   * Kept clearly behind session spawn / wrap landings.
   */
  returnTransitionZ: 5.2,
  /** Continue / restart land here — always in front of returnTransitionZ. */
  entranceLandingZ: 3.2,
  wallMargin: 0.35,

  walkerBaseSpeed: 1.2,
  walkerSpeedJitter: 0.28,
  walkerDespawnZ: 10,
  normalRoundChance: 0.55,
  maxSameKindStreak: 3,

  /** Full-screen white wash between streets (ms). */
  wrapFadeInMs: 560,
  wrapMinWhiteMs: 900,
  wrapFadeOutMs: 560,
} as const

/**
 * Late-night mood knobs — tweak these to rebalance darkness vs street brightness.
 * Warm sodium lamps light the route; cold white stays only at wrap veils.
 */
export const NIGHT_MOOD = {
  /** Canvas / fog / clear color */
  sky: '#0c1220',
  fogNear: 28,
  fogFar: 85,

  /** Base fill — readable night without needing a forest of point lights. */
  ambient: 0.42,
  hemiSky: '#3a4e78',
  hemiGround: '#2a2218',
  hemiIntensity: 0.52,
  moonIntensity: 0.45,
  moonColor: '#a8c0e0',

  /** Warm street lamps (one pointLight each — spotlights were too costly). */
  lampColor: '#ffc078',
  lampIntensity: 62,
  lampDistance: 17,
  lampAngle: 0.82,
  lampPenumbra: 0.5,
  lampDecay: 1.55,
  lampHeight: 5.1,
  /** Wider spacing keeps the light count playable with several VRMs. */
  lampSpacing: 9.5,
  lampInset: 0.1,
  /** Mid-height fill under each lamp — main readability knob for dark Meebits. */
  fillIntensity: 16,
  fillDistance: 15,

  /** Cold white at transition veils only */
  veilColor: '#ffffff',
  veilLightIntensity: 5.8,
  veilLightDistance: 16,
  veilPeakOpacity: 0.88,
  veilVolumeOpacity: 0.5,
} as const

export type AlleyPoint = { x: number; z: number }

type Aabb = { minX: number; maxX: number; minZ: number; maxZ: number }

/** Matches the thick brick boxes in AlleyStreet (wallDepth = 3). */
const WALL_DEPTH = 3

/**
 * Solid AABBs for the last bend (Leg B → Leg C).
 * Corridor clamps alone are not enough: Leg C’s west wall ends at z=corner1Z,
 * so it occupies the south half of Leg B’s lane as an L-shaped brick block.
 */
function getLastCornerSolids(): Aabb[] {
  const hw = EIGHT_STREET.halfWidth
  const { corner1Z, corner2X, exitZ } = EIGHT_STREET
  const wallExtend = hw + WALL_DEPTH
  const exitEndZ = exitZ - 12

  return [
    // Leg C west — sticks into Leg B (inner pivot of the left turn).
    {
      minX: corner2X - hw - WALL_DEPTH,
      maxX: corner2X - hw,
      minZ: exitEndZ,
      maxZ: corner1Z,
    },
    // Leg B south — meets Leg C west at the re-entrant corner.
    {
      minX: -hw,
      maxX: corner2X - hw,
      minZ: corner1Z - hw - WALL_DEPTH,
      maxZ: corner1Z - hw,
    },
    // Leg C east (extends past the bend toward +Z).
    {
      minX: corner2X + hw,
      maxX: corner2X + hw + WALL_DEPTH,
      minZ: exitEndZ,
      maxZ: corner1Z + wallExtend,
    },
    // Leg B north.
    {
      minX: hw,
      maxX: corner2X + hw,
      minZ: corner1Z + hw,
      maxZ: corner1Z + hw + WALL_DEPTH,
    },
  ]
}

function pushOutOfAabb(x: number, z: number, box: Aabb): AlleyPoint {
  if (x <= box.minX || x >= box.maxX || z <= box.minZ || z >= box.maxZ) {
    return { x, z }
  }
  const dl = x - box.minX
  const dr = box.maxX - x
  const db = z - box.minZ
  const dt = box.maxZ - z
  const m = Math.min(dl, dr, db, dt)
  if (m === dl) return { x: box.minX, z }
  if (m === dr) return { x: box.maxX, z }
  if (m === db) return { x, z: box.minZ }
  return { x, z: box.maxZ }
}

export function clampToAlley(x: number, z: number): AlleyPoint {
  const hw = EIGHT_STREET.halfWidth - EIGHT_STREET.wallMargin
  const { returnEndZ, corner1Z, corner2X, exitZ } = EIGHT_STREET
  const topZ = returnEndZ

  // Check each corridor + corners
  const inA = Math.abs(x) <= hw && z >= corner1Z - hw && z <= topZ
  const inB = Math.abs(z - corner1Z) <= hw && x >= -hw && x <= corner2X + hw
  const inC = Math.abs(x - corner2X) <= hw && z >= exitZ - hw && z <= corner1Z + hw

  let point: AlleyPoint = { x, z }

  if (!(inA || inB || inC)) {
    // Clamp to nearest corridor
    const candidates: AlleyPoint[] = [
      { x: Math.max(-hw, Math.min(hw, x)), z: Math.max(corner1Z - hw, Math.min(topZ, z)) },
      { x: Math.max(-hw, Math.min(corner2X + hw, x)), z: Math.max(corner1Z - hw, Math.min(corner1Z + hw, z)) },
      { x: Math.max(corner2X - hw, Math.min(corner2X + hw, x)), z: Math.max(exitZ - hw, Math.min(corner1Z + hw, z)) },
    ]

    let best = candidates[0]
    let bestD = Infinity
    for (const p of candidates) {
      const inAny =
        (Math.abs(p.x) <= hw && p.z >= corner1Z - hw && p.z <= topZ) ||
        (Math.abs(p.z - corner1Z) <= hw && p.x >= -hw && p.x <= corner2X + hw) ||
        (Math.abs(p.x - corner2X) <= hw && p.z >= exitZ - hw && p.z <= corner1Z + hw)
      if (!inAny) continue
      const d = (p.x - x) ** 2 + (p.z - z) ** 2
      if (d < bestD) { bestD = d; best = p }
    }
    point = best
  }

  // Solid brick volumes (last-corner overhang etc.) — inflate slightly into the lane
  // so the player cannot slip through the visible face.
  const pad = EIGHT_STREET.wallMargin
  for (const solid of getLastCornerSolids()) {
    point = pushOutOfAabb(point.x, point.z, {
      minX: solid.minX - pad,
      maxX: solid.maxX + pad,
      minZ: solid.minZ - pad,
      maxZ: solid.maxZ + pad,
    })
  }

  return point
}
