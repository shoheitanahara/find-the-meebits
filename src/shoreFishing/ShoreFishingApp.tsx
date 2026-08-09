import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { ACESFilmicToneMapping } from 'three'
import { getEnableAntialias, getMaxCanvasDpr } from '../game/perfConfig'
import { ParkReturnButton } from '../ui/ParkReturnButton'
import {
  LANGUAGE_SWITCHER_ATTRACTION_CLASS,
  LanguageSwitcher,
} from '../ui/LanguageSwitcher'
import { TargetPreviewCapture } from '../ui/TargetPreviewCapture'
import { playSfx, unlockAudioIfNeeded } from '../ui/sfx'
import { useTouchControlsStore } from '../stores/touchControlsStore'
import { SHORE_FISHING } from './config'
import { ShoreFishingCamera } from './player/ShoreFishingCamera'
import { ShoreFishingController } from './player/ShoreFishingController'
import { ShoreFishingPlayer } from './player/ShoreFishingPlayer'
import { resetShorePlayerWorld } from './playerWorld'
import { useShoreFishingStore } from './store'
import { ShoreFishingHud } from './ui/ShoreFishingHud'
import { ShoreFishingMobileControls } from './ui/ShoreFishingMobileControls'
import { ShoreFishingPlayPrompt, ShoreFishingResult } from './ui/ShoreFishingOverlays'
import { ShoreBeach } from './world/ShoreBeach'
import { ShoreFishingNpcs } from './world/ShoreFishingNpcs'

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

function ShoreFishingScene() {
  return (
    <>
      <PerspectiveCamera makeDefault fov={SHORE_FISHING.cameraFov} near={0.1} far={140} />
      <ShoreBeach />
      <ShoreFishingNpcs />
      <ShoreFishingPlayer />
      <ShoreFishingCamera />
      <ShoreFishingController />
    </>
  )
}

export function ShoreFishingApp() {
  const frameloop = useTabFrameloop()
  const phase = useShoreFishingStore((s) => s.phase)

  useEffect(() => {
    void unlockAudioIfNeeded()
    resetShorePlayerWorld()
    return () => {
      useShoreFishingStore.getState().exitToIdle()
      useTouchControlsStore.getState().resetJoystick()
    }
  }, [])

  useEffect(() => {
    if (phase === 'playing') {
      void unlockAudioIfNeeded().then(() => playSfx('timerStart'))
    }
    if (phase === 'result') {
      void unlockAudioIfNeeded().then(() => playSfx('timeUp'))
    }
  }, [phase])

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#b9d6f2] text-[#1a3040]">
      <Canvas
        id={SHORE_FISHING.canvasElementId}
        frameloop={frameloop}
        dpr={[1, Math.min(getMaxCanvasDpr(), 1.5)]}
        gl={{ antialias: getEnableAntialias(), powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.22
        }}
        className="absolute inset-0"
      >
        <ShoreFishingScene />
      </Canvas>

      <TargetPreviewCapture />
      <ParkReturnButton />
      {phase === 'idle' ? (
        <LanguageSwitcher className={LANGUAGE_SWITCHER_ATTRACTION_CLASS} />
      ) : null}

      <ShoreFishingHud />
      <ShoreFishingMobileControls />
      <ShoreFishingPlayPrompt />
      <ShoreFishingResult />
    </main>
  )
}
