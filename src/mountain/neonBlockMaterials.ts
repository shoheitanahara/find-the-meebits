/**
 * テトリス風ネオンブロック — 軽量な半透明ゼリー風。
 * わずかなムラと枠模様でのっぺりを防ぐ（重い transmission は使わない）。
 */
import {
  CanvasTexture,
  LinearMipmapLinearFilter,
  MeshStandardMaterial,
  NearestFilter,
  SRGBColorSpace,
  type Material,
  type Texture,
} from 'three'
import type { BlockKind } from './config'

type NeonSwatch = {
  color: string
  emissive: string
  intensity: number
  rgb: [number, number, number]
}

/** くすんだテトリス色（鮮やかさを抑える） */
const NEON_SWATCH: Record<BlockKind, NeonSwatch> = {
  grass: { color: '#2a6a58', emissive: '#1a4840', intensity: 0.12, rgb: [42, 106, 88] },
  dirt: { color: '#5a3a78', emissive: '#3a2460', intensity: 0.11, rgb: [90, 58, 120] },
  sand: { color: '#7a6a38', emissive: '#5a4a20', intensity: 0.1, rgb: [122, 106, 56] },
  stone: { color: '#2e4a78', emissive: '#1c3660', intensity: 0.12, rgb: [46, 74, 120] },
  darkStone: { color: '#6a2a52', emissive: '#4a1838', intensity: 0.13, rgb: [106, 42, 82] },
  snow: { color: '#5a5870', emissive: '#3a3858', intensity: 0.09, rgb: [90, 88, 112] },
  path: { color: '#3a6840', emissive: '#284a30', intensity: 0.11, rgb: [58, 104, 64] },
  gravel: { color: '#6a4a32', emissive: '#4a3018', intensity: 0.1, rgb: [106, 74, 50] },
}

const texCache = new Map<string, Texture>()

function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)))
}

function hash(x: number, y: number, seed: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453
  return n - Math.floor(n)
}

function paintJellyPattern(
  ctx: CanvasRenderingContext2D,
  size: number,
  rgb: [number, number, number],
  seed: number,
) {
  const [br, bg, bb] = rgb
  const img = ctx.createImageData(size, size)

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const n = hash(x, y, seed)
      const n2 = hash(x * 2, y * 3, seed + 5)
      // 中央がわずかに明るく、縁は少し落とす（ゼリーの厚み感）
      const cx = (x + 0.5) / size - 0.5
      const cy = (y + 0.5) / size - 0.5
      const radial = 1 - Math.min(1, Math.sqrt(cx * cx + cy * cy) * 1.55)
      const edge = Math.min(x, y, size - 1 - x, size - 1 - y)
      const rim = edge <= 1 ? -18 : edge <= 2 ? -8 : 0
      const v = (n * 0.55 + n2 * 0.45 - 0.5) * 22 + radial * 16 + rim
      const i = (y * size + x) * 4
      img.data[i] = clampByte(br + v)
      img.data[i + 1] = clampByte(bg + v * 0.95)
      img.data[i + 2] = clampByte(bb + v * 0.9)
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  // 内枠の薄いライン
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 1
  ctx.strokeRect(2.5, 2.5, size - 5, size - 5)
  ctx.strokeStyle = 'rgba(0,0,0,0.14)'
  ctx.strokeRect(1.5, 1.5, size - 3, size - 3)
}

function getJellyTexture(kind: BlockKind, swatch: NeonSwatch): Texture {
  const key = `neon-jelly-v2-${kind}`
  const hit = texCache.get(key)
  if (hit) return hit

  const size = 32
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context unavailable')

  const seed = kind.length * 17 + swatch.rgb[0] + swatch.rgb[2]
  paintJellyPattern(ctx, size, swatch.rgb, seed)

  const tex = new CanvasTexture(canvas)
  tex.magFilter = NearestFilter
  tex.minFilter = LinearMipmapLinearFilter
  tex.colorSpace = SRGBColorSpace
  tex.needsUpdate = true
  texCache.set(key, tex)
  return tex
}

function makeJellyLite(kind: BlockKind, swatch: NeonSwatch, opacity: number, emissiveDim: number) {
  return new MeshStandardMaterial({
    map: getJellyTexture(kind, swatch),
    color: '#ffffff',
    emissive: swatch.emissive,
    emissiveIntensity: swatch.intensity * emissiveDim,
    roughness: 0.32,
    metalness: 0.04,
    transparent: true,
    opacity,
    depthWrite: true,
  })
}

/**
 * kind × mode ごとに 1 マテリアルだけ（建物・コース共用キャッシュ）。
 * シャフトはほぼ不透明、上面だけ透ける。
 */
const matCache = new Map<string, Material>()

export function getNeonBlockMaterial(kind: BlockKind, mode: 'top' | 'shaft' = 'top'): Material {
  const key = `${kind}-${mode}`
  const hit = matCache.get(key)
  if (hit) return hit
  const swatch = NEON_SWATCH[kind] ?? NEON_SWATCH.stone
  const next =
    mode === 'shaft'
      ? makeJellyLite(kind, swatch, 0.92, 0.65)
      : makeJellyLite(kind, swatch, 0.78, 1)
  matCache.set(key, next)
  return next
}

/** @deprecated 互換: getNeonBlockMaterial と同じ */
export function createNeonBlockMaterial(kind: BlockKind, mode: 'top' | 'shaft'): Material {
  return getNeonBlockMaterial(kind, mode)
}
