import { formatTraitDisplayName } from '../../game/traitHunt'
import { getLocale } from '../../i18n/locale'
import { useRunwayStore } from '../store'

export function RunwayHud() {
  const phase = useRunwayStore((state) => state.phase)
  const themeTrait = useRunwayStore((state) => state.themeTrait)
  const onScreen = useRunwayStore((state) => state.onScreen)
  const locale = getLocale()

  if (phase !== 'playing' || !themeTrait) return null

  const themeLine = `${themeTrait.traitType} · ${formatTraitDisplayName(
    themeTrait.traitType,
    themeTrait.traitValue,
  )}`

  return (
    <div className="pointer-events-none absolute inset-x-0 top-12 z-20 flex justify-center px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="border border-white/15 bg-black/70 px-4 py-2 text-center text-white shadow-lg backdrop-blur-md">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.22em] text-white/45">
          {locale === 'ja' ? '本日のルック' : "Tonight's look"}
        </p>
        <p className="text-sm font-semibold text-white">{themeLine}</p>
        {onScreen ? (
          <p className="mt-0.5 text-xs text-white/55">#{onScreen.meebitNumber}</p>
        ) : null}
      </div>
    </div>
  )
}
