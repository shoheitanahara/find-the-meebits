export const INITIAL_NPC_COUNT = 300
export const NPC_COUNT_INCREMENT = 50
export const MAX_NPC_COUNT = 1000
export const GAME_TIME_LIMIT_SECONDS = 180
export const WORLD_RADIUS = 72
export const PLAYER_START_POSITION = [0, 0, 62] as const
export const INTERACTION_DISTANCE = 2.7
/** この距離以内は方向に関係なく常に VRM 候補 */
export const NPC_VRM_ALWAYS_LOAD_DISTANCE = 40
/** プレイヤー後方（入口側・+Z）でも見える距離までロード */
export const NPC_VRM_LOAD_DISTANCE_MAP_NEAR = 55
export const NPC_VRM_UNLOAD_DISTANCE_MAP_NEAR = 62
/** マップ奥（北側・プレイヤーより -Z）の VRM 距離 */
export const NPC_VRM_LOAD_DISTANCE_MAP_DEEP = 100
export const NPC_VRM_UNLOAD_DISTANCE_MAP_DEEP = 110
export const NPC_FAR_UPDATE_DISTANCE = 50
export const NPC_MAX_CONCURRENT_VRM = 300
export const DEFAULT_PLAYER_MEEBIT_ID = 4274
export const CREATOR_NPC_ID = 'npc-shawn-t-art'
export const CREATOR_MEEBIT_ID = 11143

/** @deprecated Use NPC_VRM_LOAD_DISTANCE_MAP_DEEP */
export const NPC_VRM_VISIBLE_DISTANCE = NPC_VRM_LOAD_DISTANCE_MAP_DEEP

/** @deprecated Use activeNpcCount from gameStore */
export const NPC_COUNT = INITIAL_NPC_COUNT

export function getStageFromNpcCount(npcCount: number) {
  return 1 + Math.floor((npcCount - INITIAL_NPC_COUNT) / NPC_COUNT_INCREMENT)
}

export function isFullyConquered(npcCount: number) {
  return npcCount >= MAX_NPC_COUNT
}
