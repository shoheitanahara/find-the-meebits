/**
 * Jazz Bar — 古典的な劇場クラブ（Music & Art 東）。
 * 紺のレンガにクリーム色の石の付け柱と歯飾りのコーニス、真鍮の縁取り。
 * 入口には真鍮とガラスのキャノピー、裏に静かな電球列。
 * アーチ窓は琥珀色に灯るだけで、点滅・流れる光は使わない。
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
  plinth: '#0c1220',
  stoneBase: '#141c2c',
  brick: '#23365e',
  trim: '#0e1526',
  cream: '#ddd4bc',
  creamShade: '#c2b89e',
  brass: '#c9a24a',
  brassLight: '#e8c878',
  brassDark: '#6e5628',
  amber: '#ffb65a',
  bulb: '#ffd9a0',
  glass: '#2a3a58',
} as const

const BODY_TOP_Y = 4.75
const PILASTER = { width: 0.46, depth: 0.22 } as const

const ARCH_WINDOW_ROWS = [
  '..FFFF..',
  '.FAAAAF.',
  'FAAAAAAF',
  'FAAAAAAF',
  'FFFFFFFF',
  'FAAFFAAF',
  'FAAFFAAF',
  'FAAFFAAF',
  'FAAFFAAF',
  'FFFFFFFF',
] as const

const MEDALLION_ROWS = ['..BBB..', '.BLLLB.', 'BLBBBLB', 'BLB.BLB', 'BLBBBLB', '.BLLLB.', '..BBB..'] as const

/** 石の基部と真鍮の見切り */
function addBase(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ, baseY } = LANDMARK_LAYOUT
  const depth = bodyFrontZ - bodyBackZ
  const midZ = (bodyFrontZ + bodyBackZ) / 2
  b.box([0, baseY + 0.4, midZ], [bodyHalfWidth * 2 + 0.12, 0.8, depth + 0.12], COLORS.stoneBase)
  b.box([0, baseY + 0.83, midZ], [bodyHalfWidth * 2 + 0.16, 0.06, depth + 0.16], COLORS.brass)
}

/** 正面のクリーム色の付け柱（両端と扉脇）。柱頭は2段 */
function addPilasters(b: VoxelBuilder, doorHalfWidth: number) {
  const { bodyHalfWidth, bodyFrontZ, baseY } = LANDMARK_LAYOUT
  const top = BODY_TOP_Y - 0.45
  const xs = [doorHalfWidth + 0.6, bodyHalfWidth - PILASTER.width / 2]
  for (const side of [-1, 1] as const) {
    for (const ax of xs) {
      const x = side * ax
      b.box(
        [x, (baseY + top) / 2, bodyFrontZ + PILASTER.depth / 2],
        [PILASTER.width, top - baseY, PILASTER.depth],
        COLORS.cream,
      )
      // 縦溝（フルーティング）
      for (const dx of [-0.12, 0, 0.12]) {
        b.box([x + dx, (baseY + 1.0 + top - 0.3) / 2, bodyFrontZ + PILASTER.depth + 0.01], [0.04, top - baseY - 1.3, 0.02], COLORS.creamShade)
      }
      b.box([x, top - 0.08, bodyFrontZ + PILASTER.depth / 2 + 0.03], [PILASTER.width + 0.14, 0.16, PILASTER.depth + 0.08], COLORS.cream)
      b.box([x, top - 0.2, bodyFrontZ + PILASTER.depth / 2 + 0.02], [PILASTER.width + 0.06, 0.08, PILASTER.depth + 0.04], COLORS.brass)
    }
  }
}

/** 付け柱のあいだのアーチ窓（真鍮枠・琥珀の灯り）と真鍮の燭台 */
function addFrontWindows(b: VoxelBuilder, doorHalfWidth: number) {
  const { bodyHalfWidth, bodyFrontZ } = LANDMARK_LAYOUT
  const inner = doorHalfWidth + 0.6 + PILASTER.width / 2
  const outer = bodyHalfWidth - PILASTER.width
  const cx = (inner + outer) / 2
  for (const side of [-1, 1] as const) {
    b.pixels({
      rows: ARCH_WINDOW_ROWS,
      palette: { F: COLORS.brass, A: COLORS.amber },
      center: [side * cx, 2.2, bodyFrontZ],
      cell: 0.1,
      depth: 0.06,
      glow: 'A',
    })
    // 窓台
    b.box([side * cx, 1.65, bodyFrontZ + 0.08], [0.95, 0.08, 0.16], COLORS.cream)
  }
}

