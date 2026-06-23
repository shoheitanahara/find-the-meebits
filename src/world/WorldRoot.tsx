import type { VenueId } from '../game/venueConfig'
import { ClubWorld } from './ClubWorld'
import { MuseumWorld } from './MuseumWorld'

type WorldRootProps = {
  venueId: VenueId
}

export function WorldRoot({ venueId }: WorldRootProps) {
  return venueId === 'club' ? <ClubWorld /> : <MuseumWorld />
}
