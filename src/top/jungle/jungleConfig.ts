/**
 * Jungle エリアの配置（群れの出発地点・木・道）。
 * 建物も柵もなく、ボクセルの動物がエリア全体を自由に歩き回る。
 *
 * 座標はワールド（このゾーン内）。groundZ = 1、外周の川の内縁は x ≈ ±22 / z ≈ -15。
 */

export type AnimalSpecies = 'pig' | 'cow' | 'sheep'

export type Herd = {
  id: string
  /** 群れのなわばり。地面の見た目（牧草 / 泥）だけに使い、出現位置はエリア全体からランダム */
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  animals: ReadonlyArray<{ species: AnimalSpecies; count: number }>
  /** 地面の見た目（牧草 / 泥まじり） */
  ground: 'pasture' | 'mud'
}

/** 種類と頭数。範囲は地面の見た目用（奥の左は牛の牧草、奥の右は羊の牧草、手前左は豚の泥浴び場） */
export const JUNGLE_HERDS: readonly Herd[] = [
  {
    id: 'cows',
    minX: -19,
    maxX: -5,
    minZ: -13,
    maxZ: -4,
    animals: [{ species: 'cow', count: 4 }],
    ground: 'pasture',
  },
  {
    id: 'sheep',
    minX: 3,
    maxX: 17,
    minZ: -13,
    maxZ: -4,
    animals: [{ species: 'sheep', count: 6 }],
    ground: 'pasture',
  },
  {
    id: 'pigs',
    minX: -16,
    maxX: -6,
    minZ: 5,
    maxZ: 12,
    animals: [{ species: 'pig', count: 5 }],
    ground: 'mud',
  },
]

/** 動物が歩き回れる範囲（外周の川・門の手前まで） */
export const JUNGLE_ROAM_BOUNDS = {
  minX: -20.5,
  maxX: 20.5,
  minZ: -13.8,
  maxZ: 14.5,
} as const

/** 東西の大通り（z の中心と半幅）と、中央の南北の小道（x の中心と半幅） */
export const JUNGLE_PATHS = {
  mainZ: 1,
  mainHalf: 1.3,
  crossX: -1,
  crossHalf: 1.1,
} as const

/** 街灯の位置（parkZones の jungle.lamps と同じ）。木はここを避ける */
export const JUNGLE_LAMP_XZ: ReadonlyArray<readonly [number, number]> = [
  [-9, -1.5],
  [9, -1.5],
  [-9, 3.5],
  [9, 3.5],
]

function hash2(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return n - Math.floor(n)
}

/** 0〜1 の滑らかな値ノイズ（木立のかたまりを作る） */
function valueNoise(x: number, z: number) {
  const x0 = Math.floor(x)
  const z0 = Math.floor(z)
  const fx = x - x0
  const fz = z - z0
  const sx = fx * fx * (3 - 2 * fx)
  const sz = fz * fz * (3 - 2 * fz)
  const a = hash2(x0, z0)
  const b = hash2(x0 + 1, z0)
  const c = hash2(x0, z0 + 1)
  const d = hash2(x0 + 1, z0 + 1)
  return (a * (1 - sx) + b * sx) * (1 - sz) + (c * (1 - sx) + d * sx) * sz
}

/** 針葉樹にするか（8割）。位置から決めるので毎回同じ */
export function isJungleConifer(x: number, z: number) {
  return hash2(x * 3.1 + 7, z * 2.3 - 5) < 0.8
}

/**
 * 森の木の配置。ノイズで木立と開けた草地を作り、外周寄りは密な森の壁にする。
 * 大通り・小道・街灯・東門の到着地点のまわりは空ける。
 */
function buildJungleTrees(): Array<readonly [number, number]> {
  const STEP = 2.5
  const MIN_GAP = 4.4
  const trees: Array<[number, number]> = []
  for (let gx = -20.5; gx <= 20.5; gx += STEP) {
    for (let gz = -13.5; gz <= 14.5; gz += STEP) {
      const x = gx + (hash2(gx, gz) - 0.5) * 1.6
      const z = gz + (hash2(gx + 13, gz - 7) - 0.5) * 1.6
      // 外周の川（東西 |x| > 21.2・奥 z < -14.1）から幹と枝の分だけ離す
      if (Math.abs(x) > 20.0 || z < -12.9 || z > 14.6) continue
      // 道（大通り・小道）から幹の半径ぶん以上離す
      if (Math.abs(z - JUNGLE_PATHS.mainZ) < JUNGLE_PATHS.mainHalf + 1.4) continue
      if (Math.abs(x - JUNGLE_PATHS.crossX) < JUNGLE_PATHS.crossHalf + 1.4) continue
      // 東門から入ってすぐの場所は空ける
      if (x > 15 && Math.abs(z - JUNGLE_PATHS.mainZ) < 5.5) continue
      if (JUNGLE_LAMP_XZ.some(([lx, lz]) => Math.hypot(x - lx, z - lz) < 1.8)) continue
      // 外周寄りは密、中ほどは木立と草地のまだら
      const edge = Math.abs(x) > 16 || z < -9.5 || z > 11
      const noise = valueNoise(x * 0.14 + 3, z * 0.14 - 8)
      if (noise < (edge ? 0.42 : 0.66)) continue
      if (trees.some(([tx, tz]) => Math.hypot(tx - x, tz - z) < MIN_GAP)) continue
      trees.push([Math.round(x * 10) / 10, Math.round(z * 10) / 10])
    }
  }
  return trees
}

/** 木（自動配置。parkZones の jungle.trees と当たり判定で使う） */
export const JUNGLE_TREE_XZ: ReadonlyArray<readonly [number, number]> = buildJungleTrees()
