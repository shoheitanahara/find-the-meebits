import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const chars = [...text]
  const lines: string[] = []
  let current = ''
  for (const ch of chars) {
    const next = current + ch
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current)
      current = ch
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines.length > 0 ? lines : ['']
}

/** Wall posters that need CJK — troika Text has no JP glyphs by default. */
export function usePosterTexture(
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  width: number,
  height: number,
  deps: unknown[],
) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (ctx) draw(ctx, width, height)
    const next = new CanvasTexture(canvas)
    next.colorSpace = SRGBColorSpace
    next.anisotropy = 4
    next.needsUpdate = true
    return next
    // eslint-disable-next-line react-hooks/exhaustive-deps -- explicit deps from caller
  }, deps)

  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

const JP_SANS =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", "Yu Gothic", sans-serif'

/** Enamel street plaques — serif / mincho reads more period than UI gothic. */
const EN_SIGN =
  'Georgia, "Palatino Linotype", Palatino, "Times New Roman", Times, serif'
const JP_SIGN =
  '"Hiragino Mincho ProN", "Hiragino Mincho", "Yu Mincho", "Noto Serif JP", "Hiragino Mincho Pro", serif'

export function drawStreetSign(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  label: string,
  locale: 'en' | 'ja' = 'en',
) {
  const face = '#ebe4d4'
  const faceEdge = '#d9cfc0'
  const ink = '#1a2744'
  const brass = '#9a7b4f'
  const muted = '#6b5a3e'
  const display = locale === 'ja' ? JP_SIGN : EN_SIGN

  // Aged enamel face
  const grad = ctx.createLinearGradient(0, 0, 0, height)
  grad.addColorStop(0, '#f3eee4')
  grad.addColorStop(0.45, face)
  grad.addColorStop(1, faceEdge)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  // Soft vignette
  const vig = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    height * 0.15,
    width * 0.5,
    height * 0.5,
    width * 0.72,
  )
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, 'rgba(40,28,16,0.1)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, width, height)

  // Double navy border (classic enamel)
  const inset = 14
  ctx.strokeStyle = ink
  ctx.lineWidth = 10
  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2)
  ctx.lineWidth = 3
  ctx.strokeRect(inset + 14, inset + 14, width - (inset + 14) * 2, height - (inset + 14) * 2)

  // Corner rivets
  const rivetR = 7
  const rivets: Array<[number, number]> = [
    [28, 28],
    [width - 28, 28],
    [28, height - 28],
    [width - 28, height - 28],
  ]
  for (const [rx, ry] of rivets) {
    ctx.beginPath()
    ctx.fillStyle = brass
    ctx.arc(rx, ry, rivetR, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.fillStyle = '#c4a46a'
    ctx.arc(rx - 1.5, ry - 1.5, rivetR * 0.45, 0, Math.PI * 2)
    ctx.fill()
  }

  // Street name — fit width inside the inner border
  const maxTextW = width - 88
  let size = locale === 'ja' ? 58 : 62
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = ink
  ctx.font = `700 ${size}px ${display}`
  while (size > 34 && ctx.measureText(label).width > maxTextW) {
    size -= 1
    ctx.font = `700 ${size}px ${display}`
  }
  // Slight letterpress shadow
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fillText(label, width / 2, height * 0.44 - 1)
  ctx.fillStyle = ink
  ctx.fillText(label, width / 2, height * 0.44)

  // Thin brass rule
  const ruleY = height * 0.62
  const ruleW = Math.min(width * 0.42, 180)
  ctx.strokeStyle = brass
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(width / 2 - ruleW / 2, ruleY)
  ctx.lineTo(width / 2 + ruleW / 2, ruleY)
  ctx.stroke()

  ctx.fillStyle = muted
  ctx.font =
    locale === 'ja'
      ? `600 22px ${JP_SANS}`
      : `600 22px "Avenir Next Condensed", "Helvetica Neue", ${EN_SIGN}`
  ctx.letterSpacing = locale === 'ja' ? '0px' : '0.22em'
  ctx.fillText(locale === 'ja' ? 'ミービッツ横丁' : 'MEEBITS ALLEY', width / 2, height * 0.76)
  ctx.letterSpacing = '0px'
}

export function drawRulesPoster(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  rules: string[],
) {
  ctx.fillStyle = '#f5f0e6'
  ctx.fillRect(0, 0, width, height)

  const padX = 32
  const contentW = width - padX * 2

  ctx.fillStyle = '#1c1917'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  // Keep title on one line — shrink until it fits.
  let titleSize = 26
  ctx.font = `700 ${titleSize}px ${JP_SANS}`
  while (titleSize > 17 && ctx.measureText(title).width > contentW) {
    titleSize -= 1
    ctx.font = `700 ${titleSize}px ${JP_SANS}`
  }
  const topPad = 26
  ctx.fillText(title, width / 2, topPad)

  let y = topPad + titleSize + 20
  ctx.textAlign = 'left'
  ctx.fillStyle = '#292524'
  ctx.font = `600 21px ${JP_SANS}`

  for (const rule of rules) {
    const lines = wrapLines(ctx, rule, contentW)
    for (const line of lines) {
      ctx.fillText(line, padX, y)
      y += 30
    }
    y += 12
  }
}

/** Canvas height that fits title + rules without a large bottom gap. */
export function rulesPosterPixelSize(title: string, rules: string[]) {
  const width = 512
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return { width, height: 360 }

  const padX = 32
  const contentW = width - padX * 2
  let titleSize = 26
  ctx.font = `700 ${titleSize}px ${JP_SANS}`
  while (titleSize > 17 && ctx.measureText(title).width > contentW) {
    titleSize -= 1
    ctx.font = `700 ${titleSize}px ${JP_SANS}`
  }

  let y = 26 + titleSize + 20
  ctx.font = `600 21px ${JP_SANS}`
  for (const rule of rules) {
    const lines = wrapLines(ctx, rule, contentW)
    y += lines.length * 30 + 12
  }
  // Bottom padding only.
  const height = Math.ceil(y + 22)
  return { width, height: Math.max(280, height) }
}
