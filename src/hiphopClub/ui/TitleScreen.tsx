import { useEffect, useState } from 'react'
import { getLocale } from '../../i18n/locale'
import { isTouchUiMode } from '../../game/perfConfig'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { CLUB_SHOW_CREDIT, CLUB_SHOW_TITLE } from '../config'
import { getDailyClubShow } from '../dailyClub'
import { useClubStore } from '../store'

const copy = {
  en: {
    eyebrow: 'Music & Art District',
    title: 'Hip Hop Club',
    show: 'Playlist',
    enter: 'Enter the Club',
    loading: 'Warming up the floor…',
    error: 'Could not seat today’s crowd. Try again.',
    hintDesktop: 'WASD to walk · Click, then drag to look around · Esc to release',
    hintTouch: 'Joystick to move · Drag the screen to look around',
    audioNote: 'A random track starts muted. Title appears after you enter — press M or Sound on.',
  },
  ja: {
    eyebrow: 'ミュージック＆アートエリア',
    title: 'Hip Hop Club',
    show: 'プレイリスト',
    enter: 'クラブに入る',
    loading: 'フロア準備中…',
    error: '本日のダンサーを用意できませんでした。',
    hintDesktop: 'WASDで歩行 · クリック後ドラッグで見回す · Escで解除',
    hintTouch: 'スティックで移動 · 画面ドラッグで視点変更',
    audioNote: 'ランダムな曲がミュートで始まります。タイトルは入場後に表示。M か「音声オン」で切替。',
  },
} as const

export function ClubTitleScreen() {
  const phase = useClubStore((state) => state.phase)
  const locale = getLocale()
  const t = copy[locale]
  const hint = isTouchUiMode() ? t.hintTouch : t.hintDesktop
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    void getDailyClubShow()
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch((err) => {
        console.warn('[ClubTitleScreen]', err)
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (phase !== 'title') return null

  const enter = () => {
    void getDailyClubShow().then((show) => {
      useClubStore.getState().start({
        audienceIds: show.audienceIds,
      })
      void unlockAudioIfNeeded().then(() => playSfx('timerStart'))
    })
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#0c0610] px-5 phone-land:px-3">
      <div className="w-full max-w-lg border border-fuchsia-300/25 bg-black/80 px-7 py-8 text-center text-white shadow-2xl backdrop-blur-md phone-land:max-h-[calc(100dvh-2.4rem)] phone-land:overflow-y-auto phone-land:px-4 phone-land:py-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-fuchsia-100/50">{t.eyebrow}</p>
        <h1 className="mt-3 text-3xl tracking-[0.04em] text-white sm:text-4xl phone-land:mt-1 phone-land:text-2xl">
          {t.title}
        </h1>

        <div className="mt-6 border border-white/10 bg-white/5 px-4 py-3 phone-land:mt-3 phone-land:py-2">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/40">{t.show}</p>
          <p className="mt-1 text-lg font-semibold text-fuchsia-50">{CLUB_SHOW_TITLE}</p>
          <p className="text-sm text-white/55">{CLUB_SHOW_CREDIT}</p>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-white/65 phone-land:mt-3">{t.audioNote}</p>
        <p className="mt-2 text-xs text-white/45">{hint}</p>

        <button
          type="button"
          disabled={!ready || error}
          onClick={enter}
          className="mt-7 w-full border border-fuchsia-200/40 bg-gradient-to-b from-fuchsia-300 to-fuchsia-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#180818] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 phone-land:mt-4"
        >
          {error ? t.error : ready ? t.enter : t.loading}
        </button>
      </div>
    </div>
  )
}
