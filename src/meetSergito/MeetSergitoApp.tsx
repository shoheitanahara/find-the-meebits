import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { getEnableAntialias, getMaxCanvasDpr } from '../game/perfConfig'
import { loadMeebitTraitsDataset } from '../data/meebitTraits'
import { ParkReturnButton } from '../ui/ParkReturnButton'
import { TargetPreviewCapture } from '../ui/TargetPreviewCapture'
import { MeetSergitoPlayer } from './player/MeetSergitoPlayer'
import { MeetSergitoTouchLookPad } from './player/MeetSergitoTouchLookPad'
import { MeetSergitoMobileControls } from './player/MeetSergitoMobileControls'
import { WorkshopRoom } from './world/WorkshopRoom'
import { MeetSergitoDisplayWarmup } from './world/MeetSergitoDisplayWarmup'
import { MeetSergitoExitPad } from './world/MeetSergitoExitPad'
import { SergitoNpc } from './npc/SergitoNpc'
import { SergitoDialogueBox } from './dialogue/SergitoDialogueBox'
import { SergitoDialogueSystem, SergitoInteractionPrompt } from './dialogue/SergitoDialogueSystem'
import { MEET_SERGITO } from './config'
import { useMeetSergitoStore } from './store'
import { MeetSergitoLoadingOverlay } from './ui/MeetSergitoLoadingOverlay'
import { getWorkshopFigurePlacements, WORKSHOP_WALKER_COUNT } from './world/workshopFigureLayout'

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

function MeetSergitoScene() {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={50}
        near={0.1}
        far={80}
        position={[
          MEET_SERGITO.playerStart.x + MEET_SERGITO.cameraFollow.x,
          MEET_SERGITO.cameraFollow.y,
          Math.min(
            MEET_SERGITO.playerStart.z + MEET_SERGITO.cameraFollow.z,
            MEET_SERGITO.roomMaxZ - 1.0,
          ),
        ]}
      />
      <WorkshopRoom />
      <MeetSergitoExitPad />
      <SergitoNpc />
      <MeetSergitoPlayer />
      <MeetSergitoDisplayWarmup />
    </>
  )
}

export function MeetSergitoApp() {
  const frameloop = useTabFrameloop()
  const bootPhase = useMeetSergitoStore((state) => state.bootPhase)

  // 子コンポーネントの ready 報告より先にリセットする（useEffect だと競合で固まる）
  useState(() => {
    const figuresExpected = getWorkshopFigurePlacements().length
    useMeetSergitoStore.getState().resetBoot(WORKSHOP_WALKER_COUNT, figuresExpected)
  })

  useEffect(() => {
    void loadMeebitTraitsDataset()
  }, [])

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#1a140c] text-[#f4ead2]">
      <Canvas
        frameloop={frameloop}
        dpr={[1, Math.min(getMaxCanvasDpr(), 1.5)]}
        shadows
        gl={{ antialias: getEnableAntialias(), powerPreference: 'high-performance' }}
        className="absolute inset-0"
      >
        <MeetSergitoScene />
      </Canvas>

      <ParkReturnButton />
      <TargetPreviewCapture />
      <MeetSergitoLoadingOverlay />
      {bootPhase === 'ready' ? (
        <>
          <SergitoDialogueSystem />
          <SergitoDialogueBox />
          <SergitoInteractionPrompt />
          <MeetSergitoTouchLookPad />
          <MeetSergitoMobileControls />
        </>
      ) : null}
    </main>
  )
}
