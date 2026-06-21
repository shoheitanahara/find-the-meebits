import type { Vector3Tuple } from '../types/game'
import {
  CAMERA_FOLLOW_OFFSET_XZ,
  NPC_VRM_ALWAYS_LOAD_DISTANCE,
  NPC_VRM_LATERAL_SPAN,
  NPC_VRM_LOAD_DISTANCE_CAMERA_SIDE,
  NPC_VRM_LOAD_DISTANCE_VIEW_AHEAD,
  NPC_VRM_UNLOAD_DISTANCE_CAMERA_SIDE,
  NPC_VRM_UNLOAD_DISTANCE_VIEW_AHEAD,
} from '../game/gameConfig'

/**
 * カメラ側（FollowCamera の固定オフセット方向）にいるか。
 * アバターの向きとは無関係。カメラは常にプレイヤーの +Z 側にいる。
 */
export function isNpcOnCameraSide(playerPosition: Vector3Tuple, npcPosition: Vector3Tuple) {
  const dx = npcPosition[0] - playerPosition[0]
  const dz = npcPosition[2] - playerPosition[2]
  return dx * CAMERA_FOLLOW_OFFSET_XZ[0] + dz * CAMERA_FOLLOW_OFFSET_XZ[1] > 0
}

/** 画面の左右外（プレイヤー正面ラインから横に離れすぎ）か */
export function isNpcOutsideLateralSpan(playerPosition: Vector3Tuple, npcPosition: Vector3Tuple) {
  return Math.abs(npcPosition[0] - playerPosition[0]) > NPC_VRM_LATERAL_SPAN
}

export function usesShortVrmLodRange(playerPosition: Vector3Tuple, npcPosition: Vector3Tuple) {
  return isNpcOnCameraSide(playerPosition, npcPosition) || isNpcOutsideLateralSpan(playerPosition, npcPosition)
}

export function getNpcVrmDistanceThreshold(
  playerPosition: Vector3Tuple,
  npcPosition: Vector3Tuple,
  wasActive: boolean,
) {
  if (usesShortVrmLodRange(playerPosition, npcPosition)) {
    return wasActive ? NPC_VRM_UNLOAD_DISTANCE_CAMERA_SIDE : NPC_VRM_LOAD_DISTANCE_CAMERA_SIDE
  }

  return wasActive ? NPC_VRM_UNLOAD_DISTANCE_VIEW_AHEAD : NPC_VRM_LOAD_DISTANCE_VIEW_AHEAD
}

export function isNpcWithinVrmRange(
  distance: number,
  playerPosition: Vector3Tuple,
  npcPosition: Vector3Tuple,
  wasActive: boolean,
) {
  const shortRange = usesShortVrmLodRange(playerPosition, npcPosition)

  if (!shortRange && distance <= NPC_VRM_ALWAYS_LOAD_DISTANCE) {
    return true
  }

  return distance <= getNpcVrmDistanceThreshold(playerPosition, npcPosition, wasActive)
}
