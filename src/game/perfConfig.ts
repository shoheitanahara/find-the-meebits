import { NPC_MAX_CONCURRENT_VRM } from './gameConfig'

/** スマホ・タブレット（1024px 未満）向けの同時 VRM ロード上限 */
const MOBILE_MAX_CONCURRENT_VRM = 100
const MOBILE_MAX_CONCURRENT_LOADS = 12
const MOBILE_STAGE_READY_MIN_COUNT = 18
const MOBILE_WARMUP_LOAD_DISTANCE = 50

/** PC 向けの準備完了・ウォームアップ設定 */
const PC_STAGE_READY_MIN_COUNT = 36
const PC_WARMUP_LOAD_DISTANCE = 60

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
  return isMobilePerfMode() ? MOBILE_MAX_CONCURRENT_LOADS : 24
}

export function getStageReadyMinCount() {
  return isMobilePerfMode() ? MOBILE_STAGE_READY_MIN_COUNT : PC_STAGE_READY_MIN_COUNT
}

/** intro / preparing 中に先読みする距離。プレイ開始直後のポップインを減らす */
export function getWarmupLoadDistance() {
  return isMobilePerfMode() ? MOBILE_WARMUP_LOAD_DISTANCE : PC_WARMUP_LOAD_DISTANCE
}

/** 同時表示上限 + ターゲット/プレイヤー分。これを超える VRM テンプレートは LRU で破棄 */
export function getMaxVrmTemplateCache() {
  return getNpcMaxConcurrentVrm() + 12
}
