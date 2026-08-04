/** Photo Booth（正方形 PFP + 来場証明書）定数の正本。 */

export const PHOTO_STUDIO = {
  canvasElementId: 'photo-studio-canvas',
  /** 書き出し解像度（正方形） */
  exportSize: 1024,
  /**
   * プレビュー Canvas の最大 DPR。
   * パーク全体のモバイル制限（DPR1・AAオフ）は使わず、PC/SP とも同じ高画質にする。
   */
  canvasMaxDpr: 2,
  meebitIdMin: 1,
  meebitIdMax: 20000,
  modelScale: 1.0,
  /** VRM_FEET_Y_OFFSET(0.06) 分沈めて影受け面に接地 */
  modelGroundY: -0.055,

  /**
   * PFP 映えする単色背景。
   * 先頭がデフォルト。ストアは backgrounds[0] を初期値に使う。
   */
  backgrounds: [
    { id: 'punk-blue', color: '#638596', label: { en: 'Punk Blue', ja: 'パンクブルー' } },
    { id: 'meebit-blue', color: '#2b0fa1', label: { en: 'Meebit Blue', ja: 'ミービットブルー' } },
    { id: 'punk-purple', color: '#8550a0', label: { en: 'Punk Purple', ja: 'パンクパープル' } },
    { id: 'punk-teal', color: '#4a8a8a', label: { en: 'Punk Teal', ja: 'パンクティール' } },
    { id: 'lemon', color: '#f5e84c', label: { en: 'Lemon Yellow', ja: 'レモンイエロー' } },
    { id: 'cyan', color: '#2bb5b0', label: { en: 'Cyan', ja: 'シアン' } },
    { id: 'crimson', color: '#d23c3c', label: { en: 'Crimson', ja: 'クリムゾン' } },
    { id: 'terracotta', color: '#c4785a', label: { en: 'Terracotta', ja: 'テラコッタ' } },
    { id: 'bayc-yellow', color: '#f2c94c', label: { en: 'Ape Yellow', ja: 'エイプイエロー' } },
    { id: 'bayc-orange', color: '#e89a3c', label: { en: 'Ape Orange', ja: 'エイプオレンジ' } },
    { id: 'bayc-blue', color: '#3d6bb3', label: { en: 'Ape Blue', ja: 'エイプブルー' } },
    { id: 'bayc-violet', color: '#6b4c9a', label: { en: 'Ape Violet', ja: 'エイプバイオレット' } },
    { id: 'mint', color: '#7ec8b0', label: { en: 'Mint', ja: 'ミント' } },
    { id: 'peach', color: '#f0b090', label: { en: 'Peach', ja: 'ピーチ' } },
    { id: 'coral', color: '#e07a6a', label: { en: 'Coral', ja: 'コーラル' } },
    { id: 'hot-pink', color: '#e05aa0', label: { en: 'Hot Pink', ja: 'ホットピンク' } },
    { id: 'lime', color: '#9bc53d', label: { en: 'Lime', ja: 'ライム' } },
    { id: 'ice', color: '#d8eef8', label: { en: 'Ice', ja: 'アイス' } },
    { id: 'sky', color: '#9ec9e8', label: { en: 'Sky', ja: 'スカイ' } },
    { id: 'navy', color: '#1e3a5f', label: { en: 'Navy', ja: 'ネイビー' } },
    { id: 'lavender', color: '#c4b0e0', label: { en: 'Lavender', ja: 'ラベンダー' } },
    { id: 'cream', color: '#f0e6d8', label: { en: 'Cream', ja: 'クリーム' } },
    { id: 'sand', color: '#d4c4a8', label: { en: 'Sand', ja: 'サンド' } },
    { id: 'forest', color: '#3d6b4f', label: { en: 'Forest', ja: 'フォレスト' } },
    { id: 'maroon', color: '#7a3040', label: { en: 'Maroon', ja: 'マルーン' } },
    { id: 'slate', color: '#8a95a5', label: { en: 'Slate', ja: 'スレート' } },
    { id: 'charcoal', color: '#2c2c2c', label: { en: 'Charcoal', ja: 'チャコール' } },
  ] as const,

  framings: [
    { id: 'full', label: { en: 'Full body', ja: '全身' } },
    { id: 'bust', label: { en: 'Bust', ja: 'バストアップ' } },
  ] as const,

  /**
   * カメラ角度。ドラッグの上下回転の代わりにプリセットで切替。
   * 左右ドラッグの yaw はそのまま使える。
   */
  cameraAngles: [
    {
      id: 'default',
      label: { en: '3/4 view', ja: '斜め' },
      setups: {
        full: {
          fov: 32,
          cameraPosition: [-1.55, 1.35, 4.6] as const,
          cameraLookAt: [0, 0.85, 0] as const,
        },
        bust: {
          fov: 28,
          cameraPosition: [-0.85, 1.55, 2.35] as const,
          cameraLookAt: [0, 1.35, 0] as const,
        },
      },
    },
    {
      id: 'high',
      label: { en: 'High angle', ja: '上から' },
      setups: {
        // 3/4 をわずかに上げる程度。lookAt は胴〜頭の中間で中央寄せ
        full: {
          fov: 32,
          cameraPosition: [-1.45, 1.95, 4.45] as const,
          cameraLookAt: [0, 1.0, 0] as const,
        },
        bust: {
          fov: 28,
          cameraPosition: [-0.8, 1.85, 2.25] as const,
          cameraLookAt: [0, 1.38, 0] as const,
        },
      },
    },
  ] as const,

  /**
   * スタジオポーズ。applyStudioPose でボーンを直接セット。
   * UpperArm Z=体側へ下ろす / X=前後 / LowerArm X=肘。
   */
  poses: [
    { id: 'attention', label: { en: 'Stand', ja: '直立' } },
    { id: 'wave', label: { en: 'Wave', ja: '手を振る' } },
    { id: 'cheer', label: { en: 'Cheer', ja: '万歳' } },
    { id: 'sit', label: { en: 'Sit', ja: '座り' } },
  ] as const,

  lighting: {
    /**
     * 公式 Meebit 寄りソフトボックス。
     * ブラウザの MToon ではオフライン公式レンダと完全一致はできないが、
     * 左上キー・接地影・弱い IBL で近づけている。
     */
    ambient: 0.34,
    ambientColor: '#f5f3ef',
    hemisphere: { sky: '#ffffff', ground: '#6a7280', intensity: 0.48 },
    environmentPreset: 'studio' as const,
    environmentIntensity: 0.38,
    /**
     * 正面やや右上からのキー。
     * 影は左後方へ伸びる（画面左へ見える）。
     */
    key: {
      position: [3.1, 6.6, 3.9] as const,
      intensity: 1.18,
      color: '#fff6ec',
    },
    fill: {
      position: [-3.0, 2.5, 2.0] as const,
      intensity: 0.4,
      color: '#d5e0f0',
    },
    top: {
      position: [0.15, 6.5, 1.0] as const,
      intensity: 0.28,
      color: '#ffffff',
    },
    rim: {
      position: [-1.4, 2.8, -3.3] as const,
      intensity: 0.45,
      color: '#e4ecfa',
    },
    castShadow: {
      mapSize: 2048,
      camExtent: 2.6,
      camNear: 1,
      camFar: 20,
      bias: -0.0002,
      normalBias: 0.04,
      opacity: 0.55,
      planeSize: 12,
      planeY: 0.001,
    },
    exposureDefault: 1.0,
    exposureMin: 0.4,
    exposureMax: 1.7,
  },

  /**
   * 左右ドラッグの yaw。
   * defaultYaw: 正面直当てを避け、入場／リセット時の「いい感じ」の向き。
   */
  orbit: {
    pixelsPerRadian: 160,
    /** ≈18° */
    defaultYaw: 0.32,
  },
} as const

