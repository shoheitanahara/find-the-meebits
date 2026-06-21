import { useEffect, useState } from 'react'
import { DEFAULT_PLAYER_MEEBIT_ID, PLAYER_START_POSITION } from '../game/gameConfig'
import { resetPlayerWorldState } from '../avatar/playerWorldState'
import {
  getGameModeDescription,
  getGameModeLabel,
} from '../game/gameMode'
import { getProgressionStep, getProgressionSummary, getStageDescription } from '../game/gameProgression'
import { getNpcById } from '../npc/npcData'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { TargetPreview } from './TargetPreview'
import { playSfx, unlockAudioIfNeeded } from './sfx'

export function StartScreen() {
  const [playerMeebitInput, setPlayerMeebitInput] = useState(String(DEFAULT_PLAYER_MEEBIT_ID))
  const gamePhase = useGameStore((state) => state.gamePhase)
  const gameMode = useGameStore((state) => state.gameMode)
  const setGameMode = useGameStore((state) => state.setGameMode)
  const activeNpcCount = useGameStore((state) => state.activeNpcCount)
  const targetNpcIds = useGameStore((state) => state.targetNpcIds)
  const startGame = useGameStore((state) => state.startGame)
  const rerollTargets = useGameStore((state) => state.rerollTargets)
  const firstTargetNpc = getNpcById(targetNpcIds[0] ?? '')
  const firstStep = getProgressionStep(0)
  const playerMeebitNumber = normalizeMeebitNumber(playerMeebitInput)

  useEffect(() => {
    if (gamePhase !== 'intro') {
      return
    }

    usePlayerStore.getState().setMeebitNumber(playerMeebitNumber)
  }, [gamePhase, playerMeebitNumber])

  if (gamePhase !== 'intro' || !firstTargetNpc || !firstStep) {
    return null
  }

  const handleStart = () => {
    unlockAudioIfNeeded()
    playSfx('uiConfirm')
    usePlayerStore.getState().setMeebitNumber(playerMeebitNumber)
    resetPlayerWorldState(
      [PLAYER_START_POSITION[0], PLAYER_START_POSITION[1], PLAYER_START_POSITION[2]],
      Math.PI,
    )
    usePlayerStore.getState().setMovementLocked(true)
    startGame()
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 overflow-y-auto bg-neutral-950/80 p-4 backdrop-blur-sm max-lg:flex max-lg:items-center max-lg:justify-center max-lg:p-3 max-lg:py-[max(0.5rem,env(safe-area-inset-top))] lg:grid lg:place-items-center lg:p-6">
      <section className="grid w-full max-w-4xl gap-6 rounded-[2rem] border border-white/15 bg-neutral-50 p-5 text-neutral-950 shadow-2xl max-lg:max-h-[calc(100dvh-1rem)] max-lg:max-w-none max-lg:gap-3 max-lg:rounded-3xl max-lg:p-3 lg:grid-cols-[auto_1fr] lg:p-8">
        <div className="max-lg:hidden">
          <TargetPreview meebitNumber={firstTargetNpc.meebitNumber} sizeClassName="h-40 w-40" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500 max-lg:text-[0.6rem] max-lg:tracking-[0.25em]">
            Meebits Museum Hunt
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight max-lg:mt-1 max-lg:text-xl lg:text-5xl">
            Find the Meebit
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-600 max-lg:mt-1.5 max-lg:text-xs max-lg:leading-snug">
            {getStageDescription(firstStep)} · {getProgressionSummary()}.
          </p>

          <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4 max-lg:mt-2 max-lg:p-2.5">
            <p className="text-sm font-semibold text-neutral-500 max-lg:text-xs">Game Mode</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['challenge', 'enjoy'] as const).map((mode) => {
                const isSelected = gameMode === mode

                return (
                  <button
                    key={mode}
                    type="button"
                    className={`rounded-xl border px-3 py-2.5 text-left transition max-lg:px-2.5 max-lg:py-2 ${
                      isSelected
                        ? 'border-neutral-950 bg-neutral-950 text-white'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                    }`}
                    onClick={() => {
                      unlockAudioIfNeeded()
                      playSfx('uiClick')
                      setGameMode(mode)
                    }}
                  >
                    <p className="text-sm font-black uppercase tracking-[0.12em] max-lg:text-xs">
                      {getGameModeLabel(mode)}
                    </p>
                    <p
                      className={`mt-1 text-xs leading-snug max-lg:text-[0.65rem] ${
                        isSelected ? 'text-neutral-300' : 'text-neutral-500'
                      }`}
                    >
                      {getGameModeDescription(mode)}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4 max-lg:mt-2 max-lg:p-2.5">
            <div className="flex items-center gap-3">
              <TargetPreview
                meebitNumber={firstTargetNpc.meebitNumber}
                modelScale={1}
                sizeClassName="h-20 w-20 shrink-0 lg:hidden"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-500 max-lg:text-xs">Stage 1 Target</p>
                <p className="text-3xl font-black max-lg:text-xl">Meebit #{firstTargetNpc.meebitNumber}</p>
                <p className="mt-1 text-xs font-medium text-neutral-500 max-lg:mt-0 max-lg:text-[0.65rem]">
                  {activeNpcCount} Meebits in the museum
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950 max-lg:px-2.5 max-lg:py-1 max-lg:text-[0.6rem]"
                onClick={() => {
                  unlockAudioIfNeeded()
                  playSfx('uiClick')
                  rerollTargets()
                }}
              >
                Random
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4 max-lg:mt-2 max-lg:p-2.5">
            <div className="flex items-center gap-3">
              <TargetPreview
                meebitNumber={playerMeebitNumber}
                modelScale={1}
                sizeClassName="h-20 w-20 shrink-0"
              />
              <label className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-neutral-500 max-lg:text-xs">Your Meebit</span>
                  <button
                    type="button"
                    className="shrink-0 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950 max-lg:px-2.5 max-lg:py-1 max-lg:text-[0.6rem]"
                    onClick={() => {
                      unlockAudioIfNeeded()
                      playSfx('uiClick')
                      setPlayerMeebitInput(String(getRandomMeebitNumber()))
                    }}
                  >
                    Random
                  </button>
                </div>
                <input
                  className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xl font-black outline-none transition focus:border-neutral-950 max-lg:py-1.5 max-lg:text-lg"
                  inputMode="numeric"
                  max={20000}
                  min={1}
                  type="number"
                  value={playerMeebitInput}
                  onChange={(event) => setPlayerMeebitInput(event.target.value)}
                />
                <span className="mt-1 block text-xs font-medium text-neutral-500 max-lg:text-[0.65rem]">
                  #{DEFAULT_PLAYER_MEEBIT_ID} default · 1–20000
                </span>
              </label>
            </div>
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-neutral-700 max-lg:mt-2.5 max-lg:py-3 max-lg:text-xs"
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
