import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { unlockAudioIfNeeded } from '../../ui/sfx'
import { useOpenSeaMarketControlsStore } from '../controlsStore'

export function MarketTouchLookPad() {
  const addLookDelta = useOpenSeaMarketControlsStore((state) => state.addLookDelta)
  const pointerIdRef = useRef<number | null>(null)
  const lastRef = useRef({ x: 0, y: 0 })

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== null) return
    void unlockAudioIfNeeded()
    pointerIdRef.current = event.pointerId
    lastRef.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    const dx = event.clientX - lastRef.current.x
    const dy = event.clientY - lastRef.current.y
    lastRef.current = { x: event.clientX, y: event.clientY }
    if (dx !== 0 || dy !== 0) addLookDelta(dx, dy)
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    pointerIdRef.current = null
  }

  return (
    <div
      className="absolute inset-0 z-20 touch-none lg:hidden"
      style={{ pointerEvents: 'auto' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-hidden
    />
  )
}
