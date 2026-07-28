import { useEffect } from 'react'
import { getLocale } from '../../i18n/locale'
import { useDialogueStore } from '../../dialogue/dialogueStore'
import { useMeetSergitoStore } from '../store'
import { handleSergitoDialogueKeyDown, tryInteractWithSergito } from './interactWithSergito'

export function SergitoDialogueSystem() {
  useEffect(() => {
    window.addEventListener('keydown', handleSergitoDialogueKeyDown)
    return () => window.removeEventListener('keydown', handleSergitoDialogueKeyDown)
  }, [])

  return null
}

export function SergitoInteractionPrompt() {
  const canTalk = useMeetSergitoStore((state) => state.canTalkToSergito)
  const isOpen = useDialogueStore((state) => state.isOpen)
  const locale = getLocale()

  if (!canTalk || isOpen) return null

  const label = locale === 'ja' ? 'E · 話す' : 'E · Talk'

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 hidden justify-center lg:flex">
        <p className="rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
          {label}
        </p>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-[max(6.5rem,calc(env(safe-area-inset-bottom)+5rem))] z-30 flex justify-end px-4 lg:hidden">
        <button
          type="button"
          className="pointer-events-auto rounded-full border-2 border-[#d4a060]/50 bg-[#1a140c]/90 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#f4ead2] shadow-xl backdrop-blur-md active:scale-95"
          onClick={tryInteractWithSergito}
        >
          {locale === 'ja' ? '話す' : 'Talk'}
        </button>
      </div>
    </>
  )
}
