import { EIGHT_STREET } from '../config'
import { eightStreetUi } from '../i18n'
import { useEightStreetStore } from '../store'

/** Top-left controls only — game rules live on the alley wall poster. */
export function ControlsHud() {
  const phase = useEightStreetStore((state) => state.phase)
  const copy = eightStreetUi()

  if (phase !== 'playing') {
    return null
  }

  return (
    <div className="pointer-events-none absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 max-w-[13rem] rounded-md border border-white/10 bg-black/55 px-3 py-2.5 text-slate-100 shadow-md backdrop-blur-md">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-amber-200/70">
        {copy.controlsTitle}
      </p>
      <ul className="mt-1.5 hidden space-y-0.5 text-[0.72rem] leading-snug text-slate-200 lg:block">
        {copy.controlsLinesPc.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <ul className="mt-1.5 space-y-0.5 text-[0.72rem] leading-snug text-slate-200 lg:hidden">
        {copy.controlsLinesMobile.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  )
}

/** Soft full-screen white wash while wrapping — bloom in, hold, then ease out. */
export function WrapWash() {
  const isAdvancing = useEightStreetStore((state) => state.isAdvancing)
  const phase = useEightStreetStore((state) => state.phase)
  if (phase !== 'playing' && phase !== 'cleared') return null

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-40"
      style={{
        opacity: isAdvancing ? 1 : 0,
        // Ease-out in: hits near-opaque early so the corridor can’t read through.
        transition: isAdvancing
          ? `opacity ${EIGHT_STREET.wrapFadeInMs}ms cubic-bezier(0.12, 0.7, 0.2, 1)`
          : `opacity ${EIGHT_STREET.wrapFadeOutMs}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        background:
          'radial-gradient(ellipse at 50% 45%, #ffffff 0%, #ffffff 55%, #f7f7f7 100%)',
      }}
    />
  )
}

/** Only the very first session bootstrap — not used between streets. */
export function LoadingOverlay() {
  const phase = useEightStreetStore((state) => state.phase)
  const copy = eightStreetUi()
  if (phase !== 'loading') return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#05070d]/85 text-slate-100 backdrop-blur-[2px]">
      <p className="animate-pulse text-sm uppercase tracking-[0.24em] text-amber-100/80">
        {copy.loading}
      </p>
    </div>
  )
}
