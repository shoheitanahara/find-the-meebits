import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { Object3D } from 'three'
import { DEFAULT_PLAYER_MEEBIT_ID } from '../game/gameConfig'

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

function enableShadows(root: Object3D) {
  root.traverse((object) => {
    object.castShadow = true
    object.receiveShadow = true
  })
}
