import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { useTouchControlsStore } from '../../stores/touchControlsStore'
import { shoreFishingUi } from '../i18n'
import { isShoreFishingBusy, useShoreFishingStore } from '../store'
import { PHONE_LAND_MOBILE_BAR } from '../../ui/phoneLandscape'

const JOYSTICK_RADIUS = 44
const BASE_SIZE = 112
const KNOB_SIZE = 44

/** パークと同じジョイスティック + 右にキャスト／アワセ。 */
export function ShoreFishingMobileControls() {
  const phase = useShoreFishingStore((s) => s.phase)
  if (phase !== 'playing' && phase !== 'countdown') return null

  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden ${PHONE_LAND_MOBILE_BAR}`}>
      <div className="flex items-end justify-between gap-3">
        <VirtualJoystick />
        <CastHookButton />
      </div>
    </div>
  )
}

function CastHookButton() {
  const castPhase = useShoreFishingStore((s) => s.castPhase)
  const nearShore = useShoreFishingStore((s) => s.nearShore)
  const pendingFishId = useShoreFishingStore((s) => s.pendingFishId)
  const phase = useShoreFishingStore((s) => s.phase)
  const t = shoreFishingUi()

  if (phase !== 'playing') return <div className="h-20 w-20 shrink-0" />

  const isBite = castPhase === 'bite'
  const canCast = castPhase === 'ready' && nearShore
  const waitingFish = castPhase === 'approach' && !pendingFishId
  const canHook =
    castPhase === 'bite' ||
    castPhase === 'nibble' ||
    castPhase === 'approach' ||
    castPhase === 'casting'
  const enabled = canCast || canHook
  const label = canCast ? t.cast : waitingFish ? t.cancel : t.hook

  return (
    <button
      type="button"
      disabled={!enabled}
      className={`pointer-events-auto flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 text-white shadow-2xl backdrop-blur-md transition active:scale-95 disabled:opacity-35 ${
        isBite
          ? 'animate-pulse border-red-300/80 bg-red-600/90'
          : canCast
            ? 'border-cyan-200/55 bg-neutral-950/85'
            : 'border-white/40 bg-neutral-950/85'
      }`}
      onPointerDown={(event) => {
        event.preventDefault()
        if (!enabled) return
        void unlockAudioIfNeeded()
        const store = useShoreFishingStore.getState()
        if (store.castPhase === 'ready') {
          if (store.tryCast()) playSfx('uiClick')
          return
        }
        if (store.tryHook()) {
          const after = useShoreFishingStore.getState()
          playSfx(after.lastCatch ? 'targetFound' : 'uiClick')
        } else {
          playSfx('uiClick')
        }
      }}
    >
      <span className="text-[0.65rem] font-black uppercase tracking-[0.12em]">{label}</span>
    </button>
  )
}

function VirtualJoystick() {
  const baseRef = useRef<HTMLDivElement>(null)
  const pointerIdRef = useRef<number | null>(null)
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 })
  const setJoystick = useTouchControlsStore((state) => state.setJoystick)
  const resetJoystick = useTouchControlsStore((state) => state.resetJoystick)
  const castPhase = useShoreFishingStore((s) => s.castPhase)
  const locked = isShoreFishingBusy(castPhase)

  useEffect(() => () => resetJoystick(), [resetJoystick])

  const updateJoystick = (clientX: number, clientY: number) => {
    if (locked) return
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
    if (locked) return
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
      className={`pointer-events-auto relative ml-1 touch-none select-none ${locked ? 'opacity-40' : ''}`}
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
