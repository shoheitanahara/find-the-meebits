import { getNpcVrmAlwaysLoadDistance, getWarmupLoadDistance } from '../game/perfConfig'
import { useEffect, useState } from 'react'
import { isTimedGameMode } from '../game/gameMode'
import { getPrepareProgress } from '../systems/StagePrepareSystem'
import { useGameStore } from '../stores/gameStore'
import { getLoadingLabelForVenue } from './gameTips'

export function PrepareOverlay() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const gameMode = useGameStore((state) => state.gameMode)
  const venueId = useGameStore((state) => state.venueId)
  const tipsAcknowledged = useGameStore((state) => state.tipsAcknowledged)
  const [, setTick] = useState(0)

  useEffect(() => {
    if (gamePhase !== 'preparing') {
      return
    }

    const intervalId = window.setInterval(() => setTick((value) => value + 1), 120)
    return () => window.clearInterval(intervalId)
  }, [gamePhase])

  const progress = getPrepareProgress()

  if (gamePhase !== 'preparing' || !progress || !tipsAcknowledged) {
    return null
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-[45] grid place-items-center bg-neutral-950/55 p-4 backdrop-blur-[2px] max-lg:px-3">
      <section className="w-full max-w-md rounded-[2rem] border border-white/15 bg-neutral-950/90 px-6 py-6 text-center text-white shadow-2xl max-lg:px-5 max-lg:py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">Preparing Stage</p>
        <h2 className="mt-3 text-3xl font-black">{getLoadingLabelForVenue(venueId)}</h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">
          Nearby Meebits: {progress.nearReady}/{progress.nearCount} (within {getNpcVrmAlwaysLoadDistance()}m)
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          Preloading: {progress.readyCount}/{progress.activeCount} (within {getWarmupLoadDistance()}m)
        </p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-300"
            style={{ width: `${progress.totalProgress}%` }}
          />
        </div>
        <p className="mt-3 text-xs font-medium text-neutral-400">
          {isTimedGameMode(gameMode)
            ? 'The timer starts once avatars around you are ready.'
            : 'No time limit — explore freely once avatars around you are ready.'}
        </p>
      </section>
    </div>
  )
}
