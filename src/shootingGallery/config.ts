/** Shooting Gallery 定数の正本。マジックナンバーを JSX に直書きしない。 */

export const SHOOTING_GALLERY = {
  gameDurationSec: 45,
  fireCooldownMs: 250,
  countdownSec: 3,

  /** 射撃位置（固定）。+Z = 手前（カウンター側） */
  playerAnchor: { x: 0, y: 0.06, z: 4.2, rotationY: Math.PI },

  /** 右肩に寄せた三人称。アバターの右肩と銃を画面左下に残す */
  cameraOffset: { x: 1.05, y: 1.94, z: 2.15 },
  cameraLookY: 1.35,
  cameraFov: 48,
  /** 中央照準を動かすカメラ旋回角。射的場の範囲内に制限する。 */
  cameraAimYawMax: 0.58,
  cameraAimPitchMax: 0.36,
  /** 右手をグリップ下側に合わせるため、銃を高さの約半分だけ上げる */
  pistolHandOffsetY: 0.11,

  aimLimitX: 0.92,
  aimLimitY: 0.78,
  mouseAimSensitivity: 0.0022,
  /** SP画面ドラッグの1pxあたりの照準移動量 */
  touchAimSensitivity: 0.0065,

  roomHalfX: 6.5,
  roomMinZ: -8.5,
  roomMaxZ: 6.5,
  counterZ: 2.8,

  /** 的レーン中心 Z（奥ほど小さい） */
  laneZ: [-5.8, -4.2, -2.6] as const,
  /** 手前レーンの的を部分的に隠す、分割式バックバーカウンター。 */
  barObstacleSegments: [
    { x: -1.7, z: -2.15, width: 1.8 },
    { x: 2.85, z: -2.1, width: 2.05 },
  ] as const,
  /**
   * 的が移動できる横範囲。
   * 左端はアバターと重ならない「画面中央より少し左」までに制限する。
   */
  targetXRange: {
    /** 低い位置はアバターと重ならない範囲に限定 */
    lowerMin: -1.05,
    /** 左上はアバターの頭上まで使用可能 */
    upperMin: -2.35,
    upperThresholdY: 1.75,
    max: 4.4,
  },
  targetYRange: { min: 0.45, max: 2.85 },
  targetMotionAmplitude: { normal: 1.7, small: 1.3, vertical: 0.9 },
  maxActiveTargets: 10,
  /** フェーズ別の赤的上限。終盤のみ2枚まで同時出現させる。 */
  maxActiveRedTargets: [0, 2, 4] as const,
  /** フェーズ別の赤的抽選率。 */
  redTargetSpawnChance: [0, 0.15, 0.45] as const,

  score: {
    normal: 100,
    smallFast: 200,
    gold: 500,
    red: -300,
    bullseyeMultiplier: 2,
  },
  /** 丸型ターゲットの中心判定半径（ターゲットローカル座標） */
  bullseyeRadius: 0.13,

  /** 評価閾値 */
  rating: [
    { min: 15000, id: 'legend' as const },
    { min: 12000, id: 'deadeye' as const },
    { min: 7500, id: 'sharpshooter' as const },
    { min: 3000, id: 'goodShot' as const },
    { min: 0, id: 'rookie' as const },
  ],
} as const

export type ShootingRatingId = (typeof SHOOTING_GALLERY.rating)[number]['id']

export type TargetKind =
  | 'plate'
  | 'star'
  | 'can'
  | 'bottle'
  | 'animal'
  | 'trolley'
  | 'gold'
  | 'red'

export type TargetMotion =
  | 'horizontal'
  | 'vertical'
  | 'pop'
  | 'brief'
  | 'trolley'

export function getComboMultiplier(combo: number): number {
  if (combo >= 10) return 2
  if (combo >= 5) return 1.5
  return 1
}

export function getRatingId(score: number): ShootingRatingId {
  for (const tier of SHOOTING_GALLERY.rating) {
    if (score >= tier.min) return tier.id
  }
  return 'rookie'
}

export function getBaseScore(kind: TargetKind, small: boolean): number {
  if (kind === 'gold') return SHOOTING_GALLERY.score.gold
  if (kind === 'red') return SHOOTING_GALLERY.score.red
  if (small) return SHOOTING_GALLERY.score.smallFast
  return SHOOTING_GALLERY.score.normal
}

/** 経過秒から難易度フェーズ（0 / 1 / 2） */
export function getDifficultyPhase(elapsedSec: number): 0 | 1 | 2 {
  if (elapsedSec >= 30) return 2
  if (elapsedSec >= 15) return 1
  return 0
}
