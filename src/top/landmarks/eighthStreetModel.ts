/**
 * 8th Street — 夜のブリック町屋（Plaza 東）。
 * 正面だけでなく側面にも窓・コーニス・避難階段を付け、路地の厚みを出す。
 */
import { VoxelBuilder, type VoxelModel } from '../voxel/voxelBuilder'
import {
  addEntrance,
  addPlinth,
  iconBesideEntrance,
  LANDMARK_LAYOUT,
  type LandmarkEntrance,
} from './landmarkParts'

const COLORS = {
  plinth: '#2a201c',
  brick: '#8a4e3c',
  brickDark: '#5a3228',
  wing: '#6a3c32',
  roof: '#1e161c',
  iron: '#2a2228',
  ironLight: '#3a3238',
  brass: '#d4a86a',
  /** 夜の窓明かり（静止。ネオンではない） */
  windowWarm: '#ffc080',
  mortar: '#3a2a28',
  blade: '#1a1216',
} as const

/** 主棟はやや右寄せ（L字の横棟を左に逃がす） */
const MAIN = {
  centerX: 0.55,
  halfWidth: 2.35,
  frontZ: 3.15,
  backZ: -3.25,
  topY: 4.55,
} as const

/** 左の横棟（footprint.extraBoxes と揃える） */
const WING = {
  centerX: -3.35,
  halfWidth: 1.85,
  frontZ: 1.5,
  backZ: -2.9,
  topY: 3.55,
} as const

/** 街灯彫刻（説明看板の反対側＝右） */
export const EIGHTH_STREET_ICON = iconBesideEntrance(1, 0.6, 0.6)

/** 正面向きの暖色窓 */
function addFrontWindow(b: VoxelBuilder, x: number, y: number, z: number, w = 0.85, h = 1.05) {
  b.box([x, y, z + 0.04], [w + 0.18, h + 0.18, 0.12], COLORS.brickDark)
  b.box([x, y, z + 0.11], [w, h, 0.06], COLORS.windowWarm, { glow: true })
  b.box([x, y, z + 0.15], [w, 0.06, 0.03], COLORS.mortar)
  b.box([x, y, z + 0.15], [0.06, h, 0.03], COLORS.mortar)
}

/**
 * 側面向きの暖色窓。
 * side=+1 は +X 外壁、side=-1 は -X 外壁。
 */
function addSideWindow(
  b: VoxelBuilder,
  side: -1 | 1,
  wallX: number,
  y: number,
  z: number,
  w = 0.8,
  h = 0.95,
) {
  const outward = side * 0.04
  b.box([wallX + outward, y, z], [0.12, h + 0.18, w + 0.18], COLORS.brickDark)
  b.box([wallX + side * 0.1, y, z], [0.06, h, w], COLORS.windowWarm, { glow: true })
  b.box([wallX + side * 0.14, y, z], [0.03, 0.06, w], COLORS.mortar)
  b.box([wallX + side * 0.14, y, z], [0.03, h, 0.06], COLORS.mortar)
}

/** 側面に沿ったコーニス／帯／巾木 */
function addSideCourses(b: VoxelBuilder, wallX: number, z0: number, z1: number, topY: number) {
  const midZ = (z0 + z1) / 2
  const depth = Math.abs(z1 - z0)
  // 屋根下コーニス
  b.box([wallX, topY - 0.08, midZ], [0.14, 0.16, depth + 0.1], COLORS.roof)
  // 中段の帯
  b.box([wallX, 2.35, midZ], [0.1, 0.1, depth - 0.2], COLORS.brickDark)
  // 巾木
  b.box([wallX, 0.5, midZ], [0.12, 0.2, depth - 0.15], COLORS.brickDark)
}

