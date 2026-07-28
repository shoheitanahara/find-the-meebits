import { create } from 'zustand'
import { resetParkPlayerWorld } from './parkPlayerWorld'
import {
  DEFAULT_PARK_ZONE,
  getParkZone,
  readStoredParkZone,
  writeStoredParkZone,
  type ParkZoneId,
} from './parkZones'

export type AttractionId =
  | 'find'
  | 'traits'
  | 'street'
  | 'mountain'
  | 'neon'
  | 'runway'
  | 'closet'
  | 'sergito'

type TopState = {
  started: boolean
  meebitNumber: number
  nearestAttraction: AttractionId | null
  nearestGateId: string | null
  activeZoneId: ParkZoneId
  /** ゾーン切替中の短いフェード用 */
  zoneTransitioning: boolean
  start: (
    meebitNumber: number,
    spawn?: { x?: number; z?: number; rotationY?: number; zoneId?: ParkZoneId },
  ) => void
  setMeebitNumber: (meebitNumber: number) => void
  setNearestAttraction: (attraction: AttractionId | null) => void
  setNearestGateId: (gateId: string | null) => void
  setActiveZone: (zoneId: ParkZoneId, spawn?: { x: number; z: number; rotationY: number }) => void
  setZoneTransitioning: (zoneTransitioning: boolean) => void
}

export const useTopStore = create<TopState>((set) => ({
  started: false,
  meebitNumber: 4274,
  nearestAttraction: null,
  nearestGateId: null,
  activeZoneId: readStoredParkZone(),
  zoneTransitioning: false,
  start: (meebitNumber, spawn) => {
    const zoneId = spawn?.zoneId ?? DEFAULT_PARK_ZONE
    const zone = getParkZone(zoneId)
    writeStoredParkZone(zoneId)
    resetParkPlayerWorld(
      spawn?.x ?? zone.spawn.x,
      spawn?.z ?? zone.spawn.z,
      spawn?.rotationY ?? zone.spawn.rotationY,
    )
    set({
      started: true,
      meebitNumber,
      activeZoneId: zoneId,
      nearestAttraction: null,
      nearestGateId: null,
      zoneTransitioning: false,
    })
  },
  setMeebitNumber: (meebitNumber) => set({ meebitNumber }),
  setNearestAttraction: (nearestAttraction) => set({ nearestAttraction }),
  setNearestGateId: (nearestGateId) => set({ nearestGateId }),
  setActiveZone: (zoneId, spawn) => {
    const zone = getParkZone(zoneId)
    writeStoredParkZone(zoneId)
    resetParkPlayerWorld(
      spawn?.x ?? zone.spawn.x,
      spawn?.z ?? zone.spawn.z,
      spawn?.rotationY ?? zone.spawn.rotationY,
    )
    set({
      activeZoneId: zoneId,
      nearestAttraction: null,
      nearestGateId: null,
    })
  },
  setZoneTransitioning: (zoneTransitioning) => set({ zoneTransitioning }),
}))
