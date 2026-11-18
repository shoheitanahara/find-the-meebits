/**
 * OpenSea Market — 海辺の小さな美術館（Sea 中央）。
 * 淡い石の壁に紺の腰壁とコーニス、付け柱と縦長の窓。
 * 入口脇は台座に小さな彫刻を置いた展示ニッチ。点滅・流れる電球は使わず、静かな間接光だけ。
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
  plinth: '#2a3442',
  step: '#8e96a2',
  stone: '#d4d8de',
  stoneShade: '#b8bec8',
  navy: '#1b3a5c',
  navyDark: '#10243c',
  roof: '#5a6878',
  roofDark: '#4a5868',
  clerestory: '#7f98b0',
  /** 静かな暖色の間接光（点滅なし） */
  softLight: '#e8c890',
  windowGlass: '#2a3a4c',
  niche: '#1e2a38',
  marble: '#eceae4',
  marbleShade: '#cfccc4',
  brass: '#b89a64',
} as const

const BODY_TOP_Y = 4.25
const SAWTOOTH = { teeth: 3, steps: 4, stepHeight: 0.2 } as const

/**
 * 屋根上のロゴ看板（ブランド画像 1024×266 を貼る面）。描画は AttractionBuilding 側。
 * 看板裏マーキー（上端 ≈4.63）に重ならない高さ。
 */
export const OPEN_SEA_LOGO = {
  x: 0,
  y: BODY_TOP_Y + 0.95,
  z: LANDMARK_LAYOUT.bodyFrontZ + 0.45,
  width: 2.7,
  height: 2.7 * (266 / 1024),
} as const

function addMuseumBody(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ, baseY } = LANDMARK_LAYOUT
  const depth = bodyFrontZ - bodyBackZ
  const midZ = (bodyFrontZ + bodyBackZ) / 2

  // 石積みの壁（ばらつきは控えめに）
  b.shell({ ...bodyBox(BODY_TOP_Y), cell: 0.5, color: COLORS.stone, jitter: 0.035 })

  // 紺の腰壁と石の見切り
  b.box([0, baseY + 0.35, midZ], [bodyHalfWidth * 2 + 0.08, 0.7, depth + 0.08], COLORS.navy)
  b.box([0, baseY + 0.72, midZ], [bodyHalfWidth * 2 + 0.12, 0.06, depth + 0.12], COLORS.stoneShade)

  // コーニス（2段）
  b.box([0, BODY_TOP_Y - 0.12, midZ], [bodyHalfWidth * 2 + 0.2, 0.24, depth + 0.2], COLORS.navy)
  b.box([0, BODY_TOP_Y + 0.04, midZ], [bodyHalfWidth * 2 + 0.34, 0.1, depth + 0.34], COLORS.stoneShade)

  // 側面: 付け柱と縦長の窓（上部だけ静かな暖色）
  const bays = 4
  const bayDepth = depth / bays
  for (const side of [-1, 1] as const) {
    const wallX = side * bodyHalfWidth
    for (let i = 0; i <= bays; i += 1) {
      const z = bodyBackZ + bayDepth * i
      b.box(
        [wallX + side * 0.08, (baseY + 0.75 + BODY_TOP_Y - 0.24) / 2, z],
        [0.12, BODY_TOP_Y - 0.24 - baseY - 0.75, 0.3],
        COLORS.stoneShade,
      )
    }
    for (let i = 0; i < bays; i += 1) {
      const z = bodyBackZ + bayDepth * (i + 0.5)
      b.box([wallX + side * 0.03, 2.35, z], [0.06, 2.1, 0.62], COLORS.navyDark)
      b.box([wallX + side * 0.065, 2.25, z], [0.03, 1.7, 0.44], COLORS.windowGlass)
      b.box([wallX + side * 0.065, 3.2, z], [0.03, 0.2, 0.44], COLORS.softLight, { glow: true })
    }
  }
}

