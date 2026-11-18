/**
 * Shooting Gallery — 縁日の射的小屋（Mountain 東）。
 * 濃い木の板壁に、赤×生成りのストライプの帆布屋根。
 * 入口の左右は射的の窓口: 奥にブリキのアヒルと的、手前にカウンターとおもちゃの銃。
 * 光は窓口の内側上部の照明帯だけ（点滅なし）。
 */
import { VoxelBuilder, type VoxelModel } from '../voxel/voxelBuilder'
import {
  addEntrance,
  bodyBox,
  LANDMARK_LAYOUT,
  type LandmarkEntrance,
} from './landmarkParts'

const COLORS = {
  deck: '#3e2c1e',
  deckDark: '#33241a',
  wood: '#5a3c28',
  woodDark: '#3e2a1c',
  batten: '#6e4c32',
  trim: '#2a1c12',
  canvasRed: '#9a3430',
  canvasCream: '#e6d8b8',
  canvasShadeRed: '#7e2a26',
  canvasShadeCream: '#c8b898',
  backdrop: '#34463a',
  backdropDark: '#243028',
  stallLight: '#ffd8a0',
  tin: '#a8a49a',
  tinShade: '#7e7a72',
  duckBeak: '#d8963a',
  targetRed: '#b92d38',
  targetCream: '#f0e2c4',
  targetGold: '#e2b43d',
  counter: '#70492d',
  counterTop: '#8a5c38',
  gunMetal: '#3a3a3e',
  gunWood: '#8a5a32',
  bulb: '#ffd08a',
  brass: '#c49a52',
  crate: '#7a5a38',
  crateDark: '#5a4028',
  barrel: '#5e4028',
  barrelBand: '#2a2420',
  plushBrown: '#9a6a44',
  plushCream: '#e8d4b0',
  plushBlue: '#5a7a98',
  plushPink: '#d88a98',
  plushEye: '#1a1410',
} as const

const BODY_TOP_Y = 3.9
const ROOF = { steps: 6, stepHeight: 0.27, stepInset: 0.56, overhang: 0.4, stripe: 0.5 } as const

const DUCK_ROWS = [
  '..TT....',
  '.TTTB...',
  '.TTT....',
  'TTTTTTT.',
  'TTTTTTTT',
  '.SSSSSS.',
] as const

const TARGET_ROWS = [
  '..RRR..',
  '.RCCCR.',
  'RCRRRCR',
  'RCRGRCR',
  'RCRRRCR',
  '.RCCCR.',
  '..RRR..',
] as const

const BULLSEYE_ROWS = [
  '...RRRR...',
  '.RRCCCCRR.',
  '.RCCRRCCR.',
  'RCCRGGRCCR',
  'RCRGGGGRCR',
  'RCRGGGGRCR',
  'RCCRGGRCCR',
  '.RCCRRCCR.',
  '.RRCCCCRR.',
  '...RRRR...',
] as const

const PLUSH_ROWS = ['P.PP.P', 'PPPPPP', 'PEPPEP', 'PPCCPP', '.PPPP.', 'PPPPPP', 'PP..PP'] as const

/** 板張りのデッキ */
function addDeck(b: VoxelBuilder, frontZ: number) {
  const { baseY } = LANDMARK_LAYOUT
  const depth = frontZ * 2 - 0.2
  const plank = 0.45
  const count = Math.round(depth / plank)
  for (let i = 0; i < count; i += 1) {
    const z = -depth / 2 + (depth / count) * (i + 0.5)
    b.box([0, baseY / 2, z], [7.0, baseY, depth / count - 0.04], i % 2 === 0 ? COLORS.deck : COLORS.deckDark)
  }
}

/** 板壁＋縦の押縁（ボード＆バテン） */
function addBoardBody(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ, baseY } = LANDMARK_LAYOUT
  b.shell({ ...bodyBox(BODY_TOP_Y), cell: 0.5, color: COLORS.wood, jitter: 0.09 })

  const height = BODY_TOP_Y - baseY
  const midY = (baseY + BODY_TOP_Y) / 2
  for (const side of [-1, 1] as const) {
    for (let z = bodyBackZ + 0.5; z < bodyFrontZ - 0.2; z += 0.5) {
      b.box([side * (bodyHalfWidth + 0.03), midY, z], [0.06, height, 0.08], COLORS.batten)
    }
  }
  for (let x = -bodyHalfWidth + 0.5; x < bodyHalfWidth - 0.2; x += 0.5) {
    b.box([x, midY, bodyBackZ - 0.03], [0.08, height, 0.06], COLORS.batten)
  }
  // 角柱（正面の2本は屋根まで伸びて帆布を支える）
  for (const x of [-bodyHalfWidth, bodyHalfWidth]) {
    for (const z of [bodyFrontZ, bodyBackZ]) {
      b.box([x, midY, z], [0.3, height, 0.3], COLORS.trim)
    }
  }
  // 腰板
  b.box(
    [0, baseY + 0.25, (bodyFrontZ + bodyBackZ) / 2],
    [bodyHalfWidth * 2 + 0.1, 0.5, bodyFrontZ - bodyBackZ + 0.1],
    COLORS.woodDark,
  )
}

