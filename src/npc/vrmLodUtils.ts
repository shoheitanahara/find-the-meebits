import type { Vector3Tuple } from '../types/game'
import {
  NPC_VRM_ALWAYS_LOAD_DISTANCE,
  NPC_VRM_LOAD_DISTANCE_MAP_DEEP,
  NPC_VRM_LOAD_DISTANCE_MAP_NEAR,
  NPC_VRM_UNLOAD_DISTANCE_MAP_DEEP,
  NPC_VRM_UNLOAD_DISTANCE_MAP_NEAR,
} from '../game/gameConfig'

/**
 * プレイヤーから見てマップ奥（北・-Z）側にいるか。
 * 奥側は遠距離まで、手前（入口側）は別閾値でロードする。
 */
export function isNpcTowardMapDeep(playerPosition: Vector3Tuple, npcPosition: Vector3Tuple) {
  return npcPosition[2] < playerPosition[2]
}

export function getNpcVrmDistanceThreshold(
  playerPosition: Vector3Tuple,
  npcPosition: Vector3Tuple,
  wasActive: boolean,
) {
  const towardMapDeep = isNpcTowardMapDeep(playerPosition, npcPosition)

  if (towardMapDeep) {
    return wasActive ? NPC_VRM_UNLOAD_DISTANCE_MAP_DEEP : NPC_VRM_LOAD_DISTANCE_MAP_DEEP
  }

  return wasActive ? NPC_VRM_UNLOAD_DISTANCE_MAP_NEAR : NPC_VRM_LOAD_DISTANCE_MAP_NEAR
}

export function isNpcWithinVrmRange(
  distance: number,
  playerPosition: Vector3Tuple,
  npcPosition: Vector3Tuple,
  wasActive: boolean,
) {
  if (distance <= NPC_VRM_ALWAYS_LOAD_DISTANCE) {
    return true
  }

  return distance <= getNpcVrmDistanceThreshold(playerPosition, npcPosition, wasActive)
}
