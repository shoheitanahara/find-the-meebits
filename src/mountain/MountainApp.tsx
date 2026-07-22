import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { getEnableAntialias, getMaxCanvasDpr } from '../game/perfConfig'
import { ClimbController, useMountainKeyboardBridge } from './player/ClimbController'
import { MountainMobileControls } from './player/MobileControls'
import { useMountainStore } from './store'
import { ParkReturnButton } from '../ui/ParkReturnButton'
import { ClearOverlay, ClimbHud, TitleScreen } from './ui/Screens'
import { MountainAtmosphere, VoxelMountain } from './world/VoxelMountain'

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

function MountainScene() {
  const phase = useMountainStore((state) => state.phase)
  const enabled = phase === 'playing'

  return (
    <>
      <PerspectiveCamera makeDefault fov={50} near={0.1} far={280} position={[0, 5, 10]} />
      <MountainAtmosphere />
      <VoxelMountain />
      <ClimbController enabled={enabled} />
    </>
  )
}

export function MountainApp() {
  const phase = useMountainStore((state) => state.phase)
  const frameloop = useTabFrameloop()
  useMountainKeyboardBridge()
  const showWorld = phase !== 'title'

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#87b8d8] text-slate-100">
      {showWorld ? (
        <Canvas
          frameloop={frameloop}
          dpr={[1, Math.min(getMaxCanvasDpr(), 1.5)]}
          shadows
          gl={{ antialias: getEnableAntialias(), powerPreference: 'high-performance' }}
          className="absolute inset-0"
        >
          <MountainScene />
        </Canvas>
      ) : null}

      <TitleScreen />
      <ClimbHud />
      <ClearOverlay />
      <ParkReturnButton />
      {phase === 'playing' ? <MountainMobileControls /> : null}
    </main>
  )
}
