/**
 * Mountain Climb — ステージ単位でボクセル山を生成。
 * 視点は固定。WASD は移動のみ。段差は最大 +1（ジャンプで越える）。
 */

import {
  getStageDef,
  type MountainStageDef,
  MOUNTAIN_STAGE_COUNT,
} from './stages'

export { MOUNTAIN_STAGE_COUNT, getStageDef, MOUNTAIN_STAGES, clampStageId } from './stages'
export type { MountainStageDef } from './stages'

/** 物理・カメラ定数（全ステージ共通） */
export const MOUNTAIN = {
  moveSpeed: 5.4,
  dashMultiplier: 1.45,
  jumpSpeed: 9.6,
  gravity: 26,
  playerRadius: 0.34,
  playerHeight: 1.55,
  camBack: 8.5,
  camHeight: 5.2,
  camLookAhead: 5.5,
  /** 1 = アバターを画面中央に固定（左右移動でカメラも追従） */
  camXFollow: 1,
  goalRadius: 2.8,
  dashOuterThreshold: 0.82,
  voxelSize: 1,
  fallY: -1.5,
  /** 頂点（zEnd）から奥へ続く平台の長さ */
  summitPlateau: 10,
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
  isGrassTop?: boolean
}

type LaneId = 'L' | 'C' | 'R'
type Waypoint = { z: number; x: number }

type Ravine = {
  zLo: number
  zHi: number
  cut: 'full' | 'lane'
  lanes?: readonly LaneId[]
  stones?: ReadonlyArray<{ lane: LaneId; xOff: number; z: number }>
}

export type MountainStageRuntime = {
  stageId: number
  def: MountainStageDef
  start: { x: number; y: number; z: number }
  goalY: number
  goalZ: number
  goalRadius: number
  columns: VoxelColumn[]
  blocks: VoxelBlock[]
  pathCenterX: (z: number) => number
  pathLaneCenters: (z: number) => number[]
  version: number
}

function hashSeed(seed: number, a: number, b = 0) {
  const n = Math.sin(seed * 12.9898 + a * 78.233 + b * 37.719) * 43758.5453
  return n - Math.floor(n)
}

function lerpWaypoints(pts: readonly Waypoint[], z: number): number {
  if (pts.length === 0) return 0
  if (z >= pts[0].z) return pts[0].x
  if (z <= pts[pts.length - 1].z) return pts[pts.length - 1].x
  for (let i = 0; i < pts.length - 1; i += 1) {
    const a = pts[i]
    const b = pts[i + 1]
    if (z <= a.z && z >= b.z) {
      const t = (a.z - z) / Math.max(1e-6, a.z - b.z)
      return a.x + (b.x - a.x) * t
    }
  }
  return 0
}

