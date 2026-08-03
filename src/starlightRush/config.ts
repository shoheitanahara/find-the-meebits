import { getUtcDateKey } from '../top/dailyFeatured'

/** Starlight Rush 定数の正本。 */

export const STARLIGHT_RUSH = {
  canvasElementId: 'starlight-rush-canvas',
  gameDurationSec: 90,
  fireCooldownMs: 220,
  countdownSec: 3,
  /** カウントダウン前の離陸演出（秒）。この間に駅を離れる */
  launchIntroSec: 3.2,
  /** 離陸終了時のレール progress（ここから本編タイマー開始） */
  launchEndProgress: 0.06,
  /** タイマー終了後の到着ドック演出（秒） */
  dockingSec: 4.2,
  /** ドック完了時の progress（rideEnd より先、到着駅手前） */
  dockEndProgress: 0.97,

  /** ライド内ローカル: 船は原点、進行方向は -Z */
  shipLocal: { x: 0, y: 0.15, z: 0 },
  /** Meebit は船の座席やや後ろ */
  playerLocal: { x: 0, y: 0.35, z: 0.55, rotationY: Math.PI },
  pistolHandOffsetY: 0.11,

  /** 三人称: 船の右後ろから前方を見る */
  cameraOffset: { x: 1.15, y: 2.05, z: 4.2 },
  cameraLookAhead: 14,
  cameraLookY: 1.1,
  cameraFov: 52,
  cameraAimYawMax: 0.48,
  cameraAimPitchMax: 0.32,
  /** カメラ追従の緩さ（レールの急変を抑える） */
  cameraFollowLerp: 8,
  bankMax: 0.42,
  /** 終盤（ゼニス接近）のバンク上限。左右ロールを強める */
  bankMaxLate: 0.62,
  /** 終盤バンクを強め始める progress 比率（rideEnd に対する比） */
  bankLateProgressRatio: 0.72,

  aimLimitX: 0.9,
  aimLimitY: 0.75,
  mouseAimSensitivity: 0.0022,
  touchAimSensitivity: 0.0065,

  /** 星スポーン（ライドローカル）。進行方向 -Z なので小さいほど奥。全星ここから手前へ。 */
  starSpawnZ: -42,
  starPassZ: 6,
  starHitRadius: 0.55,
  maxActiveStars: 14,
  /**
   * 星の横位置バイアス（spreadX に対する係数）。
   * 進行方向 -Z で +X = 右。カメラが右後方のため右側を厚くする。
   */
  spawnBias: {
    xMin: -0.35,
    xMax: 0.72,
  },
  /** フェーズ別: 出現間隔秒・同時上限・移動速度・散布半径 */
  phase: {
    early: {
      spawnInterval: 0.85,
      maxActive: 5,
      approachSpeed: 7.5,
      spreadX: 4.4,
      spreadY: 2.9,
      size: 0.85,
    },
    mid: {
      spawnInterval: 0.55,
      maxActive: 9,
      approachSpeed: 11,
      spreadX: 4.8,
      spreadY: 3.0,
      size: 0.72,
    },
    /**
     * 終盤は速度・密度・車体の動きで難しくする。
     * 散布は中盤を上限（広げると照準が届かない＆視認が追いつかない）。
     */
    late: {
      spawnInterval: 0.32,
      maxActive: 14,
      approachSpeed: 16,
      spreadX: 4.8,
      spreadY: 3.0,
      size: 0.62,
    },
  },

  /** レール速度は時間同期のため参考値（ワープ演出用）。 */
  railSpeed: {
    early: 0.0085,
    mid: 0.012,
    late: 0.016,
    warp: 0.028,
  },
  /** 終了直前ワープ演出（残り秒） */
  warpRemainingSec: 12,
  /**
   * 本編中のレール上限。終盤〜ゼニス接近まで進み続ける。
   * 到着駅（1.0）までは行かず、dockEnd でさらに少し寄る。
   */
  rideEndProgress: 0.9,

  rating: [
    { min: 25000, id: 'legend' as const },
    { min: 20000, id: 'starcatcher' as const },
    { min: 14000, id: 'orbiter' as const },
    { min: 7000, id: 'voyager' as const },
    { min: 0, id: 'cadet' as const },
  ],

  bestScoreKey: 'meebits-starlight-best-daily',

  /**
   * 星の色＝得点帯（5種）。
   * gold は後半フェーズのみ出現。
   */
  starKinds: [
    { id: 'cyan', color: '#5ce0ff', score: 100, weight: 34, lateOnly: false },
    { id: 'pink', color: '#ff6ad5', score: 150, weight: 26, lateOnly: false },
    { id: 'violet', color: '#b388ff', score: 200, weight: 20, lateOnly: false },
    { id: 'orange', color: '#ff9f5a', score: 300, weight: 14, lateOnly: false },
    { id: 'gold', color: '#ffe66d', score: 500, weight: 10, lateOnly: true },
  ] as const,
} as const

