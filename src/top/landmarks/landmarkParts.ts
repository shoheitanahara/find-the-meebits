/**
 * ボクセル建物の共通パーツ（基壇・入口ベスティビュール・看板裏のマーキー）。
 * 入口まわりの寸法は AttractionBuilding の EntrancePortal / TitleBanner と揃える。
 */
import type { VoxelBuilder } from '../voxel/voxelBuilder'

type Vec3 = readonly [number, number, number]

/** 建物ローカル座標の共通寸法（+Z が正面） */
export const LANDMARK_LAYOUT = {
  /** 基壇の上面（本体はここから積む） */
  baseY: 0.25,
  /** 本体の半幅・正面壁 Z・背面壁 Z（当たり判定 footprint の内側） */
  bodyHalfWidth: 3.1,
  bodyFrontZ: 2.7,
  bodyBackZ: -3.3,
  /** EntrancePortal の扉高さ */
  doorHeight: 3.1,
  /** TitleBanner の中心高さ・高さ・正面からの出っ張り */
  bannerY: 3.95,
  bannerHeight: 1.25,
  bannerZOffset: 0.28,
} as const

/** 扉枠（左右の袖壁）の幅 */
const DOOR_JAMB_WIDTH = 0.35
/** 扉上のまぐさ厚 */
const DOOR_LINTEL_HEIGHT = 0.2
const VESTIBULE_CELL = 0.35
const MARQUEE_HALF_WIDTH = 3.0
const BULB_SIZE = 0.14
const BULB_SPACING = 0.42

export type LandmarkEntrance = {
  /** attraction.footprint.doorHalfWidth */
  doorHalfWidth: number
  /** attraction.footprint.halfDepth（扉の立つ Z） */
  frontZ: number
}

/**
 * 建物の横・地上に置くテーマ彫刻の配置（建物ローカル xz と当たり判定の半サイズ）。
 * パークのカメラは見下ろし固定で、高さ約 4.6 より上は遠景で画面外になる。
 * 屋上ではなく地上に置くことで、遠くからでも全体が見える。
 */
export type LandmarkIconPlacement = {
  x: number
  z: number
  halfX: number
  halfZ: number
}

/** 彫刻を正面壁の横に並べるときの標準位置（side: -1=左 / 1=右） */
export function iconBesideEntrance(
  side: -1 | 1,
  halfX: number,
  halfZ: number,
): LandmarkIconPlacement {
  return { x: side * 4.8, z: 2.6, halfX, halfZ }
}

export type EntranceColors = {
  wall: string
  trim: string
  bulb: string
}

/** 本体シェルの中心とサイズ（高さだけ建物ごとに変える） */
export function bodyBox(topY: number): { center: Vec3; size: Vec3 } {
  const { baseY, bodyHalfWidth, bodyFrontZ, bodyBackZ } = LANDMARK_LAYOUT
  return {
    center: [0, (baseY + topY) / 2, (bodyFrontZ + bodyBackZ) / 2],
    size: [bodyHalfWidth * 2, topY - baseY, bodyFrontZ - bodyBackZ],
  }
}

/** 建物全体が載る低い基壇 */
export function addPlinth(builder: VoxelBuilder, frontZ: number, color: string) {
  const { baseY } = LANDMARK_LAYOUT
  builder.box([0, baseY / 2, 0], [7.0, baseY, frontZ * 2 - 0.2], color)
}

/**
 * 入口まわり: 扉を囲む張り出し＋タイトル看板の裏に付くマーキー＋流れる電球。
 * 扉そのもの（黒い板）とタイトル看板は AttractionBuilding 側が描く。
 */
export function addEntrance(
  builder: VoxelBuilder,
  { doorHalfWidth, frontZ }: LandmarkEntrance,
  colors: EntranceColors,
) {
  const { baseY, bodyFrontZ, doorHeight, bannerY, bannerHeight } = LANDMARK_LAYOUT
  const vestibuleTop = doorHeight + DOOR_LINTEL_HEIGHT
  const vestibuleHalfWidth = doorHalfWidth + DOOR_JAMB_WIDTH
  // 扉板のすぐ後ろまで張り出す
  const vestibuleFrontZ = frontZ - 0.07
  const vestibuleDepth = vestibuleFrontZ - bodyFrontZ

  builder.shell({
    center: [0, (baseY + vestibuleTop) / 2, bodyFrontZ + vestibuleDepth / 2],
    size: [vestibuleHalfWidth * 2, vestibuleTop - baseY, vestibuleDepth],
    cell: VESTIBULE_CELL,
    color: colors.wall,
    top: false,
  })

  // タイトル看板の裏板（看板が宙に浮いて見えないように）
  const marqueeTop = bannerY + bannerHeight / 2 + 0.03
  const marqueeFrontZ = frontZ + 0.15
  builder.box(
    [0, (vestibuleTop + marqueeTop) / 2, (bodyFrontZ + marqueeFrontZ) / 2],
    [MARQUEE_HALF_WIDTH * 2, marqueeTop - vestibuleTop, marqueeFrontZ - bodyFrontZ],
    colors.trim,
  )

  // マーキー下縁の電球（入口の真上は空けて左右に流す）
  let chaseIndex = 0
  for (const side of [-1, 1] as const) {
    for (
      let x = vestibuleHalfWidth + 0.3;
      x <= MARQUEE_HALF_WIDTH - BULB_SIZE;
      x += BULB_SPACING
    ) {
      builder.box(
        [side * x, vestibuleTop - BULB_SIZE / 2, frontZ + 0.08],
        [BULB_SIZE, BULB_SIZE, BULB_SIZE],
        colors.bulb,
        { glow: true, anim: { kind: 'chase', index: chaseIndex } },
      )
      chaseIndex += 1
    }
  }
}

/** 正面（+Z）向きの額縁。center は絵の中心、width/height は内寸 */
export function addFrontFrame(
  builder: VoxelBuilder,
  center: Vec3,
  width: number,
  height: number,
  thickness: number,
  color: string,
) {
  const [cx, cy, cz] = center
  const z = cz + thickness / 2
  const outerWidth = width + thickness * 2
  builder
    .box([cx, cy + height / 2 + thickness / 2, z], [outerWidth, thickness, thickness], color)
    .box([cx, cy - height / 2 - thickness / 2, z], [outerWidth, thickness, thickness], color)
    .box([cx - width / 2 - thickness / 2, cy, z], [thickness, height, thickness], color)
    .box([cx + width / 2 + thickness / 2, cy, z], [thickness, height, thickness], color)
}
