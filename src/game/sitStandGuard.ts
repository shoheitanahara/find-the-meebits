/**
 * 座った直後に、残っていた移動入力（スティックを倒したまま・キーを押したまま）で
 * すぐ立ち上がってしまうのを防ぐ。
 *
 * 立ち上がれるのは次の両方を満たしたとき:
 * - 座ってから SIT_STAND_DELAY_MS 経過している
 * - 座ったあと、移動入力を一度離している
 */
export const SIT_STAND_DELAY_MS = 700

export type SitStandGuard = {
  /** 座った瞬間に呼ぶ */
  onSit: (nowMs: number) => void
  /** 毎フレーム呼ぶ。移動入力で立ち上がってよいか */
  canStandFromMove: (nowMs: number, wantsMove: boolean) => boolean
}

export function createSitStandGuard(): SitStandGuard {
  let sittingSince = -Infinity
  let releasedSinceSit = true
  return {
    onSit(nowMs) {
      sittingSince = nowMs
      releasedSinceSit = false
    },
    canStandFromMove(nowMs, wantsMove) {
      if (!wantsMove) {
        releasedSinceSit = true
        return false
      }
      return releasedSinceSit && nowMs - sittingSince >= SIT_STAND_DELAY_MS
    },
  }
}
