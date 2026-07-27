import { isMobilePerfMode } from '../game/perfConfig'

/** Park 全体 BGM — /public/audio/park/（または VITE_BGM_BASE_URL） */
export const PARK_BGM = {
  /** public/audio/park/Meebits Park BGM (Park).mp3 */
  url: '/audio/park/Meebits Park BGM (Park).mp3',
  volume: 0.05,
} as const

const BGM_BASE_URL = (import.meta.env.VITE_BGM_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export function resolveParkBgmUrl() {
  const path = PARK_BGM.url
  const encoded = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return BGM_BASE_URL ? `${BGM_BASE_URL}${encoded}` : encoded
}

export function getParkBgmVolume() {
  const base = PARK_BGM.volume
  return isMobilePerfMode() ? base * 0.9 : base
}
