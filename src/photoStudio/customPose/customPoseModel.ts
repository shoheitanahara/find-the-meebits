import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'

/**
 * Photo Booth カスタムポーズ — データモデル。
 *
 * ポーズ = normalized bone のローカル Euler（x, y, z）の集合。
 * プリセット（applyStudioPose）を一度当ててボーン値を読み取り、そこから編集する。
 *
 * 左右の扱い: normalized bone は全ボーンの軸が揃っているので、
 * 体の正中面での鏡像は (x, y, z) → (x, −y, −z)。
 * スライダーは「左側の座標系」で定義し、右側は鏡像に変換して表示する。
 * → 左右どちらの腕でも「上げる」は同じ向きに動く。
 */

export type Euler3 = readonly [number, number, number]

/** ポーズとして保存・適用するボーン（Meebit VRM に存在するもの） */
export const CUSTOM_POSE_BONES = [
  VRMHumanBoneName.Hips,
  VRMHumanBoneName.Spine,
  VRMHumanBoneName.Chest,
  VRMHumanBoneName.Neck,
  VRMHumanBoneName.Head,
  VRMHumanBoneName.LeftShoulder,
  VRMHumanBoneName.RightShoulder,
  VRMHumanBoneName.LeftUpperArm,
  VRMHumanBoneName.RightUpperArm,
  VRMHumanBoneName.LeftLowerArm,
  VRMHumanBoneName.RightLowerArm,
  VRMHumanBoneName.LeftHand,
  VRMHumanBoneName.RightHand,
  VRMHumanBoneName.LeftUpperLeg,
  VRMHumanBoneName.RightUpperLeg,
  VRMHumanBoneName.LeftLowerLeg,
  VRMHumanBoneName.RightLowerLeg,
  VRMHumanBoneName.LeftFoot,
  VRMHumanBoneName.RightFoot,
  VRMHumanBoneName.LeftToes,
  VRMHumanBoneName.RightToes,
] as const

export type CustomPoseBone = (typeof CUSTOM_POSE_BONES)[number]

export type CustomPose = Partial<Record<CustomPoseBone, Euler3>>

type Side = 'left' | 'right'
type Axis = 0 | 1 | 2

/** 左右で同じ意味を持つ部位（left/right を付けて実ボーンになる） */
type LimbPart = 'UpperArm' | 'LowerArm' | 'UpperLeg' | 'LowerLeg' | 'Foot'
type CenterBone =
  | typeof VRMHumanBoneName.Hips
  | typeof VRMHumanBoneName.Spine
  | typeof VRMHumanBoneName.Chest
  | typeof VRMHumanBoneName.Head

export type CustomPoseLabel = { en: string; ja: string }

export type CustomPoseControl = {
  id: string
  label: CustomPoseLabel
  /** center グループは実ボーン名、limb グループは部位名 */
  part: CenterBone | LimbPart
  axis: Axis
  /** 左側座標系での範囲（rad） */
  min: number
  max: number
  /** true のとき、スライダー右＝値が小さくなる向き（例: 腕の z は小さいほど上がる） */
  invert?: boolean
}

export type CustomPoseJointId =
  | 'head'
  | 'chest'
  | 'spine'
  | 'hips'
  | 'leftArm'
  | 'rightArm'
  | 'leftLeg'
  | 'rightLeg'

export type CustomPoseJoint = {
  id: CustomPoseJointId
  label: CustomPoseLabel
  side: Side | null
  /** プレビュー上のタップ用マーカーを置くボーン */
  markerBone: CustomPoseBone
  controls: readonly CustomPoseControl[]
}

/*
 * 可動範囲 — Meebit のボクセル体型が崩れない範囲に絞る（memory-bank/meebitVrmArms.md）。
 * 腕のひねり（UpperArm y）は Wave の顔横寄せ相当まで。Hand / Shoulder は編集不可（常に 0）。
 */
