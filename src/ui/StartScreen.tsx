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
    <div className="pointer-events-auto absolute inset-0 z-40 overflow-y-auto bg-neutral-950/80 p-4 backdrop-blur-sm max-md:flex max-md:items-center max-md:justify-center max-md:p-3 max-md:py-[max(0.5rem,env(safe-area-inset-top))] md:grid md:place-items-center md:p-6">
      <section className="grid w-full max-w-4xl gap-6 rounded-[2rem] border border-white/15 bg-neutral-50 p-5 text-neutral-950 shadow-2xl max-md:max-h-[calc(100dvh-1rem)] max-md:max-w-none max-md:gap-3 max-md:rounded-3xl max-md:p-3 md:grid-cols-[auto_1fr] md:p-8">
        <div className="max-md:hidden">
          <TargetPreview meebitNumber={targetNpc.meebitNumber} sizeClassName="h-40 w-40" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500 max-md:text-[0.6rem] max-md:tracking-[0.25em]">
            Meebits Museum Hunt
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight max-md:mt-1 max-md:text-xl md:text-5xl">
            Find the Meebit
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-600 max-md:mt-1.5 max-md:text-xs max-md:leading-snug">
            <span className="md:hidden">
              Stage 1: {INITIAL_NPC_COUNT} Meebits · 3 min limit · up to {MAX_NPC_COUNT}
            </span>
            <span className="max-md:hidden">
              Stage 1 starts with {INITIAL_NPC_COUNT} Meebits. Each clear adds {NPC_COUNT_INCREMENT} more,
              up to {MAX_NPC_COUNT} for full conquest. You have 3 minutes per stage.
            </span>
          </p>

          <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4 max-md:mt-2 max-md:p-2.5">
            <div className="flex items-center gap-3">
              <TargetPreview
                meebitNumber={targetNpc.meebitNumber}
                modelScale={1}
                sizeClassName="h-20 w-20 shrink-0 md:hidden"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-500 max-md:text-xs">Stage 1 Target</p>
                <p className="text-3xl font-black max-md:text-xl">Meebit #{targetNpc.meebitNumber}</p>
                <p className="mt-1 text-xs font-medium text-neutral-500 max-md:mt-0 max-md:text-[0.65rem]">
                  {activeNpcCount} Meebits in the museum
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950 max-md:px-2.5 max-md:py-1 max-md:text-[0.6rem]"
                onClick={rerollTarget}
              >
                Random
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4 max-md:mt-2 max-md:p-2.5">
            <div className="flex items-center gap-3">
              <TargetPreview
                meebitNumber={playerMeebitNumber}
                modelScale={1}
                sizeClassName="h-20 w-20 shrink-0"
              />
              <label className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-neutral-500 max-md:text-xs">Your Meebit</span>
                  <button
                    type="button"
                    className="shrink-0 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950 max-md:px-2.5 max-md:py-1 max-md:text-[0.6rem]"
                    onClick={() => setPlayerMeebitInput(String(getRandomMeebitNumber()))}
                  >
                    Random
                  </button>
                </div>
                <input
                  className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xl font-black outline-none transition focus:border-neutral-950 max-md:py-1.5 max-md:text-lg"
                  inputMode="numeric"
                  max={20000}
                  min={1}
                  type="number"
                  value={playerMeebitInput}
                  onChange={(event) => setPlayerMeebitInput(event.target.value)}
                />
                <span className="mt-1 block text-xs font-medium text-neutral-500 max-md:text-[0.65rem]">
                  #{DEFAULT_PLAYER_MEEBIT_ID} default · 1–20000
                </span>
              </label>
            </div>
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-neutral-700 max-md:mt-2.5 max-md:py-3 max-md:text-xs"
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
