import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import { Object3D } from 'three'
import { applyVRMSitPose, applyVRMShootingPose } from '../avatar/VRMLocomotion'
import type { PhotoStudioPoseId } from './config'

/**
 * Meebit VRM（normalized）腕 — Photo Booth。
 *
 * UpperArm Z: 体側へ下ろす（左 +1.56 / 右 −1.56 が直立）
 * UpperArm X: 前後振り（正 = 前）
 * LowerArm X: 肘曲げ
 * UpperArm Y: 内側寄せ（左右で符号反転）。Wave のみ使用
 */
const attentionArmZ = { left: 1.56, right: -1.56 } as const
/**
 * Wave — 右手を顔横へ上げる（旧 Think の見え方を Wave として採用）。
 * upperY は setArm 内で右＝負方向に反転する前提の「寄せ量」。
 */
const waveArm = {
  upperX: 0.2,
  upperY: -1.2,
  upperZ: 0.35,
  elbowX: 1.4,
  lowerY: -0.24,
} as const
/**
 * Cheer — 両手を頭上へ。
 * Z=0 が T ポーズ、正が体側下ろしなので、万歳は Z を 0 より少し反対側へ。
 */
const cheerArm = { upperX: 0.28, upperZ: -0.55, elbowX: 0.22 } as const
const elbowRest = 0.03
const kneeBaseBend = -0.16

function bone(vrm: VRM, name: VRMHumanBoneName) {
  return vrm.humanoid.getNormalizedBoneNode(name)
}

function set(
  node: Object3D | null,
  rotation: { x?: number; y?: number; z?: number },
) {
  if (!node) return
  if (rotation.x !== undefined) node.rotation.x = rotation.x
  if (rotation.y !== undefined) node.rotation.y = rotation.y
  if (rotation.z !== undefined) node.rotation.z = rotation.z
}

function setArm(
  vrm: VRM,
  side: 'left' | 'right',
  options: {
    upperZ: number
    upperX?: number
    upperY?: number
    lowerX?: number
    lowerY?: number
  },
) {
  const upper =
    side === 'left'
      ? bone(vrm, VRMHumanBoneName.LeftUpperArm)
      : bone(vrm, VRMHumanBoneName.RightUpperArm)
  const lower =
    side === 'left'
      ? bone(vrm, VRMHumanBoneName.LeftLowerArm)
      : bone(vrm, VRMHumanBoneName.RightLowerArm)
  const hand =
    side === 'left'
      ? bone(vrm, VRMHumanBoneName.LeftHand)
      : bone(vrm, VRMHumanBoneName.RightHand)

  const sideSign = side === 'left' ? 1 : -1
  set(upper, {
    x: options.upperX ?? 0,
    y: (options.upperY ?? 0) * sideSign,
    z: options.upperZ,
  })
  set(lower, {
    x: options.lowerX ?? elbowRest,
    y: (options.lowerY ?? 0) * sideSign,
    z: 0,
  })
  set(hand, { x: 0, y: 0, z: 0 })
}

function resetShoulders(vrm: VRM) {
  set(bone(vrm, VRMHumanBoneName.LeftShoulder), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightShoulder), { x: 0, y: 0, z: 0 })
}

function resetHands(vrm: VRM) {
  set(bone(vrm, VRMHumanBoneName.LeftHand), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightHand), { x: 0, y: 0, z: 0 })
}

function resetTorso(vrm: VRM) {
  set(bone(vrm, VRMHumanBoneName.Hips), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.Spine), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.Chest), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.Head), { x: 0, y: 0, z: 0 })
}

function resetLegs(vrm: VRM) {
  set(bone(vrm, VRMHumanBoneName.LeftUpperLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightUpperLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.LeftLowerLeg), { x: kneeBaseBend, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightLowerLeg), { x: kneeBaseBend, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.LeftFoot), { x: 0.04, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightFoot), { x: 0.04, y: 0, z: 0 })
}

function applyStudioAttentionPose(vrm: VRM) {
  resetTorso(vrm)
  resetShoulders(vrm)
  setArm(vrm, 'left', { upperZ: attentionArmZ.left, lowerX: 0.03 })
  setArm(vrm, 'right', { upperZ: attentionArmZ.right, lowerX: 0.03 })
  set(bone(vrm, VRMHumanBoneName.LeftUpperLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightUpperLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.LeftLowerLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightLowerLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.LeftFoot), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightFoot), { x: 0, y: 0, z: 0 })
}

/** 右手を顔横へ上げる。 */
function applyStudioWavePose(vrm: VRM) {
  resetTorso(vrm)
  resetShoulders(vrm)
  resetHands(vrm)
  resetLegs(vrm)
  setArm(vrm, 'left', { upperZ: attentionArmZ.left, lowerX: elbowRest })
  setArm(vrm, 'right', {
    upperX: waveArm.upperX,
    upperY: waveArm.upperY,
    upperZ: waveArm.upperZ,
    lowerX: waveArm.elbowX,
    lowerY: waveArm.lowerY,
  })
  set(bone(vrm, VRMHumanBoneName.Head), { x: 0.08, y: 0.16, z: -0.04 })
  set(bone(vrm, VRMHumanBoneName.Chest), { x: 0.02, y: 0.04, z: 0 })
}

/** 両手を斜め上へ。 */
function applyStudioCheerPose(vrm: VRM) {
  resetTorso(vrm)
  resetShoulders(vrm)
  resetHands(vrm)
  resetLegs(vrm)
  setArm(vrm, 'left', {
    upperX: cheerArm.upperX,
    upperZ: cheerArm.upperZ,
    lowerX: cheerArm.elbowX,
  })
  setArm(vrm, 'right', {
    upperX: cheerArm.upperX,
    upperZ: -cheerArm.upperZ,
    lowerX: cheerArm.elbowX,
  })
  set(bone(vrm, VRMHumanBoneName.Head), { x: -0.06, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.Chest), { x: -0.04, y: 0, z: 0 })
}

/** Photo Booth 用ポーズ。 */
export function applyStudioPose(vrm: VRM | null, poseId: PhotoStudioPoseId) {
  if (!vrm) return

  if (poseId === 'sit') {
    applyVRMSitPose(vrm)
    return
  }
  if (poseId === 'wave') {
    applyStudioWavePose(vrm)
    return
  }
  if (poseId === 'cheer') {
    applyStudioCheerPose(vrm)
    return
  }
  if (poseId === 'shoot') {
    // 射的場と同じ構え（照準・反動なしの正面構え）
    applyVRMShootingPose(vrm, { aimPitch: 0, recoil: 0 })
    return
  }

  applyStudioAttentionPose(vrm)
}
