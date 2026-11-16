/**
 * Hip Hop Club — 紫レンガのクラブ。
 * 入口両脇にスピーカー、看板の上でイコライザが踊り、建物の横に巨大ラジカセが立つ。
 */
import { VoxelBuilder, type VoxelModel } from '../voxel/voxelBuilder'
import {
  addEntrance,
  addPlinth,
  bodyBox,
  iconBesideEntrance,
  LANDMARK_LAYOUT,
  type LandmarkEntrance,
} from './landmarkParts'

const COLORS = {
  plinth: '#150c1c',
  brick: '#5a3480',
  trim: '#1a1024',
  chrome: '#a59cb8',
  chromeLight: '#cfc8dc',
  panel: '#1c1426',
  cabinet: '#1a1220',
  speakerCone: '#140c1a',
  neon: '#e85cff',
  amber: '#ffc46a',
  cyan: '#5ee0ff',
  hot: '#ff4d7a',
} as const

const BODY_TOP_Y = 4.6

/** 巨大ラジカセ彫刻の位置（説明看板の反対側＝右）。当たり判定は topConfig が参照 */
export const HIP_HOP_ICON = iconBesideEntrance(1, 1.6, 0.7)

const BOOMBOX = {
  plinthHeight: 0.3,
  size: [2.8, 1.7, 0.8],
  speakerX: 0.72,
} as const
const BOOMBOX_TOP_Y = BOOMBOX.plinthHeight + BOOMBOX.size[1]
const BOOMBOX_FACE_Z = BOOMBOX.size[2] / 2

const SPEAKER_ROWS = [
  '..RRR..',
  '.RDDDR.',
  'RDAAADR',
  'RDACADR',
  'RDAAADR',
  '.RDDDR.',
  '..RRR..',
] as const

const WOOFER_ROWS = ['.RRR.', 'RDDDR', 'RDCDR', 'RDDDR', '.RRR.'] as const

const BOLT_ROWS = ['...XX', '..XX.', '.XXX.', 'XXXXX', '.XXX.', '.XX..', 'XX...'] as const

function mirrorRows(rows: readonly string[]) {
  return rows.map((line) => [...line].reverse().join(''))
}

/** イコライザの段ごとの色（下=シアン / 中=アンバー / 最上段=ピンク） */
function eqColor(row: number, rows: number) {
  if (row >= rows - 1) return COLORS.hot
  return row >= Math.floor(rows / 2) ? COLORS.amber : COLORS.cyan
}

/** 動くイコライザの柱を横一列に並べる */
function addEqualizer(
  b: VoxelBuilder,
  options: {
    columns: number
    rows: number
    baseY: number
    z: number
    pitchX: number
    barWidth: number
    barDepth: number
  },
) {
  const { columns, rows, baseY, z, pitchX, barWidth, barDepth } = options
  const pitchY = 0.17
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      b.box(
        [(column - (columns - 1) / 2) * pitchX, baseY + row * pitchY, z],
        [barWidth, 0.13, barDepth],
        eqColor(row, rows),
        { glow: true, anim: { kind: 'eq', column, row, rows } },
      )
    }
  }
}

/** 入口両脇のスピーカーキャビネットと稲妻ネオン */
function addStreetFront(b: VoxelBuilder) {
  const { baseY, bodyFrontZ } = LANDMARK_LAYOUT
  const cabinetHeight = 1.9
  const cabinetDepth = 0.46

  for (const side of [-1, 1] as const) {
    const x = side * 2.3
    b.box(
      [x, baseY + cabinetHeight / 2, bodyFrontZ + cabinetDepth / 2],
      [1.2, cabinetHeight, cabinetDepth],
      COLORS.cabinet,
    )
    for (const [index, y] of [0.75, 1.65].entries()) {
      b.pixels({
        rows: WOOFER_ROWS,
        palette: { R: COLORS.neon, D: COLORS.speakerCone, C: COLORS.amber },
        center: [x, y, bodyFrontZ + cabinetDepth],
        cell: 0.17,
        depth: 0.06,
        glow: true,
        anim: (char) => (char === 'R' ? { kind: 'pulse', phase: index * 1.6 } : undefined),
      })
    }
    b.pixels({
      rows: side > 0 ? BOLT_ROWS : mirrorRows(BOLT_ROWS),
      palette: { X: COLORS.amber },
      center: [x, 2.75, bodyFrontZ],
      cell: 0.13,
      depth: 0.06,
      glow: true,
    })
  }
}

