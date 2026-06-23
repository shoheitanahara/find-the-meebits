import type { VenueId } from '../game/venueConfig'
import { getShadowMapSize } from '../game/perfConfig'
import { getVenueTheme } from '../game/venueConfig'

type LightingProps = {
  venueId: VenueId
}

export function Lighting({ venueId }: LightingProps) {
  const theme = getVenueTheme(venueId)
  const shadowMapSize = getShadowMapSize()

  return (
    <>
      <ambientLight intensity={theme.ambientIntensity} />
      <hemisphereLight
        args={[theme.hemisphereSky, theme.hemisphereGround, theme.hemisphereIntensity]}
      />
      <directionalLight
        castShadow
        intensity={theme.directionalIntensity}
        position={theme.directionalPosition}
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
      {theme.pointLights.map((light, index) => (
        <pointLight
          key={`${index}-${light.color}-${light.position.join('-')}`}
          color={light.color}
          distance={light.distance}
          intensity={light.intensity}
          position={light.position}
        />
      ))}
    </>
  )
}
