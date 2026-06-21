/** @deprecated Use gameProgression instead */
export const INITIAL_NPC_COUNT = 200
/** @deprecated Use gameProgression instead */
export const NPC_COUNT_INCREMENT = 50
/** @deprecated Use gameProgression instead */
export const MAX_NPC_COUNT = 400
export const GAME_TIME_LIMIT_SECONDS = 180
export const WORLD_RADIUS = 72
export const PLAYER_START_POSITION = [0, 0, 62] as const
export const INTERACTION_DISTANCE = 2.7
/** この距離以内は方向に関係なく常に VRM 候補 */
export const NPC_VRM_ALWAYS_LOAD_DISTANCE = 40
/** カメラ側（FollowCamera が常にいる +Z 側）の VRM 距離 */
export const NPC_VRM_LOAD_DISTANCE_CAMERA_SIDE = 5
export const NPC_VRM_UNLOAD_DISTANCE_CAMERA_SIDE = 7
/** 画面中央からの左右幅。この外側はカメラ側と同じ短距離 LOD */
export const NPC_VRM_LATERAL_SPAN = 40
/** 画面奥（カメラの反対側・-Z 方向）の VRM 距離 */
export const NPC_VRM_LOAD_DISTANCE_VIEW_AHEAD = 100
export const NPC_VRM_UNLOAD_DISTANCE_VIEW_AHEAD = 110
/** FollowCamera の XZ オフセット（カメラ側判定用・アバター向きとは無関係） */
export const CAMERA_FOLLOW_OFFSET_XZ = [0, 10] as const
export const NPC_FAR_UPDATE_DISTANCE = 50
export const NPC_MAX_CONCURRENT_VRM = 150
export const DEFAULT_PLAYER_MEEBIT_ID = 4274
export const VRM_WORLD_SCALE = 1.05
/** 足元を地面に合わせたあと、わずかに持ち上げる（Z-fighting 防止） */
export const VRM_FEET_Y_OFFSET = 0.06
export const CREATOR_NPC_ID = 'npc-shawn-t-art'
export const CREATOR_MEEBIT_ID = 11143

/** @deprecated Use NPC_VRM_LOAD_DISTANCE_VIEW_AHEAD */
export const NPC_VRM_VISIBLE_DISTANCE = NPC_VRM_LOAD_DISTANCE_VIEW_AHEAD

/** @deprecated Use activeNpcCount from gameStore */
export const NPC_COUNT = INITIAL_NPC_COUNT

export function getStageFromNpcCount(npcCount: number) {
  return 1 + Math.floor((npcCount - INITIAL_NPC_COUNT) / NPC_COUNT_INCREMENT)
}

export function isFullyConquered(npcCount: number) {
  return npcCount >= MAX_NPC_COUNT
}
