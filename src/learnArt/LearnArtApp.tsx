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
import { LearnArtPlayer } from './player/LearnArtPlayer'
import { LearnArtTouchLookPad } from './player/LearnArtTouchLookPad'
import { LearnArtAudience } from './show/LearnArtAudience'
import { LearnArtScreen } from './show/LearnArtScreen'
import { useLearnArtStore } from './store'
import { LearnArtTitleScreen } from './ui/TitleScreen'
import { useLearnArtSeekKeyboard } from './ui/LearnArtSeekButtons'
import { useLearnArtMuteKeyboard } from './ui/LearnArtUnmuteButton'
import {
  LearnArtMobileControls,
  LearnArtSitPrompt,
  useLearnArtSitKeyboard,
} from './ui/LearnArtSitControls'
import { LearnArtRoom } from './world/LearnArtRoom'
import { LearnArtExitPad } from './world/LearnArtExitPad'
import { LEARN_ART } from './config'

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

function LearnArtScene() {
  const phase = useLearnArtStore((state) => state.phase)
  const enabled = phase === 'playing'

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={50}
        near={0.1}
        far={80}
        position={[
          LEARN_ART.playerStart.x + LEARN_ART.cameraFollow.x,
          LEARN_ART.cameraFollow.y,
          Math.min(LEARN_ART.playerStart.z + LEARN_ART.cameraFollow.z, LEARN_ART.roomMaxZ - 0.8),
        ]}
      />
      <LearnArtRoom />
      <LearnArtExitPad enabled={enabled} />
      <LearnArtScreen />
      <LearnArtAudience />
      <LearnArtPlayer enabled={enabled} />
    </>
  )
}

export function LearnArtApp() {
  const phase = useLearnArtStore((state) => state.phase)
  const frameloop = useTabFrameloop()
  const showWorld = phase !== 'title'
  useLearnArtSitKeyboard()
  useLearnArtMuteKeyboard()
  useLearnArtSeekKeyboard()

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#0c0610] text-slate-100">
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
          <LearnArtScene />
        </Canvas>
      ) : null}

      <LearnArtTitleScreen />
      <ParkReturnButton />
      {phase === 'title' ? (
        <LanguageSwitcher className={LANGUAGE_SWITCHER_ATTRACTION_CLASS} />
      ) : null}
      {phase === 'playing' ? (
        // canvas(blending) より前面。Sit / Sound on が隠れないようにする
        <div className="pointer-events-none absolute inset-0 z-50">
          <LookControlsHint key="learn-art-look-hint" />
          <LearnArtTouchLookPad />
          <LearnArtMobileControls />
          <LearnArtSitPrompt />
        </div>
      ) : null}
    </main>
  )
}
