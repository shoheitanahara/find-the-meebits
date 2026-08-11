import { getLocale } from '../../i18n/locale'
import { useOpenSeaMarketStore } from '../store'

/** ギャラリー切替中のフェード（建物入室に近い全画面マスク） */
export function MarketGalleryFade() {
  const isSwitchingGallery = useOpenSeaMarketStore((s) => s.isSwitchingGallery)
  const locale = getLocale()
  const label = locale === 'ja' ? 'ギャラリーへ…' : 'Entering gallery…'

  return (
    <div
      className={`absolute inset-0 z-[40] grid place-items-center bg-[#0c1522] transition-opacity duration-300 ${
        isSwitchingGallery ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!isSwitchingGallery}
    >
      {isSwitchingGallery ? (
        <p className="text-sm font-semibold tracking-[0.2em] text-sky-100/90">{label}</p>
      ) : null}
    </div>
  )
}
