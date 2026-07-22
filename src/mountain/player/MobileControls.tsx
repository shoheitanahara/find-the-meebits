import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { getLocale } from '../../i18n/locale'
import { MOUNTAIN } from '../config'
import { useMountainControlsStore } from '../controlsStore'

const JOYSTICK_RADIUS = 48
const BASE_SIZE = 120
const KNOB_SIZE = 46

const copy = {
  en: { jump: 'Jump', dashHint: 'Outer stick = Dash' },
  ja: { jump: 'ジャンプ', dashHint: 'スティック外側 = ダッシュ' },
} as const

export function MountainMobileControls() {
  const t = copy[getLocale()]

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
      <p className="mb-2 text-center text-[0.65rem] text-white/55">{t.dashHint}</p>
      <div className="flex items-end justify-between gap-3">
        <VirtualJoystick />
        <button
          type="button"
          className="pointer-events-auto mb-2 h-16 w-16 rounded-full border border-white/40 bg-black/45 text-xs font-bold uppercase tracking-wide text-white shadow-xl backdrop-blur active:scale-95"
          onPointerDown={(event) => {
            event.preventDefault()
            useMountainControlsStore.getState().setJumpPressed(true)
          }}
          onPointerUp={() => useMountainControlsStore.getState().setJumpPressed(false)}
          onPointerCancel={() => useMountainControlsStore.getState().setJumpPressed(false)}
        >
          {t.jump}
        </button>
      </div>
    </div>
  )
}

function VirtualJoystick() {
  const baseRef = useRef<HTMLDivElement>(null)
  const pointerIdRef = useRef<number | null>(null)
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 })
  const setJoystick = useMountainControlsStore((state) => state.setJoystick)
  const resetJoystick = useMountainControlsStore((state) => state.resetJoystick)

  useEffect(() => () => resetJoystick(), [resetJoystick])

  const updateJoystick = (clientX: number, clientY: number) => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = clientX - cx
    let dy = clientY - cy
    const dist = Math.hypot(dx, dy)
    const clamped = Math.min(dist, JOYSTICK_RADIUS)
    if (dist > 0) {
      dx = (dx / dist) * clamped
      dy = (dy / dist) * clamped
    }
    setKnobOffset({ x: dx, y: dy })
    const nx = dx / JOYSTICK_RADIUS
    const ny = dy / JOYSTICK_RADIUS
    const magnitude = Math.min(1, Math.hypot(nx, ny))
    setJoystick(nx, ny, true, magnitude)
    // 外縁押し込みでダッシュ（PC の Shift 相当）
    useMountainControlsStore
      .getState()
      .setDashHeld(magnitude >= MOUNTAIN.dashOuterThreshold)
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    pointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    updateJoystick(event.clientX, event.clientY)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    updateJoystick(event.clientX, event.clientY)
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    pointerIdRef.current = null
    setKnobOffset({ x: 0, y: 0 })
    resetJoystick()
    useMountainControlsStore.getState().setDashHeld(false)
  }

  return (
    <div
      ref={baseRef}
      className="pointer-events-auto relative touch-none rounded-full border border-white/30 bg-black/35 shadow-xl backdrop-blur"
      style={{ width: BASE_SIZE, height: BASE_SIZE }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="absolute rounded-full bg-white/80 shadow"
        style={{
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          left: BASE_SIZE / 2 - KNOB_SIZE / 2 + knobOffset.x,
          top: BASE_SIZE / 2 - KNOB_SIZE / 2 + knobOffset.y,
        }}
      />
    </div>
  )
}
