import { useEightStreetStore } from '../store'
import { eightStreetUi } from '../i18n'

export function HowToPlay() {
  const open = useEightStreetStore((state) => state.howToPlayOpen)
  const setHowToPlayOpen = useEightStreetStore((state) => state.setHowToPlayOpen)
  const copy = eightStreetUi()

  if (!open) return null

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-white/15 bg-slate-950/95 p-6 text-white shadow-2xl">
        <h2 className="text-lg font-bold tracking-wide">{copy.howToPlay}</h2>
        <ul className="mt-4 space-y-3 text-left text-sm leading-relaxed text-white/80">
          {copy.howToBody.map((line) => (
            <li key={line} className="border-l-2 border-amber-400/60 pl-3">
              {line}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-6 w-full rounded-md bg-white/10 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] hover:bg-white/15"
          onClick={() => setHowToPlayOpen(false)}
        >
          {copy.close}
        </button>
      </div>
    </div>
  )
}
