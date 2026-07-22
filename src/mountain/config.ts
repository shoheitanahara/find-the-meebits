/**
 * Mountain Climb — 複数ルートのあるボクセル山。
 * 視点は固定。WASD は移動のみ。段差は最大 +1（ジャンプで越える）。
 */

export const MOUNTAIN = {
  moveSpeed: 5.4,
  dashMultiplier: 1.45,
  jumpSpeed: 9.6,
  gravity: 26,
  playerRadius: 0.34,
  playerHeight: 1.55,
  camBack: 14,
  camHeight: 9,
  camLookAhead: 9,
  camXFollow: 0.88,
  start: { x: 0, y: 2.05, z: 14 },
  goalY: 42,
  goalZ: -138,
  goalRadius: 3.2,
  dashOuterThreshold: 0.82,
  voxelSize: 1,
  fallY: -1.5,
} as const

export type VoxelBlock = {
  x: number
  y: number
  z: number
  w: number
  h: number
  d: number
  color: string
}

export type BlockKind = 'grass' | 'dirt' | 'sand' | 'stone' | 'darkStone' | 'snow' | 'path' | 'gravel'

export type VoxelColumn = {
  x: number
  z: number
  h: number
  kind: BlockKind
  /** 草など上面と側面が違うブロック */
  isGrassTop?: boolean
}

type LaneId = 'L' | 'C' | 'R'

type Waypoint = { z: number; x: number }

/** 中央ルート */
const LANE_C: readonly Waypoint[] = [
  { z: 16, x: 0 },
  { z: 4, x: 1 },
  { z: -10, x: 0 },
  { z: -28, x: 2 },
  { z: -48, x: -1 },
  { z: -70, x: 1 },
  { z: -95, x: 0 },
  { z: -118, x: 1 },
  { z: -142, x: 0 },
]

/** 左ルート（外側寄り） */
const LANE_L: readonly Waypoint[] = [
  { z: 16, x: 0 },
  { z: 4, x: -5 },
  { z: -10, x: -8 },
  { z: -28, x: -10 },
  { z: -48, x: -11 },
  { z: -70, x: -9 },
  { z: -95, x: -10 },
  { z: -118, x: -6 },
  { z: -142, x: 0 },
]

/** 右ルート */
const LANE_R: readonly Waypoint[] = [
  { z: 16, x: 0 },
  { z: 4, x: 5 },
  { z: -10, x: 8 },
  { z: -28, x: 10 },
  { z: -48, x: 11 },
  { z: -70, x: 8 },
  { z: -95, x: 10 },
  { z: -118, x: 6 },
  { z: -142, x: 0 },
]

const LANE_WAYS: Record<LaneId, readonly Waypoint[]> = {
  L: LANE_L,
  C: LANE_C,
  R: LANE_R,
}

/** 常に3レーン有効（途中で中央が消えて詰まらない） */
const LANE_BANDS: ReadonlyArray<{ zHi: number; zLo: number; lanes: readonly LaneId[] }> = [
  { zHi: 16, zLo: -145, lanes: ['L', 'C', 'R'] },
]

function lerpWaypoints(pts: readonly Waypoint[], z: number): number {
  if (z >= pts[0].z) return pts[0].x
  if (z <= pts[pts.length - 1].z) return pts[pts.length - 1].x
  for (let i = 0; i < pts.length - 1; i += 1) {
    const a = pts[i]
    const b = pts[i + 1]
    if (z <= a.z && z >= b.z) {
      const t = (a.z - z) / (a.z - b.z)
      return a.x + (b.x - a.x) * t
    }
  }
  return 0
}

function activeLanesAt(z: number): readonly LaneId[] {
  for (const band of LANE_BANDS) {
    if (z <= band.zHi && z >= band.zLo) return band.lanes
  }
  return ['L', 'C', 'R']
}

function laneX(lane: LaneId, z: number) {
  return lerpWaypoints(LANE_WAYS[lane], z)
}

