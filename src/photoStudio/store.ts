import { create } from 'zustand'
import {
  clampMeebitId,
  PHOTO_STUDIO,
  type PhotoStudioBackgroundId,
  type PhotoStudioCameraAngleId,
  type PhotoStudioFramingId,
  type PhotoStudioPoseId,
} from './config'

export type PhotoStudioPhase = 'idle' | 'studio'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function clampBrightness(value: number) {
  return clamp(
    value,
    PHOTO_STUDIO.lighting.exposureMin,
    PHOTO_STUDIO.lighting.exposureMax,
  )
}

function wrapYaw(value: number) {
  const tau = Math.PI * 2
  let yaw = value % tau
  if (yaw > Math.PI) yaw -= tau
  if (yaw < -Math.PI) yaw += tau
  return yaw
}

type PhotoStudioState = {
  phase: PhotoStudioPhase
  meebitNumber: number
  draftMeebitInput: string
  backgroundId: PhotoStudioBackgroundId
  poseId: PhotoStudioPoseId
  framingId: PhotoStudioFramingId
  cameraAngleId: PhotoStudioCameraAngleId
  /** toneMappingExposure（明るさスライダー） */
  brightness: number
  /** 左右回転のみ（Y 軸, rad） */
  rotYaw: number
  capturing: boolean
  lastCaptureUrl: string | null
  enterStudio: (meebitNumber: number) => void
  setDraftMeebitInput: (value: string) => void
  applyDraftMeebit: () => boolean
  setBackgroundId: (id: PhotoStudioBackgroundId) => void
  setPoseId: (id: PhotoStudioPoseId) => void
  setFramingId: (id: PhotoStudioFramingId) => void
  setCameraAngleId: (id: PhotoStudioCameraAngleId) => void
  setBrightness: (value: number) => void
  nudgeYaw: (dYaw: number) => void
  resetRotation: () => void
  setCapturing: (value: boolean) => void
  setLastCaptureUrl: (url: string | null) => void
  exitToIdle: () => void
}

export const usePhotoStudioStore = create<PhotoStudioState>((set, get) => ({
  phase: 'idle',
  meebitNumber: PHOTO_STUDIO.meebitIdMin,
  draftMeebitInput: String(PHOTO_STUDIO.meebitIdMin),
  backgroundId: PHOTO_STUDIO.backgrounds[0].id,
  poseId: PHOTO_STUDIO.poses[0].id,
  framingId: 'full',
  cameraAngleId: 'default',
  brightness: PHOTO_STUDIO.lighting.exposureDefault,
  rotYaw: PHOTO_STUDIO.orbit.defaultYaw,
  capturing: false,
  lastCaptureUrl: null,
  enterStudio: (meebitNumber) => {
    const id = clampMeebitId(meebitNumber)
    set({
      phase: 'studio',
      meebitNumber: id,
      draftMeebitInput: String(id),
      lastCaptureUrl: null,
      capturing: false,
      rotYaw: PHOTO_STUDIO.orbit.defaultYaw,
      cameraAngleId: 'default',
      brightness: PHOTO_STUDIO.lighting.exposureDefault,
    })
  },
  setDraftMeebitInput: (value) => set({ draftMeebitInput: value }),
  applyDraftMeebit: () => {
    const parsed = Number(get().draftMeebitInput.trim())
    if (!Number.isFinite(parsed)) return false
    const id = clampMeebitId(parsed)
    set({ meebitNumber: id, draftMeebitInput: String(id), lastCaptureUrl: null })
    return true
  },
  setBackgroundId: (backgroundId) => set({ backgroundId }),
  setPoseId: (poseId) => set({ poseId }),
  setFramingId: (framingId) => set({ framingId }),
  setCameraAngleId: (cameraAngleId) => set({ cameraAngleId }),
  setBrightness: (value) => set({ brightness: clampBrightness(value) }),
  nudgeYaw: (dYaw) => set({ rotYaw: wrapYaw(get().rotYaw + dYaw) }),
  resetRotation: () => set({ rotYaw: PHOTO_STUDIO.orbit.defaultYaw }),
  setCapturing: (capturing) => set({ capturing }),
  setLastCaptureUrl: (lastCaptureUrl) => set({ lastCaptureUrl }),
  exitToIdle: () =>
    set({
      phase: 'idle',
      capturing: false,
      lastCaptureUrl: null,
      rotYaw: PHOTO_STUDIO.orbit.defaultYaw,
      cameraAngleId: 'default',
    }),
}))
