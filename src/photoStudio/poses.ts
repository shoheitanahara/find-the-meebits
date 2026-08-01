import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import { Object3D } from 'three'
import { applyVRMFigurePose, applyVRMSitPose } from '../avatar/VRMLocomotion'
import type { PhotoStudioPoseId } from './config'

/**
 * Meebit VRM（normalized）腕 — PFP Studio 落とし所。
 *
 * コツ: 手をひねらない。上げは z のみ（attention と同符号）。肘曲げ近似の
 * 「腰に手／腕組み／パワー」は見た目が崩れるためポーズ自体を差し替えている。
 *
 * attention z: 左 +1.56 / 右 −1.56
 */
const attentionArmZ = { left: 1.56, right: -1.56 } as const
/** 手を振る */
const waveArmZ = { right: -0.28 } as const
/** 両手開き（やや上げ） */
const openArmZ = { left: 1.05, right: -1.05 } as const
/** 万歳（高く・同符号のまま |z|→0 寄り） */
const cheerArmZ = { left: 0.12, right: -0.12 } as const
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

function setArmLift(
  vrm: VRM,
  side: 'left' | 'right',
  upperZ: number,
  lowerX = elbowRest,
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

  set(upper, { x: 0, y: 0, z: upperZ })
  set(lower, { x: lowerX, y: 0, z: 0 })
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

function armsDown(vrm: VRM, lowerX = elbowRest) {
  setArmLift(vrm, 'left', attentionArmZ.left, lowerX)
  setArmLift(vrm, 'right', attentionArmZ.right, lowerX)
}

function applyStudioAttentionPose(vrm: VRM) {
  resetTorso(vrm)
  resetShoulders(vrm)
  armsDown(vrm, 0.03)
  set(bone(vrm, VRMHumanBoneName.LeftUpperLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightUpperLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.LeftLowerLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightLowerLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.LeftFoot), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightFoot), { x: 0, y: 0, z: 0 })
}

/** Photo Studio 用ポーズ。腕は z 上げ中心（捻り・肘近似の難ポーズは採用しない）。 */
export function applyStudioPose(vrm: VRM | null, poseId: PhotoStudioPoseId) {
  if (!vrm) return

  if (poseId === 'attention') {
    applyStudioAttentionPose(vrm)
    return
  }
  if (poseId === 'casual') {
    applyVRMFigurePose(vrm)
    return
  }
  if (poseId === 'sit') {
    applyVRMSitPose(vrm)
    return
  }

  resetTorso(vrm)
  resetShoulders(vrm)
  resetHands(vrm)
  resetLegs(vrm)

  const L = attentionArmZ.left
  const R = attentionArmZ.right

  switch (poseId) {
    case 'contrapposto':
      set(bone(vrm, VRMHumanBoneName.Hips), { x: 0, y: 0, z: 0.08 })
      set(bone(vrm, VRMHumanBoneName.Spine), { x: 0.04, y: 0, z: -0.06 })
      set(bone(vrm, VRMHumanBoneName.Chest), { x: 0, y: 0.05, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Head), { x: 0, y: -0.08, z: 0 })
      setArmLift(vrm, 'left', L, 0.05)
      setArmLift(vrm, 'right', -1.42, 0.05)
      set(bone(vrm, VRMHumanBoneName.LeftUpperLeg), { x: 0.08, y: 0, z: 0.04 })
      set(bone(vrm, VRMHumanBoneName.RightUpperLeg), { x: -0.05, y: 0, z: -0.02 })
      break

    case 'bow':
      // お辞儀: 体を前に倒す。腕はそのまま下ろし
      set(bone(vrm, VRMHumanBoneName.Hips), { x: 0.18, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Spine), { x: 0.28, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Chest), { x: 0.22, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Head), { x: 0.2, y: 0, z: 0 })
      armsDown(vrm, 0.05)
      break

    case 'open':
      // 両手を少し開いて歓迎ポーズ（z のみ）
      setArmLift(vrm, 'left', openArmZ.left, 0.05)
      setArmLift(vrm, 'right', openArmZ.right, 0.05)
      set(bone(vrm, VRMHumanBoneName.Chest), { x: -0.02, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Head), { x: -0.02, y: 0, z: 0 })
      break

    case 'wave':
      setArmLift(vrm, 'left', L, elbowRest)
      setArmLift(vrm, 'right', waveArmZ.right, 0.08)
      set(bone(vrm, VRMHumanBoneName.Head), { x: 0, y: -0.08, z: 0 })
      break

    case 'lookAway':
      // 振り向き: 頭・胸を回す。腕は下ろし
      armsDown(vrm, 0.05)
      set(bone(vrm, VRMHumanBoneName.Hips), { x: 0, y: 0.06, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Spine), { x: 0, y: 0.18, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Chest), { x: 0, y: 0.28, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Head), { x: 0.04, y: 0.55, z: 0 })
      break

    case 'cheer':
      setArmLift(vrm, 'left', cheerArmZ.left, 0.05)
      setArmLift(vrm, 'right', cheerArmZ.right, 0.05)
      set(bone(vrm, VRMHumanBoneName.Head), { x: -0.04, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Chest), { x: -0.03, y: 0, z: 0 })
      break

    case 'hero':
      // ヒーロー立ち: 足を開き、胸を張り、腕は自然に下ろす
      armsDown(vrm, 0.05)
      set(bone(vrm, VRMHumanBoneName.Hips), { x: -0.02, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Spine), { x: -0.04, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Chest), { x: -0.06, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Head), { x: -0.05, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.LeftUpperLeg), { x: 0, y: 0, z: 0.14 })
      set(bone(vrm, VRMHumanBoneName.RightUpperLeg), { x: 0, y: 0, z: -0.14 })
      set(bone(vrm, VRMHumanBoneName.LeftLowerLeg), { x: kneeBaseBend, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.RightLowerLeg), { x: kneeBaseBend, y: 0, z: 0 })
      break

    default:
      applyStudioAttentionPose(vrm)
  }
}
