import type { ParkSeasonLook } from './parkSeason'
import type { ParkBenchPropKind } from './parkSeason'
import type { ParkZoneId } from './parkZones'

/**
 * ゾーン世界観の床・小物。季節 look の上に乗せるスキン。
 * 骨格座標は共通、色と小物だけ差し替える。
 * 空・霧・全体光は Park（夜）と揃える。明るすぎる昼空にしない。
 */
export function applyZoneLook(zoneId: ParkZoneId, seasonLook: ParkSeasonLook): ParkSeasonLook {
  if (zoneId === 'mountain') {
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

  if (zoneId === 'culture') {
    return {
      ...seasonLook,
      // ギャラリー夜：濃紺の空とクールブルーのスポット
      backgroundColor: '#0a1224',
      fogColor: '#121c34',
      fogNear: seasonLook.fogNear,
      fogFar: seasonLook.fogFar,
      showStars: true,
      hemisphereSky: '#6a88b8',
      hemisphereGround: '#1a2438',
      ambientColor: '#a8bdd8',
      ambientIntensity: seasonLook.ambientIntensity * 1.02,
      hemisphereIntensity: seasonLook.hemisphereIntensity,
      directionalIntensity: seasonLook.directionalIntensity * 0.9,
      directionalColor: '#c8d8f0',
      accentPointColor: '#6a9ee8',
      accentPointIntensity: Math.min(seasonLook.accentPointIntensity * 1.05, 30),
      environmentPreset: 'night',
      environmentIntensity: Math.min(seasonLook.environmentIntensity, 0.48),
      // 濃紺ギャラリー床（CultureDistrictGround が主、ここはフォールバック色）
      districtColor: '#152038',
      plazaColor: '#1a2744',
      pathColor: '#243656',
      paverColorA: '#2a4060',
      paverColorB: '#1e304c',
      pathEdgeColor: '#8eb4e8',
      fountainRingColor: '#3a5a88',
      lampLightIntensity: seasonLook.lampLightIntensity * 1.1,
      lampEmissiveIntensity: seasonLook.lampEmissiveIntensity * 1.08,
      benchProp: seasonLook.benchProp,
    }
  }

  if (zoneId === 'sea') {
    return {
      ...seasonLook,
      // 夜のビーチ：暗い海と空、星、暖色の街灯が主役
      backgroundColor: '#081420',
      fogColor: '#102030',
      fogNear: 32,
      fogFar: 140,
      showStars: true,
      hemisphereSky: '#3a5578',
      hemisphereGround: '#1a2830',
      ambientColor: '#8aa0b8',
      ambientIntensity: seasonLook.ambientIntensity * 0.78,
      hemisphereIntensity: seasonLook.hemisphereIntensity * 0.85,
      directionalIntensity: seasonLook.directionalIntensity * 0.55,
      directionalColor: '#c8d8f0',
      accentPointColor: '#f0b868',
      accentPointIntensity: Math.min(seasonLook.accentPointIntensity * 0.55, 20),
      environmentPreset: 'night',
      environmentIntensity: Math.min(seasonLook.environmentIntensity * 0.85, 0.45),
      districtColor: '#c4a878',
      plazaColor: '#b89868',
      pathColor: '#8a6a48',
      paverColorA: '#b89868',
      paverColorB: '#a89070',
      pathEdgeColor: '#f0c878',
      fountainRingColor: '#8a6a48',
      // ビーチランタンを効かせる
      lampLightIntensity: seasonLook.lampLightIntensity * 1.35,
      lampEmissiveIntensity: seasonLook.lampEmissiveIntensity * 1.25,
      benchProp: seasonLook.benchProp,
    }
  }

  return seasonLook
}
