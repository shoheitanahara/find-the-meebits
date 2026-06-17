import { NPC_MAX_CONCURRENT_VRM } from './gameConfig'

/** スマホでは同時にロードする VRM 数だけ抑える（NPC 総数は変えない） */
const MOBILE_MAX_CONCURRENT_VRM = 100
const MOBILE_MAX_CONCURRENT_LOADS = 8
const MOBILE_STAGE_READY_MIN_COUNT = 12

export function isMobilePerfMode() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia('(max-width: 767px)').matches
}

export function getNpcMaxConcurrentVrm() {
  return isMobilePerfMode() ? MOBILE_MAX_CONCURRENT_VRM : NPC_MAX_CONCURRENT_VRM
}

export function getMaxConcurrentVrmLoads() {
  return isMobilePerfMode() ? MOBILE_MAX_CONCURRENT_LOADS : 24
}

export function getStageReadyMinCount() {
  return isMobilePerfMode() ? MOBILE_STAGE_READY_MIN_COUNT : 24
}

/** 同時表示上限 + ターゲット/プレイヤー分。これを超える VRM テンプレートは LRU で破棄 */
export function getMaxVrmTemplateCache() {
  return getNpcMaxConcurrentVrm() + 12
}
