/**
 * YouTube IFrame API ラッパ。
 * 自動再生は mute 必須。UI ボタンのユーザー操作で unmute する。
 */

import { CINEMA_YOUTUBE_VIDEO_ID } from './config'

export const CINEMA_YT_PLAYER_ELEMENT_ID = 'meebit-cinema-yt-player'

type YtPlayer = {
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  setVolume: (volume: number) => void
  playVideo: () => void
  getCurrentTime: () => number
  getDuration: () => number
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  unloadModule: (module: string) => void
  destroy: () => void
}

type YtNamespace = {
  Player: new (
    elementId: string,
    config: {
      videoId: string
      width?: number | string
      height?: number | string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: (event: { target: YtPlayer }) => void
        onStateChange?: (event: { data: number; target: YtPlayer }) => void
      }
    },
  ) => YtPlayer
  PlayerState?: { PLAYING: number }
}

declare global {
  interface Window {
    YT?: YtNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiLoadPromise: Promise<YtNamespace> | null = null
let player: YtPlayer | null = null
let readyListeners: Array<(p: YtPlayer) => void> = []

function loadYoutubeApi(): Promise<YtNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('[cinema] no window'))
  }
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiLoadPromise) return apiLoadPromise

  apiLoadPromise = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      if (window.YT?.Player) resolve(window.YT)
      else reject(new Error('[cinema] YT API missing Player'))
    }

    if (document.querySelector('script[data-meebit-cinema-yt]')) return

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.dataset.meebitCinemaYt = '1'
    script.onerror = () => reject(new Error('[cinema] failed to load YouTube API'))
    document.head.appendChild(script)
  })

  return apiLoadPromise
}

function disableCaptions(target: YtPlayer) {
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

export function getCinemaYoutubePlayer(): YtPlayer | null {
  return player
}

export function onCinemaYoutubeReady(listener: (p: YtPlayer) => void) {
  if (player) {
    listener(player)
    return () => undefined
  }
  readyListeners.push(listener)
  return () => {
    readyListeners = readyListeners.filter((item) => item !== listener)
  }
}

/** Html 内のマウント先が用意できたら呼ぶ */
export async function mountCinemaYoutubePlayer(size: { width: number; height: number }) {
  const host = document.getElementById(CINEMA_YT_PLAYER_ELEMENT_ID)
  if (!host) return null

  // 再入場などで古い player が残っていたら破棄
  if (player) {
    try {
      player.destroy()
    } catch {
      // ignore
    }
    player = null
  }

  const YT = await loadYoutubeApi()
  const playing = YT.PlayerState?.PLAYING ?? 1

  return new Promise<YtPlayer>((resolve) => {
    const next = new YT.Player(CINEMA_YT_PLAYER_ELEMENT_ID, {
      videoId: CINEMA_YOUTUBE_VIDEO_ID,
      width: size.width,
      height: size.height,
      playerVars: {
        autoplay: 1,
        mute: 1,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        color: 'white',
        /** 強制で字幕を出さない（ユーザー設定より優先は unloadModule 側） */
        cc_load_policy: 0,
        iv_load_policy: 3,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          event.target.mute()
          event.target.playVideo()
          disableCaptions(event.target)
          player = event.target
          readyListeners.forEach((listener) => listener(event.target))
          readyListeners = []
          resolve(event.target)
        },
        onStateChange: (event) => {
          if (event.data === playing) disableCaptions(event.target)
        },
      },
    })
    // onReady 前の参照も保持（destroy 用）
    player = next
  })
}

export function unmuteCinemaYoutube(): boolean {
  if (!player) return false
  try {
    player.unMute()
    player.setVolume(100)
    player.playVideo()
    disableCaptions(player)
    return true
  } catch {
    return false
  }
}

export function muteCinemaYoutube(): boolean {
  if (!player) return false
  try {
    player.mute()
    return true
  } catch {
    return false
  }
}

/** 現在位置から相対シーク（秒）。0〜duration にクランプ */
export function seekCinemaYoutubeBy(deltaSeconds: number): boolean {
  if (!player) return false
  try {
    const current = player.getCurrentTime()
    const duration = player.getDuration()
    if (!Number.isFinite(current)) return false
    const max = Number.isFinite(duration) && duration > 0 ? duration : Number.POSITIVE_INFINITY
    const next = Math.min(max, Math.max(0, current + deltaSeconds))
    player.seekTo(next, true)
    player.playVideo()
    return true
  } catch {
    return false
  }
}

export function destroyCinemaYoutubePlayer() {
  if (!player) return
  try {
    player.destroy()
  } catch {
    // ignore
  }
  player = null
}
