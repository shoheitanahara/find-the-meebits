import { MEEBIT_PREVIEW_IMAGE_VERSION } from './targetPreviewCaptureConfig'

const VRM_BASE_URL = (import.meta.env.VITE_VRM_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

/** R2 / Worker 上の Meebit プレビュー WebP（VRM キャプチャと同じ構図） */
export function getMeebitPreviewImageUrl(meebitNumber: number): string {
  const path = `/previews/v${MEEBIT_PREVIEW_IMAGE_VERSION}/${meebitNumber}.webp`
  return VRM_BASE_URL ? `${VRM_BASE_URL}${path}` : path
}
