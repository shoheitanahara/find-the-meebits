import type { VRM } from '@pixiv/three-vrm'
import { VRMUtils } from '@pixiv/three-vrm'
import { Group, Mesh, MeshStandardMaterial } from 'three'
import type { Object3D } from 'three'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { applyVRMAttentionPose } from '../avatar/VRMLocomotion'
import { getMeebitVrmUrl, loadVRM } from '../avatar/VRMLoader'
import { enqueueVrmLoad } from '../avatar/vrmLoadQueue'
import {
  CLUB_SCULPTURE_VRM_LOAD_PRIORITY,
  MUSEUM_SCULPTURE_VRM_LOAD_PRIORITY,
} from '../game/perfConfig'
import type { VenueId } from '../game/venueConfig'
import { getClubVrmSculptureMeebitIds } from './clubLandmarks'
import { getVrmSculptureMeebitIds } from './worldLandmarks'

const SCULPTURE_GRAY_MATERIAL = new MeshStandardMaterial({
  color: '#a8a29e',
  roughness: 0.52,
  metalness: 0.12,
})

/** ポーズ・マテリアル適用済みのマスターシーン（NPC プールとは別管理） */
const masterScenes = new Map<number, Group>()
const inflight = new Map<number, Promise<Group>>()
/** 同一 ID を複数配置するときだけ clone を使う */
const masterRefCounts = new Map<number, number>()

function applyGraySculptureMaterials(root: Object3D) {
  root.traverse((object) => {
    if (object instanceof Mesh) {
      object.material = SCULPTURE_GRAY_MATERIAL
    }
  })
}

function freezeVrmAsSculpture(vrm: VRM): Group {
  applyVRMAttentionPose(vrm)
  vrm.update(0)
  applyGraySculptureMaterials(vrm.scene)
  return vrm.scene as Group
}

async function ensureMasterScene(
  meebitId: number,
  priority = MUSEUM_SCULPTURE_VRM_LOAD_PRIORITY,
): Promise<Group> {
  const cached = masterScenes.get(meebitId)
  if (cached) {
    return cached
  }

  let pending = inflight.get(meebitId)
  if (!pending) {
    pending = enqueueVrmLoad(() => loadVRM(getMeebitVrmUrl(meebitId)), priority).then((vrm) => {
      inflight.delete(meebitId)
      const master = freezeVrmAsSculpture(vrm)
      masterScenes.set(meebitId, master)
      return master
    })
    inflight.set(meebitId, pending)
  }

  return pending
}

/** ワールド常設彫刻用。同一 meebitId はマスターを共有し、複数台あるときだけ clone。 */
export async function acquireVrmSculptureScene(meebitId: number): Promise<Group> {
  const master = await ensureMasterScene(meebitId)
  const refs = masterRefCounts.get(meebitId) ?? 0

  if (refs === 0) {
    masterRefCounts.set(meebitId, 1)
    return master
  }

  masterRefCounts.set(meebitId, refs + 1)
  return cloneSkeleton(master) as Group
}

export function releaseVrmSculptureScene(meebitId: number, scene: Group) {
  const master = masterScenes.get(meebitId)
  const refs = (masterRefCounts.get(meebitId) ?? 1) - 1

  if (refs <= 0) {
    masterRefCounts.delete(meebitId)
  } else {
    masterRefCounts.set(meebitId, refs)
  }

  if (master && scene !== master) {
    VRMUtils.deepDispose(scene)
  }
}

export function preloadVrmSculpturesForVenue(venueId: VenueId = 'museum') {
  const meebitIds =
    venueId === 'club' ? getClubVrmSculptureMeebitIds() : getVrmSculptureMeebitIds()
  const priority =
    venueId === 'club' ? CLUB_SCULPTURE_VRM_LOAD_PRIORITY : MUSEUM_SCULPTURE_VRM_LOAD_PRIORITY

  for (const meebitId of meebitIds) {
    void ensureMasterScene(meebitId, priority)
  }
}

export function preloadVrmSculptures() {
  preloadVrmSculpturesForVenue('museum')
}
