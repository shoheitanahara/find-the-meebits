import { Canvas } from '@react-three/fiber'
import { useGameStore } from '../stores/gameStore'
import { getEnableAntialias, getMaxCanvasDpr } from './perfConfig'
import { GameScene } from './GameScene'

export function GameCanvas() {
  const venueId = useGameStore((state) => state.venueId)

  return (
    <Canvas
      camera={{ position: [12, 10, 14], fov: 45, near: 0.1, far: 260 }}
      dpr={[1, getMaxCanvasDpr()]}
      shadows
      gl={{ antialias: getEnableAntialias(), powerPreference: 'high-performance' }}
    >
      <GameScene venueId={venueId} />
    </Canvas>
  )
}
