import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import { Object3D } from 'three'
import { applyVRMSitPose } from '../avatar/VRMLocomotion'
import type { PhotoStudioPoseId } from './config'

/**
 * Meebit VRM（normalized）腕 — Photo Booth。
 * 直立 / 手振り / 座り。追加ポーズは後ほど。
 *
 * attention z: 左 +1.56 / 右 −1.56
 */
const attentionArmZ = { left: 1.56, right: -1.56 } as const
/** 手を振る（右上腕 z） */
const waveArmZ = { right: +0.99 } as const
/** 手振りの肘 — LowerArm.x のみ */
const waveElbowX = 1
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

function applyStudioAttentionPose(vrm: VRM) {
  resetTorso(vrm)
  resetShoulders(vrm)
  setArmLift(vrm, 'left', attentionArmZ.left, 0.03)
  setArmLift(vrm, 'right', attentionArmZ.right, 0.03)
  set(bone(vrm, VRMHumanBoneName.LeftUpperLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightUpperLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.LeftLowerLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightLowerLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.LeftFoot), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightFoot), { x: 0, y: 0, z: 0 })
}

function applyStudioWavePose(vrm: VRM) {
  resetTorso(vrm)
  resetShoulders(vrm)
  resetHands(vrm)
  resetLegs(vrm)
  setArmLift(vrm, 'left', attentionArmZ.left, elbowRest)
  setArmLift(vrm, 'right', waveArmZ.right, waveElbowX)
  set(bone(vrm, VRMHumanBoneName.Head), { x: 0, y: -0.08, z: 0 })
}

/** Photo Booth 用ポーズ（直立 / 手振り / 座り）。 */
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

  applyStudioAttentionPose(vrm)
}
