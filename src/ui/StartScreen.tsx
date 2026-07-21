import { useEffect, useState } from 'react'
import { ui } from '../i18n/ui'
import { DEFAULT_PLAYER_MEEBIT_ID, PLAYER_START_POSITION } from '../game/gameConfig'
import { getSavedPlayerMeebitNumber, normalizePlayerMeebitNumber } from '../systems/save/localStorage'
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
import { getNpcById } from '../npc/npcData'
import { isAfterHoursUnlocked } from '../systems/save/unlockProgress'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { getMuseumSeason } from '../world/museumSeason'
import { getCachedAppEdition } from '../game/appEdition'
import { questIgnoresColorAndPattern, formatTraitDisplayName } from '../game/traitHunt'
import { LanguageSwitcher } from './LanguageSwitcher'
import { START_SCREEN_TARGET_PREVIEW_PRIORITY } from './targetPreviewCache'
import { TargetPreview } from './TargetPreview'
import { TraitQuestVisual } from './TraitQuestVisual'
import { playSfx, unlockAudioIfNeeded } from './sfx'

export function StartScreen() {
  const [playerMeebitInput, setPlayerMeebitInput] = useState(() =>
    String(getSavedPlayerMeebitNumber()),
  )
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
  const playerMeebitNumber = usePlayerStore((state) => state.meebitNumber)
  const isClubVenue = venueId === 'club'
  const isTraitHunt = getCachedAppEdition() === 'v2'
  const quest = currentStep?.quest
  const showSummerVer = !isClubVenue && !isTraitHunt && getMuseumSeason() === 'summer'
  const t = ui()

  useEffect(() => {
    if (gamePhase !== 'intro') {
      return
    }

    setPlayerMeebitInput(String(usePlayerStore.getState().meebitNumber))
  }, [gamePhase, venueId])

  useEffect(() => {
    if (gamePhase !== 'intro' || isTraitHunt) {
      return
    }

    setAfterHoursUnlocked(isAfterHoursUnlocked())
  }, [gamePhase, isTraitHunt])

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
      className={`pointer-events-auto absolute inset-0 z-40 overflow-y-auto backdrop-blur-sm max-lg:flex max-lg:items-center max-lg:justify-center max-lg:px-3 max-lg:pb-3 max-lg:pt-[calc(env(safe-area-inset-top)+3.25rem)] lg:grid lg:place-items-center lg:px-6 lg:pb-6 lg:pt-16 ${
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
          {quest ? (
            <TraitQuestVisual
              traitType={quest.traitType}
              traitValue={quest.traitValue}
              sizeClassName="h-40 w-40"
            />
          ) : (
            <TargetPreview
              capturePriority={START_SCREEN_TARGET_PREVIEW_PRIORITY}
              meebitNumber={firstTargetNpc.meebitNumber}
              sizeClassName="h-40 w-40"
            />
          )}
        </div>
        <div className="relative">
          <LanguageSwitcher
            className="absolute right-0 top-0 z-10"
            tone={isClubVenue ? 'dark' : 'light'}
          />
          <p
            className={`pr-24 text-xs font-semibold uppercase tracking-[0.35em] max-lg:pr-20 max-lg:text-[0.6rem] max-lg:tracking-[0.25em] ${
              isClubVenue
                ? 'text-fuchsia-300'
                : isTraitHunt
                  ? 'text-amber-700'
                  : showSummerVer
                    ? 'text-sky-600'
                    : 'text-neutral-500'
            }`}
          >
            {isClubVenue
              ? t.afterHours
              : isTraitHunt
                ? t.traitHuntPrototype
                : showSummerVer
                  ? t.summerVer
                  : t.museumHunt}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight max-lg:mt-1 max-lg:text-xl lg:text-5xl">
            {t.title}
          </h1>
          {showSummerVer ? (
            <p className="mt-1 text-sm font-semibold text-sky-700/80 max-lg:text-xs">
              {t.museumHunt}
            </p>
          ) : null}
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
              {t.gameMode}
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
              {quest ? (
                <TraitQuestVisual
                  traitType={quest.traitType}
                  traitValue={quest.traitValue}
                  sizeClassName="h-20 w-20 shrink-0 lg:hidden"
                />
              ) : (
                <TargetPreview
                  capturePriority={START_SCREEN_TARGET_PREVIEW_PRIORITY}
                  meebitNumber={firstTargetNpc.meebitNumber}
                  modelScale={1}
                  sizeClassName="h-20 w-20 shrink-0 lg:hidden"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold max-lg:text-xs ${isClubVenue ? 'text-fuchsia-200' : 'text-neutral-500'}`}>
                  {quest
                    ? t.traitHunt
                    : `${getStageLabel(currentStep)} ${currentStep.targetCount > 1 ? t.targets : t.target}`}
                </p>
                <p className="text-3xl font-black max-lg:text-xl">
                  {quest
                    ? t.findTraitLabel(
                        quest.findCount,
                        formatTraitDisplayName(quest.traitType, quest.traitValue),
                      )
                    : `Meebit #${firstTargetNpc.meebitNumber}`}
                </p>
                <p
                  className={`mt-1 text-xs font-medium max-lg:mt-0 max-lg:text-[0.65rem] ${
                    isClubVenue ? 'text-neutral-400' : 'text-neutral-500'
                  }`}
                >
                  {t.meebitsInVenue(activeNpcCount, isClubVenue ? t.club : t.museum)}
                </p>
                {quest && questIgnoresColorAndPattern(quest) ? (
                  <p
                    className={`mt-1 text-xs font-semibold max-lg:text-[0.65rem] ${
                      isClubVenue ? 'text-amber-200/90' : 'text-amber-700'
                    }`}
                  >
                    {t.traitIgnoreColor}
                  </p>
                ) : null}
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
                {t.random}
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
                    {t.yourMeebit}
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
                      const next = getRandomMeebitNumber()
                      setPlayerMeebitInput(String(next))
                      usePlayerStore.getState().setMeebitNumber(next)
                    }}
                  >
                    {t.random}
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
                  {t.defaultMeebitRange(DEFAULT_PLAYER_MEEBIT_ID)}
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
            {t.startVenue(isClubVenue ? t.afterHours : t.museum)}
          </button>

          {isClubVenue ? (
            <button
              type="button"
              className="mt-3 w-full rounded-full border border-fuchsia-400/35 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-fuchsia-100 transition hover:border-fuchsia-300 hover:text-white max-lg:py-2.5"
              onClick={handleBackToMuseum}
            >
              {t.backToMuseum}
            </button>
          ) : !isTraitHunt && afterHoursUnlocked ? (
            <button
              type="button"
              className="after-hours-enter-pulse mt-3 w-full rounded-full border-2 border-violet-700 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-violet-700 px-6 py-3.5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-violet-600/40 transition hover:from-violet-600 hover:via-fuchsia-500 hover:to-violet-600 max-lg:py-3 max-lg:text-xs"
              onClick={handleEnterAfterHours}
            >
              {t.enterAfterHours}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function normalizeMeebitNumber(value: string) {
  return normalizePlayerMeebitNumber(value)
}

function getRandomMeebitNumber() {
  return Math.floor(Math.random() * 20000) + 1
}
