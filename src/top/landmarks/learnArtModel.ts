/**
 * Learn Art — 白い箱をずらして積んだ現代美術館。
 * 入口両脇に小さな絵、屋根の縁に原色キューブ、建物の横にイーゼルに載った大きな絵。
 */
import { VoxelBuilder, type VoxelModel } from '../voxel/voxelBuilder'
import {
  addEntrance,
  addFrontFrame,
  addPlinth,
  bodyBox,
  iconBesideEntrance,
  LANDMARK_LAYOUT,
  type LandmarkEntrance,
} from './landmarkParts'

const COLORS = {
  plinth: '#1a1222',
  wall: '#e2dcec',
  wallUpper: '#f2eef8',
  trim: '#2a1c38',
  frameDark: '#1c1424',
  gold: '#c9a24a',
  goldDark: '#6e5628',
  wood: '#8a5a34',
  canvas: '#f6f2ea',
  neon: '#e85cff',
  bulb: '#ffe0a8',
  red: '#e63946',
  yellow: '#ffd23f',
  blue: '#2f6bff',
} as const

const TIER1_TOP_Y = 3.25

/** 2段目の箱（少し右・奥にずらして載せる） */
const TIER2 = {
  center: [0.3, 4.075, -0.35],
  size: [5.0, 1.65, 5.1],
} as const
const TIER2_FRONT_Z = TIER2.center[2] + TIER2.size[2] / 2
const TIER2_TOP_Y = TIER2.center[1] + TIER2.size[1] / 2

/** イーゼル彫刻の位置（説明看板の反対側＝左）。当たり判定は topConfig が参照 */
export const LEARN_ART_ICON = iconBesideEntrance(-1, 1.6, 0.7)

/** イーゼルの大きな抽象画（原色の格子） */
const COMPOSITION_ROWS = [
  'RRRRKWWWWKYYY',
  'RRRRKWWWWKYYY',
  'RRRRKWWWWKYYY',
  'KKKKKKKKKKKKK',
  'WWWWKBBBBKWWW',
  'WWWWKBBBBKWWW',
  'KKKKKBBBBKKKK',
  'YYWWKBBBBKWRR',
] as const
const COMPOSITION_CELL = 0.19

const HEART_ROWS = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'] as const
const SUNSET_ROWS = ['PPPPPPP', 'PPPOPPP', 'PPOOOPP', 'POOOOOP', 'BBBBBBB', 'BWBBWBB'] as const
const SMALL_ART_CELL = 0.15
const SMALL_CANVAS = { width: 1.2, height: 1.1 } as const

type SmallArt = 'heart' | 'sunset'

function addSmallPainting(b: VoxelBuilder, x: number, y: number, art: SmallArt) {
  const z = LANDMARK_LAYOUT.bodyFrontZ
  b.box([x, y, z + 0.025], [SMALL_CANVAS.width, SMALL_CANVAS.height, 0.05], COLORS.canvas)
  addFrontFrame(b, [x, y, z], SMALL_CANVAS.width, SMALL_CANVAS.height, 0.08, COLORS.frameDark)
  b.pixels({
    rows: art === 'heart' ? HEART_ROWS : SUNSET_ROWS,
    palette:
      art === 'heart'
        ? { X: '#ff4fa3' }
        : { P: '#5a2d82', O: '#ff9a3c', B: COLORS.blue, W: '#bcd4ff' },
    center: [x, y, z + 0.05],
    cell: SMALL_ART_CELL,
    depth: 0.04,
    glow: true,
  })
}

/** 入口両脇の小さな絵（上下2段） */
function addGalleryFront(b: VoxelBuilder) {
  const x = 2.3
  addSmallPainting(b, -x, 1.05, 'heart')
  addSmallPainting(b, -x, 2.5, 'sunset')
  addSmallPainting(b, x, 1.05, 'sunset')
  addSmallPainting(b, x, 2.5, 'heart')
}

/** 側面の色面パネル（壁そのものを作品に） */
function addSidePanels(b: VoxelBuilder) {
  const x = LANDMARK_LAYOUT.bodyHalfWidth + 0.03
  b.box([x, 1.75, 1.0], [0.06, 2.0, 1.8], COLORS.yellow)
  b.box([x, 1.25, -1.5], [0.06, 1.0, 1.4], COLORS.blue)
  b.box([-x, 1.75, -0.8], [0.06, 2.0, 1.8], COLORS.red)
  b.box([-x, 2.3, 1.4], [0.06, 0.9, 0.9], COLORS.yellow)
}

