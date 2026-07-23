import { create } from 'zustand'
import {
  DEFAULT_PARK_ZONE,
  getParkZone,
  readStoredParkZone,
  writeStoredParkZone,
  type ParkZoneId,
} from './parkZones'

export type AttractionId = 'find' | 'traits' | 'street' | 'mountain'

type TopState = {
  started: boolean
  meebitNumber: number
  x: number
  z: number
  rotationY: number
  isMoving: boolean
  nearestAttraction: AttractionId | null
  nearestGateId: string | null
  activeZoneId: ParkZoneId
  /** ゾーン切替中の短いフェード用 */
  zoneTransitioning: boolean
  start: (
    meebitNumber: number,
    spawn?: { x: number; z: number; rotationY: number; zoneId?: ParkZoneId },
  ) => void
  setMeebitNumber: (meebitNumber: number) => void
  setMovement: (x: number, z: number, rotationY: number, isMoving: boolean) => void
  setNearestAttraction: (attraction: AttractionId | null) => void
  setNearestGateId: (gateId: string | null) => void
  setActiveZone: (zoneId: ParkZoneId, spawn?: { x: number; z: number; rotationY: number }) => void
  setZoneTransitioning: (zoneTransitioning: boolean) => void
}

export const useTopStore = create<TopState>((set) => ({
  started: false,
  meebitNumber: 4274,
  x: 0,
  z: 8,
  rotationY: Math.PI,
  isMoving: false,
  nearestAttraction: null,
  nearestGateId: null,
  activeZoneId: readStoredParkZone(),
  zoneTransitioning: false,
  start: (meebitNumber, spawn) => {
    const zoneId = spawn?.zoneId ?? DEFAULT_PARK_ZONE
    const zone = getParkZone(zoneId)
    writeStoredParkZone(zoneId)
    set({
      started: true,
      meebitNumber,
      activeZoneId: zoneId,
      x: spawn?.x ?? zone.spawn.x,
      z: spawn?.z ?? zone.spawn.z,
      rotationY: spawn?.rotationY ?? zone.spawn.rotationY,
      isMoving: false,
      nearestAttraction: null,
      nearestGateId: null,
      zoneTransitioning: false,
    })
  },
  setMeebitNumber: (meebitNumber) => set({ meebitNumber }),
  setMovement: (x, z, rotationY, isMoving) => set({ x, z, rotationY, isMoving }),
  setNearestAttraction: (nearestAttraction) => set({ nearestAttraction }),
  setNearestGateId: (nearestGateId) => set({ nearestGateId }),
  setActiveZone: (zoneId, spawn) => {
    const zone = getParkZone(zoneId)
    writeStoredParkZone(zoneId)
    set({
      activeZoneId: zoneId,
      x: spawn?.x ?? zone.spawn.x,
      z: spawn?.z ?? zone.spawn.z,
      rotationY: spawn?.rotationY ?? zone.spawn.rotationY,
      isMoving: false,
      nearestAttraction: null,
      nearestGateId: null,
    })
  },
  setZoneTransitioning: (zoneTransitioning) => set({ zoneTransitioning }),
}))
