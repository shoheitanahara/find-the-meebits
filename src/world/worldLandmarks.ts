/** Shared prop positions for rendering, collision, and hint landmarks. */

export const GOLDEN_TREE_POSITIONS = [
  [-22, 0, -15],
  [-16, 0, 22],
  [20, 0, -18],
  [24, 0, 20],
  [-44, 0, 3],
  [44, 0, -5],
] as const satisfies ReadonlyArray<[number, number, number]>

export const BENCH_POSITIONS = [
  [-14, 0.35, 12],
  [14, 0.35, 12],
  [-28, 0.35, -22],
  [28, 0.35, 24],
  [-18, 0.35, -32],
  [18, 0.35, -32],
] as const satisfies ReadonlyArray<[number, number, number]>

/** Inset from the outer rim so sculptures read as gallery pieces, not perimeter clutter. */
export const SCULPTURE_POSITIONS = [
  [-36, 0, -38],
  [-20, 0, -40],
  [20, 0, -40],
  [36, 0, -38],
  [-40, 0, 18],
  [-22, 0, 32],
  [22, 0, 32],
  [40, 0, 18],
] as const satisfies ReadonlyArray<[number, number, number]>

export const WALL_PANEL_POSITIONS = [
  [-54, 0.575, -10],
  [-54, 0.575, 12],
  [54, 0.575, -14],
  [54, 0.575, 10],
  [-12, 0.575, -54],
  [14, 0.575, -54],
  [-14, 0.575, 54],
  [12, 0.575, 54],
] as const satisfies ReadonlyArray<[number, number, number]>

export type HintLandmark = {
  x: number
  z: number
  phrases: string[]
}

/** index % 2 === 0 → dark pedestal / silver statue; odd → all-white light sculpture */
const SCULPTURE_DARK_HINT = ['near a dark sculpture']
const SCULPTURE_LIGHT_HINT = ['near a light sculpture']

export function buildHintLandmarks(): HintLandmark[] {
  return [
    ...GOLDEN_TREE_POSITIONS.map(([x, , z]) => ({
      x,
      z,
      phrases: ['near the golden trees'],
    })),
    ...SCULPTURE_POSITIONS.map(([x, , z], index) => ({
      x,
      z,
      phrases: index % 2 === 0 ? [...SCULPTURE_DARK_HINT] : [...SCULPTURE_LIGHT_HINT],
    })),
    ...BENCH_POSITIONS.map(([x, , z]) => ({
      x,
      z,
      phrases: ['near a bench'],
    })),
  ]
}
