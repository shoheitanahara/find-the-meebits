import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import { MathUtils, Object3D } from 'three'

type LocomotionOptions = {
  elapsedTime: number
  isMoving: boolean
  isRunning?: boolean
  /** 空中（ジャンプ／落下）。歩行より優先して簡易ジャンプポーズ */
  isAirborne?: boolean
  /** 上向きが正。上昇と落下でポーズを少し変える */
  verticalVelocity?: number
  idleOffset?: number
  /** 歩行サイクルの開始タイミングずらし（同じ速さで位相だけずらす） */
  walkPhaseOffset?: number
}

/** NPC 用の歩行タイミングずらし（同じモーション、3 パターンの位相） */
const NPC_WALK_PHASE_OFFSETS = [0, Math.PI / 3, (Math.PI * 2) / 3] as const

export function getNpcWalkPhaseOffset(meebitNumber: number) {
  const index = Math.abs(meebitNumber * 7) % NPC_WALK_PHASE_OFFSETS.length
  return NPC_WALK_PHASE_OFFSETS[index]
}

const armRestZ = {
  left: 1.35,
  right: -1.35,
}

/** 竿持ち右腕の脇。立ち／釣りはガッツリ閉め、歩行は従来値のまま */
const rodArmZClosed = armRestZ.right * 1.15
const rodArmZWalk = armRestZ.right * 0.88

const attentionArmZ = {
  left: 1.56,
  right: -1.56,
}

const elbowBaseBend = 0.08
const kneeBaseBend = -0.16

/** プレビュー／展示用の直立ポーズ（Photo Booth「直立」と同一） */
export function applyVRMAttentionPose(vrm: VRM | null) {
  if (!vrm) {
    return
  }

  const leftUpperArm = getBone(vrm, VRMHumanBoneName.LeftUpperArm)
  const rightUpperArm = getBone(vrm, VRMHumanBoneName.RightUpperArm)
  const leftLowerArm = getBone(vrm, VRMHumanBoneName.LeftLowerArm)
  const rightLowerArm = getBone(vrm, VRMHumanBoneName.RightLowerArm)
  const leftUpperLeg = getBone(vrm, VRMHumanBoneName.LeftUpperLeg)
  const rightUpperLeg = getBone(vrm, VRMHumanBoneName.RightUpperLeg)
  const leftLowerLeg = getBone(vrm, VRMHumanBoneName.LeftLowerLeg)
  const rightLowerLeg = getBone(vrm, VRMHumanBoneName.RightLowerLeg)
  const leftFoot = getBone(vrm, VRMHumanBoneName.LeftFoot)
  const rightFoot = getBone(vrm, VRMHumanBoneName.RightFoot)

  setRotationImmediate(getBone(vrm, VRMHumanBoneName.Hips), { x: 0, y: 0, z: 0 })
  setRotationImmediate(getBone(vrm, VRMHumanBoneName.Spine), { x: 0, y: 0, z: 0 })
  setRotationImmediate(getBone(vrm, VRMHumanBoneName.Chest), { x: 0, y: 0, z: 0 })
  setRotationImmediate(getBone(vrm, VRMHumanBoneName.Head), { x: 0, y: 0, z: 0 })
  setRotationImmediate(getBone(vrm, VRMHumanBoneName.LeftShoulder), { x: 0, y: 0, z: 0 })
  setRotationImmediate(getBone(vrm, VRMHumanBoneName.RightShoulder), { x: 0, y: 0, z: 0 })
  setRotationImmediate(leftUpperArm, { x: 0, y: 0, z: attentionArmZ.left })
  setRotationImmediate(rightUpperArm, { x: 0, y: 0, z: attentionArmZ.right })
  setRotationImmediate(leftLowerArm, { x: 0.03, y: 0, z: 0 })
  setRotationImmediate(rightLowerArm, { x: 0.03, y: 0, z: 0 })
  setRotationImmediate(getBone(vrm, VRMHumanBoneName.LeftHand), { x: 0, y: 0, z: 0 })
  setRotationImmediate(getBone(vrm, VRMHumanBoneName.RightHand), { x: 0, y: 0, z: 0 })
  // Photo Booth 直立と同じく膝・足首は伸ばす（kneeBaseBend は歩行／他ポーズ用）
  setRotationImmediate(leftUpperLeg, { x: 0, y: 0, z: 0 })
  setRotationImmediate(rightUpperLeg, { x: 0, y: 0, z: 0 })
  setRotationImmediate(leftLowerLeg, { x: 0, y: 0, z: 0 })
  setRotationImmediate(rightLowerLeg, { x: 0, y: 0, z: 0 })
  setRotationImmediate(leftFoot, { x: 0, y: 0, z: 0 })
  setRotationImmediate(rightFoot, { x: 0, y: 0, z: 0 })
}

