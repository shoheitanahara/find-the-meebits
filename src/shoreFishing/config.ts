import { getUtcDateKey } from '../top/dailyFeatured'
import { CAMERA_FOLLOW_OFFSET_XZ } from '../game/gameConfig'

/** Shore Fishing 定数の正本。 */

export type FishShadowSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge'

export type FishKindId =
  | 'sardine'
  | 'horseMackerel'
  | 'seaBass'
  | 'snapper'
  | 'flounder'
  | 'ray'
  | 'tuna'
  | 'seahorse'
  | 'hammerhead'
  | 'greatWhite'

export type FishKind = {
  id: FishKindId
  score: number
  weight: number
  shadow: FishShadowSize
  color: string
  rare?: boolean
}

export const SHORE_FISHING = {
  canvasElementId: 'shore-fishing-canvas',
  gameDurationSec: 90,
  countdownSec: 3,

  /** パークと同じ移動速度 */
  moveSpeed: 7,
  /** ボクセル床上面に合わせる（VoxelIslandGround TILE_H） */
  playerGroundY: 0.16,
  playerCollisionRadius: 0.45,
  /** ヤシなど小物の足元 Y */
  islandTileTopY: 0.16,

  /**
   * 楕円 footprint をボクセル化した孤島。
   * 見た目・歩行・岸判定は同じタイル海岸線を共有する。
   */
  island: {
    halfX: 9.5,
    halfZ: 7.2,
    /** タイル配置の正規化半径上限（楕円内） */
    voxelNormMax: 1.0,
    /** 岸辺：海までのタイル距離がこの値以下ならキャスト可 */
    shoreDistMax: 2,
    /** @deprecated 楕円歩行用。歩行はタイル判定へ移行 */
    walkHalfX: 9.2,
    walkHalfZ: 6.95,
    shoreNormMin: 0.62,
    shoreNormMax: 1.08,
  },

  playerStart: { x: 0 as number, z: 2.2 as number, rotationY: Math.PI as number },

  /** 島に出る釣り人 NPC 数（シーと同じビーチ服から選定） */
  npcCount: 3,
  npcWalkSpeed: 1.35,

  /** パークと同じ固定オフセット追従 */
  cameraFollow: {
    x: CAMERA_FOLLOW_OFFSET_XZ[0],
    y: 6.5,
    z: CAMERA_FOLLOW_OFFSET_XZ[1],
  },
  cameraLookY: 1.4,
  cameraFov: 50,

  /** 正面へ投げる距離（ワールド） */
  castDistance: 4.16,
  castBobberY: 0.05,
  catchHoldDistance: 0.85,
  catchHoldY: 1.4,

  /** 右手の釣り竿フィット（プレイヤーローカル） */
  rodHand: {
    handOffsetX: 0.03,
    handOffsetY: 0.05,
    handOffsetZ: 0.08,
    fallbackPosition: [0.28, 1.05, 0.22] as const,
    /** 竿の長さ（グリップ→穂先）。ライン先端にも使う */
    length: 1.55,
  },

  maxNibbles: 5,
  nibbleGapSec: { min: 0.55, max: 1.15 },
  biteWindowSec: 0.95,
  /**
   * キャスト＝引き上げの逆。
   * 振りかぶり（竿を上げる）→ 振り下ろし＋浮き飛行。合計は reelSec と同尺。
   */
  castWindupSec: 0.28,
  castFlightSec: 0.77,
  approachSec: { min: 0.8, max: 2.2 },
  reelSec: 1.05,
  catchShowSec: 1.1,
  missCooldownSec: 0.85,

  /** 同時に出せる魚影スロット数（手前・奥・左右） */
  shadowCount: 16,
  /** 魚影同士の最低間隔（メートル）。サイズに応じて実行時に加算 */
  shadowMinSeparation: 1.15,
  /** キャスト地点からこの距離以内の影だけが食いつく（メートル） */
  shadowReactRadius: 4.2,
  /** 影の寿命（秒）。シュモク／ホオジロ（huge+rare）は短め */
  shadowLifetimeSec: {
    tiny: { min: 18, max: 28 },
    small: { min: 16, max: 24 },
    medium: { min: 14, max: 22 },
    large: { min: 12, max: 18 },
    huge: { min: 5.5, max: 8.5 },
    rareMul: 0.72,
  },
  shadowRespawnGapSec: { min: 1.2, max: 3.2 },
  shadowFadeSec: 0.55,

  bestScoreKey: 'meebits-shore-fishing-best',

  rating: [
    { min: 6000, id: 'legend' as const },
    { min: 4000, id: 'captain' as const },
    { min: 2500, id: 'angler' as const },
    { min: 1200, id: 'castaway' as const },
    { min: 0, id: 'tidewalker' as const },
  ],

  fishKinds: [
    { id: 'sardine', score: 100, weight: 14, shadow: 'small', color: '#c5d8e8' },
    { id: 'horseMackerel', score: 150, weight: 12, shadow: 'small', color: '#6a9a78' },
    { id: 'ray', score: 220, weight: 11, shadow: 'large', color: '#5a4a68' },
    { id: 'seaBass', score: 280, weight: 11, shadow: 'medium', color: '#4a6070' },
    { id: 'snapper', score: 750, weight: 10, shadow: 'medium', color: '#e07060' },
    { id: 'flounder', score: 480, weight: 10, shadow: 'medium', color: '#c8b070' },
    { id: 'tuna', score: 900, weight: 9, shadow: 'large', color: '#3a5880' },
    { id: 'seahorse', score: 1000, weight: 5, shadow: 'tiny', color: '#e8a060', rare: true },
    { id: 'hammerhead', score: 1200, weight: 9, shadow: 'huge', color: '#6a7888', rare: true },
    { id: 'greatWhite', score: 1500, weight: 8, shadow: 'huge', color: '#d8e0e8', rare: true },
  ] as const satisfies readonly FishKind[],
} as const

