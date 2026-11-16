/**
 * Meebits Podcast — ウォールナット調の小さなスタジオ（Plaza 西）。
 * 点滅・波形・チェイスライトは使わず、木・真鍮・暖色のブース窓で上質に。
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
  plinth: '#1a1410',
  wood: '#5a3c2c',
  woodLight: '#8a5a3a',
  trim: '#2a1c14',
  brass: '#d4a86a',
  foam: '#2a221c',
  glassFrame: '#1a120e',
  /** 夜でも遠くから窓が読める暖色（点滅なし） */
  glassWarm: '#ffb060',
  onAir: '#5a1818',
  onAirSoft: '#e07060',
  mic: '#8a9098',
  micDark: '#1a1a1a',
  desk: '#3a2818',
  speaker: '#1e1814',
} as const

const BODY_TOP_Y = 4.35

function addStudioBody(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ } = LANDMARK_LAYOUT
  b.shell({ ...bodyBox(BODY_TOP_Y), cell: 0.5, color: COLORS.wood, jitter: 0.08 })

  b.box(
    [0, BODY_TOP_Y + 0.12, (bodyFrontZ + bodyBackZ) / 2],
    [bodyHalfWidth * 2 + 0.3, 0.24, bodyFrontZ - bodyBackZ + 0.25],
    COLORS.woodLight,
  )

  // 正面のコーニス／巾木（シルエット）
  b.box([0, BODY_TOP_Y - 0.1, bodyFrontZ + 0.04], [bodyHalfWidth * 2, 0.16, 0.08], COLORS.brass)
  b.box([0, 0.55, bodyFrontZ + 0.03], [bodyHalfWidth * 2 - 0.2, 0.12, 0.06], COLORS.woodLight)

  for (const side of [-1, 1] as const) {
    b.box(
      [side * (bodyHalfWidth - 0.12), 2.2, bodyFrontZ - 0.2],
      [0.28, 3.6, 0.28],
      COLORS.woodLight,
    )
  }
}

/**
 * 正面ディテール。
 * EntrancePortal の黒い扉板が中央を覆うので、窓は扉の左右に置く。
 */
function addBoothFront(b: VoxelBuilder, doorHalfWidth: number) {
  const z = LANDMARK_LAYOUT.bodyFrontZ
  const windowX = doorHalfWidth + 0.95

  for (const side of [-1, 1] as const) {
    const x = side * windowX
    b.box([x, 1.9, z + 0.06], [1.45, 1.85, 0.14], COLORS.glassFrame)
    b.box([x, 1.9, z + 0.14], [1.15, 1.45, 0.06], COLORS.glassWarm, { glow: true })
    b.box([x, 1.9, z + 0.18], [1.15, 0.07, 0.04], COLORS.mic)
    b.box([x, 1.9, z + 0.18], [0.07, 1.45, 0.04], COLORS.mic)
    b.box([x, 1.35, z - 0.05], [0.7, 0.12, 0.45], COLORS.desk)
    b.box([x, 1.65, z], [0.08, 0.4, 0.08], COLORS.mic)
    b.box([x, 1.92, z + 0.06], [0.2, 0.2, 0.2], COLORS.micDark)
  }

  for (const [i, x] of [-2.55, 2.55].entries()) {
    b.box([x, 2.05 + (i % 2) * 0.08, z + 0.04], [0.5, 1.2, 0.14], COLORS.foam)
  }

  for (const side of [-1, 1] as const) {
    b.box([side * 2.85, 0.9, z + 0.3], [0.7, 1.2, 0.5], COLORS.speaker)
    b.box([side * 2.85, 1.15, z + 0.58], [0.36, 0.1, 0.1], COLORS.micDark)
    b.box([side * 2.85, 0.7, z + 0.58], [0.24, 0.1, 0.1], COLORS.micDark)
  }

  // ON AIR（タイトル看板の下端より下。点滅なし）
  b.box([0, 3.0, z + 0.22], [2.1, 0.36, 0.2], COLORS.onAir)
  b.box([0, 3.0, z + 0.34], [1.6, 0.18, 0.05], COLORS.onAirSoft, { glow: true })
  b.box([-0.8, 3.0, z + 0.36], [0.14, 0.14, 0.08], COLORS.onAirSoft, { glow: true })
}

function addSideDetails(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ } = LANDMARK_LAYOUT
  for (const side of [-1, 1] as const) {
    b.box(
      [side * (bodyHalfWidth + 0.02), BODY_TOP_Y - 0.06, (bodyFrontZ + bodyBackZ) / 2],
      [0.05, 0.08, bodyFrontZ - bodyBackZ],
      COLORS.brass,
    )
  }
  b.box([2.2, BODY_TOP_Y + 0.45, -0.8], [0.1, 0.7, 0.1], COLORS.mic)
  b.box([2.2, BODY_TOP_Y + 0.85, -0.8], [0.7, 0.08, 0.08], COLORS.mic)
  b.box([2.2, BODY_TOP_Y + 0.95, -0.8], [0.14, 0.14, 0.14], COLORS.brass, { glow: true })
}

export function buildPodcastStudioModel(entrance: LandmarkEntrance): VoxelModel {
  const b = new VoxelBuilder()

  addPlinth(b, entrance.frontZ, COLORS.plinth)
  addStudioBody(b)
  addEntrance(
    b,
    entrance,
    { wall: COLORS.wood, trim: COLORS.trim, bulb: COLORS.brass },
    { chaseBulbs: false },
  )
  addBoothFront(b, entrance.doorHalfWidth)
  addSideDetails(b)

  return b.build()
}
