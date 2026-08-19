import { useEffect, useState } from 'react'
import { getLocale } from '../../i18n/locale'
import { getClimbTheme } from '../climbTheme'
import { MOUNTAIN_STAGE_COUNT, MOUNTAIN_STAGES } from '../config'
import { useMountainStore } from '../store'
import {
  PHONE_LAND_OVERLAY_CARD,
  PHONE_LAND_OVERLAY_FRAME,
  PHONE_LAND_OVERLAY_TITLE,
} from '../../ui/phoneLandscape'

export function TitleScreen() {
  const phase = useMountainStore((state) => state.phase)
  const unlockedStage = useMountainStore((state) => state.unlockedStage)
  const heightBest = useMountainStore((state) => state.heightBest)
  const start = useMountainStore((state) => state.start)
  const unlockThroughStage = useMountainStore((state) => state.unlockThroughStage)
  const [selected, setSelected] = useState(() => unlockedStage)
  const locale = getLocale()
  const theme = getClimbTheme()
  const isDev = import.meta.env.DEV
  const isNeon = theme.id === 'neon'

  useEffect(() => {
    setSelected((prev) => Math.min(prev, unlockedStage) || unlockedStage)
  }, [unlockedStage])

  if (phase !== 'title') return null

  const playStage = Math.min(Math.max(1, selected), unlockedStage)
  const brand = theme.brand[locale]
  const accentBtn = isNeon
    ? 'bg-fuchsia-400 text-[#12081c] hover:bg-cyan-300'
    : 'bg-white text-[#0c1520] hover:bg-sky-50'
  const panelBorder = isNeon ? 'border-fuchsia-400/40' : 'border-white/30'
  const panelBg = isNeon ? 'bg-[#0a0614]/88' : 'bg-[#0c1520]/75'
  const eyebrowColor = isNeon ? 'text-cyan-300/90' : 'text-sky-200/90'

  return (
    <div className={`pointer-events-auto absolute inset-0 z-40 flex items-center justify-center px-4 ${theme.titleGradient} ${PHONE_LAND_OVERLAY_FRAME}`}>
      <section className={`w-full max-w-md rounded-3xl border ${panelBorder} ${panelBg} p-6 text-white shadow-2xl backdrop-blur-md ${PHONE_LAND_OVERLAY_CARD}`}>
        <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${eyebrowColor}`}>
          {theme.eyebrow[locale]}
        </p>
        <h1 className={`mt-2 text-3xl font-black tracking-tight sm:text-4xl ${PHONE_LAND_OVERLAY_TITLE}`}>{brand}</h1>
        <p className="mt-4 text-base font-bold leading-snug text-white sm:text-lg phone-land:mt-1 phone-land:text-sm">{theme.tagline[locale]}</p>
        <p className="mt-3 text-xs leading-relaxed text-white/55 phone-land:hidden">{theme.dailyNote[locale]}</p>
        <p className="mt-3 text-[0.7rem] text-white/45 phone-land:hidden">
          {locale === 'ja'
            ? 'WASD — 移動（カメラ追従）· Space — ジャンプ · Shift — ダッシュ'
            : 'WASD — Move (camera follows) · Space — Jump · Shift — Dash'}
        </p>
        {heightBest > 0 ? (
          <p className={`mt-3 text-sm tabular-nums ${isNeon ? 'text-cyan-200/90' : 'text-amber-200/90'}`}>
            {locale === 'ja' ? '最高到達' : 'Best'}{' '}
            <span className="font-mono font-bold">{heightBest.toFixed(0)}m</span>
          </p>
        ) : null}

        {isDev ? (
          <div className="mt-3 flex flex-wrap gap-2 phone-land:hidden">
            <button
              type="button"
              className="rounded-full border border-amber-300/50 bg-amber-400/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-amber-100"
              onClick={() => {
                unlockThroughStage(MOUNTAIN_STAGE_COUNT)
                setSelected(MOUNTAIN_STAGE_COUNT)
              }}
            >
              DEV · Unlock all
            </button>
            <button
              type="button"
              className="rounded-full border border-amber-300/50 bg-amber-400/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-amber-100"
              onClick={() => {
                unlockThroughStage(MOUNTAIN_STAGE_COUNT)
                start(20)
              }}
            >
              DEV · Stage 20
            </button>
          </div>
        ) : null}

        <div className="mt-5">
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/50">
            {locale === 'ja' ? 'ステージ' : 'Stage'}
          </p>
          <div className="grid grid-cols-5 gap-1.5 phone-land:grid-cols-10">
            {MOUNTAIN_STAGES.map((stage) => {
              const locked = stage.id > unlockedStage
              const active = stage.id === playStage
              return (
                <button
                  key={stage.id}
                  type="button"
                  disabled={locked}
                  onClick={() => setSelected(stage.id)}
                  className={`rounded-lg px-1 py-2 text-center text-xs font-bold transition ${
                    locked
                      ? 'cursor-not-allowed bg-white/5 text-white/25'
                      : active
                        ? isNeon
                          ? 'bg-cyan-300 text-[#12081c]'
                          : 'bg-white text-[#0c1520]'
                        : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {stage.id}
                  <span className="mt-0.5 block text-[0.55rem] font-medium opacity-70">
                    {stage.labelBaseM}m
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          className={`mt-6 w-full rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.16em] transition active:scale-[0.99] phone-land:mt-3 phone-land:py-2.5 ${accentBtn}`}
          onClick={() => start(playStage)}
        >
          {playStage === 1
            ? locale === 'ja'
              ? 'さあ、登ろう！'
              : 'Start Climbing!'
            : locale === 'ja'
              ? `ステージ ${playStage} へ！`
              : `Stage ${playStage} — Go!`}
        </button>
      </section>
    </div>
  )
}

export function ClearOverlay() {
  const phase = useMountainStore((state) => state.phase)
  const currentStage = useMountainStore((state) => state.currentStage)
  const elapsedSec = useMountainStore((state) => state.elapsedSec)
  const heightBest = useMountainStore((state) => state.heightBest)
  const backToTitle = useMountainStore((state) => state.backToTitle)
  const retryStage = useMountainStore((state) => state.retryStage)
  const continueToNextStage = useMountainStore((state) => state.continueToNextStage)
  const locale = getLocale()
  const isNeon = getClimbTheme().id === 'neon'

  if (phase !== 'stageCleared' && phase !== 'allCleared') return null

  const minutes = Math.floor(elapsedSec / 60)
  const seconds = Math.floor(elapsedSec % 60)
  const timeLabel = `${minutes}:${String(seconds).padStart(2, '0')}`
  const isAllClear = phase === 'allCleared'

  return (
    <div className={`pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm ${PHONE_LAND_OVERLAY_FRAME}`}>
      <section
        className={`w-full max-w-md rounded-3xl border p-6 text-center text-white shadow-2xl ${PHONE_LAND_OVERLAY_CARD} ${
          isNeon
            ? 'border-fuchsia-300/40 bg-[#10081c]/92'
            : 'border-amber-200/40 bg-[#101820]/92'
        }`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-[0.28em] ${
            isNeon ? 'text-cyan-200' : 'text-amber-200'
          }`}
        >
          {isAllClear
            ? locale === 'ja'
              ? '全ステージ制覇！'
              : 'All Stages Cleared!'
            : locale === 'ja'
              ? `ステージ ${currentStage} クリア！`
              : `Stage ${currentStage} Clear!`}
        </p>
        <h2 className="mt-2 text-3xl font-black phone-land:text-2xl">{timeLabel}</h2>
        <p className="mt-2 text-sm text-white/70">
          {locale === 'ja' ? '到達高度' : 'Peak height'} {heightBest.toFixed(0)}m
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 phone-land:mt-3">
          {!isAllClear ? (
            <button
              type="button"
              className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider ${
                isNeon ? 'bg-cyan-300 text-[#12081c]' : 'bg-white text-[#101820]'
              }`}
              onClick={() => continueToNextStage()}
            >
              {locale === 'ja'
                ? `ステージ ${currentStage + 1} へ`
                : `Stage ${currentStage + 1}`}
            </button>
          ) : null}
          <button
            type="button"
            className="rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
            onClick={() => retryStage()}
          >
            {locale === 'ja' ? 'もう一度' : 'Retry'}
          </button>
          <button
            type="button"
            className="rounded-full border border-white/30 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/90"
            onClick={() => backToTitle()}
          >
            {locale === 'ja' ? 'タイトルへ' : 'Title'}
          </button>
        </div>
      </section>
    </div>
  )
}

