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

/** Result card — same family as Find the Meebits ClearOverlay. */
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
    <div className="pointer-events-auto absolute inset-0 z-50 overflow-y-auto bg-neutral-950/75 p-4 backdrop-blur-sm max-lg:py-[max(1rem,env(safe-area-inset-top))] lg:grid lg:place-items-center lg:p-6">
      <section className="mx-auto w-full max-w-lg rounded-[2rem] border border-white/15 bg-white p-6 text-neutral-950 shadow-2xl max-lg:my-auto sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
          {copy.clearedEyebrow}
        </p>
        <h2 className="mt-3 font-[family-name:Georgia,Times_New_Roman,serif] text-3xl font-black tracking-tight sm:text-4xl">
          {copy.clearedHeadline}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">{copy.clearedBody}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
              {copy.clearTime}
            </p>
            <p className="mt-1 text-2xl font-black">{formatClearTime(clearTimeSeconds)}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
              {copy.mistakes}
            </p>
            <p className="mt-1 text-2xl font-black">{mistakeCount}</p>
          </div>
        </div>

        <button
          type="button"
          className="mt-7 w-full rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800"
          onClick={handlePlayAgain}
        >
          {copy.playAgain}
        </button>
      </section>
    </div>
  )
}
