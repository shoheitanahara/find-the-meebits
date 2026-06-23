import { useEffect, useState } from 'react'
import { playSfx, unlockAudioIfNeeded } from './sfx'

type AfterHoursUnlockOverlayProps = {
  isVisible: boolean
  onComplete: () => void
}

export function AfterHoursUnlockOverlay({ isVisible, onComplete }: AfterHoursUnlockOverlayProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (!isVisible) {
      setIsMounted(false)
      return
    }

    setIsMounted(true)
    unlockAudioIfNeeded().then(() => playSfx('unlock'))

    const timerId = window.setTimeout(() => {
      onComplete()
    }, 2800)

    return () => window.clearTimeout(timerId)
  }, [isVisible, onComplete])

  if (!isVisible && !isMounted) {
    return null
  }

  return (
    <div
      className={`pointer-events-auto absolute inset-0 z-[70] overflow-hidden transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={() => {
        unlockAudioIfNeeded()
        playSfx('uiConfirm')
        onComplete()
      }}
    >
      <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md" />

      <div className="after-hours-unlock-orb after-hours-unlock-orb-left absolute left-[8%] top-[18%] h-56 w-56 rounded-full bg-fuchsia-500/35 blur-3xl" />
      <div className="after-hours-unlock-orb after-hours-unlock-orb-right absolute bottom-[12%] right-[6%] h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
      <div className="after-hours-unlock-orb after-hours-unlock-orb-center absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-400/20 blur-3xl" />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="after-hours-unlock-rise text-xs font-semibold uppercase tracking-[0.45em] text-fuchsia-300/90">
          New Venue
        </p>
        <h2 className="after-hours-unlock-pop mt-4 text-5xl font-black uppercase tracking-tight text-white max-lg:text-4xl">
          After Hours
        </h2>
        <p className="after-hours-unlock-pop-delay mt-2 text-6xl font-black uppercase tracking-[0.08em] text-fuchsia-300 max-lg:text-5xl">
          Unlocked!
        </p>
        <p className="after-hours-unlock-rise-delay mt-6 max-w-md text-sm font-medium leading-relaxed text-violet-100/85">
          The museum is yours. Head into the club and hunt Meebits under the lights.
        </p>
        <p className="after-hours-unlock-rise-delay mt-8 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-fuchsia-200/70">
          Tap to continue
        </p>
      </div>
    </div>
  )
}
