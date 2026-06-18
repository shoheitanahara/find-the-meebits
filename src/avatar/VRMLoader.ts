import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import { Box3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { Object3D } from 'three'
import { DEFAULT_PLAYER_MEEBIT_ID, VRM_FEET_Y_OFFSET, VRM_WORLD_SCALE } from '../game/gameConfig'

export const DEFAULT_MEEBIT_ID = DEFAULT_PLAYER_MEEBIT_ID

export function getMeebitVrmUrl(meebitId: number = DEFAULT_MEEBIT_ID) {
  // Vercel 本番では外部配信元の CORS で VRM 読み込みが失敗しやすいので、
  // 同一オリジンの API 経由でプロキシして読み込む。
  return `/api/vrm/${meebitId}`
}

export function loadVRM(url: string): Promise<VRM> {
  const loader = new GLTFLoader()
  loader.register((parser) => new VRMLoaderPlugin(parser))

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const vrm = gltf.userData.vrm as VRM | undefined

        if (!vrm) {
          reject(new Error('VRM data was not found in the loaded file.'))
          return
        }

        VRMUtils.removeUnnecessaryVertices(vrm.scene)
        VRMUtils.rotateVRM0(vrm)
        alignVrmFeetToGround(vrm.scene)
        enableShadows(vrm.scene)
        resolve(vrm)
      },
      undefined,
      (error) => {
        reject(error instanceof Error ? error : new Error('Could not load VRM model.'))
      },
    )
  })
}

function alignVrmFeetToGround(scene: Object3D) {
  const box = new Box3().setFromObject(scene)
  if (!Number.isFinite(box.min.y)) {
    return
  }

  // primitive の scale を考慮し、ワールド座標で足元が VRM_FEET_Y_OFFSET になるよう調整
  scene.position.y = -box.min.y + VRM_FEET_Y_OFFSET / VRM_WORLD_SCALE
}

function enableShadows(root: Object3D) {
  root.traverse((object) => {
    object.castShadow = true
    // 足を浮かせた状態で receiveShadow すると、足元に不自然な影が乗りやすい
    object.receiveShadow = false
  })
}
