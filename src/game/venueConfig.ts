import { getCachedAppEdition } from './appEdition'

export type VenueId = 'museum' | 'club'

export type VenueTheme = {
  backgroundColor: string
  fogColor: string
  fogNear: number
  fogFar: number
  ambientIntensity: number
  hemisphereSky: string
  hemisphereGround: string
  hemisphereIntensity: number
  directionalIntensity: number
  directionalPosition: [number, number, number]
  pointLights: Array<{
    color: string
    intensity: number
    position: [number, number, number]
    distance: number
  }>
}

/** Museum 外周〜プラザの表面色（v1 / Trait Hunt で切替） */
export type MuseumSurfaceLook = {
  oceanColor: string
  oceanRoughness: number
  oceanMetalness: number
  groundOuterColor: string
  groundInnerColor: string
  plazaBaseColor: string
  plazaTileA: string
  plazaTileB: string
  plazaFrameColor: string
}

const MUSEUM_THEME: VenueTheme = {
  backgroundColor: '#e7e5e4',
  fogColor: '#e7e5e4',
  fogNear: 70,
  fogFar: 150,
  ambientIntensity: 0.82,
  hemisphereSky: '#ffffff',
  hemisphereGround: '#d6d3d1',
  hemisphereIntensity: 0.9,
  directionalIntensity: 1.45,
  directionalPosition: [18, 24, 12],
  pointLights: [],
}

/** Trait Hunt (/v2): Museum レイアウトのまま Match Hall 雰囲気へ（彫刻が読める明るさ） */
const MATCH_HALL_THEME: VenueTheme = {
  backgroundColor: '#152836',
  fogColor: '#1e3a4c',
  fogNear: 62,
  fogFar: 145,
  ambientIntensity: 0.78,
  hemisphereSky: '#8ec8dc',
  hemisphereGround: '#2a4558',
  hemisphereIntensity: 0.95,
  directionalIntensity: 1.35,
  directionalPosition: [14, 26, 10],
  pointLights: [
    { color: '#b8f0ff', intensity: 55, position: [0, 10, 0], distance: 58 },
    { color: '#ff8eb0', intensity: 32, position: [-22, 8, -18], distance: 40 },
    { color: '#ffe8a0', intensity: 28, position: [22, 8, 18], distance: 38 },
    { color: '#c4b0ff', intensity: 30, position: [18, 8, -20], distance: 38 },
  ],
}

const CLUB_THEME: VenueTheme = {
  backgroundColor: '#1e1430',
  fogColor: '#2a1d42',
  fogNear: 48,
  fogFar: 110,
  ambientIntensity: 0.3,
  hemisphereSky: '#3b1f52',
  hemisphereGround: '#2a1d42',
  hemisphereIntensity: 0.42,
  directionalIntensity: 0.22,
  directionalPosition: [0, 18, 0],
  pointLights: [],
}

const MUSEUM_SURFACE: MuseumSurfaceLook = {
  oceanColor: '#0a0a0a',
  oceanRoughness: 0.82,
  oceanMetalness: 0.05,
  groundOuterColor: '#d6d3d1',
  groundInnerColor: '#a8a29e',
  plazaBaseColor: '#f5f5f4',
  plazaTileA: '#fafaf9',
  plazaTileB: '#e7e5e4',
  plazaFrameColor: '#a8a29e',
}

const MATCH_HALL_SURFACE: MuseumSurfaceLook = {
  oceanColor: '#0a2430',
  oceanRoughness: 0.5,
  oceanMetalness: 0.18,
  groundOuterColor: '#1c3a4c',
  groundInnerColor: '#254858',
  plazaBaseColor: '#1e3340',
  plazaTileA: '#2a4554',
  plazaTileB: '#1a2e3a',
  plazaFrameColor: '#5ee0ff',
}

export function isMatchHallVenue(venueId: VenueId = 'museum') {
  return venueId === 'museum' && getCachedAppEdition() === 'v2'
}

export function getVenueTheme(venueId: VenueId): VenueTheme {
  if (venueId === 'club') return CLUB_THEME
  if (isMatchHallVenue(venueId)) return MATCH_HALL_THEME
  return MUSEUM_THEME
}

export function getMuseumSurfaceLook(venueId: VenueId = 'museum'): MuseumSurfaceLook {
  return isMatchHallVenue(venueId) ? MATCH_HALL_SURFACE : MUSEUM_SURFACE
}

export function getVenueLabel(venueId: VenueId) {
  if (venueId === 'club') return 'After Hours'
  if (isMatchHallVenue(venueId)) return 'Match Hall'
  return 'Museum'
}