export type StarlightRatingId = (typeof STARLIGHT_RUSH.rating)[number]['id']
export type StarlightStarKindId = (typeof STARLIGHT_RUSH.starKinds)[number]['id']
export type StarlightDifficultyPhase = 'early' | 'mid' | 'late'

export function getComboMultiplier(combo: number): number {
  if (combo >= 10) return 2
  if (combo >= 5) return 1.5
  return 1
}

export function getRatingId(score: number): StarlightRatingId {
  for (const tier of STARLIGHT_RUSH.rating) {
    if (score >= tier.min) return tier.id
  }
  return 'cadet'
}

export function getStarKindByIndex(kindIndex: number) {
  const kinds = STARLIGHT_RUSH.starKinds
  return kinds[clampKindIndex(kindIndex, kinds.length)] ?? kinds[0]
}

export function getBaseScore(kindIndex: number): number {
  return getStarKindByIndex(kindIndex).score
}

/** 重み付き抽選。gold は late のみ候補に入れる。 */
export function pickStarKindIndex(
  phase: StarlightDifficultyPhase = 'early',
  rng = Math.random,
): number {
  const kinds = STARLIGHT_RUSH.starKinds
  const allowLate = phase === 'late'
  let total = 0
  for (const kind of kinds) {
    if (kind.lateOnly && !allowLate) continue
    total += kind.weight
  }
  let roll = rng() * total
  for (let i = 0; i < kinds.length; i++) {
    const kind = kinds[i]
    if (kind.lateOnly && !allowLate) continue
    roll -= kind.weight
    if (roll <= 0) return i
  }
  return 0
}

function clampKindIndex(index: number, length: number) {
  if (!Number.isFinite(index) || length <= 0) return 0
  return Math.max(0, Math.min(length - 1, Math.floor(index)))
}

/** 経過秒から難易度フェーズ */
export function getDifficultyPhase(elapsedSec: number): StarlightDifficultyPhase {
  if (elapsedSec >= 55) return 'late'
  if (elapsedSec >= 28) return 'mid'
  return 'early'
}

type DailyBestPayload = {
  dateKey: string
  score: number
}

/** UTC 日付。日が変われば Today's Best は 0 から。 */
function parseDailyBest(raw: string | null, today: string): number {
  if (!raw) return 0
  try {
    const parsed = JSON.parse(raw) as DailyBestPayload
    if (parsed?.dateKey === today && typeof parsed.score === 'number' && Number.isFinite(parsed.score)) {
      return Math.max(0, Math.floor(parsed.score))
    }
  } catch {
    /* 旧形式の数値などは無視してデイリーからやり直す */
  }
  return 0
}

export function readBestScore(): number {
  try {
    return parseDailyBest(window.localStorage.getItem(STARLIGHT_RUSH.bestScoreKey), getUtcDateKey())
  } catch {
    return 0
  }
}

export function writeBestScore(score: number): number {
  const today = getUtcDateKey()
  const prev = readBestScore()
  const next = Math.max(prev, Math.floor(score))
  try {
    const payload: DailyBestPayload = { dateKey: today, score: next }
    window.localStorage.setItem(STARLIGHT_RUSH.bestScoreKey, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
  return next
}
