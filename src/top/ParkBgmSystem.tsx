import { useEffect, useRef } from 'react'
import { getParkBgmVolume, resolveParkBgmUrl } from '../audio/parkAudioConfig'
import { unlockAudioIfNeeded } from '../ui/sfx'
import { useTopStore } from './topStore'

/** パーク内（started）のみループ再生。アトラクション個別 BGM は別途。 */
export function ParkBgmSystem() {
  const started = useTopStore((state) => state.started)
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

    const shouldPlay = started && document.visibilityState === 'visible'

    if (!shouldPlay) {
      audio.pause()
      return
    }

    if (!loadedRef.current) {
      audio.src = resolveParkBgmUrl()
      audio.volume = getParkBgmVolume()
      loadedRef.current = true
    }

    let cancelled = false

    unlockAudioIfNeeded()
      .then(() => {
        if (cancelled || !started) return
        void audio.play().catch(() => {})
      })
      .catch(() => {
        void audio.play().catch(() => {})
      })

    return () => {
      cancelled = true
    }
  }, [started])

  useEffect(() => {
    const onVisibilityChange = () => {
      const audio = audioRef.current
      if (!audio) return

      const inPark = useTopStore.getState().started
      const canPlay = inPark && document.visibilityState === 'visible'

      if (!canPlay) {
        audio.pause()
        return
      }

      if (!loadedRef.current) {
        audio.src = resolveParkBgmUrl()
        audio.volume = getParkBgmVolume()
        loadedRef.current = true
      }

      void audio.play().catch(() => {})
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return null
}
