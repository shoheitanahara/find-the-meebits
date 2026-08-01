import type { WebGLRenderer } from 'three'
import { PHOTO_STUDIO } from '../config'

/** メイン Canvas から正方形 PNG を切り出して DataURL を返す。 */
export function captureSquarePfp(gl: WebGLRenderer): string | null {
  const source = gl.domElement
  const size = PHOTO_STUDIO.exportSize
  const sw = source.width
  const sh = source.height
  if (sw < 2 || sh < 2) return null

  const side = Math.min(sw, sh)
  const sx = Math.floor((sw - side) / 2)
  const sy = Math.floor((sh - side) / 2)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, sx, sy, side, side, 0, 0, size, size)
  return canvas.toDataURL('image/png')
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = filename
  anchor.click()
}
