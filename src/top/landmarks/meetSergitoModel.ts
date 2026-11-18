/**
 * Meet Sergito — 海辺の木工房（Sea 東）。
 * しっくい壁に焦げ茶の木組み、段々の瓦屋根と煙突、作業窓と道具掛け、丸太の山。
 * 建物の横には切り株の台座に立つ木彫りの Sergito 像（VRM は AttractionBuilding 側）。
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
  stone: '#6a6058',
  stoneDark: '#4e4640',
  plaster: '#d8c8a4',
  timber: '#4a3324',
  timberLight: '#6a4a32',
  roof: '#6a8098',
  roofDark: '#4e6278',
  ridge: '#3a4a5c',
  chimney: '#7a5a48',
  ember: '#ff8a3c',
  smoke: '#9aa4ae',
  windowFrame: '#3a2818',
  windowGlow: '#ffc070',
  pegboard: '#a88a62',
  steel: '#a8b0b8',
  handle: '#8a5a32',
  logBark: '#5a3e28',
  logRing: '#d8b888',
  logCore: '#b08a5a',
  plank: '#c8a070',
  lantern: '#ffc070',
  plaque: '#d4a060',
  plaqueText: '#3a2818',
} as const

const BODY_TOP_Y = 3.85
const ROOF = { steps: 6, stepHeight: 0.3, stepInset: 0.55, overhang: 0.4 } as const

/** Sergito 像の位置（説明看板の反対側＝左）。当たり判定は topConfig が参照 */
export const SERGITO_ICON = iconBesideEntrance(-1, 1.1, 0.9)
/** 台座上面（VRM の足元） */
export const SERGITO_STATUE_BASE_Y = 0.65

const TOOL_ROWS = [
  'SSS....HH....W.',
  'SSSS...HH...WWW',
  'SSSSS..HH....W.',
  'SSSSSS.HH....W.',
  'SSSSSSSHH....W.',
  'HH....SSSS...W.',
  'HH....SSSS...W.',
  'HH...........W.',
] as const

const LOG_END_ROWS = ['.BBB.', 'BRRRB', 'BRCRB', 'BRRRB', '.BBB.'] as const

/** 石積みの基壇（建物まわりだけ一段高く） */
function addStoneBase(b: VoxelBuilder, frontZ: number) {
  const { baseY } = LANDMARK_LAYOUT
  const depth = frontZ * 2 - 0.2
  const cell = 0.5
  const nx = Math.round(7.0 / cell)
  const nz = Math.round(depth / cell)
  for (let ix = 0; ix < nx; ix += 1) {
    for (let iz = 0; iz < nz; iz += 1) {
      const dark = (ix * 7 + iz * 3) % 5 === 0
      b.box(
        [-3.5 + cell * (ix + 0.5), baseY / 2, -depth / 2 + (depth / nz) * (iz + 0.5)],
        [cell - 0.03, baseY, depth / nz - 0.03],
        dark ? COLORS.stoneDark : COLORS.stone,
      )
    }
  }
}

/** しっくい壁＋木組み（ハーフティンバー） */
function addTimberBody(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ, baseY } = LANDMARK_LAYOUT
  b.shell({ ...bodyBox(BODY_TOP_Y), cell: 0.5, color: COLORS.plaster, jitter: 0.04 })

  const height = BODY_TOP_Y - baseY
  const midY = (baseY + BODY_TOP_Y) / 2
  const depth = bodyFrontZ - bodyBackZ
  const midZ = (bodyFrontZ + bodyBackZ) / 2

  // 柱（角＋側面の中間）
  for (const x of [-bodyHalfWidth, bodyHalfWidth]) {
    for (const z of [bodyFrontZ, midZ, bodyBackZ]) {
      b.box([x, midY, z], [0.28, height, 0.28], COLORS.timber)
    }
  }
  // 胴差し・軒桁（側面と背面）
  for (const y of [baseY + 0.12, 2.1, BODY_TOP_Y - 0.1]) {
    for (const side of [-1, 1] as const) {
      b.box([side * (bodyHalfWidth + 0.03), y, midZ], [0.08, 0.2, depth], COLORS.timber)
    }
    b.box([0, y, bodyBackZ - 0.03], [bodyHalfWidth * 2, 0.2, 0.08], COLORS.timber)
  }
  // 側面の筋交い（斜めはボクセルの階段で表す）
  for (const side of [-1, 1] as const) {
    for (let i = 0; i < 6; i += 1) {
      const z = bodyBackZ + 0.35 + i * 0.42
      const y = 2.3 + i * 0.22
      b.box([side * (bodyHalfWidth + 0.03), y, z], [0.07, 0.22, 0.42], COLORS.timberLight)
    }
  }
}

