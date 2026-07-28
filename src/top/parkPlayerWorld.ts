/** パーク内プレイヤー座標（毎フレーム更新。zustand 経由にしない） */
export const parkPlayerWorld = {
  x: 0,
  z: 8,
  rotationY: Math.PI,
  isMoving: false,
  ready: false,
}

export function resetParkPlayerWorld(x: number, z: number, rotationY: number) {
  parkPlayerWorld.x = x
  parkPlayerWorld.z = z
  parkPlayerWorld.rotationY = rotationY
  parkPlayerWorld.isMoving = false
  parkPlayerWorld.ready = true
}

export function setParkPlayerWorld(
  x: number,
  z: number,
  rotationY: number,
  isMoving: boolean,
) {
  parkPlayerWorld.x = x
  parkPlayerWorld.z = z
  parkPlayerWorld.rotationY = rotationY
  parkPlayerWorld.isMoving = isMoving
  parkPlayerWorld.ready = true
}
