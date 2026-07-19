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

const JP_STACK =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", "Yu Gothic", sans-serif'

export function drawStreetSign(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  label: string,
) {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#0f172a'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 64px ${JP_STACK}`
  ctx.fillText(label, width / 2, height * 0.42)

  ctx.fillStyle = '#64748b'
  ctx.font = '600 28px system-ui, sans-serif'
  ctx.fillText('MEEBITS ALLEY', width / 2, height * 0.72)
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

  const padX = 40
  const contentW = width - padX * 2

  ctx.fillStyle = '#1c1917'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.font = `700 34px ${JP_STACK}`
  const titleLines = wrapLines(ctx, title, contentW)
  let y = 36
  for (const line of titleLines) {
    ctx.fillText(line, width / 2, y)
    y += 44
  }

  y += 18
  ctx.textAlign = 'left'
  ctx.fillStyle = '#292524'
  ctx.font = `600 28px ${JP_STACK}`

  for (const rule of rules) {
    const lines = wrapLines(ctx, rule, contentW)
    for (const line of lines) {
      ctx.fillText(line, padX, y)
      y += 40
    }
    y += 22
  }
}
