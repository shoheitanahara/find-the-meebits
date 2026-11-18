/**
 * Shore Fishing — 波打ち際の釣り小屋（Sea 西）。
 * 流木色の板壁に段々のトタン屋根、浮き輪・網・ランタン。
 * 建物の横には波から跳ねる魚の彫刻が立つ。
 */
import { VoxelBuilder, type VoxelModel } from '../voxel/voxelBuilder'
import {
  addEntrance,
  bodyBox,
  iconBesideEntrance,
  LANDMARK_LAYOUT,
  type LandmarkEntrance,
} from './landmarkParts'

const COLORS = {
  deck: '#6a5642',
  deckDark: '#54432f',
  piling: '#3e3024',
  rope: '#c8b088',
  plank: '#8c7558',
  plankDark: '#5e4a36',
  trim: '#2e241a',
  tin: '#3a6a88',
  tinLight: '#5288a8',
  tinRidge: '#a8c4d4',
  ringRed: '#d8443a',
  ringWhite: '#f0ece0',
  lantern: '#ffc070',
  windowFrame: '#2a2018',
  windowGlow: '#ffb860',
  net: '#2a3a40',
  float: '#ff8a3c',
  crate: '#9a7a52',
  crateDark: '#6a5236',
  barrel: '#5a4230',
  barrelBand: '#2a2420',
  rod: '#3a2a1c',
  fishBody: '#6ab4d8',
  fishBack: '#2e6a9a',
  fishBelly: '#e4f2f8',
  fishFin: '#3a88b8',
  fishEye: '#0c1418',
  wave: '#2a7aa8',
  waveDeep: '#1a5a80',
  foam: '#dff2ff',
} as const

const BODY_TOP_Y = 3.95
const ROOF = { steps: 6, stepHeight: 0.28, stepInset: 0.55, overhang: 0.35 } as const

/** 跳ねる魚の彫刻（説明看板の反対側＝右）。当たり判定は topConfig が参照 */
export const SHORE_FISHING_ICON = iconBesideEntrance(1, 1.35, 0.8)

const LIFE_RING_ROWS = [
  '..RRWW..',
  '.RR..WW.',
  'WW....RR',
  'WW....RR',
  'RR....WW',
  'RR....WW',
  '.WW..RR.',
  '..WWRR..',
] as const

const NET_ROWS = [
  'N.N.N.N.N',
  '.N.N.N.N.',
  'N.N.F.N.N',
  '.N.N.N.N.',
  'N.F.N.N.N',
  '.N.N.N.F.',
  'N.N.N.N.N',
] as const

const FISH_ROWS = [
  '......BBB.........',
  '....BBBBBBB.....FF',
  '..BBBSSSSSBBB..FFF',
  '.BBSSSSSSSSSBB.FF.',
  'BBSESSSSSSSSSBFFF.',
  'BSSSSSSSSSSSWWFF..',
  '.WWWWSSSSSWWWW.FF.',
  '..WWWWWWWWWW....FF',
  '....WW..WW........',
] as const

const WAVE_ROWS = [
  '........OOO.....',
  '......OOWWWO....',
  '.OO..OWWWWWWO...',
  'OWWOOWWWDWWWWOO.',
  'WWWWWWWDDDWWWWWO',
  'WWDWWWDDDDDWWDWW',
] as const

/** 板張りのデッキ基壇（隙間のある板を並べる） */
function addDeck(b: VoxelBuilder, frontZ: number) {
  const { baseY } = LANDMARK_LAYOUT
  const depth = frontZ * 2 - 0.2
  const plankWidth = 0.42
  const count = Math.round(depth / plankWidth)
  for (let i = 0; i < count; i += 1) {
    const z = -depth / 2 + plankWidth * (i + 0.5)
    b.box(
      [0, baseY / 2, z],
      [7.0, baseY, plankWidth - 0.04],
      i % 3 === 1 ? COLORS.deckDark : COLORS.deck,
    )
  }

  // 四隅の杭とロープ
  for (const x of [-3.35, 3.35]) {
    for (const z of [-depth / 2 + 0.15, depth / 2 - 0.15]) {
      b.box([x, 0.55, z], [0.3, 1.1, 0.3], COLORS.piling)
      b.box([x, 0.82, z], [0.36, 0.1, 0.36], COLORS.rope)
    }
  }
}

