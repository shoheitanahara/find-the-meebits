import { useEffect, useState } from 'react'
import { getLocale } from '../../i18n/locale'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { formatRunwayThemeLabel, getDailyRunwayShow } from '../dailyRunway'
import { useRunwayStore } from '../store'

const copy = {
  en: {
    eyebrow: 'Culture District',
    title: 'Fashion Runway',
    theme: "Tonight's look",
    enter: 'Enter the Show',
    loading: 'Preparing the lineup…',
    error: 'Could not load today’s runway. Try again.',
    hint: 'WASD to walk · Click to look around · Esc to release',
  },
  ja: {
    eyebrow: 'カルチャー地区',
    title: 'ファッションランウェイ',
    theme: '本日のルック',
    enter: '会場に入る',
    loading: 'ラインナップを準備中…',
    error: '本日のランウェイを読み込めませんでした。',
    hint: 'WASDで歩行 · クリックで視点変更 · Escで解除',
  },
} as const

export function RunwayTitleScreen() {
  const phase = useRunwayStore((state) => state.phase)
  const locale = getLocale()
  const t = copy[locale]
  const [themeLabel, setThemeLabel] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void getDailyRunwayShow()
      .then((show) => {
        if (cancelled) return
        setThemeLabel(formatRunwayThemeLabel(show.themeTrait, locale))
        setReady(true)
      })
      .catch((err) => {
        console.warn('[RunwayTitleScreen]', err)
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [locale])

  if (phase !== 'title') return null

  const enter = () => {
    void getDailyRunwayShow().then((show) => {
      useRunwayStore.getState().start({
        themeTrait: show.themeTrait,
        matchingIds: show.matchingIds,
        audienceIds: show.audienceIds,
        roamerIds: show.roamerIds,
      })
      void unlockAudioIfNeeded().then(() => playSfx('timerStart'))
    })
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#050505] px-5">
      <div className="w-full max-w-lg border border-white/15 bg-black/80 px-7 py-8 text-center text-white shadow-2xl backdrop-blur-md">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-white/45">{t.eyebrow}</p>
        <h1 className="mt-3 font-[family-name:Georgia,Times_New_Roman,serif] text-3xl tracking-[0.04em] text-white sm:text-4xl">
          {t.title}
        </h1>

        <div className="mt-6 border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/40">{t.theme}</p>
          <p className="mt-1 text-base font-semibold text-white">
            {error ? t.error : themeLabel ?? t.loading}
          </p>
        </div>

        <button
          type="button"
          disabled={!ready || error}
          onClick={enter}
          className="mt-7 w-full border border-white/40 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t.enter}
        </button>
        <p className="mt-4 text-[0.7rem] text-white/40">{t.hint}</p>
      </div>
    </div>
  )
}
