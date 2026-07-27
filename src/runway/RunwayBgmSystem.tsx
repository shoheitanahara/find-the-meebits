import { useEffect, useRef } from 'react'
import { getRunwayBgmVolume, resolveRunwayBgmUrl } from '../audio/runwayAudioConfig'
import { unlockAudioIfNeeded } from '../ui/sfx'
import { useRunwayStore } from './store'

/** ランウェイ会場（playing）のみループ再生 */
export function RunwayBgmSystem() {
  const phase = useRunwayStore((state) => state.phase)
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

    const shouldPlay = phase === 'playing' && document.visibilityState === 'visible'

    if (!shouldPlay) {
      audio.pause()
      return
    }

    if (!loadedRef.current) {
      audio.src = resolveRunwayBgmUrl()
      audio.volume = getRunwayBgmVolume()
      loadedRef.current = true
    }

    let cancelled = false

    unlockAudioIfNeeded()
      .then(() => {
        if (cancelled || useRunwayStore.getState().phase !== 'playing') return
        void audio.play().catch(() => {})
      })
      .catch(() => {
        void audio.play().catch(() => {})
      })

    return () => {
      cancelled = true
    }
  }, [phase])

  useEffect(() => {
    const onVisibilityChange = () => {
      const audio = audioRef.current
      if (!audio) return

      const inShow = useRunwayStore.getState().phase === 'playing'
      const canPlay = inShow && document.visibilityState === 'visible'

      if (!canPlay) {
        audio.pause()
        return
      }

      if (!loadedRef.current) {
        audio.src = resolveRunwayBgmUrl()
        audio.volume = getRunwayBgmVolume()
        loadedRef.current = true
      }

      void audio.play().catch(() => {})
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return null
}
