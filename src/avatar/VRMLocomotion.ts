import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import { MathUtils, Object3D } from 'three'

type LocomotionOptions = {
  elapsedTime: number
  isMoving: boolean
  isRunning?: boolean
  idleOffset?: number
}

const armRestZ = {
  left: 1.35,
  right: -1.35,
}

const attentionArmZ = {
  left: 1.56,
  right: -1.56,
}

const elbowBaseBend = 0.08
const kneeBaseBend = -0.16

/** プレビュー用の立正ポーズ（両腕を体の横に下ろす） */
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
  setRotationImmediate(leftUpperArm, { x: 0, y: 0, z: attentionArmZ.left })
  setRotationImmediate(rightUpperArm, { x: 0, y: 0, z: attentionArmZ.right })
  setRotationImmediate(leftLowerArm, { x: 0.03, y: 0, z: 0 })
  setRotationImmediate(rightLowerArm, { x: 0.03, y: 0, z: 0 })
  setRotationImmediate(leftUpperLeg, { x: 0, y: 0, z: 0 })
  setRotationImmediate(rightUpperLeg, { x: 0, y: 0, z: 0 })
  setRotationImmediate(leftLowerLeg, { x: kneeBaseBend, y: 0, z: 0 })
  setRotationImmediate(rightLowerLeg, { x: kneeBaseBend, y: 0, z: 0 })
  setRotationImmediate(leftFoot, { x: 0.04, y: 0, z: 0 })
  setRotationImmediate(rightFoot, { x: 0.04, y: 0, z: 0 })
}

export function applyVRMLocomotion(vrm: VRM | null, options: LocomotionOptions) {
  if (!vrm) {
    return
  }

  const speed = options.isRunning ? 12 : 7
  const stride = Math.sin(options.elapsedTime * speed)
  const counterStride = Math.sin(options.elapsedTime * speed + Math.PI)
  const idle = Math.sin(options.elapsedTime * 1.8 + (options.idleOffset ?? 0))
  const movementWeight = options.isMoving ? 1 : 0
  const idleWeight = 1 - movementWeight

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
