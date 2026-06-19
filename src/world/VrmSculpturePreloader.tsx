import { useEffect } from 'react'
import { preloadVrmSculptures } from './vrmSculptureCache'

export function VrmSculpturePreloader() {
  useEffect(() => {
    preloadVrmSculptures()
  }, [])

  return null
}
