/**
 * Park hub の水平レイアウト。
 * 移動範囲・柵・並木・島／海・地面サイズで同じ値を使い、見た目と当たりを揃える。
 */
export const PARK_HUB = {
  /** プレイヤー移動の半幅 */
  boundsX: 38,
  minZ: -17,
  maxZ: 17,
  /** 左右の柵中心 X（視覚メッシュと衝突を一致） */
  railingX: 37.2,
  railingHalfThickness: 0.22,
  railingZ: 1,
  railingHalfLength: 19.5,
  /** 中央通りの金縁 */
  pathEdgeX: 31.5,
  /** 並木の足元 X */
  treeX: 34.5,

  /**
   * 島・海・広場の同心レイヤー。
   * 柵の対角（≈42.5）より少し外側を島縁にし、内側へ広場を収める。
   * すべての地面メッシュは z = groundZ を中心にする。
   */
  groundZ: 1,
  islandRadius: 44,
  plazaRadius: 41.5,
  pathSizeX: 64,
  pathSizeZ: 46,
  paverWidth: 58,
  pathEdgeLength: 46,
  /** 夏の砂浜（角丸正方形 half。島半径とフラット辺を揃える） */
  shoreDryHalf: 44,
  shoreWetHalf: 48.5,
  shoreShallowHalf: 54,
  shoreDryCorner: 33,
  shoreWetCorner: 35,
  shoreShallowCorner: 37,
  /** 椰子の配置半径（乾いた砂の外側〜湿った砂） */
  palmRadius: 45.5,
  oceanPlane: 200,
} as const