/** 歯飾りのコーニスと、中央の段状の冠（真鍮のメダリオン） */
function addCornice(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ } = LANDMARK_LAYOUT
  const depth = bodyFrontZ - bodyBackZ
  const midZ = (bodyFrontZ + bodyBackZ) / 2
  const frieze = BODY_TOP_Y - 0.3

  // フリーズ（真鍮の帯）と歯飾り
  b.box([0, frieze, bodyFrontZ + 0.05], [bodyHalfWidth * 2, 0.06, 0.1], COLORS.brass)
  for (let x = -bodyHalfWidth + 0.15; x <= bodyHalfWidth - 0.1; x += 0.3) {
    b.box([x, frieze + 0.14, bodyFrontZ + 0.08], [0.14, 0.14, 0.16], COLORS.cream)
  }
  // コーニス（張り出し）
  b.box([0, BODY_TOP_Y - 0.03, midZ], [bodyHalfWidth * 2 + 0.3, 0.16, depth + 0.3], COLORS.cream)
  b.box([0, BODY_TOP_Y + 0.08, midZ], [bodyHalfWidth * 2 + 0.16, 0.06, depth + 0.16], COLORS.creamShade)

  // 中央の冠（2段）＋メダリオン
  const z = bodyFrontZ - 0.25
  b.box([0, BODY_TOP_Y + 0.35, z], [3.2, 0.5, 0.5], COLORS.brick)
  b.box([0, BODY_TOP_Y + 0.63, z], [3.4, 0.08, 0.6], COLORS.cream)
  b.box([0, BODY_TOP_Y + 0.9, z], [1.4, 0.48, 0.5], COLORS.brick)
  b.box([0, BODY_TOP_Y + 1.17, z], [1.6, 0.08, 0.6], COLORS.cream)
  b.pixels({
    rows: MEDALLION_ROWS,
    palette: { B: COLORS.brass, L: COLORS.brassLight },
    center: [0, BODY_TOP_Y + 0.9, z + 0.25],
    cell: 0.06,
    depth: 0.04,
  })
  // 冠の両脇の真鍮の壺飾り
  for (const side of [-1, 1] as const) {
    b.box([side * 1.45, BODY_TOP_Y + 0.75, z], [0.18, 0.16, 0.18], COLORS.brass)
    b.box([side * 1.45, BODY_TOP_Y + 0.88, z], [0.1, 0.1, 0.1], COLORS.brassLight)
  }
}

/** 真鍮とガラスのキャノピー（看板の下に張り出す）と静かな電球列 */
function addCanopy(b: VoxelBuilder, entrance: LandmarkEntrance) {
  const halfW = entrance.doorHalfWidth + 0.75
  const z0 = entrance.frontZ - 0.05
  const z1 = entrance.frontZ + 0.95
  // EntrancePortal の発光バー（上面 3.26）と面が重ならない高さ
  const y = 3.3
  const midZ = (z0 + z1) / 2
  b.box([0, y, midZ], [halfW * 2, 0.08, z1 - z0], COLORS.glass)
  b.box([0, y + 0.06, z1], [halfW * 2 + 0.06, 0.12, 0.06], COLORS.brass)
  for (const side of [-1, 1] as const) {
    b.box([side * halfW, y + 0.06, midZ], [0.06, 0.12, z1 - z0], COLORS.brass)
    // 斜めの吊り材（段々）
    for (let i = 0; i < 3; i += 1) {
      b.box([side * (halfW - 0.2), y + 0.12 + i * 0.03, z1 - 0.15 - i * 0.3], [0.04, 0.04, 0.3], COLORS.brassDark)
    }
  }
  // 裏の電球（点滅なし）
  for (let x = -halfW + 0.25; x <= halfW - 0.2; x += 0.4) {
    b.box([x, y - 0.07, z1 - 0.15], [0.09, 0.06, 0.09], COLORS.bulb, { glow: true })
  }
}

/** 側面: アーチ窓と付け柱 */
function addSideWalls(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ, baseY } = LANDMARK_LAYOUT
  for (const side of [-1, 1] as const) {
    for (const z of [1.2, -0.6, -2.3]) {
      b.pixels({
        rows: ARCH_WINDOW_ROWS,
        palette: { F: COLORS.brass, A: COLORS.amber },
        center: [side * bodyHalfWidth, 2.55, z],
        cell: 0.1,
        depth: 0.06,
        facing: side > 0 ? 'right' : 'left',
        glow: 'A',
      })
    }
    for (const z of [bodyFrontZ - 0.05, 0.3, -1.45, bodyBackZ + 0.1]) {
      b.box(
        [side * (bodyHalfWidth + 0.06), (baseY + 0.86 + BODY_TOP_Y - 0.1) / 2, z],
        [0.12, BODY_TOP_Y - 0.96 - baseY, 0.3],
        COLORS.cream,
      )
    }
  }
}

export function buildJazzBarModel(entrance: LandmarkEntrance): VoxelModel {
  const b = new VoxelBuilder()

  addPlinth(b, entrance.frontZ, COLORS.plinth)
  b.box([0, LANDMARK_LAYOUT.baseY - 0.02, entrance.frontZ - 0.12], [7.02, 0.06, 0.12], COLORS.creamShade)
  b.shell({ ...bodyBox(BODY_TOP_Y), cell: 0.5, color: COLORS.brick, jitter: 0.08 })
  addBase(b)
  addEntrance(
    b,
    entrance,
    { wall: COLORS.stoneBase, trim: COLORS.trim, bulb: COLORS.bulb },
    { chaseBulbs: false },
  )
  addPilasters(b, entrance.doorHalfWidth)
  addFrontWindows(b, entrance.doorHalfWidth)
  addCornice(b)
  addCanopy(b, entrance)
  addSideWalls(b)

  return b.build()
}