/** フィギュア用 — 上腕を体側へ（脇の空きを減らす） */
const figureArmZ = {
  left: 1.58,
  right: -1.58,
}

/** フィギュア展示用 — 両腕を体の横に自然下垂（T ポーズ解消） */
export function applyVRMFigurePose(vrm: VRM | null) {
  if (!vrm) {
    return
  }

  const leftUpperArm = getBone(vrm, VRMHumanBoneName.LeftUpperArm)
  const rightUpperArm = getBone(vrm, VRMHumanBoneName.RightUpperArm)
  const leftLowerArm = getBone(vrm, VRMHumanBoneName.LeftLowerArm)
  const rightLowerArm = getBone(vrm, VRMHumanBoneName.RightLowerArm)
  const leftUpperLeg = getBone(vrm, VRMHumanBoneName.LeftUpperLeg)
  const rightUpperLeg = getBone(vrm, VRMHumanBoneName.RightUpperLeg)
  const leftLowerLeg = getBone(vrm, VRMHumanBoneName.LeftLowerLeg)
  const rightLowerLeg = getBone(vrm, VRMHumanBoneName.RightLowerLeg)
  const leftFoot = getBone(vrm, VRMHumanBoneName.LeftFoot)
  const rightFoot = getBone(vrm, VRMHumanBoneName.RightFoot)

  setRotationImmediate(getBone(vrm, VRMHumanBoneName.Hips), { x: 0, y: 0, z: 0 })
  setRotationImmediate(getBone(vrm, VRMHumanBoneName.Spine), { x: 0, y: 0, z: 0 })
  setRotationImmediate(getBone(vrm, VRMHumanBoneName.Chest), { x: 0, y: 0, z: 0 })
  setRotationImmediate(getBone(vrm, VRMHumanBoneName.Head), { x: 0, y: 0, z: 0 })
  setRotationImmediate(leftUpperArm, { x: 0.1, y: 0, z: figureArmZ.left })
  setRotationImmediate(rightUpperArm, { x: 0.1, y: 0, z: figureArmZ.right })
  setRotationImmediate(leftLowerArm, { x: elbowBaseBend + 0.06, y: 0, z: 0 })
  setRotationImmediate(rightLowerArm, { x: elbowBaseBend + 0.06, y: 0, z: 0 })
  setRotationImmediate(leftUpperLeg, { x: 0, y: 0, z: 0 })
  setRotationImmediate(rightUpperLeg, { x: 0, y: 0, z: 0 })
  setRotationImmediate(leftLowerLeg, { x: kneeBaseBend, y: 0, z: 0 })
  setRotationImmediate(rightLowerLeg, { x: kneeBaseBend, y: 0, z: 0 })
  setRotationImmediate(leftFoot, { x: 0.04, y: 0, z: 0 })
  setRotationImmediate(rightFoot, { x: 0.04, y: 0, z: 0 })
}

type SitPoseBreathingOptions = {
  elapsedTime: number
  breathPhaseOffset?: number
  breathRate?: number
  breathAmplitude?: number
  headPhaseOffset?: number
}

/** 観客ごとに呼吸リズム・位相をずらす（同調を避ける） */
export function getAudienceBreathParams(meebitNumber: number) {
  const seed = Math.abs(meebitNumber * 17 + 31)
  const seed2 = Math.abs(meebitNumber * 23 + 11)
  return {
    breathPhaseOffset: ((seed % 360) / 360) * Math.PI * 2,
    breathRate: 1.22 + (seed % 58) / 100,
    breathAmplitude: 0.78 + (seed2 % 42) / 100,
    headPhaseOffset: ((seed2 % 360) / 360) * Math.PI * 2,
  }
}

function sampleSitBreath(options: SitPoseBreathingOptions) {
  const rate = options.breathRate ?? 1.55
  const phase = options.breathPhaseOffset ?? 0
  const amp = options.breathAmplitude ?? 1
  const t = options.elapsedTime * rate + phase
  // 単純な sin だけだと機械的なので、ゆっくりした二次成分を混ぜる
  const primary = Math.sin(t)
  const secondary = Math.sin(t * 0.43 + phase * 1.7) * 0.28
  return (primary * 0.82 + secondary) * amp * 0.032
}

