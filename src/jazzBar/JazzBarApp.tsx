import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Vector3 } from 'three'
import { CameraOcclusionFader } from '../world/CameraOcclusionFader'
import { jazzBarPlayerWorld } from './playerWorld'
import { getEnableAntialias, getMaxCanvasDpr } from '../game/perfConfig'
import { ParkReturnButton } from '../ui/ParkReturnButton'
import {
  LANGUAGE_SWITCHER_ATTRACTION_CLASS,
  LanguageSwitcher,
} from '../ui/LanguageSwitcher'
import { LookControlsHint } from '../ui/LookControlsHint'
import { JazzBarPlayer } from './player/JazzBarPlayer'
import { JazzBarTouchLookPad } from './player/JazzBarTouchLookPad'
import { JazzBarAudience } from './show/JazzBarAudience'
import { JazzBarScreen } from './show/JazzBarScreen'
import { useJazzBarStore } from './store'
import { JazzBarNowPlaying } from './ui/JazzBarNowPlaying'
import { JazzBarTitleScreen } from './ui/TitleScreen'
import { useJazzBarSeekKeyboard } from './ui/JazzBarSeekButtons'
import { useJazzBarMuteKeyboard } from './ui/JazzBarUnmuteButton'
import {
  JazzBarMobileControls,
  JazzBarSitPrompt,
  useJazzBarSitKeyboard,
} from './ui/JazzBarSitControls'
import { JazzBarRoom } from './world/JazzBarRoom'
import { JazzBarExitPad } from './world/JazzBarExitPad'
import { JAZZ_BAR } from './config'

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
  if (!jazzBarPlayerWorld.ready) return []
  occlusionTargets[0].set(jazzBarPlayerWorld.x, 1.0, jazzBarPlayerWorld.z)
  occlusionTargets[1].set(jazzBarPlayerWorld.x, 1.5, jazzBarPlayerWorld.z)
  return occlusionTargets.slice(0, 2)
}

function JazzBarScene() {
  const phase = useJazzBarStore((state) => state.phase)
  const enabled = phase === 'playing'

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={50}
        near={0.1}
        far={80}
        position={[
          JAZZ_BAR.playerStart.x + JAZZ_BAR.cameraFollow.x,
          JAZZ_BAR.cameraFollow.y,
          JAZZ_BAR.playerStart.z + JAZZ_BAR.cameraFollow.z,
        ]}
      />
      <JazzBarRoom />
      <CameraOcclusionFader getTargets={getOcclusionTargets} />
      <JazzBarExitPad enabled={enabled} />
      <JazzBarScreen />
      <JazzBarAudience />
      <JazzBarPlayer enabled={enabled} />
    </>
  )
}

export function JazzBarApp() {
  const phase = useJazzBarStore((state) => state.phase)
  const frameloop = useTabFrameloop()
  const showWorld = phase !== 'title'
  useJazzBarSitKeyboard()
  useJazzBarMuteKeyboard()
  useJazzBarSeekKeyboard()

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
          <JazzBarScene />
        </Canvas>
      ) : null}

      <JazzBarTitleScreen />
      <ParkReturnButton />
      {phase === 'title' ? (
        <LanguageSwitcher className={LANGUAGE_SWITCHER_ATTRACTION_CLASS} />
      ) : null}
      {phase === 'playing' ? (
        // canvas(blending) より前面。Sit / Sound on が隠れないようにする
        <div className="pointer-events-none absolute inset-0 z-50">
          <JazzBarNowPlaying />
          <LookControlsHint key="jazz-bar-look-hint" />
          <JazzBarTouchLookPad />
          <JazzBarMobileControls />
          <JazzBarSitPrompt />
        </div>
      ) : null}
    </main>
  )
}
