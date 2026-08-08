import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { useShoreFishingStore } from '../store'

/**
 * 釣り入力。移動は ShoreFishingPlayer。
 * Space / E でキャスト or アワセ。
 */
export function ShoreFishingController() {
  const promptFlash = useShoreFishingStore((s) => s.promptFlash)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.code !== 'Space' && event.code !== 'KeyE') return
      event.preventDefault()
      void unlockAudioIfNeeded()
      const store = useShoreFishingStore.getState()
      if (store.phase !== 'playing') return
      if (store.castPhase === 'ready') {
        if (store.tryCast()) playSfx('uiClick')
        return
      }
      const cancelWait = store.castPhase === 'approach' && !store.pendingFishId
      if (store.tryHook()) playSfx(cancelWait ? 'uiClick' : 'targetFound')
      else if (
        store.castPhase === 'nibble' ||
        store.castPhase === 'approach' ||
        store.castPhase === 'casting'
      ) {
        playSfx('uiClick')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (promptFlash === 'bite') void unlockAudioIfNeeded().then(() => playSfx('unlock'))
    if (promptFlash === 'nibble') void unlockAudioIfNeeded().then(() => playSfx('uiClick'))
    if (promptFlash === 'miss' || promptFlash === 'empty') {
      void unlockAudioIfNeeded().then(() => playSfx('uiClick'))
    }
    if (promptFlash === 'catch') void unlockAudioIfNeeded().then(() => playSfx('targetFound'))
  }, [promptFlash])

  useFrame(() => {
    const now = performance.now()
    const store = useShoreFishingStore.getState()
    if (store.phase === 'countdown') store.tickCountdown(now)
    if (store.phase === 'playing') store.tickPlaying(now)
  })

  return null
}
