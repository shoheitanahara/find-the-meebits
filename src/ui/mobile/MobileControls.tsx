import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useDialogueStore } from '../../dialogue/dialogueStore'
import { getNpcById } from '../../npc/npcData'
import { interactWithNearestNpc } from '../../systems/interaction/interactWithNearestNpc'
import { useGameStore } from '../../stores/gameStore'
import { useNpcStore } from '../../stores/npcStore'
import { useTouchControlsStore } from '../../stores/touchControlsStore'

const JOYSTICK_RADIUS = 52

export function MobileControls() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const isDialogueOpen = useDialogueStore((state) => state.isOpen)
  const nearestNpcId = useNpcStore((state) => state.nearestNpcId)
  const canMove = gamePhase === 'playing' || gamePhase === 'timedOut'
  const nearestNpc = nearestNpcId ? getNpcById(nearestNpcId) : null

  if (!canMove || isDialogueOpen) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-end justify-between px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
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
          <span className="text-2xl leading-none">💬</span>
          <span className="mt-1 text-[0.6rem] font-black uppercase tracking-[0.15em]">Inspect</span>
        </button>
      ) : (
        <div className="h-20 w-20" />
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
      ref={baseRef}
      className="pointer-events-auto relative h-32 w-32 touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div className="absolute inset-0 rounded-full border-2 border-white/25 bg-neutral-950/45 backdrop-blur-sm" />
      <div
        className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/60 bg-white/25 shadow-lg"
        style={{
          transform: `translate(calc(-50% + ${knobOffset.x}px), calc(-50% + ${knobOffset.y}px))`,
        }}
      />
    </div>
  )
}
