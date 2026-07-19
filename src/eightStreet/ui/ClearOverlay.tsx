import { useEffect, useRef } from 'react'
import { eightStreetUi } from '../i18n'
import { useEightStreetStore } from '../store'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'

function formatClearTime(seconds: number | null) {
  if (seconds == null || !Number.isFinite(seconds)) return '--:--'
  const total = Math.max(0, Math.floor(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Clear screen — title-screen restraint, light/white so “clear” reads instantly. */
export function EightStreetClearOverlay() {
  const phase = useEightStreetStore((state) => state.phase)
  const clearTimeSeconds = useEightStreetStore((state) => state.clearTimeSeconds)
  const mistakeCount = useEightStreetStore((state) => state.mistakeCount)
  const playAgain = useEightStreetStore((state) => state.playAgain)
  const copy = eightStreetUi()
  const isVisible = phase === 'cleared'
  const wasVisibleRef = useRef(false)

  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) {
      void unlockAudioIfNeeded()
      playSfx('clear')
    }
    wasVisibleRef.current = isVisible
  }, [isVisible])

  const handlePlayAgain = () => {
    void unlockAudioIfNeeded()
    playSfx('uiConfirm')
    playAgain()
  }

  useEffect(() => {
    if (!isVisible) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Enter' || event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      event.preventDefault()
      handlePlayAgain()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_35%_8%,#ffffff_0%,#f4f6f8_48%,#e8ecf1_100%)] px-6 text-center text-slate-900">
      <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-amber-700/80">
        {copy.clearedEyebrow}
      </p>
      <h1 className="max-w-lg font-[family-name:Georgia,Times_New_Roman,serif] text-4xl tracking-tight text-slate-950 sm:text-5xl">
        {copy.clearedHeadline}
      </h1>
      <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-500">
        {copy.clearedBody}
      </p>

      <dl className="mt-10 flex items-start justify-center gap-10 text-slate-900">
        <div>
          <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-slate-400">
            {copy.clearTime}
          </dt>
          <dd className="mt-1.5 font-[family-name:Georgia,Times_New_Roman,serif] text-3xl tracking-tight">
            {formatClearTime(clearTimeSeconds)}
          </dd>
        </div>
        <div className="w-px self-stretch bg-slate-200" aria-hidden />
        <div>
          <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-slate-400">
            {copy.mistakes}
          </dt>
          <dd className="mt-1.5 font-[family-name:Georgia,Times_New_Roman,serif] text-3xl tracking-tight">
            {mistakeCount}
          </dd>
        </div>
      </dl>

      <div className="mt-10 w-full max-w-xs">
        <button
          type="button"
          className="w-full rounded-md bg-amber-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-amber-400"
          onClick={handlePlayAgain}
        >
          {copy.playAgain}
        </button>
      </div>
    </div>
  )
}
