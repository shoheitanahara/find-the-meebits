import { useEffect, useState } from 'react'
import {
  resolveMeebitTraitVisual,
  type MeebitTraitVisual,
} from '../data/meebitTraitRenders'

type TraitQuestVisualProps = {
  traitType: string
  traitValue: string
  sizeClassName?: string
  className?: string
}

/** Trait swatch / render for /v2 quest HUD. */
export function TraitQuestVisual({
  traitType,
  traitValue,
  sizeClassName = 'h-28 w-28',
  className = '',
}: TraitQuestVisualProps) {
  const [visual, setVisual] = useState<MeebitTraitVisual | null>(null)

  useEffect(() => {
    let cancelled = false
    resolveMeebitTraitVisual(traitType, traitValue).then((next) => {
      if (!cancelled) setVisual(next)
    })
    return () => {
      cancelled = true
    }
  }, [traitType, traitValue])

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-black/10 bg-white ${sizeClassName} ${className}`}
      aria-hidden
    >
      {visual?.kind === 'image' ? (
        <img
          alt=""
          className="h-full w-full object-contain p-1"
          src={visual.path}
          draggable={false}
        />
      ) : visual?.kind === 'color' ? (
        <div className="h-full w-full" style={{ backgroundColor: visual.hex }} />
      ) : (
        <div className="flex h-full w-full items-center justify-center px-2 text-center text-[0.65rem] font-bold leading-tight text-neutral-500">
          {traitValue}
        </div>
      )}
    </div>
  )
}