/** ベンチ着席用の簡易シットポーズ（任意で肩の呼吸を重ねる） */
export function applyVRMSitPose(vrm: VRM | null, breathing?: SitPoseBreathingOptions) {
  if (!vrm) {
    return
  }

  const leftUpperArm = getBone(vrm, VRMHumanBoneName.LeftUpperArm)
  const rightUpperArm = getBone(vrm, VRMHumanBoneName.RightUpperArm)
  const leftLowerArm = getBone(vrm, VRMHumanBoneName.LeftLowerArm)
  const rightLowerArm = getBone(vrm, VRMHumanBoneName.RightLowerArm)
  const leftUpperLeg = getBone(vrm, VRMHumanBoneName.LeftUpperLeg)
  const rightUpperLeg = getBone(vrm, VRMHumanBoneName.RightUpperLeg)
  const leftLowerLeg = getBone(vrm, VRMHumanBoneName.LeftLowerLeg)
  const rightLowerLeg = getBone(vrm, VRMHumanBoneName.RightLowerLeg)
  const leftFoot = getBone(vrm, VRMHumanBoneName.LeftFoot)
  const rightFoot = getBone(vrm, VRMHumanBoneName.RightFoot)
  const hips = getBone(vrm, VRMHumanBoneName.Hips)
  const spine = getBone(vrm, VRMHumanBoneName.Spine)
  const chest = getBone(vrm, VRMHumanBoneName.Chest)
  const head = getBone(vrm, VRMHumanBoneName.Head)

  const breath = breathing ? sampleSitBreath(breathing) : 0
  const headIdle = breathing
    ? Math.sin(breathing.elapsedTime * 0.62 + (breathing.headPhaseOffset ?? 0)) *
      (breathing.breathAmplitude ?? 1) *
      0.012
    : 0
  const headTurn = breathing
    ? Math.sin(breathing.elapsedTime * 0.35 + (breathing.headPhaseOffset ?? 0) * 1.4) *
      (breathing.breathAmplitude ?? 1) *
      0.018
    : 0
  const setPose = breathing ? setRotation : setRotationImmediate

  // 腕は立位の自然下垂（ねじり・膝上置きなし）。脚だけ着席
  setPose(hips, { x: 0.12 + breath * 0.35, y: 0, z: 0 })
  setPose(spine, { x: -0.08 + breath * 0.75, y: 0, z: 0 })
  setPose(chest, { x: -0.04 + breath * 1.15, y: 0, z: 0 })
  setPose(head, { x: 0.04 + breath * 0.35 + headIdle, y: headTurn, z: 0 })
  setPose(leftUpperArm, { x: 0, y: 0, z: armRestZ.left })
  setPose(rightUpperArm, { x: 0, y: 0, z: armRestZ.right })
  setPose(leftLowerArm, { x: elbowBaseBend, y: 0, z: 0 })
  setPose(rightLowerArm, { x: elbowBaseBend, y: 0, z: 0 })
  setPose(leftUpperLeg, { x: 1.15, y: 0.04, z: 0 })
  setPose(rightUpperLeg, { x: 1.15, y: -0.04, z: 0 })
  setPose(leftLowerLeg, { x: -1.35, y: 0, z: 0 })
  setPose(rightLowerLeg, { x: -1.35, y: 0, z: 0 })
  setPose(leftFoot, { x: -0.12, y: 0, z: 0 })
  setPose(rightFoot, { x: -0.12, y: 0, z: 0 })
}

export function applyVRMDjPose(
  vrm: VRM | null,
  options: {
    elapsedTime: number
    idleOffset?: number
  },
) {
  if (!vrm) {
    return
  }

  const t = options.elapsedTime + (options.idleOffset ?? 0) * 0.07
  const beatStep = Math.floor(t * 2.6)
  const beatFlip = beatStep % 2 === 0 ? 1 : -0.55
  const microStep = Math.floor(t * 5.2) % 3
  const headJag = [0.05, -0.025, 0.035][microStep] * beatFlip
  const headTurn = (beatStep % 4 < 2 ? 0.04 : -0.03) + Math.sin(t * 4.1) * 0.012

  const hips = getBone(vrm, VRMHumanBoneName.Hips)
  const spine = getBone(vrm, VRMHumanBoneName.Spine)
  const chest = getBone(vrm, VRMHumanBoneName.Chest)
  const head = getBone(vrm, VRMHumanBoneName.Head)
  const leftUpperArm = getBone(vrm, VRMHumanBoneName.LeftUpperArm)
  const rightUpperArm = getBone(vrm, VRMHumanBoneName.RightUpperArm)
  const leftLowerArm = getBone(vrm, VRMHumanBoneName.LeftLowerArm)
  const rightLowerArm = getBone(vrm, VRMHumanBoneName.RightLowerArm)
  const leftUpperLeg = getBone(vrm, VRMHumanBoneName.LeftUpperLeg)
  const rightUpperLeg = getBone(vrm, VRMHumanBoneName.RightUpperLeg)
  const leftLowerLeg = getBone(vrm, VRMHumanBoneName.LeftLowerLeg)
  const rightLowerLeg = getBone(vrm, VRMHumanBoneName.RightLowerLeg)
  const leftFoot = getBone(vrm, VRMHumanBoneName.LeftFoot)
  const rightFoot = getBone(vrm, VRMHumanBoneName.RightFoot)

  const sideLean = Math.sin(t * 1.35) * 0.02

  setRotation(hips, { y: sideLean * 0.6, z: sideLean })
  setRotation(spine, { x: 0.05 + headJag * 0.15, y: sideLean * 0.5 })
  setRotation(chest, { x: 0.03, y: -sideLean * 0.35 })
  setRotation(head, { x: headJag, y: headTurn, z: sideLean * 0.35 })

  setRotation(leftUpperArm, { z: armRestZ.left })
  setRotation(rightUpperArm, { z: armRestZ.right })
  setRotation(leftLowerArm, { x: elbowBaseBend, z: 0 })
  setRotation(rightLowerArm, { x: elbowBaseBend, z: 0 })

  const stepPhase = Math.sin(t * 1.35)
  setRotation(leftUpperLeg, { x: stepPhase * 0.05, z: -stepPhase * 0.03 })
  setRotation(rightUpperLeg, { x: -stepPhase * 0.05, z: stepPhase * 0.03 })
  setRotation(leftLowerLeg, { x: kneeBaseBend - Math.max(0, stepPhase) * 0.08 })
  setRotation(rightLowerLeg, { x: kneeBaseBend - Math.max(0, -stepPhase) * 0.08 })
  setRotation(leftFoot, { x: 0.05 + Math.max(0, stepPhase) * 0.06 })
  setRotation(rightFoot, { x: 0.05 + Math.max(0, -stepPhase) * 0.06 })
}

