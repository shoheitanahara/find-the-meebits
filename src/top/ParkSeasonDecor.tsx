import { PalmTree } from '../world/PalmTree'
import type { ParkSeason } from './parkSeason'
import { PARK_HUB } from './parkLayout'

export type ParkTreePlacement = {
  position: [number, number, number]
  scale: number
  rotationY: number
  lean: number
}

/**
 * 左右並木の足元（夜仕様の Tree 用。季節デコでは置き換えない）。
 */
export const PARK_SIDE_TREE_XZ = [
  [-PARK_HUB.treeX, -12],
  [-PARK_HUB.treeX, -4],
  [-PARK_HUB.treeX, 4],
  [-PARK_HUB.treeX, 12],
  [PARK_HUB.treeX, -12],
  [PARK_HUB.treeX, 4],
  [PARK_HUB.treeX, -4],
  [PARK_HUB.treeX, 12],
] as const

/** 夏のみ: 島の外縁に椰子を置く */
function getSummerPerimeterPalms(): ParkTreePlacement[] {
  const count = 16
  const placements: ParkTreePlacement[] = []
  const { palmRadius, groundZ } = PARK_HUB

  for (let index = 0; index < count; index += 1) {
    const t = (index / count) * Math.PI * 2 + 0.2
    const radius = palmRadius + Math.sin(t * 3) * 0.9 + (index % 3) * 0.3
    const x = Math.cos(t) * radius
    const z = Math.sin(t) * radius + groundZ

    // 正面入口付近は空ける
    if (z > groundZ + 13 && Math.abs(x) < 14) continue

    placements.push({
      position: [x, 0, z],
      scale: 0.78 + (index % 4) * 0.07,
      rotationY: t + Math.PI / 2 + (index % 3) * 0.12,
      lean: 0.06 + (index % 3) * 0.035,
    })
  }

  return placements
}

/** 季節デコの配置。当たり判定や他モジュールからも参照できるよう export。 */
export function getParkSeasonTreePlacements(season: ParkSeason): ParkTreePlacement[] {
  if (season !== 'summer') return []
  return getSummerPerimeterPalms()
}

/**
 * Park 外周の季節デコ。
 * 夏は PalmTree を流用。左右の列木は触らない。
 */
export function ParkSeasonDecor({ season }: { season: ParkSeason }) {
  if (season !== 'summer') return null

  const placements = getParkSeasonTreePlacements(season)

  return (
    <group>
      {placements.map((placement, index) => (
        <PalmTree
          key={`palm-${index}-${placement.position.join(',')}`}
          position={placement.position}
          scale={placement.scale}
          rotationY={placement.rotationY}
          lean={placement.lean}
        />
      ))}
    </group>
  )
}
