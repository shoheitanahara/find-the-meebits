/**
 * Museum 会場の季節装飾。Club では使わない。
 *
 * 切替方法:
 * 1. 下の `MUSEUM_SEASON` を変える（いちばん簡単）
 * 2. URL `?season=summer` で上書き（リロードで反映）
 */
export type MuseumSeason = 'default' | 'spring' | 'summer' | 'autumn' | 'winter'

/** ここを変えるだけで Museum の季節が切り替わる */
export const MUSEUM_SEASON: MuseumSeason = 'summer'

export const MUSEUM_SEASONS: readonly MuseumSeason[] = [
  'default',
  'spring',
  'summer',
  'autumn',
  'winter',
] as const

export function isMuseumSeason(value: string | null | undefined): value is MuseumSeason {
  return (
    value === 'default' ||
    value === 'spring' ||
    value === 'summer' ||
    value === 'autumn' ||
    value === 'winter'
  )
}

export function getMuseumSeason(): MuseumSeason {
  if (typeof window !== 'undefined') {
    const param = new URLSearchParams(window.location.search).get('season')
    if (isMuseumSeason(param)) {
      return param
    }
  }

  return MUSEUM_SEASON
}

export type MuseumSeasonLook = {
  backgroundColor: string
  fogColor: string
  fogNear: number
  fogFar: number
  ambientIntensity: number
  hemisphereSky: string
  hemisphereGround: string
  hemisphereIntensity: number
  directionalIntensity: number
  oceanColor: string
  groundOuterColor: string
  groundInnerColor: string
}

const SEASON_LOOKS: Record<MuseumSeason, MuseumSeasonLook> = {
  default: {
    backgroundColor: '#e7e5e4',
    fogColor: '#e7e5e4',
    fogNear: 70,
    fogFar: 150,
    ambientIntensity: 0.82,
    hemisphereSky: '#ffffff',
    hemisphereGround: '#d6d3d1',
    hemisphereIntensity: 0.9,
    directionalIntensity: 1.45,
    oceanColor: '#0a0a0a',
    groundOuterColor: '#d6d3d1',
    groundInnerColor: '#a8a29e',
  },
  spring: {
    backgroundColor: '#e8f0e4',
    fogColor: '#e4ebe0',
    fogNear: 68,
    fogFar: 148,
    ambientIntensity: 0.88,
    hemisphereSky: '#fff5f8',
    hemisphereGround: '#c5d4b8',
    hemisphereIntensity: 0.95,
    directionalIntensity: 1.4,
    oceanColor: '#7eb8c9',
    groundOuterColor: '#9bbf7a',
    groundInnerColor: '#b7d49a',
  },
  summer: {
    backgroundColor: '#c8e8f5',
    fogColor: '#d5eef8',
    fogNear: 72,
    fogFar: 155,
    ambientIntensity: 0.95,
    hemisphereSky: '#fff8e8',
    hemisphereGround: '#e8d4a8',
    hemisphereIntensity: 1.05,
    directionalIntensity: 1.65,
    oceanColor: '#2a9fd6',
    groundOuterColor: '#e6d2a0',
    groundInnerColor: '#d4bc82',
  },
  autumn: {
    backgroundColor: '#ebe0d0',
    fogColor: '#e6d8c4',
    fogNear: 65,
    fogFar: 140,
    ambientIntensity: 0.78,
    hemisphereSky: '#ffe8d0',
    hemisphereGround: '#c4a574',
    hemisphereIntensity: 0.88,
    directionalIntensity: 1.25,
    oceanColor: '#4a6f82',
    groundOuterColor: '#c4956a',
    groundInnerColor: '#a87848',
  },
  winter: {
    backgroundColor: '#e4eaf0',
    fogColor: '#dce4ec',
    fogNear: 60,
    fogFar: 135,
    ambientIntensity: 0.92,
    hemisphereSky: '#f4f8fc',
    hemisphereGround: '#c8d4e0',
    hemisphereIntensity: 1.0,
    directionalIntensity: 1.2,
    oceanColor: '#8eb0c4',
    groundOuterColor: '#eef2f6',
    groundInnerColor: '#d5dde6',
  },
}

export function getMuseumSeasonLook(season: MuseumSeason = getMuseumSeason()): MuseumSeasonLook {
  return SEASON_LOOKS[season]
}