const armControls: readonly CustomPoseControl[] = [
  { id: 'raise', label: { en: 'Raise', ja: '上げ下げ' }, part: 'UpperArm', axis: 2, min: -0.8, max: 1.62, invert: true },
  { id: 'swing', label: { en: 'Forward / back', ja: '前後' }, part: 'UpperArm', axis: 0, min: -0.9, max: 2.0 },
  // 腕を上げた状態で体の正面（正中線を少し越える）まで寄せられる範囲
  { id: 'inward', label: { en: 'Bring inward', ja: '内に寄せる' }, part: 'UpperArm', axis: 1, min: -2.0, max: 0.3, invert: true },
  /*
   * Meebit の腕は rest で横（±X）に伸びているので、LowerArm の X は前腕の長軸＝ねじり。
   * 曲げは Y（左側座標系で負＝前へ曲がる）。肘は一方向にしか曲げない。
   */
  { id: 'elbow', label: { en: 'Bend elbow', ja: '肘を曲げる' }, part: 'LowerArm', axis: 1, min: -2.4, max: 0, invert: true },
  { id: 'forearmTwist', label: { en: 'Rotate forearm', ja: '前腕を回す' }, part: 'LowerArm', axis: 0, min: -1.5, max: 2.3 },
]

const legControls: readonly CustomPoseControl[] = [
  { id: 'swing', label: { en: 'Forward / back', ja: '前後' }, part: 'UpperLeg', axis: 0, min: -0.7, max: 1.8 },
  { id: 'spread', label: { en: 'Open / close', ja: '開く・閉じる' }, part: 'UpperLeg', axis: 2, min: -0.6, max: 0.35, invert: true },
  { id: 'twist', label: { en: 'Turn', ja: 'つま先の向き' }, part: 'UpperLeg', axis: 1, min: -0.5, max: 0.5 },
  { id: 'knee', label: { en: 'Knee', ja: '膝' }, part: 'LowerLeg', axis: 0, min: -2.3, max: 0, invert: true },
  { id: 'ankle', label: { en: 'Ankle', ja: '足首' }, part: 'Foot', axis: 0, min: -0.7, max: 0.8 },
]

function torsoControls(part: CenterBone, range: { pitch: [number, number]; turn: number; tilt: number }) {
  return [
    { id: 'pitch', label: { en: 'Lean', ja: '前後に倒す' }, part, axis: 0, min: range.pitch[0], max: range.pitch[1], invert: true },
    { id: 'turn', label: { en: 'Turn', ja: 'ひねる' }, part, axis: 1, min: -range.turn, max: range.turn },
    { id: 'tilt', label: { en: 'Tilt', ja: '横に傾ける' }, part, axis: 2, min: -range.tilt, max: range.tilt },
  ] as const satisfies readonly CustomPoseControl[]
}

