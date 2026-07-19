import { useEightStreetStore } from '../store'
import { eightStreetUi } from '../i18n'

export function HowToPlay() {
  const open = useEightStreetStore((state) => state.howToPlayOpen)
  const setHowToPlayOpen = useEightStreetStore((state) => state.setHowToPlayOpen)
  const copy = eightStreetUi()

  if (!open) return null

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.5rem] border border-white/15 bg-[#f5f0e6] p-6 text-stone-900 shadow-2xl">
        <h2 className="text-center text-base font-bold tracking-wide">{copy.wallRulesTitle}</h2>
        <ul className="mt-5 space-y-3 text-left">
          {copy.wallRules.map((line) => (
            <li key={line} className="border-l-2 border-amber-700/50 pl-3 text-sm font-semibold leading-snug">
              {line}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-6 w-full rounded-md bg-stone-900 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-stone-800"
          onClick={() => setHowToPlayOpen(false)}
        >
          {copy.close}
        </button>
      </div>
    </div>
  )
}
