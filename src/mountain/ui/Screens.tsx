import { getLocale } from '../../i18n/locale'
import { useMountainStore } from '../store'

const copy = {
  en: {
    eyebrow: 'Prototype',
    title: 'Mountain Climb',
    blurb: 'A jagged voxel mountain — narrow ledges, many gaps, sheer cliffs. Miss a jump and you fall.',
    controls: 'WASD — Move only (fixed camera) · Space — Jump · Shift — Dash',
    start: 'Start Climb',
  },
  ja: {
    eyebrow: '試作',
    title: '山登り',
    blurb: '切り立ったボクセルの山。細い棚・多くの穴・崖。ジャンプ失敗でマグマ落ち。',
    controls: 'WASD — 移動のみ（視点固定）· Space — ジャンプ · Shift — ダッシュ',
    start: '登り始める',
  },
} as const

export function TitleScreen() {
  const phase = useMountainStore((state) => state.phase)
  const start = useMountainStore((state) => state.start)
  const t = copy[getLocale()]

  if (phase !== 'title') return null

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-[#6a9fc0] via-[#87b8d8] to-[#3d6b3a] px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/30 bg-[#0c1520]/75 p-6 text-white shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/90">{t.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">{t.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/80">{t.blurb}</p>
        <p className="mt-2 text-xs text-white/55">{t.controls}</p>
        <button
          type="button"
          className="mt-6 w-full rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#0c1520] transition hover:bg-sky-50 active:scale-[0.99]"
          onClick={() => start()}
        >
          {t.start}
        </button>
      </section>
    </div>
  )
}

export function ClearOverlay() {
  const phase = useMountainStore((state) => state.phase)
  const elapsedSec = useMountainStore((state) => state.elapsedSec)
  const heightBest = useMountainStore((state) => state.heightBest)
  const backToTitle = useMountainStore((state) => state.backToTitle)
  const start = useMountainStore((state) => state.start)
  const locale = getLocale()

  if (phase !== 'cleared') return null

  const minutes = Math.floor(elapsedSec / 60)
  const seconds = Math.floor(elapsedSec % 60)
  const timeLabel = `${minutes}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-3xl border border-amber-200/40 bg-[#101820]/92 p-6 text-center text-white shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
          {locale === 'ja' ? '山頂到達！' : 'Summit!'}
        </p>
        <h2 className="mt-2 text-3xl font-black">{timeLabel}</h2>
        <p className="mt-2 text-sm text-white/70">
          {locale === 'ja' ? '最高高度' : 'Best height'} {heightBest.toFixed(1)}m
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#101820]"
            onClick={() => start()}
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
  const elapsedSec = useMountainStore((state) => state.elapsedSec)
  const playerY = useMountainStore((state) => state.playerY)
  const heightBest = useMountainStore((state) => state.heightBest)
  const locale = getLocale()

  if (phase !== 'playing') return null

  const minutes = Math.floor(elapsedSec / 60)
  const seconds = Math.floor(elapsedSec % 60)

  return (
    <div className="pointer-events-none absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 rounded-xl border border-white/25 bg-black/50 px-3 py-2.5 text-white backdrop-blur">
      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/55">
        {locale === 'ja' ? '山登り' : 'Mountain Climb'}
      </p>
      <p className="mt-0.5 font-mono text-lg font-bold tabular-nums">
        {minutes}:{String(seconds).padStart(2, '0')}
      </p>
      <div className="mt-1.5 space-y-0.5 border-t border-white/15 pt-1.5 text-xs">
        <p className="tabular-nums text-amber-200/95">
          {locale === 'ja' ? '最高高度' : 'Best'}{' '}
          <span className="font-mono font-bold">{heightBest.toFixed(1)}m</span>
        </p>
        <p className="tabular-nums text-white/65">
          {locale === 'ja' ? '現在' : 'Now'}{' '}
          <span className="font-mono">{playerY.toFixed(1)}m</span>
        </p>
      </div>
    </div>
  )
}