/** 蛇行レーン — 不等間隔・左右非対称・多周波で整ったS字を崩す */
function generateLaneWays(def: MountainStageDef): Record<LaneId, Waypoint[]> {
  const { zStart, zEnd, windAmplitude, windFrequency, seed } = def
  const span = zStart - zEnd
  const steps = Math.max(10, Math.round(10 + windFrequency * 7))
  const center: Waypoint[] = []
  const left: Waypoint[] = []
  const right: Waypoint[] = []

  let zCursor = zStart
  for (let i = 0; i <= steps; i += 1) {
    const tBase = i / steps
    const tJitter = (hashSeed(seed, i, 40) - 0.5) * 0.04
    const t = Math.min(1, Math.max(0, tBase + tJitter))
    if (i === 0) zCursor = zStart
    else if (i === steps) zCursor = zEnd
    else {
      const stepFrac = (1 / steps) * (0.55 + hashSeed(seed, i, 41) * 0.9)
      zCursor = Math.round(zStart - span * Math.min(0.98, tBase + stepFrac * 0.35))
      const prevZ = center[center.length - 1]?.z ?? zStart
      zCursor = Math.min(prevZ - 1, Math.max(zEnd + 2, zCursor))
    }
    const z = zCursor
    const taper = t < 0.07 ? t / 0.07 : t > 0.88 ? (1 - t) / 0.12 : 1
    const wave =
      Math.sin(t * Math.PI * (1.1 + windFrequency * 2.2) + seed * 0.01) * windAmplitude * taper +
      Math.sin(t * Math.PI * (3.4 + windFrequency) + seed * 0.17) * windAmplitude * 0.38 * taper +
      Math.sin(t * Math.PI * 7.2 + seed * 0.31) * windAmplitude * 0.18 * taper
    const kick = (hashSeed(seed, i, 42) - 0.5) * windAmplitude * 0.55 * taper
    const cx = wave + kick
    const baseSpread = 4.6 + windAmplitude * 0.4
    const spreadL = baseSpread * (0.75 + hashSeed(seed, i, 43) * 0.55)
    const spreadR = baseSpread * (0.75 + hashSeed(seed, i, 44) * 0.55)
    center.push({ z, x: cx })
    left.push({ z, x: cx - spreadL })
    right.push({ z, x: cx + spreadR })
  }

  center[0] = { z: zStart, x: 0 }
  left[0] = { z: zStart, x: 0 }
  right[0] = { z: zStart, x: 0 }
  const last = center.length - 1
  const convergeFrom = Math.max(1, last - 2)
  for (let i = convergeFrom; i <= last; i += 1) {
    const u = (i - convergeFrom) / Math.max(1, last - convergeFrom)
    const ease = u * u
    center[i] = { z: center[i].z, x: center[i].x * (1 - ease) }
    left[i] = { z: left[i].z, x: center[i].x - 2.2 * (1 - ease * 0.35) }
    right[i] = { z: right[i].z, x: center[i].x + 2.2 * (1 - ease * 0.35) }
  }
  center[last] = { z: zEnd, x: 0 }
  left[last] = { z: zEnd, x: -2.2 }
  right[last] = { z: zEnd, x: 2.2 }

  return { L: left, C: center, R: right }
}

/** 裂け目生成。水平ギャップは最大3。レーン単位の欠き／横断あり */
function generateRavines(def: MountainStageDef): Ravine[] {
  const { zStart, zEnd, ravineCount, fullRatio, seed } = def
  const ravines: Ravine[] = []
  const playLo = zEnd + 10
  const playHi = zStart - 10
  const span = Math.max(1, playHi - playLo)
  const maxFullWidth = 3

  const minEdgeGap = 3
  const tooClose = (zLo: number, zHi: number) =>
    ravines.some((r) => !(zHi < r.zLo - minEdgeGap || zLo > r.zHi + minEdgeGap))

  const pushRavine = (mid: number, i: number, forceFull?: boolean) => {
    const lateBias = mid < playLo + span * 0.45
    const isFull =
      forceFull === true ||
      hashSeed(seed, i, 2) < (lateBias ? Math.min(0.92, fullRatio + 0.18) : fullRatio)
    const gap = isFull ? 1 + Math.floor(hashSeed(seed, i, 3) * maxFullWidth) : 1
    const zLo = mid - (gap - 1)
    const zHi = mid
    if (zHi >= playHi - 1 || zLo <= playLo + 1) return
    if (tooClose(zLo, zHi)) return

    if (isFull) {
      const stones: Array<{ lane: LaneId; xOff: number; z: number }> = []
      if (def.id <= 2 && gap >= 3) {
        stones.push({
          lane: 'C',
          xOff: 0,
          z: zLo + Math.floor((gap - 1) / 2),
        })
      }
      ravines.push({ zLo, zHi, cut: 'full', stones })
    } else {
      const lanePick = hashSeed(seed, i, 5)
      const cutLanes: LaneId[] =
        lanePick < 0.32
          ? ['C']
          : lanePick < 0.52
            ? ['L']
            : lanePick < 0.72
              ? ['R']
              : lanePick < 0.86
                ? ['L', 'C']
                : ['C', 'R']
      ravines.push({ zLo, zHi, cut: 'lane', lanes: cutLanes })
    }
  }

  for (let i = 0; i < ravineCount; i += 1) {
    const u = (i + 0.5) / ravineCount
    const jitter = (hashSeed(seed, i, 1) - 0.5) * (span / ravineCount) * 1.2
    const mid = Math.round(playHi - u * span + jitter)
    pushRavine(mid, i)
  }

  const finaleCount = 1 + Math.floor(def.id * 0.2)
  const finaleHi = playLo + Math.floor(span * 0.4)
  for (let f = 0; f < finaleCount; f += 1) {
    const u = (f + 0.5) / finaleCount
    const mid = Math.round(finaleHi - u * (finaleHi - playLo - 4))
    pushRavine(mid, 200 + f, def.id >= 3)
  }

  return ravines
}

