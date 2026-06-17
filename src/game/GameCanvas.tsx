import { Canvas } from '@react-three/fiber'
import { GameScene } from './GameScene'

export function GameCanvas() {
  return (
    <Canvas
      camera={{ position: [12, 10, 14], fov: 45, near: 0.1, far: 260 }}
      shadows
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      <GameScene />
    </Canvas>
  )
}