export function applyVRMLocomotion(vrm: VRM | null, options: LocomotionOptions) {
  if (!vrm) {
    return
  }

  const hips = getBone(vrm, VRMHumanBoneName.Hips)
  const spine = getBone(vrm, VRMHumanBoneName.Spine)
  const chest = getBone(vrm, VRMHumanBoneName.Chest)
  const head = getBone(vrm, VRMHumanBoneName.Head)
  const leftUpperArm = getBone(vrm, VRMHumanBoneName.LeftUpperArm)
  const rightUpperArm = getBone(vrm, VRMHumanBoneName.RightUpperArm)
  const leftLowerArm = getBone(vrm, VRMHumanBoneName.LeftLowerArm)
  const rightLowerArm = getBone(vrm, VRMHumanBoneName.RightLowerArm)
  const leftUpperLeg = getBone(vrm, VRMHumanBoneName.LeftUpperLeg)
  const rightUpperLeg = getBone(vrm, VRMHumanBoneName.RightUpperLeg)
  const leftLowerLeg = getBone(vrm, VRMHumanBoneName.LeftLowerLeg)
  const rightLowerLeg = getBone(vrm, VRMHumanBoneName.RightLowerLeg)
  const leftFoot = getBone(vrm, VRMHumanBoneName.LeftFoot)
  const rightFoot = getBone(vrm, VRMHumanBoneName.RightFoot)

  // ジャンプ: 前傾＋脚たたみの単一ポーズ（上昇／落下で切り替えない）
  if (options.isAirborne) {
    const lean = -0.24
    const tuck = 0.95

    setRotationFast(hips, { x: lean * 0.7, y: 0, z: 0 })
    setRotationFast(spine, { x: lean, y: 0 })
    setRotationFast(chest, { x: lean * 0.55, y: 0, z: 0 })
    setRotationFast(head, { x: -0.02, y: 0 })

    setRotationFast(leftUpperArm, { x: 0.4, z: 0.85 })
    setRotationFast(rightUpperArm, { x: 0.4, z: -0.85 })
    setRotationFast(leftLowerArm, { x: 0.28, z: 0 })
    setRotationFast(rightLowerArm, { x: 0.28, z: 0 })

    setRotationFast(leftUpperLeg, { x: tuck * 1.05 })
    setRotationFast(rightUpperLeg, { x: tuck * 0.95 })
    setRotationFast(leftLowerLeg, { x: kneeBaseBend - tuck * 1.55 })
    setRotationFast(rightLowerLeg, { x: kneeBaseBend - tuck * 1.45 })
    setRotationFast(leftFoot, { x: 0.42 })
    setRotationFast(rightFoot, { x: 0.36 })
    return
  }

  const speed = options.isRunning ? 12 : 7
  const phase = options.walkPhaseOffset ?? 0
  const stride = Math.sin(options.elapsedTime * speed + phase)
  const counterStride = Math.sin(options.elapsedTime * speed + phase + Math.PI)
  const idle = Math.sin(options.elapsedTime * 1.8 + (options.idleOffset ?? 0))
  const movementWeight = options.isMoving ? 1 : 0
  const idleWeight = 1 - movementWeight

  setRotation(hips, {
    x: idle * 0.015 * idleWeight,
    y: stride * 0.035 * movementWeight,
    z: counterStride * 0.025 * movementWeight,
  })
  setRotation(spine, {
    x: -0.05 * movementWeight + idle * 0.012 * idleWeight,
    y: counterStride * 0.03 * movementWeight,
  })
  setRotation(chest, {
    x: idle * 0.018 * idleWeight,
    y: counterStride * 0.04 * movementWeight,
    z: stride * 0.018 * movementWeight,
  })
  setRotation(head, {
    x: idle * 0.018 * idleWeight,
    y: stride * 0.018 * movementWeight,
  })

  setRotation(leftUpperArm, {
    x: counterStride * 0.36 * movementWeight,
    z: armRestZ.left,
  })
  setRotation(rightUpperArm, {
    x: stride * 0.36 * movementWeight,
    z: armRestZ.right,
  })
  setRotation(leftLowerArm, {
    x: elbowBaseBend,
    z: 0,
  })
  setRotation(rightLowerArm, {
    x: elbowBaseBend,
    z: 0,
  })

  setRotation(leftUpperLeg, {
    x: stride * 0.34 * movementWeight,
  })
  setRotation(rightUpperLeg, {
    x: counterStride * 0.34 * movementWeight,
  })
  setRotation(leftLowerLeg, {
    x: kneeBaseBend - Math.max(0, -stride) * 0.62 * movementWeight,
  })
  setRotation(rightLowerLeg, {
    x: kneeBaseBend - Math.max(0, -counterStride) * 0.62 * movementWeight,
  })
  setRotation(leftFoot, {
    x: 0.08 + Math.max(0, stride) * 0.22 * movementWeight,
  })
  setRotation(rightFoot, {
    x: 0.08 + Math.max(0, counterStride) * 0.22 * movementWeight,
  })
}

