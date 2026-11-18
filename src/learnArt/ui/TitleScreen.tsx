import { useEffect, useState } from 'react'
import { isTouchUiMode } from '../../game/perfConfig'
import { getLocale } from '../../i18n/locale'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { LEARN_ART_FILM_CREDIT, LEARN_ART_FILM_TITLE } from '../config'
import { getDailyLearnArtShow } from '../dailyLearnArt'
import { useLearnArtStore } from '../store'
import {
  armLearnArtSoundOnEnter,
  onLearnArtYoutubeReady,
  unmuteLearnArtYoutube,
} from '../youtubePlayer'

const copy = {
  en: {
    eyebrow: 'Music & Art District',
    title: 'Learn Art',
    film: 'Now screening',
    enter: 'Enter the Gallery',
    loading: 'Preparing the house…',
    error: 'Could not seat today’s audience. Try again.',
    hintDesktop: 'WASD to walk · Click, then drag to look around · Esc to release',
    hintTouch: 'Joystick to move · Drag the screen to look around',
    audioNote: 'Enter also turns sound on. Press M anytime to mute or unmute.',
  },
  ja: {
    eyebrow: 'ミュージック＆アートエリア',
    title: 'Learn Art',
    film: '上映中',
    enter: 'ギャラリーに入る',
    loading: '客席を準備中…',
    error: '本日の客席を用意できませんでした。',
    hintDesktop: 'WASDで歩行 · クリック後ドラッグで見回す · Escで解除',
    hintTouch: 'スティックで移動 · 画面ドラッグで視点変更',
    audioNote: '入場と同時に音声がオンになります。ミュート切替は M キーか「音声オン」。',
  },
} as const

export function LearnArtTitleScreen() {
  const phase = useLearnArtStore((state) => state.phase)
  const locale = getLocale()
  const t = copy[locale]
  const hint = isTouchUiMode() ? t.hintTouch : t.hintDesktop
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    void getDailyLearnArtShow()
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch((err) => {
        console.warn('[LearnArtTitleScreen]', err)
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (phase !== 'title') return null

  const enter = () => {
    armLearnArtSoundOnEnter()
    void unlockAudioIfNeeded().then(() => {
      void getDailyLearnArtShow().then((show) => {
        useLearnArtStore.getState().start({
          audienceIds: show.audienceIds,
          emptySeatIndices: show.emptySeatIndices,
        })
        // Enter = 音声オン（UI も即反映。実プレイヤーは ready / 曲ジャンプ後に追従）
        useLearnArtStore.getState().setSoundMuted(false)
        playSfx('timerStart')
        const unsubscribe = onLearnArtYoutubeReady(() => {
          unmuteLearnArtYoutube()
          useLearnArtStore.getState().setSoundMuted(false)
          unsubscribe()
        })
      })
    })
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#0c0610] px-5 phone-land:px-3">
      <div className="w-full max-w-lg border border-fuchsia-200/20 bg-black/80 px-7 py-8 text-center text-white shadow-2xl backdrop-blur-md phone-land:max-h-[calc(100dvh-2.4rem)] phone-land:overflow-y-auto phone-land:px-4 phone-land:py-4">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-fuchsia-100/50">{t.eyebrow}</p>
        <h1 className="mt-3 text-3xl tracking-[0.04em] text-white sm:text-4xl phone-land:mt-1 phone-land:text-2xl">
          {t.title}
        </h1>

        <div className="mt-6 border border-white/10 bg-white/5 px-4 py-3 phone-land:mt-3 phone-land:py-2">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/40">{t.film}</p>
          <p className="mt-1 text-lg font-semibold text-fuchsia-50">{LEARN_ART_FILM_TITLE}</p>
          <p className="text-sm text-white/55">{LEARN_ART_FILM_CREDIT}</p>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-white/55 phone-land:mt-3">{hint}</p>
        <p className="mt-2 text-xs text-white/40 phone-land:mt-1">{t.audioNote}</p>

        {error ? <p className="mt-4 text-sm text-rose-300">{t.error}</p> : null}

        <button
          type="button"
          disabled={!ready || error}
          onClick={enter}
          className="mt-6 w-full border border-fuchsia-200/40 bg-fuchsia-500/15 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-fuchsia-50 transition hover:bg-fuchsia-500/25 disabled:cursor-not-allowed disabled:opacity-40 phone-land:mt-3 phone-land:py-2.5"
        >
          {ready ? t.enter : t.loading}
        </button>
      </div>
    </div>
  )
}
