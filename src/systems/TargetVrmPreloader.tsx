import { useEffect } from 'react'
import { TARGET_VRM_PRELOAD_PRIORITY } from '../game/perfConfig'
import { preloadVrm } from '../avatar/vrmInstancePool'
import { getNpcById } from '../npc/npcData'
import { useGameStore } from '../stores/gameStore'
import { requestTargetPreviews, TARGET_HUD_PREVIEW_PRIORITY } from '../ui/targetPreviewCache'

export function TargetVrmPreloader() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const targetNpcIds = useGameStore((state) => state.targetNpcIds)
  const targetMeebitNumbers = targetNpcIds
    .map((id) => getNpcById(id)?.meebitNumber)
    .filter((value): value is number => value !== undefined)

  useEffect(() => {
    if (targetMeebitNumbers.length === 0) {
      return
    }

    if (
      gamePhase === 'intro' ||
      gamePhase === 'preparing' ||
      gamePhase === 'playing' ||
      gamePhase === 'timedOut'
    ) {
      for (const meebitNumber of targetMeebitNumbers) {
        preloadVrm(meebitNumber, TARGET_VRM_PRELOAD_PRIORITY)
      }
      requestTargetPreviews(targetMeebitNumbers, TARGET_HUD_PREVIEW_PRIORITY)
    }
  }, [gamePhase, targetMeebitNumbers.join(',')])

  return null
}
