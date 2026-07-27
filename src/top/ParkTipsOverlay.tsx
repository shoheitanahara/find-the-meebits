import { useEffect } from 'react'
import { getLocale } from '../i18n/locale'
import { ui } from '../i18n/ui'
import { playSfx, unlockAudioIfNeeded } from '../ui/sfx'
import { getParkTips } from './parkTips'

function RedMarkerIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-red-700 shadow-[0_0_10px_rgba(185,28,28,0.55)] ${className}`}
      aria-hidden
    />
  )
}

/** 初期スポーン前のみ。Find the Meebit と同系統の TIPS。 */
export function ParkTipsOverlay({ onConfirm }: { onConfirm: () => void }) {
  const locale = getLocale()
  const t = ui()
  const park = getParkTips(locale)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Enter') return
      if (event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      event.preventDefault()
      onConfirm()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onConfirm])

  return (
    <div className="pointer-events-auto absolute inset-0 z-[45] grid place-items-center bg-[#070914]/75 p-4 backdrop-blur-sm max-lg:px-3 max-lg:py-[max(1rem,env(safe-area-inset-top))]">
      <section className="w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-[#d4b46a]/35 bg-[#0c0d18]/95 p-5 text-[#f4ead2] shadow-2xl max-lg:max-h-[calc(100dvh-2rem)] max-lg:overflow-y-auto max-lg:p-4 lg:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#caa75b]">{t.tips}</p>
        <h2 className="mt-2 font-[family-name:Georgia,Times_New_Roman,serif] text-2xl tracking-tight lg:text-3xl">
          {t.beforeStart}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#b8b2a6] max-lg:text-xs">{park.lead}</p>

        <ul className="mt-5 space-y-3">
          {park.tips.map((tip, index) => (
            <li
              key={tip.title}
              className="flex gap-3 rounded-2xl border border-[#d4b46a]/20 bg-[#141522]/80 px-3.5 py-3 max-lg:px-3 max-lg:py-2.5"
            >
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                {index === 0 ? (
                  <RedMarkerIcon className="size-5" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d4b46a] text-xs font-black text-[#1a1208]">
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black max-lg:text-xs">{tip.title}</p>
                <p className="mt-1 text-sm leading-snug text-[#b8b2a6] max-lg:text-xs">{tip.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-[#8f897e] max-lg:text-[0.65rem]">{park.controls}</p>

        <button
          type="button"
          className="mt-5 w-full rounded-lg border border-[#ead394]/50 bg-gradient-to-b from-[#b18a3f] to-[#7f5d22] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-[#fff9e9] shadow-[0_10px_30px_rgba(136,96,28,0.25)] transition hover:brightness-110 active:scale-[0.99] max-lg:py-3"
          onClick={() => {
            void unlockAudioIfNeeded().then(() => {
              playSfx('uiConfirm')
              onConfirm()
            })
          }}
        >
          {t.gotIt}
        </button>
      </section>
    </div>
  )
}
