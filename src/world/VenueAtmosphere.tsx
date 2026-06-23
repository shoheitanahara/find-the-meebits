import type { VenueId } from '../game/venueConfig'
import { getVenueTheme } from '../game/venueConfig'
import { getFogDistances, isMobilePerfMode } from '../game/perfConfig'

type VenueAtmosphereProps = {
  venueId: VenueId
}

export function VenueAtmosphere({ venueId }: VenueAtmosphereProps) {
  const theme = getVenueTheme(venueId)
  const museumFog = getFogDistances()
  const fogNear = venueId === 'club' || !isMobilePerfMode() ? theme.fogNear : museumFog.near
  const fogFar = venueId === 'club' || !isMobilePerfMode() ? theme.fogFar : museumFog.far

  return (
    <>
      <color attach="background" args={[theme.backgroundColor]} />
      <fog attach="fog" args={[theme.fogColor, fogNear, fogFar]} />
    </>
  )
}
