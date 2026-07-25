/**
 * シーエリアのヤシ配置（見た目＋衝突の trees 座標で共有）。
 * 旧夏パークの PalmTree を流用。東の桟橋ゲート前は空ける。
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
  { position: [-18.6, 0, -3.8], scale: 0.9, rotationY: 2.0, lean: 0.11 },
  { position: [-16.8, 0, -9.5], scale: 0.84, rotationY: 2.6, lean: 0.08 },
  { position: [-10.2, 0, -14.2], scale: 0.8, rotationY: 3.3, lean: 0.1 },
  { position: [-3.4, 0, -15.0], scale: 0.86, rotationY: 3.8, lean: 0.07 },
  { position: [5.6, 0, -14.6], scale: 0.83, rotationY: 4.4, lean: 0.09 },
  { position: [14.2, 0, -12.8], scale: 0.87, rotationY: 5.0, lean: 0.08 },
  { position: [17.8, 0, -6.2], scale: 0.81, rotationY: 5.5, lean: 0.12 },
  { position: [16.5, 0, 8.8], scale: 0.85, rotationY: 0.2, lean: 0.08 },
  { position: [10.5, 0, 10.6], scale: 0.79, rotationY: 0.9, lean: 0.06 },
  { position: [-6.5, 0, 11.0], scale: 0.84, rotationY: 1.6, lean: 0.1 },
] as const

/** 衝突用 (x, z) */
export const SEA_PALM_TREE_XZ: ReadonlyArray<readonly [number, number]> =
  SEA_PALM_PLACEMENTS.map((p) => [p.position[0], p.position[2]] as const)
