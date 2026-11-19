import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Vector3 } from 'three'
import { CameraOcclusionFader } from '../world/CameraOcclusionFader'
import { runwayPlayerWorld } from './playerWorld'
import { getEnableAntialias, getMaxCanvasDpr } from '../game/perfConfig'
import { ParkReturnButton } from '../ui/ParkReturnButton'
import {
  LANGUAGE_SWITCHER_ATTRACTION_CLASS,
  LanguageSwitcher,
} from '../ui/LanguageSwitcher'
import { RunwayPlayer } from './player/RunwayPlayer'
import { LookControlsHint } from '../ui/LookControlsHint'
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

/**
 * 室内では常に、カメラとプレイヤー（胸・頭）のあいだにある壁を透かす（アバターは重いので対象外）。
 * カメラは壁の裏まで回り込むので、間に入った壁が透けて中が見える。
 */
const occlusionTargets = [new Vector3(), new Vector3(), new Vector3(), new Vector3()]
function getOcclusionTargets(): Vector3[] {
  if (!runwayPlayerWorld.ready) return []
  occlusionTargets[0].set(runwayPlayerWorld.x, 1.0, runwayPlayerWorld.z)
  occlusionTargets[1].set(runwayPlayerWorld.x, 1.5, runwayPlayerWorld.z)
  return occlusionTargets.slice(0, 2)
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
          RUNWAY.playerStart.z + RUNWAY.cameraFollow.z,
        ]}
      />
      <RunwayRoom />
      <CameraOcclusionFader getTargets={getOcclusionTargets} />
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

  // 部屋の外（カメラが壁の裏に回り込んだとき）は何も描かれないので、背景は真っ黒にする
  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-black text-slate-100">
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
      {phase === 'title' ? (
        <LanguageSwitcher className={LANGUAGE_SWITCHER_ATTRACTION_CLASS} />
      ) : null}
      {phase === 'playing' ? (
        <>
          <LookControlsHint key="runway-look-hint" />
          <RunwayTouchLookPad />
          <RunwayMobileControls />
          <RunwaySitPrompt />
        </>
      ) : null}
    </main>
  )
}
