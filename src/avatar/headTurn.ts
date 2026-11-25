/**
 * 体はそのままで、顔だけを相手の方へ向ける（左右の最大角まで）。
 * 首と頭で分けて回すと自然に見える（首 4 : 頭 6）。
 *
 * 使い方（毎フレーム）:
 *   resetHeadTurn(vrm, turn)            … ポーズを当てる前に、前フレームで足した分を戻す
 *   applyVRMLocomotion(...) など
 *   applyHeadTurn(vrm, turn, target, dt) … ポーズのあとに、ねらいの角度へなめらかに向ける
 *   update(dt)
 */
import type { VRM } from '@pixiv/three-vrm'
import { MathUtils } from 'three'

/** 顔を向けられる左右の最大角（30°） */
export const HEAD_TURN_MAX = Math.PI / 6
const NECK_SHARE = 0.4
/** 向きの追いつく速さ（大きいほど速い） */
const TURN_SPEED = 4

export type HeadTurn = { yaw: number; applied: number }

export function createHeadTurn(): HeadTurn {
  return { yaw: 0, applied: 0 }
}

function bones(vrm: VRM | null) {
  return {
    neck: vrm?.humanoid.getNormalizedBoneNode('neck') ?? null,
    head: vrm?.humanoid.getNormalizedBoneNode('head') ?? null,
  }
}

/** 前のフレームで足した顔の向きを戻す（ポーズを当てる前に呼ぶ） */
export function resetHeadTurn(vrm: VRM | null, turn: HeadTurn) {
  const { neck, head } = bones(vrm)
  if (neck) neck.rotation.y -= turn.applied * NECK_SHARE
  if (head) head.rotation.y -= turn.applied * (1 - NECK_SHARE)
  turn.applied = 0
}

/** ポーズを当てたあとに呼ぶ。targetYaw は体の正面から見た角度（+ が体の左＝ローカル +X 側） */
export function applyHeadTurn(vrm: VRM | null, turn: HeadTurn, targetYaw: number, delta: number) {
  turn.yaw += (targetYaw - turn.yaw) * (1 - Math.exp(-delta * TURN_SPEED))
  const { neck, head } = bones(vrm)
  if (neck) neck.rotation.y += turn.yaw * NECK_SHARE
  if (head) head.rotation.y += turn.yaw * (1 - NECK_SHARE)
  turn.applied = neck || head ? turn.yaw : 0
}

/** 体の向き bodyYaw で (x, z) にいる人が、(tx, tz) を見るための角度（左右 max で止める） */
export function headYawToward(
  x: number,
  z: number,
  bodyYaw: number,
  tx: number,
  tz: number,
  max = HEAD_TURN_MAX,
) {
  const relative = Math.atan2(tx - x, tz - z) - bodyYaw
  return MathUtils.clamp(Math.atan2(Math.sin(relative), Math.cos(relative)), -max, max)
}
