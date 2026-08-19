import { useEffect, useRef, useState } from 'react'
import { getLocale } from '../../i18n/locale'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { usePlayerStore } from '../../stores/playerStore'
import { TargetPreview } from '../../ui/TargetPreview'
import {
  clampMeebitId,
  getBackground,
  getGmMugColorVariant,
  PHOTO_STUDIO,
  type PhotoStudioBackgroundId,
  type PhotoStudioCameraAngleId,
  type PhotoStudioFramingId,
  type PhotoStudioGmMugColorId,
  type PhotoStudioPoseId,
} from '../config'
import { captureSquarePfp, downloadDataUrl } from '../capture/captureSquare'
import { composeVisitPass } from '../capture/composeVisitPass'
import { getStudioGl } from '../capture/studioGlBridge'
import { photoStudioUi } from '../i18n'
import { usePhotoStudioStore } from '../store'
import {
  PHONE_LAND_OVERLAY_CARD,
  PHONE_LAND_OVERLAY_FRAME,
  PHONE_LAND_OVERLAY_TITLE,
} from '../../ui/phoneLandscape'

/** スタート: 引き継いだ ID を表示しつつ変更可能。 */
export function PhotoStudioStartScreen() {
  const phase = usePhotoStudioStore((state) => state.phase)
  const draftMeebitInput = usePhotoStudioStore((state) => state.draftMeebitInput)
  const setDraftMeebitInput = usePhotoStudioStore((state) => state.setDraftMeebitInput)
  const enterStudio = usePhotoStudioStore((state) => state.enterStudio)
  const t = photoStudioUi()
  const savedMeebit = usePlayerStore((state) => state.meebitNumber)

  useEffect(() => {
    if (phase !== 'idle') return
    setDraftMeebitInput(String(clampMeebitId(savedMeebit)))
  }, [phase, savedMeebit, setDraftMeebitInput])

  if (phase !== 'idle') return null

  const parsed = Number(draftMeebitInput.trim())
  const canEnter = Number.isFinite(parsed)
  const previewMeebitNumber = clampMeebitId(
    Number.isFinite(parsed) ? parsed : savedMeebit,
  )

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 overflow-y-auto bg-black/55 backdrop-blur-sm">
      <div className={`flex min-h-full items-start justify-center px-4 pb-6 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.75rem))] sm:items-center sm:py-6 ${PHONE_LAND_OVERLAY_FRAME}`}>
        <section className={`w-full max-w-md rounded-[2rem] border border-[#8eb4e8]/40 bg-[#101820]/95 p-5 text-[#f4ead2] shadow-2xl sm:p-7 phone-land:max-w-2xl phone-land:grid phone-land:grid-cols-[auto_1fr] phone-land:items-center phone-land:gap-4 ${PHONE_LAND_OVERLAY_CARD}`}>
          <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#8eb4e8]/85 phone-land:col-span-2">
            {t.rulesTitle}
          </p>
          <h1 className={`mt-2 text-center font-[family-name:Georgia,Times_New_Roman,serif] text-3xl sm:text-4xl phone-land:col-span-2 ${PHONE_LAND_OVERLAY_TITLE}`}>
            {t.title}
          </h1>
          <p className="mt-3 text-center text-sm text-white/65 phone-land:col-span-2 phone-land:mt-1 phone-land:text-xs">{t.subtitle}</p>
          <p className="mt-1 text-center text-xs leading-relaxed text-[#8eb4e8]/75 phone-land:col-span-2">{t.storyLine}</p>
          <p className="mt-2 text-center text-xs leading-relaxed text-white/50 phone-land:hidden">{t.controls}</p>

          <div className="mt-5 flex flex-col items-center phone-land:mt-0">
            <TargetPreview
              meebitNumber={previewMeebitNumber}
              sizeClassName="h-36 w-36 rounded-[1.35rem] border border-[#8eb4e8]/35 bg-[#0a1018] shadow-xl sm:h-44 sm:w-44 phone-land:!h-24 phone-land:!w-24"
            />
            <p className="mt-2 font-mono text-sm tracking-wide text-[#8eb4e8]/90">
              #{previewMeebitNumber}
            </p>
          </div>

          <div className="mt-5 phone-land:mt-0">
            <label className="block">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/55">
                {t.meebitId}
              </span>
              <input
                type="number"
                min={PHOTO_STUDIO.meebitIdMin}
                max={PHOTO_STUDIO.meebitIdMax}
                value={draftMeebitInput}
                onChange={(event) => setDraftMeebitInput(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 font-mono text-lg text-white outline-none focus:border-[#8eb4e8] phone-land:py-2"
              />
              <span className="mt-1 block text-[0.65rem] text-white/40">{t.meebitHint}</span>
            </label>

            <button
              type="button"
              disabled={!canEnter}
              className="mt-5 w-full rounded-full bg-[#8eb4e8] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#101820] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 phone-land:mt-3 phone-land:py-2.5"
              onClick={() => {
                const id = clampMeebitId(parsed)
                usePlayerStore.getState().setMeebitNumber(id)
                enterStudio(id)
                void unlockAudioIfNeeded().then(() => playSfx('uiConfirm'))
              }}
            >
              {t.play}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

/** プレビュー枠内だけの左右ドラッグ。 */
export function PhotoStudioDragLayer() {
  const phase = usePhotoStudioStore((state) => state.phase)
  const nudgeYaw = usePhotoStudioStore((state) => state.nudgeYaw)
  const draggingRef = useRef(false)
  const lastXRef = useRef(0)
  const t = photoStudioUi()

  if (phase !== 'studio') return null

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-10 touch-none cursor-grab active:cursor-grabbing"
      aria-label={t.dragHint}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        draggingRef.current = true
        lastXRef.current = event.clientX
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (!draggingRef.current) return
        const dxPx = event.clientX - lastXRef.current
        lastXRef.current = event.clientX
        const scale = 1 / PHOTO_STUDIO.orbit.pixelsPerRadian
        // 右ドラッグでモデルが右回り（直感的なターンテーブル）
        nudgeYaw(dxPx * scale)
      }}
      onPointerUp={(event) => {
        draggingRef.current = false
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
      }}
      onPointerCancel={() => {
        draggingRef.current = false
      }}
    />
  )
}

/** 左カラム: 調整パネル。 */
export function PhotoStudioControls() {
  const phase = usePhotoStudioStore((state) => state.phase)
  const backgroundId = usePhotoStudioStore((state) => state.backgroundId)
  const poseId = usePhotoStudioStore((state) => state.poseId)
  const framingId = usePhotoStudioStore((state) => state.framingId)
  const cameraAngleId = usePhotoStudioStore((state) => state.cameraAngleId)
  const gmMugColorId = usePhotoStudioStore((state) => state.gmMugColorId)
  const brightness = usePhotoStudioStore((state) => state.brightness)
  const rotYaw = usePhotoStudioStore((state) => state.rotYaw)
  const meebitNumber = usePhotoStudioStore((state) => state.meebitNumber)
  const setBackgroundId = usePhotoStudioStore((state) => state.setBackgroundId)
  const setPoseId = usePhotoStudioStore((state) => state.setPoseId)
  const setFramingId = usePhotoStudioStore((state) => state.setFramingId)
  const setCameraAngleId = usePhotoStudioStore((state) => state.setCameraAngleId)
  const setGmMugColorId = usePhotoStudioStore((state) => state.setGmMugColorId)
  const setBrightness = usePhotoStudioStore((state) => state.setBrightness)
  const resetRotation = usePhotoStudioStore((state) => state.resetRotation)
  const exitToIdle = usePhotoStudioStore((state) => state.exitToIdle)
  const t = photoStudioUi()
  const locale = getLocale()
  const rotationDirty = Math.abs(rotYaw - PHOTO_STUDIO.orbit.defaultYaw) > 0.001

  if (phase !== 'studio') return null

  return (
    <aside className="pointer-events-auto flex h-full min-h-0 w-full flex-col border-white/10 bg-[#0c121a]/95 lg:w-[22rem] lg:shrink-0 lg:border-r xl:w-[24rem] phone-land:border-r">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3 phone-land:px-3 phone-land:py-2">
        <div>
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.22em] text-[#8eb4e8]/80">
            {t.title}
          </p>
          <p className="mt-0.5 font-mono text-sm text-white/80">#{meebitNumber}</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-white/20 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white/75"
          onClick={() => {
            playSfx('uiClick')
            exitToIdle()
          }}
        >
          {t.backSetup}
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 phone-land:space-y-3 phone-land:px-3 phone-land:py-2">
        <p className="text-[0.65rem] text-white/40">{t.dragHint}</p>

        <label className="block">
          <span className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/45">
            {t.brightness}
          </span>
          <input
            type="range"
            min={PHOTO_STUDIO.lighting.exposureMin}
            max={PHOTO_STUDIO.lighting.exposureMax}
            step={0.01}
            value={brightness}
            onChange={(event) => setBrightness(Number(event.target.value))}
            className="mt-1.5 w-full accent-[#8eb4e8]"
          />
        </label>

        <div>
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/45">{t.background}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {PHOTO_STUDIO.backgrounds.map((bg) => (
              <button
                key={bg.id}
                type="button"
                title={bg.label[locale]}
                aria-label={bg.label[locale]}
                className={`h-8 w-8 shrink-0 rounded-full border-2 transition ${
                  backgroundId === bg.id ? 'scale-110 border-white' : 'border-white/20'
                }`}
                style={{ backgroundColor: bg.color }}
                onClick={() => {
                  setBackgroundId(bg.id as PhotoStudioBackgroundId)
                  playSfx('uiClick')
                }}
              />
            ))}
          </div>
          <p className="mt-1.5 text-[0.6rem] text-white/35">
            {getBackground(backgroundId).label[locale]}
          </p>
        </div>

        <div>
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/45">{t.pose}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {PHOTO_STUDIO.poses.map((pose) => (
              <button
                key={pose.id}
                type="button"
                className={`rounded-full px-3 py-1.5 text-[0.65rem] font-bold transition ${
                  poseId === pose.id
                    ? 'bg-[#8eb4e8] text-[#101820]'
                    : 'bg-white/10 text-white/80 hover:bg-white/15'
                }`}
                onClick={() => {
                  setPoseId(pose.id as PhotoStudioPoseId)
                  playSfx('uiClick')
                }}
              >
                {pose.label[locale]}
              </button>
            ))}
          </div>
        </div>

        {poseId === 'gm' ? (
          <div>
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/45">
              {t.mugColor}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {PHOTO_STUDIO.gmMug.colorVariants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  title={variant.label[locale]}
                  aria-label={variant.label[locale]}
                  className={`h-8 w-8 shrink-0 rounded-full border-2 transition ${
                    gmMugColorId === variant.id ? 'scale-110 border-white' : 'border-white/20'
                  }`}
                  style={{ backgroundColor: variant.swatch }}
                  onClick={() => {
                    setGmMugColorId(variant.id as PhotoStudioGmMugColorId)
                    playSfx('uiClick')
                  }}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[0.6rem] text-white/35">
              {getGmMugColorVariant(gmMugColorId).label[locale]}
            </p>
          </div>
        ) : null}

        <div>
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/45">{t.framing}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {PHOTO_STUDIO.framings.map((framing) => (
              <button
                key={framing.id}
                type="button"
                className={`rounded-full px-3 py-1.5 text-[0.65rem] font-bold transition ${
                  framingId === framing.id
                    ? 'bg-white text-[#101820]'
                    : 'bg-white/10 text-white/80 hover:bg-white/15'
                }`}
                onClick={() => {
                  setFramingId(framing.id as PhotoStudioFramingId)
                  playSfx('uiClick')
                }}
              >
                {framing.label[locale]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/45">
              {t.cameraAngle}
            </p>
            {rotationDirty ? (
              <button
                type="button"
                className="rounded-full border border-white/20 px-2.5 py-1 text-[0.6rem] font-bold text-white/70"
                onClick={() => {
                  resetRotation()
                  playSfx('uiClick')
                }}
              >
                {t.resetRotation}
              </button>
            ) : null}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {PHOTO_STUDIO.cameraAngles.map((angle) => (
              <button
                key={angle.id}
                type="button"
                className={`rounded-full px-3 py-1.5 text-[0.65rem] font-bold transition ${
                  cameraAngleId === angle.id
                    ? 'bg-[#8eb4e8] text-[#101820]'
                    : 'bg-white/10 text-white/80 hover:bg-white/15'
                }`}
                onClick={() => {
                  setCameraAngleId(angle.id as PhotoStudioCameraAngleId)
                  playSfx('uiClick')
                }}
              >
                {angle.label[locale]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-white/10 px-4 py-3 phone-land:px-3 phone-land:py-2">
        <CaptureButton className="w-full" />
        <VisitPassButton className="w-full" />
      </div>
    </aside>
  )
}

/** プレビュー下の撮影ステータス。 */
export function PhotoStudioPreviewChrome() {
  const phase = usePhotoStudioStore((state) => state.phase)
  const capturing = usePhotoStudioStore((state) => state.capturing)
  const t = photoStudioUi()

  if (phase !== 'studio') return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-3">
      {capturing ? (
        <p className="rounded-full bg-black/55 px-3 py-1 text-[0.65rem] text-white/70 backdrop-blur-sm">
          {t.downloading}
        </p>
      ) : (
        <p className="rounded-full bg-black/40 px-3 py-1 text-[0.6rem] text-white/45 backdrop-blur-sm">
          {t.dragHint}
        </p>
      )}
    </div>
  )
}

function CaptureButton({ className = '' }: { className?: string }) {
  const meebitNumber = usePhotoStudioStore((state) => state.meebitNumber)
  const capturing = usePhotoStudioStore((state) => state.capturing)
  const setCapturing = usePhotoStudioStore((state) => state.setCapturing)
  const t = photoStudioUi()

  return (
    <button
      type="button"
      disabled={capturing}
      className={`rounded-full bg-[#8eb4e8] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#101820] disabled:opacity-50 ${className}`}
      onClick={() => {
        const gl = getStudioGl()
        if (!gl) return
        setCapturing(true)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const dataUrl = captureSquarePfp(gl)
            setCapturing(false)
            if (!dataUrl) return
            downloadDataUrl(dataUrl, `meebit-${meebitNumber}-pfp.png`)
            void unlockAudioIfNeeded().then(() => playSfx('uiConfirm'))
          })
        })
      }}
    >
      {t.capture}
    </button>
  )
}

function VisitPassButton({ className = '' }: { className?: string }) {
  const meebitNumber = usePhotoStudioStore((state) => state.meebitNumber)
  const capturing = usePhotoStudioStore((state) => state.capturing)
  const [issuing, setIssuing] = useState(false)
  const t = photoStudioUi()
  const busy = capturing || issuing

  return (
    <button
      type="button"
      disabled={busy}
      className={`rounded-full border border-[#8eb4e8]/50 bg-[#8eb4e8]/10 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#c5d8f2] transition hover:bg-[#8eb4e8]/18 disabled:opacity-50 ${className}`}
      onClick={() => {
        const gl = getStudioGl()
        if (!gl) return
        setIssuing(true)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const dataUrl = composeVisitPass(gl, { meebitNumber })
            setIssuing(false)
            if (!dataUrl) return
            downloadDataUrl(dataUrl, `meebit-${meebitNumber}-visit-pass.png`)
            void unlockAudioIfNeeded().then(() => playSfx('uiConfirm'))
          })
        })
      }}
    >
      {issuing ? t.issuingPass : t.issuePass}
    </button>
  )
}
