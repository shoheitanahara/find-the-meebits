/**
 * Meebits Park クリスマス季節スキン（11–12月）。
 * Sea エリアは常に除外。骨格レイアウトは変えず look / デコだけ差し替える。
 */
import type { Locale } from '../i18n/locale'
import type { ParkLook } from './parkLook'
import type { ParkZoneId } from './parkZones'

/** 端末ローカルの 11月・12月をクリスマスシーズンとする。 */
export function isParkChristmasSeason(now = new Date()): boolean {
  const month = now.getMonth() + 1
  return month === 11 || month === 12
}

/** Sea 以外かつシーズン中なら装飾を有効にする。 */
export function isParkChristmasActive(zoneId: ParkZoneId, now = new Date()): boolean {
  return zoneId !== 'sea' && isParkChristmasSeason(now)
}

/** UI 用の短い季節コピー（オープニング／左上HUD）。 */
export function getParkChristmasCopy(locale: Locale) {
  if (locale === 'ja') {
    return {
      badge: 'Christmas Season',
      hudTag: 'Christmas Season',
      openingNote: 'クリスマスシーズン開催中。雪とイルミをお楽しみください。',
      tipsNote: 'クリスマスシーズン中です。広場や山に雪が積もっています。',
    } as const
  }
  return {
    badge: 'Christmas Season',
    hudTag: 'Christmas Season',
    openingNote: 'Christmas Season is on. Enjoy the snow and lights.',
    tipsNote: 'Christmas Season is on — snow covers the plaza and mountain.',
  } as const
}

/** ゾーン look の上に冬／イルミ寄りを乗せる。Sea では何もしない。 */
export function applyChristmasLook(zoneId: ParkZoneId, look: ParkLook, now = new Date()): ParkLook {
  if (!isParkChristmasActive(zoneId, now)) {
    return { ...look, christmas: false }
  }

  return {
    ...look,
    christmas: true,
    // 寒色の空気＋やや近い霧で積雪感
    backgroundColor: mixHex(look.backgroundColor, '#1a2438', 0.35),
    fogColor: mixHex(look.fogColor, '#c8d4e8', 0.22),
    fogNear: Math.max(18, look.fogNear - 4),
    fogFar: Math.max(look.fogNear + 20, look.fogFar - 6),
    hemisphereSky: mixHex(look.hemisphereSky, '#a8b8d8', 0.25),
    hemisphereGround: mixHex(look.hemisphereGround, '#4a5868', 0.2),
    ambientColor: mixHex(look.ambientColor, '#d0d8f0', 0.2),
    directionalColor: mixHex(look.directionalColor, '#e8eef8', 0.15),
    // 暖色イルミ（赤金）
    accentPointColor: '#ff6a4a',
    accentPointIntensity: Math.min(look.accentPointIntensity * 1.05, 40),
    lampLightIntensity: look.lampLightIntensity * 1.12,
    lampEmissiveIntensity: look.lampEmissiveIntensity * 1.18,
    lampBulbColor: '#fff4e0',
    lampEmissiveColor: '#ffb060',
    lampPointColor: '#ffc878',
    // 広場・園路を霜寄り（Plaza 連続床＋パッチ積雪の下地）
    districtColor: mixHex(look.districtColor, '#dce4ee', 0.42),
    plazaColor: mixHex(look.plazaColor, '#e8eef6', 0.28),
    pathColor: mixHex(look.pathColor, '#a8b0bc', 0.22),
    paverColorA: mixHex(look.paverColorA, '#c8d0dc', 0.25),
    paverColorB: mixHex(look.paverColorB, '#b8c0cc', 0.22),
    pathEdgeColor: '#d4a050',
    fountainRingColor: mixHex(look.fountainRingColor, '#d0d8e4', 0.35),
  }
}

function mixHex(a: string, b: string, t: number): string {
  const ca = parseHex(a)
  const cb = parseHex(b)
  if (!ca || !cb) return a
  const m = (i: number) => Math.round(ca[i] + (cb[i] - ca[i]) * t)
  return `#${[m(0), m(1), m(2)].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function parseHex(hex: string): [number, number, number] | null {
  const raw = hex.replace('#', '')
  if (raw.length !== 6) return null
  const n = Number.parseInt(raw, 16)
  if (Number.isNaN(n)) return null
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
