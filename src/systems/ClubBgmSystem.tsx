import { useEffect, useRef } from 'react'
import { CLUB_BGM_URL, CLUB_BGM_VOLUME, isClubBgmPlaybackPhase } from '../audio/clubAudioConfig'
import { isMobilePerfMode } from '../game/perfConfig'
import { useGameStore } from '../stores/gameStore'
import { unlockAudioIfNeeded } from '../ui/sfx'

export function ClubBgmSystem() {
  const venueId = useGameStore((state) => state.venueId)
  const gamePhase = useGameStore((state) => state.gamePhase)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const shouldPlay = venueId === 'club' && isClubBgmPlaybackPhase(gamePhase)

  useEffect(() => {
    const audio = new Audio(CLUB_BGM_URL)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = isMobilePerfMode() ? CLUB_BGM_VOLUME * 0.9 : CLUB_BGM_VOLUME
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
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
  }, [shouldPlay])

  useEffect(() => {
    const onVisibilityChange = () => {
      const audio = audioRef.current
      if (!audio) {
        return
      }

      const state = useGameStore.getState()
      const canPlay =
        state.venueId === 'club' &&
        isClubBgmPlaybackPhase(state.gamePhase) &&
        document.visibilityState === 'visible'

      if (!canPlay) {
        audio.pause()
        return
      }

      void audio.play().catch(() => {})
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return null
}
