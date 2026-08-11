import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'

const SIZE = 512
let cached: CanvasTexture | null = null

/** 左上コーナリボン（SOLD）— 台座値札用。1枚を使い回す */
export function getSoldRibbonTexture(): CanvasTexture {
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    cached = new CanvasTexture(canvas)
    return cached
  }

  drawSoldRibbon(ctx, SIZE)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  cached = texture
  return texture
}

function drawSoldRibbon(ctx: CanvasRenderingContext2D, size: number) {
  ctx.clearRect(0, 0, size, size)

  const outer = size * 0.96
  const inner = size * 0.3

  ctx.beginPath()
  ctx.moveTo(0, outer)
  ctx.lineTo(0, inner)
  ctx.lineTo(inner, 0)
  ctx.lineTo(outer, 0)
  ctx.closePath()

  const fill = ctx.createLinearGradient(0, 0, outer * 0.7, outer * 0.7)
  fill.addColorStop(0, '#d42a3d')
  fill.addColorStop(0.45, '#b01c30')
  fill.addColorStop(1, '#7a1220')
  ctx.fillStyle = fill
  ctx.fill()

  // 折り込み（巻き込み影）
  ctx.fillStyle = '#4a0c16'
  ctx.beginPath()
  ctx.moveTo(0, outer)
  ctx.lineTo(size * 0.1, outer - size * 0.1)
  ctx.lineTo(0, outer - size * 0.13)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(outer, 0)
  ctx.lineTo(outer - size * 0.1, size * 0.1)
  ctx.lineTo(outer - size * 0.13, 0)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = 'rgba(255, 220, 140, 0.28)'
  ctx.lineWidth = size * 0.014
  ctx.beginPath()
  ctx.moveTo(0, inner)
  ctx.lineTo(inner, 0)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, outer)
  ctx.lineTo(outer, 0)
  ctx.stroke()

  ctx.save()
  ctx.translate(size * 0.318, size * 0.318)
  ctx.rotate(-Math.PI / 4)
  ctx.font = `900 ${Math.round(size * 0.23)}px "Arial Black", "Helvetica Neue", Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '0.06em'
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.lineWidth = size * 0.05
  ctx.strokeStyle = '#3a0a10'
  ctx.fillStyle = '#e8c56a'
  ctx.strokeText('SOLD', 0, 0)
  ctx.fillText('SOLD', 0, 0)
  ctx.restore()
}
