import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { getLocale } from '../../i18n/locale'
import { useTouchControlsStore } from '../../stores/touchControlsStore'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { useCinemaStore } from '../store'
import { PHONE_LAND_MOBILE_BAR } from '../../ui/phoneLandscape'
import { CinemaSeekButtons } from './CinemaSeekButtons'
import { CinemaSoundToggleButton } from './CinemaUnmuteButton'

const JOYSTICK_RADIUS = 44
const BASE_SIZE = 112
const KNOB_SIZE = 44

const copy = {
  en: { sit: 'Sit', stand: 'Stand', key: 'E' },
  ja: { sit: '座る', stand: '立つ', key: 'E' },
} as const

/** モバイル: ジョイスティック左 + Sound / Sit 右下 */
export function CinemaMobileControls() {
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden ${PHONE_LAND_MOBILE_BAR}`}>
      <div className="flex items-end justify-between gap-3">
        <VirtualJoystick />
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-end gap-2">
            <CinemaSeekButtons variant="mobile" />
          </div>
          <div className="flex items-end gap-2.5">
            <CinemaSoundToggleButton variant="mobile" />
            <CinemaSitButton />
          </div>
        </div>
      </div>
    </div>
  )
}

/** PC: Sound on と Sit / Stand ヒントを下部に並べる */
export function CinemaSitPrompt() {
  const nearestEmptySeatIndex = useCinemaStore((state) => state.nearestEmptySeatIndex)
  const playerSeatIndex = useCinemaStore((state) => state.playerSeatIndex)
  const locale = getLocale()
  const t = copy[locale]

  const actionLabel =
    playerSeatIndex !== null ? t.stand : nearestEmptySeatIndex !== null ? t.sit : null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 hidden justify-center lg:flex">
      <div className="flex items-center gap-2.5">
        <CinemaSeekButtons variant="desktop" />
        <CinemaSoundToggleButton variant="desktop" />
        {actionLabel ? (
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-2 text-white/80 backdrop-blur-md">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.16em]">{actionLabel}</span>
            <kbd className="rounded border border-white/25 bg-white/10 px-1.5 py-0.5 text-[0.58rem] font-bold tracking-[0.08em] text-white/70">
              {t.key}
            </kbd>
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function useCinemaSitKeyboard() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyE') return
      if (useCinemaStore.getState().phase !== 'playing') return

      const { playerSeatIndex, nearestEmptySeatIndex, sitAtSeat, standUp } = useCinemaStore.getState()
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

function CinemaSitButton() {
  const nearestEmptySeatIndex = useCinemaStore((state) => state.nearestEmptySeatIndex)
  const playerSeatIndex = useCinemaStore((state) => state.playerSeatIndex)
  const sitAtSeat = useCinemaStore((state) => state.sitAtSeat)
  const standUp = useCinemaStore((state) => state.standUp)
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
