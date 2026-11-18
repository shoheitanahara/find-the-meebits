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

/** 木（大通り・小道を避けた位置） */
export const JUNGLE_TREE_XZ: ReadonlyArray<readonly [number, number]> = [
  [-20, 4.5],
  [-20, -2.5],
  [-12, -14.4],
  [10, -14.4],
  [19.5, -3.5],
  [19, 8],
  [-3.5, 9],
  [8, 12.5],
  [-20.5, 13],
  [13.5, 5.5],
]

/** 東西の大通り（z の中心と半幅）と、中央の南北の小道（x の中心と半幅） */
export const JUNGLE_PATHS = {
  mainZ: 1,
  mainHalf: 1.3,
  crossX: -1,
  crossHalf: 1.1,
} as const
