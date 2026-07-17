import { getProgressionStep, getStageLabel } from '../game/gameProgression'
import { ui } from '../i18n/ui'
import { useGameStore } from '../stores/gameStore'
import { PlayerMeebitLabel } from './PlayerMeebitLabel'

export function HUD() {
  const venueId = useGameStore((state) => state.venueId)
  const progressionIndex = useGameStore((state) => state.progressionIndex)
  const activeNpcCount = useGameStore((state) => state.activeNpcCount)
  const step = getProgressionStep(progressionIndex, venueId)
  const t = ui()
  const stageLabel = step ? getStageLabel(step) : t.stage

  return (
    <div className="pointer-events-none absolute inset-0 z-10 hidden p-5 sm:p-6 lg:block">
      <section className="w-fit rounded-3xl border border-white/40 bg-neutral-950/80 px-5 py-4 text-white shadow-xl shadow-black/20 backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">{t.prototype}</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          <span className="text-white">{t.title}</span>
        </h1>
        <p className="mt-2 text-sm font-bold text-neutral-300">
          {t.stageWithMeebits(stageLabel, activeNpcCount)}
        </p>
        <PlayerMeebitLabel className="mt-1 text-xs font-bold text-neutral-200" />
        <div className="mt-4 space-y-1 text-sm font-medium text-neutral-300">
          <p>{t.move}</p>
          <p>{t.inspect}</p>
          <p>{t.next}</p>
          <p>{t.autoRun}</p>
          <p>{t.escClose}</p>
        </div>
      </section>
    </div>
  )
}
