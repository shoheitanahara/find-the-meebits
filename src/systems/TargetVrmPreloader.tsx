import { useEffect } from 'react'
import { preloadVrm } from '../avatar/vrmInstancePool'
import { getNpcById } from '../npc/npcData'
import { useGameStore } from '../stores/gameStore'

const TARGET_PRELOAD_PRIORITY = -300

export function TargetVrmPreloader() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const targetNpcId = useGameStore((state) => state.targetNpcId)
  const targetNpc = getNpcById(targetNpcId)

  useEffect(() => {
    if (!targetNpc) {
      return
    }

    if (
      gamePhase === 'intro' ||
      gamePhase === 'preparing' ||
      gamePhase === 'playing' ||
      gamePhase === 'timedOut'
    ) {
      preloadVrm(targetNpc.meebitNumber, TARGET_PRELOAD_PRIORITY)
    }
  }, [gamePhase, targetNpc?.meebitNumber])

  return null
}
