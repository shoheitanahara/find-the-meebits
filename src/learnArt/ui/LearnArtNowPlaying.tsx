import { useEffect } from 'react'
import { getLocale } from '../../i18n/locale'
import { useLearnArtStore } from '../store'
import { onLearnArtEpisodeTitle } from '../youtubePlayer'

const copy = {
  en: {
    label: 'Now screening',
    waiting: 'Cueing the next film…',
  },
  ja: {
    label: '上映中',
    waiting: '次の作品を準備中…',
  },
} as const

/** 上映中の YouTube 動画タイトル（IFrame API getVideoData）。Jazz Bar の再生中表示と同じ配置 */
export function LearnArtNowPlaying() {
  const episodeTitle = useLearnArtStore((state) => state.episodeTitle)
  const locale = getLocale()
  const t = copy[locale]

  useEffect(() => {
    return onLearnArtEpisodeTitle((title) => {
      useLearnArtStore.getState().setEpisodeTitle(title)
    })
  }, [])

  return (
    <div className="pointer-events-none absolute left-1/2 top-[calc(2.75rem+env(safe-area-inset-top,0px))] z-[60] w-[min(88vw,26rem)] -translate-x-1/2 px-2 phone-land:top-[calc(2.35rem+env(safe-area-inset-top,0px))]">
      <div className="border border-fuchsia-300/25 bg-black/70 px-3 py-1.5 text-center shadow-lg backdrop-blur-md">
        <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-fuchsia-100/50">{t.label}</p>
        <p className="mt-0.5 line-clamp-1 text-[0.8rem] font-semibold leading-snug text-fuchsia-50 sm:text-sm">
          {episodeTitle ?? t.waiting}
        </p>
      </div>
    </div>
  )
}
