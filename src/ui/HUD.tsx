import { getProgressionStep, getStageLabel } from '../game/gameProgression'
import { useGameStore } from '../stores/gameStore'
import { PlayerMeebitLabel } from './PlayerMeebitLabel'

export function HUD() {
  const venueId = useGameStore((state) => state.venueId)
  const progressionIndex = useGameStore((state) => state.progressionIndex)
  const activeNpcCount = useGameStore((state) => state.activeNpcCount)
  const step = getProgressionStep(progressionIndex, venueId)
  const stageLabel = step ? getStageLabel(step) : 'Stage'

  return (
    <div className="pointer-events-none absolute inset-0 z-10 hidden p-5 sm:p-6 lg:block">
      <section className="w-fit rounded-3xl border border-white/40 bg-neutral-950/80 px-5 py-4 text-white shadow-xl shadow-black/20 backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">Prototype</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          <span className="text-white">Find the Meebit</span>
        </h1>
        <p className="mt-2 text-sm font-bold text-neutral-300">
          {stageLabel} / {activeNpcCount} Meebits
        </p>
        <PlayerMeebitLabel className="mt-1 text-xs font-bold text-neutral-200" />
        <div className="mt-4 space-y-1 text-sm font-medium text-neutral-300">
          <p>WASD: Move</p>
          <p>E: Inspect</p>
          <p>Enter: Next</p>
          <p>Auto Run: On</p>
          <p>Esc: Close</p>
        </div>
      </section>
    </div>
  )
}
