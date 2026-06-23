/** Club prop positions for rendering, collision, and hint landmarks. */

import type { VrmSculpturePedestal, VrmSculpturePlacement } from './worldLandmarks'

export type ClubBoxPlacement = {
  position: readonly [number, number, number]
  size: readonly [number, number, number]
}

export type ClubNeonPlacement = {
  position: readonly [number, number, number]
  color: string
  rotationY: number
  axis: 'x' | 'y'
  length: number
  height?: number
}

export type ClubOrientedPlacement = {
  position: readonly [number, number, number]
  rotationY: number
  /** Local XZ footprint before rotation (width along local X, depth along local Z) */
  footprint: readonly [number, number]
}

export type ClubSpeakerPlacement = ClubOrientedPlacement

export const CLUB_COUCH_PLACEMENTS = [
  { position: [-46, 0, 10], rotationY: Math.PI / 2, footprint: [8.2, 7.0] },
  { position: [46, 0, 10], rotationY: -Math.PI / 2, footprint: [8.2, 7.0] },
  { position: [-46, 0, -10], rotationY: Math.PI / 2, footprint: [8.2, 7.0] },
  { position: [46, 0, -10], rotationY: -Math.PI / 2, footprint: [8.2, 7.0] },
] as const satisfies ReadonlyArray<ClubOrientedPlacement>

export const CLUB_SPEAKER_PLACEMENTS = [
  { position: [-11, 0, -43], rotationY: 0.12, footprint: [1.05, 0.82] },
  { position: [11, 0, -43], rotationY: -0.12, footprint: [1.05, 0.82] },
  { position: [-54, 0, -46], rotationY: 0.35, footprint: [1.05, 0.82] },
  { position: [54, 0, -46], rotationY: -0.35, footprint: [1.05, 0.82] },
] as const satisfies ReadonlyArray<ClubSpeakerPlacement>

export const CLUB_BAR_PLACEMENTS = [
  { position: [-28, 0, -38], rotationY: 0, footprint: [6.05, 2.02], neonColor: '#ec4899' },
  { position: [28, 0, -38], rotationY: 0, footprint: [6.05, 2.02], neonColor: '#38bdf8' },
] as const satisfies ReadonlyArray<ClubOrientedPlacement & { neonColor: string }>

/** @deprecated Use CLUB_COUCH_PLACEMENTS */
export const CLUB_COUCH_POSITIONS = CLUB_COUCH_PLACEMENTS.map((p) => p.position)

/** @deprecated Use CLUB_BAR_PLACEMENTS */
export const CLUB_BAR_POSITIONS = CLUB_BAR_PLACEMENTS.map((p) => p.position)

/** Low partitions — collision matches rendered boxes exactly. */
export const CLUB_PARTITION_PLACEMENTS = [
  { position: [-22, 0.45, 36], size: [10, 0.9, 2.4] },
  { position: [22, 0.45, 36], size: [10, 0.9, 2.4] },
  { position: [-34, 0.55, -24], size: [14, 1.1, 3.8] },
  { position: [34, 0.55, -24], size: [14, 1.1, 3.8] },
  { position: [-36, 0.5, 22], size: [12, 1.0, 3.2] },
  { position: [36, 0.5, 22], size: [12, 1.0, 3.2] },
] as const satisfies ReadonlyArray<ClubBoxPlacement>

export const CLUB_NEON_PLACEMENTS = [
  { position: [-7.5, 0, 55], color: '#f472b6', rotationY: 0, axis: 'y', length: 2.4 },
  { position: [7.5, 0, 55], color: '#38bdf8', rotationY: 0, axis: 'y', length: 2.4 },
  { position: [0, 0, 55], color: '#facc15', rotationY: 0, axis: 'x', length: 4.8, height: 2.35 },
  { position: [0, 0, -47.5], color: '#a78bfa', rotationY: 0, axis: 'x', length: 7.2, height: 2.05 },
  { position: [0, 0, -47.5], color: '#f472b6', rotationY: 0, axis: 'x', length: 5.6, height: 2.55 },
  { position: [-57, 0, -28], color: '#38bdf8', rotationY: Math.PI / 2, axis: 'y', length: 2.2 },
  { position: [-57, 0, -8], color: '#fb7185', rotationY: Math.PI / 2, axis: 'y', length: 2.2 },
  { position: [-57, 0, 12], color: '#a78bfa', rotationY: Math.PI / 2, axis: 'y', length: 2.2 },
  { position: [-57, 0, 32], color: '#34d399', rotationY: Math.PI / 2, axis: 'y', length: 2.2 },
  { position: [57, 0, -28], color: '#f472b6', rotationY: -Math.PI / 2, axis: 'y', length: 2.2 },
  { position: [57, 0, -8], color: '#38bdf8', rotationY: -Math.PI / 2, axis: 'y', length: 2.2 },
  { position: [57, 0, 12], color: '#facc15', rotationY: -Math.PI / 2, axis: 'y', length: 2.2 },
  { position: [57, 0, 32], color: '#a78bfa', rotationY: -Math.PI / 2, axis: 'y', length: 2.2 },
] as const satisfies ReadonlyArray<ClubNeonPlacement>

export const CLUB_DJ_BOOTH_POSITION: [number, number, number] = [0, 0, -42]

export type ClubSpotlightPlacement = {
  id: string
  x: number
  z: number
  color: string
  height: number
  /** Floor decal only — not used for light reach */
  poolRadius: number
  /** How far the spotlight actually illuminates avatars/props */
  beamRadius: number
}

