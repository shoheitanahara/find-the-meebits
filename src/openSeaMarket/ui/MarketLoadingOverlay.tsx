import { getLocale } from '../../i18n/locale'
import { useOpenSeaMarketStore } from '../store'

const copy = {
  en: {
    eyebrow: 'Sea District',
    title: 'OpenSea Market',
    loading: 'Preparing Digital Sculptures…',
    finishing: 'Almost ready…',
    empty: 'No live listings right now — you can still look around.',
  },
  ja: {
    eyebrow: 'シーエリア',
    title: 'OpenSea Market',
    loading: 'Digital Sculpture を準備中…',
    finishing: '表示を仕上げています…',
    empty: 'いま出品が見つかりません。室内の探索はできます。',
  },
} as const

export function MarketLoadingOverlay() {
  const bootPhase = useOpenSeaMarketStore((state) => state.bootPhase)
  const listingsLoaded = useOpenSeaMarketStore((state) => state.listingsLoaded)
  const listingsError = useOpenSeaMarketStore((state) => state.listingsError)
  const sessionCount = useOpenSeaMarketStore((state) => state.sessionPedestalListings.length)
  const progressReady = useOpenSeaMarketStore(
    (state) =>
      (state.playerVrmReady ? 1 : 0) + state.pedestalsReadyCount + state.walkersReadyCount,
  )
  const progressExpected = useOpenSeaMarketStore((state) =>
    Math.max(1, 1 + state.pedestalsExpected + state.walkersExpected),
  )
  const locale = getLocale()
  const t = copy[locale]
  const assetsReady = listingsLoaded && progressReady >= progressExpected
  const ratio = assetsReady ? 1 : Math.min(0.96, progressReady / progressExpected)

  if (bootPhase === 'ready') return null

  return (
    <div className="pointer-events-auto absolute inset-0 z-[45] grid place-items-center bg-[#0c1522]/72 p-4 backdrop-blur-[3px]">
      <section className="w-full max-w-md rounded-[2rem] border border-sky-400/30 bg-[#081018]/92 px-6 py-7 text-center text-[#e8f4ff] shadow-2xl">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-sky-300/80">
          {t.eyebrow}
        </p>
        <h2 className="mt-3 font-[family-name:Georgia,Times_New_Roman,serif] text-3xl">{t.title}</h2>
        <p className="mt-4 text-sm text-sky-100/70">{assetsReady ? t.finishing : t.loading}</p>
        {listingsLoaded && sessionCount === 0 ? (
          <p className="mt-2 text-xs text-amber-200/80">{t.empty}</p>
        ) : null}
        {listingsError ? (
          <p className="mt-2 break-all text-[0.65rem] text-rose-300/80">{listingsError}</p>
        ) : null}
        {listingsLoaded ? (
          <p className="mt-2 text-[0.7rem] tabular-nums text-sky-200/50">
            {progressReady} / {progressExpected}
          </p>
        ) : null}
        <div className="mx-auto mt-5 h-1.5 w-44 overflow-hidden rounded-full bg-[#1a3048]">
          <div
            className={`h-full rounded-full bg-[#2081e2] transition-[width] duration-300 ease-out ${
              assetsReady ? 'animate-pulse' : ''
            }`}
            style={{ width: `${Math.max(8, ratio * 100)}%` }}
          />
        </div>
      </section>
    </div>
  )
}
