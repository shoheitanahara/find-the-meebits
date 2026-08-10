import { OPEN_SEA_MARKET } from './config'

export type MarketPedestalPlacement = {
  x: number
  z: number
  /** モデル正面が入口（+Z）を向く yaw（通常 0） */
  rotationY: number
}

/**
 * 6列 × 5行 = 30。中央に広い縦通路（床ロゴ回避）。
 * 壁との余白を確保しつつ、内側の列間ピッチを部屋サイズから算出。
 */
function buildPedestalPlacements(): MarketPedestalPlacement[] {
  const cols = 6
  const rows = 5
  // 床ロゴ幅 8.5 を避ける
  const aisleGap = 7.5
  // 台座中心〜壁（手前は入口余白多め・やや奥寄り）
  const sideWallMargin = 5.8
  const zMarginFar = 5.8
  const zMarginNear = 10.8

  const outerMaxX = OPEN_SEA_MARKET.roomHalfX - sideWallMargin
  // 片側3列: aisleGap/2 + pitchX*0.5 + 2*pitchX
  const pitchX = (outerMaxX - aisleGap / 2) / 2.5

  const zMin = OPEN_SEA_MARKET.roomMinZ + zMarginFar
  const zMax = OPEN_SEA_MARKET.roomMaxZ - zMarginNear
  const pitchZ = rows <= 1 ? 0 : (zMax - zMin) / (rows - 1)
  const placements: MarketPedestalPlacement[] = []

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const side = col < 3 ? -1 : 1
      const colInSide = col < 3 ? col : col - 3
      const x =
        side *
        (aisleGap / 2 + pitchX * 0.5 + colInSide * pitchX)
      const z = zMin + row * pitchZ
      placements.push({
        x,
        z,
        rotationY: 0,
      })
    }
  }

  return placements
}

export const MARKET_PEDESTAL_PLACEMENTS: readonly MarketPedestalPlacement[] =
  buildPedestalPlacements()

if (MARKET_PEDESTAL_PLACEMENTS.length !== OPEN_SEA_MARKET.maxPedestals) {
  console.warn(
    `[OpenSeaMarket] pedestal count ${MARKET_PEDESTAL_PLACEMENTS.length} !== maxPedestals ${OPEN_SEA_MARKET.maxPedestals}`,
  )
}
