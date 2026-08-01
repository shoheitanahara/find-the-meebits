import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import { Object3D } from 'three'
import { applyVRMFigurePose, applyVRMSitPose } from '../avatar/VRMLocomotion'
import type { PhotoStudioPoseId } from './config'

const attentionArmZ = { left: 1.56, right: -1.56 }
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

/** スタジオ用立正 — 膝を曲げず直立 */
function applyStudioAttentionPose(vrm: VRM) {
  resetTorso(vrm)
  set(bone(vrm, VRMHumanBoneName.LeftUpperArm), { x: 0, y: 0, z: attentionArmZ.left })
  set(bone(vrm, VRMHumanBoneName.RightUpperArm), { x: 0, y: 0, z: attentionArmZ.right })
  set(bone(vrm, VRMHumanBoneName.LeftLowerArm), { x: 0.03, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightLowerArm), { x: 0.03, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.LeftUpperLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightUpperLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.LeftLowerLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightLowerLeg), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.LeftFoot), { x: 0, y: 0, z: 0 })
  set(bone(vrm, VRMHumanBoneName.RightFoot), { x: 0, y: 0, z: 0 })
}

/** Photo Studio 用ポーズ一式。 */
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
  resetLegs(vrm)

  const leftUpperArm = bone(vrm, VRMHumanBoneName.LeftUpperArm)
  const rightUpperArm = bone(vrm, VRMHumanBoneName.RightUpperArm)
  const leftLowerArm = bone(vrm, VRMHumanBoneName.LeftLowerArm)
  const rightLowerArm = bone(vrm, VRMHumanBoneName.RightLowerArm)

  switch (poseId) {
    case 'contrapposto':
      set(bone(vrm, VRMHumanBoneName.Hips), { x: 0, y: 0, z: 0.08 })
      set(bone(vrm, VRMHumanBoneName.Spine), { x: 0.04, y: 0, z: -0.06 })
      set(bone(vrm, VRMHumanBoneName.Chest), { x: 0, y: 0.05, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Head), { x: 0, y: -0.08, z: 0 })
      set(leftUpperArm, { x: 0.12, y: 0, z: attentionArmZ.left })
      set(rightUpperArm, { x: 0.05, y: 0, z: attentionArmZ.right - 0.08 })
      set(leftLowerArm, { x: 0.12, y: 0, z: 0 })
      set(rightLowerArm, { x: 0.08, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.LeftUpperLeg), { x: 0.08, y: 0, z: 0.04 })
      set(bone(vrm, VRMHumanBoneName.RightUpperLeg), { x: -0.05, y: 0, z: -0.02 })
      break
    case 'handOnHip':
      set(leftUpperArm, { x: 0.15, y: 0.35, z: 1.15 })
      set(leftLowerArm, { x: 1.1, y: 0, z: 0.15 })
      set(rightUpperArm, { x: 0.08, y: 0, z: attentionArmZ.right })
      set(rightLowerArm, { x: 0.06, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Hips), { x: 0, y: 0, z: -0.06 })
      set(bone(vrm, VRMHumanBoneName.Head), { x: 0, y: 0.1, z: 0 })
      break
    case 'crossArms':
      set(leftUpperArm, { x: 0.55, y: 0.55, z: 0.85 })
      set(leftLowerArm, { x: 1.35, y: 0.2, z: 0.1 })
      set(rightUpperArm, { x: 0.55, y: -0.55, z: -0.85 })
      set(rightLowerArm, { x: 1.35, y: -0.2, z: -0.1 })
      set(bone(vrm, VRMHumanBoneName.Chest), { x: 0.05, y: 0, z: 0 })
      break
    case 'wave':
      set(leftUpperArm, { x: 0.1, y: 0, z: attentionArmZ.left })
      set(leftLowerArm, { x: 0.08, y: 0, z: 0 })
      set(rightUpperArm, { x: -0.35, y: -0.2, z: -0.35 })
      set(rightLowerArm, { x: 0.15, y: 0, z: -0.2 })
      set(bone(vrm, VRMHumanBoneName.Head), { x: 0, y: -0.12, z: 0 })
      break
    case 'think':
      set(leftUpperArm, { x: 0.1, y: 0, z: attentionArmZ.left })
      set(leftLowerArm, { x: 0.08, y: 0, z: 0 })
      set(rightUpperArm, { x: 0.85, y: -0.65, z: -0.55 })
      set(rightLowerArm, { x: 1.55, y: -0.15, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Head), { x: 0.12, y: 0.15, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Chest), { x: 0.06, y: 0, z: 0 })
      break
    case 'cheer':
      set(leftUpperArm, { x: -0.55, y: 0.25, z: 0.55 })
      set(leftLowerArm, { x: 0.2, y: 0, z: 0.15 })
      set(rightUpperArm, { x: -0.55, y: -0.25, z: -0.55 })
      set(rightLowerArm, { x: 0.2, y: 0, z: -0.15 })
      set(bone(vrm, VRMHumanBoneName.Head), { x: -0.08, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Chest), { x: -0.06, y: 0, z: 0 })
      break
    case 'power':
      set(leftUpperArm, { x: 0.95, y: 0.35, z: 0.95 })
      set(leftLowerArm, { x: 1.45, y: 0, z: 0 })
      set(rightUpperArm, { x: 0.95, y: -0.35, z: -0.95 })
      set(rightLowerArm, { x: 1.45, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Hips), { x: 0.04, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Chest), { x: 0.08, y: 0, z: 0 })
      set(bone(vrm, VRMHumanBoneName.Head), { x: -0.05, y: 0, z: 0 })
      break
    default:
      applyStudioAttentionPose(vrm)
  }
}
