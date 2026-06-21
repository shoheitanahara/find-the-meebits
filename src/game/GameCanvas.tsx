import { Canvas } from '@react-three/fiber'
import { getEnableAntialias, getMaxCanvasDpr } from './perfConfig'
import { GameScene } from './GameScene'

export function GameCanvas() {
  return (
    <Canvas
      camera={{ position: [12, 10, 14], fov: 45, near: 0.1, far: 260 }}
      dpr={[1, getMaxCanvasDpr()]}
      shadows
      gl={{ antialias: getEnableAntialias(), powerPreference: 'high-performance' }}
    >
      <GameScene />
    </Canvas>
  )
}
