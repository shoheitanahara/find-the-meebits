import type { ParkSeasonLook } from './parkSeason'
import type { ParkBenchPropKind } from './parkSeason'
import type { ParkZoneId } from './parkZones'

/**
 * ゾーン世界観の床・小物。季節 look の上に乗せるスキン。
 * 骨格座標は共通、色と小物だけ差し替える。
 */
export function applyZoneLook(zoneId: ParkZoneId, seasonLook: ParkSeasonLook): ParkSeasonLook {
  if (zoneId !== 'mountain') return seasonLook

  return {
    ...seasonLook,
    // マインクラフト山岳: 苔・土・石
    backgroundColor: '#1a2430',
    fogColor: '#243040',
    fogNear: 26,
    fogFar: 68,
    hemisphereSky: '#7a90a8',
    hemisphereGround: '#2a3828',
    ambientColor: '#c8d4c0',
    directionalColor: '#e8f0ff',
    accentPointColor: '#a8d88a',
    accentPointIntensity: 22,
    environmentPreset: 'forest',
    environmentIntensity: 0.42,
    districtColor: '#3a4634',
    plazaColor: '#4a5a40',
    pathColor: '#6a5a48',
    paverColorA: '#5c5348',
    paverColorB: '#4e463c',
    pathEdgeColor: '#8a9a6a',
    fountainRingColor: '#6a7a58',
    lampLightIntensity: 11,
    lampEmissiveIntensity: 2.4,
    benchProp: 'campRock' satisfies ParkBenchPropKind,
  }
}