export type PhotoStudioBackgroundId = (typeof PHOTO_STUDIO.backgrounds)[number]['id']
export type PhotoStudioPoseId = (typeof PHOTO_STUDIO.poses)[number]['id']
export type PhotoStudioFramingId = (typeof PHOTO_STUDIO.framings)[number]['id']
export type PhotoStudioCameraAngleId = (typeof PHOTO_STUDIO.cameraAngles)[number]['id']

export function clampMeebitId(value: number): number {
  if (!Number.isFinite(value)) return PHOTO_STUDIO.meebitIdMin
  return Math.max(
    PHOTO_STUDIO.meebitIdMin,
    Math.min(PHOTO_STUDIO.meebitIdMax, Math.floor(value)),
  )
}

export function getBackground(id: PhotoStudioBackgroundId) {
  return PHOTO_STUDIO.backgrounds.find((b) => b.id === id) ?? PHOTO_STUDIO.backgrounds[0]
}

export function getPose(id: PhotoStudioPoseId) {
  return PHOTO_STUDIO.poses.find((p) => p.id === id) ?? PHOTO_STUDIO.poses[0]
}

export function getFraming(id: PhotoStudioFramingId) {
  return PHOTO_STUDIO.framings.find((f) => f.id === id) ?? PHOTO_STUDIO.framings[0]
}

export function getCameraAngle(id: PhotoStudioCameraAngleId) {
  return PHOTO_STUDIO.cameraAngles.find((a) => a.id === id) ?? PHOTO_STUDIO.cameraAngles[0]
}

export type PhotoStudioCameraSetup = {
  fov: number
  cameraPosition: readonly [number, number, number]
  cameraLookAt: readonly [number, number, number]
}

/** 構図 × カメラ角度から実カメラ設定を返す */
export function getCameraSetup(
  framingId: PhotoStudioFramingId,
  angleId: PhotoStudioCameraAngleId,
): PhotoStudioCameraSetup {
  const angle = getCameraAngle(angleId)
  const setup = angle.setups[framingId] ?? angle.setups.full
  return {
    fov: setup.fov,
    cameraPosition: [setup.cameraPosition[0], setup.cameraPosition[1], setup.cameraPosition[2]],
    cameraLookAt: [setup.cameraLookAt[0], setup.cameraLookAt[1], setup.cameraLookAt[2]],
  }
}
