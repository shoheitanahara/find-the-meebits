/**
 * YouTube IFrame API の共通型とローダ。
 * cinema / podcast で Window.YT を二重宣言しないための単一ソース。
 */

export type YtVideoData = {
  title?: string
  video_id?: string
  author?: string
}

export type YtPlayer = {
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  setVolume: (volume: number) => void
  playVideo: () => void
  playVideoAt: (index: number) => void
  setShuffle: (shufflePlaylist: boolean) => void
  nextVideo: () => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getVideoData: () => YtVideoData
  unloadModule: (module: string) => void
  destroy: () => void
}

export type YtNamespace = {
  Player: new (
    elementId: string,
    config: {
      videoId?: string
      width?: number | string
      height?: number | string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: (event: { target: YtPlayer }) => void
        onStateChange?: (event: { data: number; target: YtPlayer }) => void
      }
    },
  ) => YtPlayer
  PlayerState?: { UNSTARTED: number; ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number; CUED: number }
}

declare global {
  interface Window {
    YT?: YtNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiLoadPromise: Promise<YtNamespace> | null = null

function resolveWhenReady(
  resolve: (yt: YtNamespace) => void,
  reject: (error: Error) => void,
  tag: string,
  attemptsLeft: number,
) {
  if (window.YT?.Player) {
    resolve(window.YT)
    return
  }
  if (attemptsLeft <= 0) {
    reject(new Error(`[${tag}] YT API missing Player`))
    return
  }
  window.setTimeout(() => resolveWhenReady(resolve, reject, tag, attemptsLeft - 1), 50)
}

/** iframe_api スクリプトを1回だけ読み込む */
export function loadYoutubeApi(tag: string): Promise<YtNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error(`[${tag}] no window`))
  }
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiLoadPromise) return apiLoadPromise

  apiLoadPromise = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolveWhenReady(resolve, reject, tag, 40)
    }

    const existing = document.querySelector('script[data-meebits-yt-api]')
    if (existing) {
      // ready コールバックを取り逃している場合があるのでポーリングも併用
      resolveWhenReady(resolve, reject, tag, 80)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.dataset.meebitsYtApi = '1'
    script.onerror = () => reject(new Error(`[${tag}] failed to load YouTube API`))
    document.head.appendChild(script)
  })

  return apiLoadPromise
}

/** drei Html の DOM 反映待ち（固定 setTimeout だとたまに間に合わない） */
export function waitForElement(
  elementId: string,
  options: { timeoutMs?: number; intervalMs?: number; signal?: { cancelled: boolean } } = {},
): Promise<HTMLElement | null> {
  const timeoutMs = options.timeoutMs ?? 4000
  const intervalMs = options.intervalMs ?? 50
  const started = performance.now()

  return new Promise((resolve) => {
    const tick = () => {
      if (options.signal?.cancelled) {
        resolve(null)
        return
      }
      const host = document.getElementById(elementId)
      if (host) {
        resolve(host)
        return
      }
      if (performance.now() - started >= timeoutMs) {
        resolve(null)
        return
      }
      window.setTimeout(tick, intervalMs)
    }
    tick()
  })
}

/** mute 自動再生が立たなかったときの再試行 */
export function ensureYoutubePlaying(target: YtPlayer, attempts = 4) {
  const tryPlay = (left: number) => {
    try {
      target.mute()
      target.playVideo()
    } catch {
      // ignore
    }
    if (left <= 1) return
    window.setTimeout(() => {
      try {
        const state = target.getPlayerState()
        // -1 unstarted, 0 ended, 2 paused, 5 cued
        if (state === 1 || state === 3) return
      } catch {
        // getPlayerState 未準備でも再試行
      }
      tryPlay(left - 1)
    }, 350)
  }
  tryPlay(attempts)
}

export function disableYoutubeCaptions(target: YtPlayer) {
  try {
    target.unloadModule('captions')
  } catch {
    // ignore
  }
  try {
    target.unloadModule('cc')
  } catch {
    // ignore
  }
}
