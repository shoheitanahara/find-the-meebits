import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { getEnableAntialias, getMaxCanvasDpr } from '../game/perfConfig'
import { ParkReturnButton } from '../ui/ParkReturnButton'
import { RunwayPlayer } from './player/RunwayPlayer'
import { RunwayTouchLookPad } from './player/RunwayTouchLookPad'
import { RunwayCatwalkShow } from './show/RunwayCatwalkShow'
import { RunwayAudience } from './show/RunwayAudience'
import { RunwayScreen } from './show/RunwayScreen'
import { useRunwayStore } from './store'
import { RunwayHud } from './ui/Hud'
import { RunwayTitleScreen } from './ui/TitleScreen'
import {
  RunwayMobileControls,
  RunwaySitPrompt,
  useRunwaySitKeyboard,
} from './ui/RunwaySitControls'
import { RunwayRoom } from './world/RunwayRoom'
import { RunwayExitPad } from './world/RunwayExitPad'
import { RunwayBgmSystem } from './RunwayBgmSystem'
import { RUNWAY } from './config'

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

function RunwayScene() {
  const phase = useRunwayStore((state) => state.phase)
  const enabled = phase === 'playing'

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={50}
        near={0.1}
        far={80}
        position={[
          RUNWAY.playerStart.x + RUNWAY.cameraFollow.x,
          RUNWAY.cameraFollow.y,
          Math.min(
            RUNWAY.playerStart.z + RUNWAY.cameraFollow.z,
            RUNWAY.roomMaxZ - 0.8,
          ),
        ]}
      />
      <RunwayRoom />
      <RunwayExitPad enabled={enabled} />
      <RunwayScreen />
      <RunwayCatwalkShow />
      <RunwayAudience />
      <RunwayPlayer enabled={enabled} />
    </>
  )
}

export function RunwayApp() {
  const phase = useRunwayStore((state) => state.phase)
  const frameloop = useTabFrameloop()
  const showWorld = phase !== 'title'
  useRunwaySitKeyboard()

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#050505] text-slate-100">
      <RunwayBgmSystem />
      {showWorld ? (
        <Canvas
          frameloop={frameloop}
          dpr={[1, Math.min(getMaxCanvasDpr(), 1.5)]}
          shadows
          gl={{ antialias: getEnableAntialias(), powerPreference: 'high-performance' }}
          className="absolute inset-0"
        >
          <RunwayScene />
        </Canvas>
      ) : null}

      <RunwayTitleScreen />
      <RunwayHud />
      <ParkReturnButton />
      {phase === 'playing' ? (
        <>
          <RunwayTouchLookPad />
          <RunwayMobileControls />
          <RunwaySitPrompt />
        </>
      ) : null}
    </main>
  )
}
