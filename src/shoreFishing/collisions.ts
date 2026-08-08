import { SHORE_FISHING } from './config'

/**
 * 楕円の孤島内に留める（パークの壁解決の簡易版）。
 */
export function resolveIslandMovement(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
) {
  const { walkHalfX, walkHalfZ } = SHORE_FISHING.island
  const radius = SHORE_FISHING.playerCollisionRadius

  const clampToIsland = (x: number, z: number) => {
    const nx = x / (walkHalfX - radius)
    const nz = z / (walkHalfZ - radius)
    const r = Math.hypot(nx, nz)
    if (r <= 1) return { x, z }
    const scale = 1 / r
    return {
      x: nx * scale * (walkHalfX - radius),
      z: nz * scale * (walkHalfZ - radius),
    }
  }

  // 軸分離で角抜けを抑える
  const xOnly = clampToIsland(toX, fromZ)
  const zOnly = clampToIsland(fromX, toZ)
  const both = clampToIsland(toX, toZ)

  // 両方同時が島内なら採用、ダメなら軸優先
  const bothR = Math.hypot(both.x / walkHalfX, both.z / walkHalfZ)
  if (bothR <= 1.001) return both
  if (Math.hypot(xOnly.x - fromX, xOnly.z - fromZ) > 1e-6) return xOnly
  return zOnly
}