export const CUSTOM_POSE_JOINTS: readonly CustomPoseJoint[] = [
  {
    id: 'head',
    label: { en: 'Head', ja: '頭' },
    side: null,
    markerBone: VRMHumanBoneName.Head,
    controls: [
      // Head 正 X ＝顎上げ（photoStudio.md）
      { id: 'nod', label: { en: 'Chin up / down', ja: '顎を上げ下げ' }, part: VRMHumanBoneName.Head, axis: 0, min: -0.5, max: 0.5 },
      { id: 'turn', label: { en: 'Look left / right', ja: '左右を向く' }, part: VRMHumanBoneName.Head, axis: 1, min: -1.0, max: 1.0 },
      { id: 'tilt', label: { en: 'Tilt', ja: 'かしげる' }, part: VRMHumanBoneName.Head, axis: 2, min: -0.4, max: 0.4 },
    ],
  },
  {
    id: 'chest',
    label: { en: 'Chest', ja: '胸' },
    side: null,
    markerBone: VRMHumanBoneName.Chest,
    // 胴の正 X は後傾、猫背は負 X
    controls: torsoControls(VRMHumanBoneName.Chest, { pitch: [-0.45, 0.25], turn: 0.6, tilt: 0.3 }),
  },
  {
    id: 'spine',
    label: { en: 'Waist', ja: 'お腹' },
    side: null,
    markerBone: VRMHumanBoneName.Spine,
    controls: torsoControls(VRMHumanBoneName.Spine, { pitch: [-0.45, 0.25], turn: 0.5, tilt: 0.3 }),
  },
  {
    id: 'hips',
    label: { en: 'Hips', ja: '腰' },
    side: null,
    markerBone: VRMHumanBoneName.Hips,
    controls: torsoControls(VRMHumanBoneName.Hips, { pitch: [-0.4, 0.4], turn: 0.8, tilt: 0.25 }),
  },
  {
    id: 'leftArm',
    label: { en: 'Left arm', ja: '左腕' },
    side: 'left',
    markerBone: VRMHumanBoneName.LeftLowerArm,
    controls: armControls,
  },
  {
    id: 'rightArm',
    label: { en: 'Right arm', ja: '右腕' },
    side: 'right',
    markerBone: VRMHumanBoneName.RightLowerArm,
    controls: armControls,
  },
  {
    id: 'leftLeg',
    label: { en: 'Left leg', ja: '左脚' },
    side: 'left',
    markerBone: VRMHumanBoneName.LeftLowerLeg,
    controls: legControls,
  },
  {
    id: 'rightLeg',
    label: { en: 'Right leg', ja: '右脚' },
    side: 'right',
    markerBone: VRMHumanBoneName.RightLowerLeg,
    controls: legControls,
  },
]

export function getCustomPoseJoint(id: CustomPoseJointId) {
  return CUSTOM_POSE_JOINTS.find((joint) => joint.id === id) ?? CUSTOM_POSE_JOINTS[0]
}

/** 左右反対側のジョイント（中心部位は null） */
export function getOppositeJointId(id: CustomPoseJointId): CustomPoseJointId | null {
  if (id === 'leftArm') return 'rightArm'
  if (id === 'rightArm') return 'leftArm'
  if (id === 'leftLeg') return 'rightLeg'
  if (id === 'rightLeg') return 'leftLeg'
  return null
}

function resolveBone(part: CenterBone | LimbPart, side: Side | null): CustomPoseBone {
  if (side === null) return part as CenterBone
  return `${side}${part}` as CustomPoseBone
}

/** 右側は鏡像（y, z 反転） */
function mirrorSign(axis: Axis, side: Side | null) {
  return side === 'right' && axis !== 0 ? -1 : 1
}

function readAxis(pose: CustomPose, bone: CustomPoseBone, axis: Axis) {
  return pose[bone]?.[axis] ?? 0
}

/** スライダー表示値（左側座標系・invert 適用後） */
export function getControlValue(
  pose: CustomPose,
  joint: CustomPoseJoint,
  control: CustomPoseControl,
) {
  const bone = resolveBone(control.part, joint.side)
  const actual = readAxis(pose, bone, control.axis)
  const value = actual * mirrorSign(control.axis, joint.side)
  return control.invert ? -value : value
}

/** スライダーの min / max（invert 時は符号を反転して入れ替え） */
export function getControlRange(control: CustomPoseControl) {
  return control.invert
    ? { min: -control.max, max: -control.min }
    : { min: control.min, max: control.max }
}

export function setControlValue(
  pose: CustomPose,
  joint: CustomPoseJoint,
  control: CustomPoseControl,
  sliderValue: number,
): CustomPose {
  const bone = resolveBone(control.part, joint.side)
  const leftFrame = control.invert ? -sliderValue : sliderValue
  const actual = leftFrame * mirrorSign(control.axis, joint.side)
  const current = pose[bone] ?? [0, 0, 0]
  const next: [number, number, number] = [current[0], current[1], current[2]]
  next[control.axis] = actual
  return { ...pose, [bone]: next }
}

