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
      <ul className="mt-1.5 space-y-0.5 text-[0.72rem] leading-snug text-slate-200">
        {copy.controlsLines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  )
}

/** Soft white wash while wrapping — hides cast swaps inside the fog bank. */
export function WrapWash() {
  const isAdvancing = useEightStreetStore((state) => state.isAdvancing)
  const phase = useEightStreetStore((state) => state.phase)
  if (phase !== 'playing' && phase !== 'cleared') return null

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-20 bg-white transition-opacity duration-300 ${
        isAdvancing ? 'opacity-85' : 'opacity-0'
      }`}
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
