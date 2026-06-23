import { useEffect } from 'react'
import type { VenueId } from '../game/venueConfig'
import { preloadVrmSculpturesForVenue } from './vrmSculptureCache'

type VrmSculpturePreloaderProps = {
  venueId?: VenueId
}

export function VrmSculpturePreloader({ venueId = 'museum' }: VrmSculpturePreloaderProps) {
  useEffect(() => {
    preloadVrmSculpturesForVenue(venueId)
  }, [venueId])

  return null
}
