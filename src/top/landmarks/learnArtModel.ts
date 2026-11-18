/**
 * Learn Art — 静かな現代美術館（Music & Art 中央）。
 * 打放しコンクリートの低い箱に、黒い箱が少しずれて載る。
 * 正面は大きなガラスのショーケースに色面の作品が1点だけ。反対側は縦のスリット窓。
 * 原色・ネオン・点滅は使わず、上からの柔らかい間接光だけ。
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
  plinth: '#2a2826',
  paving: '#4a4744',
  concrete: '#b4b0aa',
  concreteShade: '#9c9892',
  formTie: '#7e7a74',
  charcoal: '#2c2b2e',
  charcoalLight: '#3a393d',
  trim: '#1e1d20',
  glass: '#1a1c22',
  /** 天井からの柔らかい光（点滅なし） */
  softLight: '#f2dcb4',
  gallery: '#e8e2d6',
  fieldDeep: '#2e3a52',
  fieldWarm: '#a8583c',
  fieldOchre: '#c89a54',
  bench: '#5a4638',
} as const

const TIER1_TOP_Y = 3.25

/** 2段目の黒い箱（左・奥へずらして載せ、右側はテラスにする） */
const TIER2 = {
  center: [-0.55, 4.1, -0.6],
  size: [5.0, 1.7, 4.8],
} as const
const TIER2_FRONT_Z = TIER2.center[2] + TIER2.size[2] / 2
const TIER2_TOP_Y = TIER2.center[1] + TIER2.size[1] / 2

/** 打放しの型枠目地と P コン（セパ穴）を壁の外側に足す */
function addConcreteTexture(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ, baseY } = LANDMARK_LAYOUT
  const depth = bodyFrontZ - bodyBackZ
  const midZ = (bodyFrontZ + bodyBackZ) / 2
  for (let y = baseY + 0.9; y < TIER1_TOP_Y; y += 0.9) {
    for (const side of [-1, 1] as const) {
      b.box([side * (bodyHalfWidth + 0.015), y, midZ], [0.03, 0.03, depth], COLORS.concreteShade)
      // P コン（等間隔の小さな丸穴）
      for (let z = bodyBackZ + 0.45; z < bodyFrontZ; z += 0.9) {
        b.box([side * (bodyHalfWidth + 0.02), y + 0.45, z], [0.03, 0.07, 0.07], COLORS.formTie)
      }
    }
  }
}

/** 正面左: 大きなガラスのショーケースに色面の作品を1点 */
function addShowcase(b: VoxelBuilder, doorHalfWidth: number) {
  const z = LANDMARK_LAYOUT.bodyFrontZ
  const left = -LANDMARK_LAYOUT.bodyHalfWidth + 0.2
  const right = -(doorHalfWidth + 0.4)
  const width = right - left
  const cx = (left + right) / 2
  const bottom = 0.65
  const top = 3.0
  const cy = (bottom + top) / 2

  // 黒い細枠・明るいギャラリー壁（奥）
  b.box([cx, cy, z + 0.04], [width, top - bottom, 0.08], COLORS.trim)
  b.box([cx, cy, z + 0.07], [width - 0.12, top - bottom - 0.12, 0.04], COLORS.gallery)
  // 天井の間接光
  b.box([cx, top - 0.1, z + 0.1], [width - 0.2, 0.04, 0.04], COLORS.softLight, { glow: true })

  // 色面の作品（深い紺の上に、にじむ2つの矩形）
  const artW = width * 0.6
  const artH = 1.35
  const artY = cy + 0.05
  b.box([cx, artY, z + 0.11], [artW, artH, 0.04], COLORS.fieldDeep)
  b.box([cx, artY + artH * 0.2, z + 0.135], [artW * 0.8, artH * 0.32, 0.02], COLORS.fieldWarm)
  b.box([cx, artY - artH * 0.22, z + 0.135], [artW * 0.8, artH * 0.26, 0.02], COLORS.fieldOchre)

  // 見る人のための低いベンチ
  b.box([cx, bottom + 0.18, z + 0.42], [width * 0.6, 0.08, 0.3], COLORS.bench)
  for (const dx of [-1, 1]) {
    b.box([cx + dx * width * 0.24, bottom + 0.07, z + 0.42], [0.06, 0.14, 0.24], COLORS.trim)
  }
}

