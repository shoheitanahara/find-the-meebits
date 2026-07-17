/** 白いプラザ外周のガラス壁（見た目・衝突の共通定義） */

export const PLAZA_HALF = 50

const WALL_HEIGHT = 3.6
const WALL_THICKNESS = 0.18
/** 通常の出入り口の幅 */
const OPENING_WIDTH = 5.2
/** 正面メイン入口の幅（ここだけガラスなし） */
const MAIN_ENTRANCE_WIDTH = 18

type Opening = { center: number; width: number }

/** 側面・奥：等間隔の小さな開口 */
const SIDE_OPENINGS: Opening[] = [-37.5, -22.5, -7.5, 7.5, 22.5, 37.5].map((center) => ({
  center,
  width: OPENING_WIDTH,
}))

/**
 * 正面（入口側）: 中央は広いメイン入口のみガラスなし。
 * 左右のガラスは残す。
 */
const SOUTH_OPENINGS: Opening[] = [
  { center: -37.5, width: OPENING_WIDTH },
  { center: -22.5, width: OPENING_WIDTH },
  { center: 0, width: MAIN_ENTRANCE_WIDTH },
  { center: 22.5, width: OPENING_WIDTH },
  { center: 37.5, width: OPENING_WIDTH },
]

export type PlazaGlassWallSegment = {
  position: [number, number, number]
  size: [number, number, number]
}

type EdgeId = 'north' | 'south' | 'west' | 'east'

function wallIntervalsAlongEdge(
  half: number,
  openings: Opening[],
): Array<{ start: number; end: number }> {
  const sorted = [...openings].sort((a, b) => a.center - b.center)
  const cuts: number[] = [-half]
  for (const opening of sorted) {
    cuts.push(opening.center - opening.width / 2)
    cuts.push(opening.center + opening.width / 2)
  }
  cuts.push(half)

  const walls: Array<{ start: number; end: number }> = []
  for (let i = 0; i < cuts.length - 1; i += 2) {
    const start = cuts[i]
    const end = cuts[i + 1]
    if (end - start > 0.35) {
      walls.push({ start, end })
    }
  }
  return walls
}

function segmentOnEdge(
  edge: EdgeId,
  start: number,
  end: number,
): PlazaGlassWallSegment {
  const mid = (start + end) / 2
  const length = end - start
  const y = WALL_HEIGHT / 2
  // 外壁面を白い床の外縁 (±PLAZA_HALF) に揃える
  const wallCenter = PLAZA_HALF - WALL_THICKNESS / 2

  switch (edge) {
    case 'north':
      return {
        position: [mid, y, -wallCenter],
        size: [length, WALL_HEIGHT, WALL_THICKNESS],
      }
    case 'south':
      return {
        position: [mid, y, wallCenter],
        size: [length, WALL_HEIGHT, WALL_THICKNESS],
      }
    case 'west':
      return {
        position: [-wallCenter, y, mid],
        size: [WALL_THICKNESS, WALL_HEIGHT, length],
      }
    case 'east':
      return {
        position: [wallCenter, y, mid],
        size: [WALL_THICKNESS, WALL_HEIGHT, length],
      }
  }
}

/** ガラス壁パネル（出入り口は含まない） */
export function getPlazaGlassWallSegments(): PlazaGlassWallSegment[] {
  const edgeOpenings: Record<EdgeId, Opening[]> = {
    north: SIDE_OPENINGS,
    south: SOUTH_OPENINGS,
    west: SIDE_OPENINGS,
    east: SIDE_OPENINGS,
  }

  return (Object.keys(edgeOpenings) as EdgeId[]).flatMap((edge) =>
    wallIntervalsAlongEdge(PLAZA_HALF, edgeOpenings[edge]).map(({ start, end }) =>
      segmentOnEdge(edge, start, end),
    ),
  )
}

/** 角の柱（壁のつなぎ目）。外壁面を床外縁に揃える */
export function getPlazaGlassCornerPosts(): PlazaGlassWallSegment[] {
  const post = 0.32
  const y = WALL_HEIGHT / 2
  const wallCenter = PLAZA_HALF - WALL_THICKNESS / 2
  const corners: Array<[number, number]> = [
    [-wallCenter, -wallCenter],
    [wallCenter, -wallCenter],
    [-wallCenter, wallCenter],
    [wallCenter, wallCenter],
  ]
  return corners.map(([x, z]) => ({
    position: [x, y, z],
    size: [post, WALL_HEIGHT, post],
  }))
}
