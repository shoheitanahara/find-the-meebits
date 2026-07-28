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

const WORKSHOP_FIGURE_SEED = 20260728

function pickWorkshopMeebitId(index: number): number {
  let id = (Math.imul(index + 1, 1103515245) + WORKSHOP_FIGURE_SEED) >>> 0
  id = (id % 20000) + 1
  if (id === SERGITO_MEEBIT_ID) {
    id = ((id + 137) % 20000) + 1
  }
  return id
}

function shelfFig(
  index: number,
  side: 'left' | 'right',
  level: number,
  zSlot: number,
): WorkshopFigurePlacement {
  const { leftCenterX, rightCenterX, boardTopY, figureInset } = WORKSHOP_SHELF
  const isLeft = side === 'left'
  return {
    meebitId: pickWorkshopMeebitId(index),
    x: isLeft ? leftCenterX + figureInset : rightCenterX - figureInset,
    y: boardTopY[level],
    z: zSlot,
    rotationY: isLeft ? Math.PI / 2 : -Math.PI / 2,
    scale: WORKSHOP_FIGURE_SCALE,
    kind: 'shelf',
  }
}

function deskFig(index: number, localX: number, localZ: number): WorkshopFigurePlacement {
  const desk = { x: -1.2, z: -8.2 }
  return {
    meebitId: pickWorkshopMeebitId(index),
    x: desk.x + localX,
    y: WORKSHOP_DESK_TOP_Y,
    z: desk.z + localZ,
    rotationY: 0,
    scale: WORKSHOP_FIGURE_SCALE,
    kind: 'desk',
  }
}

const SHELF_COLUMNS = WORKSHOP_SHELF.columnCount

function shelfLevel(side: 'left' | 'right', level: number, idOffset: number) {
  return WORKSHOP_SHELF.zSlots.map((z, col) => shelfFig(idOffset + col, side, level, z))
}

/** 棚 3 段 × 16 列 × 2 面 = 96 体 + 机 3 体 */
export const WORKSHOP_FIGURE_PLACEMENTS: WorkshopFigurePlacement[] = [
  ...shelfLevel('left', 0, 0),
  ...shelfLevel('left', 1, SHELF_COLUMNS),
  ...shelfLevel('left', 2, SHELF_COLUMNS * 2),
  ...shelfLevel('right', 0, SHELF_COLUMNS * 3),
  ...shelfLevel('right', 1, SHELF_COLUMNS * 4),
  ...shelfLevel('right', 2, SHELF_COLUMNS * 5),
  deskFig(SHELF_COLUMNS * 6, -0.85, 0.05),
  deskFig(SHELF_COLUMNS * 6 + 1, 0, 0.12),
  deskFig(SHELF_COLUMNS * 6 + 2, 0.85, 0.05),
]

export const WORKSHOP_UNIQUE_FIGURE_IDS = [
  ...new Set(WORKSHOP_FIGURE_PLACEMENTS.map((placement) => placement.meebitId)),
]
