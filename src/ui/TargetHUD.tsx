import { getNpcById } from '../npc/npcData'
import { ui } from '../i18n/ui'
import { useGameStore } from '../stores/gameStore'
import { FoundTargetIcon } from './FoundTargetIcon'
import { TARGET_HUD_PREVIEW_PRIORITY } from './targetPreviewCache'
import { TargetPreview } from './TargetPreview'
import { TraitQuestVisual } from './TraitQuestVisual'
import { getProgressionStep } from '../game/gameProgression'
import { questIgnoresColorAndPattern, formatTraitDisplayName } from '../game/traitHunt'

function getTargetPreviewSize(targetCount: number) {
  if (targetCount >= 3) {
    return 'h-28 w-28'
  }

  return 'h-36 w-36'
}

export function TargetHUD() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const venueId = useGameStore((state) => state.venueId)
  const progressionIndex = useGameStore((state) => state.progressionIndex)
  const targetNpcIds = useGameStore((state) => state.targetNpcIds)
  const foundTargetNpcIds = useGameStore((state) => state.foundTargetNpcIds)
  const step = getProgressionStep(progressionIndex, venueId)
  const quest = step?.quest
  const targetNpcs = targetNpcIds
    .map((id) => getNpcById(id))
    .filter((npc): npc is NonNullable<typeof npc> => npc !== null)
  const isAnswerReveal = gamePhase === 'timedOut'
  const isVisible = gamePhase === 'playing' || isAnswerReveal
  const shouldMountPreview = gamePhase === 'preparing' || isVisible
  const targetCount = targetNpcs.length
  const previewSize = getTargetPreviewSize(targetCount)
  const useCompactGrid = targetCount > 1
  const foundCount = foundTargetNpcIds.length
  const t = ui()

  if (!shouldMountPreview || targetCount === 0) {
    return null
  }

  // Trait hunt: show trait quest during play; stack found Meebit numbers below.
  if (quest && !isAnswerReveal) {
    const foundNpcs = foundTargetNpcIds
      .map((id) => getNpcById(id))
      .filter((npc): npc is NonNullable<typeof npc> => npc !== null)
    const remainingSlots = Math.max(0, quest.findCount - foundNpcs.length)

    return (
      <aside
        className={`pointer-events-none absolute top-5 right-5 z-30 hidden max-h-[calc(100dvh-2.5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-white/20 bg-neutral-950/85 p-3 text-white shadow-2xl backdrop-blur-md lg:block w-auto ${
          isVisible ? '' : 'invisible'
        }`}
        aria-hidden={!isVisible}
      >
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-neutral-400">
          {t.traitHunt}
        </p>
        <p className="mt-1 text-lg font-black leading-tight">
          {t.findTraitLabel(
            quest.findCount,
            formatTraitDisplayName(quest.traitType, quest.traitValue),
          )}
        </p>
        <TraitQuestVisual
          className="mt-2"
          traitType={quest.traitType}
          traitValue={quest.traitValue}
          sizeClassName="h-28 w-28"
        />
        {quest.traitType !== 'Tattoo' ? (
          <p className="mt-1 text-[0.65rem] leading-snug text-neutral-400">{quest.traitType}</p>
        ) : null}
        {questIgnoresColorAndPattern(quest) ? (
          <p className="mt-1 max-w-[9rem] text-[0.6rem] leading-snug text-amber-200/85">
            {t.traitIgnoreColor}
          </p>
        ) : null}

        <p className="mt-3 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-emerald-300/90">
          {t.foundProgress(foundCount, quest.findCount)}
        </p>
        <div className="mt-1.5 flex flex-col gap-1.5">
          {foundNpcs.map((npc) => (
            <div
              key={npc.id}
              className="flex items-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-950/40 px-1.5 py-1"
            >
              <TargetPreview
                meebitNumber={npc.meebitNumber}
                capturePriority={TARGET_HUD_PREVIEW_PRIORITY}
                modelScale={1.05}
                sizeClassName="h-14 w-14 shrink-0 rounded-lg"
              />
              <div className="min-w-0">
                <p className="text-sm font-black text-emerald-200">#{npc.meebitNumber}</p>
                <FoundTargetIcon className="mt-0.5 size-4 text-emerald-300" />
              </div>
            </div>
          ))}
          {Array.from({ length: remainingSlots }, (_, index) => (
            <div
              key={`empty-${index}`}
              className="flex h-[3.75rem] items-center gap-2 rounded-xl border border-dashed border-white/20 px-1.5 py-1"
            >
              <div className="h-14 w-14 shrink-0 rounded-lg bg-white/5" />
              <p className="text-xs font-semibold text-neutral-500">—</p>
            </div>
          ))}
        </div>
      </aside>
    )
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
        {isAnswerReveal ? t.answer : targetCount > 1 ? t.targets : t.target}
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
                capturePriority={TARGET_HUD_PREVIEW_PRIORITY}
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
          {t.followGoldGlow}
        </p>
      ) : null}
    </aside>
  )
}
