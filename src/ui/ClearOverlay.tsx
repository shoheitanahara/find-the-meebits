import { useEffect } from 'react'
import { MAX_NPC_COUNT, PLAYER_START_POSITION } from '../game/gameConfig'
import { getNpcById } from '../npc/npcData'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { TargetPreview } from './TargetPreview'

export function ClearOverlay() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const clearedNpcId = useGameStore((state) => state.clearedNpcId)
  const clearTimeSeconds = useGameStore((state) => state.clearTimeSeconds)
  const stage = useGameStore((state) => state.stage)
  const activeNpcCount = useGameStore((state) => state.activeNpcCount)
  const continueToNextStage = useGameStore((state) => state.continueToNextStage)
  const resetGame = useGameStore((state) => state.resetGame)
  const clearedNpc = clearedNpcId ? getNpcById(clearedNpcId) : null
  const isVisible = gamePhase === 'cleared' || gamePhase === 'conquered'
  const isConquered = gamePhase === 'conquered'

  const handleContinue = () => {
    usePlayerStore
      .getState()
      .setPlayerTransform(
        [PLAYER_START_POSITION[0], PLAYER_START_POSITION[1], PLAYER_START_POSITION[2]],
        Math.PI,
      )
    usePlayerStore.getState().setMovementLocked(false)

    if (isConquered) {
      resetGame()
      return
    }

    continueToNextStage()
  }

  useEffect(() => {
    if (!isVisible) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Enter') return
      if (event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      event.preventDefault()
      handleContinue()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isVisible, isConquered, continueToNextStage, resetGame])

  if (!isVisible) {
    return null
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 grid place-items-center bg-neutral-950/75 p-6 backdrop-blur-sm">
      <section className="grid max-w-2xl gap-6 rounded-[2rem] border border-white/15 bg-white p-6 text-neutral-950 shadow-2xl sm:grid-cols-[auto_1fr] sm:p-8">
        {clearedNpc ? (
          <TargetPreview
            meebitNumber={clearedNpc.meebitNumber}
            modelScale={1.14}
            sizeClassName="h-48 w-48"
          />
        ) : null}
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
            {isConquered ? 'Full Conquest' : 'Stage Clear'}
          </p>
          <h2 className="mt-3 text-4xl font-black">
            {isConquered ? 'You conquered the museum.' : 'You found it.'}
          </h2>
          <p className="mt-4 text-lg font-bold">Meebit #{clearedNpc?.meebitNumber ?? '????'}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Clear Time</p>
              <p className="mt-1 text-2xl font-black">{formatClearTime(clearTimeSeconds)}</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">Stage</p>
              <p className="mt-1 text-2xl font-black">{isConquered ? 'MAX' : stage}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            {isConquered
              ? `You cleared the final stage with ${MAX_NPC_COUNT} Meebits wandering the museum.`
              : `Next stage: ${activeNpcCount} Meebits. The museum gets denser every clear.`}
          </p>
          <button
            type="button"
            className="mt-6 rounded-full bg-neutral-950 px-6 py-3 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-neutral-700"
            onClick={handleContinue}
          >
            {isConquered ? 'Back to Title' : 'Next Stage'}
          </button>
        </div>
      </section>
    </div>
  )
}

function formatClearTime(seconds: number | null) {
  if (seconds === null) {
    return '--:--'
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  const centiseconds = Math.floor((seconds % 1) * 100)

  if (minutes === 0) {
    return `${remainingSeconds}.${String(centiseconds).padStart(2, '0')}s`
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}
