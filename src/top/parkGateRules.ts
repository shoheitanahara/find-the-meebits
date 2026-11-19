/**
 * ゾーン間ゲートの共通ルール（通過判定・到着位置）。
 *
 * - 通過判定は門の開口幅（halfWidth）いっぱいに取る。
 *   橋の端（手すり際）を歩いても必ず移動できるようにするため。
 * - 到着位置は、到着先ゾーンにある「元のゾーンへ戻る門」から自動で決める。
 *   門ごとに手書きした座標だと距離がばらつき、戻り門の判定内に出てしまうことがあった。
 *
 * 型だけを parkZones から参照する（実行時の循環 import を作らない）。
 */
import type { ParkGateDef } from './parkZones'

/** 全ゾーン共通の床の中心 Z（parkZones の PARK_GROUND_Z と同じ値） */
const GROUND_Z = 1
/** 通過判定を門の奥行き（alcoveDepth）からさらに内外へ広げる量 */
export const GATE_TRIGGER_DEPTH_EXTRA = 0.5
/** 到着位置を、戻り門の判定の端からさらに内側へ離す距離（橋のある門: 橋を降りてすぐ） */
export const GATE_ARRIVAL_CLEARANCE = 1.2
/**
 * 手前（カメラ側 +Z）の門は橋がなく、近いと門のアーチと看板がカメラの前にかぶる。
 * この門だけは少し離して到着させる。
 */
export const FRONT_GATE_ARRIVAL_CLEARANCE = 3.0

export type GateSpawn = { x: number; z: number; rotationY: number }

/** 門のワールド上の外向き（ゾーンの外側）方向。東西の門は ±X、手前・奥の門は ±Z */
export function getGateOutward(gate: Pick<ParkGateDef, 'x' | 'z'>): { x: number; z: number } {
  const isSideGate = Math.abs(gate.x) > Math.abs(gate.z - GROUND_Z)
  return isSideGate ? { x: Math.sign(gate.x), z: 0 } : { x: 0, z: Math.sign(gate.z - GROUND_Z) }
}

/** (x, z) が門の通過判定の中か */
export function isInsideGateTrigger(gate: ParkGateDef, x: number, z: number) {
  const yaw = gate.yaw ?? 0
  const dx = x - gate.x
  const dz = z - gate.z
  // 門のローカル座標（X = 通り抜ける向き、Z = 開口の幅）
  const localX = dx * Math.cos(-yaw) - dz * Math.sin(-yaw)
  const localZ = dx * Math.sin(-yaw) + dz * Math.cos(-yaw)
  return (
    Math.abs(localZ) <= gate.halfWidth &&
    Math.abs(localX) <= gate.alcoveDepth + GATE_TRIGGER_DEPTH_EXTRA
  )
}

/**
 * この門の前（ゾーンの内側）に到着したときの位置と向き。
 * 通過判定の内側の端から GATE_ARRIVAL_CLEARANCE 離し、ゾーンの内側を向く。
 */
export function getGateArrivalPoint(gate: ParkGateDef): GateSpawn {
  const out = getGateOutward(gate)
  const inward = { x: -out.x, z: -out.z }
  const isFrontGate = out.z > 0
  const clearance = isFrontGate ? FRONT_GATE_ARRIVAL_CLEARANCE : GATE_ARRIVAL_CLEARANCE
  const distance = gate.alcoveDepth + GATE_TRIGGER_DEPTH_EXTRA + clearance
  return {
    x: gate.x + inward.x * distance,
    z: gate.z + inward.z * distance,
    // Three.js の向き: rotationY = atan2(前方X, 前方Z)
    rotationY: Math.atan2(inward.x, inward.z),
  }
}