type ShootingPoseOptions = {
  /** ピストルと同じ上下照準角（ラジアン） */
  aimPitch: number
  /** 0..1 発砲反動 */
  recoil: number
}

export type FishingAction = 'carry' | 'cast' | 'wait' | 'reel' | 'catch'

type FishingPoseOptions = {
  elapsedTime: number
  isMoving: boolean
  isRunning?: boolean
  idleOffset?: number
  walkPhaseOffset?: number
  action: FishingAction
  /** cast / reel の 0..1 */
  actionT: number
  /** cast のうち振りかぶり（竿上げ）の割合。以降は引き上げの逆で振り下ろし */
  castWindupRatio?: number
}

const HALF_PI = Math.PI / 2

function smooth01(t: number) {
  return t * t * (3 - 2 * t)
}

/**
 * 釣り用。下半身は歩行、右腕で竿を持ち、キャスト／待ち／引き上げを表現する。
 */
export function applyVRMFishingPose(vrm: VRM | null, options: FishingPoseOptions) {
  if (!vrm) return

  const hips = getBone(vrm, VRMHumanBoneName.Hips)
  const spine = getBone(vrm, VRMHumanBoneName.Spine)
  const chest = getBone(vrm, VRMHumanBoneName.Chest)
  const head = getBone(vrm, VRMHumanBoneName.Head)
  const leftUpperArm = getBone(vrm, VRMHumanBoneName.LeftUpperArm)
  const rightUpperArm = getBone(vrm, VRMHumanBoneName.RightUpperArm)
  const leftLowerArm = getBone(vrm, VRMHumanBoneName.LeftLowerArm)
  const rightLowerArm = getBone(vrm, VRMHumanBoneName.RightLowerArm)
  const leftUpperLeg = getBone(vrm, VRMHumanBoneName.LeftUpperLeg)
  const rightUpperLeg = getBone(vrm, VRMHumanBoneName.RightUpperLeg)
  const leftLowerLeg = getBone(vrm, VRMHumanBoneName.LeftLowerLeg)
  const rightLowerLeg = getBone(vrm, VRMHumanBoneName.RightLowerLeg)
  const leftFoot = getBone(vrm, VRMHumanBoneName.LeftFoot)
  const rightFoot = getBone(vrm, VRMHumanBoneName.RightFoot)

  const speed = options.isRunning ? 12 : 7
  const phase = options.walkPhaseOffset ?? 0
  const stride = Math.sin(options.elapsedTime * speed + phase)
  const counterStride = Math.sin(options.elapsedTime * speed + phase + Math.PI)
  const idle = Math.sin(options.elapsedTime * 1.8 + (options.idleOffset ?? 0))
  const movementWeight = options.isMoving ? 1 : 0
  const idleWeight = 1 - movementWeight
  const actionT = MathUtils.clamp(options.actionT, 0, 1)

  setRotation(hips, {
    x: idle * 0.015 * idleWeight,
    y: stride * 0.035 * movementWeight,
    z: counterStride * 0.025 * movementWeight,
  })
  setRotation(spine, {
    x: -0.05 * movementWeight + idle * 0.012 * idleWeight,
    y: counterStride * 0.03 * movementWeight,
  })
  setRotation(chest, {
    x: idle * 0.018 * idleWeight,
    y: counterStride * 0.04 * movementWeight,
    z: stride * 0.018 * movementWeight,
  })
  setRotation(head, {
    x: idle * 0.018 * idleWeight,
    y: stride * 0.018 * movementWeight,
  })

  setRotation(leftUpperLeg, { x: stride * 0.34 * movementWeight })
  setRotation(rightUpperLeg, { x: counterStride * 0.34 * movementWeight })
  setRotation(leftLowerLeg, {
    x: kneeBaseBend - Math.max(0, -stride) * 0.62 * movementWeight,
  })
  setRotation(rightLowerLeg, {
    x: kneeBaseBend - Math.max(0, -counterStride) * 0.62 * movementWeight,
  })
  setRotation(leftFoot, { x: 0.08 + Math.max(0, stride) * 0.22 * movementWeight })
  setRotation(rightFoot, { x: 0.08 + Math.max(0, counterStride) * 0.22 * movementWeight })

  // 左腕：歩行時は振る。釣り動作中は支え／引き上げ
  if (options.action === 'carry') {
    setRotation(leftUpperArm, {
      x: counterStride * 0.28 * movementWeight,
      z: armRestZ.left,
    })
    setRotation(leftLowerArm, { x: elbowBaseBend, z: 0 })
  } else if (options.action === 'cast') {
    // 引き上げ終端 ← 振りかぶり／ 引き上げの逆 → wait
    const split = MathUtils.clamp(options.castWindupRatio ?? 0.27, 0.12, 0.45)
    const wind = smooth01(MathUtils.clamp(actionT / split, 0, 1))
    const throwT = smooth01(
      MathUtils.clamp((actionT - split) / Math.max(1 - split, 0.01), 0, 1),
    )
    if (actionT < split) {
      setRotation(leftUpperArm, {
        x: MathUtils.lerp(0.25, 1.2, wind),
        z: MathUtils.lerp(armRestZ.left * 0.92, armRestZ.left * 0.55, wind),
      })
      setRotation(leftLowerArm, { x: MathUtils.lerp(0.35, 0.55, wind), z: 0 })
    } else {
      setRotation(leftUpperArm, {
        x: MathUtils.lerp(1.2, 0.25, throwT),
        z: MathUtils.lerp(armRestZ.left * 0.55, armRestZ.left * 0.92, throwT),
      })
      setRotation(leftLowerArm, { x: MathUtils.lerp(0.55, 0.35, throwT), z: 0 })
    }
  } else if (options.action === 'wait') {
    setRotation(leftUpperArm, { x: 0.25 + idle * 0.03, z: armRestZ.left * 0.92 })
    setRotation(leftLowerArm, { x: 0.35, z: 0 })
  } else {
    // reel / catch：両手で引き上げ
    setRotation(leftUpperArm, {
      x: 0.85 + actionT * 0.35,
      z: armRestZ.left * 0.55,
    })
    setRotation(leftLowerArm, { x: 0.55, z: 0 })
  }

  // 右腕：竿持ち。歩行は従来どおり、立ち／釣りだけ脇を閉める
  if (options.action === 'carry') {
    setRotation(rightUpperArm, {
      x: 0.62 + stride * 0.06 * movementWeight,
      y: 0,
      z: MathUtils.lerp(rodArmZClosed, rodArmZWalk, movementWeight),
    })
    setRotation(rightLowerArm, { x: 0.42, y: 0, z: 0 })
  } else if (options.action === 'cast') {
    // 前半：wait 付近から引き上げ終端へ。後半：その逆で wait へ振り下ろす
    const split = MathUtils.clamp(options.castWindupRatio ?? 0.27, 0.12, 0.45)
    const wind = smooth01(MathUtils.clamp(actionT / split, 0, 1))
    const throwT = smooth01(
      MathUtils.clamp((actionT - split) / Math.max(1 - split, 0.01), 0, 1),
    )
    if (actionT < split) {
      setRotation(rightUpperArm, {
        x: MathUtils.lerp(0.7, 1.45, wind),
        y: 0,
        z: rodArmZClosed,
      })
      setRotation(rightLowerArm, {
        x: MathUtils.lerp(0.35, 0.45, wind),
        y: 0,
        z: 0,
      })
      setRotation(chest, {
        x: MathUtils.lerp(-0.02, 0.02, wind),
        y: 0,
        z: 0,
      })
      setRotation(spine, {
        x: MathUtils.lerp(-0.04, 0.02, wind),
        y: counterStride * 0.02 * movementWeight,
      })
    } else {
      setRotation(rightUpperArm, {
        x: MathUtils.lerp(1.45, 0.95, throwT),
        y: 0,
        z: rodArmZClosed,
      })
      setRotation(rightLowerArm, {
        x: MathUtils.lerp(0.45, 0.28, throwT),
        y: 0,
        z: 0,
      })
      setRotation(chest, {
        x: MathUtils.lerp(0.02, idle * 0.018 * idleWeight, throwT),
        y: 0,
        z: 0,
      })
      setRotation(spine, {
        x: MathUtils.lerp(0.02, -0.05 * movementWeight, throwT),
        y: counterStride * 0.02 * movementWeight,
      })
      setRotation(head, {
        x: MathUtils.lerp(0.04, 0.12, throwT),
        y: 0,
      })
    }
  } else if (options.action === 'wait') {
    setRotation(rightUpperArm, {
      x: 0.95 + idle * 0.04,
      y: 0,
      z: rodArmZClosed,
    })
    setRotation(rightLowerArm, { x: 0.28, y: 0, z: 0 })
    setRotation(head, { x: 0.12 + idle * 0.02, y: 0 })
  } else {
    setRotation(rightUpperArm, {
      x: 1.05 + actionT * 0.4,
      y: 0,
      z: rodArmZClosed,
    })
    setRotation(rightLowerArm, { x: 0.45, y: 0, z: 0 })
    setRotation(chest, { x: -0.06 + actionT * 0.08, y: 0, z: 0 })
  }
}

