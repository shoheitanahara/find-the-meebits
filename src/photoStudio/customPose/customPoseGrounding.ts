import type { VRM } from '@pixiv/three-vrm'
import { Box3, SkinnedMesh } from 'three'
import type { Object3D } from 'three'

const _meshBox = new Box3()
const _bounds = new Box3()

/**
 * スキニング後メッシュのワールド最低点 Y。
 * 呼び出し前に normalized → raw を反映（vrm.update）しておくこと。
 */
function measurePosedMinY(vrm: VRM, liftGroup: Object3D): number | null {
  liftGroup.updateMatrixWorld(true)
  _bounds.makeEmpty()
  vrm.scene.traverse((obj) => {
    if (!(obj instanceof SkinnedMesh)) return
    // SkinnedMesh.computeBoundingBox はボーン変形後の頂点で計算し、
    // 結果は geometry ではなく mesh 自身の boundingBox に入る（three r151+）
    obj.computeBoundingBox()
    const box = obj.boundingBox
    if (!box) return
    _meshBox.copy(box).applyMatrix4(obj.matrixWorld)
    _bounds.union(_meshBox)
  })
  if (_bounds.isEmpty() || !Number.isFinite(_bounds.min.y)) return null
  return _bounds.min.y
}

/** Meebit ごとの直立時の最低点（接地の基準） */
const restMinByVrm = new WeakMap<VRM, number>()

/**
 * 現在のポーズで足（または膝・手）が床に触れる高さへ持ち上げる量を返す。
 * liftGroup の y は 0 に戻した状態で計測する。
 *
 * @param applyRestPose 直立ポーズを当てる（基準の初回計測用）
 * @param applyCurrentPose 編集中ポーズを当て直す
 */
export function computeGroundLift(
  vrm: VRM,
  liftGroup: Object3D,
  applyRestPose: () => void,
  applyCurrentPose: () => void,
): number {
  liftGroup.position.y = 0

  let restMin = restMinByVrm.get(vrm)
  if (restMin === undefined) {
    applyRestPose()
    vrm.update(0)
    const measured = measurePosedMinY(vrm, liftGroup)
    applyCurrentPose()
    vrm.update(0)
    if (measured === null) return 0
    restMin = measured
    restMinByVrm.set(vrm, restMin)
  }

  const currentMin = measurePosedMinY(vrm, liftGroup)
  if (currentMin === null) return 0
  return restMin - currentMin
}
