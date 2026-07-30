import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { ACESFilmicToneMapping } from 'three'
import { getEnableAntialias, getMaxCanvasDpr } from '../game/perfConfig'
import { ParkReturnButton } from '../ui/ParkReturnButton'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { TargetPreviewCapture } from '../ui/TargetPreviewCapture'
import { playSfx, unlockAudioIfNeeded } from '../ui/sfx'
import { SHOOTING_GALLERY } from './config'
import { ShootingGalleryCamera } from './player/ShootingGalleryCamera'
import { ShootingGalleryController } from './player/ShootingGalleryController'
import { ShootingGalleryPlayer } from './player/ShootingGalleryPlayer'
import { useShootingGalleryStore } from './store'
import { ShootingGalleryHud, ShootingGalleryFloatingScores } from './ui/ShootingGalleryHud'
import { ShootingGalleryMobileControls } from './ui/ShootingGalleryMobileControls'
import { ShootingGalleryPlayPrompt, ShootingGalleryResult } from './ui/ShootingGalleryOverlays'
import { ShootingGalleryRoom } from './world/ShootingGalleryRoom'
import { ShootingGalleryTargets } from './world/ShootingGalleryTargets'

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

function ShootingGalleryScene() {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={SHOOTING_GALLERY.cameraFov}
        near={0.1}
        far={80}
        position={[
          SHOOTING_GALLERY.playerAnchor.x + SHOOTING_GALLERY.cameraOffset.x,
          SHOOTING_GALLERY.cameraOffset.y,
          SHOOTING_GALLERY.playerAnchor.z + SHOOTING_GALLERY.cameraOffset.z,
        ]}
      />
      <ShootingGalleryRoom />
      <ShootingGalleryPlayer />
      <ShootingGalleryTargets />
      <ShootingGalleryCamera />
      <ShootingGalleryController />
      <ShootingGalleryFloatingScores />
    </>
  )
}

export function ShootingGalleryApp() {
  const frameloop = useTabFrameloop()
  const phase = useShootingGalleryStore((state) => state.phase)

  useEffect(() => {
    void unlockAudioIfNeeded()
    return () => {
      useShootingGalleryStore.getState().exitToIdle()
      if (document.pointerLockElement) document.exitPointerLock()
    }
  }, [])

  useEffect(() => {
    if (phase === 'result') {
      void unlockAudioIfNeeded().then(() => playSfx('timeUp'))
      if (document.pointerLockElement) document.exitPointerLock()
    }
  }, [phase])

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#1a1510] text-[#f4ead2]">
      <Canvas
        id={SHOOTING_GALLERY.canvasElementId}
        frameloop={frameloop}
        dpr={[1, Math.min(getMaxCanvasDpr(), 1.5)]}
        shadows="soft"
        gl={{ antialias: getEnableAntialias(), powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.08
        }}
        className="absolute inset-0"
      >
        <ShootingGalleryScene />
      </Canvas>

      <TargetPreviewCapture />
      <ParkReturnButton />
      <LanguageSwitcher
        className="pointer-events-auto absolute right-4 top-[max(3.25rem,calc(env(safe-area-inset-top)+2.75rem))] z-[60]"
        tone="dark"
      />

      <ShootingGalleryHud />
      <ShootingGalleryPlayPrompt />
      <ShootingGalleryResult />
      <ShootingGalleryMobileControls />
    </main>
  )
}
