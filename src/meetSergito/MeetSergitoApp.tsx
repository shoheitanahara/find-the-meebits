import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Vector3 } from 'three'
import { CameraOcclusionFader } from '../world/CameraOcclusionFader'
import { useDialogueStore } from '../dialogue/dialogueStore'
import { meetSergitoPlayerWorld } from './playerWorld'
import { getEnableAntialias, getMaxCanvasDpr } from '../game/perfConfig'
import { loadMeebitTraitsDataset } from '../data/meebitTraits'
import { ParkReturnButton } from '../ui/ParkReturnButton'
import {
  LANGUAGE_SWITCHER_ATTRACTION_CLASS,
  LanguageSwitcher,
} from '../ui/LanguageSwitcher'
import { TargetPreviewCapture } from '../ui/TargetPreviewCapture'
import { MeetSergitoPlayer } from './player/MeetSergitoPlayer'
import { LookControlsHint } from '../ui/LookControlsHint'
import { MeetSergitoTouchLookPad } from './player/MeetSergitoTouchLookPad'
import { MeetSergitoMobileControls } from './player/MeetSergitoMobileControls'
import { WorkshopRoom } from './world/WorkshopRoom'
import { MeetSergitoDisplayWarmup } from './world/MeetSergitoDisplayWarmup'
import { MeetSergitoExitPad } from './world/MeetSergitoExitPad'
import { SergitoNpc } from './npc/SergitoNpc'
import { SergitoDialogueBox } from './dialogue/SergitoDialogueBox'
import { SergitoDialogueSystem, SergitoInteractionPrompt } from './dialogue/SergitoDialogueSystem'
import { MEET_SERGITO, SERGITO_NPC_ID } from './config'
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

/**
 * 室内では常に、カメラとプレイヤー（胸・頭）のあいだにある壁と NPC を透かす。
 * カメラは壁の裏まで回り込むので、間に入った壁が透けて中が見える。
 */
const occlusionTargets = [new Vector3(), new Vector3(), new Vector3(), new Vector3()]
function getOcclusionTargets(): Vector3[] {
  if (!meetSergitoPlayerWorld.ready) return []
  occlusionTargets[0].set(meetSergitoPlayerWorld.x, 1.0, meetSergitoPlayerWorld.z)
  occlusionTargets[1].set(meetSergitoPlayerWorld.x, 1.5, meetSergitoPlayerWorld.z)
  // Sergito と話しているあいだは Sergito も見たい相手に加える
  const dialogue = useDialogueStore.getState()
  if (dialogue.isOpen && dialogue.activeNpcId === SERGITO_NPC_ID) {
    occlusionTargets[2].set(MEET_SERGITO.sergito.x, 1.1, MEET_SERGITO.sergito.z)
    occlusionTargets[3].set(MEET_SERGITO.sergito.x, 1.7, MEET_SERGITO.sergito.z)
    return occlusionTargets
  }
  return occlusionTargets.slice(0, 2)
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
          MEET_SERGITO.playerStart.z + MEET_SERGITO.cameraFollow.z,
        ]}
      />
      <WorkshopRoom />
      <CameraOcclusionFader getTargets={getOcclusionTargets} />
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

  // 部屋の外（カメラが壁の裏に回り込んだとき）は何も描かれないので、背景は真っ黒にする
  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-black text-[#f4ead2]">
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
      <LanguageSwitcher className={LANGUAGE_SWITCHER_ATTRACTION_CLASS} />
      <TargetPreviewCapture />
      <MeetSergitoLoadingOverlay />
      {bootPhase === 'ready' ? (
        <>
          <SergitoDialogueSystem />
          <SergitoDialogueBox />
          <SergitoInteractionPrompt />
          <LookControlsHint />
          <MeetSergitoTouchLookPad />
          <MeetSergitoMobileControls />
        </>
      ) : null}
    </main>
  )
}