/** 側面のポスターと上縁ネオン */
function addSideWalls(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ } = LANDMARK_LAYOUT
  const posterColors = ['#7a2e8a', '#8a6228', '#226a78'] as const
  const bodyCenterZ = (bodyFrontZ + bodyBackZ) / 2

  for (const side of [-1, 1] as const) {
    const x = side * (bodyHalfWidth + 0.03)
    posterColors.forEach((color, index) => {
      b.box([x, 1.7, 1.2 - index * 1.5], [0.05, 1.5, 1.1], color, { glow: true })
    })
    b.box([x, BODY_TOP_Y - 0.05, bodyCenterZ], [0.06, 0.1, bodyFrontZ - bodyBackZ], COLORS.neon, {
      glow: true,
    })
  }
}

/** 建物の横に立つ巨大ラジカセ（スピーカーが鼓動し、天面からイコライザが立ち上がる） */
function addBoomboxIcon(b: VoxelBuilder) {
  const { plinthHeight, size, speakerX } = BOOMBOX
  const bodyCenterY = plinthHeight + size[1] / 2

  b.box([0, plinthHeight / 2, 0], [3.1, plinthHeight, 1.3], COLORS.plinth)
  b.box([0, plinthHeight - 0.04, 0.66], [3.1, 0.06, 0.04], COLORS.neon, { glow: true })

  b.shell({ center: [0, bodyCenterY, 0], size, cell: 0.28, color: COLORS.chrome, jitter: 0.05 })
  b.box([0, bodyCenterY - 0.05, BOOMBOX_FACE_Z + 0.015], [2.6, 1.5, 0.03], COLORS.panel)

  for (const side of [-1, 1] as const) {
    b.pixels({
      rows: SPEAKER_ROWS,
      palette: { R: COLORS.neon, D: COLORS.speakerCone, A: COLORS.amber, C: '#fff4d6' },
      center: [side * speakerX, 0.98, BOOMBOX_FACE_Z + 0.03],
      cell: 0.18,
      depth: 0.08,
      glow: true,
      // コーン部分だけ鼓動させる（左右で位相をずらす）
      anim: (char) => (char === 'A' ? { kind: 'pulse', phase: side > 0 ? 0 : Math.PI } : undefined),
    })
    b.box([side * 1.05, 1.74, BOOMBOX_FACE_Z + 0.05], [0.14, 0.14, 0.05], COLORS.cyan, { glow: true })
  }
  b.box([0, 1.74, BOOMBOX_FACE_Z + 0.05], [1.6, 0.07, 0.04], COLORS.amber, { glow: true })

  addEqualizer(b, {
    columns: 7,
    rows: 5,
    baseY: BOOMBOX_TOP_Y + 0.1,
    z: 0,
    pitchX: 0.34,
    barWidth: 0.24,
    barDepth: 0.24,
  })

  // 斜めに伸びるアンテナ（段々で表現）＋点滅する先端
  const antennaSteps = 4
  for (let i = 0; i < antennaSteps; i += 1) {
    b.box([1.2 + i * 0.12, BOOMBOX_TOP_Y + 0.15 + i * 0.3, -0.25], [0.12, 0.3, 0.12], COLORS.chromeLight)
  }
  b.box(
    [1.2 + antennaSteps * 0.12, BOOMBOX_TOP_Y + antennaSteps * 0.3 + 0.09, -0.25],
    [0.18, 0.18, 0.18],
    COLORS.hot,
    { glow: true, anim: { kind: 'blink', phase: 0 } },
  )
}

export function buildHipHopClubModel(entrance: LandmarkEntrance): VoxelModel {
  const b = new VoxelBuilder()

  addPlinth(b, entrance.frontZ, COLORS.plinth)
  b.shell({ ...bodyBox(BODY_TOP_Y), cell: 0.5, color: COLORS.brick, jitter: 0.09 })
  addEntrance(b, entrance, { wall: COLORS.brick, trim: COLORS.trim, bulb: COLORS.amber })
  addStreetFront(b)
  addSideWalls(b)
  // 看板の上で踊るイコライザ（近づくと見える）
  addEqualizer(b, {
    columns: 9,
    rows: 5,
    baseY: BODY_TOP_Y + 0.12,
    z: LANDMARK_LAYOUT.bodyFrontZ + 0.45,
    pitchX: 0.36,
    barWidth: 0.26,
    barDepth: 0.2,
  })
  b.group([HIP_HOP_ICON.x, 0, HIP_HOP_ICON.z], addBoomboxIcon)

  return b.build()
}
