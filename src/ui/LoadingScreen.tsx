import { useGameStore } from '../stores/gameStore'
import { ui } from '../i18n/ui'
import { getLoadingLabelForVenue } from './gameTips'

export function LoadingScreen() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const venueId = useGameStore((state) => state.venueId)
  const playerModelStatus = useGameStore((state) => state.playerModelStatus)
  const loadingLabel = getLoadingLabelForVenue(venueId)
  const isClubVenue = venueId === 'club'
  const t = ui()

  if (gamePhase === 'intro' || gamePhase === 'preparing' || playerModelStatus !== 'loading') {
    return null
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-20 grid place-items-center backdrop-blur-[2px] ${
        isClubVenue ? 'bg-violet-950/55' : 'bg-neutral-950/35'
      }`}
    >
      <div
        className={`rounded-3xl border px-6 py-5 text-center shadow-2xl ${
          isClubVenue
            ? 'border-fuchsia-400/30 bg-neutral-950/90 text-white shadow-fuchsia-950/20'
            : 'border-white/60 bg-white/80 text-slate-950 shadow-sky-900/10'
        }`}
      >
        <p
          className={`text-sm font-semibold uppercase tracking-[0.3em] ${
            isClubVenue ? 'text-fuchsia-300' : 'text-sky-700'
          }`}
        >
          {t.loading}
        </p>
        <p className="mt-2 text-xl font-black">{loadingLabel}</p>
        <p className={`mt-2 text-sm font-medium ${isClubVenue ? 'text-neutral-300' : 'text-slate-600'}`}>
          {t.loadingAvatar}
        </p>
      </div>
    </div>
  )
}