/** ゴール判定・カメラ用の代表中心（有効レーンの平均） */
export function pathCenterX(z: number): number {
  const lanes = activeLanesAt(z)
  const sum = lanes.reduce((acc, id) => acc + laneX(id, z), 0)
  return sum / Math.max(1, lanes.length)
}

export function pathLaneCenters(z: number): number[] {
  return activeLanesAt(z).map((id) => laneX(id, z))
}

type Ravine = {
  zLo: number
  zHi: number
  /** full = 棚を横断する穴（ジャンプ必須）。lane = 指定レーンだけ穴（迂回可） */
  cut: 'full' | 'lane'
  lanes?: readonly LaneId[]
  stones?: ReadonlyArray<{ lane: LaneId; xOff: number; z: number }>
}

/**
 * 裂け目を高密度に配置。失敗＝マグマ落下。縦段差は +1 以内。
 * 足場間ホップは最大 3。
 */
const RAVINES: readonly Ravine[] = [
  { zLo: 2, zHi: 3, cut: 'lane', lanes: ['C'] },
  { zLo: -1, zHi: 0, cut: 'lane', lanes: ['L', 'R'] },
  { zLo: -3, zHi: -2, cut: 'full', stones: [{ lane: 'C', xOff: 0, z: -2 }] },
  { zLo: -6, zHi: -5, cut: 'lane', lanes: ['L'] },
  { zLo: -8, zHi: -7, cut: 'lane', lanes: ['R'] },
  {
    zLo: -12,
    zHi: -10,
    cut: 'full',
    stones: [
      { lane: 'L', xOff: 0, z: -11 },
      { lane: 'C', xOff: 0, z: -11 },
      { lane: 'R', xOff: 0, z: -11 },
    ],
  },
  { zLo: -15, zHi: -14, cut: 'lane', lanes: ['C', 'R'] },
  { zLo: -18, zHi: -17, cut: 'full', stones: [{ lane: 'C', xOff: 0, z: -17 }] },
  { zLo: -21, zHi: -20, cut: 'lane', lanes: ['L'] },
  { zLo: -23, zHi: -22, cut: 'lane', lanes: ['R'] },
  {
    zLo: -27,
    zHi: -25,
    cut: 'full',
    stones: [
      { lane: 'L', xOff: 0, z: -26 },
      { lane: 'C', xOff: 0, z: -26 },
      { lane: 'R', xOff: 0, z: -26 },
    ],
  },
  { zLo: -30, zHi: -29, cut: 'lane', lanes: ['L', 'C'] },
  { zLo: -33, zHi: -32, cut: 'full', stones: [{ lane: 'C', xOff: 0, z: -32 }] },
  {
    zLo: -38,
    zHi: -35,
    cut: 'full',
    stones: [
      { lane: 'L', xOff: 0, z: -37 },
      { lane: 'C', xOff: 0, z: -36 },
      { lane: 'R', xOff: 0, z: -37 },
    ],
  },
  { zLo: -41, zHi: -40, cut: 'lane', lanes: ['R'] },
  { zLo: -44, zHi: -43, cut: 'lane', lanes: ['L'] },
  { zLo: -47, zHi: -46, cut: 'full', stones: [{ lane: 'C', xOff: 0, z: -46 }] },
  { zLo: -50, zHi: -49, cut: 'lane', lanes: ['C', 'R'] },
  {
    zLo: -55,
    zHi: -52,
    cut: 'full',
    stones: [
      { lane: 'L', xOff: 0, z: -54 },
      { lane: 'C', xOff: 0, z: -53 },
      { lane: 'R', xOff: 0, z: -54 },
    ],
  },
  { zLo: -58, zHi: -57, cut: 'lane', lanes: ['L'] },
  { zLo: -61, zHi: -60, cut: 'full', stones: [{ lane: 'C', xOff: 0, z: -60 }] },
  { zLo: -64, zHi: -63, cut: 'lane', lanes: ['R'] },
  {
    zLo: -69,
    zHi: -66,
    cut: 'full',
    stones: [
      { lane: 'C', xOff: 0, z: -68 },
      { lane: 'C', xOff: 0, z: -67 },
      { lane: 'R', xOff: 1, z: -67 },
    ],
  },
  { zLo: -72, zHi: -71, cut: 'lane', lanes: ['L', 'C'] },
  { zLo: -75, zHi: -74, cut: 'full', stones: [{ lane: 'C', xOff: 0, z: -74 }] },
  { zLo: -78, zHi: -77, cut: 'lane', lanes: ['R'] },
  {
    zLo: -83,
    zHi: -80,
    cut: 'full',
    stones: [
      { lane: 'L', xOff: 0, z: -82 },
      { lane: 'C', xOff: 0, z: -81 },
      { lane: 'R', xOff: 0, z: -82 },
    ],
  },
  { zLo: -86, zHi: -85, cut: 'lane', lanes: ['L'] },
  { zLo: -89, zHi: -88, cut: 'full', stones: [{ lane: 'C', xOff: 0, z: -88 }] },
  { zLo: -92, zHi: -91, cut: 'lane', lanes: ['C', 'R'] },
  {
    zLo: -97,
    zHi: -94,
    cut: 'full',
    stones: [
      { lane: 'L', xOff: 0, z: -96 },
      { lane: 'C', xOff: 0, z: -95 },
      { lane: 'C', xOff: 0, z: -94 },
    ],
  },
  { zLo: -100, zHi: -99, cut: 'lane', lanes: ['R'] },
  { zLo: -103, zHi: -102, cut: 'full', stones: [{ lane: 'C', xOff: 0, z: -102 }] },
  { zLo: -106, zHi: -105, cut: 'lane', lanes: ['L', 'C'] },
  {
    zLo: -111,
    zHi: -108,
    cut: 'full',
    stones: [
      { lane: 'L', xOff: 0, z: -110 },
      { lane: 'C', xOff: 0, z: -109 },
      { lane: 'R', xOff: 0, z: -110 },
    ],
  },
  { zLo: -114, zHi: -113, cut: 'lane', lanes: ['R'] },
  { zLo: -117, zHi: -116, cut: 'full', stones: [{ lane: 'C', xOff: 0, z: -116 }] },
  {
    zLo: -122,
    zHi: -119,
    cut: 'full',
    stones: [
      { lane: 'L', xOff: 0, z: -121 },
      { lane: 'C', xOff: 0, z: -120 },
      { lane: 'R', xOff: 0, z: -121 },
    ],
  },
  { zLo: -125, zHi: -124, cut: 'lane', lanes: ['C'] },
  {
    zLo: -130,
    zHi: -127,
    cut: 'full',
    stones: [
      { lane: 'C', xOff: 0, z: -129 },
      { lane: 'C', xOff: 0, z: -128 },
    ],
  },
  { zLo: -133, zHi: -132, cut: 'full', stones: [{ lane: 'C', xOff: 0, z: -132 }] },
]

