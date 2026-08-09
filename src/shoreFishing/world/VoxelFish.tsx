import { useMemo } from 'react'
import type { FishKindId, FishShadowSize } from '../config'
import { getFishKind } from '../config'

type Voxel = {
  x: number
  y: number
  z: number
  sx?: number
  sy?: number
  sz?: number
  color: string
  roughness?: number
  metalness?: number
}

const UNIT = 0.07

function scaleFor(shadow: FishShadowSize) {
  if (shadow === 'tiny') return 0.62
  if (shadow === 'small') return 0.82
  if (shadow === 'medium') return 1
  if (shadow === 'large') return 1.28
  return 1.62
}

/** #rrggbb を明暗調整 */
function shade(hex: string, amount: number): string {
  const raw = hex.replace('#', '')
  if (raw.length !== 6) return hex
  const n = parseInt(raw, 16)
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amount))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount))
  const b = Math.max(0, Math.min(255, (n & 255) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function mix(a: string, b: string, t: number): string {
  const pa = a.replace('#', '')
  const pb = b.replace('#', '')
  if (pa.length !== 6 || pb.length !== 6) return a
  const na = parseInt(pa, 16)
  const nb = parseInt(pb, 16)
  const lerp = (x: number, y: number) => Math.round(x + (y - x) * t)
  const r = lerp((na >> 16) & 255, (nb >> 16) & 255)
  const g = lerp((na >> 8) & 255, (nb >> 8) & 255)
  const bl = lerp(na & 255, nb & 255)
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}`
}

function vox(
  list: Voxel[],
  x: number,
  y: number,
  z: number,
  color: string,
  size: [number, number, number] = [1, 1, 1],
  mat?: { roughness?: number; metalness?: number },
) {
  list.push({
    x,
    y,
    z,
    sx: size[0],
    sy: size[1],
    sz: size[2],
    color,
    roughness: mat?.roughness,
    metalness: mat?.metalness,
  })
}

function eyes(list: Voxel[], z: number, y: number, spread: number, size = 0.45) {
  const white = '#f2f4f6'
  const pupil = '#0c1218'
  vox(list, spread, y, z, white, [size, size, size * 0.85], { roughness: 0.25 })
  vox(list, -spread, y, z, white, [size, size, size * 0.85], { roughness: 0.25 })
  vox(list, spread, y, z - 0.15, pupil, [size * 0.55, size * 0.55, size * 0.4], {
    roughness: 0.2,
    metalness: 0.15,
  })
  vox(list, -spread, y, z - 0.15, pupil, [size * 0.55, size * 0.55, size * 0.4], {
    roughness: 0.2,
    metalness: 0.15,
  })
}

/** 普通の魚：頭→胴→尾の段差＋ヒレ＋腹色 */
function fishVoxels(body: string, opts?: { deep?: boolean; stripes?: boolean; redFin?: boolean }) {
  const list: Voxel[] = []
  const belly = mix(body, '#f0ebe0', 0.45)
  const dark = shade(body, -28)
  const fin = opts?.redFin ? shade(body, -18) : mix(body, '#1a2834', 0.35)
  const gloss = { roughness: 0.38, metalness: 0.12 }

  // 頭
  vox(list, 0, 0.05, -3.2, body, [2.2, 2.1, 1.6], gloss)
  vox(list, 0, -0.35, -3.0, belly, [1.7, 1.1, 1.3], { roughness: 0.5 })
  // 前胴
  vox(list, 0, 0.1, -1.6, body, [2.6, 2.4, 2.0], gloss)
  vox(list, 0, -0.55, -1.5, belly, [2.1, 1.2, 1.8], { roughness: 0.52 })
  // 中胴
  vox(list, 0, 0.05, 0.4, body, [2.4, 2.2, 2.2], gloss)
  vox(list, 0, -0.5, 0.4, belly, [1.9, 1.15, 2.0], { roughness: 0.52 })
  // 後胴（すぼみ）
  vox(list, 0, 0, 2.2, dark, [1.7, 1.7, 1.6], gloss)
  vox(list, 0, -0.35, 2.2, belly, [1.3, 0.9, 1.4], { roughness: 0.55 })
  // 尾柄
  vox(list, 0, 0, 3.4, dark, [1.0, 1.2, 1.0], gloss)
  // 尾ヒレ（叉状）
  vox(list, 0, 0.85, 4.35, fin, [0.45, 1.5, 1.3], { roughness: 0.48 })
  vox(list, 0, -0.85, 4.35, fin, [0.45, 1.5, 1.3], { roughness: 0.48 })
  vox(list, 0, 0, 4.1, fin, [0.4, 0.7, 0.9], { roughness: 0.48 })
  // 背ビレ
  vox(list, 0, 1.55, -0.2, fin, [0.35, 1.1, 2.4], { roughness: 0.5 })
  if (opts?.deep) {
    vox(list, 0, 1.85, 1.1, fin, [0.3, 0.9, 1.2], { roughness: 0.5 })
  }
  // 尻ビレ
  vox(list, 0, -1.25, 0.6, fin, [0.3, 0.7, 1.4], { roughness: 0.5 })
  // 胸ビレ
  vox(list, 1.45, -0.15, -1.5, fin, [1.1, 0.25, 1.3], { roughness: 0.5 })
  vox(list, -1.45, -0.15, -1.5, fin, [1.1, 0.25, 1.3], { roughness: 0.5 })
  // えら線
  vox(list, 1.15, 0.1, -2.5, dark, [0.2, 1.4, 0.35], { roughness: 0.6 })
  vox(list, -1.15, 0.1, -2.5, dark, [0.2, 1.4, 0.35], { roughness: 0.6 })

  if (opts?.stripes) {
    const stripe = shade(body, -40)
    vox(list, 0, 0.55, -0.6, stripe, [2.5, 0.35, 0.45], { roughness: 0.55 })
    vox(list, 0, 0.55, 0.5, stripe, [2.3, 0.35, 0.4], { roughness: 0.55 })
    vox(list, 0, 0.5, 1.5, stripe, [2.0, 0.3, 0.35], { roughness: 0.55 })
  }

  eyes(list, -3.35, 0.45, 0.95, 0.42)
  return list
}

/** カレイ：扁平・両眼が上面 */
function flounderVoxels(body: string) {
  const list: Voxel[] = []
  const belly = mix(body, '#f5f0e4', 0.5)
  const dark = shade(body, -22)
  const spot = shade(body, -45)
  const gloss = { roughness: 0.55, metalness: 0.04 }

  vox(list, 0, 0.15, 0, body, [4.6, 0.85, 6.2], gloss)
  vox(list, 0, -0.35, 0, belly, [4.0, 0.55, 5.6], { roughness: 0.62 })
  vox(list, 0, 0.2, -3.4, body, [2.8, 0.7, 1.4], gloss)
  vox(list, 0, 0.15, 3.5, dark, [2.2, 0.55, 1.6], gloss)
  // 縁ヒレ
  vox(list, 2.55, 0.05, 0, dark, [0.7, 0.35, 4.8], { roughness: 0.58 })
  vox(list, -2.55, 0.05, 0, dark, [0.7, 0.35, 4.8], { roughness: 0.58 })
  // 斑点
  vox(list, 1.1, 0.55, -0.8, spot, [0.7, 0.25, 0.7], { roughness: 0.65 })
  vox(list, -0.9, 0.55, 0.9, spot, [0.6, 0.25, 0.6], { roughness: 0.65 })
  vox(list, 0.4, 0.55, 2.0, spot, [0.55, 0.25, 0.55], { roughness: 0.65 })
  // 両眼が上面
  vox(list, 0.55, 0.7, -2.6, '#f2f4f6', [0.5, 0.35, 0.5], { roughness: 0.25 })
  vox(list, -0.35, 0.7, -2.9, '#f2f4f6', [0.45, 0.35, 0.45], { roughness: 0.25 })
  vox(list, 0.55, 0.85, -2.7, '#0c1218', [0.28, 0.2, 0.28], { roughness: 0.2 })
  vox(list, -0.35, 0.85, -3.0, '#0c1218', [0.26, 0.2, 0.26], { roughness: 0.2 })
  return list
}

/** エイ */
function rayVoxels(body: string) {
  const list: Voxel[] = []
  const belly = mix(body, '#e8e0d8', 0.4)
  const dark = shade(body, -25)
  const gloss = { roughness: 0.48, metalness: 0.06 }

  // 菱形の体（段差で翼）
  vox(list, 0, 0.1, 0, body, [3.2, 0.7, 3.6], gloss)
  vox(list, 2.4, 0.05, 0.2, body, [2.4, 0.45, 2.6], gloss)
  vox(list, -2.4, 0.05, 0.2, body, [2.4, 0.45, 2.6], gloss)
  vox(list, 3.8, 0, 0.4, dark, [1.4, 0.3, 1.6], { roughness: 0.55 })
  vox(list, -3.8, 0, 0.4, dark, [1.4, 0.3, 1.6], { roughness: 0.55 })
  vox(list, 0, -0.25, 0, belly, [2.6, 0.4, 3.0], { roughness: 0.6 })
  // 頭・口
  vox(list, 0, 0.25, -2.2, body, [1.8, 0.55, 1.4], gloss)
  vox(list, 0, 0.55, -1.6, dark, [1.2, 0.45, 1.1], gloss)
  // 尾
  vox(list, 0, 0.05, 3.2, dark, [0.7, 0.4, 2.2], gloss)
  vox(list, 0, 0.05, 4.6, dark, [0.45, 0.3, 1.4], gloss)
  vox(list, 0, 0.35, 5.4, shade(body, -10), [0.9, 0.7, 0.7], { roughness: 0.5 })
  eyes(list, -2.35, 0.45, 0.7, 0.38)
  return list
}

/** タツノオトシゴ */
function seahorseVoxels(body: string) {
  const list: Voxel[] = []
  const belly = mix(body, '#fff0d8', 0.35)
  const dark = shade(body, -30)
  const crest = shade(body, 25)
  const gloss = { roughness: 0.42, metalness: 0.08 }

  // 頭
  vox(list, 0, 3.2, -0.3, body, [1.5, 1.5, 1.7], gloss)
  vox(list, 0, 3.7, -1.2, body, [0.9, 0.9, 1.3], gloss)
  vox(list, 0, 3.55, -2.0, dark, [0.55, 0.55, 0.9], gloss)
  // 冠
  vox(list, 0, 4.2, -0.1, crest, [0.45, 0.9, 1.0], { roughness: 0.45 })
  vox(list, 0, 4.7, 0.2, crest, [0.35, 0.6, 0.55], { roughness: 0.45 })
  // 胴（縦リング風）
  vox(list, 0, 2.0, 0.15, body, [1.3, 1.3, 1.4], gloss)
  vox(list, 0, 1.0, 0.35, body, [1.2, 1.2, 1.35], gloss)
  vox(list, 0, 0.05, 0.45, dark, [1.1, 1.1, 1.25], gloss)
  vox(list, 0, 1.5, -0.15, belly, [0.85, 2.4, 0.7], { roughness: 0.55 })
  // 背ビレ
  vox(list, 0, 1.3, 1.15, crest, [0.3, 1.6, 0.7], { roughness: 0.5 })
  // 巻き尾
  vox(list, 0, -1.0, 0.15, dark, [0.85, 1.3, 0.95], gloss)
  vox(list, 0.35, -2.0, -0.15, dark, [0.7, 1.1, 0.75], gloss)
  vox(list, 0.7, -2.7, 0.25, mix(body, dark, 0.4), [0.65, 0.8, 0.7], gloss)
  vox(list, 0.35, -3.15, 0.7, belly, [0.55, 0.55, 0.7], { roughness: 0.55 })
  eyes(list, -0.55, 3.35, 0.7, 0.36)
  return list
}

/** マグロ：紡錘・三日月尾 */
function tunaVoxels(body: string) {
  const list: Voxel[] = []
  const belly = mix(body, '#f4f2ec', 0.55)
  const dark = shade(body, -35)
  const fin = mix(body, '#152028', 0.4)
  const gloss = { roughness: 0.32, metalness: 0.18 }

  vox(list, 0, 0.1, -3.4, body, [2.0, 2.0, 1.8], gloss)
  vox(list, 0, 0.15, -1.5, body, [2.8, 2.6, 2.4], gloss)
  vox(list, 0, 0.1, 0.6, body, [2.5, 2.3, 2.2], gloss)
  vox(list, 0, 0, 2.4, dark, [1.8, 1.7, 1.8], gloss)
  vox(list, 0, 0, 3.6, dark, [1.1, 1.2, 1.2], gloss)
  vox(list, 0, -0.55, -1.2, belly, [2.2, 1.3, 4.2], { roughness: 0.48 })
  // 黄色い小さなフィンレット風
  vox(list, 0, 0.9, 2.8, '#e0b040', [0.25, 0.35, 0.9], { roughness: 0.45 })
  vox(list, 0, -0.9, 2.8, '#e0b040', [0.25, 0.35, 0.9], { roughness: 0.45 })
  // 三日月尾
  vox(list, 0, 1.15, 4.6, fin, [0.4, 1.9, 1.5], { roughness: 0.4 })
  vox(list, 0, -1.15, 4.6, fin, [0.4, 1.9, 1.5], { roughness: 0.4 })
  vox(list, 0, 0, 4.3, fin, [0.35, 0.6, 0.8], { roughness: 0.4 })
  // 背・胸
  vox(list, 0, 1.85, -0.4, fin, [0.35, 1.4, 2.6], { roughness: 0.42 })
  vox(list, 1.6, -0.1, -1.4, fin, [1.3, 0.25, 1.5], { roughness: 0.45 })
  vox(list, -1.6, -0.1, -1.4, fin, [1.3, 0.25, 1.5], { roughness: 0.45 })
  eyes(list, -3.55, 0.4, 0.85, 0.4)
  return list
}

/** シュモクザメ：頭（ハンマー）を大きく、尾は短くコンパクト */
function hammerVoxels(body: string) {
  const list: Voxel[] = []
  const belly = mix(body, '#eef2f4', 0.4)
  const dark = shade(body, -30)
  const fin = mix(body, '#2a343c', 0.35)
  const gloss = { roughness: 0.4, metalness: 0.1 }

  // 胴（やや後ろ寄りにして頭のボリュームを確保）
  vox(list, 0, 0.1, 0.6, body, [2.5, 2.4, 4.6], gloss)
  vox(list, 0, -0.55, 0.7, belly, [2.0, 1.25, 4.0], { roughness: 0.55 })
  vox(list, 0, 0.05, 3.15, dark, [1.6, 1.7, 1.3], gloss)
  // 太い首〜頭基部
  vox(list, 0, 0.2, -2.0, body, [2.8, 2.5, 2.0], gloss)
  vox(list, 0, -0.4, -1.9, belly, [2.2, 1.3, 1.7], { roughness: 0.55 })
  // ハンマー頭（大きく・厚め）
  vox(list, 0, 0.45, -3.55, body, [6.4, 1.45, 2.0], gloss)
  vox(list, 0, 0.1, -3.55, dark, [6.0, 0.85, 1.5], gloss)
  vox(list, 2.85, 0.5, -3.75, body, [1.5, 1.25, 1.5], gloss)
  vox(list, -2.85, 0.5, -3.75, body, [1.5, 1.25, 1.5], gloss)
  // 背・胸
  vox(list, 0, 1.95, 0.4, fin, [0.4, 1.8, 2.2], { roughness: 0.45 })
  vox(list, 1.65, -0.15, 0.1, fin, [1.5, 0.3, 1.5], { roughness: 0.48 })
  vox(list, -1.65, -0.15, 0.1, fin, [1.5, 0.3, 1.5], { roughness: 0.48 })
  // 尾（短い異尾：上葉が主、前後は短く）
  vox(list, 0, 1.05, 3.95, fin, [0.4, 1.85, 0.85], { roughness: 0.45 })
  vox(list, 0, -0.75, 3.85, fin, [0.35, 1.15, 0.7], { roughness: 0.45 })
  vox(list, 0, 0.15, 3.7, fin, [0.4, 0.55, 0.55], { roughness: 0.45 })
  // 口
  vox(list, 0, -0.45, -2.55, '#2a1820', [1.2, 0.4, 0.55], { roughness: 0.7 })
  eyes(list, -3.85, 0.55, 2.75, 0.45)
  return list
}

/** ホオジロザメ：顔を大きく、尾は短くサメらしい異尾 */
function whiteVoxels(body: string) {
  const list: Voxel[] = []
  const top = mix(body, '#9aa8b4', 0.35)
  const belly = '#f7f4ee'
  const fin = mix(top, '#3a4550', 0.45)
  const gloss = { roughness: 0.36, metalness: 0.12 }

  // 胴
  vox(list, 0, 0.3, 0.4, top, [3.1, 2.5, 5.2], gloss)
  vox(list, 0, -0.55, 0.5, belly, [2.6, 1.55, 4.6], { roughness: 0.5 })
  // 大きな頭部（丸みのある顔）
  vox(list, 0, 0.35, -2.9, top, [3.2, 2.6, 2.6], gloss)
  vox(list, 0, -0.35, -2.8, belly, [2.6, 1.5, 2.2], { roughness: 0.5 })
  vox(list, 0, 0.25, -4.2, top, [2.6, 2.2, 1.5], gloss)
  vox(list, 0, -0.25, -4.1, belly, [2.1, 1.3, 1.3], { roughness: 0.5 })
  // 尾柄は短く
  vox(list, 0, 0.15, 3.2, shade(top, -20), [1.7, 1.7, 1.2], gloss)
  // 大口
  vox(list, 0, -0.65, -4.55, '#2a1018', [1.9, 0.85, 0.85], { roughness: 0.75 })
  vox(list, 0.55, -0.4, -4.75, '#f0ece4', [0.3, 0.28, 0.22], { roughness: 0.4 })
  vox(list, -0.55, -0.4, -4.75, '#f0ece4', [0.3, 0.28, 0.22], { roughness: 0.4 })
  // 背・胸
  vox(list, 0, 2.2, 0.5, fin, [0.45, 2.1, 2.4], { roughness: 0.42 })
  vox(list, 1.9, -0.1, -0.3, fin, [1.7, 0.3, 1.7], { roughness: 0.45 })
  vox(list, -1.9, -0.1, -0.3, fin, [1.7, 0.3, 1.7], { roughness: 0.45 })
  // 尾ヒレ：前後に伸ばさず、上葉を高く短く（サメの三日月に近い異尾）
  vox(list, 0, 1.25, 3.85, fin, [0.4, 2.15, 0.9], { roughness: 0.42 })
  vox(list, 0, -0.85, 3.75, fin, [0.35, 1.35, 0.75], { roughness: 0.42 })
  vox(list, 0, 0.2, 3.6, fin, [0.4, 0.55, 0.55], { roughness: 0.42 })
  // 鰓裂（頭の直後）
  for (let i = 0; i < 4; i++) {
    const z = -1.7 + i * 0.4
    vox(list, 1.5, 0.15, z, shade(top, -35), [0.15, 1.4, 0.2], { roughness: 0.6 })
    vox(list, -1.5, 0.15, z, shade(top, -35), [0.15, 1.4, 0.2], { roughness: 0.6 })
  }
  eyes(list, -4.35, 0.65, 1.2, 0.48)
  return list
}

function voxelsFor(id: FishKindId, color: string): Voxel[] {
  switch (id) {
    case 'ray':
      return rayVoxels(color)
    case 'seahorse':
      return seahorseVoxels(color)
    case 'hammerhead':
      return hammerVoxels(color)
    case 'greatWhite':
      return whiteVoxels(color)
    case 'flounder':
      return flounderVoxels(color)
    case 'tuna':
      return tunaVoxels(color)
    case 'seaBass':
      return fishVoxels(color, { deep: true, stripes: true })
    case 'snapper':
      return fishVoxels(color, { deep: true, redFin: true })
    case 'sardine':
      return fishVoxels(mix(color, '#dfeaf2', 0.2), { stripes: false })
    case 'horseMackerel':
      return fishVoxels(color, { deep: false })
    default:
      return fishVoxels(color)
  }
}

type VoxelFishProps = {
  fishId: FishKindId
  /** 追加スケール */
  scale?: number
}

/**
 * 段差シルエットのボクセル魚。腹色・ヒレ・目で種類を区別する。
 */
export function VoxelFish({ fishId, scale = 1 }: VoxelFishProps) {
  const kind = getFishKind(fishId)
  const voxels = useMemo(() => voxelsFor(fishId, kind.color), [fishId, kind.color])
  const sizeMul =
    fishId === 'tuna' || fishId === 'ray'
      ? 2
      : fishId === 'hammerhead' || fishId === 'greatWhite'
        ? 1.5
        : 1
  const s = UNIT * scaleFor(kind.shadow) * scale * sizeMul
  // サメは全長（Z）だけ追加で伸ばす
  const lengthMul =
    fishId === 'hammerhead' || fishId === 'greatWhite' ? 1.98 : 1

  return (
    <group>
      {voxels.map((v, i) => (
        <mesh
          key={i}
          position={[v.x * s, v.y * s, v.z * s * lengthMul]}
          castShadow
        >
          <boxGeometry
            args={[(v.sx ?? 1) * s, (v.sy ?? 1) * s, (v.sz ?? 1) * s * lengthMul]}
          />
          <meshStandardMaterial
            color={v.color}
            roughness={v.roughness ?? 0.45}
            metalness={v.metalness ?? 0.08}
          />
        </mesh>
      ))}
    </group>
  )
}
