/**
 * Hip Hop Club — アールデコのナイトクラブ（Music & Art 西）。
 * 深い紫のレンガに黒御影石の基部、金の付け柱と段状の冠（ジッグラト）。
 * 光は付け柱の縦ネオンと、冠を下から照らす静かなアップライトだけ。
 * 入口には真鍮のポールとベルベットロープ。
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
  plinth: '#120c16',
  granite: '#1a1620',
  graniteLight: '#2a2430',
  brick: '#3e2652',
  brickDark: '#2e1c3e',
  trim: '#140c1a',
  gold: '#c9a24a',
  goldLight: '#e8c878',
  goldDark: '#7a5e28',
  neon: '#d04ae8',
  uplight: '#ffcf8a',
  windowFrame: '#1a1020',
  windowGlow: '#8a3aa8',
  velvet: '#7a1428',
  marble: '#2a2228',
} as const

const BODY_TOP_Y = 4.6
const PILASTER_WIDTH = 0.42

/** 黒御影石の基部と金の見切り */
function addGraniteBase(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ, baseY } = LANDMARK_LAYOUT
  const depth = bodyFrontZ - bodyBackZ
  const midZ = (bodyFrontZ + bodyBackZ) / 2
  b.box([0, baseY + 0.45, midZ], [bodyHalfWidth * 2 + 0.12, 0.9, depth + 0.12], COLORS.granite)
  b.box([0, baseY + 0.93, midZ], [bodyHalfWidth * 2 + 0.16, 0.06, depth + 0.16], COLORS.gold)
}

/**
 * 正面の金の付け柱（段状の柱頭）と縦ネオン。
 * 扉の両脇と建物の両端に1本ずつ。
 */
function addPilasters(b: VoxelBuilder, doorHalfWidth: number) {
  const { bodyHalfWidth, bodyFrontZ, baseY } = LANDMARK_LAYOUT
  const xs = [doorHalfWidth + 0.55, bodyHalfWidth - PILASTER_WIDTH / 2]
  const top = 3.25
  for (const side of [-1, 1] as const) {
    for (const [i, ax] of xs.entries()) {
      const x = side * ax
      b.box([x, (baseY + top) / 2, bodyFrontZ + 0.1], [PILASTER_WIDTH, top - baseY, 0.2], COLORS.brickDark)
      // 金の縁取り（左右）
      for (const dx of [-1, 1]) {
        b.box(
          [x + dx * (PILASTER_WIDTH / 2 - 0.03), (baseY + 0.96 + top) / 2, bodyFrontZ + 0.22],
          [0.05, top - baseY - 0.96, 0.04],
          COLORS.gold,
        )
      }
      // 中央の縦ネオン（内側の柱だけ。点滅なし）
      if (i === 0) {
        b.box([x, 2.15, bodyFrontZ + 0.22], [0.07, 2.1, 0.04], COLORS.neon, { glow: true })
      }
      // 段状の柱頭
      b.box([x, top + 0.06, bodyFrontZ + 0.16], [PILASTER_WIDTH + 0.12, 0.12, 0.32], COLORS.gold)
      b.box([x, top - 0.06, bodyFrontZ + 0.14], [PILASTER_WIDTH + 0.04, 0.12, 0.28], COLORS.goldDark)
    }
  }
}

/** 付け柱のあいだの縦長の窓（金枠・紫の灯り） */
function addFrontWindows(b: VoxelBuilder, doorHalfWidth: number) {
  const { bodyHalfWidth, bodyFrontZ } = LANDMARK_LAYOUT
  const inner = doorHalfWidth + 0.55 + PILASTER_WIDTH / 2
  const outer = bodyHalfWidth - PILASTER_WIDTH
  const cx = (inner + outer) / 2
  const width = outer - inner - 0.12
  for (const side of [-1, 1] as const) {
    const x = side * cx
    b.box([x, 2.15, bodyFrontZ + 0.04], [width, 2.1, 0.08], COLORS.gold)
    b.box([x, 2.15, bodyFrontZ + 0.07], [width - 0.1, 2.0, 0.04], COLORS.windowFrame)
    b.box([x, 2.4, bodyFrontZ + 0.09], [width - 0.22, 1.3, 0.02], COLORS.windowGlow, { glow: true })
    // 扇形の欄間（段々）
    for (let i = 0; i < 3; i += 1) {
      b.box([x, 3.05 + i * 0.07, bodyFrontZ + 0.08], [width - 0.1 - i * 0.18, 0.05, 0.04], COLORS.goldLight)
    }
    // 窓の金の縦桟
    b.box([x, 2.4, bodyFrontZ + 0.11], [0.04, 1.3, 0.02], COLORS.gold)
  }
}

/**
 * 段状の冠（ジッグラト）。タイトル看板の上にそびえ、下からアップライトで照らす。
 */
