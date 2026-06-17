import { getNpcById } from '../npc/npcData'
import { useGameStore } from '../stores/gameStore'
import { TargetPreview } from './TargetPreview'

export function TargetHUD() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const targetNpcId = useGameStore((state) => state.targetNpcId)
  const targetNpc = getNpcById(targetNpcId)
  const isAnswerReveal = gamePhase === 'timedOut'
  const isVisible = gamePhase === 'playing' || isAnswerReveal
  const shouldMountPreview = gamePhase === 'preparing' || isVisible

  if (!shouldMountPreview || !targetNpc) {
    return null
  }

  return (
    <aside
      className={`pointer-events-none absolute right-5 top-5 z-30 rounded-[1.75rem] border p-4 text-white shadow-2xl backdrop-blur-md ${
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
        {isAnswerReveal ? 'Answer' : 'Target'}
      </p>
      <p className={`mt-1 text-xl font-black ${isAnswerReveal ? 'text-amber-100' : ''}`}>
        #{targetNpc.meebitNumber}
      </p>
      {isAnswerReveal ? (
        <p className="mt-2 max-w-[8.5rem] text-xs leading-relaxed text-amber-100/80">
          Follow the golden glow in the gallery.
        </p>
      ) : null}
      <div className="mt-3">
        <TargetPreview
          meebitNumber={targetNpc.meebitNumber}
          modelScale={1.08}
          sizeClassName="h-32 w-32"
        />
      </div>
    </aside>
  )
}