function ravinesAt(z: number): Ravine[] {
  return RAVINES.filter((r) => z >= r.zLo && z <= r.zHi)
}

function buildTrailElevByZ(): Map<number, number> {
  const map = new Map<number, number>()
  let elev = 2
  let solidSteps = 0
  const flatUntilZ = 8

  for (let z = 16; z >= -145; z -= 1) {
    if (z >= flatUntilZ) {
      map.set(z, 2)
      elev = 2
      solidSteps = 0
      continue
    }

    const fullCut = ravinesAt(z).some((r) => r.cut === 'full')
    if (fullCut) {
      map.set(z, elev)
      solidSteps = 0
      continue
    }

    solidSteps += 1
    if (solidSteps >= 2 && elev < MOUNTAIN.goalY) {
      elev += 1
      solidSteps = 0
    }
    map.set(z, elev)
  }

  return map
}

const TRAIL_ELEV_BY_Z = buildTrailElevByZ()

function trailElev(z: number) {
  return TRAIL_ELEV_BY_Z.get(z) ?? 2
}

/** 歩ける棚（狭め＝崖落ちしやすい） */
function shelfBounds(z: number) {
  const xs = [
    ...pathLaneCenters(z),
    ...pathLaneCenters(z + 1),
    ...pathLaneCenters(z - 1),
  ]
  const pad = 0.85
  return { lo: Math.min(...xs) - pad, hi: Math.max(...xs) + pad }
}

