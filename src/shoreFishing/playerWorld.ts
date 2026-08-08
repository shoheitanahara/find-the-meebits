import { SHORE_FISHING } from './config'

export const shorePlayerWorld = {
  x: SHORE_FISHING.playerStart.x,
  z: SHORE_FISHING.playerStart.z,
  rotationY: SHORE_FISHING.playerStart.rotationY,
  isMoving: false,
  ready: false,
  /** 竿の穂先ワールド座標（ライン用） */
  tipX: 0,
  tipY: 1.8,
  tipZ: 0,
}

export function resetShorePlayerWorld() {
  shorePlayerWorld.x = SHORE_FISHING.playerStart.x
  shorePlayerWorld.z = SHORE_FISHING.playerStart.z
  shorePlayerWorld.rotationY = SHORE_FISHING.playerStart.rotationY
  shorePlayerWorld.isMoving = false
  shorePlayerWorld.ready = true
  shorePlayerWorld.tipX = SHORE_FISHING.playerStart.x
  shorePlayerWorld.tipY = 1.8
  shorePlayerWorld.tipZ = SHORE_FISHING.playerStart.z
}

export function setShorePlayerWorld(
  x: number,
  z: number,
  rotationY: number,
  isMoving: boolean,
) {
  shorePlayerWorld.x = x
  shorePlayerWorld.z = z
  shorePlayerWorld.rotationY = rotationY
  shorePlayerWorld.isMoving = isMoving
  shorePlayerWorld.ready = true
}

export function setShoreRodTip(x: number, y: number, z: number) {
  shorePlayerWorld.tipX = x
  shorePlayerWorld.tipY = y
  shorePlayerWorld.tipZ = z
}
