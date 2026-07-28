import { getJstDateKey, hashStringToSeed } from '../../top/dailyFeatured'
import { SERGITO_MEEBIT_ID, WORKSHOP_DESK_TOP_Y } from '../config'

export type WorkshopFigureKind = 'shelf' | 'desk'

export type WorkshopFigurePlacement = {
  meebitId: number
  x: number
  y: number
  z: number
  rotationY: number
  scale: number
  kind: WorkshopFigureKind
}

export const WORKSHOP_FIGURE_SCALE = 0.285

/** 棚 96 + 机 3 */
export const WORKSHOP_FIGURE_COUNT = 99
/** 棚フィギュアのうち、同じ ID で部屋を歩く人数 */
export const WORKSHOP_WALKER_COUNT = 4

function buildZSlots(count: number, halfSpan: number): readonly number[] {
  if (count <= 1) {
    return [0]
  }
  const step = (halfSpan * 2) / (count - 1)
  return Array.from({ length: count }, (_, i) => -halfSpan + step * i)
}

export const WORKSHOP_SHELF = {
  leftCenterX: -10.35,
  rightCenterX: 10.35,
  boardTopY: [0.9, 1.8, 2.7] as const,
  /** 各段 16 体 × 3 段 × 2 面 = 96 体 */
  columnCount: 16,
  /** 棚端から内側に寄せてはみ出し防止 */
  zHalfSpan: 4.85,
  figureInset: 0.66,
  get zSlots() {
    return buildZSlots(this.columnCount, this.zHalfSpan)
  },
  get spanZ() {
    return this.zHalfSpan * 2 + 0.35
  },
} as const

const SHELF_COLUMNS = WORKSHOP_SHELF.columnCount

/** JST 日付キー（YYYY-MM-DD） */
export function getWorkshopFigureDateKey(now = new Date()) {
  return getJstDateKey(now)
}

/** 同日・全員同じ並びになる決定的 ID プール */
function buildDailyWorkshopMeebitIds(dateKey: string, count: number): readonly number[] {
  const seed = hashStringToSeed(`workshop-figures-v1-${dateKey}`)
  const used = new Set<number>()
  const ids: number[] = []

  for (let index = 0; ids.length < count; index += 1) {
    let id = (Math.imul(index + 1, 1103515245) + seed) >>> 0
    id = (id % 20000) + 1
    if (id === SERGITO_MEEBIT_ID) {
      id = ((id + 137) % 20000) + 1
    }
    if (used.has(id)) {
      continue
    }
    used.add(id)
    ids.push(id)
  }

  return ids
}

function getShelfMeebitIds(dateKey: string): readonly number[] {
  return buildDailyWorkshopMeebitIds(dateKey, WORKSHOP_FIGURE_COUNT)
}

/**
 * 棚に並んでいるフィギュアから 4 体（同じ ID）。
 * 棚にも残し、フルサイズで部屋を歩かせる。
 */
export function getWorkshopWalkerMeebitIds(now = new Date()): readonly number[] {
  const dateKey = getWorkshopFigureDateKey(now)
  const shelfIds = getShelfMeebitIds(dateKey)
  const seed = hashStringToSeed(`workshop-walkers-v1-${dateKey}`)
  const walkers: number[] = []
  const usedIndex = new Set<number>()

  for (let i = 0; walkers.length < WORKSHOP_WALKER_COUNT && i < shelfIds.length * 2; i += 1) {
    const index = (Math.imul(i + 1, 1664525) + seed) >>> 0
    const slot = index % shelfIds.length
    if (usedIndex.has(slot)) continue
    usedIndex.add(slot)
    walkers.push(shelfIds[slot]!)
  }

  return walkers
}

function shelfFig(
  meebitId: number,
  side: 'left' | 'right',
  level: number,
  zSlot: number,
): WorkshopFigurePlacement {
  const { leftCenterX, rightCenterX, boardTopY, figureInset } = WORKSHOP_SHELF
  const isLeft = side === 'left'
  return {
    meebitId,
    x: isLeft ? leftCenterX + figureInset : rightCenterX - figureInset,
    y: boardTopY[level],
    z: zSlot,
    rotationY: isLeft ? Math.PI / 2 : -Math.PI / 2,
    scale: WORKSHOP_FIGURE_SCALE,
    kind: 'shelf',
  }
}

function deskFig(meebitId: number, localX: number, localZ: number): WorkshopFigurePlacement {
  const desk = { x: -1.2, z: -8.2 }
  return {
    meebitId,
    x: desk.x + localX,
    y: WORKSHOP_DESK_TOP_Y,
    z: desk.z + localZ,
    rotationY: 0,
    scale: WORKSHOP_FIGURE_SCALE,
    kind: 'desk',
  }
}

function shelfLevel(
  ids: readonly number[],
  idOffset: number,
  side: 'left' | 'right',
  level: number,
) {
  return WORKSHOP_SHELF.zSlots.map((z, col) => shelfFig(ids[idOffset + col]!, side, level, z))
}

/** 棚 3 段 × 16 列 × 2 面 = 96 体 + 机 3 体（歩行者と同じ ID も棚に残す） */
export function buildWorkshopFigurePlacements(dateKey: string): WorkshopFigurePlacement[] {
  const ids = getShelfMeebitIds(dateKey)
  const deskOffset = SHELF_COLUMNS * 6

  return [
    ...shelfLevel(ids, 0, 'left', 0),
    ...shelfLevel(ids, SHELF_COLUMNS, 'left', 1),
    ...shelfLevel(ids, SHELF_COLUMNS * 2, 'left', 2),
    ...shelfLevel(ids, SHELF_COLUMNS * 3, 'right', 0),
    ...shelfLevel(ids, SHELF_COLUMNS * 4, 'right', 1),
    ...shelfLevel(ids, SHELF_COLUMNS * 5, 'right', 2),
    deskFig(ids[deskOffset]!, -0.85, 0.05),
    deskFig(ids[deskOffset + 1]!, 0, 0.12),
    deskFig(ids[deskOffset + 2]!, 0.85, 0.05),
  ]
}

const placementCache = new Map<string, WorkshopFigurePlacement[]>()

export function getWorkshopFigurePlacements(now = new Date()): WorkshopFigurePlacement[] {
  const dateKey = getWorkshopFigureDateKey(now)
  const cached = placementCache.get(dateKey)
  if (cached) {
    return cached
  }

  const placements = buildWorkshopFigurePlacements(dateKey)
  placementCache.set(dateKey, placements)
  return placements
}

export function getWorkshopUniqueFigureIds(now = new Date()) {
  return [...new Set(getWorkshopFigurePlacements(now).map((placement) => placement.meebitId))]
}
