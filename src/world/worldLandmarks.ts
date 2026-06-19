/** Shared prop positions for rendering, collision, and hint landmarks. */

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

export type VrmSculpturePedestal = 'light' | 'dark'

export type VrmSculpturePlacement = {
  meebitId: number
  position: readonly [number, number, number]
  pedestal: VrmSculpturePedestal
}

/** Gray VRM statues on pedestals — face entrance from each position. */
export const VRM_SCULPTURE_PLACEMENTS = [
  { meebitId: 17600, position: [-7, 0, 50], pedestal: 'light' },
  { meebitId: 11143, position: [7, 0, 50], pedestal: 'dark' },
  { meebitId: 8506, position: [12, 0, 8], pedestal: 'light' },
  { meebitId: 605, position: [-22, 0, -15], pedestal: 'dark' },
  { meebitId: 10326, position: [-16, 0, 22], pedestal: 'light' },
  { meebitId: 11796, position: [20, 0, -18], pedestal: 'dark' },
  { meebitId: 7347, position: [24, 0, 20], pedestal: 'light' },
  { meebitId: 3458, position: [-44, 0, 3], pedestal: 'dark' },
  { meebitId: 8369, position: [44, 0, -5], pedestal: 'light' },
] as const satisfies ReadonlyArray<VrmSculpturePlacement>

export function getVrmSculptureMeebitIds() {
  return VRM_SCULPTURE_PLACEMENTS.map((placement) => placement.meebitId)
}

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
const VRM_SCULPTURE_LIGHT_PEDESTAL_HINT = ['near a gray Meebit sculpture on a white pedestal']
const VRM_SCULPTURE_DARK_PEDESTAL_HINT = ['near a gray Meebit sculpture on a black pedestal']

export function buildHintLandmarks(): HintLandmark[] {
  return [
    ...SCULPTURE_POSITIONS.map(([x, , z], index) => ({
      x,
      z,
      phrases: index % 2 === 0 ? [...SCULPTURE_DARK_HINT] : [...SCULPTURE_LIGHT_HINT],
    })),
    ...VRM_SCULPTURE_PLACEMENTS.map(({ position: [x, , z], pedestal }) => ({
      x,
      z,
      phrases:
        pedestal === 'light'
          ? [...VRM_SCULPTURE_LIGHT_PEDESTAL_HINT]
          : [...VRM_SCULPTURE_DARK_PEDESTAL_HINT],
    })),
    ...BENCH_POSITIONS.map(([x, , z]) => ({
      x,
      z,
      phrases: ['near a bench'],
    })),
  ]
}
