import type { VenueId } from '../game/venueConfig'
import { getVenueTheme, isMatchHallVenue } from '../game/venueConfig'
import { getFogDistances, isMobilePerfMode } from '../game/perfConfig'

type VenueAtmosphereProps = {
  venueId: VenueId
}

export function VenueAtmosphere({ venueId }: VenueAtmosphereProps) {
  const theme = getVenueTheme(venueId)
  const museumFog = getFogDistances()
  const useThemeFog = venueId === 'club' || isMatchHallVenue(venueId) || !isMobilePerfMode()
  const fogNear = useThemeFog ? theme.fogNear : museumFog.near
  const fogFar = useThemeFog ? theme.fogFar : museumFog.far

  return (
    <>
      <color attach="background" args={[theme.backgroundColor]} />
      <fog attach="fog" args={[theme.fogColor, fogNear, fogFar]} />
    </>
  )
}