/** 2段目の屋根の縁: 原色キューブとエリアカラーのネオン */
function addRoofline(b: VoxelBuilder) {
  const cubeZ = TIER2_FRONT_Z - 0.45
  b.box([-1.5, TIER2_TOP_Y + 0.3, cubeZ], [0.6, 0.6, 0.6], COLORS.red)
  b.box([0.3, TIER2_TOP_Y + 0.4, cubeZ], [0.8, 0.8, 0.8], COLORS.yellow)
  b.box([2.1, TIER2_TOP_Y + 0.25, cubeZ], [0.5, 0.5, 0.5], COLORS.blue)

  const neonY = TIER2_TOP_Y - 0.04
  b.box([TIER2.center[0], neonY, TIER2_FRONT_Z + 0.03], [TIER2.size[0], 0.08, 0.06], COLORS.neon, {
    glow: true,
  })
  for (const side of [-1, 1] as const) {
    b.box(
      [TIER2.center[0] + side * (TIER2.size[0] / 2 + 0.03), neonY, TIER2.center[2]],
      [0.06, 0.08, TIER2.size[2]],
      COLORS.neon,
      { glow: true },
    )
  }
}

/** 建物の横に立つイーゼルと額装された大きな絵 */
function addEaselIcon(b: VoxelBuilder) {
  const plinthHeight = 0.3
  const frameThickness = 0.14
  const ledgeTopY = 1.32
  const paintingWidth = COMPOSITION_ROWS[0].length * COMPOSITION_CELL
  const paintingHeight = COMPOSITION_ROWS.length * COMPOSITION_CELL
  const paintingCenter = [0, ledgeTopY + frameThickness + paintingHeight / 2, 0.1] as const
  const frameTopY = paintingCenter[1] + paintingHeight / 2 + frameThickness

  b.box([0, plinthHeight / 2, 0], [3.1, plinthHeight, 1.3], COLORS.wall)
  b.box([0, plinthHeight - 0.04, 0.66], [3.1, 0.06, 0.04], COLORS.neon, { glow: true })

  // イーゼルの脚・受け桟・頂部
  for (const side of [-1, 1] as const) {
    b.box([side * 1.0, plinthHeight + 0.48, 0.05], [0.16, 0.96, 0.16], COLORS.wood)
  }
  b.box([0, plinthHeight + 1.1, -0.4], [0.16, 2.2, 0.16], COLORS.wood)
  b.box([0, ledgeTopY - 0.06, 0.2], [2.9, 0.12, 0.34], COLORS.wood)
  b.box([0, frameTopY + 0.12, 0], [0.16, 0.24, 0.16], COLORS.wood)

  // 絵の裏板＋金の額縁＋発光するドット絵
  b.box(
    [0, paintingCenter[1], 0.05],
    [paintingWidth + frameThickness * 2, paintingHeight + frameThickness * 2, 0.1],
    COLORS.goldDark,
  )
  addFrontFrame(b, paintingCenter, paintingWidth, paintingHeight, frameThickness, COLORS.gold)
  b.pixels({
    rows: COMPOSITION_ROWS,
    palette: { R: COLORS.red, Y: COLORS.yellow, B: COLORS.blue, W: '#e4e0d8', K: '#141018' },
    center: paintingCenter,
    cell: COMPOSITION_CELL,
    depth: 0.06,
    glow: true,
  })
}

export function buildLearnArtModel(entrance: LandmarkEntrance): VoxelModel {
  const b = new VoxelBuilder()

  addPlinth(b, entrance.frontZ, COLORS.plinth)
  b.shell({ ...bodyBox(TIER1_TOP_Y), cell: 0.5, color: COLORS.wall, jitter: 0.04 })
  b.shell({ center: TIER2.center, size: TIER2.size, cell: 0.5, color: COLORS.wallUpper, jitter: 0.035 })
  addEntrance(b, entrance, { wall: COLORS.wall, trim: COLORS.trim, bulb: COLORS.bulb })
  addGalleryFront(b)
  addSidePanels(b)
  addRoofline(b)
  b.group([LEARN_ART_ICON.x, 0, LEARN_ART_ICON.z], addEaselIcon)

  return b.build()
}
