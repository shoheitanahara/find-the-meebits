import type { ParkSeasonLook } from './parkSeason'
import type { ParkBenchPropKind } from './parkSeason'
import type { ParkZoneId } from './parkZones'

/**
 * ゾーン世界観の床・小物。季節 look の上に乗せるスキン。
 * 骨格座標は共通、色と小物だけ差し替える。
 * 空・霧・全体光は Park（夜）と揃える。明るすぎる昼空にしない。
 */
export function applyZoneLook(zoneId: ParkZoneId, seasonLook: ParkSeasonLook): ParkSeasonLook {
  if (zoneId !== 'mountain') return seasonLook

  return {
    ...seasonLook,
    // 夜空は Plaza と同じベース。わずかに深い緑青で山岳の空気だけ差をつける
    backgroundColor: '#0e1628',
    fogColor: '#152238',
    fogNear: seasonLook.fogNear,
    fogFar: seasonLook.fogFar,
    showStars: true,
    hemisphereSky: '#6e7fa8',
    hemisphereGround: '#2a3228',
    ambientColor: '#b8c0d8',
    ambientIntensity: seasonLook.ambientIntensity,
    hemisphereIntensity: seasonLook.hemisphereIntensity,
    directionalIntensity: seasonLook.directionalIntensity * 0.92,
    directionalColor: '#c8d4f0',
    // トーチ寄りアクセント（Plaza の噴水ゴールドよりややアンバー）
    accentPointColor: '#ffb060',
    accentPointIntensity: Math.min(seasonLook.accentPointIntensity, 28),
    environmentPreset: 'night',
    environmentIntensity: Math.min(seasonLook.environmentIntensity, 0.48),
    // 床・小物はマインクラフト山岳（苔・土・石）を維持
    districtColor: '#2e362c',
    plazaColor: '#364234',
    pathColor: '#4a4038',
    paverColorA: '#4a443c',
    paverColorB: '#3e3830',
    pathEdgeColor: '#6a7a52',
    fountainRingColor: '#5a6848',
    lampLightIntensity: seasonLook.lampLightIntensity,
    lampEmissiveIntensity: seasonLook.lampEmissiveIntensity,
    benchProp: 'campRock' satisfies ParkBenchPropKind,
  }
}