/**
 * トレイル標高 — 序盤〜終盤まで均等に登る（後半だけ急勾配にしない）。
 * 頂点（zEnd）から奥は goalElev の平台。
 */
function buildTrailElevByZ(
  def: MountainStageDef,
  ravinesAt: (z: number) => Ravine[],
  terrainEnd: number,
): Map<number, number> {
  const map = new Map<number, number>()
  const padStart = def.zStart - 3
  const rise = def.goalElev - def.startElev
  const climbSpan = Math.max(1, padStart - def.zEnd)

  let elev = def.startElev
  for (let z = def.zStart; z >= def.zEnd; z -= 1) {
    if (z >= padStart) {
      elev = def.startElev
      map.set(z, elev)
      continue
    }

    if (ravinesAt(z).some((r) => r.cut === 'full')) {
      map.set(z, elev)
      continue
    }

    const progress = (padStart - z) / climbSpan
    const ideal = def.startElev + rise * Math.min(1, progress)
    const roll = hashSeed(def.seed, z + 900, 7)

    // ideal に追従。遅れれば登り、追いついていれば短い平坦を挟む
    if (elev < def.goalElev && ideal >= elev + 0.9) {
      elev += 1
    } else if (elev < def.goalElev && ideal - elev >= 0.35 && roll < 0.55) {
      elev += 1
    }

    if (elev > def.goalElev) elev = def.goalElev
    map.set(z, elev)
  }

  // +1 制約と、頂点到達の保証（しわ寄せで後半だけ急にしないよう全程で均す）
  {
    let prev = map.get(def.zStart) ?? def.startElev
    for (let z = def.zStart - 1; z >= def.zEnd; z -= 1) {
      let cur = map.get(z) ?? prev
      if (cur > prev + 1) cur = prev + 1
      map.set(z, cur)
      prev = cur
    }

    const summit = map.get(def.zEnd) ?? def.startElev
    if (summit < def.goalElev) {
      // 不足分をコース全体へ再配分（頂点直前に押し込めない）
      const deficit = def.goalElev - summit
      const climbZs: number[] = []
      for (let z = padStart - 1; z >= def.zEnd; z -= 1) {
        if (!ravinesAt(z).some((r) => r.cut === 'full')) climbZs.push(z)
      }
      for (let i = 0; i < deficit; i += 1) {
        const idx = Math.floor(((i + 0.5) / deficit) * climbZs.length)
        const z = climbZs[Math.min(climbZs.length - 1, idx)]
        if (z === undefined) break
        const behind = map.get(z + 1) ?? def.startElev
        const cur = map.get(z) ?? behind
        if (cur <= behind) map.set(z, Math.min(def.goalElev, behind + 1))
      }
      // 再配分後もう一度 +1 で前方へ伝播
      prev = map.get(def.zStart) ?? def.startElev
      for (let z = def.zStart - 1; z >= def.zEnd; z -= 1) {
        let cur = map.get(z) ?? prev
        if (cur > prev + 1) cur = prev + 1
        map.set(z, cur)
        prev = cur
      }
      // それでも足りなければ手前から最短の +1 勾配（最終手段）
      if ((map.get(def.zEnd) ?? 0) < def.goalElev) {
        const d = def.goalElev - (map.get(def.zEnd) ?? 0)
        for (let i = 0; i <= d; i += 1) {
          const z = def.zEnd + i
          if (z > def.zStart) break
          map.set(z, Math.max(map.get(z) ?? 0, def.goalElev - i))
        }
        for (let z = def.zEnd + 1; z <= def.zStart; z += 1) {
          const toward = map.get(z - 1) ?? def.startElev
          const cur = map.get(z) ?? def.startElev
          if (toward > cur + 1) map.set(z, toward - 1)
        }
      }
    }
  }

  // 頂点平台（奥へ続く）
  for (let z = def.zEnd; z >= terrainEnd; z -= 1) {
    map.set(z, def.goalElev)
  }

  return map
}

