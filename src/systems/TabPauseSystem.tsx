import { useEffect } from 'react'
import { noteTabHidden, noteTabVisible, syncTabPauseFromVisibility } from './tabPause'

/** タブ非表示中はゲームタイマーを止める（レンダー停止は GameCanvas が担当）。 */
export function TabPauseSystem() {
  useEffect(() => {
    syncTabPauseFromVisibility()

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        noteTabHidden()
        return
      }

      noteTabVisible()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return null
}
