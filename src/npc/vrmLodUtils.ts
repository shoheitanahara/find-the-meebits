import {
  getNpcVrmAlwaysLoadDistance,
  getNpcVrmCameraSideLoadDistance,
  getNpcVrmCameraSideUnloadDistance,
  getNpcVrmLateralSpan,
  getNpcVrmViewAheadLoadDistance,
  getNpcVrmViewAheadUnloadDistance,
  CREATOR_VRM_LOAD_PRIORITY,
} from '../game/perfConfig'
import type { Vector3Tuple } from '../types/game'
import { CAMERA_FOLLOW_OFFSET_XZ } from '../game/gameConfig'

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
  return Math.abs(npcPosition[0] - playerPosition[0]) > getNpcVrmLateralSpan()
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
    return wasActive ? getNpcVrmCameraSideUnloadDistance() : getNpcVrmCameraSideLoadDistance()
  }

  return wasActive ? getNpcVrmViewAheadUnloadDistance() : getNpcVrmViewAheadLoadDistance()
}

export function isNpcWithinVrmRange(
  distance: number,
  playerPosition: Vector3Tuple,
  npcPosition: Vector3Tuple,
  wasActive: boolean,
) {
  const shortRange = usesShortVrmLodRange(playerPosition, npcPosition)
  const alwaysLoadDistance = getNpcVrmAlwaysLoadDistance()

  if (!shortRange && distance <= alwaysLoadDistance) {
    return true
  }

  return distance <= getNpcVrmDistanceThreshold(playerPosition, npcPosition, wasActive)
}

/** intro / preparing 中は近い NPC を preload より先にキューへ入れる */
export function getNpcVrmLoadPriority(
  distance: number,
  gamePhase: 'intro' | 'preparing' | 'playing' | 'timedOut' | 'cleared' | 'conquered',
  isCreator = false,
) {
  if (isCreator) {
    return CREATOR_VRM_LOAD_PRIORITY
  }

  if (gamePhase === 'intro' || gamePhase === 'preparing') {
    return -700 + Math.min(distance, 250)
  }

  return distance
}
