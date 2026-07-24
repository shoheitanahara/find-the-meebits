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
    // マインクラフト山岳: 苔・土・石（ボクセル床と揃える）
    backgroundColor: '#6a90b0',
    fogColor: '#6a90b0',
    fogNear: 32,
    fogFar: 78,
    hemisphereSky: '#9eb8d0',
    hemisphereGround: '#3a4a28',
    ambientColor: '#d0dcc8',
    directionalColor: '#fff4e0',
    accentPointColor: '#a8d88a',
    accentPointIntensity: 18,
    environmentPreset: 'forest',
    environmentIntensity: 0.38,
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
