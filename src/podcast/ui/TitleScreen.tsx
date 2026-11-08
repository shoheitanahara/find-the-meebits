import { useEffect, useState } from 'react'
import { isTouchUiMode } from '../../game/perfConfig'
import { getLocale } from '../../i18n/locale'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { PODCAST_SHOW_CREDIT, PODCAST_SHOW_TITLE } from '../config'
import { getDailyPodcastShow } from '../dailyPodcast'
import { usePodcastStore } from '../store'

const copy = {
  en: {
    eyebrow: 'Meebits Plaza',
    title: 'Meebits Podcast',
    show: 'Playlist',
    enter: 'Enter the Studio',
    loading: 'Warming up the mics…',
    error: 'Could not seat today’s audience. Try again.',
    hintDesktop: 'WASD to walk · Click, then drag to look around · Esc to release',
    hintTouch: 'Joystick to move · Drag the screen to look around',
    audioNote: 'A random episode starts muted. Title appears after you enter — press M or Sound on.',
  },
  ja: {
    eyebrow: 'ミービッツ広場',
    title: 'Meebits Podcast',
    show: 'プレイリスト',
    enter: 'スタジオに入る',
    loading: 'マイク準備中…',
    error: '本日の客席を用意できませんでした。',
    hintDesktop: 'WASDで歩行 · クリック後ドラッグで見回す · Escで解除',
    hintTouch: 'スティックで移動 · 画面ドラッグで視点変更',
    audioNote: 'ランダムな回がミュートで始まります。タイトルは入場後に表示。M か「音声オン」で切替。',
  },
} as const

export function PodcastTitleScreen() {
  const phase = usePodcastStore((state) => state.phase)
  const locale = getLocale()
  const t = copy[locale]
  const hint = isTouchUiMode() ? t.hintTouch : t.hintDesktop
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    void getDailyPodcastShow()
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch((err) => {
        console.warn('[PodcastTitleScreen]', err)
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (phase !== 'title') return null

  const enter = () => {
    void getDailyPodcastShow().then((show) => {
      usePodcastStore.getState().start({
        audienceIds: show.audienceIds,
        emptySeatIndices: show.emptySeatIndices,
      })
      void unlockAudioIfNeeded().then(() => playSfx('timerStart'))
    })
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#120e0c] px-5 phone-land:px-3">
      <div className="w-full max-w-lg border border-orange-300/25 bg-black/80 px-7 py-8 text-center text-white shadow-2xl backdrop-blur-md phone-land:max-h-[calc(100dvh-2.4rem)] phone-land:overflow-y-auto phone-land:px-4 phone-land:py-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-orange-100/50">{t.eyebrow}</p>
        <h1 className="mt-3 font-[family-name:Georgia,Times_New_Roman,serif] text-3xl tracking-[0.04em] text-white sm:text-4xl phone-land:mt-1 phone-land:text-2xl">
          {t.title}
        </h1>

        <div className="mt-6 border border-white/10 bg-white/5 px-4 py-3 phone-land:mt-3 phone-land:py-2">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/40">{t.show}</p>
          <p className="mt-1 text-lg font-semibold text-orange-50">{PODCAST_SHOW_TITLE}</p>
          <p className="text-sm text-white/55">{PODCAST_SHOW_CREDIT}</p>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-300">{t.error}</p> : null}

        <button
          type="button"
          disabled={!ready || error}
          onClick={enter}
          className="mt-6 w-full border border-orange-300/45 bg-orange-400/15 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-orange-50 transition hover:bg-orange-400/25 disabled:cursor-not-allowed disabled:opacity-40 phone-land:mt-3 phone-land:py-2"
        >
          {ready ? t.enter : t.loading}
        </button>

        <p className="mt-4 text-[0.7rem] leading-relaxed text-white/45 phone-land:mt-2">{hint}</p>
        <p className="mt-2 text-[0.65rem] leading-relaxed text-white/35">{t.audioNote}</p>
      </div>
    </div>
  )
}
