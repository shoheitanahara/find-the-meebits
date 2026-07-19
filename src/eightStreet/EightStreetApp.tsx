import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { getEnableAntialias, getMaxCanvasDpr } from '../game/perfConfig'
import { EIGHT_STREET } from './config'
import { MeebitWalkerCrowd } from './meebits/MeebitWalkerCrowd'
import { FirstPersonController } from './player/FirstPersonController'
import { EightStreetMobileControls } from './player/MobileControls'
import { useEightStreetStore } from './store'
import { AlleyEnvironment, LAlleyStreet } from './world/AlleyStreet'
import { TitleScreen } from './ui/TitleScreen'
import { HowToPlay } from './ui/HowToPlay'
import { EightStreetClearOverlay } from './ui/ClearOverlay'
import { ControlsHud, LoadingOverlay, WrapWash } from './ui/ProgressHud'

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

function EightStreetScene() {
  const phase = useEightStreetStore((state) => state.phase)
  const enabled = phase === 'playing'

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={EIGHT_STREET.fov}
        near={0.08}
        far={200}
        position={[
          EIGHT_STREET.playerStartX,
          EIGHT_STREET.eyeHeight,
          EIGHT_STREET.playerStartZ,
        ]}
      />
      <AlleyEnvironment />
      <LAlleyStreet />
      <MeebitWalkerCrowd />
      <FirstPersonController enabled={enabled} />
    </>
  )
}

export function EightStreetApp() {
  const phase = useEightStreetStore((state) => state.phase)
  const frameloop = useTabFrameloop()
  const showWorld = phase !== 'title'

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#0c1220] text-slate-100">
      {showWorld ? (
        <Canvas
          frameloop={frameloop}
          dpr={[1, Math.min(getMaxCanvasDpr(), 1.5)]}
          shadows={false}
          gl={{ antialias: getEnableAntialias(), powerPreference: 'high-performance' }}
          className="absolute inset-0"
        >
          <EightStreetScene />
        </Canvas>
      ) : null}

      <TitleScreen />
      <HowToPlay />
      <LoadingOverlay />
      <WrapWash />
      <ControlsHud />
      <EightStreetClearOverlay />
      {phase === 'playing' && <EightStreetMobileControls />}
    </main>
  )
}
