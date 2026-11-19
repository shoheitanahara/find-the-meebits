import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Vector3 } from 'three'
import { CameraOcclusionFader } from '../world/CameraOcclusionFader'
import { cinemaPlayerWorld } from './playerWorld'
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

/**
 * 室内では常に、カメラとプレイヤー（胸・頭）のあいだにある壁と NPC を透かす。
 * カメラは壁の裏まで回り込むので、間に入った壁が透けて中が見える。
 */
const occlusionTargets = [new Vector3(), new Vector3(), new Vector3(), new Vector3()]
function getOcclusionTargets(): Vector3[] {
  if (!cinemaPlayerWorld.ready) return []
  occlusionTargets[0].set(cinemaPlayerWorld.x, 1.0, cinemaPlayerWorld.z)
  occlusionTargets[1].set(cinemaPlayerWorld.x, 1.5, cinemaPlayerWorld.z)
  return occlusionTargets.slice(0, 2)
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
          CINEMA.playerStart.z + CINEMA.cameraFollow.z,
        ]}
      />
      <CinemaRoom />
      <CameraOcclusionFader getTargets={getOcclusionTargets} />
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

  // 部屋の外（カメラが壁の裏に回り込んだとき）は何も描かれないので、背景は真っ黒にする
  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-black text-slate-100">
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
