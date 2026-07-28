import { getMeebitPreviewImageUrl, uploadMeebitPreviewToR2 } from './meebitPreviewUrl'
import { MEEBIT_PREVIEW_IMAGE_VERSION } from './targetPreviewCaptureConfig'

const PREVIEW_RENDER_VERSION = 6

/** 右上ターゲット HUD — キャプチャキュー最優先 */
export const TARGET_HUD_PREVIEW_PRIORITY = 0
/** スタート画面のターゲットプレビュー */
export const START_SCREEN_TARGET_PREVIEW_PRIORITY = 5
/** プレイヤーアバターなど */
export const DEFAULT_PREVIEW_PRIORITY = 50

type PreviewCacheEntry = string | 'error'

type PreviewQueueEntry = {
  meebitNumber: number
  priority: number
  seq: number
}

const cache = new Map<string, PreviewCacheEntry>()
const listeners = new Map<string, Set<() => void>>()
const queue: PreviewQueueEntry[] = []
const queued = new Set<string>()
const staticLoadStarted = new Set<string>()

let activeMeebit: number | null = null
let processCapture: ((meebitNumber: number | null) => void) | null = null
let enqueueSeq = 0

function cacheKey(meebitNumber: number) {
  return `${PREVIEW_RENDER_VERSION}:${MEEBIT_PREVIEW_IMAGE_VERSION}:${meebitNumber}`
}

function notify(meebitNumber: number) {
  for (const listener of listeners.get(cacheKey(meebitNumber)) ?? []) {
    listener()
  }
}

function sortPreviewQueue() {
  queue.sort((left, right) => left.priority - right.priority || left.seq - right.seq)
}

function enqueuePreview(meebitNumber: number, priority: number) {
  const key = cacheKey(meebitNumber)
  const existing = queue.find((entry) => entry.meebitNumber === meebitNumber)

  if (existing) {
    if (priority < existing.priority) {
      existing.priority = priority
      sortPreviewQueue()
    }
    return
  }

  queue.push({ meebitNumber, priority, seq: enqueueSeq++ })
  queued.add(key)
  sortPreviewQueue()
}

function drainQueue() {
  if (activeMeebit !== null || !processCapture) {
    return
  }

  const next = queue.shift()
  if (!next) {
    processCapture(null)
    return
  }

  activeMeebit = next.meebitNumber
  processCapture(next.meebitNumber)
}

function abortActiveTargetPreviewCapture() {
  if (activeMeebit === null) {
    return
  }

  queued.delete(cacheKey(activeMeebit))
  activeMeebit = null
  processCapture?.(null)
}

function enqueueRuntimeCapture(meebitNumber: number, priority: number) {
  if (activeMeebit === meebitNumber) {
    return
  }

  enqueuePreview(meebitNumber, priority)
  drainQueue()
}

function tryLoadStaticPreview(meebitNumber: number, priority: number) {
  const key = cacheKey(meebitNumber)
  if (staticLoadStarted.has(key)) {
    return
  }

  staticLoadStarted.add(key)
  const url = getMeebitPreviewImageUrl(meebitNumber)
  const img = new Image()

  img.onload = () => {
    cache.set(key, url)
    staticLoadStarted.delete(key)
    notify(meebitNumber)
  }

  img.onerror = () => {
    staticLoadStarted.delete(key)
    enqueueRuntimeCapture(meebitNumber, priority)
  }

  img.src = url
}

export function getTargetPreviewImage(meebitNumber: number) {
  const entry = cache.get(cacheKey(meebitNumber))
  if (!entry || entry === 'error') {
    return null
  }

  return entry
}

export function isTargetPreviewError(meebitNumber: number) {
  return cache.get(cacheKey(meebitNumber)) === 'error'
}

export function isTargetPreviewPending(meebitNumber: number) {
  const key = cacheKey(meebitNumber)
  return !cache.has(key) || staticLoadStarted.has(key)
}

export function requestTargetPreview(
  meebitNumber: number,
  priority = DEFAULT_PREVIEW_PRIORITY,
) {
  const key = cacheKey(meebitNumber)
  if (cache.get(key) === 'error') {
    cache.delete(key)
    staticLoadStarted.delete(key)
  }

  if (cache.has(key)) {
    return
  }

  if (activeMeebit === meebitNumber || staticLoadStarted.has(key)) {
    return
  }

  tryLoadStaticPreview(meebitNumber, priority)
}

export function requestTargetPreviews(
  meebitNumbers: number[],
  priority = TARGET_HUD_PREVIEW_PRIORITY,
) {
  for (const meebitNumber of meebitNumbers) {
    requestTargetPreview(meebitNumber, priority)
  }
}

export function subscribeTargetPreview(meebitNumber: number, listener: () => void) {
  const key = cacheKey(meebitNumber)
  const bucket = listeners.get(key) ?? new Set<() => void>()
  bucket.add(listener)
  listeners.set(key, bucket)

  return () => {
    bucket.delete(listener)
    if (bucket.size === 0) {
      listeners.delete(key)
    }
  }
}

export function registerTargetPreviewCaptureProcessor(
  processor: ((meebitNumber: number | null) => void) | null,
) {
  processCapture = processor
  drainQueue()
}

export function completeTargetPreviewCapture(meebitNumber: number, dataUrl: string) {
  const key = cacheKey(meebitNumber)
  cache.set(key, dataUrl)
  queued.delete(key)
  staticLoadStarted.delete(key)
  activeMeebit = null
  notify(meebitNumber)
  drainQueue()

  // 他ユーザー向けに R2 へキャッシュ（失敗してもローカル表示は維持）
  void uploadMeebitPreviewToR2(meebitNumber, dataUrl).catch((error) => {
    console.warn(`[preview-upload] #${meebitNumber}`, error)
  })
}

export function failTargetPreviewCapture(meebitNumber: number) {
  const key = cacheKey(meebitNumber)
  cache.set(key, 'error')
  queued.delete(key)
  staticLoadStarted.delete(key)
  activeMeebit = null
  notify(meebitNumber)
  drainQueue()
}

/** ステージ切替/リトライ時に、保持対象以外のプレビュー画像キャッシュを破棄する */
export function clearTargetPreviewCacheExcept(keepMeebitIds: number[] = []) {
  const keepKeys = new Set(keepMeebitIds.map((id) => cacheKey(id)))

  for (const key of [...cache.keys()]) {
    if (!keepKeys.has(key)) {
      cache.delete(key)
      listeners.delete(key)
      staticLoadStarted.delete(key)
    }
  }

  for (let index = queue.length - 1; index >= 0; index -= 1) {
    const entry = queue[index]!
    if (!keepKeys.has(cacheKey(entry.meebitNumber))) {
      queued.delete(cacheKey(entry.meebitNumber))
      queue.splice(index, 1)
    }
  }

  if (activeMeebit !== null && !keepKeys.has(cacheKey(activeMeebit))) {
    abortActiveTargetPreviewCapture()
  }

  drainQueue()
}
