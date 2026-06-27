import { useEffect, useRef } from 'react'
import {
  isVenueBgmPlaybackPhase,
  resolveVenueBgmUrl,
  VENUE_BGM,
} from '../audio/venueAudioConfig'
import { isMobilePerfMode } from '../game/perfConfig'
import type { VenueId } from '../game/venueConfig'
import { useGameStore } from '../stores/gameStore'
import { unlockAudioIfNeeded } from '../ui/sfx'

function getVenueBgmVolume(venueId: VenueId) {
  const base = VENUE_BGM[venueId].volume
  return isMobilePerfMode() ? base * 0.9 : base
}

export function VenueBgmSystem() {
  const venueId = useGameStore((state) => state.venueId)
  const gamePhase = useGameStore((state) => state.gamePhase)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const activeVenueRef = useRef<VenueId | null>(null)

  const shouldPlay = isVenueBgmPlaybackPhase(gamePhase)

  useEffect(() => {
    const audio = new Audio()
    audio.loop = true
    audio.preload = 'auto'
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
      activeVenueRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    if (!shouldPlay || document.visibilityState === 'hidden') {
      audio.pause()
      return
    }

    if (activeVenueRef.current !== venueId) {
      audio.pause()
      audio.src = resolveVenueBgmUrl(venueId)
      audio.volume = getVenueBgmVolume(venueId)
      activeVenueRef.current = venueId
    }

    let cancelled = false

    unlockAudioIfNeeded()
      .then(() => {
        if (cancelled || !shouldPlay) {
          return
        }

        void audio.play().catch(() => {
          // Browser may block until a later gesture.
        })
      })
      .catch(() => {
        void audio.play().catch(() => {})
      })

    return () => {
      cancelled = true
    }
  }, [shouldPlay, venueId])

  useEffect(() => {
    const onVisibilityChange = () => {
      const audio = audioRef.current
      if (!audio) {
        return
      }

      const state = useGameStore.getState()
      const canPlay =
        isVenueBgmPlaybackPhase(state.gamePhase) && document.visibilityState === 'visible'

      if (!canPlay) {
        audio.pause()
        return
      }

      if (activeVenueRef.current !== state.venueId) {
        audio.pause()
        audio.src = resolveVenueBgmUrl(state.venueId)
        audio.volume = getVenueBgmVolume(state.venueId)
        activeVenueRef.current = state.venueId
      }

      void audio.play().catch(() => {})
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return null
}
