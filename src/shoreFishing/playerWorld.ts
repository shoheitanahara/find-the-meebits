import { SHORE_FISHING } from './config'

type ShorePlayerWorld = {
  x: number
  z: number
  rotationY: number
  isMoving: boolean
  ready: boolean
  tipX: number
  tipY: number
  tipZ: number
  /** 浮きが出ているときカメラ用 */
  bobberActive: boolean
  bobberX: number
  bobberY: number
  bobberZ: number
}

export const shorePlayerWorld: ShorePlayerWorld = {
  x: SHORE_FISHING.playerStart.x,
  z: SHORE_FISHING.playerStart.z,
  rotationY: SHORE_FISHING.playerStart.rotationY,
  isMoving: false,
  ready: false,
  tipX: 0,
  tipY: 1.8,
  tipZ: 0,
  bobberActive: false,
  bobberX: 0,
  bobberY: 0,
  bobberZ: 0,
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
  shorePlayerWorld.bobberActive = false
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

export function setShoreBobberWorld(x: number, y: number, z: number) {
  shorePlayerWorld.bobberActive = true
  shorePlayerWorld.bobberX = x
  shorePlayerWorld.bobberY = y
  shorePlayerWorld.bobberZ = z
}

export function clearShoreBobberWorld() {
  shorePlayerWorld.bobberActive = false
}
