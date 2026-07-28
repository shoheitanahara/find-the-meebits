import { getLocale } from '../../i18n/locale'
import { useMeetSergitoStore } from '../store'

const copy = {
  en: {
    eyebrow: 'Sea District',
    title: 'Meet Sergito',
    loading: 'Preparing the workshop…',
  },
  ja: {
    eyebrow: 'シーエリア',
    title: 'Meet Sergito',
    loading: '工房を準備中…',
  },
} as const

/** 入室直後 — プレイヤー / Sergito / 歩行者 VRM が揃うまで表示 */
export function MeetSergitoLoadingOverlay() {
  const bootPhase = useMeetSergitoStore((state) => state.bootPhase)
  const locale = getLocale()
  const t = copy[locale]

  if (bootPhase === 'ready') return null

  return (
    <div className="pointer-events-auto absolute inset-0 z-[45] grid place-items-center bg-[#1a140c]/72 p-4 backdrop-blur-[3px]">
      <section className="w-full max-w-md rounded-[2rem] border border-[#d4a060]/30 bg-[#120e08]/92 px-6 py-7 text-center text-[#f4ead2] shadow-2xl">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[#d4a060]/80">
          {t.eyebrow}
        </p>
        <h2 className="mt-3 font-[family-name:Georgia,Times_New_Roman,serif] text-3xl">{t.title}</h2>
        <p className="mt-4 text-sm text-[#c8b898]">{t.loading}</p>
        <div className="mx-auto mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-[#3a3028]">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#d4a060]" />
        </div>
      </section>
    </div>
  )
}
