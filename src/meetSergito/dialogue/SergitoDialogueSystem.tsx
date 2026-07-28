import { useEffect } from 'react'
import { getLocale } from '../../i18n/locale'
import { useDialogueStore } from '../../dialogue/dialogueStore'
import { useMeetSergitoStore } from '../store'
import { handleSergitoDialogueKeyDown } from './interactWithSergito'

export function SergitoDialogueSystem() {
  useEffect(() => {
    window.addEventListener('keydown', handleSergitoDialogueKeyDown)
    return () => window.removeEventListener('keydown', handleSergitoDialogueKeyDown)
  }, [])

  return null
}

/** PC 向けの近接ヒントのみ（SP の Talk は MobileControls 側） */
export function SergitoInteractionPrompt() {
  const canTalk = useMeetSergitoStore((state) => state.canTalkToSergito)
  const isOpen = useDialogueStore((state) => state.isOpen)
  const locale = getLocale()

  if (!canTalk || isOpen) return null

  const label = locale === 'ja' ? 'E · 話す' : 'E · Talk'

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 hidden justify-center lg:flex">
      <p className="rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
        {label}
      </p>
    </div>
  )
}
