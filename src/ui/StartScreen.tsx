import { useEffect, useState } from 'react'
import { DEFAULT_PLAYER_MEEBIT_ID, PLAYER_START_POSITION } from '../game/gameConfig'
import { resetPlayerWorldState } from '../avatar/playerWorldState'
import {
  getGameModeDescription,
  getGameModeLabel,
} from '../game/gameMode'
import {
  getProgressionStep,
  getProgressionSummary,
  getStageDescription,
  getStageLabel,
} from '../game/gameProgression'
import { getVenueLabel } from '../game/venueConfig'
import { getNpcById } from '../npc/npcData'
import { isAfterHoursUnlocked } from '../systems/save/unlockProgress'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { TargetPreview } from './TargetPreview'
import { playSfx, unlockAudioIfNeeded } from './sfx'

export function StartScreen() {
  const [playerMeebitInput, setPlayerMeebitInput] = useState(String(DEFAULT_PLAYER_MEEBIT_ID))
  const [afterHoursUnlocked, setAfterHoursUnlocked] = useState(false)
  const gamePhase = useGameStore((state) => state.gamePhase)
  const gameMode = useGameStore((state) => state.gameMode)
  const venueId = useGameStore((state) => state.venueId)
  const setGameMode = useGameStore((state) => state.setGameMode)
  const progressionIndex = useGameStore((state) => state.progressionIndex)
  const activeNpcCount = useGameStore((state) => state.activeNpcCount)
  const targetNpcIds = useGameStore((state) => state.targetNpcIds)
  const startGame = useGameStore((state) => state.startGame)
  const startAfterHours = useGameStore((state) => state.startAfterHours)
  const resetGame = useGameStore((state) => state.resetGame)
  const rerollTargets = useGameStore((state) => state.rerollTargets)
  const firstTargetNpc = getNpcById(targetNpcIds[0] ?? '')
  const currentStep = getProgressionStep(progressionIndex, venueId)
  const playerMeebitNumber = normalizeMeebitNumber(playerMeebitInput)
  const isClubVenue = venueId === 'club'

  useEffect(() => {
    if (gamePhase !== 'intro') {
      return
    }

    setPlayerMeebitInput(String(usePlayerStore.getState().meebitNumber))
  }, [gamePhase, venueId])

  useEffect(() => {
    if (gamePhase !== 'intro') {
      return
    }

    setAfterHoursUnlocked(isAfterHoursUnlocked())
  }, [gamePhase])

  if (gamePhase !== 'intro' || !firstTargetNpc || !currentStep) {
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

  const handleEnterAfterHours = () => {
    unlockAudioIfNeeded()
    playSfx('uiConfirm')
    usePlayerStore.getState().setMeebitNumber(playerMeebitNumber)
    startAfterHours()
  }

  const handleBackToMuseum = () => {
    unlockAudioIfNeeded()
    playSfx('uiClick')
    resetGame()
  }

  return (
    <div
      className={`pointer-events-auto absolute inset-0 z-40 overflow-y-auto p-4 backdrop-blur-sm max-lg:flex max-lg:items-center max-lg:justify-center max-lg:p-3 max-lg:py-[max(0.5rem,env(safe-area-inset-top))] lg:grid lg:place-items-center lg:p-6 ${
        isClubVenue ? 'bg-violet-950/85' : 'bg-neutral-950/80'
      }`}
    >
      <section
        className={`grid w-full max-w-4xl gap-6 rounded-[2rem] border p-5 shadow-2xl max-lg:max-h-[calc(100dvh-1rem)] max-lg:max-w-none max-lg:gap-3 max-lg:rounded-3xl max-lg:p-3 lg:grid-cols-[auto_1fr] lg:p-8 ${
          isClubVenue
            ? 'border-fuchsia-400/40 bg-neutral-950 text-white'
            : 'border-white/15 bg-neutral-50 text-neutral-950'
        }`}
      >
        <div className="max-lg:hidden">
          <TargetPreview meebitNumber={firstTargetNpc.meebitNumber} sizeClassName="h-40 w-40" />
        </div>
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.35em] max-lg:text-[0.6rem] max-lg:tracking-[0.25em] ${
              isClubVenue ? 'text-fuchsia-300' : 'text-neutral-500'
            }`}
          >
            {isClubVenue ? 'After Hours' : 'Meebits Museum Hunt'}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight max-lg:mt-1 max-lg:text-xl lg:text-5xl">
            {isClubVenue ? 'Find them in the dark.' : 'Find the Meebit'}
          </h1>
          <p
            className={`mt-4 text-base leading-relaxed max-lg:mt-1.5 max-lg:text-xs max-lg:leading-snug ${
              isClubVenue ? 'text-neutral-300' : 'text-neutral-600'
            }`}
          >
            {getStageDescription(currentStep)} · {getProgressionSummary(venueId)}.
          </p>

          <div
            className={`mt-5 rounded-2xl border p-4 max-lg:mt-2 max-lg:p-2.5 ${
              isClubVenue ? 'border-fuchsia-400/30 bg-violet-950/50' : 'border-neutral-200 bg-white'
            }`}
          >
            <p className={`text-sm font-semibold max-lg:text-xs ${isClubVenue ? 'text-fuchsia-200' : 'text-neutral-500'}`}>
              Game Mode
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['challenge', 'enjoy'] as const).map((mode) => {
                const isSelected = gameMode === mode

                return (
                  <button
                    key={mode}
                    type="button"
                    className={`rounded-xl border px-3 py-2.5 text-left transition max-lg:px-2.5 max-lg:py-2 ${
                      isSelected
                        ? isClubVenue
                          ? 'border-fuchsia-300 bg-fuchsia-500 text-white'
                          : 'border-neutral-950 bg-neutral-950 text-white'
                        : isClubVenue
                          ? 'border-fuchsia-400/25 bg-neutral-950 text-neutral-300 hover:border-fuchsia-300'
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
                        isSelected
                          ? isClubVenue
                            ? 'text-fuchsia-100'
                            : 'text-neutral-300'
                          : isClubVenue
                            ? 'text-neutral-400'
                            : 'text-neutral-500'
                      }`}
                    >
                      {getGameModeDescription(mode)}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div
            className={`mt-5 rounded-2xl border p-4 max-lg:mt-2 max-lg:p-2.5 ${
              isClubVenue ? 'border-fuchsia-400/30 bg-violet-950/50' : 'border-neutral-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <TargetPreview
                meebitNumber={firstTargetNpc.meebitNumber}
                modelScale={1}
                sizeClassName="h-20 w-20 shrink-0 lg:hidden"
              />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold max-lg:text-xs ${isClubVenue ? 'text-fuchsia-200' : 'text-neutral-500'}`}>
                  {getStageLabel(currentStep)} Target{currentStep.targetCount > 1 ? 's' : ''}
                </p>
                <p className="text-3xl font-black max-lg:text-xl">Meebit #{firstTargetNpc.meebitNumber}</p>
                <p
                  className={`mt-1 text-xs font-medium max-lg:mt-0 max-lg:text-[0.65rem] ${
                    isClubVenue ? 'text-neutral-400' : 'text-neutral-500'
                  }`}
                >
                  {activeNpcCount} Meebits in the {isClubVenue ? 'club' : 'museum'}
                </p>
              </div>
              <button
                type="button"
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] transition max-lg:px-2.5 max-lg:py-1 max-lg:text-[0.6rem] ${
                  isClubVenue
                    ? 'border-fuchsia-400/40 text-fuchsia-100 hover:border-fuchsia-300 hover:text-white'
                    : 'border-neutral-300 text-neutral-700 hover:border-neutral-950 hover:text-neutral-950'
                }`}
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

          <div
            className={`mt-5 rounded-2xl border p-4 max-lg:mt-2 max-lg:p-2.5 ${
              isClubVenue ? 'border-fuchsia-400/30 bg-violet-950/50' : 'border-neutral-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <TargetPreview
                meebitNumber={playerMeebitNumber}
                modelScale={1}
                sizeClassName="h-20 w-20 shrink-0"
              />
              <label className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-semibold max-lg:text-xs ${isClubVenue ? 'text-fuchsia-200' : 'text-neutral-500'}`}>
                    Your Meebit
                  </span>
                  <button
                    type="button"
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] transition max-lg:px-2.5 max-lg:py-1 max-lg:text-[0.6rem] ${
                      isClubVenue
                        ? 'border-fuchsia-400/40 text-fuchsia-100 hover:border-fuchsia-300 hover:text-white'
                        : 'border-neutral-300 text-neutral-700 hover:border-neutral-950 hover:text-neutral-950'
                    }`}
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
                  className={`mt-1.5 w-full rounded-xl border px-3 py-2 text-xl font-black outline-none transition max-lg:py-1.5 max-lg:text-lg ${
                    isClubVenue
                      ? 'border-fuchsia-400/30 bg-neutral-950 text-white focus:border-fuchsia-300'
                      : 'border-neutral-300 bg-neutral-50 focus:border-neutral-950'
                  }`}
                  inputMode="numeric"
                  max={20000}
                  min={1}
                  type="number"
                  value={playerMeebitInput}
                  onChange={(event) => {
                    const next = event.target.value
                    setPlayerMeebitInput(next)
                    usePlayerStore.getState().setMeebitNumber(normalizeMeebitNumber(next))
                  }}
                />
                <span
                  className={`mt-1 block text-xs font-medium max-lg:text-[0.65rem] ${
                    isClubVenue ? 'text-neutral-400' : 'text-neutral-500'
                  }`}
                >
                  #{DEFAULT_PLAYER_MEEBIT_ID} default · 1–20000
                </span>
              </label>
            </div>
          </div>

          <button
            type="button"
            className={`mt-6 w-full rounded-full px-6 py-3.5 text-sm font-black uppercase tracking-[0.25em] transition max-lg:mt-2.5 max-lg:py-3 max-lg:text-xs ${
              isClubVenue
                ? 'bg-fuchsia-500 text-white hover:bg-fuchsia-400'
                : 'bg-neutral-950 text-white hover:bg-neutral-700'
            }`}
            onClick={handleStart}
          >
            Start {getVenueLabel(venueId)}
          </button>

          {isClubVenue ? (
            <button
              type="button"
              className="mt-3 w-full rounded-full border border-fuchsia-400/35 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-fuchsia-100 transition hover:border-fuchsia-300 hover:text-white max-lg:py-2.5"
              onClick={handleBackToMuseum}
            >
              Back to Museum
            </button>
          ) : afterHoursUnlocked ? (
            <button
              type="button"
              className="after-hours-enter-pulse mt-3 w-full rounded-full border border-violet-400/40 bg-violet-950/40 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-violet-100 transition hover:border-violet-300 hover:bg-violet-900/50 max-lg:py-2.5"
              onClick={handleEnterAfterHours}
            >
              Enter After Hours
            </button>
          ) : null}
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
