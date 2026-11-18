/**
 * Look Locker — 紺の試着室ブティック（Culture 西）。
 * 正面左右のショーウィンドウに、帽子をかぶった立体のマネキン。
 * 側面は試着室のカーテン窓。光はウィンドウの間接光だけ（点滅なし）。壁に絵柄は描かない。
 */
import { VoxelBuilder, type VoxelModel } from '../voxel/voxelBuilder'
import {
  addEntrance,
  addPlinth,
  bodyBox,
  LANDMARK_LAYOUT,
  type LandmarkEntrance,
} from './landmarkParts'

const COLORS = {
  plinth: '#121c30',
  body: '#1a2a48',
  bodyLight: '#24365a',
  trim: '#0a1424',
  frame: '#c8d4e4',
  windowBack: '#e8ecf2',
  softLight: '#f4e8d0',
  mannequin: '#d8d2c8',
  mannequinShade: '#b8b2a8',
  hatA: '#2a2a34',
  hatB: '#b84a3a',
  hatBand: '#d4b46a',
  scarf: '#4a78b8',
  rail: '#a8b0bc',
  curtain: '#6a2a3a',
  curtainFold: '#55202e',
} as const

const BODY_TOP_Y = 4.3

/** 立体のマネキン（台・脚・胴・首・頭・帽子）。足元の中心を (x, y, z) に置く */
function addMannequin(b: VoxelBuilder, x: number, y: number, z: number, hat: string, accent: string) {
  b.box([x, y + 0.03, z], [0.42, 0.06, 0.32], COLORS.mannequinShade)
  b.box([x, y + 0.35, z], [0.06, 0.6, 0.06], COLORS.rail)
  b.box([x, y + 0.85, z], [0.5, 0.42, 0.26], COLORS.mannequin)
  b.box([x, y + 1.12, z], [0.58, 0.14, 0.28], COLORS.mannequin)
  b.box([x, y + 1.12, z + 0.01], [0.6, 0.06, 0.29], accent)
  b.box([x, y + 1.25, z], [0.1, 0.12, 0.1], COLORS.mannequinShade)
  b.box([x, y + 1.43, z], [0.24, 0.26, 0.22], COLORS.mannequin)
  // 帽子（つば＋山＋リボン）
  b.box([x, y + 1.58, z], [0.44, 0.04, 0.38], hat)
  b.box([x, y + 1.7, z], [0.26, 0.2, 0.24], hat)
  b.box([x, y + 1.63, z], [0.27, 0.04, 0.25], COLORS.hatBand)
}

/** 正面のショーウィンドウ（明るい背景＋マネキン） */
function addShopWindows(b: VoxelBuilder, doorHalfWidth: number) {
  const { bodyHalfWidth, bodyFrontZ } = LANDMARK_LAYOUT
  const inner = doorHalfWidth + 0.4
  const outer = bodyHalfWidth - 0.18
  const cx = (inner + outer) / 2
  const width = outer - inner
  for (const side of [-1, 1] as const) {
    const x = side * cx
    b.box([x, 2.0, bodyFrontZ + 0.04], [width + 0.12, 2.7, 0.08], COLORS.frame)
    b.box([x, 2.0, bodyFrontZ + 0.07], [width - 0.08, 2.5, 0.03], COLORS.windowBack)
    b.box([x, 3.15, bodyFrontZ + 0.1], [width - 0.2, 0.04, 0.04], COLORS.softLight, { glow: true })
    addMannequin(
      b,
      x,
      0.7,
      bodyFrontZ + 0.3,
      side < 0 ? COLORS.hatA : COLORS.hatB,
      side < 0 ? COLORS.scarf : COLORS.hatBand,
    )
    // 窓台
    b.box([x, 0.62, bodyFrontZ + 0.12], [width + 0.2, 0.08, 0.24], COLORS.frame)
  }
}

/** 側面: 試着室のカーテン窓と付け柱 */
function addSides(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ, baseY } = LANDMARK_LAYOUT
  for (const side of [-1, 1] as const) {
    const x = side * bodyHalfWidth
    for (const z of [1.0, -1.4]) {
      b.box([x + side * 0.03, 2.3, z], [0.06, 1.9, 1.3], COLORS.frame)
      // カーテン（布＋立体のひだ）
      b.box([x + side * 0.05, 2.25, z], [0.04, 1.7, 1.12], COLORS.curtain)
      for (let i = 0; i < 4; i += 1) {
        b.box([x + side * 0.08, 2.25, z - 0.42 + i * 0.28], [0.04, 1.7, 0.1], COLORS.curtainFold)
      }
      b.box([x + side * 0.1, 3.3, z], [0.06, 0.05, 1.2], COLORS.softLight, { glow: true })
    }
    for (const z of [bodyFrontZ - 0.1, -0.2, bodyBackZ + 0.1]) {
      b.box(
        [x + side * 0.06, (baseY + BODY_TOP_Y) / 2, z],
        [0.12, BODY_TOP_Y - baseY, 0.26],
        COLORS.bodyLight,
      )
    }
  }
  // コーニス
  const midZ = (bodyFrontZ + bodyBackZ) / 2
  b.box([0, BODY_TOP_Y + 0.05, midZ], [bodyHalfWidth * 2 + 0.2, 0.12, bodyFrontZ - bodyBackZ + 0.2], COLORS.frame)
}

export function buildLookLockerModel(entrance: LandmarkEntrance): VoxelModel {
  const b = new VoxelBuilder()

  addPlinth(b, entrance.frontZ, COLORS.plinth)
  b.shell({ ...bodyBox(BODY_TOP_Y), cell: 0.5, color: COLORS.body, jitter: 0.06 })
  addEntrance(
    b,
    entrance,
    { wall: COLORS.body, trim: COLORS.trim, bulb: COLORS.softLight },
    { chaseBulbs: false },
  )
  addShopWindows(b, entrance.doorHalfWidth)
  addSides(b)

  return b.build()
}
