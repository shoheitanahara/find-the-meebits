/**
 * YouTube IFrame API ラッパ（Cinema）。
 * 自動再生は mute 必須。UI ボタンのユーザー操作で unmute する。
 */

import { disableYoutubeCaptions, loadYoutubeApi, type YtPlayer } from '../youtube/ytApi'
import { CINEMA_YOUTUBE_VIDEO_ID } from './config'

export const CINEMA_YT_PLAYER_ELEMENT_ID = 'meebit-cinema-yt-player'

let player: YtPlayer | null = null
let readyListeners: Array<(p: YtPlayer) => void> = []

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

  if (player) {
    try {
      player.destroy()
    } catch {
      // ignore
    }
    player = null
  }

  const YT = await loadYoutubeApi('cinema')
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
        cc_load_policy: 0,
        iv_load_policy: 3,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          event.target.mute()
          event.target.playVideo()
          disableYoutubeCaptions(event.target)
          player = event.target
          readyListeners.forEach((listener) => listener(event.target))
          readyListeners = []
          resolve(event.target)
        },
        onStateChange: (event) => {
          if (event.data === playing) disableYoutubeCaptions(event.target)
        },
      },
    })
    player = next
  })
}

export function unmuteCinemaYoutube(): boolean {
  if (!player) return false
  try {
    player.unMute()
    player.setVolume(100)
    player.playVideo()
    disableYoutubeCaptions(player)
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
