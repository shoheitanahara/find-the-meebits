import { useEffect, useState } from 'react'
import {
  getCachedMeebitTraitValue,
  getMeebitTraits,
  loadMeebitTraitsDataset,
} from '../data/meebitTraits'
import { getProgressionStep } from '../game/gameProgression'
import { formatTraitDisplayName } from '../game/traitHunt'
import { useGameStore } from '../stores/gameStore'
import { TraitQuestVisual } from '../ui/TraitQuestVisual'

type DialogueTraitCompareProps = {
  meebitNumber: number
  compact?: boolean
}

type TraitLookup =
  | { status: 'loading' }
  | { status: 'ready'; value: string | null }

/** In /v2, show the NPC's trait inline next to the Meebit ID row. */
export function DialogueTraitCompare({ meebitNumber, compact = false }: DialogueTraitCompareProps) {
  const venueId = useGameStore((state) => state.venueId)
  const progressionIndex = useGameStore((state) => state.progressionIndex)
  const step = getProgressionStep(progressionIndex, venueId)
  const quest = step?.quest

  const [lookup, setLookup] = useState<TraitLookup>(() => {
    if (!quest) return { status: 'ready', value: null }
    const cached = getCachedMeebitTraitValue(meebitNumber, quest.traitType)
    // Cache miss can mean "dataset not loaded" OR "trait absent" — resolve async.
    if (cached !== null) return { status: 'ready', value: cached }
    return { status: 'loading' }
  })

  useEffect(() => {
    if (!quest) {
      setLookup({ status: 'ready', value: null })
      return
    }

    let cancelled = false

    const apply = (value: string | null) => {
      if (!cancelled) setLookup({ status: 'ready', value })
    }

    void (async () => {
      await loadMeebitTraitsDataset()
      if (cancelled) return
      const value = getCachedMeebitTraitValue(meebitNumber, quest.traitType)
      if (value !== null) {
        apply(value)
        return
      }
      const traits = await getMeebitTraits(meebitNumber)
      apply(traits?.[quest.traitType] ?? null)
    })()

    return () => {
      cancelled = true
    }
  }, [meebitNumber, quest])

  if (!quest) {
    return null
  }

  const label =
    lookup.status === 'loading'
      ? '…'
      : lookup.value
        ? formatTraitDisplayName(quest.traitType, lookup.value)
        : 'none'

  return (
    <div className="flex items-center gap-2">
      {lookup.status === 'ready' && lookup.value ? (
        <TraitQuestVisual
          traitType={quest.traitType}
          traitValue={lookup.value}
          sizeClassName={compact ? 'h-12 w-12 rounded-lg' : 'h-14 w-14 rounded-xl'}
        />
      ) : (
        <div
          className={`flex shrink-0 items-center justify-center bg-slate-200/80 text-[0.65rem] font-bold text-slate-500 ${
            compact ? 'h-12 w-12 rounded-lg' : 'h-14 w-14 rounded-xl'
          }`}
        >
          {lookup.status === 'ready' ? '—' : ''}
        </div>
      )}
      <p
        className={`max-w-[8rem] truncate font-semibold text-slate-700 ${
          compact ? 'text-xs' : 'text-sm'
        }`}
      >
        {label}
      </p>
    </div>
  )
}
