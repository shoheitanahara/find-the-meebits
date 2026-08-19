import { useRef } from 'react'
import { STARLIGHT_RUSH } from '../config'
import { useStarlightControlsStore } from '../controlsStore'
import { starlightRushUi } from '../i18n'
import { useStarlightRushStore } from '../store'
import { PHONE_LAND_MOBILE_BAR } from '../../ui/phoneLandscape'

export function StarlightRushMobileControls() {
  const phase = useStarlightRushStore((state) => state.phase)
  if (phase !== 'playing' && phase !== 'countdown') return null

  return (
    <>
      <DragAimSurface />
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden ${PHONE_LAND_MOBILE_BAR}`}>
        <div className="flex items-end justify-between gap-3">
          <p className="pb-3 pl-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/55">
            {starlightRushUi().dragToAim}
          </p>
          {phase === 'playing' ? <FireButton /> : null}
        </div>
      </div>
    </>
  )
}

function DragAimSurface() {
  const pointerIdRef = useRef<number | null>(null)
  const lastPositionRef = useRef({ x: 0, y: 0 })
  const t = starlightRushUi()

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-30 touch-none lg:hidden"
      aria-label={t.dragToAim}
      onPointerDown={(event) => {
        event.preventDefault()
        pointerIdRef.current = event.pointerId
        lastPositionRef.current = { x: event.clientX, y: event.clientY }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (pointerIdRef.current !== event.pointerId) return
        event.preventDefault()
        const deltaX = event.clientX - lastPositionRef.current.x
        const deltaY = event.clientY - lastPositionRef.current.y
        lastPositionRef.current = { x: event.clientX, y: event.clientY }
        useStarlightRushStore.getState().addAimDelta(
          deltaX * STARLIGHT_RUSH.touchAimSensitivity,
          -deltaY * STARLIGHT_RUSH.touchAimSensitivity,
        )
      }}
      onPointerUp={(event) => {
        if (pointerIdRef.current === event.pointerId) pointerIdRef.current = null
      }}
      onPointerCancel={(event) => {
        if (pointerIdRef.current === event.pointerId) pointerIdRef.current = null
      }}
    />
  )
}

function FireButton() {
  const setFirePressed = useStarlightControlsStore((state) => state.setFirePressed)
  const t = starlightRushUi()

  return (
    <button
      type="button"
      className="pointer-events-auto flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-[#8fdfff]/60 bg-[#5ce0ff]/25 text-[#dff8ff] shadow-2xl backdrop-blur-md active:scale-95"
      onPointerDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
        setFirePressed(true)
      }}
      onPointerUp={() => setFirePressed(false)}
      onPointerCancel={() => setFirePressed(false)}
      onPointerLeave={() => setFirePressed(false)}
    >
      <span className="text-lg font-black">●</span>
      <span className="mt-0.5 text-[0.6rem] font-black uppercase tracking-[0.14em]">{t.fire}</span>
    </button>
  )
}
