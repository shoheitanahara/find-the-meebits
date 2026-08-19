import { useRef } from 'react'
import { SHOOTING_GALLERY } from '../config'
import { useShootingControlsStore } from '../controlsStore'
import { shootingGalleryUi } from '../i18n'
import { useShootingGalleryStore } from '../store'
import { PHONE_LAND_MOBILE_BAR } from '../../ui/phoneLandscape'

/** カウントダウンから照準可能。発砲ボタンはゲーム開始後のみ表示する。 */
export function ShootingGalleryMobileControls() {
  const phase = useShootingGalleryStore((state) => state.phase)
  if (phase !== 'playing' && phase !== 'countdown') return null

  return (
    <>
      <DragAimSurface />
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden ${PHONE_LAND_MOBILE_BAR}`}>
        <div className="flex items-end justify-between gap-3">
          <p className="pb-3 pl-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/55">
            {shootingGalleryUi().dragToAim}
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
  const t = shootingGalleryUi()

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
        useShootingGalleryStore.getState().addAimDelta(
          deltaX * SHOOTING_GALLERY.touchAimSensitivity,
          -deltaY * SHOOTING_GALLERY.touchAimSensitivity,
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
  const setFirePressed = useShootingControlsStore((state) => state.setFirePressed)
  const t = shootingGalleryUi()

  return (
    <button
      type="button"
      className="pointer-events-auto flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-amber-200/60 bg-amber-500/25 text-amber-50 shadow-2xl backdrop-blur-md active:scale-95"
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
