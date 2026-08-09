/**
 * 島内の小さなボクセル岩／小山。見た目と歩行ブロックを共有する。
 */

export type IslandRockSpot = {
  x: number
  z: number
  /** 歩行不可の円半径 */
  radius: number
  /** 見た目のバリエーション */
  kind: 'pebble' | 'boulder' | 'hill'
}

/** 岸・スタートを避けた内陸寄り。数は控えめ。 */
export const ISLAND_ROCKS: ReadonlyArray<IslandRockSpot> = [
  { x: -5.5, z: 1.5, radius: 0.7, kind: 'hill' },
  { x: 5.5, z: -1.5, radius: 0.55, kind: 'boulder' },
  { x: -3.5, z: -3.5, radius: 0.42, kind: 'pebble' },
  { x: 4.5, z: 3.5, radius: 0.48, kind: 'pebble' },
]

/** 点が岩の占有円内か（歩行判定用） */
export function hitsIslandRock(x: number, z: number, agentRadius: number) {
  const pad = Math.max(0.15, agentRadius * 0.55)
  for (const rock of ISLAND_ROCKS) {
    if (Math.hypot(x - rock.x, z - rock.z) < rock.radius + pad) return true
  }
  return false
}
