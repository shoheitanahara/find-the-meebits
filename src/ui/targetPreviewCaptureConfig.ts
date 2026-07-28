/** プレビュー静止画の見た目バージョン（再生成時に上げる） */
export const MEEBIT_PREVIEW_IMAGE_VERSION = 1

export const TARGET_PREVIEW_CAPTURE = {
  size: 320,
  modelScale: 1.15,
  modelYOffset: -0.92,
  cameraPosition: [-1.45, 1.28, 4.25] as const,
  cameraLookAt: [0, 0.28, 0] as const,
  keyLightPosition: [-2.5, 4.5, 2.8] as const,
  background: '#f5f5f5',
  fov: 31,
} as const