function isOnShelf(x: number, z: number) {
  const { lo, hi } = shelfBounds(z)
  return x >= lo && x <= hi
}

function nearestLaneDist(x: number, z: number) {
  const centers = pathLaneCenters(z)
  let best = Infinity
  for (const cx of centers) best = Math.min(best, Math.abs(x - cx))
  for (const cx of pathLaneCenters(z + 1)) best = Math.min(best, Math.abs(x - cx))
  for (const cx of pathLaneCenters(z - 1)) best = Math.min(best, Math.abs(x - cx))
  return best
}

function isTrailCell(x: number, z: number) {
  return nearestLaneDist(x, z) <= 1.05
}

function hash2(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function isRavineHole(x: number, z: number) {
  if (!isOnShelf(x, z)) return false
  for (const ravine of ravinesAt(z)) {
    if (ravine.cut === 'full') return true
    for (const lane of ravine.lanes ?? []) {
      const cx = laneX(lane, z)
      if (Math.abs(x - cx) <= 1.2) return true
    }
  }
  return false
}

/** 棚の縁を削ってギザギザの崖にする（レーン中心は残す） */
function isCliffNotch(x: number, z: number) {
  if (!isOnShelf(x, z)) return false
  if (nearestLaneDist(x, z) <= 0.85) return false
  const { lo, hi } = shelfBounds(z)
  const edge = Math.min(x - lo, hi - x) <= 0.9
  if (!edge) return false
  return hash2(x, z) < 0.42
}

/**
 * 稜線から続く山体。棚は切り通しのテラス。
 * 外側は反り立つ壁ではなく、斜面でつながって麓〜マグマへ落ちる。
 */
export function heightAt(x: number, z: number): number {
  const elev = trailElev(z)
  const ridge = pathCenterX(z)
  const distRidge = Math.abs(x - ridge)

  if (z <= -136 && Math.abs(x) <= 3) return Math.max(elev, MOUNTAIN.goalY)

  if (isRavineHole(x, z) || isCliffNotch(x, z)) return 0

  // 山の本体（稜線中心のなだらか〜急な斜面）
  const noise = Math.floor(hash2(Math.floor(x), Math.floor(z)) * 3) - 1
  let mountain = elev + 5 + noise - Math.floor(distRidge * 0.72)
  // 麓の裾野
  if (mountain < 3 && distRidge < 22) {
    mountain = Math.max(0, 3 - Math.floor((distRidge - 14) * 0.55) + Math.max(0, noise))
  }
  mountain = Math.max(0, mountain)

  // 歩ける棚は山を削ったテラス（同じ高さで左右に動ける）
  if (isOnShelf(x, z)) return elev

  // 棚のすぐ外は急斜面でマグマへ（つながっているが落ちやすい崖）
  const { lo, hi } = shelfBounds(z)
  const distOut = x < lo ? lo - x : x - hi
  if (distOut <= 4) {
    const cliff = elev - Math.floor(distOut * 2.1) - Math.floor(hash2(x + 1, z) * 2)
    // 山体とブレンド（完全な垂直壁にしない）
    return Math.max(0, Math.min(mountain, Math.max(cliff, 0)))
  }

  return mountain
}

function blockKindFor(x: number, z: number, h: number, onTrail: boolean): BlockKind {
  if (h >= 40) return 'snow'
  if (onTrail && z > -136) return 'path'
  if (h <= 3 && (Math.abs(x) > 6 || z > 8)) return 'sand'
  if (h >= 28) return 'stone'
  if (h >= 16) return 'darkStone'
  if (h >= 7) return 'dirt'
  if (h <= 4 && nearestLaneDist(x, z) > 3) return 'sand'
  return 'grass'
}

function buildMountainData() {
  const heights = new Map<string, number>()

  const setHeight = (x: number, z: number, layers: number) => {
    if (layers <= 0) {
      heights.set(`${x},${z}`, 0)
      return
    }
    const key = `${x},${z}`
    const prev = heights.get(key)
    if (prev === 0) return
    heights.set(key, Math.max(prev ?? 0, layers))
  }

  const clearHeight = (x: number, z: number) => {
    heights.set(`${x},${z}`, 0)
  }

  for (let z = 16; z >= -145; z -= 1) {
    const centers = pathLaneCenters(z)
    const minX = Math.floor(Math.min(...centers) - 22)
    const maxX = Math.ceil(Math.max(...centers) + 22)
    for (let x = minX; x <= maxX; x += 1) {
      const h = heightAt(x, z)
      if (h <= 0) clearHeight(x, z)
      else setHeight(x, z, h)
    }
  }

  for (let x = -3; x <= 3; x += 1) {
    for (let z = 12; z <= 15; z += 1) {
      setHeight(x, z, 2)
    }
  }

  // 飛び石（裂け目直前の高さ＝縦 +2 を作らない）
  for (const ravine of RAVINES) {
    const rimElev = trailElev(ravine.zHi + 1)
    for (const stone of ravine.stones ?? []) {
      const x = Math.round(laneX(stone.lane, stone.z) + stone.xOff)
      heights.set(`${x},${stone.z}`, rimElev)
    }
  }

  for (let x = -3; x <= 3; x += 1) {
    for (let z = -140; z <= -136; z += 1) {
      heights.set(`${x},${z}`, Math.max(trailElev(z), MOUNTAIN.goalY))
    }
  }

  // 遠景の稜線ピーク（山体と連続）
  for (let z = 8; z >= -140; z -= 2) {
    const ridge = pathCenterX(z)
    const peak = trailElev(z) + 10
    setHeight(Math.round(ridge - 16), z, Math.max(4, peak - 6))
    setHeight(Math.round(ridge + 16), z, Math.max(4, peak - 6))
    if (z % 4 === 0) {
      setHeight(Math.round(ridge - 13), z, Math.max(3, peak - 8))
      setHeight(Math.round(ridge + 13), z, Math.max(3, peak - 8))
    }
  }

  // 棚セルの進行方向の段差を最終チェック（最大 +1）
  for (let z = 15; z >= -144; z -= 1) {
    const elev = trailElev(z)
    const { lo, hi } = shelfBounds(z)
    for (let x = Math.floor(lo); x <= Math.ceil(hi); x += 1) {
      const key = `${x},${z}`
      const h = heights.get(key)
      if (h === undefined || h <= 0) continue
      if (isRavineHole(x, z)) continue
      if (Math.abs(h - elev) > 1) heights.set(key, elev)
    }
  }

  const columns: VoxelColumn[] = []
  const collision: VoxelBlock[] = []
  const size = MOUNTAIN.voxelSize

  for (const [key, layers] of heights) {
    if (layers <= 0) continue
    const [xs, zs] = key.split(',')
    const x = Number(xs)
    const z = Number(zs)
    const onTrail = isTrailCell(x, z)
    const kind = blockKindFor(x, z, layers, onTrail)

    columns.push({
      x,
      z,
      h: layers * size,
      kind,
      isGrassTop: kind === 'grass',
    })
    collision.push({
      x,
      y: 0,
      z,
      w: size,
      h: layers * size,
      d: size,
      color: kind,
    })
  }

  return { collision, columns }
}

const mountainData = buildMountainData()

export const MOUNTAIN_BLOCKS: VoxelBlock[] = mountainData.collision
export const MOUNTAIN_COLUMNS: VoxelColumn[] = mountainData.columns
export const MOUNTAIN_CELLS: VoxelColumn[] = mountainData.columns
