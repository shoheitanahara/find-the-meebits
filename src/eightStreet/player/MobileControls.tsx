import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useEightStreetControlsStore } from '../controlsStore'

const JOYSTICK_RADIUS = 44
const BASE_SIZE = 112
const KNOB_SIZE = 44

export function EightStreetMobileControls() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-end justify-between px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
      <MoveJoystick />
      <LookJoystick />
    </div>
  )
}

function MoveJoystick() {
  const setMove = useEightStreetControlsStore((state) => state.setMove)
  const resetMove = useEightStreetControlsStore((state) => state.resetMove)
  return (
    <VirtualStick
      onChange={(x, y) => {
        const magnitude = Math.hypot(x, y)
        // Outer ring of the stick = dash (Shift equivalent on mobile).
        setMove(x, y, magnitude >= 0.88)
      }}
      onEnd={resetMove}
      label="Move"
    />
  )
}

function LookJoystick() {
  const setLook = useEightStreetControlsStore((state) => state.setLook)
  const resetLook = useEightStreetControlsStore((state) => state.resetLook)
  return (
    <VirtualStick
      onChange={(x, y) => setLook(x, y)}
      onEnd={resetLook}
      label="Look"
    />
  )
}

function VirtualStick({
  onChange,
  onEnd,
  label,
}: {
  onChange: (x: number, y: number) => void
  onEnd: () => void
  label: string
}) {
  const baseRef = useRef<HTMLDivElement>(null)
  const pointerIdRef = useRef<number | null>(null)
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 })

  useEffect(() => () => onEnd(), [onEnd])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    pointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    updateFromEvent(event)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    updateFromEvent(event)
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    pointerIdRef.current = null
    setKnobOffset({ x: 0, y: 0 })
    onEnd()
  }

  const updateFromEvent = (event: ReactPointerEvent<HTMLDivElement>) => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = event.clientX - cx
    let dy = event.clientY - cy
    const len = Math.hypot(dx, dy)
    if (len > JOYSTICK_RADIUS) {
      dx = (dx / len) * JOYSTICK_RADIUS
      dy = (dy / len) * JOYSTICK_RADIUS
    }
    setKnobOffset({ x: dx, y: dy })
    onChange(dx / JOYSTICK_RADIUS, -(dy / JOYSTICK_RADIUS))
  }

  return (
    <div className="pointer-events-auto flex flex-col items-center gap-1">
      <div
        ref={baseRef}
        className="relative rounded-full border border-white/25 bg-neutral-950/45 shadow-xl backdrop-blur-md"
        style={{ width: BASE_SIZE, height: BASE_SIZE }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="absolute rounded-full bg-white/70"
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            left: BASE_SIZE / 2 - KNOB_SIZE / 2 + knobOffset.x,
            top: BASE_SIZE / 2 - KNOB_SIZE / 2 + knobOffset.y,
          }}
        />
      </div>
      <span className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-white/60">
        {label}
      </span>
    </div>
  )
}
