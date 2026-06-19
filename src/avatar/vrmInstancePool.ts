import type { VRM } from '@pixiv/three-vrm'
import { VRMUtils } from '@pixiv/three-vrm'
import { Group } from 'three'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { getMaxVrmTemplateCache } from '../game/perfConfig'
import { clearPendingVrmLoads, enqueueVrmLoad } from './vrmLoadQueue'
import { getMeebitVrmUrl, loadVRM } from './VRMLoader'

type VrmInstance = {
  vrm: VRM
  scene: Group
  isPrimary: boolean
}

const templates = new Map<number, VRM>()
const inflight = new Map<number, Promise<VRM>>()
const primaryHolders = new Set<number>()
let poolGeneration = 0
let pendingKeepMeebitIds: Set<number> | null = null

function touchTemplate(meebitId: number) {
  const template = templates.get(meebitId)
  if (!template) {
    return
  }

  templates.delete(meebitId)
  templates.set(meebitId, template)
}

function trimTemplateCache() {
  const maxTemplates = getMaxVrmTemplateCache()

  while (templates.size > maxTemplates) {
    let evicted = false

    for (const meebitId of templates.keys()) {
      if (primaryHolders.has(meebitId)) {
        continue
      }

      evictVrmTemplate(meebitId)
      evicted = true
      break
    }

    if (!evicted) {
      break
    }
  }
}

export function resetVrmInstancePool() {
  poolGeneration += 1
  primaryHolders.clear()
  inflight.clear()
  clearPendingVrmLoads()
}

/**
 * ステージ切り替え/リトライ時に「参照中のVRMを壊さず」状態だけリセットする。
 * テンプレート本体の破棄は NPC ツリーがアンマウントされた後に finalize を呼ぶ。
 */
export function resetVrmInstancePoolForStageChange(keepMeebitIds: number[] = []) {
  resetVrmInstancePool()
  pendingKeepMeebitIds = new Set(keepMeebitIds)
}

/** 新 layout マウント後（旧 NPC アンマウント後）に呼び、不要テンプレートを破棄する */
export function finalizeVrmInstancePoolEviction() {
  if (!pendingKeepMeebitIds) {
    return
  }

  const keep = pendingKeepMeebitIds
  pendingKeepMeebitIds = null

  for (const meebitId of [...templates.keys()]) {
    if (!keep.has(meebitId)) {
      evictVrmTemplate(meebitId)
    }
  }

  trimTemplateCache()
}

export function preloadVrm(meebitId: number, priority = -200) {
  void ensureTemplate(meebitId, priority)
}

/**
 * メモリ回収が必要な場合のみ呼ぶ（通常プレイ中は不要）。
 * 参照中のテンプレートを破棄するとクラッシュ原因になるため、極力避ける。
 */
export function hardResetVrmInstancePool() {
  resetVrmInstancePool()
  pendingKeepMeebitIds = null

  for (const vrm of templates.values()) {
    VRMUtils.deepDispose(vrm.scene)
  }

  templates.clear()
}

async function ensureTemplate(meebitId: number, priority: number): Promise<VRM> {
  const cached = templates.get(meebitId)
  if (cached) {
    touchTemplate(meebitId)
    return cached
  }

  const generation = poolGeneration
  let pending = inflight.get(meebitId)
  if (!pending) {
    pending = enqueueVrmLoad(() => loadVRM(getMeebitVrmUrl(meebitId)), priority).then((vrm) => {
      inflight.delete(meebitId)

      if (generation !== poolGeneration) {
        VRMUtils.deepDispose(vrm.scene)
        throw new Error('VRM load cancelled by pool reset.')
      }

      templates.set(meebitId, vrm)
      trimTemplateCache()
      return vrm
    })
    inflight.set(meebitId, pending)
  }

  return pending
}

export async function acquireVrmInstance(
  meebitId: number,
  priority: number,
  needsAnimation: boolean,
): Promise<VrmInstance> {
  const vrm = await ensureTemplate(meebitId, priority)

  if (needsAnimation && !primaryHolders.has(meebitId)) {
    primaryHolders.add(meebitId)
    touchTemplate(meebitId)
    return { vrm, scene: vrm.scene, isPrimary: true }
  }

  touchTemplate(meebitId)

  return {
    vrm,
    scene: cloneSkeleton(vrm.scene) as Group,
    isPrimary: false,
  }
}

export function releaseVrmInstance(meebitId: number, instance: VrmInstance) {
  if (instance.isPrimary) {
    primaryHolders.delete(meebitId)
    return
  }

  VRMUtils.deepDispose(instance.scene)
}

export function evictVrmTemplate(meebitId: number) {
  if (primaryHolders.has(meebitId)) {
    return
  }

  const template = templates.get(meebitId)
  if (!template) {
    return
  }

  VRMUtils.deepDispose(template.scene)
  templates.delete(meebitId)
}