function hash2(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function buildStageMountainData(def: MountainStageDef): Omit<MountainStageRuntime, 'version'> {
  const laneWays = generateLaneWays(def)
  const ravines = generateRavines(def)
  const goalZ = def.zEnd
  const terrainEnd = def.zEnd - MOUNTAIN.summitPlateau

  const ravinesAt = (z: number) => ravines.filter((r) => z >= r.zLo && z <= r.zHi)
  const trailElevByZ = buildTrailElevByZ(def, ravinesAt, terrainEnd)
  const trailElev = (z: number) => trailElevByZ.get(z) ?? def.startElev

  const laneX = (lane: LaneId, z: number) => {
    if (z <= def.zEnd) {
      if (lane === 'L') return -2.2
      if (lane === 'R') return 2.2
      return 0
    }
    return lerpWaypoints(laneWays[lane], z)
  }
  const pathLaneCenters = (z: number) => (['L', 'C', 'R'] as const).map((id) => laneX(id, z))
  const pathCenterX = (z: number) => {
    const xs = pathLaneCenters(z)
    return xs.reduce((a, b) => a + b, 0) / xs.length
  }

  const shelfBounds = (z: number) => {
    const xs = [...pathLaneCenters(z), ...pathLaneCenters(z + 1), ...pathLaneCenters(z - 1)]
    const pad = def.shelfPad
    return { lo: Math.min(...xs) - pad, hi: Math.max(...xs) + pad }
  }

  const isOnShelf = (x: number, z: number) => {
    const { lo, hi } = shelfBounds(z)
    return x >= lo && x <= hi
  }

  const nearestLaneDist = (x: number, z: number) => {
    let best = Infinity
    for (const cx of pathLaneCenters(z)) best = Math.min(best, Math.abs(x - cx))
    for (const cx of pathLaneCenters(z + 1)) best = Math.min(best, Math.abs(x - cx))
    for (const cx of pathLaneCenters(z - 1)) best = Math.min(best, Math.abs(x - cx))
    return best
  }

  const isTrailCell = (x: number, z: number) => nearestLaneDist(x, z) <= 1.05

  const isRavineHole = (x: number, z: number) => {
    if (!isOnShelf(x, z)) return false
    for (const ravine of ravinesAt(z)) {
      if (ravine.cut === 'full') return true
      for (const lane of ravine.lanes ?? []) {
        if (Math.abs(x - laneX(lane, z)) <= 1.2) return true
      }
    }
    return false
  }

  const isCliffNotch = (x: number, z: number) => {
    if (!isOnShelf(x, z)) return false
    if (nearestLaneDist(x, z) <= 0.72) return false
    const { lo, hi } = shelfBounds(z)
    const edge = Math.min(x - lo, hi - x) <= 1.15
    const betweenLanes = nearestLaneDist(x, z) > 1.15
    const lateBoost = z < def.zStart - (def.zStart - def.zEnd) * 0.5 ? 0.14 : 0
    const chance = edge
      ? def.cliffNotchChance + 0.12 + lateBoost
      : betweenLanes
        ? def.cliffNotchChance * 0.85 + lateBoost
        : def.cliffNotchChance * 0.35 + lateBoost * 0.5
    return hash2(x, z) < chance
  }

  const heightAt = (x: number, z: number): number => {
    const elev = trailElev(z)
    const ridge = pathCenterX(z)
    const distRidge = Math.abs(x - ridge)
    const n0 = hash2(Math.floor(x), Math.floor(z))
    const n1 = hash2(Math.floor(x) + 3, Math.floor(z) - 5)

    if (z <= goalZ && z >= terrainEnd && Math.abs(x) <= 5) {
      return Math.max(elev, def.goalElev)
    }

    if (isRavineHole(x, z) || isCliffNotch(x, z)) return 0

    const jagged = Math.floor(n0 * 5) - 2 + Math.floor(n1 * 3) - 1
    let mountain =
      elev + 6 + jagged - Math.floor(distRidge * (0.95 + n1 * 0.55)) - Math.floor(distRidge * distRidge * 0.035)
    if (mountain < 2 && distRidge < 26) {
      mountain = Math.max(0, 2 - Math.floor((distRidge - 12) * 0.7) + Math.max(0, jagged))
    }
    mountain = Math.max(0, mountain)

    if (isOnShelf(x, z)) {
      const laneDist = nearestLaneDist(x, z)
      if (laneDist <= 1.05) return elev
      const mid = hash2(x * 2, z)
      if (mid < 0.28) return 0
      if (mid < 0.55) return Math.max(0, elev - 1 - Math.floor(mid * 3))
      if (mid < 0.72) return Math.max(1, elev - 1)
      return elev
    }

    const { lo, hi } = shelfBounds(z)
    const distOut = x < lo ? lo - x : x - hi
    if (distOut <= 5) {
      const cliff =
        elev -
        Math.floor(distOut * (2.4 + n0 * 1.2)) -
        Math.floor(n1 * 4) -
        (n0 > 0.7 ? 2 : 0)
      return Math.max(0, Math.min(mountain, Math.max(cliff, 0)))
    }

    return mountain
  }

  const blockKindFor = (x: number, z: number, h: number, _onTrail: boolean): BlockKind => {
    const snowLine = def.goalElev - 8
    const rise = Math.max(1, def.goalElev - def.startElev)
    const t = Math.min(1, Math.max(0, (h - def.startElev) / rise))
    const n = hash2(x, z)
    const n2 = hash2(x - 11, z + 5)

    // 下層は草・土多め。上に行くほど石・雪の傾向
    if (h >= snowLine) {
      if (n < 0.22) return 'stone'
      if (n < 0.32) return 'darkStone'
      return 'snow'
    }
    if (h <= def.startElev + 1 && (Math.abs(x) > 6 || z > def.zStart - 8)) {
      if (n < 0.45) return 'grass'
      if (n < 0.7) return 'sand'
      return 'dirt'
    }
    if (t >= 0.7) {
      if (n < 0.12) return 'snow'
      if (n < 0.4) return 'darkStone'
      if (n < 0.55) return 'gravel'
      if (n < 0.7) return 'dirt'
      return 'stone'
    }
    if (t >= 0.45) {
      // 中腹上: 土〜暗石
      if (n < 0.12) return 'stone'
      if (n < 0.35) return 'dirt'
      if (n < 0.48) return 'grass'
      if (n < 0.6) return 'gravel'
      return 'darkStone'
    }
    if (t >= 0.22) {
      // 中腹下: 土・草が主
      if (n < 0.55) return 'dirt'
      if (n < 0.82) return 'grass'
      if (n < 0.92) return 'gravel'
      return n2 < 0.5 ? 'darkStone' : 'dirt'
    }
    // 低所: ほぼ草、あとは土・少し砂
    if (h <= def.startElev + 2 && nearestLaneDist(x, z) > 3) {
      if (n < 0.55) return 'grass'
      if (n < 0.8) return 'sand'
      return 'dirt'
    }
    if (n < 0.72) return 'grass'
    if (n < 0.92) return 'dirt'
    return 'sand'
  }

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

  for (let z = def.zStart; z >= terrainEnd; z -= 1) {
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
    for (let z = def.zStart - 4; z <= def.zStart - 1; z += 1) {
      setHeight(x, z, def.startElev)
    }
  }

  for (const ravine of ravines) {
    const rimElev = trailElev(ravine.zHi + 1)
    for (const stone of ravine.stones ?? []) {
      const x = Math.round(laneX(stone.lane, stone.z) + stone.xOff)
      heights.set(`${x},${stone.z}`, rimElev)
    }
  }

  for (let z = def.zStart - 8; z >= def.zEnd + 5; z -= 1) {
    if (z <= goalZ + 16) continue
    if (hashSeed(def.seed, z, 50) > 0.55) continue
    const ridge = pathCenterX(z)
    const peak = trailElev(z) + 8 + Math.floor(hashSeed(def.seed, z, 51) * 10)
    const side = hashSeed(def.seed, z, 52) > 0.5 ? 1 : -1
    const dist = 11 + Math.floor(hashSeed(def.seed, z, 53) * 9)
    setHeight(Math.round(ridge + side * dist), z, Math.max(3, peak - Math.floor(hashSeed(def.seed, z, 54) * 5)))
    if (hashSeed(def.seed, z, 55) < 0.4) {
      setHeight(
        Math.round(ridge - side * (dist - 2)),
        z,
        Math.max(2, peak - 6 - Math.floor(hashSeed(def.seed, z, 56) * 4)),
      )
    }
  }

  // レーン中心の段差を +1 に矯正
  for (let z = def.zStart - 1; z >= terrainEnd; z -= 1) {
    const elev = trailElev(z)
    for (let lane = 0; lane < 3; lane += 1) {
      const x = Math.round(pathLaneCenters(z)[lane])
      const key = `${x},${z}`
      const h = heights.get(key)
      if (h === undefined || h <= 0) continue
      if (isRavineHole(x, z)) continue
      let next = Math.abs(h - elev) > 1 ? elev : h
      const prevX = Math.round(pathLaneCenters(z + 1)[lane])
      const prevH = heights.get(`${prevX},${z + 1}`)
      if (prevH !== undefined && prevH > 0 && next > prevH + 1) next = prevH + 1
      if (next !== h) heights.set(key, next)
    }
  }

  // 頂点平台（奥へ約10ブロック）
  for (let z = goalZ; z >= terrainEnd; z -= 1) {
    for (let x = -5; x <= 5; x += 1) {
      heights.set(`${x},${z}`, def.goalElev)
    }
  }

  const columns: VoxelColumn[] = []
  const blocks: VoxelBlock[] = []
  const size = MOUNTAIN.voxelSize

  for (const [key, layers] of heights) {
    if (layers <= 0) continue
    const [xs, zs] = key.split(',')
    const x = Number(xs)
    const z = Number(zs)
    const onTrail = isTrailCell(x, z) || (z <= goalZ && z >= terrainEnd && Math.abs(x) <= 5)
    const kind = blockKindFor(x, z, layers, onTrail)
    columns.push({
      x,
      z,
      h: layers * size,
      kind,
      isGrassTop: kind === 'grass',
    })
    blocks.push({
      x,
      y: 0,
      z,
      w: size,
      h: layers * size,
      d: size,
      color: kind,
    })
  }

  const startY = def.startElev + 0.05

  return {
    stageId: def.id,
    def,
    start: { x: 0, y: startY, z: def.zStart - 2 },
    goalY: def.goalElev,
    goalZ,
    goalRadius: MOUNTAIN.goalRadius,
    columns,
    blocks,
    pathCenterX,
    pathLaneCenters,
  }
}

let versionCounter = 0
let activeRuntime: MountainStageRuntime = {
  ...buildStageMountainData(getStageDef(1)),
  version: ++versionCounter,
}

/** ステージ地形を差し替える（描画・衝突が追従） */
export function loadMountainStage(stageId: number): MountainStageRuntime {
  const def = getStageDef(stageId)
  activeRuntime = {
    ...buildStageMountainData(def),
    version: ++versionCounter,
  }
  MOUNTAIN_BLOCKS = activeRuntime.blocks
  MOUNTAIN_COLUMNS = activeRuntime.columns
  MOUNTAIN_CELLS = activeRuntime.columns
  return activeRuntime
}

export function getMountainRuntime(): MountainStageRuntime {
  return activeRuntime
}

export function pathCenterX(z: number) {
  return activeRuntime.pathCenterX(z)
}

export function pathLaneCenters(z: number) {
  return activeRuntime.pathLaneCenters(z)
}

export function getMountainBlocks(): VoxelBlock[] {
  return activeRuntime.blocks
}

export function getMountainColumns(): VoxelColumn[] {
  return activeRuntime.columns
}

/** レガシー参照用（loadMountainStage で差し替え） */
export let MOUNTAIN_BLOCKS: VoxelBlock[] = activeRuntime.blocks
export let MOUNTAIN_COLUMNS: VoxelColumn[] = activeRuntime.columns
export let MOUNTAIN_CELLS: VoxelColumn[] = activeRuntime.columns
