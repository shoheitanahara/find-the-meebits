import type { VRM } from '@pixiv/three-vrm'
import { Vector3 } from 'three'
import { getStudioCamera } from '../capture/studioGlBridge'
import { CUSTOM_POSE_JOINTS, type CustomPoseJointId } from './customPoseModel'

/**
 * Canvas 内（StudioPlayer / マーカー）と Canvas 外（ドラッグ層のタップ）をつなぐ。
 * 関節マーカーのワールド位置を毎フレーム記録し、タップ座標から最寄りの関節を返す。
 */

let studioVrm: VRM | null = null
const markerWorld = new Map<CustomPoseJointId, Vector3>(
  CUSTOM_POSE_JOINTS.map((joint) => [joint.id, new Vector3()]),
)
let markersReady = false

export function setCustomPoseVrm(vrm: VRM | null) {
  studioVrm = vrm
  if (!vrm) markersReady = false
}

export function getCustomPoseVrm() {
  return studioVrm
}

/** 関節マーカーのワールド位置を更新（マーカー描画と共用） */
export function updateCustomPoseMarkerPositions(): boolean {
  const vrm = studioVrm
  if (!vrm) {
    markersReady = false
    return false
  }
  for (const joint of CUSTOM_POSE_JOINTS) {
    // 見た目の位置は raw bone（normalized は vrm.update で raw へ反映される）
    const raw = vrm.humanoid.getRawBoneNode(joint.markerBone)
    const target = markerWorld.get(joint.id)
    if (!raw || !target) continue
    raw.getWorldPosition(target)
  }
  markersReady = true
  return true
}

export function getCustomPoseMarkerWorld(id: CustomPoseJointId) {
  return markerWorld.get(id) ?? null
}

const _projected = new Vector3()

/** 画面上のタップ位置（client 座標）から最寄りの関節。遠すぎれば null。 */
export function pickCustomPoseJoint(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  maxDistancePx: number,
): CustomPoseJointId | null {
  const camera = getStudioCamera()
  if (!camera || !markersReady || rect.width < 1 || rect.height < 1) return null

  let best: CustomPoseJointId | null = null
  let bestDistance = maxDistancePx
  for (const [id, world] of markerWorld) {
    _projected.copy(world).project(camera)
    if (_projected.z > 1) continue
    const x = rect.left + ((_projected.x + 1) / 2) * rect.width
    const y = rect.top + ((1 - _projected.y) / 2) * rect.height
    const distance = Math.hypot(x - clientX, y - clientY)
    if (distance < bestDistance) {
      bestDistance = distance
      best = id
    }
  }
  return best
}
