import { useEffect } from 'react'
import { getLocale } from '../../i18n/locale'
import { usePodcastStore } from '../store'
import { onPodcastEpisodeTitle } from '../youtubePlayer'

const copy = {
  en: {
    label: 'Now playing',
    waiting: 'Tuning in…',
  },
  ja: {
    label: '放送中',
    waiting: '選局中…',
  },
} as const

/** 再生中エピソードの YouTube タイトル（IFrame API getVideoData） */
export function PodcastNowPlaying() {
  const episodeTitle = usePodcastStore((state) => state.episodeTitle)
  const locale = getLocale()
  const t = copy[locale]

  useEffect(() => {
    return onPodcastEpisodeTitle((title) => {
      usePodcastStore.getState().setEpisodeTitle(title)
    })
  }, [])

  return (
    // ParkReturnButton ヘッダー（min-h-10 + safe-area）の下に置く
    <div className="pointer-events-none absolute left-1/2 top-[calc(2.75rem+env(safe-area-inset-top,0px))] z-[60] w-[min(88vw,26rem)] -translate-x-1/2 px-2 phone-land:top-[calc(2.35rem+env(safe-area-inset-top,0px))]">
      <div className="border border-orange-300/25 bg-black/70 px-3 py-1.5 text-center shadow-lg backdrop-blur-md">
        <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-orange-100/50">{t.label}</p>
        <p className="mt-0.5 line-clamp-1 text-[0.8rem] font-semibold leading-snug text-orange-50 sm:text-sm">
          {episodeTitle ?? t.waiting}
        </p>
      </div>
    </div>
  )
}
