import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { getLocale } from '../../i18n/locale'
import { useTouchControlsStore } from '../../stores/touchControlsStore'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { useRunwayStore } from '../store'

const JOYSTICK_RADIUS = 44
const BASE_SIZE = 112
const KNOB_SIZE = 44

const copy = {
  en: { sit: 'Sit', stand: 'Stand', hint: 'E · Sit' },
  ja: { sit: '座る', stand: '立つ', hint: 'E · 座る' },
} as const

/** モバイル: ジョイスティック + Sit / Stand */
export function RunwayMobileControls() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="flex items-end justify-between gap-3">
        <VirtualJoystick />
        <RunwaySitButton />
      </div>
    </div>
  )
}

/** PC: 空席付近で Sit ヒント */
export function RunwaySitPrompt() {
  const nearestEmptySeatIndex = useRunwayStore((state) => state.nearestEmptySeatIndex)
  const playerSeatIndex = useRunwayStore((state) => state.playerSeatIndex)
  const locale = getLocale()
  const t = copy[locale]

  if (playerSeatIndex !== null) {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 hidden justify-center lg:flex">
        <p className="rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
          E · {t.stand}
        </p>
      </div>
    )
  }

  if (nearestEmptySeatIndex === null) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 hidden justify-center lg:flex">
      <p className="rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
        {t.hint}
      </p>
    </div>
  )
}

export function useRunwaySitKeyboard() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyE') return
      if (useRunwayStore.getState().phase !== 'playing') return

      const { playerSeatIndex, nearestEmptySeatIndex, sitAtSeat, standUp } = useRunwayStore.getState()
      event.preventDefault()

      if (playerSeatIndex !== null) {
        void unlockAudioIfNeeded().then(() => {
          playSfx('uiConfirm')
          standUp()
        })
        return
      }

      if (nearestEmptySeatIndex === null) return
      void unlockAudioIfNeeded().then(() => {
        playSfx('uiConfirm')
        sitAtSeat(nearestEmptySeatIndex)
      })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

function RunwaySitButton() {
  const nearestEmptySeatIndex = useRunwayStore((state) => state.nearestEmptySeatIndex)
  const playerSeatIndex = useRunwayStore((state) => state.playerSeatIndex)
  const sitAtSeat = useRunwayStore((state) => state.sitAtSeat)
  const standUp = useRunwayStore((state) => state.standUp)
  const locale = getLocale()
  const t = copy[locale]

  const isSitting = playerSeatIndex !== null
  const canSit = nearestEmptySeatIndex !== null

  if (!isSitting && !canSit) {
    return <div className="h-20 w-20 shrink-0" />
  }

  return (
    <button
      type="button"
      className="pointer-events-auto flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-white/50 bg-neutral-950/85 text-white shadow-2xl backdrop-blur-md active:scale-95"
      onPointerDown={(event) => {
        event.preventDefault()
        void unlockAudioIfNeeded().then(() => {
          playSfx('uiConfirm')
          if (isSitting) {
            standUp()
          } else if (nearestEmptySeatIndex !== null) {
            sitAtSeat(nearestEmptySeatIndex)
          }
        })
      }}
    >
      <SitIcon sitting={isSitting} />
      <span className="mt-1 text-[0.6rem] font-black uppercase tracking-[0.15em]">
        {isSitting ? t.stand : t.sit}
      </span>
    </button>
  )
}

function SitIcon({ sitting }: { sitting: boolean }) {
  if (sitting) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M7 20v-2m10 2v-2M12 4v3M8.5 7.5h7M7 11h10l-1 7H8l-1-7z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 20v-1.5M16 20v-1.5M9 10.5h6l.8 4.5H8.2L9 10.5zM10 10.5V8a2 2 0 1 1 4 0v2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function VirtualJoystick() {
  const baseRef = useRef<HTMLDivElement>(null)
  const pointerIdRef = useRef<number | null>(null)
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 })
  const setJoystick = useTouchControlsStore((state) => state.setJoystick)
  const resetJoystick = useTouchControlsStore((state) => state.resetJoystick)

  useEffect(() => () => resetJoystick(), [resetJoystick])

  const updateJoystick = (clientX: number, clientY: number) => {
    const base = baseRef.current
    if (!base) return

    const rect = base.getBoundingClientRect()
    const dx = clientX - (rect.left + rect.width / 2)
    const dy = clientY - (rect.top + rect.height / 2)
    const distance = Math.hypot(dx, dy)
    const clampedDistance = Math.min(distance, JOYSTICK_RADIUS)
    const angle = Math.atan2(dy, dx)
    const x = Math.cos(angle) * clampedDistance
    const y = Math.sin(angle) * clampedDistance

    setKnobOffset({ x, y })
    setJoystick(x / JOYSTICK_RADIUS, y / JOYSTICK_RADIUS, clampedDistance > 6)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    pointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    updateJoystick(event.clientX, event.clientY)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    event.preventDefault()
    updateJoystick(event.clientX, event.clientY)
  }

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    pointerIdRef.current = null
    setKnobOffset({ x: 0, y: 0 })
    resetJoystick()
  }

  return (
    <div
      className="pointer-events-auto relative ml-1 touch-none select-none"
      style={{ width: BASE_SIZE, height: BASE_SIZE }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div
        ref={baseRef}
        className="absolute left-1/2 top-1/2 rounded-full border-2 border-white/35 bg-sky-950/55 shadow-xl backdrop-blur-sm"
        style={{
          width: BASE_SIZE,
          height: BASE_SIZE,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        className="absolute rounded-full border-2 border-white/70 bg-white/35 shadow-lg"
        style={{
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          left: `calc(50% + ${knobOffset.x}px)`,
          top: `calc(50% + ${knobOffset.y}px)`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}