/**
 * ストライプの帆布屋根（棟は前後方向）。
 * 縞は斜面を流れ落ちる向き（z 方向に交互）。段ごとに陰影色を変えて立体感を出す。
 */
function addCanvasRoof(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ } = LANDMARK_LAYOUT
  const zFront = bodyFrontZ + ROOF.overhang
  const zBack = bodyBackZ - ROOF.overhang
  const stripeCount = Math.round((zFront - zBack) / ROOF.stripe)
  const stripe = (zFront - zBack) / stripeCount

  for (let i = 0; i < ROOF.steps; i += 1) {
    const halfW = bodyHalfWidth + ROOF.overhang - i * ROOF.stepInset
    const y = BODY_TOP_Y + ROOF.stepHeight * (i + 0.5)
    const shaded = i % 2 === 1
    for (let s = 0; s < stripeCount; s += 1) {
      const red = s % 2 === 0
      const color = red
        ? shaded
          ? COLORS.canvasShadeRed
          : COLORS.canvasRed
        : shaded
          ? COLORS.canvasShadeCream
          : COLORS.canvasCream
      b.box([0, y, zBack + stripe * (s + 0.5)], [halfW * 2, ROOF.stepHeight, stripe], color)
    }
  }

  const peakY = BODY_TOP_Y + ROOF.stepHeight * ROOF.steps
  const midZ = (zFront + zBack) / 2
  b.box([0, peakY + 0.05, midZ], [0.3, 0.1, zFront - zBack + 0.1], COLORS.trim)

  // 側面の軒のスカラップ（垂れ幕）
  for (const side of [-1, 1] as const) {
    const x = side * (bodyHalfWidth + ROOF.overhang - 0.03)
    for (let s = 0; s < stripeCount; s += 1) {
      const red = s % 2 === 0
      const drop = red ? 0.32 : 0.2
      b.box(
        [x, BODY_TOP_Y - drop / 2, zBack + stripe * (s + 0.5)],
        [0.05, drop, stripe],
        red ? COLORS.canvasRed : COLORS.canvasCream,
      )
    }
  }

  // 棟の両端に三角旗
  for (const z of [zFront - 0.15, zBack + 0.15]) {
    b.box([0, peakY + 0.5, z], [0.07, 0.9, 0.07], COLORS.trim)
    b.pixels({
      rows: ['RRRR', 'RRR.', 'RR..', 'R...'],
      palette: { R: COLORS.canvasRed },
      center: [0.22, peakY + 0.72, z],
      cell: 0.1,
      depth: 0.04,
    })
  }

  // 妻（看板の上）の大きな的のエンブレム。屋根の前面に貼る
  b.pixels({
    rows: BULLSEYE_ROWS,
    palette: { R: COLORS.targetRed, C: COLORS.targetCream, G: COLORS.targetGold },
    center: [0, BODY_TOP_Y + 1.1, zFront],
    cell: 0.11,
    depth: 0.1,
  })
}

/** 射的の窓口1つ（入口の左右に置く） */
function addStall(b: VoxelBuilder, cx: number, width: number, withGuns: boolean) {
  const z = LANDMARK_LAYOUT.bodyFrontZ
  const bottom = 1.15
  const top = 3.05
  const height = top - bottom
  const cy = (bottom + top) / 2

  // 枠と奥の背景
  b.box([cx, cy, z + 0.05], [width, height + 0.24, 0.1], COLORS.trim)
  b.box([cx, cy, z + 0.08], [width - 0.22, height, 0.04], COLORS.backdrop)
  b.box([cx, bottom + 0.35, z + 0.09], [width - 0.22, 0.04, 0.04], COLORS.backdropDark)

  // 窓口の内側上部の照明帯（中を照らしている見え方に）
  b.box([cx, top - 0.06, z + 0.11], [width - 0.3, 0.06, 0.04], COLORS.stallLight, { glow: true })

  // 上段: ブリキのアヒルの列
  const duckCell = 0.055
  const duckSpacing = 0.46
  const duckCount = Math.floor((width - 0.3) / duckSpacing)
  for (let i = 0; i < duckCount; i += 1) {
    const x = cx + (i - (duckCount - 1) / 2) * duckSpacing
    b.pixels({
      rows: DUCK_ROWS,
      palette: { T: COLORS.tin, B: COLORS.duckBeak, S: COLORS.tinShade },
      center: [x, top - 0.38, z + 0.1],
      cell: duckCell,
      depth: 0.05,
    })
  }
  b.box([cx, top - 0.6, z + 0.12], [width - 0.22, 0.04, 0.04], COLORS.brass)

  // 中段: 丸い的
  const targetCell = 0.07
  for (const dx of [-0.42, 0.42]) {
    b.pixels({
      rows: TARGET_ROWS,
      palette: { R: COLORS.targetRed, C: COLORS.targetCream, G: COLORS.targetGold },
      center: [cx + dx, cy - 0.12, z + 0.1],
      cell: targetCell,
      depth: 0.05,
    })
  }

  // カウンター
  b.box([cx, bottom - 0.05, z + 0.32], [width + 0.1, 0.12, 0.6], COLORS.counterTop)
  b.box([cx, (LANDMARK_LAYOUT.baseY + bottom - 0.1) / 2, z + 0.28], [width, bottom - 0.1 - LANDMARK_LAYOUT.baseY, 0.5], COLORS.counter)
  // 前板の縦の羽目
  for (let x = cx - width / 2 + 0.25; x < cx + width / 2; x += 0.5) {
    b.box([x, (LANDMARK_LAYOUT.baseY + bottom - 0.1) / 2, z + 0.54], [0.05, bottom - 0.2 - LANDMARK_LAYOUT.baseY, 0.03], COLORS.trim)
  }

  if (withGuns) {
    // カウンターに寝かせたおもちゃの銃（台尻＋銃身）
    for (const dx of [-0.32, 0.32]) {
      b.box([cx + dx - 0.2, bottom + 0.05, z + 0.38], [0.32, 0.08, 0.12], COLORS.gunWood)
      b.box([cx + dx + 0.14, bottom + 0.05, z + 0.38], [0.42, 0.05, 0.05], COLORS.gunMetal)
    }
  } else {
    // コルク弾の箱
    b.box([cx - 0.3, bottom + 0.06, z + 0.36], [0.34, 0.12, 0.24], COLORS.crate)
    b.box([cx + 0.25, bottom + 0.06, z + 0.36], [0.26, 0.12, 0.2], COLORS.crateDark)
  }
}

