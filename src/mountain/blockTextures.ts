/**
 * マイクラ風ボクセル用の手続きテクスチャ（16×16・ニアレスト）。
 */
import {
  CanvasTexture,
  LinearMipmapLinearFilter,
  NearestFilter,
  SRGBColorSpace,
  type Texture,
} from 'three'

export type BlockKind = 'grass' | 'dirt' | 'sand' | 'stone' | 'darkStone' | 'snow' | 'path' | 'gravel'

const cache = new Map<string, Texture>()

function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)))
}

function hash(x: number, y: number, seed: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453
  return n - Math.floor(n)
}

function paintNoise(
  ctx: CanvasRenderingContext2D,
  size: number,
  base: [number, number, number],
  variance: number,
  seed: number,
) {
  const img = ctx.createImageData(size, size)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const n = hash(x, y, seed)
      const n2 = hash(x * 2, y * 3, seed + 3)
      const v = (n * 0.7 + n2 * 0.3 - 0.5) * variance
      const i = (y * size + x) * 4
      img.data[i] = clampByte(base[0] + v)
      img.data[i + 1] = clampByte(base[1] + v * 0.9)
      img.data[i + 2] = clampByte(base[2] + v * 0.7)
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
}

function paintGrassTop(ctx: CanvasRenderingContext2D, size: number) {
  paintNoise(ctx, size, [72, 140, 58], 38, 11)
  // ところどころ濃い草
  for (let i = 0; i < 28; i += 1) {
    const x = Math.floor(hash(i, 2, 9) * size)
    const y = Math.floor(hash(i, 5, 4) * size)
    ctx.fillStyle = `rgba(40,${100 + (i % 40)},30,0.55)`
    ctx.fillRect(x, y, 1 + (i % 2), 1)
  }
}

function paintGrassSide(ctx: CanvasRenderingContext2D, size: number) {
  paintNoise(ctx, size, [120, 85, 48], 28, 21)
  // 上部の緑帯（マイクラ草ブロック側面）
  const band = Math.max(3, Math.floor(size * 0.28))
  for (let y = 0; y < band; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const n = hash(x, y, 44)
      const g = 95 + n * 50
      ctx.fillStyle = `rgb(${50 + n * 30},${g},${35 + n * 20})`
      ctx.fillRect(x, y, 1, 1)
    }
  }
  // ぎざぎざ境界
  for (let x = 0; x < size; x += 1) {
    const jagged = Math.floor(hash(x, 8, 2) * 2)
    ctx.fillStyle = `rgb(55,${120 + jagged * 20},40)`
    ctx.fillRect(x, band + jagged, 1, 1)
  }
}

function paintDirt(ctx: CanvasRenderingContext2D, size: number) {
  paintNoise(ctx, size, [118, 82, 46], 32, 7)
  for (let i = 0; i < 18; i += 1) {
    const x = Math.floor(hash(i, 1, 3) * size)
    const y = Math.floor(hash(i, 4, 6) * size)
    ctx.fillStyle = `rgba(70,45,25,${0.25 + hash(i, 9, 1) * 0.35})`
    ctx.fillRect(x, y, 1, 1 + (i % 2))
  }
}

function paintSand(ctx: CanvasRenderingContext2D, size: number) {
  paintNoise(ctx, size, [210, 196, 140], 26, 15)
  for (let i = 0; i < 22; i += 1) {
    const x = Math.floor(hash(i, 3, 8) * size)
    const y = Math.floor(hash(i, 7, 2) * size)
    ctx.fillStyle = `rgba(180,160,100,${0.2 + hash(i, 2, 5) * 0.3})`
    ctx.fillRect(x, y, 1, 1)
  }
}

function paintStone(ctx: CanvasRenderingContext2D, size: number) {
  paintNoise(ctx, size, [110, 112, 108], 30, 19)
  for (let i = 0; i < 14; i += 1) {
    const x = Math.floor(hash(i, 6, 1) * size)
    const y = Math.floor(hash(i, 2, 4) * size)
    ctx.fillStyle = `rgba(60,62,58,${0.2 + hash(i, 1, 8) * 0.35})`
    ctx.fillRect(x, y, 1 + (i % 3), 1)
  }
}

function paintDarkStone(ctx: CanvasRenderingContext2D, size: number) {
  paintNoise(ctx, size, [78, 80, 76], 26, 27)
}

function paintSnow(ctx: CanvasRenderingContext2D, size: number) {
  paintNoise(ctx, size, [232, 238, 244], 18, 33)
}

function paintPath(ctx: CanvasRenderingContext2D, size: number) {
  paintNoise(ctx, size, [158, 138, 88], 24, 41)
  // 踏み固めの筋
  for (let y = 2; y < size; y += 4) {
    ctx.fillStyle = 'rgba(120,100,60,0.25)'
    ctx.fillRect(1, y, size - 2, 1)
  }
}

function paintGravel(ctx: CanvasRenderingContext2D, size: number) {
  paintNoise(ctx, size, [120, 118, 112], 36, 51)
}

function makeTexture(key: string, paint: (ctx: CanvasRenderingContext2D, size: number) => void): Texture {
  const hit = cache.get(key)
  if (hit) return hit

  const size = 16
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context unavailable')
  paint(ctx, size)

  const tex = new CanvasTexture(canvas)
  tex.magFilter = NearestFilter
  tex.minFilter = LinearMipmapLinearFilter
  tex.colorSpace = SRGBColorSpace
  tex.needsUpdate = true
  cache.set(key, tex)
  return tex
}

export function getBlockTexture(kind: BlockKind, face: 'top' | 'side' | 'all' = 'all'): Texture {
  if (kind === 'grass' && face === 'top') return makeTexture('grass-top', paintGrassTop)
  if (kind === 'grass' && face === 'side') return makeTexture('grass-side', paintGrassSide)
  if (kind === 'dirt') return makeTexture('dirt', paintDirt)
  if (kind === 'sand') return makeTexture('sand', paintSand)
  if (kind === 'stone') return makeTexture('stone', paintStone)
  if (kind === 'darkStone') return makeTexture('darkStone', paintDarkStone)
  if (kind === 'snow') return makeTexture('snow', paintSnow)
  if (kind === 'path') return makeTexture('path', paintPath)
  if (kind === 'gravel') return makeTexture('gravel', paintGravel)
  return makeTexture('dirt', paintDirt)
}

/** 草ブロック用: [right,left,top,bottom,front,back] */
export function getGrassMaterials() {
  const top = getBlockTexture('grass', 'top')
  const side = getBlockTexture('grass', 'side')
  const dirt = getBlockTexture('dirt')
  return [
    { map: side },
    { map: side },
    { map: top },
    { map: dirt },
    { map: side },
    { map: side },
  ] as const
}