/**
 * 射的用の構え。下半身を固定し、右腕だけを前方へ真っ直ぐ伸ばす。左腕は体側へ下ろす。
 * VRM 間の差が出やすい腕の Y 回転は使わず、照準時の捻れを防ぐ。
 */
export function applyVRMShootingPose(vrm: VRM | null, options: ShootingPoseOptions) {
  if (!vrm) return

  const pitch = MathUtils.clamp(options.aimPitch, -0.4, 0.4)
  const recoil = MathUtils.clamp(options.recoil, 0, 1)

  const hips = getBone(vrm, VRMHumanBoneName.Hips)
  const spine = getBone(vrm, VRMHumanBoneName.Spine)
  const chest = getBone(vrm, VRMHumanBoneName.Chest)
  const head = getBone(vrm, VRMHumanBoneName.Head)
  const leftUpperArm = getBone(vrm, VRMHumanBoneName.LeftUpperArm)
  const rightUpperArm = getBone(vrm, VRMHumanBoneName.RightUpperArm)
  const leftLowerArm = getBone(vrm, VRMHumanBoneName.LeftLowerArm)
  const rightLowerArm = getBone(vrm, VRMHumanBoneName.RightLowerArm)
  const leftUpperLeg = getBone(vrm, VRMHumanBoneName.LeftUpperLeg)
  const rightUpperLeg = getBone(vrm, VRMHumanBoneName.RightUpperLeg)
  const leftLowerLeg = getBone(vrm, VRMHumanBoneName.LeftLowerLeg)
  const rightLowerLeg = getBone(vrm, VRMHumanBoneName.RightLowerLeg)
  const leftFoot = getBone(vrm, VRMHumanBoneName.LeftFoot)
  const rightFoot = getBone(vrm, VRMHumanBoneName.RightFoot)

  setRotation(hips, { x: 0.04, y: 0, z: 0 })
  setRotation(spine, { x: -0.04 + pitch * 0.15, y: 0, z: 0 })
  setRotation(chest, { x: -0.03 + pitch * 0.25 - recoil * 0.04, y: 0, z: 0 })
  setRotation(head, { x: pitch * 0.65, y: 0, z: 0 })

  // 右腕：立正と同じ z で体側へ下ろし、x で前方へ振り上げる。捻り軸（y）は使わない。
  setRotation(rightUpperArm, {
    x: HALF_PI + pitch + recoil * 0.16,
    y: 0,
    z: attentionArmZ.right,
  })
  setRotation(rightLowerArm, {
    x: 0,
    y: 0,
    z: 0,
  })
  // 左腕：横に真っ直ぐ下ろすだけ。
  setRotation(leftUpperArm, {
    x: 0,
    y: 0,
    z: attentionArmZ.left,
  })
  setRotation(leftLowerArm, {
    x: 0,
    y: 0,
    z: 0,
  })

  setRotation(leftUpperLeg, { x: 0.02, y: 0, z: 0 })
  setRotation(rightUpperLeg, { x: 0.02, y: 0, z: 0 })
  setRotation(leftLowerLeg, { x: kneeBaseBend, y: 0, z: 0 })
  setRotation(rightLowerLeg, { x: kneeBaseBend, y: 0, z: 0 })
  setRotation(leftFoot, { x: 0.05, y: 0, z: 0 })
  setRotation(rightFoot, { x: 0.05, y: 0, z: 0 })
}