function addMainHouse(b: VoxelBuilder) {
  const { baseY } = LANDMARK_LAYOUT
  const width = MAIN.halfWidth * 2
  const depth = MAIN.frontZ - MAIN.backZ
  const height = MAIN.topY - baseY
  const rightX = MAIN.centerX + MAIN.halfWidth
  const leftX = MAIN.centerX - MAIN.halfWidth

  b.shell({
    center: [MAIN.centerX, (baseY + MAIN.topY) / 2, (MAIN.frontZ + MAIN.backZ) / 2],
    size: [width, height, depth],
    cell: 0.45,
    color: COLORS.brick,
    jitter: 0.12,
  })

  b.box(
    [MAIN.centerX, MAIN.topY + 0.12, (MAIN.frontZ + MAIN.backZ) / 2],
    [width + 0.3, 0.24, depth + 0.25],
    COLORS.roof,
  )

  // 正面の目地ライン
  for (let i = 0; i < 8; i += 1) {
    b.box(
      [MAIN.centerX, 0.7 + i * 0.45, MAIN.frontZ + 0.02],
      [width - 0.3, 0.035, 0.04],
      COLORS.mortar,
    )
  }

  // 正面窓（扉の左右）
  for (const [x, y] of [
    [-1.35, 1.55],
    [1.9, 1.55],
    [-1.35, 2.95],
    [1.9, 2.95],
  ] as const) {
    addFrontWindow(b, MAIN.centerX + x, y, MAIN.frontZ)
  }

  // 右側面（+X）: コーニス＋窓3つ
  addSideCourses(b, rightX + 0.02, MAIN.backZ, MAIN.frontZ, MAIN.topY)
  for (const [y, z] of [
    [1.5, 1.6],
    [1.5, -0.2],
    [1.5, -1.9],
    [3.0, 1.6],
    [3.0, -0.2],
    [3.0, -1.9],
  ] as const) {
    addSideWindow(b, 1, rightX, y, z)
  }

  // 左側面（-X）: 横棟と重ならない奥側だけ窓
  addSideCourses(b, leftX - 0.02, MAIN.backZ, -0.4, MAIN.topY)
  for (const [y, z] of [
    [1.5, -1.2],
    [1.5, -2.4],
    [3.0, -1.2],
    [3.0, -2.4],
  ] as const) {
    addSideWindow(b, -1, leftX, y, z, 0.75, 0.9)
  }
}

function addSideWing(b: VoxelBuilder) {
  const { baseY } = LANDMARK_LAYOUT
  const width = WING.halfWidth * 2
  const depth = WING.frontZ - WING.backZ
  const height = WING.topY - baseY
  const leftX = WING.centerX - WING.halfWidth
  const rightX = WING.centerX + WING.halfWidth

  b.shell({
    center: [WING.centerX, (baseY + WING.topY) / 2, (WING.frontZ + WING.backZ) / 2],
    size: [width, height, depth],
    cell: 0.45,
    color: COLORS.wing,
    jitter: 0.1,
  })
  b.box(
    [WING.centerX, WING.topY + 0.1, (WING.frontZ + WING.backZ) / 2],
    [width + 0.22, 0.2, depth + 0.18],
    COLORS.roof,
  )

  addFrontWindow(b, WING.centerX, 1.9, WING.frontZ, 1.0, 1.15)

  // 横棟の左側面
  addSideCourses(b, leftX - 0.02, WING.backZ, WING.frontZ, WING.topY)
  for (const [y, z] of [
    [1.45, 0.5],
    [1.45, -1.3],
    [2.7, 0.5],
    [2.7, -1.3],
  ] as const) {
    addSideWindow(b, -1, leftX, y, z, 0.7, 0.85)
  }

  // 横棟の手前〜側面のつなぎ（角柱）
  b.box([rightX - 0.08, (baseY + WING.topY) / 2, WING.frontZ - 0.1], [0.2, height, 0.2], COLORS.brickDark)
}

/**
 * 右側面の鉄製避難階段。
 * 厚い床板で側面を隠さないよう、細い骨組み＋小さな踏み板にする。
 */
