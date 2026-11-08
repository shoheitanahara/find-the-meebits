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
import { PodcastPlayer } from './player/PodcastPlayer'
import { PodcastTouchLookPad } from './player/PodcastTouchLookPad'
import { PodcastAudience } from './show/PodcastAudience'
import { PodcastScreen } from './show/PodcastScreen'
import { usePodcastStore } from './store'
import { PodcastNowPlaying } from './ui/PodcastNowPlaying'
import { PodcastTitleScreen } from './ui/TitleScreen'
import { usePodcastSeekKeyboard } from './ui/PodcastSeekButtons'
import { usePodcastMuteKeyboard } from './ui/PodcastUnmuteButton'
import {
  PodcastMobileControls,
  PodcastSitPrompt,
  usePodcastSitKeyboard,
} from './ui/PodcastSitControls'
import { PodcastRoom } from './world/PodcastRoom'
import { PodcastExitPad } from './world/PodcastExitPad'
import { PODCAST } from './config'

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

function PodcastScene() {
  const phase = usePodcastStore((state) => state.phase)
  const enabled = phase === 'playing'

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={50}
        near={0.1}
        far={80}
        position={[
          PODCAST.playerStart.x + PODCAST.cameraFollow.x,
          PODCAST.cameraFollow.y,
          Math.min(PODCAST.playerStart.z + PODCAST.cameraFollow.z, PODCAST.roomMaxZ - 0.8),
        ]}
      />
      <PodcastRoom />
      <PodcastExitPad enabled={enabled} />
      <PodcastScreen />
      <PodcastAudience />
      <PodcastPlayer enabled={enabled} />
    </>
  )
}

export function PodcastApp() {
  const phase = usePodcastStore((state) => state.phase)
  const frameloop = useTabFrameloop()
  const showWorld = phase !== 'title'
  usePodcastSitKeyboard()
  usePodcastMuteKeyboard()
  usePodcastSeekKeyboard()

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#120e0c] text-slate-100">
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
          <PodcastScene />
        </Canvas>
      ) : null}

      <PodcastTitleScreen />
      <ParkReturnButton />
      {phase === 'title' ? (
        <LanguageSwitcher className={LANGUAGE_SWITCHER_ATTRACTION_CLASS} />
      ) : null}
      {phase === 'playing' ? (
        // canvas(blending) より前面。Sit / Sound on が隠れないようにする
        <div className="pointer-events-none absolute inset-0 z-50">
          <PodcastNowPlaying />
          <LookControlsHint key="podcast-look-hint" />
          <PodcastTouchLookPad />
          <PodcastMobileControls />
          <PodcastSitPrompt />
        </div>
      ) : null}
    </main>
  )
}
