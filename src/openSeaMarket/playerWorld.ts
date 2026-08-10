type MarketPlayerWorld = {
  x: number
  z: number
  rotationY: number
  isMoving: boolean
  ready: boolean
}

export const openSeaMarketPlayerWorld: MarketPlayerWorld = {
  x: 0,
  z: 0,
  rotationY: 0,
  isMoving: false,
  ready: false,
}

/** 会話カメラ用 — walker が毎フレーム更新 */
export const marketNpcPositions = new Map<number, { x: number; z: number }>()

export function resetOpenSeaMarketPlayerWorld(x: number, z: number, rotationY: number) {
  openSeaMarketPlayerWorld.x = x
  openSeaMarketPlayerWorld.z = z
  openSeaMarketPlayerWorld.rotationY = rotationY
  openSeaMarketPlayerWorld.isMoving = false
  openSeaMarketPlayerWorld.ready = true
  marketNpcPositions.clear()
}

export function setOpenSeaMarketPlayerWorld(
  x: number,
  z: number,
  rotationY: number,
  isMoving: boolean,
) {
  openSeaMarketPlayerWorld.x = x
  openSeaMarketPlayerWorld.z = z
  openSeaMarketPlayerWorld.rotationY = rotationY
  openSeaMarketPlayerWorld.isMoving = isMoving
  openSeaMarketPlayerWorld.ready = true
}
