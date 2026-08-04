import { VRM } from '@pixiv/three-vrm'
import { Box3, MathUtils, Mesh, Vector3, type Object3D } from 'three'

/**
 * 右手小道具の体型フィット（mesh 基準）。
 *
 * 細い mesh（#375 など）は bind 幅が狭い。基準幅との差 (deficit) に応じて
 * root local の **X / Y / Z をそのまま足す**（方向計算なし・調整しやすい）。
 *
 * | 定数 | 増やすと |
 * |------|----------|
 * | offsetXPerDeficit | 右へ |
 * | offsetYPerDeficit | 上へ |
 * | offsetZPerDeficit | 手前へ（root の +Z） |
 *
 * 実測 width: #11143 ≈ 1.45 / #375·#3278 ≈ 1.15 → deficit ≈ 0.21
 */

const _box = new Box3()
const _meshBox = new Box3()
const _size = new Vector3()

type FitValues = {
  scale: number
  deficit: number
  dx: number
  dy: number
  dz: number
}

const _fitCache = new WeakMap<VRM, FitValues>()

export const HAND_PROP_ARM_FIT = {
  /** #11143 付近の bind mesh 幅 */
  referenceMeshWidth: 1.45,
  /** オフセット倍率の下限（handOffset* に掛ける） */
  minScale: 0.72,
  /**
   * 幅不足 1.0 あたりの root local 補正。
   * #375 例: deficit≈0.21 → 実際の移動は値 × 0.21
   */
  offsetXPerDeficit: 0.5,
  offsetYPerDeficit: -0.12,
  offsetZPerDeficit: -0.7,
} as const

function getBindMeshWidth(root: Object3D): number {
  _box.makeEmpty()
  root.updateMatrixWorld(true)
  root.traverse((obj) => {
    if (!(obj instanceof Mesh) || !obj.geometry) return
    const geom = obj.geometry
    if (!geom.boundingBox) geom.computeBoundingBox()
    if (!geom.boundingBox) return
    _meshBox.copy(geom.boundingBox).applyMatrix4(obj.matrixWorld)
    _box.union(_meshBox)
  })
  if (_box.isEmpty()) return 0
  _box.getSize(_size)
  return _size.x
}

function getFit(vrm: VRM): FitValues {
  const cached = _fitCache.get(vrm)
  if (cached) return cached

  const width = getBindMeshWidth(vrm.scene)
  if (!(width > 0)) {
    const fallback = { scale: 1, deficit: 0, dx: 0, dy: 0, dz: 0 }
    _fitCache.set(vrm, fallback)
    return fallback
  }

  const raw = width / HAND_PROP_ARM_FIT.referenceMeshWidth
  const scale = MathUtils.clamp(Math.min(1, raw), HAND_PROP_ARM_FIT.minScale, 1)
  const deficit = 1 - scale
  const fit: FitValues = {
    scale,
    deficit,
    dx: deficit * HAND_PROP_ARM_FIT.offsetXPerDeficit,
    dy: deficit * HAND_PROP_ARM_FIT.offsetYPerDeficit,
    dz: deficit * HAND_PROP_ARM_FIT.offsetZPerDeficit,
  }
  _fitCache.set(vrm, fit)
  return fit
}

export function getHandPropArmFitScale(vrm: VRM | null): number {
  if (!vrm) return 1
  return getFit(vrm).scale
}

export function clearHandPropArmFitCache(vrm: VRM | null) {
  if (vrm) _fitCache.delete(vrm)
}

type ApplyHandPropFitOptions = {
  handLocal: Vector3
  target: Vector3
  handOffsetX?: number
  handOffsetY: number
  handOffsetZ: number
}

/**
 * 手位置 + 通常オフセット（scale）+ 細い体向け XYZ 補正。
 */
export function applyHandPropFit(
  vrm: VRM,
  _root: Object3D,
  options: ApplyHandPropFitOptions,
): number {
  const { scale, dx, dy, dz } = getFit(vrm)
  const { handLocal, target, handOffsetX = 0, handOffsetY, handOffsetZ } = options

  target.copy(handLocal)
  target.x += handOffsetX * scale + dx
  target.y += handOffsetY * scale + dy
  target.z += handOffsetZ * scale + dz

  return scale
}
