import { isMobilePerfMode } from '../game/perfConfig'

/** Runway BGM — /public/audio/runway/（または VITE_BGM_BASE_URL） */
export const RUNWAY_BGM = {
  url: '/audio/runway/Meebits Runway.mp3',
  volume: 0.05,
} as const

const BGM_BASE_URL = (import.meta.env.VITE_BGM_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

function encodeAudioPath(path: string) {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

export function resolveRunwayBgmUrl() {
  const encoded = encodeAudioPath(RUNWAY_BGM.url)
  return BGM_BASE_URL ? `${BGM_BASE_URL}${encoded}` : encoded
}

export function getRunwayBgmVolume() {
  const base = RUNWAY_BGM.volume
  return isMobilePerfMode() ? base * 0.9 : base
}