/** のこぎり屋根（美術館のトップライト）。ガラスは発光させず落ち着いた色に */
function addSkylightRoof(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ, bodyBackZ } = LANDMARK_LAYOUT
  const roofBase = BODY_TOP_Y + 0.09
  const toothDepth = (bodyFrontZ - bodyBackZ) / SAWTOOTH.teeth
  const width = bodyHalfWidth * 2 - 0.2
  const stepDepth = toothDepth / SAWTOOTH.steps
  const glassHeight = SAWTOOTH.steps * SAWTOOTH.stepHeight

  for (let t = 0; t < SAWTOOTH.teeth; t += 1) {
    const z0 = bodyBackZ + 0.1 + toothDepth * t
    const z1 = z0 + toothDepth - 0.1
    for (let s = 0; s < SAWTOOTH.steps; s += 1) {
      const from = z0 + stepDepth * s
      b.box(
        [0, roofBase + SAWTOOTH.stepHeight * (s + 0.5), (from + z1 - 0.1) / 2],
        [width, SAWTOOTH.stepHeight, z1 - 0.1 - from],
        s % 2 === 0 ? COLORS.roof : COLORS.roofDark,
      )
    }
    b.box(
      [0, roofBase + glassHeight / 2, z1 - 0.05],
      [width - 0.2, glassHeight - 0.06, 0.08],
      COLORS.clerestory,
    )
    for (let x = -bodyHalfWidth + 0.5; x <= bodyHalfWidth - 0.4; x += 0.9) {
      b.box([x, roofBase + glassHeight / 2, z1 + 0.005], [0.06, glassHeight, 0.05], COLORS.stoneShade)
    }
  }

  // ロゴ看板（石の縁＋紺の板）と脚
  const { x: logoX, y: logoY, z: logoZ, width: logoW, height: logoH } = OPEN_SEA_LOGO
  b.box([logoX, logoY, logoZ - 0.12], [logoW + 0.3, logoH + 0.26, 0.1], COLORS.stoneShade)
  b.box([logoX, logoY, logoZ - 0.04], [logoW + 0.14, logoH + 0.1, 0.06], COLORS.navyDark)
  for (const dx of [-1, 1]) {
    b.box(
      [logoX + dx * (logoW / 2 - 0.2), (roofBase + logoY) / 2, logoZ - 0.24],
      [0.12, logoY - roofBase, 0.12],
      COLORS.stoneShade,
    )
  }
}

/** 入口脇の展示ニッチ（台座の上に小さな彫刻。上から静かに照らす） */
function addDisplayNiches(b: VoxelBuilder, doorHalfWidth: number) {
  const { bodyFrontZ, bodyHalfWidth } = LANDMARK_LAYOUT
  const z = bodyFrontZ
  const left = doorHalfWidth + 0.35
  const right = bodyHalfWidth - 0.2
  const width = right - left
  const centerX = (left + right) / 2

  for (const side of [-1, 1] as const) {
    const x = side * centerX
    // 石の額縁と奥の暗いニッチ
    b.box([x, 2.05, z + 0.05], [width, 2.4, 0.1], COLORS.stoneShade)
    b.box([x, 2.1, z + 0.12], [width - 0.24, 2.1, 0.04], COLORS.niche)
    // 上からの間接光（細い帯・点滅なし）
    b.box([x, 3.08, z + 0.16], [width - 0.36, 0.05, 0.04], COLORS.softLight, { glow: true })
    // 台座
    b.box([x, 1.42, z + 0.3], [0.5, 0.6, 0.3], COLORS.marbleShade)
    b.box([x, 1.75, z + 0.3], [0.58, 0.06, 0.36], COLORS.marble)
    if (side < 0) {
      // 抽象彫刻: 積んだ石
      b.box([x, 1.95, z + 0.3], [0.34, 0.34, 0.24], COLORS.marble)
      b.box([x + 0.04, 2.24, z + 0.3], [0.24, 0.24, 0.2], COLORS.marbleShade)
      b.box([x - 0.02, 2.45, z + 0.3], [0.16, 0.18, 0.16], COLORS.marble)
    } else {
      // 胸像（肩・首・頭）
      b.box([x, 1.93, z + 0.3], [0.42, 0.3, 0.22], COLORS.marbleShade)
      b.box([x, 2.15, z + 0.3], [0.16, 0.14, 0.14], COLORS.marble)
      b.box([x, 2.4, z + 0.3], [0.32, 0.36, 0.28], COLORS.marble)
    }
    // 真鍮の銘板
    b.box([x, 1.25, z + 0.46], [0.3, 0.12, 0.02], COLORS.brass)
  }
}

export function buildOpenSeaMarketModel(entrance: LandmarkEntrance): VoxelModel {
  const b = new VoxelBuilder()

  addPlinth(b, entrance.frontZ, COLORS.plinth)
  // 正面の石段の見切り
  b.box([0, LANDMARK_LAYOUT.baseY - 0.02, entrance.frontZ - 0.12], [7.02, 0.06, 0.1], COLORS.step)
  addMuseumBody(b)
  addSkylightRoof(b)
  addEntrance(
    b,
    entrance,
    { wall: COLORS.stone, trim: COLORS.navyDark, bulb: COLORS.softLight },
    { chaseBulbs: false },
  )
  addDisplayNiches(b, entrance.doorHalfWidth)

  return b.build()
}
