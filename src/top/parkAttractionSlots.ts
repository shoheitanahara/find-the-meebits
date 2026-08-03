/**
 * パーク各エリアの建物スロット（Mountain で完成した配置を正本とする）。
 * 新区はこの座標をデフォルトに使い、必要時だけ個別にずらす。
 */
export type ParkAttractionSlotId = 'center' | 'west' | 'east'

export type ParkAttractionSlot = {
  id: ParkAttractionSlotId
  x: number
  z: number
  /** 入口トリガーのワールド Z（正面すぐ前） */
  entranceZ: number
}

/**
 * Mountain 現行配置:
 * - 中央 (0, -7)
 * - 西 (-15.7, -11.5) … footprint halfWidth≈3.2 の半棟左寄せ
 * - 東 (15.7, -11.0)
 */
export const DEFAULT_PARK_ATTRACTION_SLOTS = {
  center: {
    id: 'center',
    x: 0,
    z: -7.0,
    entranceZ: -3.2,
  },
  west: {
    id: 'west',
    x: -15.7,
    z: -11.5,
    entranceZ: -8.0,
  },
  east: {
    id: 'east',
    x: 15.7,
    z: -11.0,
    entranceZ: -8.0,
  },
} as const satisfies Record<ParkAttractionSlotId, ParkAttractionSlot>

export function getDefaultAttractionSlot(id: ParkAttractionSlotId): ParkAttractionSlot {
  return DEFAULT_PARK_ATTRACTION_SLOTS[id]
}
