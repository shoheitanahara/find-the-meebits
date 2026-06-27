import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGameStore } from '../stores/gameStore'
import { getEnableAntialias, getMaxCanvasDpr } from './perfConfig'
import { GameScene } from './GameScene'
import { noteTabHidden, noteTabVisible, syncTabPauseFromVisibility } from '../systems/tabPause'

function useTabFrameloop() {
  const [frameloop, setFrameloop] = useState<'always' | 'never'>(() =>
    typeof document !== 'undefined' && document.visibilityState === 'hidden' ? 'never' : 'always',
  )

  useEffect(() => {
    syncTabPauseFromVisibility()
    setFrameloop(document.visibilityState === 'hidden' ? 'never' : 'always')

    const onVisibilityChange = () => {
      const hidden = document.visibilityState === 'hidden'

      if (hidden) {
        noteTabHidden()
      } else {
        noteTabVisible()
      }

      setFrameloop(hidden ? 'never' : 'always')
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return frameloop
}

export function GameCanvas() {
  const venueId = useGameStore((state) => state.venueId)
  const frameloop = useTabFrameloop()

  return (
    <Canvas
      frameloop={frameloop}
      camera={{ position: [12, 10, 14], fov: 45, near: 0.1, far: 260 }}
      dpr={[1, getMaxCanvasDpr()]}
      shadows
      gl={{ antialias: getEnableAntialias(), powerPreference: 'high-performance' }}
    >
      <GameScene venueId={venueId} />
    </Canvas>
  )
}
