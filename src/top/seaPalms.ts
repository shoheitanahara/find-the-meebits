/**
 * シーエリアのヤシ配置（見た目＋衝突の trees 座標で共有）。
 * 西棟（Shore Fishing / -15.7,-11.5）・東棟（Sergito）に被らないよう離す。
 * 東の桟橋ゲート前も空ける。
 */
export type SeaPalmPlacement = {
  position: [number, number, number]
  scale: number
  rotationY: number
  lean: number
}

export const SEA_PALM_PLACEMENTS: readonly SeaPalmPlacement[] = [
  { position: [-17.5, 0, 9.2], scale: 0.88, rotationY: 0.55, lean: 0.09 },
  { position: [-19.2, 0, 3.4], scale: 0.82, rotationY: 1.1, lean: 0.07 },
  { position: [-12.5, 0, 10.8], scale: 0.84, rotationY: 1.6, lean: 0.1 },
  { position: [-3.4, 0, 11.2], scale: 0.8, rotationY: 2.1, lean: 0.08 },
  { position: [5.6, 0, 10.4], scale: 0.83, rotationY: 0.4, lean: 0.09 },
  { position: [16.5, 0, 8.8], scale: 0.85, rotationY: 0.2, lean: 0.08 },
  { position: [10.5, 0, 10.6], scale: 0.79, rotationY: 0.9, lean: 0.06 },
  { position: [3.2, 0, -15.2], scale: 0.86, rotationY: 3.8, lean: 0.07 },
] as const

/** 衝突用 (x, z) */
export const SEA_PALM_TREE_XZ: ReadonlyArray<readonly [number, number]> =
  SEA_PALM_PLACEMENTS.map((p) => [p.position[0], p.position[2]] as const)
