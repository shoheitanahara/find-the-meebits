/**
 * YouTube IFrame API — Hip Hop プレイリストをシャッフル再生。
 */

import {
  disableYoutubeCaptions,
  ensureYoutubePlaying,
  loadYoutubeApi,
  waitForElement,
  type YtPlayer,
} from '../youtube/ytApi'
import { CLUB_YOUTUBE_PLAYLIST_ID, CLUB_YOUTUBE_VIDEO_ID } from './config'

export const CLUB_YT_PLAYER_ELEMENT_ID = 'meebits-hiphop-yt-player'

let player: YtPlayer | null = null
let readyListeners: Array<(p: YtPlayer) => void> = []
let titleListeners: Array<(title: string) => void> = []
let mountGeneration = 0

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
  const index = Math.floor(Math.random() * 40)
  try {
    target.playVideoAt(index)
  } catch {
    try {
      target.nextVideo()
    } catch {
      target.playVideo()
    }
  }
  ensureYoutubePlaying(target, 6)
}

function destroyCurrentPlayer() {
  if (!player) return
  try {
    player.destroy()
  } catch {
    // ignore
  }
  player = null
}

export function getClubYoutubePlayer(): YtPlayer | null {
  return player
}

export function onClubEpisodeTitle(listener: (title: string) => void) {
  titleListeners.push(listener)
  const current = player ? readEpisodeTitle(player) : null
  if (current) listener(current)
  return () => {
    titleListeners = titleListeners.filter((item) => item !== listener)
  }
}

export async function mountClubYoutubePlayer(size: { width: number; height: number }) {
  const generation = ++mountGeneration
  destroyCurrentPlayer()

  const signal = { cancelled: false }
  const watchCancel = window.setInterval(() => {
    if (generation !== mountGeneration) signal.cancelled = true
  }, 40)

  try {
    const host = await waitForElement(CLUB_YT_PLAYER_ELEMENT_ID, { signal })
    if (!host || generation !== mountGeneration) return null

    const YT = await loadYoutubeApi('hiphop')
    if (generation !== mountGeneration) return null
    if (!document.getElementById(CLUB_YT_PLAYER_ELEMENT_ID)) return null

    const playing = YT.PlayerState?.PLAYING ?? 1
    const cued = YT.PlayerState?.CUED ?? 5

    return await new Promise<YtPlayer | null>((resolve) => {
      if (generation !== mountGeneration) {
        resolve(null)
        return
      }

      const next = new YT.Player(CLUB_YT_PLAYER_ELEMENT_ID, {
        videoId: CLUB_YOUTUBE_VIDEO_ID,
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
          list: CLUB_YOUTUBE_PLAYLIST_ID,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (generation !== mountGeneration) {
              try {
                event.target.destroy()
              } catch {
                // ignore
              }
              resolve(null)
              return
            }
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
  } finally {
    window.clearInterval(watchCancel)
  }
}

export function unmuteClubYoutube(): boolean {
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

export function muteClubYoutube(): boolean {
  if (!player) return false
  try {
    player.mute()
    return true
  } catch {
    return false
  }
}

export function seekClubYoutubeBy(deltaSeconds: number): boolean {
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

export function destroyClubYoutubePlayer() {
  mountGeneration += 1
  destroyCurrentPlayer()
}
