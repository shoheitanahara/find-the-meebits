/**
 * Meebits Runway — モノトーンのファッションハウス（Culture 中央）。
 * 黒い艶のファサードに白い縦フィン、左右は内側から灯るすりガラス窓。
 * 扉の前の踏み段に白いランウェイ。光は静的なものだけ。
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
  plinth: '#0a0a0a',
  body: '#141414',
  bodyGloss: '#1e1e1e',
  fin: '#e8e8e8',
  trim: '#050505',
  lightBox: '#f4f2ee',
  /** すりガラス越しの柔らかい白 */
  frosted: '#cfccc6',
  housing: '#121212',
  runway: '#f0f0f0',
  runwayEdge: '#bdbdbd',
  steel: '#8a8a8a',
} as const

const BODY_TOP_Y = 4.4

/** 正面の白い縦フィン（扉の両脇から外へ等間隔） */
function addFins(b: VoxelBuilder, doorHalfWidth: number) {
  const { bodyHalfWidth, bodyFrontZ, baseY } = LANDMARK_LAYOUT
  const top = BODY_TOP_Y - 0.2
  for (const side of [-1, 1] as const) {
    for (const ax of [doorHalfWidth + 0.45, bodyHalfWidth - 0.08]) {
      b.box(
        [side * ax, (baseY + top) / 2, bodyFrontZ + 0.12],
        [0.12, top - baseY, 0.24],
        COLORS.fin,
      )
    }
  }
  // 上端の白い帯
  b.box([0, BODY_TOP_Y - 0.12, bodyFrontZ + 0.1], [bodyHalfWidth * 2, 0.12, 0.2], COLORS.fin)
}

/** 左右のすりガラス窓（内側から柔らかく灯る。絵柄は入れない） */
function addFrostedWindows(b: VoxelBuilder, doorHalfWidth: number) {
  const { bodyHalfWidth, bodyFrontZ } = LANDMARK_LAYOUT
  const inner = doorHalfWidth + 0.51
  const outer = bodyHalfWidth - 0.14
  const cx = (inner + outer) / 2
  const width = outer - inner
  for (const side of [-1, 1] as const) {
    const x = side * cx
    b.box([x, 2.0, bodyFrontZ + 0.03], [width, 2.6, 0.06], COLORS.trim)
    b.box([x, 2.0, bodyFrontZ + 0.07], [width - 0.12, 2.48, 0.03], COLORS.frosted, { glow: true })
    // 細い黒の横桟（3段）
    for (const y of [1.2, 2.0, 2.8]) {
      b.box([x, y, bodyFrontZ + 0.09], [width - 0.12, 0.04, 0.02], COLORS.trim)
    }
  }
}

/**
 * 扉の前の踏み段（EntrancePortal: 上面 0.24・z = frontZ-0.2〜+0.9）の上に白いランウェイ。
 * 入口の張り出しの中は見えないので、扉の外側にだけ敷く。
 */
function addRunway(b: VoxelBuilder, frontZ: number) {
  const z0 = frontZ + 0.05
  const z1 = frontZ + 0.85
  b.box([0, 0.26, (z0 + z1) / 2], [1.6, 0.04, z1 - z0], COLORS.runwayEdge)
  b.box([0, 0.29, (z0 + z1) / 2], [1.3, 0.02, z1 - z0], COLORS.runway, { glow: true })
}

/** 側面: 黒いパネルの目地と白い縦スリット、屋上のスポットライト */
function addSidesAndRoof(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ, baseY } = LANDMARK_LAYOUT
  for (const side of [-1, 1] as const) {
    const x = side * (bodyHalfWidth + 0.02)
    for (let z = bodyBackZ + 0.75; z < bodyFrontZ - 0.3; z += 1.5) {
      b.box([x, (baseY + BODY_TOP_Y) / 2, z], [0.04, BODY_TOP_Y - baseY - 0.2, 0.06], COLORS.bodyGloss)
      b.box([x + side * 0.01, 2.4, z + 0.75], [0.03, 2.2, 0.1], COLORS.lightBox, { glow: true })
    }
  }
  // 屋上の笠木
  const midZ = (bodyFrontZ + bodyBackZ) / 2
  b.box([0, BODY_TOP_Y + 0.05, midZ], [bodyHalfWidth * 2 + 0.12, 0.1, bodyFrontZ - bodyBackZ + 0.12], COLORS.trim)
  // 屋上のスポットライト（ランウェイを照らす向き）
  for (const x of [-1.6, 1.6]) {
    b.box([x, BODY_TOP_Y + 0.3, bodyFrontZ - 0.4], [0.08, 0.4, 0.08], COLORS.steel)
    b.box([x, BODY_TOP_Y + 0.55, bodyFrontZ - 0.3], [0.3, 0.26, 0.36], COLORS.housing)
    b.box([x, BODY_TOP_Y + 0.55, bodyFrontZ - 0.1], [0.2, 0.18, 0.04], COLORS.lightBox, { glow: true })
  }
}

export function buildRunwayModel(entrance: LandmarkEntrance): VoxelModel {
  const b = new VoxelBuilder()

  addPlinth(b, entrance.frontZ, COLORS.plinth)
  b.shell({ ...bodyBox(BODY_TOP_Y), cell: 0.5, color: COLORS.body, jitter: 0.05 })
  addEntrance(
    b,
    entrance,
    { wall: COLORS.body, trim: COLORS.trim, bulb: COLORS.lightBox },
    { chaseBulbs: false },
  )
  addFins(b, entrance.doorHalfWidth)
  addFrostedWindows(b, entrance.doorHalfWidth)
  addRunway(b, entrance.frontZ)
  addSidesAndRoof(b)

  return b.build()
}
