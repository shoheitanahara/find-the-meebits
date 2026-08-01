import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { ACESFilmicToneMapping } from 'three'
import { getEnableAntialias, getMaxCanvasDpr } from '../game/perfConfig'
import { ParkReturnButton } from '../ui/ParkReturnButton'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { TargetPreviewCapture } from '../ui/TargetPreviewCapture'
import { playSfx, unlockAudioIfNeeded } from '../ui/sfx'
import { STARLIGHT_RUSH } from './config'
import { StarlightRushCamera } from './player/StarlightRushCamera'
import { StarlightRushController } from './player/StarlightRushController'
import { StarlightRushPlayer } from './player/StarlightRushPlayer'
import { useStarlightRushStore } from './store'
import { StarlightRushFloatingScores, StarlightRushHud } from './ui/StarlightRushHud'
import { StarlightRushMobileControls } from './ui/StarlightRushMobileControls'
import { StarlightRushPlayPrompt, StarlightRushResult } from './ui/StarlightRushOverlays'
import { StarlightSpace } from './world/StarlightSpace'
import { StarlightStars } from './world/StarlightStars'

function useTabFrameloop() {
  const [frameloop, setFrameloop] = useState<'always' | 'never'>(() =>
    typeof document !== 'undefined' && document.visibilityState === 'hidden' ? 'never' : 'always',
  )

  useEffect(() => {
    const onVisibilityChange = () => {
      setFrameloop(document.visibilityState === 'hidden' ? 'never' : 'always')
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return frameloop
}

function StarlightRushScene() {
  return (
    <>
      <PerspectiveCamera makeDefault fov={STARLIGHT_RUSH.cameraFov} near={0.1} far={240} />
      <StarlightSpace>
        <StarlightRushPlayer />
        <StarlightStars />
        <StarlightRushFloatingScores />
      </StarlightSpace>
      <StarlightRushCamera />
      <StarlightRushController />
    </>
  )
}

export function StarlightRushApp() {
  const frameloop = useTabFrameloop()
  const phase = useStarlightRushStore((state) => state.phase)

  useEffect(() => {
    void unlockAudioIfNeeded()
    return () => {
      useStarlightRushStore.getState().exitToIdle()
      if (document.pointerLockElement) document.exitPointerLock()
    }
  }, [])

  useEffect(() => {
    if (phase === 'playing') {
      void unlockAudioIfNeeded().then(() => playSfx('timerStart'))
    }
    if (phase === 'docking') {
      void unlockAudioIfNeeded().then(() => playSfx('timeUp'))
      if (document.pointerLockElement) document.exitPointerLock()
    }
  }, [phase])

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#030712] text-[#f4ead2]">
      <Canvas
        id={STARLIGHT_RUSH.canvasElementId}
        frameloop={frameloop}
        dpr={[1, Math.min(getMaxCanvasDpr(), 1.5)]}
        gl={{ antialias: getEnableAntialias(), powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
        }}
        className="absolute inset-0"
      >
        <StarlightRushScene />
      </Canvas>

      <TargetPreviewCapture />
      <ParkReturnButton />
      <LanguageSwitcher
        className="pointer-events-auto absolute right-4 top-[max(3.25rem,calc(env(safe-area-inset-top)+2.75rem))] z-[60]"
        tone="dark"
      />

      <StarlightRushHud />
      <StarlightRushPlayPrompt />
      <StarlightRushResult />
      <StarlightRushMobileControls />
    </main>
  )
}