/**
 * ライド着席 + 射撃構え。下半身はシット、上半身・腕は射撃と同じ。
 * 宇宙船など座席に乗ったまま撃つ演出向け。
 */
export function applyVRMSeatedShootingPose(vrm: VRM | null, options: ShootingPoseOptions) {
  if (!vrm) return

  const pitch = MathUtils.clamp(options.aimPitch, -0.4, 0.4)
  const recoil = MathUtils.clamp(options.recoil, 0, 1)

  const hips = getBone(vrm, VRMHumanBoneName.Hips)
  const spine = getBone(vrm, VRMHumanBoneName.Spine)
  const chest = getBone(vrm, VRMHumanBoneName.Chest)
  const head = getBone(vrm, VRMHumanBoneName.Head)
  const leftUpperArm = getBone(vrm, VRMHumanBoneName.LeftUpperArm)
  const rightUpperArm = getBone(vrm, VRMHumanBoneName.RightUpperArm)
  const leftLowerArm = getBone(vrm, VRMHumanBoneName.LeftLowerArm)
  const rightLowerArm = getBone(vrm, VRMHumanBoneName.RightLowerArm)
  const leftUpperLeg = getBone(vrm, VRMHumanBoneName.LeftUpperLeg)
  const rightUpperLeg = getBone(vrm, VRMHumanBoneName.RightUpperLeg)
  const leftLowerLeg = getBone(vrm, VRMHumanBoneName.LeftLowerLeg)
  const rightLowerLeg = getBone(vrm, VRMHumanBoneName.RightLowerLeg)
  const leftFoot = getBone(vrm, VRMHumanBoneName.LeftFoot)
  const rightFoot = getBone(vrm, VRMHumanBoneName.RightFoot)

  setRotation(hips, { x: 0.12, y: 0, z: 0 })
  setRotation(spine, { x: -0.06 + pitch * 0.15, y: 0, z: 0 })
  setRotation(chest, { x: -0.03 + pitch * 0.25 - recoil * 0.04, y: 0, z: 0 })
  setRotation(head, { x: 0.04 + pitch * 0.65, y: 0, z: 0 })

  setRotation(rightUpperArm, {
    x: HALF_PI + pitch + recoil * 0.16,
    y: 0,
    z: attentionArmZ.right,
  })
  setRotation(rightLowerArm, { x: 0, y: 0, z: 0 })
  setRotation(leftUpperArm, { x: 0, y: 0, z: attentionArmZ.left })
  setRotation(leftLowerArm, { x: 0, y: 0, z: 0 })

  setRotation(leftUpperLeg, { x: 1.15, y: 0.04, z: 0 })
  setRotation(rightUpperLeg, { x: 1.15, y: -0.04, z: 0 })
  setRotation(leftLowerLeg, { x: -1.35, y: 0, z: 0 })
  setRotation(rightLowerLeg, { x: -1.35, y: 0, z: 0 })
  setRotation(leftFoot, { x: -0.12, y: 0, z: 0 })
  setRotation(rightFoot, { x: -0.12, y: 0, z: 0 })
}

