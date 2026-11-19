import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Vector3 } from 'three'
import { CameraOcclusionFader } from '../world/CameraOcclusionFader'
import { clubPlayerWorld } from './playerWorld'
import { getEnableAntialias, getMaxCanvasDpr } from '../game/perfConfig'
import { ParkReturnButton } from '../ui/ParkReturnButton'
import {
  LANGUAGE_SWITCHER_ATTRACTION_CLASS,
  LanguageSwitcher,
} from '../ui/LanguageSwitcher'
import { LookControlsHint } from '../ui/LookControlsHint'
import { ClubPlayer } from './player/ClubPlayer'
import { ClubTouchLookPad } from './player/ClubTouchLookPad'
import { ClubAudience } from './show/ClubAudience'
import { ClubScreen } from './show/ClubScreen'
import { useClubStore } from './store'
import { ClubNowPlaying } from './ui/ClubNowPlaying'
import { ClubDesktopControls, ClubMobileControls } from './ui/ClubMobileControls'
import { useClubSeekKeyboard } from './ui/ClubSeekButtons'
import { ClubTitleScreen } from './ui/TitleScreen'
import { useClubMuteKeyboard } from './ui/ClubUnmuteButton'
import { ClubRoom } from './world/ClubRoom'
import { ClubExitPad } from './world/ClubExitPad'
import { CLUB } from './config'

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
  if (!clubPlayerWorld.ready) return []
  occlusionTargets[0].set(clubPlayerWorld.x, 1.0, clubPlayerWorld.z)
  occlusionTargets[1].set(clubPlayerWorld.x, 1.5, clubPlayerWorld.z)
  return occlusionTargets.slice(0, 2)
}

function ClubScene() {
  const phase = useClubStore((state) => state.phase)
  const enabled = phase === 'playing'

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={50}
        near={0.1}
        far={80}
        position={[
          CLUB.playerStart.x + CLUB.cameraFollow.x,
          CLUB.cameraFollow.y,
          CLUB.playerStart.z + CLUB.cameraFollow.z,
        ]}
      />
      <ClubRoom />
      <CameraOcclusionFader getTargets={getOcclusionTargets} />
      <ClubExitPad enabled={enabled} />
      <ClubScreen />
      <ClubAudience />
      <ClubPlayer enabled={enabled} />
    </>
  )
}

export function ClubApp() {
  const phase = useClubStore((state) => state.phase)
  const frameloop = useTabFrameloop()
  const showWorld = phase !== 'title'
  useClubMuteKeyboard()
  useClubSeekKeyboard()

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
            alpha: true,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
          }}
          className="absolute inset-0 bg-transparent"
        >
          <ClubScene />
        </Canvas>
      ) : null}

      <ClubTitleScreen />
      <ParkReturnButton />
      {phase === 'title' ? (
        <LanguageSwitcher className={LANGUAGE_SWITCHER_ATTRACTION_CLASS} />
      ) : null}
      {phase === 'playing' ? (
        <div className="pointer-events-none absolute inset-0 z-50">
          <ClubNowPlaying />
          <LookControlsHint key="hiphop-look-hint" />
          <ClubTouchLookPad />
          <ClubMobileControls />
          <ClubDesktopControls />
        </div>
      ) : null}
    </main>
  )
}