export type ShoreFishingRatingId = (typeof SHORE_FISHING.rating)[number]['id']

export function getFishKind(id: FishKindId): FishKind {
  const found = SHORE_FISHING.fishKinds.find((f) => f.id === id)
  return found ?? SHORE_FISHING.fishKinds[0]
}

export function pickFishKindId(rng = Math.random): FishKindId {
  const total = SHORE_FISHING.fishKinds.reduce((sum, f) => sum + f.weight, 0)
  let roll = rng() * total
  for (const fish of SHORE_FISHING.fishKinds) {
    roll -= fish.weight
    if (roll <= 0) return fish.id
  }
  return SHORE_FISHING.fishKinds[SHORE_FISHING.fishKinds.length - 1].id
}

export function pickNibbleCount(rng = Math.random): number {
  return 1 + Math.floor(rng() * SHORE_FISHING.maxNibbles)
}

export function shadowLifetimeSecFor(fishId: FishKindId, rng = Math.random): number {
  const fish = getFishKind(fishId)
  const band = SHORE_FISHING.shadowLifetimeSec[fish.shadow]
  const base = band.min + rng() * (band.max - band.min)
  return fish.rare ? base * SHORE_FISHING.shadowLifetimeSec.rareMul : base
}

export function randomShadowSpot(
  rng = Math.random,
  opts?: { slotIndex?: number; slotCount?: number },
): { x: number; z: number; yaw: number } {
  const { halfX, halfZ } = SHORE_FISHING.island
  // スロット指定時は角度＋近／遠リングで被りにくくする
  let a: number
  if (opts?.slotIndex !== undefined && opts.slotCount && opts.slotCount > 0) {
    const step = (Math.PI * 2) / opts.slotCount
    a = opts.slotIndex * step + step * 0.5 + (rng() - 0.5) * step * 0.32
  } else {
    a = rng() * Math.PI * 2
  }
  // 岸から沖側。スロットは交互に近／遠リング
  let rNorm: number
  if (opts?.slotIndex !== undefined) {
    rNorm =
      opts.slotIndex % 2 === 0
        ? 1.26 + rng() * 0.16
        : 1.48 + rng() * 0.22
  } else {
    rNorm = 1.28 + rng() * 0.38
  }
  let x = Math.cos(a) * rNorm * halfX
  let z = Math.sin(a) * rNorm * halfZ
  const norm = islandNormRadius(x, z)
  if (norm < 1.22) {
    const push = 1.26 / Math.max(norm, 0.01)
    x *= push
    z *= push
  }
  // 島の中心向き（内向き）。外向きだと a+π/2 になる
  const yaw = Math.atan2(-x, -z) + (rng() - 0.5) * 0.7
  return { x, z, yaw }
}

export function getRatingId(score: number): ShoreFishingRatingId {
  for (const row of SHORE_FISHING.rating) {
    if (score >= row.min) return row.id
  }
  return 'tidewalker'
}

export function islandNormRadius(x: number, z: number) {
  const { halfX, halfZ } = SHORE_FISHING.island
  return Math.hypot(x / halfX, z / halfZ)
}

export {
  isNearShore,
  isInWater,
  castLandingFrom,
} from './islandTiles'

type DailyBestPayload = { dateKey: string; score: number }

export function readBestScore() {
  if (typeof window === 'undefined') return 0
  const today = getUtcDateKey()
  try {
    // 来場証と同じ JSON（dateKey + score）
    const raw = localStorage.getItem(SHORE_FISHING.bestScoreKey)
    if (raw) {
      const parsed = JSON.parse(raw) as DailyBestPayload
      if (parsed?.dateKey === today && Number.isFinite(parsed.score)) {
        return Math.max(0, Math.floor(parsed.score))
      }
    }
    // 旧形式 `key:date` の数値のみ → 新形式へ寄せる
    const legacy = localStorage.getItem(`${SHORE_FISHING.bestScoreKey}:${today}`)
    const n = legacy ? Number(legacy) : 0
    if (Number.isFinite(n) && n > 0) {
      const score = Math.max(0, Math.floor(n))
      try {
        localStorage.setItem(
          SHORE_FISHING.bestScoreKey,
          JSON.stringify({ dateKey: today, score } satisfies DailyBestPayload),
        )
      } catch {
        /* ignore */
      }
      return score
    }
    return 0
  } catch {
    return 0
  }
}

export function writeBestScore(score: number) {
  if (typeof window === 'undefined') return 0
  const today = getUtcDateKey()
  const next = Math.max(readBestScore(), Math.floor(score))
  try {
    const payload: DailyBestPayload = { dateKey: today, score: next }
    localStorage.setItem(SHORE_FISHING.bestScoreKey, JSON.stringify(payload))
  } catch {
    // ignore
  }
  return next
}