function addCrown(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ } = LANDMARK_LAYOUT
  const depth = bodyFrontZ - bodyBackZ
  const midZ = (bodyFrontZ + bodyBackZ) / 2

  // コーニス（金の帯＋黒）
  b.box([0, BODY_TOP_Y - 0.1, midZ], [bodyHalfWidth * 2 + 0.2, 0.2, depth + 0.2], COLORS.trim)
  b.box([0, BODY_TOP_Y + 0.03, midZ], [bodyHalfWidth * 2 + 0.3, 0.06, depth + 0.3], COLORS.gold)

  // 正面のジッグラト（3段）
  const tiers = [
    { halfW: 2.4, h: 0.45 },
    { halfW: 1.6, h: 0.4 },
    { halfW: 0.8, h: 0.4 },
  ]
  let y = BODY_TOP_Y + 0.06
  const z = bodyFrontZ - 0.3
  for (const [i, tier] of tiers.entries()) {
    b.box([0, y + tier.h / 2, z], [tier.halfW * 2, tier.h, 0.6], i % 2 === 0 ? COLORS.brickDark : COLORS.brick)
    b.box([0, y + tier.h - 0.03, z + 0.31], [tier.halfW * 2, 0.06, 0.03], COLORS.gold)
    y += tier.h
  }
  // 頂部の金の尖塔
  b.box([0, y + 0.25, z], [0.16, 0.5, 0.16], COLORS.goldLight)
  // 冠を照らすアップライト（静かな暖色）
  for (const x of [-1.9, 1.9]) {
    b.box([x, BODY_TOP_Y + 0.12, z + 0.36], [0.22, 0.08, 0.1], COLORS.uplight, { glow: true })
  }

  // 冠の段の左右に金の放射線（サンバースト）
  for (const side of [-1, 1] as const) {
    for (let i = 0; i < 3; i += 1) {
      b.box(
        [side * (2.55 + i * 0.12), BODY_TOP_Y + 0.25 + i * 0.12, z + 0.2],
        [0.1, 0.4 - i * 0.1, 0.04],
        COLORS.gold,
      )
    }
  }
}

/** 側面: 縦長の窓と付け柱 */
function addSideWalls(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ, baseY } = LANDMARK_LAYOUT
  for (const side of [-1, 1] as const) {
    const x = side * (bodyHalfWidth + 0.03)
    for (const z of [1.3, -0.3, -1.9]) {
      b.box([x, 2.45, z], [0.06, 2.0, 0.8], COLORS.gold)
      b.box([x + side * 0.02, 2.45, z], [0.04, 1.86, 0.66], COLORS.windowFrame)
      b.box([x + side * 0.035, 2.6, z], [0.02, 1.2, 0.5], COLORS.windowGlow, { glow: true })
    }
    for (const z of [bodyFrontZ - 0.1, 0.5, -1.1, bodyBackZ + 0.15]) {
      b.box([x + side * 0.05, (baseY + 0.96 + BODY_TOP_Y - 0.2) / 2, z], [0.1, BODY_TOP_Y - 1.16 - baseY, 0.24], COLORS.brickDark)
    }
  }
}

/** 入口: 扉の前に真鍮ポールとベルベットロープ（通路の両側に前後方向に張る） */
function addVelvetRope(b: VoxelBuilder, entrance: LandmarkEntrance) {
  const x = entrance.doorHalfWidth + 0.25
  const zNear = entrance.frontZ + 0.35
  const zFar = entrance.frontZ + 1.25
  for (const side of [-1, 1] as const) {
    const px = side * x
    for (const pz of [zNear, zFar]) {
      b.box([px, 0.05, pz], [0.26, 0.06, 0.26], COLORS.goldDark)
      b.box([px, 0.48, pz], [0.08, 0.84, 0.08], COLORS.gold)
      b.box([px, 0.94, pz], [0.14, 0.1, 0.14], COLORS.goldLight)
    }
    // たるんだロープ（段々で弧を表す）
    const segments = 5
    const span = zFar - zNear
    for (let i = 0; i < segments; i += 1) {
      const t = (i + 0.5) / segments
      const sag = Math.sin(t * Math.PI) * 0.16
      b.box([px, 0.84 - sag, zNear + span * t], [0.07, 0.07, span / segments + 0.02], COLORS.velvet)
    }
  }
}

export function buildHipHopClubModel(entrance: LandmarkEntrance): VoxelModel {
  const b = new VoxelBuilder()

  addPlinth(b, entrance.frontZ, COLORS.plinth)
  b.box([0, LANDMARK_LAYOUT.baseY - 0.02, entrance.frontZ - 0.12], [7.02, 0.06, 0.12], COLORS.marble)
  b.shell({ ...bodyBox(BODY_TOP_Y), cell: 0.5, color: COLORS.brick, jitter: 0.07 })
  addGraniteBase(b)
  addEntrance(
    b,
    entrance,
    { wall: COLORS.granite, trim: COLORS.trim, bulb: COLORS.goldLight },
    { chaseBulbs: false },
  )
  addPilasters(b, entrance.doorHalfWidth)
  addFrontWindows(b, entrance.doorHalfWidth)
  addSideWalls(b)
  addCrown(b)
  addVelvetRope(b, entrance)

  return b.build()
}
