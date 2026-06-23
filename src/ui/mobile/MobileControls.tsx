import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { advanceDialogue } from '../../dialogue/advanceDialogue'
import { useDialogueStore } from '../../dialogue/dialogueStore'
import { getNpcById } from '../../npc/npcData'
import { interactWithNearestNpc } from '../../systems/interaction/interactWithNearestNpc'
import { useGameStore } from '../../stores/gameStore'
import { useNpcStore } from '../../stores/npcStore'
import { useTouchControlsStore } from '../../stores/touchControlsStore'
import { DoneIcon, InspectIcon, NextIcon } from './MobileActionIcons'

const JOYSTICK_RADIUS = 44
const BASE_SIZE = 112
const KNOB_SIZE = 44

export function MobileControls() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const isDialogueOpen = useDialogueStore((state) => state.isOpen)
  const currentIndex = useDialogueStore((state) => state.currentIndex)
  const lines = useDialogueStore((state) => state.lines)
  const nearestNpcId = useNpcStore((state) => state.nearestNpcId)
  const canMove = gamePhase === 'playing' || gamePhase === 'timedOut'
  const nearestNpc = nearestNpcId ? getNpcById(nearestNpcId) : null
  const isLastLine = currentIndex >= lines.length - 1

  if (isDialogueOpen) {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-end px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
        <button
          type="button"
          className="pointer-events-auto flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-white/50 bg-neutral-950/90 text-white shadow-2xl backdrop-blur-md active:scale-95"
          onPointerDown={(event) => {
            event.preventDefault()
            advanceDialogue()
          }}
        >
          {isLastLine ? <DoneIcon /> : <NextIcon />}
          <span className="mt-1 text-[0.6rem] font-black uppercase tracking-[0.15em]">
            {isLastLine ? 'Done' : 'Next'}
          </span>
        </button>
      </div>
    )
  }

  if (!canMove) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-end justify-between px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
      <VirtualJoystick />
      {nearestNpc ? (
        <button
          type="button"
          className="pointer-events-auto flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-white/50 bg-neutral-950/85 text-white shadow-2xl backdrop-blur-md active:scale-95"
          onPointerDown={(event) => {
            event.preventDefault()
            interactWithNearestNpc()
          }}
        >
          <InspectIcon />
          <span className="mt-1 text-[0.6rem] font-black uppercase tracking-[0.15em]">Inspect</span>
        </button>
      ) : (
        <div className="h-20 w-20 shrink-0" />
      )}
    </div>
  )
}

function VirtualJoystick() {
  const baseRef = useRef<HTMLDivElement>(null)
  const pointerIdRef = useRef<number | null>(null)
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 })
  const setJoystick = useTouchControlsStore((state) => state.setJoystick)
  const resetJoystick = useTouchControlsStore((state) => state.resetJoystick)

  useEffect(() => {
    return () => resetJoystick()
  }, [resetJoystick])

  const updateJoystick = (clientX: number, clientY: number) => {
    const base = baseRef.current
    if (!base) return

    const rect = base.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = clientX - centerX
    const dy = clientY - centerY
    const distance = Math.hypot(dx, dy)
    const clampedDistance = Math.min(distance, JOYSTICK_RADIUS)
    const angle = Math.atan2(dy, dx)
    const clampedX = Math.cos(angle) * clampedDistance
    const clampedY = Math.sin(angle) * clampedDistance

    setKnobOffset({ x: clampedX, y: clampedY })

    const normalizedX = clampedX / JOYSTICK_RADIUS
    const normalizedY = clampedY / JOYSTICK_RADIUS
    setJoystick(normalizedX, normalizedY, clampedDistance > 6)
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
        className="absolute left-1/2 top-1/2 rounded-full border-2 border-white/25 bg-neutral-950/45 backdrop-blur-sm"
        style={{
          width: BASE_SIZE,
          height: BASE_SIZE,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        className="absolute rounded-full border-2 border-white/60 bg-white/25 shadow-lg"
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
