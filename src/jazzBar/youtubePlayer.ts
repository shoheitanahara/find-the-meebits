/**
 * YouTube IFrame API — Jazz プレイリストをシャッフル再生。
 * onReady 直後はプレイリスト未準備で playVideoAt が空振りしやすいので、遅延リトライする。
 */

import {
  disableYoutubeCaptions,
  ensureYoutubePlaying,
  loadYoutubeApi,
  waitForElement,
  type YtPlayer,
} from '../youtube/ytApi'
import { JAZZ_BAR_YOUTUBE_PLAYLIST_ID, JAZZ_BAR_YOUTUBE_VIDEO_ID } from './config'

export const JAZZ_BAR_YT_PLAYER_ELEMENT_ID = 'jazz-bar-yt-player'

/** プレイリスト件数の上限（未取得時のフォールバック） */
const PLAYLIST_INDEX_FALLBACK = 80

let player: YtPlayer | null = null
let readyListeners: Array<(p: YtPlayer) => void> = []
let titleListeners: Array<(title: string) => void> = []
let mountGeneration = 0
/**
 * Enter で音声オンにしたあと、playVideoAt のリトライで再び mute されないよう維持する。
 * 明示的な muteJazzBarYoutube / destroy で解除。
 */
let preferUnmuted = false
/** 入場ごとに決める開始インデックス */
let pendingStartIndex = 0

export function armJazzBarSoundOnEnter() {
  preferUnmuted = true
}

/** プレイリストジャンプ後も、入場時の希望ミュート状態を再適用する */
function applyPreferredMute(target: YtPlayer) {
  if (preferUnmuted) {
    try {
      target.unMute()
      target.setVolume(100)
    } catch {
      try {
        target.mute()
      } catch {
        // ignore
      }
    }
    return
  }
  try {
    target.mute()
  } catch {
    // ignore
  }
}

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

export function onJazzBarEpisodeTitle(listener: (title: string) => void) {
  titleListeners.push(listener)
  const current = player ? readEpisodeTitle(player) : null
  if (current) listener(current)
  return () => {
    titleListeners = titleListeners.filter((item) => item !== listener)
  }
}

function playlistLength(target: YtPlayer): number {
  try {
    const list = target.getPlaylist?.()
    if (list && list.length > 0) return list.length
  } catch {
    // ignore
  }
  return 0
}

function jumpToPlaylistIndex(target: YtPlayer, index: number) {
  try {
    target.setShuffle(true)
  } catch {
    // ignore
  }
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

/**
 * プレイリスト準備を待ちつつランダム曲へジャンプ。
 * 未準備のまま playVideoAt すると先頭動画のままになる。
 */
function startRandomPlaylistVideo(target: YtPlayer, preferredIndex: number, attempt = 0) {
  const len = playlistLength(target)
  const max = len > 0 ? len : PLAYLIST_INDEX_FALLBACK
  const index = ((preferredIndex % max) + max) % max

  jumpToPlaylistIndex(target, index)
  applyPreferredMute(target)

  if (attempt >= 10) {
    ensureYoutubePlaying(target, 4)
    applyPreferredMute(target)
    return
  }

  window.setTimeout(() => {
    if (player !== target) return
    const readyLen = playlistLength(target)
    let currentIndex = -1
    try {
      currentIndex = target.getPlaylistIndex?.() ?? -1
    } catch {
      currentIndex = -1
    }

    // まだリストが来ていない、または先頭のままなら再試行
    if (readyLen <= 0 || (index > 0 && currentIndex === 0)) {
      const nextIndex =
        readyLen > 0 ? Math.floor(Math.random() * readyLen) : Math.floor(Math.random() * PLAYLIST_INDEX_FALLBACK)
      startRandomPlaylistVideo(target, nextIndex, attempt + 1)
      return
    }

    ensureYoutubePlaying(target, 4)
    applyPreferredMute(target)
  }, 350 + attempt * 120)
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

export function getJazzBarYoutubePlayer(): YtPlayer | null {
  return player
}

export function onJazzBarYoutubeReady(listener: (p: YtPlayer) => void) {
  if (player) {
    listener(player)
    return () => undefined
  }
  readyListeners.push(listener)
  return () => {
    readyListeners = readyListeners.filter((item) => item !== listener)
  }
}

export async function mountJazzBarYoutubePlayer(size: { width: number; height: number }) {
  const generation = ++mountGeneration
  destroyCurrentPlayer()
  pendingStartIndex = Math.floor(Math.random() * PLAYLIST_INDEX_FALLBACK)

  const signal = { cancelled: false }
  const watchCancel = window.setInterval(() => {
    if (generation !== mountGeneration) signal.cancelled = true
  }, 40)

  try {
    const host = await waitForElement(JAZZ_BAR_YT_PLAYER_ELEMENT_ID, { signal })
    if (!host || generation !== mountGeneration) return null

    const YT = await loadYoutubeApi('jazz-bar')
    if (generation !== mountGeneration) return null
    if (!document.getElementById(JAZZ_BAR_YT_PLAYER_ELEMENT_ID)) return null

    const playing = YT.PlayerState?.PLAYING ?? 1
    const ended = YT.PlayerState?.ENDED ?? 0
    const cued = YT.PlayerState?.CUED ?? 5

    return await new Promise<YtPlayer | null>((resolve) => {
      if (generation !== mountGeneration) {
        resolve(null)
        return
      }

      const startIndex = pendingStartIndex
      const next = new YT.Player(JAZZ_BAR_YT_PLAYER_ELEMENT_ID, {
        videoId: JAZZ_BAR_YOUTUBE_VIDEO_ID,
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
          list: JAZZ_BAR_YOUTUBE_PLAYLIST_ID,
          index: startIndex,
          loop: 1,
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
            applyPreferredMute(event.target)
            startRandomPlaylistVideo(event.target, startIndex)
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
              // playVideoAt 後に mute に戻ることがあるので、入場時の希望を再適用
              applyPreferredMute(event.target)
              publishEpisodeTitle(event.target)
            }
            // シャッフル有効時も曲間で止まったとき用
            if (event.data === ended) {
              try {
                event.target.setShuffle(true)
                event.target.nextVideo()
              } catch {
                // ignore
              }
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

export function unmuteJazzBarYoutube(): boolean {
  preferUnmuted = true
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

export function muteJazzBarYoutube(): boolean {
  preferUnmuted = false
  if (!player) return false
  try {
    player.mute()
    return true
  } catch {
    return false
  }
}

export function seekJazzBarYoutubeBy(deltaSeconds: number): boolean {
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

export function destroyJazzBarYoutubePlayer() {
  mountGeneration += 1
  preferUnmuted = false
  destroyCurrentPlayer()
}
