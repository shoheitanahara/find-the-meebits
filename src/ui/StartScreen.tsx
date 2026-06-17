import { useEffect, useState } from 'react'
import { INITIAL_NPC_COUNT, MAX_NPC_COUNT, NPC_COUNT_INCREMENT, PLAYER_START_POSITION } from '../game/gameConfig'
import { DEFAULT_PLAYER_MEEBIT_ID } from '../game/gameConfig'
import { getNpcById } from '../npc/npcData'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { TargetPreview } from './TargetPreview'

export function StartScreen() {
  const [playerMeebitInput, setPlayerMeebitInput] = useState(String(DEFAULT_PLAYER_MEEBIT_ID))
  const gamePhase = useGameStore((state) => state.gamePhase)
  const activeNpcCount = useGameStore((state) => state.activeNpcCount)
  const targetNpcId = useGameStore((state) => state.targetNpcId)
  const startGame = useGameStore((state) => state.startGame)
  const rerollTarget = useGameStore((state) => state.rerollTarget)
  const targetNpc = getNpcById(targetNpcId)
  const playerMeebitNumber = normalizeMeebitNumber(playerMeebitInput)

  useEffect(() => {
    if (gamePhase !== 'intro') {
      return
    }

    usePlayerStore.getState().setMeebitNumber(playerMeebitNumber)
  }, [gamePhase, playerMeebitNumber])

  if (gamePhase !== 'intro' || !targetNpc) {
    return null
  }

  const handleStart = () => {
    usePlayerStore.getState().setMeebitNumber(playerMeebitNumber)
    usePlayerStore
      .getState()
      .setPlayerTransform(
        [PLAYER_START_POSITION[0], PLAYER_START_POSITION[1], PLAYER_START_POSITION[2]],
        Math.PI,
      )
    usePlayerStore.getState().setMovementLocked(true)
    startGame()
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 overflow-y-auto bg-neutral-950/80 p-4 backdrop-blur-sm max-md:items-start max-md:py-[max(1rem,env(safe-area-inset-top))] md:grid md:place-items-center md:p-6">
      <section className="grid w-full max-w-4xl gap-6 rounded-[2rem] border border-white/15 bg-neutral-50 p-5 text-neutral-950 shadow-2xl max-md:max-w-lg max-md:p-4 md:grid-cols-[auto_1fr] md:p-8">
        <div className="mx-auto max-md:w-full">
          <TargetPreview meebitNumber={targetNpc.meebitNumber} sizeClassName="h-40 w-40 max-md:mx-auto max-md:h-36 max-md:w-full max-md:max-w-[12rem]" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
            Meebits Museum Hunt
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight max-md:text-2xl md:text-5xl">Find the Meebit</h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-600 max-md:text-sm">
            Stage 1 starts with {INITIAL_NPC_COUNT} Meebits. Each clear adds {NPC_COUNT_INCREMENT} more,
            up to {MAX_NPC_COUNT} for full conquest. You have 3 minutes per stage.
          </p>
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-neutral-500">Stage 1 Target</p>
                <p className="text-3xl font-black">Meebit #{targetNpc.meebitNumber}</p>
                <p className="mt-1 text-xs font-medium text-neutral-500">{activeNpcCount} Meebits in the museum</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
                onClick={rerollTarget}
              >
                Random
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-4 rounded-2xl border border-neutral-200 bg-white p-4 max-md:grid-cols-1 sm:grid-cols-[auto_1fr]">
            <TargetPreview
              meebitNumber={playerMeebitNumber}
              modelScale={1.05}
              sizeClassName="h-28 w-28 max-md:mx-auto"
            />
            <label className="block">
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm font-semibold text-neutral-500">Your Meebit Number</span>
                <button
                  type="button"
                  className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
                  onClick={() => setPlayerMeebitInput(String(getRandomMeebitNumber()))}
                >
                  Random
                </button>
              </div>
              <input
                className="mt-2 w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-2xl font-black outline-none transition focus:border-neutral-950"
                inputMode="numeric"
                max={20000}
                min={1}
                type="number"
                value={playerMeebitInput}
                onChange={(event) => setPlayerMeebitInput(event.target.value)}
              />
              <span className="mt-2 block text-xs font-medium text-neutral-500">
                Default is #{DEFAULT_PLAYER_MEEBIT_ID}. Valid range: 1-20000.
              </span>
            </label>
          </div>
          <button
            type="button"
            className="mt-6 w-full rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-neutral-700 max-md:py-4"
            onClick={handleStart}
          >
            Start
          </button>
        </div>
      </section>
    </div>
  )
}

function normalizeMeebitNumber(value: string) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return DEFAULT_PLAYER_MEEBIT_ID
  }

  return Math.max(1, Math.min(20000, Math.trunc(parsed)))
}

function getRandomMeebitNumber() {
  return Math.floor(Math.random() * 20000) + 1
}
