/**
 * Meebits Park（トップ）の季節テーマ。
 *
 * 切替方法:
 * 1. 下の `PARK_SEASON` を変える（いちばん簡単）
 * 2. URL `?season=summer` で上書き（リロードで反映）
 *
 * Park 本体（夜空・床・列木・街灯）は季節で変えない。
 * 季節は外側の海・砂浜・ヤシ、およびベンチ横オブジェだけを差し替える。
 */

export type ParkSeason = 'default' | 'spring' | 'summer' | 'autumn' | 'winter'

/** ベンチ横オブジェの差し替えキー（実装は ParkBenchProp.tsx） */
export type ParkBenchPropKind = 'flowers' | 'beachSet' | 'surfboard'

/** ここを変えるだけで Park の季節が切り替わる */
export const PARK_SEASON: ParkSeason = 'summer'

export const PARK_SEASONS: readonly ParkSeason[] = [
  'default',
  'spring',
  'summer',
  'autumn',
  'winter',
] as const

export function isParkSeason(value: string | null | undefined): value is ParkSeason {
  return (
    value === 'default' ||
    value === 'spring' ||
    value === 'summer' ||
    value === 'autumn' ||
    value === 'winter'
  )
}

export function getParkSeason(): ParkSeason {
  if (typeof window !== 'undefined') {
    const param = new URLSearchParams(window.location.search).get('season')
    if (isParkSeason(param)) {
      return param
    }
  }

  return PARK_SEASON
}

/** drei Environment の preset 名 */
export type ParkEnvironmentPreset =
  | 'apartment'
  | 'city'
  | 'dawn'
  | 'forest'
  | 'lobby'
  | 'night'
  | 'park'
  | 'studio'
  | 'sunset'
  | 'warehouse'

export type ParkSeasonLook = {
  backgroundColor: string
  fogColor: string
  fogNear: number
  fogFar: number
  showStars: boolean

  ambientIntensity: number
  ambientColor: string
  hemisphereSky: string
  hemisphereGround: string
  hemisphereIntensity: number
  directionalIntensity: number
  directionalColor: string
  /** 噴水付近のポイントライト */
  accentPointIntensity: number
  accentPointColor: string

  environmentPreset: ParkEnvironmentPreset
  environmentIntensity: number

  oceanColor: string
  oceanEmissive: string
  oceanEmissiveIntensity: number
  islandColor: string
  plazaColor: string
  pathColor: string
  paverColorA: string
  paverColorB: string
  pathEdgeColor: string
  fountainRingColor: string

  lampLightIntensity: number
  lampEmissiveIntensity: number

  /** Museum と同系の砂浜レイヤを島の外側に使うか */
  useSummerShore: boolean
  /** 島外周に椰子を置くか（左右の列木は常に夜仕様のまま） */
  usePerimeterPalms: boolean
  /**
   * ベンチ横オブジェ。
   * 'beachSet' | 'surfboard' | 'flowers' — 夏は beachSet 推奨（夜でも読める）
   */
  benchProp: ParkBenchPropKind
}

/** 現行の夜パーク（床・空・ライトのベース。季節でも維持） */
const NIGHT_LOOK: ParkSeasonLook = {
  backgroundColor: '#111a33',
  fogColor: '#17233d',
  fogNear: 34,
  fogFar: 82,
  showStars: true,
  ambientIntensity: 0.82,
  ambientColor: '#c4c9eb',
  hemisphereSky: '#8492c3',
  hemisphereGround: '#35293a',
  hemisphereIntensity: 1.45,
  directionalIntensity: 2.25,
  directionalColor: '#d8e1ff',
  accentPointIntensity: 38,
  accentPointColor: '#ffd38a',
  environmentPreset: 'night',
  environmentIntensity: 0.55,
  oceanColor: '#0b4163',
  oceanEmissive: '#0d5275',
  oceanEmissiveIntensity: 0.2,
  islandColor: '#3a3440',
  plazaColor: '#303746',
  pathColor: '#554d52',
  paverColorA: '#5e565b',
  paverColorB: '#50494f',
  pathEdgeColor: '#b89758',
  fountainRingColor: '#7b6648',
  lampLightIntensity: 14,
  lampEmissiveIntensity: 3.2,
  useSummerShore: false,
  usePerimeterPalms: false,
  benchProp: 'flowers',
}

/** 夜のパークはそのまま。外側の海・砂浜・ヤシとベンチ横だけ夏仕様。 */
const SUMMER_LOOK: ParkSeasonLook = {
  ...NIGHT_LOOK,
  oceanColor: '#2a9fd6',
  oceanEmissive: '#1a7fb0',
  oceanEmissiveIntensity: 0.1,
  islandColor: '#e6d2a0',
  useSummerShore: true,
  usePerimeterPalms: true,
  benchProp: 'beachSet',
}

/** 春・秋・冬は当面ナイトのまま。外周デコは後から足す。 */
const SPRING_LOOK: ParkSeasonLook = { ...NIGHT_LOOK }
const AUTUMN_LOOK: ParkSeasonLook = { ...NIGHT_LOOK }
const WINTER_LOOK: ParkSeasonLook = { ...NIGHT_LOOK }

const SEASON_LOOKS: Record<ParkSeason, ParkSeasonLook> = {
  default: NIGHT_LOOK,
  spring: SPRING_LOOK,
  summer: SUMMER_LOOK,
  autumn: AUTUMN_LOOK,
  winter: WINTER_LOOK,
}

export function getParkSeasonLook(season: ParkSeason = getParkSeason()): ParkSeasonLook {
  return SEASON_LOOKS[season]
}
