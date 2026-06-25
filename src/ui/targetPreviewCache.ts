const PREVIEW_RENDER_VERSION = 5

type PreviewCacheEntry = string | 'error'

const cache = new Map<string, PreviewCacheEntry>()
const listeners = new Map<string, Set<() => void>>()
const queue: number[] = []
const queued = new Set<string>()

let activeMeebit: number | null = null
let processCapture: ((meebitNumber: number | null) => void) | null = null

function cacheKey(meebitNumber: number) {
  return `${PREVIEW_RENDER_VERSION}:${meebitNumber}`
}

function notify(meebitNumber: number) {
  for (const listener of listeners.get(cacheKey(meebitNumber)) ?? []) {
    listener()
  }
}

function drainQueue() {
  if (activeMeebit !== null || !processCapture) {
    return
  }

  const next = queue.shift()
  if (next === undefined) {
    processCapture(null)
    return
  }

  activeMeebit = next
  processCapture(next)
}

/** 進行中キャプチャを中断し、同じ Meebit を再度キューに載せられるようにする */
function abortActiveTargetPreviewCapture() {
  if (activeMeebit === null) {
    return
  }

  queued.delete(cacheKey(activeMeebit))
  activeMeebit = null
  processCapture?.(null)
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
  return !cache.has(cacheKey(meebitNumber))
}

export function requestTargetPreview(meebitNumber: number) {
  const key = cacheKey(meebitNumber)
  if (cache.get(key) === 'error') {
    cache.delete(key)
  }

  if (cache.has(key)) {
    return
  }

  if (queued.has(key) || activeMeebit === meebitNumber) {
    return
  }

  queue.push(meebitNumber)
  queued.add(key)
  drainQueue()
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
  activeMeebit = null
  notify(meebitNumber)
  drainQueue()
}

export function failTargetPreviewCapture(meebitNumber: number) {
  const key = cacheKey(meebitNumber)
  cache.set(key, 'error')
  queued.delete(key)
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
    }
  }

  for (let index = queue.length - 1; index >= 0; index -= 1) {
    if (!keepKeys.has(cacheKey(queue[index]!))) {
      queued.delete(cacheKey(queue[index]!))
      queue.splice(index, 1)
    }
  }

  if (activeMeebit !== null && !keepKeys.has(cacheKey(activeMeebit))) {
    abortActiveTargetPreviewCapture()
  }

  drainQueue()
}
