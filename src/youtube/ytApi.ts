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
  PlayerState?: { PLAYING: number; CUED: number }
}

declare global {
  interface Window {
    YT?: YtNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiLoadPromise: Promise<YtNamespace> | null = null

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
      if (window.YT?.Player) resolve(window.YT)
      else reject(new Error(`[${tag}] YT API missing Player`))
    }

    if (document.querySelector('script[data-meebits-yt-api]')) return

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.dataset.meebitsYtApi = '1'
    script.onerror = () => reject(new Error(`[${tag}] failed to load YouTube API`))
    document.head.appendChild(script)
  })

  return apiLoadPromise
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
