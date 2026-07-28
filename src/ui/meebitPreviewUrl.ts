import { MEEBIT_PREVIEW_IMAGE_VERSION } from './targetPreviewCaptureConfig'

const VRM_BASE_URL = (import.meta.env.VITE_VRM_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

/** R2 / Worker 上の Meebit プレビュー WebP（VRM キャプチャと同じ構図） */
export function getMeebitPreviewImageUrl(meebitNumber: number): string {
  const path = `/previews/v${MEEBIT_PREVIEW_IMAGE_VERSION}/${meebitNumber}.webp`
  return VRM_BASE_URL ? `${VRM_BASE_URL}${path}` : path
}

async function dataUrlToUploadBlob(dataUrl: string): Promise<{ blob: Blob; contentType: string } | null> {
  const pngBlob = await fetch(dataUrl).then((response) => response.blob())
  if (pngBlob.size === 0) return null

  try {
    const bitmap = await createImageBitmap(pngBlob)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return { blob: pngBlob, contentType: 'image/png' }
    }
    ctx.drawImage(bitmap, 0, 0)
    bitmap.close()

    const webpBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.82)
    })
    if (webpBlob && webpBlob.size > 0) {
      return { blob: webpBlob, contentType: 'image/webp' }
    }
  } catch {
    // fall through to png
  }

  return { blob: pngBlob, contentType: 'image/png' }
}

/**
 * ランタイムキャプチャ後に Worker → R2 へ保存（既にあれば Worker が 200 でスキップ）。
 * 失敗しても表示には影響しない。
 */
export async function uploadMeebitPreviewToR2(meebitNumber: number, dataUrl: string): Promise<void> {
  if (!Number.isFinite(meebitNumber) || meebitNumber < 1) return

  const prepared = await dataUrlToUploadBlob(dataUrl)
  if (!prepared) return

  const response = await fetch(getMeebitPreviewImageUrl(meebitNumber), {
    method: 'PUT',
    headers: { 'Content-Type': prepared.contentType },
    body: prepared.blob,
  })

  if (!response.ok && response.status !== 200) {
    console.warn(`[preview-upload] #${meebitNumber} failed: ${response.status}`)
  }
}
