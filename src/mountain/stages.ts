/**
 * Mountain Climb — ステージ1〜20の難易度パラメータ。
 * 標高表示は labelBaseM + ステージ内進捗で 50m 刻み・約1000mまで繋がる。
 * 地形シードは実行時に日替わりソルトが混ざる（`mixDailyStageSeed`）。
 */

export const MOUNTAIN_STAGE_COUNT = 20

export type MountainStageDef = {
  id: number
  /** HUD 表示の基準標高（0, 50, …, 950） */
  labelBaseM: number
  seed: number
  zStart: number
  zEnd: number
  /** ステージ内物理スタート標高（ボクセル層） */
  startElev: number
  /** ステージ内ゴール標高（約 +50） */
  goalElev: number
  /** レーン蛇行の振幅（大きいほど曲がりくねる） */
  windAmplitude: number
  /** 蛇行の波数（大きいほど曲がりが多い） */
  windFrequency: number
  ravineCount: number
  /** 0〜1。full（横断ジャンプ必須）の割合 */
  fullRatio: number
  cliffNotchChance: number
  /** 棚の半幅パディング（小さいほど狭い） */
  shelfPad: number
}

/**
 * 難易度カーブ: Stage1 は導入、中盤からしっかり厳しく、Stage20 まで上げる。
 */
function stageParams(id: number): Omit<MountainStageDef, 'id' | 'labelBaseM' | 'seed' | 'zStart' | 'zEnd' | 'startElev' | 'goalElev'> {
  const linear = (id - 1) / (MOUNTAIN_STAGE_COUNT - 1)
  // 中盤以降を早めに上げる（旧 0.88 冪だと Stage7 が甘すぎた）
  const t = Math.pow(linear, 0.72)
  return {
    windAmplitude: 3.8 + t * 7.2,
    windFrequency: 0.62 + t * 1.4,
    // コース延長に合わせて密度を確保（約 1 / 7〜8z）
    ravineCount: Math.round(28 + t * 42),
    fullRatio: 0.32 + t * 0.55,
    cliffNotchChance: 0.28 + t * 0.42,
    shelfPad: 0.95 - t * 0.4,
  }
}

/** Stage 1〜20。物理は各ステージ約50層、表示は累積1000m。 */
export const MOUNTAIN_STAGES: readonly MountainStageDef[] = Array.from({ length: MOUNTAIN_STAGE_COUNT }, (_, index) => {
  const id = index + 1
  return {
    id,
    labelBaseM: index * 50,
    seed: 1000 + id * 97,
    zStart: 16,
    /** 奥行きを長く取り、標高+50 を急壁なしで頂上（zEnd）へ繋ぐ */
    zEnd: -280,
    startElev: 2,
    goalElev: 52,
    ...stageParams(id),
  }
})

export function getStageDef(id: number): MountainStageDef {
  const stage = MOUNTAIN_STAGES.find((item) => item.id === id)
  if (!stage) return MOUNTAIN_STAGES[0]
  return stage
}

export function clampStageId(id: number) {
  return Math.max(1, Math.min(MOUNTAIN_STAGE_COUNT, Math.floor(id)))
}
