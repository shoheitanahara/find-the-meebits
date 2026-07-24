import { useEffect, useState } from 'react'
import { getLocale } from '../../i18n/locale'
import { MOUNTAIN_STAGE_COUNT, MOUNTAIN_STAGES } from '../config'
import { useMountainStore } from '../store'

const copy = {
  en: {
    eyebrow: '20 Stages · 1000m',
    title: 'Mt. Meeb',
    blurb: 'Winding ledges and gappy cliffs. Clear a stage to unlock the next — 50m each, up to 1000m.',
    controls: 'WASD — Move only (fixed camera) · Space — Jump · Shift — Dash',
    start: 'Start Climb',
    stage: 'Stage',
  },
  ja: {
    eyebrow: '全20ステージ · 1000m',
    title: 'Mt. Meeb',
    blurb: '曲がりくねった棚と隙間だらけの崖。1ステージ50m、クリアで次が解放され約1000mまで登れる。',
    controls: 'WASD — 移動のみ（視点固定）· Space — ジャンプ · Shift — ダッシュ',
    start: '登り始める',
    stage: 'ステージ',
  },
} as const

export function TitleScreen() {
  const phase = useMountainStore((state) => state.phase)
  const unlockedStage = useMountainStore((state) => state.unlockedStage)
  const heightBest = useMountainStore((state) => state.heightBest)
  const start = useMountainStore((state) => state.start)
  const [selected, setSelected] = useState(() => unlockedStage)
  const t = copy[getLocale()]
  const locale = getLocale()

  useEffect(() => {
    setSelected((prev) => Math.min(prev, unlockedStage) || unlockedStage)
  }, [unlockedStage])

  if (phase !== 'title') return null

  const playStage = Math.min(Math.max(1, selected), unlockedStage)

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-[#6a9fc0] via-[#87b8d8] to-[#3d6b3a] px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/30 bg-[#0c1520]/75 p-6 text-white shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/90">{t.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">{t.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/80">{t.blurb}</p>
        <p className="mt-2 text-xs text-white/55">{t.controls}</p>
        {heightBest > 0 ? (
          <p className="mt-3 text-sm tabular-nums text-amber-200/90">
            {locale === 'ja' ? '最高到達' : 'Best'}{' '}
            <span className="font-mono font-bold">{heightBest.toFixed(0)}m</span>
          </p>
        ) : null}

        <div className="mt-5">
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/50">
            {t.stage}
          </p>
          <div className="grid grid-cols-5 gap-1.5">
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
                        ? 'bg-white text-[#0c1520]'
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
          className="mt-6 w-full rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#0c1520] transition hover:bg-sky-50 active:scale-[0.99]"
          onClick={() => start(playStage)}
        >
          {locale === 'ja' ? `${t.stage} ${playStage} を開始` : `Start Stage ${playStage}`}
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

  if (phase !== 'stageCleared' && phase !== 'allCleared') return null

  const minutes = Math.floor(elapsedSec / 60)
  const seconds = Math.floor(elapsedSec % 60)
  const timeLabel = `${minutes}:${String(seconds).padStart(2, '0')}`
  const isAllClear = phase === 'allCleared'

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-3xl border border-amber-200/40 bg-[#101820]/92 p-6 text-center text-white shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
          {isAllClear
            ? locale === 'ja'
              ? '全ステージ制覇！'
              : 'All Stages Cleared!'
            : locale === 'ja'
              ? `ステージ ${currentStage} クリア！`
              : `Stage ${currentStage} Clear!`}
        </p>
        <h2 className="mt-2 text-3xl font-black">{timeLabel}</h2>
        <p className="mt-2 text-sm text-white/70">
          {locale === 'ja' ? '到達高度' : 'Peak height'} {heightBest.toFixed(0)}m
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {!isAllClear ? (
            <button
              type="button"
              className="rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#101820]"
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

  if (phase !== 'playing') return null

  const minutes = Math.floor(elapsedSec / 60)
  const seconds = Math.floor(elapsedSec % 60)

  return (
    <div className="pointer-events-none absolute left-3 top-[calc(env(safe-area-inset-top)+3.25rem)] z-20 rounded-xl border border-white/25 bg-black/50 px-3 py-2.5 text-white backdrop-blur">
      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/55">
        Mt. Meeb · {currentStage}/{MOUNTAIN_STAGE_COUNT}
      </p>
      <p className="mt-0.5 font-mono text-lg font-bold tabular-nums">
        {minutes}:{String(seconds).padStart(2, '0')}
      </p>
      <div className="mt-1.5 space-y-0.5 border-t border-white/15 pt-1.5 text-xs">
        <p className="tabular-nums text-amber-200/95">
          {locale === 'ja' ? '高度' : 'Alt'}{' '}
          <span className="font-mono font-bold">{displayHeightM.toFixed(0)}m</span>
        </p>
        <p className="tabular-nums text-white/65">
          {locale === 'ja' ? '最高' : 'Best'}{' '}
          <span className="font-mono">{heightBest.toFixed(0)}m</span>
        </p>
      </div>
    </div>
  )
}
