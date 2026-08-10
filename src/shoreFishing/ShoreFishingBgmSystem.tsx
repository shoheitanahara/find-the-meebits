import { useEffect, useRef } from 'react'
import {
  getShoreFishingBgmVolume,
  resolveShoreFishingBgmUrl,
} from '../audio/shoreFishingAudioConfig'
import { unlockAudioIfNeeded } from '../ui/sfx'

/** ショアフィッシング会場にいる間ループ再生（タブ非表示で pause） */
export function ShoreFishingBgmSystem() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    const audio = new Audio()
    audio.loop = true
    audio.preload = 'auto'
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
      loadedRef.current = false
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const playIfVisible = () => {
      if (document.visibilityState !== 'visible') {
        audio.pause()
        return
      }

      if (!loadedRef.current) {
        audio.src = resolveShoreFishingBgmUrl()
        audio.volume = getShoreFishingBgmVolume()
        loadedRef.current = true
      }

      unlockAudioIfNeeded()
        .then(() => {
          if (document.visibilityState !== 'visible') return
          void audio.play().catch(() => {})
        })
        .catch(() => {
          void audio.play().catch(() => {})
        })
    }

    playIfVisible()

    document.addEventListener('visibilitychange', playIfVisible)
    return () => document.removeEventListener('visibilitychange', playIfVisible)
  }, [])

  return null
}