/** 板壁: 下見板の段（横の影線）を壁の外側に重ねる */
function addPlankBody(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ, baseY } = LANDMARK_LAYOUT
  b.shell({ ...bodyBox(BODY_TOP_Y), cell: 0.5, color: COLORS.plank, jitter: 0.12 })

  const depth = bodyFrontZ - bodyBackZ
  const midZ = (bodyFrontZ + bodyBackZ) / 2
  for (let y = baseY + 0.5; y < BODY_TOP_Y - 0.1; y += 0.5) {
    for (const side of [-1, 1] as const) {
      b.box([side * (bodyHalfWidth + 0.02), y, midZ], [0.05, 0.05, depth], COLORS.plankDark)
    }
    b.box([0, y, bodyBackZ - 0.02], [bodyHalfWidth * 2, 0.05, 0.05], COLORS.plankDark)
  }

  // 角柱
  for (const x of [-bodyHalfWidth, bodyHalfWidth]) {
    for (const z of [bodyFrontZ, bodyBackZ]) {
      b.box([x, (baseY + BODY_TOP_Y) / 2, z], [0.3, BODY_TOP_Y - baseY, 0.3], COLORS.trim)
    }
  }
}

/** 段々のトタン切妻屋根（棟は前後方向。正面に三角の妻が見える） */
function addTinRoof(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ } = LANDMARK_LAYOUT
  const zFront = bodyFrontZ + ROOF.overhang
  const zBack = bodyBackZ - ROOF.overhang
  const depth = zFront - zBack
  const midZ = (zFront + zBack) / 2

  for (let i = 0; i < ROOF.steps; i += 1) {
    const halfW = bodyHalfWidth + ROOF.overhang - i * ROOF.stepInset
    const y = BODY_TOP_Y + ROOF.stepHeight * (i + 0.5)
    // 1段ごとに明暗を交互にして波板っぽく
    const color = i % 2 === 0 ? COLORS.tin : COLORS.tinLight
    b.box([0, y, midZ], [halfW * 2, ROOF.stepHeight, depth], color)
  }
  const ridgeY = BODY_TOP_Y + ROOF.stepHeight * ROOF.steps + 0.06
  b.box([0, ridgeY, midZ], [0.5, 0.12, depth + 0.1], COLORS.tinRidge)

  // 妻の丸窓（看板の上に覗く）
  b.pixels({
    rows: ['.FFF.', 'FAAAF', 'FAAAF', '.FFF.'],
    palette: { F: COLORS.windowFrame, A: COLORS.windowGlow },
    center: [0, BODY_TOP_Y + 0.75, zFront],
    cell: 0.16,
    depth: 0.08,
    glow: 'A',
  })

  // 棟の上の魚の風見
  b.box([0, ridgeY + 0.35, bodyBackZ + 0.6], [0.06, 0.6, 0.06], COLORS.trim)
  b.pixels({
    rows: ['.BB...', 'BBBB.B', 'BEBBBB', '.BB..B'],
    palette: { B: COLORS.tinRidge, E: COLORS.trim },
    center: [0, ridgeY + 0.8, bodyBackZ + 0.6],
    cell: 0.12,
    depth: 0.06,
  })
}

/** 正面: 浮き輪・窓・ランタン・木箱（右下は説明看板に隠れるので高めに置く） */
function addFrontDetails(b: VoxelBuilder, doorHalfWidth: number) {
  const z = LANDMARK_LAYOUT.bodyFrontZ
  const sideX = doorHalfWidth + 0.95

  // 左: 窓（説明看板の後ろ）。上部が看板の上に覗く
  b.box([-sideX, 2.35, z + 0.05], [1.3, 1.25, 0.1], COLORS.windowFrame)
  b.box([-sideX, 2.35, z + 0.12], [1.05, 1.0, 0.05], COLORS.windowGlow, { glow: true })
  b.box([-sideX, 2.35, z + 0.16], [0.06, 1.0, 0.04], COLORS.windowFrame)
  b.box([-sideX, 2.35, z + 0.16], [1.05, 0.06, 0.04], COLORS.windowFrame)
  b.box([-sideX, 1.66, z + 0.18], [1.4, 0.1, 0.26], COLORS.plankDark)

  // 右: 浮き輪＋巻いたロープ＋木箱
  b.pixels({
    rows: LIFE_RING_ROWS,
    palette: { R: COLORS.ringRed, W: COLORS.ringWhite },
    center: [sideX, 2.3, z],
    cell: 0.14,
    depth: 0.14,
  })
  b.box([sideX + 0.05, 0.55, z + 0.4], [0.75, 0.6, 0.6], COLORS.crate)
  b.box([sideX + 0.05, 0.55, z + 0.71], [0.75, 0.08, 0.02], COLORS.crateDark)
  b.box([sideX - 0.15, 1.05, z + 0.35], [0.5, 0.4, 0.45], COLORS.crateDark)

  // 扉脇のランタン（ゆっくり明滅）
  for (const side of [-1, 1] as const) {
    const x = side * (doorHalfWidth + 0.5)
    b.box([x, 3.05, z + 0.35], [0.06, 0.3, 0.06], COLORS.trim)
    b.box([x, 2.78, z + 0.35], [0.24, 0.3, 0.24], COLORS.lantern, {
      glow: true,
      anim: { kind: 'pulse', phase: side > 0 ? 0 : 2 },
    })
    b.box([x, 2.97, z + 0.35], [0.3, 0.06, 0.3], COLORS.trim)
  }
}