function addFireEscape(b: VoxelBuilder) {
  const wallX = MAIN.centerX + MAIN.halfWidth
  const railX = wallX + 0.45
  for (let level = 0; level < 3; level += 1) {
    const y = 1.1 + level * 1.1
    // 壁から突き出す細い梁
    for (const z of [1.8, 0.6, -0.6, -1.8] as const) {
      b.box([wallX + 0.22, y, z], [0.4, 0.08, 0.08], COLORS.iron)
    }
    // 横桟（踊り場の代わり）
    b.box([railX, y, 0], [0.08, 0.08, 3.6], COLORS.iron)
    // 手すり
    b.box([railX, y + 0.55, 0], [0.06, 0.06, 3.6], COLORS.ironLight)
    b.box([railX, y + 0.28, 1.8], [0.06, 0.55, 0.06], COLORS.iron)
    b.box([railX, y + 0.28, -1.8], [0.06, 0.55, 0.06], COLORS.iron)
    // 小さな踏み板（隙間を空けて壁面を見せる）
    for (const z of [1.5, 0.3, -0.9] as const) {
      b.box([wallX + 0.28, y + 0.02, z], [0.35, 0.06, 0.55], COLORS.ironLight)
    }
  }
  // 地上への梯子
  b.box([railX, 0.75, 1.9], [0.06, 1.3, 0.06], COLORS.iron)
  for (let i = 0; i < 4; i += 1) {
    b.box([railX, 0.35 + i * 0.28, 1.9], [0.06, 0.05, 0.32], COLORS.ironLight)
  }
}

/** 縦の刃看板（真鍮の細い光） */
function addBladeSign(b: VoxelBuilder) {
  const x = MAIN.centerX + MAIN.halfWidth + 0.42
  b.box([x, 2.9, 2.35], [0.26, 2.6, 0.55], COLORS.blade)
  b.box([x + 0.14, 2.9, 2.35], [0.06, 2.2, 0.4], COLORS.brass, { glow: true })
}

/** 屋上の低いウォータータワー（看板より下に収める） */
function addWaterTower(b: VoxelBuilder) {
  const x = MAIN.centerX + 0.8
  const z = -1.4
  b.box([x - 0.35, MAIN.topY + 0.35, z], [0.12, 0.7, 0.12], COLORS.iron)
  b.box([x + 0.35, MAIN.topY + 0.35, z], [0.12, 0.7, 0.12], COLORS.iron)
  b.box([x, MAIN.topY + 0.85, z], [1.0, 0.85, 1.0], COLORS.ironLight)
  b.box([x, MAIN.topY + 1.4, z], [1.15, 0.2, 1.15], COLORS.roof)
}

/** 建物横のクラシックス街灯 */
function addStreetLampIcon(b: VoxelBuilder) {
  b.box([0, 0.14, 0], [0.85, 0.28, 0.85], COLORS.plinth)
  b.box([0, 1.4, 0], [0.18, 2.5, 0.18], COLORS.iron)
  b.box([0, 2.75, 0], [0.7, 0.12, 0.12], COLORS.iron)
  b.box([0.28, 2.62, 0], [0.36, 0.4, 0.36], COLORS.windowWarm, { glow: true })
  b.box([0.28, 2.9, 0], [0.42, 0.1, 0.42], COLORS.iron)
}

export function buildEighthStreetModel(entrance: LandmarkEntrance): VoxelModel {
  const b = new VoxelBuilder()

  addPlinth(b, entrance.frontZ, COLORS.plinth)
  addMainHouse(b)
  addSideWing(b)
  addEntrance(
    b,
    entrance,
    { wall: COLORS.brickDark, trim: COLORS.blade, bulb: COLORS.brass },
    { chaseBulbs: false },
  )
  addFireEscape(b)
  addBladeSign(b)
  addWaterTower(b)
  b.group([EIGHTH_STREET_ICON.x, 0, EIGHTH_STREET_ICON.z], addStreetLampIcon)

  return b.build()
}
