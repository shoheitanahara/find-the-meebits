import { create } from 'zustand'
import {
  clampMeebitId,
  PHOTO_STUDIO,
  type PhotoStudioBackgroundId,
  type PhotoStudioCameraAngleId,
  type PhotoStudioFramingId,
  type PhotoStudioGmMugColorId,
  type PhotoStudioPoseId,
} from './config'
import {
  loadStoredCustomPose,
  saveStoredCustomPose,
  type CustomPose,
  type CustomPoseJointId,
} from './customPose/customPoseModel'

/** カスタムポーズの Undo 上限 */
const CUSTOM_POSE_HISTORY_LIMIT = 50

/** プリセットからカスタムを作るときの既定ベース */
export type PhotoStudioPresetPoseId = Exclude<PhotoStudioPoseId, 'custom'>

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
  gmMugColorId: PhotoStudioGmMugColorId
  /** toneMappingExposure（明るさスライダー） */
  brightness: number
  /** 左右回転のみ（Y 軸, rad） */
  rotYaw: number
  capturing: boolean
  /** 編集中のカスタムポーズ（null = まだベースから作っていない） */
  customPose: CustomPose | null
  /** 「この関節をリセット」の戻り先（作成元プリセットの値） */
  customPoseBase: CustomPose | null
  /** StudioPlayer がこのプリセットを当てて customPose を作り直す */
  customPoseBaseRequest: PhotoStudioPresetPoseId | null
  customPoseJointId: CustomPoseJointId
  /** メッシュ最低点で床に接地させる */
  customPoseGrounded: boolean
  customPosePast: CustomPose[]
  customPoseFuture: CustomPose[]
  enterStudio: (meebitNumber: number) => void
  setDraftMeebitInput: (value: string) => void
  applyDraftMeebit: () => boolean
  setBackgroundId: (id: PhotoStudioBackgroundId) => void
  setPoseId: (id: PhotoStudioPoseId) => void
  setFramingId: (id: PhotoStudioFramingId) => void
  setCameraAngleId: (id: PhotoStudioCameraAngleId) => void
  setGmMugColorId: (id: PhotoStudioGmMugColorId) => void
  setBrightness: (value: number) => void
  nudgeYaw: (dYaw: number) => void
  resetRotation: () => void
  setCapturing: (value: boolean) => void
  /** カスタム編集を開始（未作成なら直前のプリセットをベースにする） */
  startCustomPose: () => void
  requestCustomPoseBase: (id: PhotoStudioPresetPoseId) => void
  /** StudioPlayer がベースプリセットを読み取った結果 */
  resolveCustomPoseBase: (pose: CustomPose) => void
  setCustomPoseJointId: (id: CustomPoseJointId) => void
  /** 連続操作（スライダー）の開始時に 1 回呼び、Undo 履歴へ積む */
  beginCustomPoseEdit: () => void
  /** 履歴を積まずに更新（スライダー操作中） */
  updateCustomPose: (pose: CustomPose) => void
  /** 履歴を積んで更新（ボタン操作） */
  commitCustomPose: (pose: CustomPose) => void
  undoCustomPose: () => void
  redoCustomPose: () => void
  setCustomPoseGrounded: (value: boolean) => void
  exitToIdle: () => void
}

const storedCustomPose = loadStoredCustomPose()

function pushHistory(past: CustomPose[], pose: CustomPose | null) {
  if (!pose) return past
  const next = [...past, pose]
  return next.length > CUSTOM_POSE_HISTORY_LIMIT ? next.slice(-CUSTOM_POSE_HISTORY_LIMIT) : next
}

