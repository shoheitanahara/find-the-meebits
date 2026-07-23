import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useTouchControlsStore } from '../stores/touchControlsStore'
import { useNpcStore } from '../stores/npcStore'
import { useDialogueStore } from '../dialogue/dialogueStore'
import { ui } from '../i18n/ui'
import {
  advanceParkDialogue,
  interactWithNearestParkNpc,
} from './interactWithParkNpc'
import { getParkNpcById } from './parkNpcRegistry'
import { unlockAudioIfNeeded } from '../ui/sfx'
import { DoneIcon, InspectIcon, NextIcon } from '../ui/mobile/MobileActionIcons'

const JOYSTICK_RADIUS = 44
const BASE_SIZE = 112
const KNOB_SIZE = 44

export function TopMobileControls() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="flex items-end justify-between gap-3">
        <VirtualJoystick />
        <ParkTalkButton />
      </div>
    </div>
  )
}

function ParkTalkButton() {
  const nearestNpcId = useNpcStore((state) => state.nearestNpcId)
  const isDialogueOpen = useDialogueStore((state) => state.isOpen)
  const lines = useDialogueStore((state) => state.lines)
  const currentIndex = useDialogueStore((state) => state.currentIndex)
  const t = ui()
  const canTalk = Boolean(nearestNpcId && getParkNpcById(nearestNpcId))
  const isLastLine = currentIndex >= lines.length - 1

  if (isDialogueOpen) {
    return (
      <button
        type="button"
        className="pointer-events-auto flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-white/50 bg-neutral-950/90 text-white shadow-2xl backdrop-blur-md active:scale-95"
        onPointerDown={(event) => {
          event.preventDefault()
          void unlockAudioIfNeeded()
          advanceParkDialogue()
        }}
      >
        {isLastLine ? <DoneIcon /> : <NextIcon />}
        <span className="mt-1 text-[0.6rem] font-black uppercase tracking-[0.15em]">
          {isLastLine ? t.done : t.nextLine}
        </span>
      </button>
    )
  }

  if (!canTalk) return <div className="h-20 w-20 shrink-0" />

  return (
    <button
      type="button"
      className="pointer-events-auto flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-white/50 bg-neutral-950/85 text-white shadow-2xl backdrop-blur-md active:scale-95"
      onPointerDown={(event) => {
        event.preventDefault()
        void unlockAudioIfNeeded().then(() => {
          interactWithNearestParkNpc()
        })
      }}
    >
      <InspectIcon />
      <span className="mt-1 text-[0.6rem] font-black uppercase tracking-[0.15em]">{t.inspectAction}</span>
    </button>
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
