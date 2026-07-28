import { getLocale } from '../../i18n/locale'
import { getMeetSergitoBootProgress, useMeetSergitoStore } from '../store'

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

/** 入室直後 — プレイヤー / Sergito / 歩行者 / フィギュア VRM が揃うまで表示 */
export function MeetSergitoLoadingOverlay() {
  const bootPhase = useMeetSergitoStore((state) => state.bootPhase)
  const progress = useMeetSergitoStore((state) => getMeetSergitoBootProgress(state))
  const locale = getLocale()
  const t = copy[locale]
  const ratio = Math.min(1, progress.ready / progress.expected)

  if (bootPhase === 'ready') return null

  return (
    <div className="pointer-events-auto absolute inset-0 z-[45] grid place-items-center bg-[#1a140c]/72 p-4 backdrop-blur-[3px]">
      <section className="w-full max-w-md rounded-[2rem] border border-[#d4a060]/30 bg-[#120e08]/92 px-6 py-7 text-center text-[#f4ead2] shadow-2xl">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[#d4a060]/80">
          {t.eyebrow}
        </p>
        <h2 className="mt-3 font-[family-name:Georgia,Times_New_Roman,serif] text-3xl">{t.title}</h2>
        <p className="mt-4 text-sm text-[#c8b898]">{t.loading}</p>
        <p className="mt-2 text-[0.7rem] tabular-nums text-[#a89070]">
          {progress.ready} / {progress.expected}
        </p>
        <div className="mx-auto mt-5 h-1.5 w-44 overflow-hidden rounded-full bg-[#3a3028]">
          <div
            className="h-full rounded-full bg-[#d4a060] transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(8, ratio * 100)}%` }}
          />
        </div>
      </section>
    </div>
  )
}