/** Downward spot pools at key club landmarks (entrance, bars, DJ, VIP, dance floor). */
export const CLUB_SPOTLIGHT_PLACEMENTS = [
  { id: 'entrance', x: 0, z: 52, color: '#fbcfe8', height: 6.8, poolRadius: 9.5, beamRadius: 38 },
  { id: 'dj', x: 0, z: -42, color: '#c4b5fd', height: 6.4, poolRadius: 11, beamRadius: 42 },
  { id: 'bar-left', x: -28, z: -38, color: '#f9a8d4', height: 5.4, poolRadius: 8, beamRadius: 34 },
  { id: 'bar-right', x: 28, z: -38, color: '#93c5fd', height: 5.4, poolRadius: 8, beamRadius: 34 },
  { id: 'dance-floor', x: 0, z: 2, color: '#e9d5ff', height: 8.2, poolRadius: 14, beamRadius: 48 },
  { id: 'sculpture-left', x: -48, z: 24, color: '#d4d4d8', height: 5.6, poolRadius: 7, beamRadius: 30 },
  { id: 'sculpture-right', x: 48, z: 24, color: '#d4d4d8', height: 5.6, poolRadius: 7, beamRadius: 30 },
] as const satisfies ReadonlyArray<ClubSpotlightPlacement>

/** Dark-pedestal VRM statues — flanking entrance and VIP alcoves. */
export const CLUB_VRM_SCULPTURE_PLACEMENTS = [
  { meebitId: 11143, position: [-8.5, 0, 53], pedestal: 'dark' },
  { meebitId: 17600, position: [8.5, 0, 53], pedestal: 'dark' },
  { meebitId: 605, position: [-48, 0, 24], pedestal: 'dark' },
  { meebitId: 11796, position: [48, 0, 24], pedestal: 'dark' },
  { meebitId: 8506, position: [-42, 0, -32], pedestal: 'dark' },
  { meebitId: 7347, position: [42, 0, -32], pedestal: 'dark' },
] as const satisfies ReadonlyArray<VrmSculpturePlacement>

export function getClubVrmSculptureMeebitIds() {
  return CLUB_VRM_SCULPTURE_PLACEMENTS.map((placement) => placement.meebitId)
}

export type HintLandmark = {
  x: number
  z: number
  phrases: string[]
}

const CLUB_VRM_SCULPTURE_HINT = ['near a dark Meebit statue']

export function buildClubHintLandmarks(): HintLandmark[] {
  return [
    {
      x: 0,
      z: 52,
      phrases: ['near the entrance arch', 'by the front neon signs'],
    },
    {
      x: 0,
      z: 2,
      phrases: ['under the center spotlight', 'on the main dance floor'],
    },
    ...CLUB_PARTITION_PLACEMENTS.map(({ position: [x, , z] }) => ({
      x,
      z,
      phrases: ['near a velvet rope line', 'by the stanchion ropes'],
    })),
    ...CLUB_COUCH_PLACEMENTS.map(({ position: [x, , z] }) => ({
      x,
      z,
      phrases: ['in the VIP lounge', 'by the velvet sofas and gold trim'],
    })),
    ...CLUB_SPEAKER_PLACEMENTS.map(({ position: [x, , z] }) => ({
      x,
      z,
      phrases: ['near a PA speaker stack', 'close to the wall speakers'],
    })),
    ...CLUB_BAR_PLACEMENTS.map(({ position: [x, , z] }) => ({
      x,
      z,
      phrases: ['near the bar', 'by the glowing bar counter'],
    })),
    ...CLUB_NEON_PLACEMENTS.map(({ position: [x, , z] }) => ({
      x,
      z,
      phrases:
        z > 40
          ? ['near the entrance neon', 'under the front neon sign']
          : ['near a wall neon sign', 'by the side neon lights'],
    })),
    ...CLUB_VRM_SCULPTURE_PLACEMENTS.map(({ position: [x, , z] }) => ({
      x,
      z,
      phrases:
        z > 40
          ? ['near an entrance Meebit statue', 'by the lit statues at the door']
          : [...CLUB_VRM_SCULPTURE_HINT, 'near a spotlighted Meebit statue'],
    })),
    {
      x: CLUB_DJ_BOOTH_POSITION[0],
      z: CLUB_DJ_BOOTH_POSITION[2],
      phrases: ['near the DJ booth', 'by the decks and mixer'],
    },
    ...CLUB_SPOTLIGHT_PLACEMENTS.map(({ x, z, id }) => ({
      x,
      z,
      phrases:
        id === 'bar-left' || id === 'bar-right'
          ? ['in the bar spotlight', 'near the bar lights']
          : id === 'dance-floor'
              ? ['under the dance floor lights']
              : id === 'entrance'
                ? ['in the entrance spotlight']
                : id === 'dj'
                  ? ['in the DJ booth spotlight']
                  : id === 'sculpture-left' || id === 'sculpture-right'
                    ? ['in the Meebit statue spotlight', 'near a spotlighted Meebit statue']
                    : ['under a club spotlight'],
    })),
  ]
}

export function getClubDecorMeebitIds() {
  return getClubVrmSculptureMeebitIds()
}

/** Collision footprint per prop type — kept in sync with ClubProps geometry. */
export const CLUB_COLLISION = {
  djBooth: { width: 8.2, depth: 2.8 },
  sculpture: { width: 2.8, depth: 2.8 },
} as const

/** Map local footprint to world XZ when Y-rotated ~±90° */
export function clubWorldFootprint(
  localWidth: number,
  localDepth: number,
  rotationY: number,
): { width: number; depth: number } {
  const swap = Math.abs(Math.cos(rotationY)) < 0.5
  return swap
    ? { width: localDepth, depth: localWidth }
    : { width: localWidth, depth: localDepth }
}