/** 段々の瓦屋根（棟は左右方向。正面から屋根面が見える） */
function addTileRoof(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ } = LANDMARK_LAYOUT
  const zFront = bodyFrontZ + ROOF.overhang
  const zBack = bodyBackZ - ROOF.overhang
  const width = bodyHalfWidth * 2 + ROOF.overhang * 2

  for (let i = 0; i < ROOF.steps; i += 1) {
    const front = zFront - i * ROOF.stepInset
    const back = zBack + i * ROOF.stepInset
    if (front <= back) break
    const y = BODY_TOP_Y + ROOF.stepHeight * (i + 0.5)
    b.box(
      [0, y, (front + back) / 2],
      [width, ROOF.stepHeight, front - back],
      i % 2 === 0 ? COLORS.roof : COLORS.roofDark,
    )
    // 瓦の継ぎ目（前縁に小さな凸凹）
    for (let x = -width / 2 + 0.3; x < width / 2; x += 0.6) {
      b.box([x, y - 0.02, front + 0.03], [0.06, ROOF.stepHeight - 0.04, 0.06], COLORS.ridge)
    }
  }
  const ridgeY = BODY_TOP_Y + ROOF.stepHeight * ROOF.steps + 0.06
  const ridgeZ = (zFront + zBack) / 2
  b.box([0, ridgeY, ridgeZ], [width, 0.12, 0.4], COLORS.ridge)

  // 煙突と湯気（右奥）
  const chimneyX = 1.9
  const chimneyZ = -1.6
  const chimneyTop = ridgeY + 0.9
  b.shell({
    center: [chimneyX, (BODY_TOP_Y + chimneyTop) / 2, chimneyZ],
    size: [0.7, chimneyTop - BODY_TOP_Y, 0.7],
    cell: 0.35,
    color: COLORS.chimney,
    jitter: 0.12,
  })
  b.box([chimneyX, chimneyTop + 0.05, chimneyZ], [0.8, 0.1, 0.8], COLORS.stoneDark)
  b.box([chimneyX, chimneyTop + 0.02, chimneyZ], [0.4, 0.08, 0.4], COLORS.ember, {
    glow: true,
    anim: { kind: 'pulse', phase: 0 },
  })
  for (const [i, [dx, dy, size]] of [
    [0.1, 0.35, 0.3],
    [-0.15, 0.75, 0.38],
    [0.2, 1.2, 0.3],
  ].entries()) {
    b.box([chimneyX + dx, chimneyTop + dy, chimneyZ - i * 0.15], [size, size, size], COLORS.smoke)
  }
}

/** 正面: 左に作業窓、右に道具掛け（右下は説明看板に隠れるので高めに） */
function addFrontDetails(b: VoxelBuilder, doorHalfWidth: number) {
  const z = LANDMARK_LAYOUT.bodyFrontZ
  const sideX = doorHalfWidth + 0.95

  // 正面の木組み（扉まわりの枠と上部の梁）
  b.box([0, 3.45, z + 0.04], [LANDMARK_LAYOUT.bodyHalfWidth * 2, 0.2, 0.08], COLORS.timber)
  for (const side of [-1, 1] as const) {
    b.box([side * (LANDMARK_LAYOUT.bodyHalfWidth - 0.1), 1.9, z + 0.04], [0.24, 3.3, 0.08], COLORS.timber)
  }

  // 左: 格子の作業窓（中に作業台の影）
  const wx = -sideX
  b.box([wx, 2.15, z + 0.05], [1.4, 1.5, 0.1], COLORS.windowFrame)
  b.box([wx, 2.15, z + 0.11], [1.2, 1.3, 0.04], COLORS.windowGlow, { glow: true })
  for (const dx of [-0.3, 0.3]) {
    b.box([wx + dx, 2.15, z + 0.15], [0.05, 1.3, 0.04], COLORS.windowFrame)
  }
  b.box([wx, 2.15, z + 0.15], [1.2, 0.05, 0.04], COLORS.windowFrame)
  b.box([wx, 1.33, z + 0.22], [1.6, 0.1, 0.3], COLORS.timberLight)
  // 窓辺の植木鉢
  for (const dx of [-0.45, 0.1, 0.5]) {
    b.box([wx + dx, 1.48, z + 0.24], [0.2, 0.2, 0.2], COLORS.chimney)
    b.box([wx + dx, 1.66, z + 0.24], [0.26, 0.18, 0.24], '#4a7a48')
  }

  // 右: 道具掛け（ノコギリ・ハンマー・キリ）
  b.box([sideX, 2.55, z + 0.04], [1.35, 1.0, 0.08], COLORS.pegboard)
  b.pixels({
    rows: TOOL_ROWS,
    palette: { S: COLORS.steel, H: COLORS.handle, W: COLORS.timber },
    center: [sideX, 2.55, z + 0.08],
    cell: 0.08,
    depth: 0.05,
  })

  // 扉脇のランタン
  for (const side of [-1, 1] as const) {
    const x = side * (doorHalfWidth + 0.45)
    b.box([x, 2.85, z + 0.3], [0.06, 0.06, 0.4], COLORS.timber)
    b.box([x, 2.62, z + 0.42], [0.22, 0.3, 0.22], COLORS.lantern, {
      glow: true,
      anim: { kind: 'pulse', phase: side > 0 ? 0.8 : 2.6 },
    })
  }
}

