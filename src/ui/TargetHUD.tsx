import { getNpcById } from '../npc/npcData'
import { useGameStore } from '../stores/gameStore'
import { FoundTargetIcon } from './FoundTargetIcon'
import { TargetPreview } from './TargetPreview'

function getTargetPreviewSize(targetCount: number) {
  if (targetCount >= 3) {
    return 'h-28 w-28'
  }

  return 'h-36 w-36'
}

export function TargetHUD() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const targetNpcIds = useGameStore((state) => state.targetNpcIds)
  const foundTargetNpcIds = useGameStore((state) => state.foundTargetNpcIds)
  const targetNpcs = targetNpcIds
    .map((id) => getNpcById(id))
    .filter((npc): npc is NonNullable<typeof npc> => npc !== null)
  const isAnswerReveal = gamePhase === 'timedOut'
  const isVisible = gamePhase === 'playing' || isAnswerReveal
  const shouldMountPreview = gamePhase === 'preparing' || isVisible
  const targetCount = targetNpcs.length
  const previewSize = getTargetPreviewSize(targetCount)
  const useCompactGrid = targetCount > 1

  if (!shouldMountPreview || targetCount === 0) {
    return null
  }

  return (
    <aside
      className={`pointer-events-none absolute top-5 right-5 z-30 hidden max-h-[calc(100dvh-2.5rem)] overflow-y-auto overscroll-contain rounded-2xl border p-3 text-white shadow-2xl backdrop-blur-md lg:block w-auto ${
        isAnswerReveal
          ? 'border-amber-300/40 bg-amber-950/85'
          : 'border-white/20 bg-neutral-950/85'
      } ${isVisible ? '' : 'invisible'}`}
      aria-hidden={!isVisible}
    >
      <p
        className={`text-[0.6rem] font-semibold uppercase tracking-[0.28em] ${
          isAnswerReveal ? 'text-amber-200/90' : 'text-neutral-400'
        }`}
      >
        {isAnswerReveal ? 'Answer' : targetCount > 1 ? 'Targets' : 'Target'}
        {targetCount > 1 ? ` (${targetCount})` : ''}
      </p>
      <div className={`mt-1.5 grid gap-1.5 ${useCompactGrid ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {targetNpcs.map((npc, index) => {
          const isFound = foundTargetNpcIds.includes(npc.id)

          return (
          <div
            key={npc.id}
            className={`min-w-0 ${
              useCompactGrid && targetCount % 2 === 1 && index === targetCount - 1
                ? 'col-span-2 mx-auto w-28'
                : ''
            } ${isFound ? 'opacity-80' : ''}`}
          >
            <p
              className={`font-black text-base ${
                isAnswerReveal ? 'text-amber-100' : isFound ? 'text-emerald-300' : ''
              }`}
            >
              #{npc.meebitNumber}
            </p>
            <div className="relative mt-0.5">
              <TargetPreview
                meebitNumber={npc.meebitNumber}
                modelScale={1.06}
                sizeClassName={`${previewSize} ${isFound ? 'opacity-55' : ''}`}
              />
              {isFound ? (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-emerald-500/15">
                  <FoundTargetIcon className="size-7 text-emerald-300" />
                </span>
              ) : null}
            </div>
          </div>
          )
        })}
      </div>
      {isAnswerReveal ? (
        <p className="mt-2 text-[0.65rem] leading-snug text-amber-100/80">
          Follow the golden glow in the gallery.
        </p>
      ) : null}
    </aside>
  )
}