function jointBones(joint: CustomPoseJoint): CustomPoseBone[] {
  const bones = new Set<CustomPoseBone>()
  for (const control of joint.controls) bones.add(resolveBone(control.part, joint.side))
  return [...bones]
}

/** 片側の腕／脚を、反対側へ鏡像コピー */
export function mirrorJointToOpposite(pose: CustomPose, jointId: CustomPoseJointId): CustomPose {
  const joint = getCustomPoseJoint(jointId)
  const oppositeId = getOppositeJointId(jointId)
  if (!joint.side || !oppositeId) return pose
  const opposite = getCustomPoseJoint(oppositeId)
  const next: CustomPose = { ...pose }
  const sourceBones = jointBones(joint)
  const targetBones = jointBones(opposite)
  sourceBones.forEach((source, index) => {
    const target = targetBones[index]
    const value = pose[source]
    if (!target || !value) return
    next[target] = [value[0], -value[1], -value[2]]
  })
  return next
}

/** 選択中ジョイントだけ base の値へ戻す */
export function resetJoint(
  pose: CustomPose,
  base: CustomPose,
  jointId: CustomPoseJointId,
): CustomPose {
  const joint = getCustomPoseJoint(jointId)
  const next: CustomPose = { ...pose }
  for (const bone of jointBones(joint)) {
    next[bone] = base[bone] ?? [0, 0, 0]
  }
  return next
}

/** 現在の normalized bone 回転を読み取る（プリセット適用直後に呼ぶ） */
export function captureCustomPose(vrm: VRM): CustomPose {
  const pose: CustomPose = {}
  for (const name of CUSTOM_POSE_BONES) {
    const node = vrm.humanoid.getNormalizedBoneNode(name)
    if (!node) continue
    pose[name] = [node.rotation.x, node.rotation.y, node.rotation.z]
  }
  return pose
}

/** カスタムポーズを適用。Hand / Shoulder は捻り防止で常に 0。 */
export function applyCustomPose(vrm: VRM, pose: CustomPose) {
  for (const name of CUSTOM_POSE_BONES) {
    const node = vrm.humanoid.getNormalizedBoneNode(name)
    if (!node) continue
    const isLocked =
      name === VRMHumanBoneName.LeftHand ||
      name === VRMHumanBoneName.RightHand ||
      name === VRMHumanBoneName.LeftShoulder ||
      name === VRMHumanBoneName.RightShoulder
    const value = isLocked ? undefined : pose[name]
    node.rotation.set(value?.[0] ?? 0, value?.[1] ?? 0, value?.[2] ?? 0)
  }
}

const STORAGE_KEY = 'photoStudio.customPose.v1'

type StoredCustomPose = { pose: CustomPose; base: CustomPose }

function isEuler3(value: unknown): value is Euler3 {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((n) => typeof n === 'number' && Number.isFinite(n))
  )
}

function sanitizePose(raw: unknown): CustomPose | null {
  if (!raw || typeof raw !== 'object') return null
  const pose: CustomPose = {}
  for (const name of CUSTOM_POSE_BONES) {
    const value = (raw as Record<string, unknown>)[name]
    if (isEuler3(value)) pose[name] = [value[0], value[1], value[2]]
  }
  return Object.keys(pose).length > 0 ? pose : null
}

/** 端末に保存した編集中ポーズ（リロード後も続きから） */
export function loadStoredCustomPose(): StoredCustomPose | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { pose?: unknown; base?: unknown }
    const pose = sanitizePose(parsed.pose)
    const base = sanitizePose(parsed.base)
    if (!pose || !base) return null
    return { pose, base }
  } catch {
    return null
  }
}

export function saveStoredCustomPose(value: StoredCustomPose) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // 容量超過・プライベートモードは無視
  }
}
