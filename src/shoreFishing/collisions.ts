import { SHORE_FISHING } from './config'
import { canStandOnIsland } from './islandTiles'

/**
 * ボクセル海岸線に沿って歩行をクランプする。
 * 斜め移動の角抜けは軸分離で抑える。
 */
export function resolveIslandMovement(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
) {
  const radius = SHORE_FISHING.playerCollisionRadius

  if (canStandOnIsland(toX, toZ, radius)) {
    return { x: toX, z: toZ }
  }

  const xOnly = { x: toX, z: fromZ }
  if (canStandOnIsland(xOnly.x, xOnly.z, radius)) {
    return xOnly
  }

  const zOnly = { x: fromX, z: toZ }
  if (canStandOnIsland(zOnly.x, zOnly.z, radius)) {
    return zOnly
  }

  // 両方ダメなら元位置（念のため元も検査）
  if (canStandOnIsland(fromX, fromZ, radius)) {
    return { x: fromX, z: fromZ }
  }

  // 開始位置が不正なら近傍の島タイルへ吸い寄せ
  return snapToNearestIsland(fromX, fromZ)
}

function snapToNearestIsland(x: number, z: number) {
  const radius = SHORE_FISHING.playerCollisionRadius
  if (canStandOnIsland(x, z, radius)) return { x, z }
  for (let ring = 1; ring <= 8; ring++) {
    for (let ox = -ring; ox <= ring; ox++) {
      for (let oz = -ring; oz <= ring; oz++) {
        if (Math.max(Math.abs(ox), Math.abs(oz)) !== ring) continue
        const nx = x + ox * 0.5
        const nz = z + oz * 0.5
        if (canStandOnIsland(nx, nz, radius)) return { x: nx, z: nz }
      }
    }
  }
  return { x: SHORE_FISHING.playerStart.x, z: SHORE_FISHING.playerStart.z }
}