/** 側面: 右に干し網と浮き、左に竿立てと樽 */
function addSideDetails(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ } = LANDMARK_LAYOUT

  b.pixels({
    rows: NET_ROWS,
    palette: { N: COLORS.net, F: COLORS.float },
    center: [bodyHalfWidth, 2.3, 0.2],
    cell: 0.26,
    depth: 0.06,
    facing: 'right',
    glow: 'F',
  })
  b.box([bodyHalfWidth + 0.08, 3.25, 0.2], [0.1, 0.1, 2.6], COLORS.rope)

  // 竿立て（壁に沿って縦の竿、先端に浮き）
  for (const [i, z] of [1.6, 1.15, 0.7, 0.25].entries()) {
    const height = 2.6 + (i % 2) * 0.4
    b.box([-bodyHalfWidth - 0.2, 0.25 + height / 2, z], [0.06, height, 0.06], COLORS.rod)
    b.box([-bodyHalfWidth - 0.2, 0.25 + height + 0.06, z], [0.1, 0.12, 0.1], COLORS.float, {
      glow: true,
    })
  }
  b.box([-bodyHalfWidth - 0.2, 0.9, 0.9], [0.3, 0.12, 1.8], COLORS.plankDark)

  // 樽
  for (const [x, z] of [
    [-bodyHalfWidth - 0.15, bodyBackZ + 0.6],
    [bodyHalfWidth + 0.1, bodyFrontZ - 0.4],
  ] as const) {
    b.box([x, 0.65, z], [0.6, 0.8, 0.6], COLORS.barrel)
    b.box([x, 0.45, z], [0.64, 0.07, 0.64], COLORS.barrelBand)
    b.box([x, 0.85, z], [0.64, 0.07, 0.64], COLORS.barrelBand)
  }
}

/** 波から跳ねる魚（建物の右横の地上彫刻） */
function addLeapingFishIcon(b: VoxelBuilder) {
  const baseHeight = 0.3
  b.box([0, baseHeight / 2, 0], [2.6, baseHeight, 1.5], COLORS.deckDark)
  b.box([0, baseHeight + 0.04, 0.72], [2.6, 0.06, 0.06], COLORS.foam, { glow: true })

  const waveCell = 0.17
  const waveBottom = baseHeight
  b.pixels({
    rows: WAVE_ROWS,
    palette: { W: COLORS.wave, D: COLORS.waveDeep, O: COLORS.foam },
    center: [0, waveBottom + (WAVE_ROWS.length * waveCell) / 2, -0.2],
    cell: waveCell,
    depth: 0.4,
    glow: 'O',
  })

  // 魚は波頭から跳ね上がる（腹が波頭にかかる高さ）
  const fishCell = 0.15
  b.pixels({
    rows: FISH_ROWS,
    palette: {
      B: COLORS.fishBack,
      S: COLORS.fishBody,
      W: COLORS.fishBelly,
      F: COLORS.fishFin,
      E: COLORS.fishEye,
    },
    center: [-0.1, 2.08, -0.17],
    cell: fishCell,
    depth: 0.34,
  })

  // しぶき（順番に明滅）
  for (const [i, [x, y]] of [
    [-1.15, 1.75],
    [1.2, 1.95],
    [0.95, 2.95],
    [-1.0, 2.9],
  ].entries()) {
    b.box([x, y, 0], [0.12, 0.12, 0.12], COLORS.foam, {
      glow: true,
      anim: { kind: 'pulse', phase: i * 1.6 },
    })
  }
}

export function buildShoreFishingModel(entrance: LandmarkEntrance): VoxelModel {
  const b = new VoxelBuilder()

  addDeck(b, entrance.frontZ)
  addPlankBody(b)
  addTinRoof(b)
  addEntrance(
    b,
    entrance,
    { wall: COLORS.plank, trim: COLORS.trim, bulb: COLORS.lantern },
    { chaseBulbs: false },
  )
  addFrontDetails(b, entrance.doorHalfWidth)
  addSideDetails(b)
  b.group([SHORE_FISHING_ICON.x, 0, SHORE_FISHING_ICON.z], addLeapingFishIcon)

  return b.build()
}
