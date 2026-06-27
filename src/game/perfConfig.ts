import {
  NPC_FAR_UPDATE_DISTANCE,
  NPC_MAX_CONCURRENT_VRM,
  NPC_VRM_ALWAYS_LOAD_DISTANCE,
  NPC_VRM_LATERAL_SPAN,
  NPC_VRM_LOAD_DISTANCE_CAMERA_SIDE,
  NPC_VRM_LOAD_DISTANCE_VIEW_AHEAD,
  NPC_VRM_UNLOAD_DISTANCE_CAMERA_SIDE,
  NPC_VRM_UNLOAD_DISTANCE_VIEW_AHEAD,
} from './gameConfig'

/** スマホ・タブレット（1024px 未満）向け */
const MOBILE_MAX_CONCURRENT_VRM = 38
const MOBILE_MAX_CONCURRENT_LOADS = 6
const MOBILE_STAGE_READY_MIN_COUNT = 12
const MOBILE_STAGE_READY_RATIO = 0.75
const MOBILE_WARMUP_LOAD_DISTANCE = 40

const MOBILE_VRM_ALWAYS_LOAD_DISTANCE = 28
const MOBILE_VRM_LATERAL_SPAN = 28
const MOBILE_VRM_VIEW_AHEAD_LOAD = 65
const MOBILE_VRM_VIEW_AHEAD_UNLOAD = 75

const MOBILE_NPC_FAR_UPDATE_DISTANCE = 32
const MOBILE_NPC_FAR_UPDATE_SKIP_DIVISOR = 5

const MOBILE_MAX_CANVAS_DPR = 1
const MOBILE_SHADOW_MAP_SIZE = 512
const MOBILE_FOG_NEAR = 58
const MOBILE_FOG_FAR = 130

/** PC 向け */
const PC_MAX_CONCURRENT_LOADS = 16
const PC_STAGE_READY_MIN_COUNT = 36
const PC_STAGE_READY_RATIO = 0.85
const PC_WARMUP_LOAD_DISTANCE = 60
const PC_MAX_CANVAS_DPR = 1
const PC_SHADOW_MAP_SIZE = 1024
const PC_FOG_NEAR = 70
const PC_FOG_FAR = 150
const PC_NPC_FAR_UPDATE_SKIP_DIVISOR = 3

/** Tailwind `lg` 未満 = スマホ + タブレット */
export const TOUCH_UI_MAX_WIDTH_PX = 1023

export function isMobilePerfMode() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia(`(max-width: ${TOUCH_UI_MAX_WIDTH_PX}px)`).matches
}

/** UI / カメラ向けのタッチ端末判定（isMobilePerfMode と同じ） */
export function isTouchUiMode() {
  return isMobilePerfMode()
}

export function getNpcMaxConcurrentVrm() {
  return isMobilePerfMode() ? MOBILE_MAX_CONCURRENT_VRM : NPC_MAX_CONCURRENT_VRM
}

export function getMaxConcurrentVrmLoads() {
  return isMobilePerfMode() ? MOBILE_MAX_CONCURRENT_LOADS : PC_MAX_CONCURRENT_LOADS
}

export function getStageReadyMinCount() {
  return isMobilePerfMode() ? MOBILE_STAGE_READY_MIN_COUNT : PC_STAGE_READY_MIN_COUNT
}

export function getStageReadyRatio() {
  return isMobilePerfMode() ? MOBILE_STAGE_READY_RATIO : PC_STAGE_READY_RATIO
}

export function getWarmupLoadDistance() {
  return isMobilePerfMode() ? MOBILE_WARMUP_LOAD_DISTANCE : PC_WARMUP_LOAD_DISTANCE
}

export function getNpcVrmAlwaysLoadDistance() {
  return isMobilePerfMode() ? MOBILE_VRM_ALWAYS_LOAD_DISTANCE : NPC_VRM_ALWAYS_LOAD_DISTANCE
}

export function getNpcVrmLateralSpan() {
  return isMobilePerfMode() ? MOBILE_VRM_LATERAL_SPAN : NPC_VRM_LATERAL_SPAN
}

export function getNpcVrmCameraSideLoadDistance() {
  return NPC_VRM_LOAD_DISTANCE_CAMERA_SIDE
}

export function getNpcVrmCameraSideUnloadDistance() {
  return NPC_VRM_UNLOAD_DISTANCE_CAMERA_SIDE
}

export function getNpcVrmViewAheadLoadDistance() {
  return isMobilePerfMode() ? MOBILE_VRM_VIEW_AHEAD_LOAD : NPC_VRM_LOAD_DISTANCE_VIEW_AHEAD
}

export function getNpcVrmViewAheadUnloadDistance() {
  return isMobilePerfMode() ? MOBILE_VRM_VIEW_AHEAD_UNLOAD : NPC_VRM_UNLOAD_DISTANCE_VIEW_AHEAD
}

export function getNpcFarUpdateDistance() {
  return isMobilePerfMode() ? MOBILE_NPC_FAR_UPDATE_DISTANCE : NPC_FAR_UPDATE_DISTANCE
}

export function getNpcFarUpdateSkipDivisor() {
  return isMobilePerfMode() ? MOBILE_NPC_FAR_UPDATE_SKIP_DIVISOR : PC_NPC_FAR_UPDATE_SKIP_DIVISOR
}

export function getMaxCanvasDpr() {
  return isMobilePerfMode() ? MOBILE_MAX_CANVAS_DPR : PC_MAX_CANVAS_DPR
}

export function getEnableAntialias() {
  return !isMobilePerfMode()
}

export function getShadowMapSize() {
  return isMobilePerfMode() ? MOBILE_SHADOW_MAP_SIZE : PC_SHADOW_MAP_SIZE
}

export function shouldNpcCastShadow() {
  return !isMobilePerfMode()
}

export function getFogDistances() {
  return isMobilePerfMode()
    ? { near: MOBILE_FOG_NEAR, far: MOBILE_FOG_FAR }
    : { near: PC_FOG_NEAR, far: PC_FOG_FAR }
}

/** 同時表示上限 + ターゲット/プレイヤー分。これを超える VRM テンプレートは LRU で破棄 */
export function getMaxVrmTemplateCache() {
  return getNpcMaxConcurrentVrm() + 12
}

/** プレイヤー VRM は NPC の warmup より常に先にロードキューへ入れる */
export const PLAYER_VRM_LOAD_PRIORITY = -2000

/** ターゲット VRM テンプレートのプリロード（NPC より先） */
export const TARGET_VRM_PRELOAD_PRIORITY = -300

/** ターゲット静止画キャプチャ用 VRM ロード（テンプレートプリロードより少し後） */
export const TARGET_PREVIEW_CAPTURE_VRM_PRIORITY = -350

/** タブ非表示復帰などで delta が跳ねるのを抑える（約 3 フレーム分上限） */
const MAX_FRAME_DELTA_SEC = 1 / 20

export function clampFrameDelta(delta: number) {
  return Math.min(Math.max(delta, 0), MAX_FRAME_DELTA_SEC)
}
