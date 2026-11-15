import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useTouchControlsStore } from '../../stores/touchControlsStore'
import { PHONE_LAND_MOBILE_BAR } from '../../ui/phoneLandscape'
import { ClubSeekButtons } from './ClubSeekButtons'
import { ClubSoundToggleButton } from './ClubUnmuteButton'

const JOYSTICK_RADIUS = 44
const BASE_SIZE = 112
const KNOB_SIZE = 44

/** モバイル: ジョイスティック左 + Seek / Sound 右下（座る UI なし） */
export function ClubMobileControls() {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden ${PHONE_LAND_MOBILE_BAR}`}
    >
      <div className="flex items-end justify-between gap-3">
        <VirtualJoystick />
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-end gap-2">
            <ClubSeekButtons variant="mobile" />
          </div>
          <ClubSoundToggleButton variant="mobile" />
        </div>
      </div>
    </div>
  )
}

/** PC: Seek と Sound on を下部中央に */
export function ClubDesktopControls() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 hidden justify-center lg:flex">
      <div className="flex items-center gap-2.5">
        <ClubSeekButtons variant="desktop" />
        <ClubSoundToggleButton variant="desktop" />
      </div>
    </div>
  )
}

function VirtualJoystick() {
  const baseRef = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const activeRef = useRef(false)

  const updateFromClient = (clientX: number, clientY: number) => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = clientX - cx
    let dy = clientY - cy
    const len = Math.hypot(dx, dy)
    if (len > JOYSTICK_RADIUS) {
      dx = (dx / len) * JOYSTICK_RADIUS
      dy = (dy / len) * JOYSTICK_RADIUS
    }
    setKnob({ x: dx, y: dy })
    useTouchControlsStore.getState().setJoystick(dx / JOYSTICK_RADIUS, dy / JOYSTICK_RADIUS, true)
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    activeRef.current = true
    updateFromClient(event.clientX, event.clientY)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!activeRef.current) return
    updateFromClient(event.clientX, event.clientY)
  }

  const onPointerUp = () => {
    activeRef.current = false
    setKnob({ x: 0, y: 0 })
    useTouchControlsStore.getState().resetJoystick()
  }

  return (
    <div
      ref={baseRef}
      className="pointer-events-auto relative touch-none rounded-full border border-white/20 bg-black/45"
      style={{ width: BASE_SIZE, height: BASE_SIZE }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="absolute left-1/2 top-1/2 rounded-full border border-white/30 bg-white/35"
        style={{
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
        }}
      />
    </div>
  )
}
