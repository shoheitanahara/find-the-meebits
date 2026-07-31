import { useEffect } from 'react'
import { getLocale } from '../i18n/locale'
import { playSfx } from '../ui/sfx'
import { usePlayerStore } from '../stores/playerStore'
import { ABOUT_MEEBITS_URL } from './aboutMeebits'
import { useTopStore } from './topStore'

/** Culture 看板から開くアプリ内ブラウザ。 */
export function AboutMeebitsBrowser() {
  const open = useTopStore((state) => state.aboutBrowserOpen)
  const locale = getLocale()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        event.preventDefault()
        closeAboutBrowser()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  const title = 'About Meebits'
  const back = locale === 'ja' ? '戻る' : 'Back'

  return (
    <div className="pointer-events-auto absolute inset-0 z-[80] flex items-center justify-center bg-[#070914]/72 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex h-[min(860px,calc(100dvh-1.5rem))] w-[min(980px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-[#5ce0ff]/35 bg-[#0b1220] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-center gap-3 border-b border-[#5ce0ff]/20 bg-[#121a2c] px-3 py-2.5 sm:px-4">
          <button
            type="button"
            className="rounded-full border border-[#8fdfff]/50 bg-[#182438] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#dff8ff] transition hover:bg-[#243858] active:scale-95"
            onClick={closeAboutBrowser}
          >
            {back}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.65rem] uppercase tracking-[0.18em] text-[#8fdfff]">
              {title}
            </p>
            <p className="truncate text-[0.7rem] text-[#9eb4d4]">{ABOUT_MEEBITS_URL}</p>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-[#10182a]">
          <iframe
            title={title}
            src={ABOUT_MEEBITS_URL}
            className="h-full w-full border-0 bg-white"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  )
}

export function openAboutBrowser() {
  usePlayerStore.getState().setMovementLocked(true)
  useTopStore.getState().setAboutBrowserOpen(true)
  playSfx('uiConfirm')
}

export function closeAboutBrowser() {
  useTopStore.getState().setAboutBrowserOpen(false)
  usePlayerStore.getState().setMovementLocked(false)
  playSfx('uiClick')
}

export function interactWithAboutMeebitsBoard(): boolean {
  const top = useTopStore.getState()
  if (!top.started || top.aboutBrowserOpen) return false
  if (!top.nearestAboutBoard) return false
  openAboutBrowser()
  return true
}