/** 側面: 左に丸太の山、右に馬と板（木挽き台） */
function addSideDetails(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ } = LANDMARK_LAYOUT

  // 丸太の山（切り口を正面に向けて三段）
  const logCell = 0.1
  const logSize = logCell * 5
  const logX = -bodyHalfWidth - 0.35
  const rows: Array<{ count: number; y: number }> = [
    { count: 3, y: 0.25 + logSize / 2 },
    { count: 2, y: 0.25 + logSize * 1.5 },
    { count: 1, y: 0.25 + logSize * 2.5 },
  ]
  for (const row of rows) {
    for (let i = 0; i < row.count; i += 1) {
      const z = bodyFrontZ - 0.9 - (i - (row.count - 1) / 2) * logSize
      // 丸太本体（側壁に沿って奥へ）
      b.box([logX, row.y, z], [logSize * 1.0, logSize - 0.04, logSize - 0.04], COLORS.logBark)
      b.pixels({
        rows: LOG_END_ROWS,
        palette: { B: COLORS.logBark, R: COLORS.logRing, C: COLORS.logCore },
        center: [logX - logSize / 2, row.y, z],
        cell: logCell,
        depth: 0.04,
        facing: 'left',
      })
    }
  }

  // 木挽き台と板
  const sx = bodyHalfWidth + 0.35
  for (const z of [0.6, -0.8]) {
    b.box([sx, 0.6, z], [0.5, 0.08, 0.1], COLORS.timber)
    for (const dx of [-0.18, 0.18]) {
      b.box([sx + dx, 0.42, z], [0.07, 0.38, 0.07], COLORS.timber)
    }
  }
  b.box([sx, 0.69, -0.1], [0.36, 0.08, 2.0], COLORS.plank)
}

/**
 * Sergito 像の台座: 切り株＋銘板（上に VRM が立つ）。
 * 箱の上面が同じ高さで重なると z-fighting でちらつくので、段ごとに高さをずらす。
 */
function addStatuePedestal(b: VoxelBuilder) {
  const lowTop = 0.3
  const highTop = 0.62
  // 下段: 中央の箱＋十字の張り出し（張り出しは中央より 0.02 低い）
  b.box([0, lowTop / 2, 0], [1.4, lowTop, 1.4], COLORS.logBark)
  b.box([0, (lowTop - 0.02) / 2, 0], [1.9, lowTop - 0.02, 1.0], COLORS.logBark)
  b.box([0, (lowTop - 0.02) / 2, 0], [1.0, lowTop - 0.02, 1.9], COLORS.logBark)
  // 上段
  b.box([0, (lowTop + highTop) / 2, 0], [1.2, highTop - lowTop, 1.2], COLORS.logBark)
  b.box([0, (lowTop + highTop - 0.02) / 2, 0], [1.5, highTop - 0.02 - lowTop, 0.9], COLORS.logBark)
  b.box([0, (lowTop + highTop - 0.02) / 2, 0], [0.9, highTop - 0.02 - lowTop, 1.5], COLORS.logBark)
  // 年輪の天面（上段の上に薄く載せる）
  b.box([0, highTop + 0.01, 0], [1.1, 0.02, 1.1], COLORS.logRing)
  b.box([0, highTop + 0.025, 0], [0.5, 0.01, 0.5], COLORS.logCore)
  // 下段正面の銘板
  b.box([0, 0.15, 0.965], [0.8, 0.18, 0.03], COLORS.plaque)
  b.box([0, 0.15, 0.985], [0.5, 0.04, 0.01], COLORS.plaqueText)
  // 足元のカンナくず
  for (const [x, z] of [
    [-1.05, 0.75],
    [1.1, 0.6],
    [0.8, -1.05],
  ] as const) {
    b.box([x, 0.03, z], [0.22, 0.06, 0.12], COLORS.plank)
  }
}

export function buildMeetSergitoModel(entrance: LandmarkEntrance): VoxelModel {
  const b = new VoxelBuilder()

  addStoneBase(b, entrance.frontZ)
  addTimberBody(b)
  addTileRoof(b)
  addEntrance(
    b,
    entrance,
    { wall: COLORS.plaster, trim: COLORS.timber, bulb: COLORS.lantern },
    { chaseBulbs: false },
  )
  addFrontDetails(b, entrance.doorHalfWidth)
  addSideDetails(b)
  b.group([SERGITO_ICON.x, 0, SERGITO_ICON.z], addStatuePedestal)

  return b.build()
}