export function ClimbHud() {
  const phase = useMountainStore((state) => state.phase)
  const currentStage = useMountainStore((state) => state.currentStage)
  const elapsedSec = useMountainStore((state) => state.elapsedSec)
  const displayHeightM = useMountainStore((state) => state.displayHeightM)
  const heightBest = useMountainStore((state) => state.heightBest)
  const locale = getLocale()
  const theme = getClimbTheme()

  if (phase !== 'playing') return null

  const minutes = Math.floor(elapsedSec / 60)
  const seconds = Math.floor(elapsedSec % 60)

  return (
    <div
      className={`pointer-events-none absolute left-3 top-[calc(env(safe-area-inset-top)+3.25rem)] z-20 rounded-xl border px-3 py-2.5 text-white backdrop-blur ${
        theme.id === 'neon'
          ? 'border-fuchsia-400/35 bg-[#0a0614]/70'
          : 'border-white/25 bg-black/50'
      }`}
    >
      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/55">
        {theme.brand[locale]} · {currentStage}/{MOUNTAIN_STAGE_COUNT}
      </p>
      <div className="mt-1.5 space-y-0.5 border-t border-white/15 pt-1.5 text-xs">
        <p className="font-mono tabular-nums">
          {minutes}:{String(seconds).padStart(2, '0')}
        </p>
        <p className="tabular-nums">
          {locale === 'ja' ? '高度' : 'Height'} {displayHeightM.toFixed(0)}m
        </p>
        <p className="tabular-nums text-white/70">
          BEST {heightBest.toFixed(0)}m
        </p>
      </div>
    </div>
  )
}
