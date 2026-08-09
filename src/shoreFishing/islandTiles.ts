import { islandNormRadius, SHORE_FISHING } from './config'
import { hitsIslandRock } from './islandRocks'

/** 島ボクセルのタイル辺長（ワールドメートル） */
export const ISLAND_TILE = 1

export type IslandFloorKind = 'sand' | 'gravel' | 'dirt'

export type IslandTile = {
  /** タイル原点（床は [tx,tx+1)×[tz,tz+1) ） */
  tx: number
  tz: number
  kind: IslandFloorKind
}

function hash2(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return n - Math.floor(n)
}

/** タイル中心が楕円 footprint 内なら島タイル */
export function isIslandTile(tx: number, tz: number): boolean {
  const cx = (tx + 0.5) * ISLAND_TILE
  const cz = (tz + 0.5) * ISLAND_TILE
  return islandNormRadius(cx, cz) <= SHORE_FISHING.island.voxelNormMax
}

export function worldToTile(x: number, z: number): { tx: number; tz: number } {
  return {
    tx: Math.floor(x / ISLAND_TILE),
    tz: Math.floor(z / ISLAND_TILE),
  }
}

/** 4近傍に海があれば岸タイル */
export function isShoreTile(tx: number, tz: number): boolean {
  if (!isIslandTile(tx, tz)) return false
  return (
    !isIslandTile(tx + 1, tz) ||
    !isIslandTile(tx - 1, tz) ||
    !isIslandTile(tx, tz + 1) ||
    !isIslandTile(tx, tz - 1)
  )
}

/** タイルから海までのチェビシェフ距離（島外は 0） */
export function distToWater(tx: number, tz: number): number {
  if (!isIslandTile(tx, tz)) return 0
  for (let d = 1; d <= 6; d++) {
    for (let ox = -d; ox <= d; ox++) {
      for (let oz = -d; oz <= d; oz++) {
        if (Math.max(Math.abs(ox), Math.abs(oz)) !== d) continue
        if (!isIslandTile(tx + ox, tz + oz)) return d
      }
    }
  }
  return 99
}

function kindAt(tx: number, tz: number): IslandFloorKind {
  const d = distToWater(tx, tz)
  const n = hash2(tx, tz)
  // 最外〜その内側：砂利混じりの海岸
  if (d <= 1) {
    if (n < 0.35) return 'gravel'
    return 'sand'
  }
  if (d <= 2) {
    if (n < 0.2) return 'gravel'
    if (n < 0.35) return 'dirt'
    return 'sand'
  }
  // 内陸
  if (n < 0.12) return 'dirt'
  if (n < 0.2) return 'gravel'
  return 'sand'
}

let cachedTiles: IslandTile[] | null = null

/** 島の全タイル（描画・初期化用）。結果はキャッシュ。 */
export function getIslandTiles(): IslandTile[] {
  if (cachedTiles) return cachedTiles
  const { halfX, halfZ } = SHORE_FISHING.island
  const xMin = -Math.ceil(halfX) - 1
  const xMax = Math.ceil(halfX) + 1
  const zMin = -Math.ceil(halfZ) - 1
  const zMax = Math.ceil(halfZ) + 1
  const tiles: IslandTile[] = []
  for (let tx = xMin; tx <= xMax; tx++) {
    for (let tz = zMin; tz <= zMax; tz++) {
      if (!isIslandTile(tx, tz)) continue
      tiles.push({ tx, tz, kind: kindAt(tx, tz) })
    }
  }
  cachedTiles = tiles
  return tiles
}

/**
 * プレイヤー半径を考慮して立てるか。
 * 中心＋十字サンプルがすべて島タイル上であること。
 */
export function canStandOnIsland(x: number, z: number, radius = SHORE_FISHING.playerCollisionRadius) {
  const r = Math.max(0.2, radius * 0.72)
  const samples: Array<[number, number]> = [
    [0, 0],
    [r, 0],
    [-r, 0],
    [0, r],
    [0, -r],
  ]
  for (const [dx, dz] of samples) {
    const { tx, tz } = worldToTile(x + dx, z + dz)
    if (!isIslandTile(tx, tz)) return false
  }
  if (hitsIslandRock(x, z, radius)) return false
  return true
}

/** ワールド点が島タイル上か（浮き・影の押し出し用） */
export function isOnIslandFootprint(x: number, z: number) {
  const { tx, tz } = worldToTile(x, z)
  return isIslandTile(tx, tz)
}

/** 岸辺（キャスト可能帯）— ボクセル海岸の外側帯 */
export function isNearShore(x: number, z: number) {
  const { tx, tz } = worldToTile(x, z)
  if (!isIslandTile(tx, tz)) return false
  return distToWater(tx, tz) <= SHORE_FISHING.island.shoreDistMax
}

/** 海面（島タイルの外側） */
export function isInWater(x: number, z: number) {
  return !isOnIslandFootprint(x, z)
}

export function castLandingFrom(x: number, z: number, rotationY: number) {
  const d = SHORE_FISHING.castDistance
  let lx = x + Math.sin(rotationY) * d
  let lz = z + Math.cos(rotationY) * d
  if (!isInWater(lx, lz)) {
    const pushed = pushOutsideIsland(lx, lz, 0.85)
    lx = pushed.x
    lz = pushed.z
  }
  return { x: lx, y: SHORE_FISHING.castBobberY, z: lz }
}

/** 島外へ放射状に押し出す（着水・影用） */
export function pushOutsideIsland(x: number, z: number, margin = 1.15): { x: number; z: number } {
  let lx = x
  let lz = z
  if (!isOnIslandFootprint(lx, lz)) {
    // すでに海なら、島から少し離す余裕だけ見る
    return { x: lx, z: lz }
  }
  const len = Math.hypot(lx, lz) || 0.001
  let nx = lx / len
  let nz = lz / len
  // ステップで外へ
  for (let i = 0; i < 40; i++) {
    lx += nx * 0.35
    lz += nz * 0.35
    if (!isOnIslandFootprint(lx, lz)) {
      lx += nx * margin
      lz += nz * margin
      return { x: lx, z: lz }
    }
  }
  // フォールバック：楕円スケール
  const r = islandNormRadius(x, z) || 0.001
  const scale = (SHORE_FISHING.island.voxelNormMax + 0.28) / r
  return { x: x * scale, z: z * scale }
}