function getBone(vrm: VRM, boneName: VRMHumanBoneName) {
  return vrm.humanoid.getNormalizedBoneNode(boneName)
}

function setRotation(
  bone: Object3D | null,
  rotation: {
    x?: number
    y?: number
    z?: number
  },
) {
  if (!bone) {
    return
  }

  const smoothing = 0.35
  if (rotation.x !== undefined) bone.rotation.x = MathUtils.lerp(bone.rotation.x, rotation.x, smoothing)
  if (rotation.y !== undefined) bone.rotation.y = MathUtils.lerp(bone.rotation.y, rotation.y, smoothing)
  if (rotation.z !== undefined) bone.rotation.z = MathUtils.lerp(bone.rotation.z, rotation.z, smoothing)
}

/** ジャンプなど切り替えを速く見せる */
function setRotationFast(
  bone: Object3D | null,
  rotation: {
    x?: number
    y?: number
    z?: number
  },
) {
  if (!bone) {
    return
  }

  const smoothing = 0.62
  if (rotation.x !== undefined) bone.rotation.x = MathUtils.lerp(bone.rotation.x, rotation.x, smoothing)
  if (rotation.y !== undefined) bone.rotation.y = MathUtils.lerp(bone.rotation.y, rotation.y, smoothing)
  if (rotation.z !== undefined) bone.rotation.z = MathUtils.lerp(bone.rotation.z, rotation.z, smoothing)
}

function setRotationImmediate(
  bone: Object3D | null,
  rotation: {
    x?: number
    y?: number
    z?: number
  },
) {
  if (!bone) {
    return
  }

  if (rotation.x !== undefined) bone.rotation.x = rotation.x
  if (rotation.y !== undefined) bone.rotation.y = rotation.y
  if (rotation.z !== undefined) bone.rotation.z = rotation.z
}
