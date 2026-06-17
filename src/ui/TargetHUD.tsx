import { getNpcById } from '../npc/npcData'
import { useGameStore } from '../stores/gameStore'
import { TargetPreview } from './TargetPreview'

export function TargetHUD() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const targetNpcIds = useGameStore((state) => state.targetNpcIds)
  const targetNpcs = targetNpcIds
    .map((id) => getNpcById(id))
    .filter((npc): npc is NonNullable<typeof npc> => npc !== null)
  const isAnswerReveal = gamePhase === 'timedOut'
  const isVisible = gamePhase === 'playing' || isAnswerReveal
  const shouldMountPreview = gamePhase === 'preparing' || isVisible

  if (!shouldMountPreview || targetNpcs.length === 0) {
    return null
  }

  return (
    <aside
      className={`pointer-events-none absolute right-5 top-5 z-30 hidden rounded-[1.75rem] border p-4 text-white shadow-2xl backdrop-blur-md md:block ${
        isAnswerReveal
          ? 'border-amber-300/40 bg-amber-950/85'
          : 'border-white/20 bg-neutral-950/85'
      } ${isVisible ? '' : 'invisible'}`}
      aria-hidden={!isVisible}
    >
      <p
        className={`text-[0.65rem] font-semibold uppercase tracking-[0.3em] ${
          isAnswerReveal ? 'text-amber-200/90' : 'text-neutral-400'
        }`}
      >
        {isAnswerReveal ? 'Answer' : targetNpcs.length > 1 ? 'Targets' : 'Target'}
      </p>
      <div className={`mt-2 grid gap-3 ${targetNpcs.length > 1 ? '' : ''}`}>
        {targetNpcs.map((npc) => (
          <div key={npc.id}>
            <p className={`text-xl font-black ${isAnswerReveal ? 'text-amber-100' : ''}`}>
              #{npc.meebitNumber}
            </p>
            <div className="mt-2">
              <TargetPreview
                meebitNumber={npc.meebitNumber}
                modelScale={1.08}
                sizeClassName="h-56 w-56"
              />
            </div>
          </div>
        ))}
      </div>
      {isAnswerReveal ? (
        <p className="mt-2 max-w-[8.5rem] text-xs leading-relaxed text-amber-100/80">
          Follow the golden glow in the gallery.
        </p>
      ) : null}
    </aside>
  )
}
