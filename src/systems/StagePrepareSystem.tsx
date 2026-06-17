import { useEffect } from 'react'
import { getStageVrmReadiness } from '../npc/vrmLodState'
import { useGameStore } from '../stores/gameStore'
import { useNpcStore } from '../stores/npcStore'
import { usePlayerStore } from '../stores/playerStore'

const PREPARE_TIMEOUT_MS = 12_000

export function StagePrepareSystem() {
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const game = useGameStore.getState()

      if (game.gamePhase !== 'preparing' || game.preparedAt === null) {
        return
      }

      const playerReady =
        game.playerModelStatus === 'ready' || game.playerModelStatus === 'error'
      const playerPosition = usePlayerStore.getState().position
      const npcPositions = useNpcStore.getState().npcPositions
      const npcReadiness = getStageVrmReadiness(playerPosition, game.npcProfiles, npcPositions)
      const timedOut = Date.now() - game.preparedAt >= PREPARE_TIMEOUT_MS

      if (playerReady && (npcReadiness.isReady || timedOut)) {
        useGameStore.getState().beginPlaying()
      }
    }, 150)

    return () => window.clearInterval(intervalId)
  }, [])

  return null
}

export function getPrepareProgress() {
  const game = useGameStore.getState()

  if (game.gamePhase !== 'preparing') {
    return null
  }

  const playerReady =
    game.playerModelStatus === 'ready' || game.playerModelStatus === 'error'
  const playerPosition = usePlayerStore.getState().position
  const npcPositions = useNpcStore.getState().npcPositions
  const npcReadiness = getStageVrmReadiness(playerPosition, game.npcProfiles, npcPositions)
  const npcProgress = npcReadiness.activeCount === 0 ? 0 : npcReadiness.ratio
  const nearProgress =
    npcReadiness.nearCount === 0 ? 1 : npcReadiness.nearReady / npcReadiness.nearCount
  const playerProgress = playerReady ? 1 : game.playerModelStatus === 'loading' ? 0.35 : 0
  const totalProgress = Math.round(((playerProgress + npcProgress + nearProgress) / 3) * 100)

  return {
    totalProgress,
    readyCount: npcReadiness.readyCount,
    activeCount: npcReadiness.activeCount,
    nearReady: npcReadiness.nearReady,
    nearCount: npcReadiness.nearCount,
    playerReady,
  }
}
