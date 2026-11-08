import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { getEnableAntialias, getMaxCanvasDpr } from '../game/perfConfig'
import { ParkReturnButton } from '../ui/ParkReturnButton'
import {
  LANGUAGE_SWITCHER_ATTRACTION_CLASS,
  LanguageSwitcher,
} from '../ui/LanguageSwitcher'
import { LookControlsHint } from '../ui/LookControlsHint'
import { CinemaPlayer } from './player/CinemaPlayer'
import { CinemaTouchLookPad } from './player/CinemaTouchLookPad'
import { CinemaAudience } from './show/CinemaAudience'
import { CinemaScreen } from './show/CinemaScreen'
import { useCinemaStore } from './store'
import { CinemaTitleScreen } from './ui/TitleScreen'
import { useCinemaSeekKeyboard } from './ui/CinemaSeekButtons'
import { useCinemaMuteKeyboard } from './ui/CinemaUnmuteButton'
import {
  CinemaMobileControls,
  CinemaSitPrompt,
  useCinemaSitKeyboard,
} from './ui/CinemaSitControls'
import { CinemaRoom } from './world/CinemaRoom'
import { CinemaExitPad } from './world/CinemaExitPad'
import { CINEMA } from './config'

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

function CinemaScene() {
  const phase = useCinemaStore((state) => state.phase)
  const enabled = phase === 'playing'

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={50}
        near={0.1}
        far={80}
        position={[
          CINEMA.playerStart.x + CINEMA.cameraFollow.x,
          CINEMA.cameraFollow.y,
          Math.min(CINEMA.playerStart.z + CINEMA.cameraFollow.z, CINEMA.roomMaxZ - 0.8),
        ]}
      />
      <CinemaRoom />
      <CinemaExitPad enabled={enabled} />
      <CinemaScreen />
      <CinemaAudience />
      <CinemaPlayer enabled={enabled} />
    </>
  )
}

export function CinemaApp() {
  const phase = useCinemaStore((state) => state.phase)
  const frameloop = useTabFrameloop()
  const showWorld = phase !== 'title'
  useCinemaSitKeyboard()
  useCinemaMuteKeyboard()
  useCinemaSeekKeyboard()

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#07090f] text-slate-100">
      {showWorld ? (
        <Canvas
          frameloop={frameloop}
          dpr={[1, Math.min(getMaxCanvasDpr(), 1.5)]}
          shadows
          gl={{
            antialias: getEnableAntialias(),
            powerPreference: 'high-performance',
            /** Html occlude="blending" で映像を壁面に、アバターを手前に出す */
            alpha: true,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
          }}
          className="absolute inset-0 bg-transparent"
        >
          <CinemaScene />
        </Canvas>
      ) : null}

      <CinemaTitleScreen />
      <ParkReturnButton />
      {phase === 'title' ? (
        <LanguageSwitcher className={LANGUAGE_SWITCHER_ATTRACTION_CLASS} />
      ) : null}
      {phase === 'playing' ? (
        // canvas(blending) より前面。Sit / Sound on が隠れないようにする
        <div className="pointer-events-none absolute inset-0 z-50">
          <LookControlsHint key="cinema-look-hint" />
          <CinemaTouchLookPad />
          <CinemaMobileControls />
          <CinemaSitPrompt />
        </div>
      ) : null}
    </main>
  )
}
