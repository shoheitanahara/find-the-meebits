import { getShadowMapSize } from '../game/perfConfig'

export function Lighting() {
  const shadowMapSize = getShadowMapSize()

  return (
    <>
      <ambientLight intensity={0.82} />
      <hemisphereLight args={['#ffffff', '#d6d3d1', 0.9]} />
      <directionalLight
        castShadow
        intensity={1.45}
        position={[18, 24, 12]}
        shadow-bias={-0.0001}
        shadow-normalBias={0.025}
        shadow-camera-bottom={-90}
        shadow-camera-far={120}
        shadow-camera-left={-90}
        shadow-camera-near={1}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
      />
    </>
  )
}