/** 正面: 入口の左右に窓口 */
function addFront(b: VoxelBuilder, doorHalfWidth: number) {
  const left = doorHalfWidth + 0.38
  const right = LANDMARK_LAYOUT.bodyHalfWidth - 0.2
  const width = right - left
  const cx = (left + right) / 2
  addStall(b, -cx, width, true)
  // 右の窓口は説明看板の後ろ。上段が看板の上に覗く
  addStall(b, cx, width, false)
}

/** 側面: 左に景品棚（ぬいぐるみ）、右に木箱と樽 */
function addSides(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyBackZ } = LANDMARK_LAYOUT
  const wallX = -bodyHalfWidth

  // 景品棚（2段）
  const shelfZ = 0.2
  const shelfDepth = 3.2
  for (const y of [1.3, 2.3]) {
    b.box([wallX - 0.2, y, shelfZ], [0.4, 0.08, shelfDepth], COLORS.counterTop)
  }
  b.box([wallX - 0.05, 2.0, shelfZ], [0.1, 2.0, shelfDepth + 0.2], COLORS.backdrop)
  const plushes = [
    { y: 1.3, z: shelfZ + 1.0, color: COLORS.plushBrown },
    { y: 1.3, z: shelfZ - 0.05, color: COLORS.plushPink },
    { y: 1.3, z: shelfZ - 1.05, color: COLORS.plushBlue },
    { y: 2.3, z: shelfZ + 0.55, color: COLORS.plushBlue },
    { y: 2.3, z: shelfZ - 0.55, color: COLORS.plushBrown },
  ]
  for (const plush of plushes) {
    b.pixels({
      rows: PLUSH_ROWS,
      palette: { P: plush.color, E: COLORS.plushEye, C: COLORS.plushCream },
      center: [wallX - 0.22, plush.y + 0.04 + 0.07 * 3.5, plush.z],
      cell: 0.07,
      depth: 0.2,
      facing: 'left',
    })
  }
  // 棚上の電球（点滅なし）
  for (let z = shelfZ - shelfDepth / 2 + 0.3; z <= shelfZ + shelfDepth / 2 - 0.2; z += 0.5) {
    b.box([wallX - 0.12, 3.15, z], [0.1, 0.1, 0.1], COLORS.bulb, { glow: true })
  }

  // 右: 木箱と樽
  const rx = bodyHalfWidth + 0.38
  b.box([rx, 0.6, 0.6], [0.7, 0.7, 0.7], COLORS.crate)
  b.box([rx, 0.6, 0.96], [0.72, 0.08, 0.02], COLORS.crateDark)
  b.box([rx, 1.25, 0.75], [0.5, 0.5, 0.5], COLORS.crateDark)
  for (const z of [-0.5, bodyBackZ + 0.6]) {
    b.box([rx, 0.7, z], [0.62, 0.9, 0.62], COLORS.barrel)
    b.box([rx, 0.45, z], [0.66, 0.07, 0.66], COLORS.barrelBand)
    b.box([rx, 0.95, z], [0.66, 0.07, 0.66], COLORS.barrelBand)
  }
}

export function buildShootingGalleryModel(entrance: LandmarkEntrance): VoxelModel {
  const b = new VoxelBuilder()

  addDeck(b, entrance.frontZ)
  addBoardBody(b)
  addCanvasRoof(b)
  addEntrance(
    b,
    entrance,
    { wall: COLORS.wood, trim: COLORS.trim, bulb: COLORS.bulb },
    { chaseBulbs: false },
  )
  addFront(b, entrance.doorHalfWidth)
  addSides(b)

  return b.build()
}
