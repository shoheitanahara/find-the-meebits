import { useEffect } from 'react'
import { useDialogueStore } from '../../dialogue/dialogueStore'
import { getLocale } from '../../i18n/locale'
import { handleMarketDialogueKeyDown } from './interactWithListing'
import { useOpenSeaMarketStore } from '../store'

export function MarketDialogueSystem() {
  useEffect(() => {
    window.addEventListener('keydown', handleMarketDialogueKeyDown)
    return () => window.removeEventListener('keydown', handleMarketDialogueKeyDown)
  }, [])
  return null
}

export function MarketInteractionPrompt() {
  const nearestTalkTokenId = useOpenSeaMarketStore((s) => s.nearestTalkTokenId)
  const isOpen = useDialogueStore((s) => s.isOpen)
  const locale = getLocale()

  if (nearestTalkTokenId == null || isOpen) return null
  const label = locale === 'ja' ? 'E · 話す' : 'E · Talk'

  return (
    <div className="pointer-events-none absolute bottom-28 left-1/2 z-20 -translate-x-1/2 max-lg:bottom-36">
      <div className="rounded-full border border-sky-300/40 bg-[#0c1828]/85 px-4 py-2 text-xs font-semibold tracking-wide text-sky-100 shadow-lg backdrop-blur-md">
        {label}
        <span className="ml-2 font-mono text-sky-300/80">#{nearestTalkTokenId}</span>
      </div>
    </div>
  )
}