export const usePhotoStudioStore = create<PhotoStudioState>((set, get) => ({
  phase: 'idle',
  meebitNumber: PHOTO_STUDIO.meebitIdMin,
  draftMeebitInput: String(PHOTO_STUDIO.meebitIdMin),
  backgroundId: PHOTO_STUDIO.backgrounds[0].id,
  poseId: PHOTO_STUDIO.poses[0].id,
  framingId: 'full',
  cameraAngleId: 'default',
  gmMugColorId: PHOTO_STUDIO.gmMug.colorVariants[0].id,
  brightness: PHOTO_STUDIO.lighting.exposureDefault,
  rotYaw: PHOTO_STUDIO.orbit.defaultYaw,
  capturing: false,
  customPose: storedCustomPose?.pose ?? null,
  customPoseBase: storedCustomPose?.base ?? null,
  customPoseBaseRequest: null,
  customPoseJointId: 'rightArm',
  customPoseGrounded: true,
  customPosePast: [],
  customPoseFuture: [],
  enterStudio: (meebitNumber) => {
    const id = clampMeebitId(meebitNumber)
    set({
      phase: 'studio',
      meebitNumber: id,
      draftMeebitInput: String(id),
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
    set({ meebitNumber: id, draftMeebitInput: String(id) })
    return true
  },
  setBackgroundId: (backgroundId) => set({ backgroundId }),
  setPoseId: (poseId) => {
    if (poseId === 'custom') {
      get().startCustomPose()
      return
    }
    set({ poseId })
  },
  setFramingId: (framingId) => set({ framingId }),
  setCameraAngleId: (cameraAngleId) => set({ cameraAngleId }),
  setGmMugColorId: (gmMugColorId) => set({ gmMugColorId }),
  setBrightness: (value) => set({ brightness: clampBrightness(value) }),
  nudgeYaw: (dYaw) => set({ rotYaw: wrapYaw(get().rotYaw + dYaw) }),
  resetRotation: () => set({ rotYaw: PHOTO_STUDIO.orbit.defaultYaw }),
  setCapturing: (capturing) => set({ capturing }),
  startCustomPose: () => {
    const { poseId, customPose } = get()
    if (poseId === 'custom') return
    set({
      poseId: 'custom',
      customPoseBaseRequest: customPose ? null : poseId,
    })
  },
  requestCustomPoseBase: (id) => set({ customPoseBaseRequest: id }),
  resolveCustomPoseBase: (pose) => {
    const { customPose, customPosePast } = get()
    set({
      customPose: pose,
      customPoseBase: pose,
      customPoseBaseRequest: null,
      // ベースの作り直しも Undo で戻せるように
      customPosePast: pushHistory(customPosePast, customPose),
      customPoseFuture: [],
    })
  },
  setCustomPoseJointId: (customPoseJointId) => set({ customPoseJointId }),
  beginCustomPoseEdit: () => {
    const { customPose, customPosePast } = get()
    set({ customPosePast: pushHistory(customPosePast, customPose), customPoseFuture: [] })
  },
  updateCustomPose: (customPose) => set({ customPose }),
  commitCustomPose: (pose) => {
    const { customPose, customPosePast } = get()
    set({
      customPose: pose,
      customPosePast: pushHistory(customPosePast, customPose),
      customPoseFuture: [],
    })
  },
  undoCustomPose: () => {
    const { customPose, customPosePast, customPoseFuture } = get()
    const previous = customPosePast[customPosePast.length - 1]
    if (!previous) return
    set({
      customPose: previous,
      customPosePast: customPosePast.slice(0, -1),
      customPoseFuture: customPose ? [customPose, ...customPoseFuture] : customPoseFuture,
    })
  },
  redoCustomPose: () => {
    const { customPose, customPosePast, customPoseFuture } = get()
    const next = customPoseFuture[0]
    if (!next) return
    set({
      customPose: next,
      customPosePast: pushHistory(customPosePast, customPose),
      customPoseFuture: customPoseFuture.slice(1),
    })
  },
  setCustomPoseGrounded: (customPoseGrounded) => set({ customPoseGrounded }),
  exitToIdle: () =>
    set({
      phase: 'idle',
      capturing: false,
      rotYaw: PHOTO_STUDIO.orbit.defaultYaw,
      cameraAngleId: 'default',
    }),
}))

/** 編集中のカスタムポーズを端末へ保存（操作が落ち着いてから） */
let saveTimer: ReturnType<typeof setTimeout> | null = null
usePhotoStudioStore.subscribe((state, previous) => {
  if (state.customPose === previous.customPose && state.customPoseBase === previous.customPoseBase) {
    return
  }
  const { customPose, customPoseBase } = state
  if (!customPose || !customPoseBase) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = null
    saveStoredCustomPose({ pose: customPose, base: customPoseBase })
  }, 400)
})
