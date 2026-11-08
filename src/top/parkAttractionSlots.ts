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

/**
 * 入口横の説明看板ローカル xz（標準 footprint: halfDepth≈3.5 / door≈1.15）。
 * 扉脇・正面すぐ前。左右は符号で選ぶ。
 */
export const DEFAULT_INFO_BOARD_LOCAL = {
  right: [3.15, 3.55] as [number, number],
  left: [-3.15, 3.55] as [number, number],
}

/** 建物の halfDepth に合わせて看板を正面すぐ前に置く */
export function infoBoardNearEntrance(
  side: 'left' | 'right',
  halfDepth: number,
): [number, number] {
  const x = side === 'right' ? DEFAULT_INFO_BOARD_LOCAL.right[0] : DEFAULT_INFO_BOARD_LOCAL.left[0]
  return [x, halfDepth + 0.05]
}

export function getDefaultAttractionSlot(id: ParkAttractionSlotId): ParkAttractionSlot {
  return DEFAULT_PARK_ATTRACTION_SLOTS[id]
}
