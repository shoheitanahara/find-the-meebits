import { useEffect, useState } from 'react'
import { getLocale } from '../i18n/locale'
import { playSfx } from './sfx'

const copy = {
  en: {
    trigger: 'Back to Park',
    title: 'Leave this attraction?',
    description: 'Your current game will end and you will return to Meebits Park.',
    cancel: 'Keep playing',
    confirm: 'Return to Park',
  },
  ja: {
    trigger: 'パークへ戻る',
    title: 'アトラクションを終了しますか？',
    description: '現在のゲームを終了して、ミービッツ・パークへ戻ります。',
    cancel: 'ゲームを続ける',
    confirm: 'パークへ戻る',
  },
} as const

export function ParkReturnButton() {
  const [isConfirming, setIsConfirming] = useState(false)
  const locale = getLocale()
  const t = copy[locale]

  useEffect(() => {
    if (!isConfirming) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsConfirming(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isConfirming])

  const openConfirmation = () => {
    playSfx('uiClick')
    setIsConfirming(true)
  }

  const returnToPark = () => {
    playSfx('uiConfirm')
    const parkPath = locale === 'ja' ? '/jp/top' : '/top'
    const pathSegments = window.location.pathname.split('/').filter(Boolean)
    const attractionId = pathSegments.includes('8th-street')
      ? 'street'
      : pathSegments.includes('v2')
        ? 'traits'
        : 'find'
    window.location.assign(`${parkPath}?from=${attractionId}`)
  }

  return (
    <>
      <button
        type="button"
        onClick={openConfirmation}
        aria-expanded={isConfirming}
        className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[70] rounded-full border border-white/25 bg-neutral-950/80 px-3 py-2 text-[0.65rem] font-bold tracking-[0.08em] text-white/85 shadow-xl backdrop-blur-md transition hover:border-amber-300/60 hover:text-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
      >
        <span aria-hidden="true">←</span>&nbsp; {t.trigger}
      </button>

      {isConfirming ? (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-end bg-black/30 p-3 pt-[max(3.75rem,calc(env(safe-area-inset-top)+3.25rem))] backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsConfirming(false)
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="park-return-title"
            className="w-full max-w-xs rounded-2xl border border-white/20 bg-neutral-950/95 p-4 text-white shadow-2xl"
          >
            <h2 id="park-return-title" className="text-sm font-black">
              {t.title}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">{t.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                autoFocus
                onClick={() => setIsConfirming(false)}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-bold text-neutral-200 transition hover:bg-white/10"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={returnToPark}
                className="rounded-xl border border-amber-300/40 bg-amber-500/20 px-3 py-2.5 text-xs font-bold text-amber-100 transition hover:bg-amber-500/30"
              >
                {t.confirm}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
