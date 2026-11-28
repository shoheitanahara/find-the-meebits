import { useEffect } from 'react'
import { getLocale } from '../../i18n/locale'
import { playSfx } from '../../ui/sfx'
import { PHOTO_STUDIO } from '../config'
import { photoStudioUi } from '../i18n'
import { usePhotoStudioStore, type PhotoStudioPresetPoseId } from '../store'
import {
  CUSTOM_POSE_JOINTS,
  getControlRange,
  getControlValue,
  getCustomPoseJoint,
  getOppositeJointId,
  mirrorJointToOpposite,
  resetJoint,
  setControlValue,
} from './customPoseModel'

const PRESET_POSES = PHOTO_STUDIO.poses.filter((pose) => pose.id !== 'custom')

const chipClass = (active: boolean) =>
  `rounded-full px-3 py-1.5 text-[0.65rem] font-bold transition ${
    active ? 'bg-[#8eb4e8] text-[#101820]' : 'bg-white/10 text-white/80 hover:bg-white/15'
  }`

const actionClass =
  'rounded-full border border-white/20 px-3 py-1.5 text-[0.62rem] font-bold text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35'

/** カスタムポーズ編集パネル（ポーズ = Custom のときだけ表示）。 */
export function CustomPosePanel() {
  const customPose = usePhotoStudioStore((state) => state.customPose)
  const customPoseBase = usePhotoStudioStore((state) => state.customPoseBase)
  const jointId = usePhotoStudioStore((state) => state.customPoseJointId)
  const grounded = usePhotoStudioStore((state) => state.customPoseGrounded)
  const canUndo = usePhotoStudioStore((state) => state.customPosePast.length > 0)
  const canRedo = usePhotoStudioStore((state) => state.customPoseFuture.length > 0)
  const setJointId = usePhotoStudioStore((state) => state.setCustomPoseJointId)
  const beginEdit = usePhotoStudioStore((state) => state.beginCustomPoseEdit)
  const updatePose = usePhotoStudioStore((state) => state.updateCustomPose)
  const commitPose = usePhotoStudioStore((state) => state.commitCustomPose)
  const undo = usePhotoStudioStore((state) => state.undoCustomPose)
  const redo = usePhotoStudioStore((state) => state.redoCustomPose)
  const setGrounded = usePhotoStudioStore((state) => state.setCustomPoseGrounded)
  const requestBase = usePhotoStudioStore((state) => state.requestCustomPoseBase)
  const t = photoStudioUi()
  const locale = getLocale()
  const joint = getCustomPoseJoint(jointId)
  const oppositeId = getOppositeJointId(jointId)

  // ⌘Z / Ctrl+Z で Undo、⇧ 付きで Redo
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'range')) return
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  return (
    <div className="space-y-3 rounded-2xl border border-[#8eb4e8]/25 bg-white/[0.03] p-3">
      <p className="text-[0.6rem] leading-relaxed text-white/45">{t.customHint}</p>

      <div>
        <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/45">
          {t.customJoint}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {CUSTOM_POSE_JOINTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={chipClass(item.id === jointId)}
              onClick={() => {
                setJointId(item.id)
                playSfx('uiClick')
              }}
            >
              {item.label[locale]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {joint.controls.map((control) => {
          const range = getControlRange(control)
          const value = customPose ? getControlValue(customPose, joint, control) : 0
          return (
            <label key={control.id} className="block">
              <span className="text-[0.6rem] font-bold text-white/60">
                {control.label[locale]}
              </span>
              <input
                type="range"
                min={range.min}
                max={range.max}
                step={0.01}
                value={Math.min(range.max, Math.max(range.min, value))}
                disabled={!customPose}
                onPointerDown={beginEdit}
                onKeyDown={beginEdit}
                onChange={(event) => {
                  const pose = usePhotoStudioStore.getState().customPose
                  if (!pose) return
                  updatePose(setControlValue(pose, joint, control, Number(event.target.value)))
                }}
                className="mt-1 w-full touch-none accent-[#8eb4e8]"
              />
            </label>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {oppositeId ? (
          <button
            type="button"
            className={actionClass}
            disabled={!customPose}
            onClick={() => {
              if (!customPose) return
              commitPose(mirrorJointToOpposite(customPose, jointId))
              playSfx('uiClick')
            }}
          >
            {t.customMirror}
          </button>
        ) : null}
        <button
          type="button"
          className={actionClass}
          disabled={!customPose || !customPoseBase}
          onClick={() => {
            if (!customPose || !customPoseBase) return
            commitPose(resetJoint(customPose, customPoseBase, jointId))
            playSfx('uiClick')
          }}
        >
          {t.customResetJoint}
        </button>
        <button type="button" className={actionClass} disabled={!canUndo} onClick={undo}>
          {t.customUndo}
        </button>
        <button type="button" className={actionClass} disabled={!canRedo} onClick={redo}>
          {t.customRedo}
        </button>
      </div>

      <label className="flex items-center gap-2 text-[0.65rem] font-bold text-white/70">
        <input
          type="checkbox"
          checked={grounded}
          onChange={(event) => setGrounded(event.target.checked)}
          className="h-3.5 w-3.5 accent-[#8eb4e8]"
        />
        {t.customGrounded}
      </label>

      <details className="group">
        <summary className="cursor-pointer text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white/45">
          {t.customRebase}
        </summary>
        <p className="mt-1.5 text-[0.6rem] text-white/35">{t.customRebaseHint}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {PRESET_POSES.map((pose) => (
            <button
              key={pose.id}
              type="button"
              className={chipClass(false)}
              onClick={() => {
                requestBase(pose.id as PhotoStudioPresetPoseId)
                playSfx('uiClick')
              }}
            >
              {pose.label[locale]}
            </button>
          ))}
        </div>
      </details>
    </div>
  )
}
