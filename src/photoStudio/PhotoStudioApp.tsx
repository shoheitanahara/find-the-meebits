import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import { usePlayerStore } from '../stores/playerStore'
import { ParkReturnButton } from '../ui/ParkReturnButton'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { TargetPreviewCapture } from '../ui/TargetPreviewCapture'
import { unlockAudioIfNeeded } from '../ui/sfx'
import { PHOTO_STUDIO, clampMeebitId } from './config'
import { setStudioGl } from './capture/studioGlBridge'
import { StudioPlayer } from './player/StudioPlayer'
import { usePhotoStudioStore } from './store'
import {
  PhotoStudioControls,
  PhotoStudioDragLayer,
  PhotoStudioPreviewChrome,
  PhotoStudioStartScreen,
} from './ui/PhotoStudioOverlays'
import { StudioCamera, StudioEnvironment } from './world/StudioEnvironment'

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

function PhotoStudioScene() {
  const phase = usePhotoStudioStore((state) => state.phase)

  return (
    <>
      <StudioCamera />
      <StudioEnvironment />
      {phase === 'studio' ? <StudioPlayer /> : null}
    </>
  )
}

export function PhotoStudioApp() {
  const frameloop = useTabFrameloop()
  const phase = usePhotoStudioStore((state) => state.phase)

  useEffect(() => {
    void unlockAudioIfNeeded()
    const saved = clampMeebitId(usePlayerStore.getState().meebitNumber)
    usePhotoStudioStore.setState({
      meebitNumber: saved,
      draftMeebitInput: String(saved),
      phase: 'idle',
      brightness: PHOTO_STUDIO.lighting.exposureDefault,
    })
    return () => {
      usePhotoStudioStore.getState().exitToIdle()
      setStudioGl(null)
    }
  }, [])

  return (
    <main className="relative flex h-dvh w-dvw flex-col overflow-hidden bg-[#101820] text-[#f4ead2]">
      <ParkReturnButton />
      <LanguageSwitcher
        className="pointer-events-auto absolute right-4 top-[max(3.25rem,calc(env(safe-area-inset-top)+2.75rem))] z-[60]"
        tone="dark"
      />

      {/* ヘッダー下: モバイルは縦、lg以上は左調整 / 右プレビュー */}
      <div className="flex min-h-0 flex-1 flex-col pt-[max(2.75rem,calc(env(safe-area-inset-top)+2.35rem))] lg:flex-row">
        {phase === 'studio' ? (
          <div className="order-2 max-h-[46%] min-h-0 shrink-0 lg:order-1 lg:max-h-none lg:h-full">
            <PhotoStudioControls />
          </div>
        ) : null}

        <section className="relative order-1 flex min-h-0 flex-1 items-center justify-center bg-[#0a0e14] p-3 sm:p-5 lg:order-2">
          <div className="relative aspect-square w-full max-h-full max-w-[min(100%,calc(100dvh-8rem))] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl lg:max-w-[min(100%,calc(100dvh-4rem))]">
            <Canvas
              id={PHOTO_STUDIO.canvasElementId}
              frameloop={frameloop}
              // 撮影アトラクション: SP でも PC と同じ画質（perfConfig のモバイル制限を使わない）
              dpr={[1, PHOTO_STUDIO.canvasMaxDpr]}
              gl={{
                antialias: true,
                powerPreference: 'high-performance',
                preserveDrawingBuffer: true,
              }}
              shadows
              onCreated={({ gl }) => {
                gl.toneMapping = ACESFilmicToneMapping
                gl.toneMappingExposure = PHOTO_STUDIO.lighting.exposureDefault
                setStudioGl(gl)
              }}
              className="absolute inset-0 !h-full !w-full"
            >
              <PhotoStudioScene />
            </Canvas>

            {phase === 'studio' ? (
              <>
                <PhotoStudioDragLayer />
                <PhotoStudioPreviewChrome />
              </>
            ) : null}
          </div>
        </section>
      </div>

      <TargetPreviewCapture />
      <PhotoStudioStartScreen />
    </main>
  )
}
