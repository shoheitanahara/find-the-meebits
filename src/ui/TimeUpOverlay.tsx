import { useEffect } from 'react'
import { PLAYER_START_POSITION } from '../game/gameConfig'
import { getNpcById } from '../npc/npcData'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { TargetPreview } from './TargetPreview'

export function TimeUpOverlay() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const stage = useGameStore((state) => state.stage)
  const activeNpcCount = useGameStore((state) => state.activeNpcCount)
  const targetNpcId = useGameStore((state) => state.targetNpcId)
  const retryStage = useGameStore((state) => state.retryStage)
  const resetGame = useGameStore((state) => state.resetGame)
  const targetNpc = getNpcById(targetNpcId)

  if (gamePhase !== 'timedOut' || !targetNpc) {
    return null
  }

  const handleRetry = () => {
    usePlayerStore
      .getState()
      .setPlayerTransform(
        [PLAYER_START_POSITION[0], PLAYER_START_POSITION[1], PLAYER_START_POSITION[2]],
        Math.PI,
      )
    usePlayerStore.getState().setMovementLocked(false)
    retryStage()
  }

  const handleBackToTitle = () => {
    resetGame()
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Enter') return
      if (event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      event.preventDefault()
      handleRetry()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex justify-center p-4 sm:p-6">
      <section className="pointer-events-auto grid w-full max-w-3xl gap-5 rounded-[2rem] border border-amber-300/35 bg-neutral-950/92 p-5 text-white shadow-2xl backdrop-blur-md sm:grid-cols-[auto_1fr] sm:p-6">
        <TargetPreview
          meebitNumber={targetNpc.meebitNumber}
          modelScale={1.12}
          sizeClassName="h-40 w-40"
        />
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300/90">Time Up</p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">Answer reveal</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-300">
            Stage {stage} with {activeNpcCount} Meebits. The correct avatar is{' '}
            <span className="font-black text-amber-200">Meebit #{targetNpc.meebitNumber}</span> and
            glows gold in the gallery. Keep moving with WASD to find them.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
            <button
              type="button"
              className="rounded-full bg-amber-400 px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-neutral-950 transition hover:bg-amber-300"
              onClick={handleRetry}
            >
              Retry Stage
            </button>
            <button
              type="button"
              className="rounded-full border border-white/25 px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
              onClick={handleBackToTitle}
            >
              Title
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
