import { useEffect } from 'react'
import { getLocale } from '../../i18n/locale'
import { useJazzBarStore } from '../store'
import { onJazzBarEpisodeTitle } from '../youtubePlayer'

const copy = {
  en: {
    label: 'Now playing',
    waiting: 'Cueing the next tune…',
  },
  ja: {
    label: '再生中',
    waiting: '次の曲を準備中…',
  },
} as const

/** 再生中トラックの YouTube タイトル（IFrame API getVideoData） */
export function JazzBarNowPlaying() {
  const episodeTitle = useJazzBarStore((state) => state.episodeTitle)
  const locale = getLocale()
  const t = copy[locale]

  useEffect(() => {
    return onJazzBarEpisodeTitle((title) => {
      useJazzBarStore.getState().setEpisodeTitle(title)
    })
  }, [])

  return (
    <div className="pointer-events-none absolute left-1/2 top-[calc(2.75rem+env(safe-area-inset-top,0px))] z-[60] w-[min(88vw,26rem)] -translate-x-1/2 px-2 phone-land:top-[calc(2.35rem+env(safe-area-inset-top,0px))]">
      <div className="border border-sky-300/25 bg-black/70 px-3 py-1.5 text-center shadow-lg backdrop-blur-md">
        <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-sky-100/50">{t.label}</p>
        <p className="mt-0.5 line-clamp-1 text-[0.8rem] font-semibold leading-snug text-sky-50 sm:text-sm">
          {episodeTitle ?? t.waiting}
        </p>
      </div>
    </div>
  )
}
