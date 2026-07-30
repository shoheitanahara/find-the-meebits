/**
 * Meebits Park（トップ）の見た目ベース。
 * ゾーン差分は `applyZoneLook` が上書きする。
 * ベンチ横はデフォルトでパラソル（beachSet）。
 */

/** ベンチ横オブジェの差し替えキー（実装は ParkBenchProp.tsx） */
export type ParkBenchPropKind =
  | 'flowers'
  | 'beachSet'
  | 'surfboard'
  | 'campRock'

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

export type ParkLook = {
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

  /** 地区床（崖の内側） */
  districtColor: string
  plazaColor: string
  pathColor: string
  paverColorA: string
  paverColorB: string
  pathEdgeColor: string
  fountainRingColor: string

  lampLightIntensity: number
  lampEmissiveIntensity: number

  /**
   * ベンチ横オブジェ。
   * 'beachSet' | 'surfboard' | 'flowers' | 'campRock'
   */
  benchProp: ParkBenchPropKind
}

/** 現行の夜パーク（床・空・ライトのベース） */
export const PARK_LOOK: ParkLook = {
  backgroundColor: '#111a33',
  fogColor: '#17233d',
  fogNear: 28,
  fogFar: 72,
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
  districtColor: '#2a2430',
  plazaColor: '#303746',
  pathColor: '#554d52',
  paverColorA: '#5e565b',
  paverColorB: '#50494f',
  pathEdgeColor: '#b89758',
  fountainRingColor: '#7b6648',
  lampLightIntensity: 14,
  lampEmissiveIntensity: 3.2,
  // パラソル＋ビーチボール（旧夏 Ver. から常設）
  benchProp: 'beachSet',
}

export function getParkLook(): ParkLook {
  return PARK_LOOK
}
