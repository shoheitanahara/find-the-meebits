import { useEffect, useRef } from 'react'
import { getRunwayBgmVolume, resolveRunwayBgmUrl } from '../audio/runwayAudioConfig'
import { unlockAudioIfNeeded } from '../ui/sfx'
import { useOpenSeaMarketStore } from './store'

function tryPlay(audio: HTMLAudioElement) {
  unlockAudioIfNeeded()
    .then(() => {
      if (useOpenSeaMarketStore.getState().bootPhase !== 'ready') return
      if (document.visibilityState !== 'visible') return
      void audio.play().catch(() => {})
    })
    .catch(() => {
      void audio.play().catch(() => {})
    })
}

/** OpenSea Market — Runway と同じ BGM を ready 中ループ再生 */
export function MarketBgmSystem() {
  const bootPhase = useOpenSeaMarketStore((state) => state.bootPhase)
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

    const shouldPlay = bootPhase === 'ready' && document.visibilityState === 'visible'

    if (!shouldPlay) {
      audio.pause()
      return
    }

    if (!loadedRef.current) {
      audio.src = resolveRunwayBgmUrl()
      audio.volume = getRunwayBgmVolume()
      loadedRef.current = true
    }

    tryPlay(audio)
  }, [bootPhase])

  useEffect(() => {
    const ensurePlaying = () => {
      const audio = audioRef.current
      if (!audio) return
      if (useOpenSeaMarketStore.getState().bootPhase !== 'ready') return
      if (document.visibilityState !== 'visible') {
        audio.pause()
        return
      }

      if (!loadedRef.current) {
        audio.src = resolveRunwayBgmUrl()
        audio.volume = getRunwayBgmVolume()
        loadedRef.current = true
      }

      if (audio.paused) tryPlay(audio)
    }

    document.addEventListener('visibilitychange', ensurePlaying)
    // SP は最初のタップ後に再生許可されるため再試行
    document.addEventListener('pointerdown', ensurePlaying)
    return () => {
      document.removeEventListener('visibilitychange', ensurePlaying)
      document.removeEventListener('pointerdown', ensurePlaying)
    }
  }, [])

  return null
}
