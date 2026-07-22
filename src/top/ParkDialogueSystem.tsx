import { useEffect } from 'react'
import { handleParkDialogueKeyDown } from './interactWithParkNpc'

/** パーク用: E で話しかける / 会話進行。 */
export function ParkDialogueSystem() {
  useEffect(() => {
    window.addEventListener('keydown', handleParkDialogueKeyDown)
    return () => window.removeEventListener('keydown', handleParkDialogueKeyDown)
  }, [])

  return null
}
