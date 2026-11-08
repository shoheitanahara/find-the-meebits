/**
 * YouTube IFrame API — The Meebits Podcast プレイリストをシャッフル再生。
 * getVideoData() で現在エピソードのタイトルを取得できる。
 */

import { disableYoutubeCaptions, loadYoutubeApi, type YtPlayer } from '../youtube/ytApi'
import { PODCAST_YOUTUBE_PLAYLIST_ID, PODCAST_YOUTUBE_VIDEO_ID } from './config'

export const PODCAST_YT_PLAYER_ELEMENT_ID = 'meebits-podcast-yt-player'

let player: YtPlayer | null = null
let readyListeners: Array<(p: YtPlayer) => void> = []
let titleListeners: Array<(title: string) => void> = []

function readEpisodeTitle(target: YtPlayer): string | null {
  try {
    const data = target.getVideoData()
    const title = data?.title?.trim()
    return title ? title : null
  } catch {
    return null
  }
}

function publishEpisodeTitle(target: YtPlayer) {
  const title = readEpisodeTitle(target)
  if (!title) return
  titleListeners.forEach((listener) => listener(title))
}

function startRandomPlaylistVideo(target: YtPlayer) {
  try {
    target.setShuffle(true)
  } catch {
    // ignore
  }
  const index = Math.floor(Math.random() * 24)
  try {
    target.playVideoAt(index)
  } catch {
    try {
      target.nextVideo()
    } catch {
      target.playVideo()
    }
  }
}

export function getPodcastYoutubePlayer(): YtPlayer | null {
  return player
}

/** 再生中タイトルが更新されたら通知（入場後の Now Playing 用） */
export function onPodcastEpisodeTitle(listener: (title: string) => void) {
  titleListeners.push(listener)
  const current = player ? readEpisodeTitle(player) : null
  if (current) listener(current)
  return () => {
    titleListeners = titleListeners.filter((item) => item !== listener)
  }
}

/** Html 内のマウント先が用意できたら呼ぶ */
export async function mountPodcastYoutubePlayer(size: { width: number; height: number }) {
  const host = document.getElementById(PODCAST_YT_PLAYER_ELEMENT_ID)
  if (!host) return null

  if (player) {
    try {
      player.destroy()
    } catch {
      // ignore
    }
    player = null
  }

  const YT = await loadYoutubeApi('podcast')
  const playing = YT.PlayerState?.PLAYING ?? 1
  const cued = YT.PlayerState?.CUED ?? 5

  return new Promise<YtPlayer>((resolve) => {
    const next = new YT.Player(PODCAST_YT_PLAYER_ELEMENT_ID, {
      videoId: PODCAST_YOUTUBE_VIDEO_ID,
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
        listType: 'playlist',
        list: PODCAST_YOUTUBE_PLAYLIST_ID,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          event.target.mute()
          startRandomPlaylistVideo(event.target)
          disableYoutubeCaptions(event.target)
          publishEpisodeTitle(event.target)
          window.setTimeout(() => publishEpisodeTitle(event.target), 400)
          window.setTimeout(() => publishEpisodeTitle(event.target), 1200)
          player = event.target
          readyListeners.forEach((listener) => listener(event.target))
          readyListeners = []
          resolve(event.target)
        },
        onStateChange: (event) => {
          if (event.data === playing || event.data === cued) {
            disableYoutubeCaptions(event.target)
            publishEpisodeTitle(event.target)
          }
        },
      },
    })
    player = next
  })
}

export function unmutePodcastYoutube(): boolean {
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

export function mutePodcastYoutube(): boolean {
  if (!player) return false
  try {
    player.mute()
    return true
  } catch {
    return false
  }
}

/** 現在位置から相対シーク（秒）。0〜duration にクランプ */
export function seekPodcastYoutubeBy(deltaSeconds: number): boolean {
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

export function destroyPodcastYoutubePlayer() {
  if (!player) return
  try {
    player.destroy()
  } catch {
    // ignore
  }
  player = null
}
