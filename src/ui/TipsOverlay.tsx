import { useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { ui } from '../i18n/ui'
import { getGameTipsForVenue } from './gameTips'
import { playSfx, unlockAudioIfNeeded } from './sfx'

function RedMarkerIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-red-700 shadow-[0_0_10px_rgba(185,28,28,0.55)] ${className}`}
      aria-hidden
    />
  )
}

export function TipsOverlay() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const venueId = useGameStore((state) => state.venueId)
  const tipsAcknowledged = useGameStore((state) => state.tipsAcknowledged)
  const acknowledgeTips = useGameStore((state) => state.acknowledgeTips)
  const isVisible = gamePhase === 'preparing' && !tipsAcknowledged
  const isClubVenue = venueId === 'club'
  const gameTips = getGameTipsForVenue(venueId)
  const t = ui()

  useEffect(() => {
    if (!isVisible) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Enter') return
      if (event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      event.preventDefault()
      acknowledgeTips()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isVisible, acknowledgeTips])

  const handleGotIt = () => {
    unlockAudioIfNeeded()
    playSfx('uiConfirm')
    acknowledgeTips()
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-[48] grid place-items-center bg-neutral-950/70 p-4 backdrop-blur-sm max-lg:px-3 max-lg:pb-3 max-lg:pt-[calc(env(safe-area-inset-top)+3.25rem)] phone-land:!flex phone-land:!items-start phone-land:!justify-center phone-land:!overflow-y-auto phone-land:!px-2 phone-land:!pb-[max(0.35rem,env(safe-area-inset-bottom))] phone-land:!pt-[max(2.35rem,calc(env(safe-area-inset-top)+1.9rem))]">
      <section className="w-full max-w-lg rounded-[2rem] border border-white/15 bg-neutral-50 p-5 text-neutral-950 shadow-2xl max-lg:max-h-[calc(100dvh-2rem)] max-lg:overflow-y-auto max-lg:rounded-3xl max-lg:p-4 lg:p-7 phone-land:!h-auto phone-land:!max-h-full phone-land:max-w-3xl phone-land:overflow-y-auto phone-land:p-2.5">
        <div className="phone-land:flex phone-land:items-center phone-land:justify-between phone-land:gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">{t.tips}</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight lg:text-3xl phone-land:mt-0.5 phone-land:text-lg">
              {t.beforeStart}
            </h2>
          </div>
          <button
            type="button"
            className="hidden shrink-0 rounded-full bg-neutral-950 px-5 py-2 text-[0.65rem] font-black uppercase tracking-[0.16em] text-white transition hover:bg-neutral-700 phone-land:inline-flex"
            onClick={handleGotIt}
          >
            {t.gotIt}
          </button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 max-lg:text-xs phone-land:hidden">
          {isClubVenue ? t.tipsClubLead : t.tipsMuseumLead}
        </p>

        <ul className="mt-5 space-y-3 phone-land:mt-2 phone-land:grid phone-land:grid-cols-3 phone-land:gap-2 phone-land:space-y-0">
          {gameTips.map((tip, index) => (
            <li
              key={tip.title}
              className="flex gap-3 rounded-2xl border border-neutral-200 bg-white px-3.5 py-3 max-lg:px-3 max-lg:py-2.5 phone-land:gap-2 phone-land:px-2 phone-land:py-2"
            >
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                {index === 0 ? (
                  <RedMarkerIcon className="size-5" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-950 text-xs font-black text-white">
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black max-lg:text-xs">{tip.title}</p>
                <p className="mt-1 text-sm leading-snug text-neutral-600 max-lg:text-xs phone-land:mt-0.5 phone-land:text-[0.65rem]">
                  {tip.body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-neutral-500 max-lg:text-[0.65rem] phone-land:hidden">
          {t.tipsControls}
        </p>

        <button
          type="button"
          className="mt-5 w-full rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-neutral-700 max-lg:py-3 max-lg:text-xs phone-land:hidden"
          onClick={handleGotIt}
        >
          {t.gotIt}
        </button>
      </section>
    </div>
  )
}
