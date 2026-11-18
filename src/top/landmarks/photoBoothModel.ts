/**
 * Photo Booth — レトロな写真館（Culture 東）。
 * 紺の建物に、色見本の帯（撮影背景の色）を軒に並べる。
 * 入口の左に赤いカーテンの証明写真ブース、その横に細い灯りのスリット窓。
 * 壁に絵柄は描かない。
 * 右側は Visit Pass の看板が立つので控えめに。光は静的なものだけ。
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
  plinth: '#121820',
  body: '#1a2438',
  bodyLight: '#243250',
  trim: '#0a1018',
  frame: '#c8d0dc',
  booth: '#d8cfc0',
  boothTrim: '#8a6a3a',
  curtain: '#a82a34',
  curtainFold: '#86202a',
  softLight: '#f4e6c8',
} as const

/** 撮影背景の色見本（以前の外観から引き継ぐ） */
const SWATCHES = ['#638596', '#f2c94c', '#8550a0', '#e07a6a', '#3d6bb3'] as const

const BODY_TOP_Y = 4.3

/** 入口の左: 証明写真ブース（クリーム色の筐体＋赤いカーテン） */
function addBooth(b: VoxelBuilder, doorHalfWidth: number) {
  const { bodyFrontZ, baseY } = LANDMARK_LAYOUT
  const x = -(doorHalfWidth + 0.92)
  const width = 1.0
  const depth = 0.5
  const top = 2.75
  const z = bodyFrontZ + depth / 2
  b.box([x, (baseY + top) / 2, z], [width, top - baseY, depth], COLORS.booth)
  b.box([x, top + 0.05, z], [width + 0.1, 0.1, depth + 0.1], COLORS.boothTrim)
  // 「PHOTO」看板の代わりの光る帯
  b.box([x, top - 0.25, bodyFrontZ + depth + 0.01], [width - 0.2, 0.2, 0.02], COLORS.softLight, {
    glow: true,
  })
  // 赤いカーテン（布＋立体のひだ）
  const curtainZ = bodyFrontZ + depth + 0.02
  b.box([x - 0.1, 1.4, curtainZ], [0.72, 1.3, 0.04], COLORS.curtain)
  for (let i = 0; i < 3; i += 1) {
    b.box([x - 0.34 + i * 0.24, 1.4, curtainZ + 0.03], [0.08, 1.3, 0.04], COLORS.curtainFold)
  }
  // 写真の取り出し口
  b.box([x + 0.34, 1.0, bodyFrontZ + depth + 0.01], [0.18, 0.06, 0.02], COLORS.trim)
}

/** ブースの外側の細いスリット窓（静かな灯り） */
function addSlitWindow(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ } = LANDMARK_LAYOUT
  const x = -(bodyHalfWidth - 0.3)
  b.box([x, 2.05, bodyFrontZ + 0.04], [0.36, 2.4, 0.08], COLORS.frame)
  b.box([x, 2.05, bodyFrontZ + 0.07], [0.22, 2.24, 0.03], COLORS.softLight, { glow: true })
}

/** 軒の色見本の帯（看板の上の肩に並べる） */
function addSwatchFascia(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ } = LANDMARK_LAYOUT
  const midZ = (bodyFrontZ + bodyBackZ) / 2
  b.box([0, BODY_TOP_Y + 0.05, midZ], [bodyHalfWidth * 2 + 0.2, 0.1, bodyFrontZ - bodyBackZ + 0.2], COLORS.frame)
  const width = (bodyHalfWidth * 2) / SWATCHES.length
  SWATCHES.forEach((hex, i) => {
    const x = -bodyHalfWidth + width * (i + 0.5)
    b.box([x, BODY_TOP_Y + 0.35, bodyFrontZ - 0.05], [width - 0.08, 0.5, 0.1], hex)
  })
}

/** 側面: 付け柱と縦長の窓 */
function addSides(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ, baseY } = LANDMARK_LAYOUT
  for (const side of [-1, 1] as const) {
    const x = side * bodyHalfWidth
    for (const z of [0.9, -1.5]) {
      b.box([x + side * 0.03, 2.3, z], [0.06, 1.9, 0.9], COLORS.frame)
      b.box([x + side * 0.05, 2.3, z], [0.04, 1.74, 0.74], COLORS.trim)
      b.box([x + side * 0.07, 3.0, z], [0.02, 0.2, 0.74], COLORS.softLight, { glow: true })
    }
    for (const z of [bodyFrontZ - 0.1, -0.3, bodyBackZ + 0.1]) {
      b.box([x + side * 0.06, (baseY + BODY_TOP_Y) / 2, z], [0.12, BODY_TOP_Y - baseY, 0.26], COLORS.bodyLight)
    }
  }
}

/** 入口右: 小さな窓（看板の上に覗く高さ） */
function addRightWindow(b: VoxelBuilder, doorHalfWidth: number) {
  const { bodyHalfWidth, bodyFrontZ } = LANDMARK_LAYOUT
  const inner = doorHalfWidth + 0.4
  const outer = bodyHalfWidth - 0.2
  const cx = (inner + outer) / 2
  b.box([cx, 2.7, bodyFrontZ + 0.04], [outer - inner, 0.9, 0.08], COLORS.frame)
  b.box([cx, 2.7, bodyFrontZ + 0.07], [outer - inner - 0.14, 0.76, 0.03], COLORS.softLight, {
    glow: true,
  })
}

export function buildPhotoBoothModel(entrance: LandmarkEntrance): VoxelModel {
  const b = new VoxelBuilder()

  addPlinth(b, entrance.frontZ, COLORS.plinth)
  b.shell({ ...bodyBox(BODY_TOP_Y), cell: 0.5, color: COLORS.body, jitter: 0.06 })
  addEntrance(
    b,
    entrance,
    { wall: COLORS.body, trim: COLORS.trim, bulb: COLORS.softLight },
    { chaseBulbs: false },
  )
  addBooth(b, entrance.doorHalfWidth)
  addSlitWindow(b)
  addRightWindow(b, entrance.doorHalfWidth)
  addSwatchFascia(b)
  addSides(b)

  return b.build()
}
