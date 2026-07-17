import type { MuseumSeason } from '../world/museumSeason'
import { getMuseumSeason, getMuseumSeasonLook } from '../world/museumSeason'

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

function applyMuseumSeason(theme: VenueTheme, season: MuseumSeason): VenueTheme {
  if (season === 'default') {
    return theme
  }

  const look = getMuseumSeasonLook(season)

  return {
    ...theme,
    backgroundColor: look.backgroundColor,
    fogColor: look.fogColor,
    fogNear: look.fogNear,
    fogFar: look.fogFar,
    ambientIntensity: look.ambientIntensity,
    hemisphereSky: look.hemisphereSky,
    hemisphereGround: look.hemisphereGround,
    hemisphereIntensity: look.hemisphereIntensity,
    directionalIntensity: look.directionalIntensity,
  }
}

export function getVenueTheme(venueId: VenueId): VenueTheme {
  if (venueId === 'club') {
    return CLUB_THEME
  }

  return applyMuseumSeason(MUSEUM_THEME, getMuseumSeason())
}

export function getVenueLabel(venueId: VenueId) {
  // Brand names stay English in both locales
  return venueId === 'club' ? 'After Hours' : 'Museum'
}
