import { LanguageSwitcher } from '../../ui/LanguageSwitcher'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { eightStreetUi } from '../i18n'
import { useEightStreetStore } from '../store'

export function TitleScreen() {
  const phase = useEightStreetStore((state) => state.phase)
  const startGame = useEightStreetStore((state) => state.startGame)
  const setHowToPlayOpen = useEightStreetStore((state) => state.setHowToPlayOpen)
  const copy = eightStreetUi()

  if (phase !== 'title') return null

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_35%_10%,#1a2744_0%,#0a1020_42%,#05070d_100%)] px-6 text-center text-slate-100">
      <LanguageSwitcher className="absolute left-4 top-4" tone="dark" />
      <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-amber-200/70">
        Meebits
      </p>
      <h1 className="font-[family-name:Georgia,Times_New_Roman,serif] text-5xl tracking-tight text-white sm:text-6xl">
        {copy.title}
      </h1>
      <p className="mt-4 max-w-sm text-base text-slate-300">{copy.subtitle}</p>
      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          className="rounded-md bg-amber-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-amber-400"
          onClick={() => {
            void unlockAudioIfNeeded().then(() => {
              playSfx('timerStart')
              void startGame()
            })
          }}
        >
          {copy.start}
        </button>
        <button
          type="button"
          className="rounded-md border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-100 transition hover:bg-white/10"
          onClick={() => setHowToPlayOpen(true)}
        >
          {copy.howToPlay}
        </button>
      </div>
    </div>
  )
}
