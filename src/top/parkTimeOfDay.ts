/**
 * Meebits Park の時間帯ライティング。
 * 現行 PARK_LOOK（夜）を基準に、朝／昼／夕だけライト・空・霧を控えめに差し替える。
 */
import type { Locale } from '../i18n/locale'
import type { ParkLook } from './parkLook'

export type ParkTimeOfDay = 'morning' | 'noon' | 'evening' | 'night'

export const PARK_TIME_OF_DAY_OPTIONS = [
  'morning',
  'noon',
  'evening',
  'night',
] as const satisfies ReadonlyArray<ParkTimeOfDay>

/** 端末ローカル時刻から時間帯を決める（本番の自動切替用）。 */
export function getParkTimeOfDayFromDate(now = new Date()): ParkTimeOfDay {
  const hour = now.getHours()
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 16) return 'noon'
  if (hour >= 16 && hour < 20) return 'evening'
  return 'night'
}

/** `23:00` 形式の時計表示。 */
export function formatParkClock(now = new Date()): string {
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export function getParkTimeOfDayLabel(period: ParkTimeOfDay, locale: Locale): string {
  if (locale === 'ja') {
    switch (period) {
      case 'morning':
        return '朝'
      case 'noon':
        return '昼'
      case 'evening':
        return '夕'
      case 'night':
        return '夜'
    }
  }
  switch (period) {
    case 'morning':
      return 'Morning'
    case 'noon':
      return 'Noon'
    case 'evening':
      return 'Evening'
    case 'night':
      return 'Night'
  }
}

/**
 * ゾーン／クリスマス適用後の look に時間帯を乗せる。
 * ベース look は旧「夜」相当なので、朝昼は色味中心・夜は一段暗くする。
 */
export function applyTimeOfDayLook(look: ParkLook, period: ParkTimeOfDay): ParkLook {
  switch (period) {
    case 'morning':
      // 早朝: 全体は暗め、低角度の暖色太陽光だけ少し立つ
      return {
        ...look,
        showStars: false,
        backgroundColor: mixHex(look.backgroundColor, '#2a3848', 0.22),
        fogColor: mixHex(look.fogColor, '#6a8098', 0.2),
        fogNear: Math.max(18, look.fogNear - 2),
        fogFar: look.fogFar + 2,
        ambientIntensity: look.ambientIntensity * 0.52,
        ambientColor: mixHex(look.ambientColor, '#a8b8c8', 0.22),
        hemisphereSky: mixHex(look.hemisphereSky, '#7088a0', 0.28),
        hemisphereGround: mixHex(look.hemisphereGround, '#3a2a28', 0.25),
        hemisphereIntensity: look.hemisphereIntensity * 0.55,
        directionalIntensity: look.directionalIntensity * 0.78,
        directionalColor: mixHex(look.directionalColor, '#ffb888', 0.45),
        environmentPreset: 'dawn',
        environmentIntensity: Math.min(look.environmentIntensity * 0.7, 0.36),
        accentPointIntensity: look.accentPointIntensity * 0.85,
        lampLightIntensity: look.lampLightIntensity * 0.7,
        lampEmissiveIntensity: look.lampEmissiveIntensity * 0.75,
      }
    case 'noon':
      return {
        ...look,
        showStars: false,
        backgroundColor: mixHex(look.backgroundColor, '#6a90b0', 0.32),
        fogColor: mixHex(look.fogColor, '#a8c0d4', 0.25),
        fogNear: look.fogNear + 4,
        fogFar: look.fogFar + 10,
        ambientIntensity: look.ambientIntensity * 1.02,
        ambientColor: mixHex(look.ambientColor, '#fff0e0', 0.2),
        hemisphereSky: mixHex(look.hemisphereSky, '#98b8d8', 0.3),
        hemisphereGround: mixHex(look.hemisphereGround, '#786850', 0.22),
        hemisphereIntensity: look.hemisphereIntensity * 0.95,
        directionalIntensity: look.directionalIntensity * 1.0,
        directionalColor: mixHex(look.directionalColor, '#ffe8d0', 0.25),
        environmentPreset: 'park',
        environmentIntensity: Math.min(look.environmentIntensity * 1.12, 0.62),
        accentPointIntensity: look.accentPointIntensity * 0.65,
        lampLightIntensity: look.lampLightIntensity * 0.28,
        lampEmissiveIntensity: look.lampEmissiveIntensity * 0.35,
      }
    case 'evening':
      // 夕暮れ: 夜寄りに落とし、残光の暖色だけ残す
      return {
        ...look,
        showStars: false,
        backgroundColor: mixHex(look.backgroundColor, '#120c18', 0.55),
        fogColor: mixHex(look.fogColor, '#4a3028', 0.4),
        fogNear: Math.max(16, look.fogNear - 4),
        fogFar: Math.max(look.fogNear + 20, look.fogFar - 8),
        ambientIntensity: look.ambientIntensity * 0.45,
        ambientColor: mixHex(look.ambientColor, '#a87058', 0.28),
        hemisphereSky: mixHex(look.hemisphereSky, '#683828', 0.42),
        hemisphereGround: mixHex(look.hemisphereGround, '#1c0e0c', 0.38),
        hemisphereIntensity: look.hemisphereIntensity * 0.42,
        directionalIntensity: look.directionalIntensity * 0.42,
        directionalColor: mixHex(look.directionalColor, '#e86830', 0.42),
        environmentPreset: 'sunset',
        environmentIntensity: Math.min(look.environmentIntensity * 0.58, 0.32),
        accentPointIntensity: look.accentPointIntensity * 1.05,
        lampLightIntensity: look.lampLightIntensity * 1.12,
        lampEmissiveIntensity: look.lampEmissiveIntensity * 1.1,
      }
    case 'night':
      return {
        ...look,
        showStars: true,
        backgroundColor: mixHex(look.backgroundColor, '#03060e', 0.55),
        fogColor: mixHex(look.fogColor, '#080e1c', 0.5),
        fogNear: Math.max(16, look.fogNear - 6),
        fogFar: Math.max(look.fogNear + 20, look.fogFar - 12),
        ambientIntensity: look.ambientIntensity * 0.42,
        ambientColor: mixHex(look.ambientColor, '#6a7298', 0.3),
        hemisphereSky: mixHex(look.hemisphereSky, '#243048', 0.4),
        hemisphereGround: mixHex(look.hemisphereGround, '#100810', 0.35),
        hemisphereIntensity: look.hemisphereIntensity * 0.48,
        directionalIntensity: look.directionalIntensity * 0.38,
        directionalColor: mixHex(look.directionalColor, '#8898c8', 0.25),
        environmentPreset: 'night',
        environmentIntensity: look.environmentIntensity * 0.45,
        accentPointIntensity: look.accentPointIntensity * 1.12,
        lampLightIntensity: look.lampLightIntensity * 1.28,
        lampEmissiveIntensity: look.lampEmissiveIntensity * 1.22,
      }
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
