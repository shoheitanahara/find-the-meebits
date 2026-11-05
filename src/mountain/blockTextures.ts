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

export type BlockKind =
  | 'grass'
  | 'dirt'
  | 'sand'
  | 'stone'
  | 'darkStone'
  | 'snow'
  | 'path'
  | 'gravel'
  | 'brick'
  | 'pierWood'
  | 'gallery'
  | 'panel'

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
  // 木目ボード（1タイル内に細かい板目 — 橋でリピートする前提）
  paintNoise(ctx, size, [148, 118, 72], 22, 41)
  const plankH = 2
  for (let y = 0; y < size; y += plankH) {
    ctx.fillStyle = 'rgba(70,50,28,0.5)'
    ctx.fillRect(0, y, size, 1)
    const yy = y + 1
    if (yy < size) {
      ctx.fillStyle = `rgba(100,78,42,${0.2 + hash(0, y, 3) * 0.25})`
      ctx.fillRect(1, yy, size - 2, 1)
    }
  }
}

function paintBrick(ctx: CanvasRenderingContext2D, size: number) {
  // Plaza: 細かいクラシックレンガ（崖のノイズ粒度に寄せる）
  paintNoise(ctx, size, [150, 142, 132], 10, 61)
  const rowH = 2
  const brickW = 4
  for (let row = 0; row < size / rowH; row += 1) {
    const y = row * rowH
    const offset = row % 2 === 0 ? 0 : brickW / 2
    for (let col = -1; col < size / brickW + 1; col += 1) {
      const x = col * brickW + offset
      const n = hash(row, col, 17)
      const r = 148 + n * 28
      const g = 78 + n * 22
      const b = 58 + n * 16
      ctx.fillStyle = `rgb(${clampByte(r)},${clampByte(g)},${clampByte(b)})`
      ctx.fillRect(x + 1, y, brickW - 1, rowH - 1)
    }
    ctx.fillStyle = 'rgba(170,162,150,0.8)'
    ctx.fillRect(0, y, size, 1)
  }
}

/** Sea: 潮で色あせた桟橋の木 */
function paintPierWood(ctx: CanvasRenderingContext2D, size: number) {
  paintNoise(ctx, size, [168, 140, 96], 18, 71)
  const plankH = 2
  for (let y = 0; y < size; y += plankH) {
    ctx.fillStyle = 'rgba(90,70,40,0.35)'
    ctx.fillRect(0, y, size, 1)
    if (y + 1 < size) {
      ctx.fillStyle = `rgba(190,165,120,${0.12 + hash(1, y, 4) * 0.18})`
      ctx.fillRect(1, y + 1, size - 2, 1)
    }
  }
}

/** Culture: 濃紺ギャラリーの石タイル＋青アクセント */
function paintGallery(ctx: CanvasRenderingContext2D, size: number) {
  paintNoise(ctx, size, [28, 44, 72], 16, 81)
  const tile = 4
  for (let y = 0; y < size; y += tile) {
    for (let x = 0; x < size; x += tile) {
      const n = hash(x, y, 22)
      ctx.fillStyle = `rgb(${clampByte(32 + n * 24)},${clampByte(52 + n * 28)},${clampByte(88 + n * 30)})`
      ctx.fillRect(x + 1, y + 1, tile - 1, tile - 1)
    }
  }
  ctx.fillStyle = 'rgba(110,150,210,0.3)'
  for (let i = 0; i <= size; i += tile) {
    ctx.fillRect(0, i, size, 1)
    ctx.fillRect(i, 0, 1, size)
  }
}

/** Astro: 暗い金属パネル＋シアン継ぎ目 */
function paintPanel(ctx: CanvasRenderingContext2D, size: number) {
  paintNoise(ctx, size, [22, 28, 40], 12, 91)
  const tile = 4
  for (let y = 0; y < size; y += tile) {
    for (let x = 0; x < size; x += tile) {
      const n = hash(x, y, 29)
      ctx.fillStyle = `rgb(${clampByte(28 + n * 18)},${clampByte(34 + n * 20)},${clampByte(48 + n * 22)})`
      ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2)
      ctx.fillStyle = 'rgba(90,110,140,0.5)'
      ctx.fillRect(x + 1, y + 1, 1, 1)
    }
  }
  ctx.fillStyle = 'rgba(70,200,240,0.4)'
  for (let i = 0; i <= size; i += tile) {
    ctx.fillRect(0, i, size, 1)
    ctx.fillRect(i, 0, 1, size)
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
  if (kind === 'brick') return makeTexture('brick', paintBrick)
  if (kind === 'pierWood') return makeTexture('pierWood', paintPierWood)
  if (kind === 'gallery') return makeTexture('gallery', paintGallery)
  if (kind === 'panel') return makeTexture('panel', paintPanel)
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