/** 正面右: 縦のスリット窓（説明看板の後ろ。上部が看板の上に覗く） */
function addSlitWindows(b: VoxelBuilder, doorHalfWidth: number) {
  const z = LANDMARK_LAYOUT.bodyFrontZ
  const start = doorHalfWidth + 0.65
  for (let i = 0; i < 3; i += 1) {
    const x = start + i * 0.55
    b.box([x, 1.95, z + 0.03], [0.2, 2.3, 0.06], COLORS.glass)
    b.box([x, 2.95, z + 0.065], [0.14, 0.18, 0.02], COLORS.softLight, { glow: true })
  }
}

/** 2段目の黒い箱: 細い水平スリットの窓と、側面の縦ルーバー */
function addUpperVolume(b: VoxelBuilder) {
  b.shell({
    center: TIER2.center,
    size: TIER2.size,
    cell: 0.5,
    color: COLORS.charcoal,
    jitter: 0.03,
  })
  const [cx, , cz] = TIER2.center
  const [sx, , sz] = TIER2.size

  // 正面の水平スリット（中で灯る展示室）
  b.box([cx, TIER2_TOP_Y - 0.55, TIER2_FRONT_Z + 0.02], [sx - 0.8, 0.22, 0.04], COLORS.softLight, {
    glow: true,
  })
  // 屋根の薄いスラブ（少し張り出す）
  b.box([cx, TIER2_TOP_Y + 0.05, cz], [sx + 0.2, 0.1, sz + 0.2], COLORS.charcoalLight)

  // 左側面の縦ルーバー
  const x = cx - sx / 2 - 0.06
  for (let z = cz - sz / 2 + 0.3; z <= cz + sz / 2 - 0.2; z += 0.35) {
    b.box([x, TIER2.center[1], z], [0.12, TIER2.size[1] - 0.2, 0.06], COLORS.charcoalLight)
  }
}

/** 1段目の上のテラス（右手前）: 手すりと低い植栽 */
function addTerrace(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ } = LANDMARK_LAYOUT
  const terraceX0 = TIER2.center[0] + TIER2.size[0] / 2
  const y = TIER1_TOP_Y + 0.02
  // 屋上の笠木
  b.box([0, TIER1_TOP_Y + 0.04, bodyFrontZ - 0.05], [bodyHalfWidth * 2 + 0.1, 0.08, 0.12], COLORS.concreteShade)
  // ガラスの手すり（黒い笠木だけ見せる）
  b.box([(terraceX0 + bodyHalfWidth) / 2, y + 0.5, bodyFrontZ - 0.15], [bodyHalfWidth - terraceX0, 0.05, 0.05], COLORS.trim)
  b.box([bodyHalfWidth - 0.15, y + 0.5, -0.3], [0.05, 0.05, 5.6], COLORS.trim)
  // 低い植栽ボックス
  b.box([bodyHalfWidth - 0.45, y + 0.15, -0.6], [0.4, 0.3, 2.4], COLORS.concreteShade)
  b.box([bodyHalfWidth - 0.45, y + 0.36, -0.6], [0.34, 0.12, 2.3], '#3e5238')
}

export function buildLearnArtModel(entrance: LandmarkEntrance): VoxelModel {
  const b = new VoxelBuilder()

  addPlinth(b, entrance.frontZ, COLORS.plinth)
  // 正面の石畳の帯
  b.box([0, LANDMARK_LAYOUT.baseY - 0.02, entrance.frontZ - 0.12], [7.02, 0.06, 0.12], COLORS.paving)
  b.shell({ ...bodyBox(TIER1_TOP_Y), cell: 0.9, color: COLORS.concrete, jitter: 0.03 })
  addConcreteTexture(b)
  addEntrance(
    b,
    entrance,
    { wall: COLORS.concrete, trim: COLORS.trim, bulb: COLORS.softLight },
    { chaseBulbs: false },
  )
  addShowcase(b, entrance.doorHalfWidth)
  addSlitWindows(b, entrance.doorHalfWidth)
  addUpperVolume(b)
  addTerrace(b)

  return b.build()
}
