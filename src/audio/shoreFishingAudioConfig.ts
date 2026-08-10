import { isMobilePerfMode } from '../game/perfConfig'

/** Shore Fishing BGM — /public/audio/fishing/（または VITE_BGM_BASE_URL） */
export const SHORE_FISHING_BGM = {
  url: '/audio/fishing/Meebits Shore Fishing.mp3',
  volume: 0.05,
} as const

const BGM_BASE_URL = (import.meta.env.VITE_BGM_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

function encodeAudioPath(path: string) {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

export function resolveShoreFishingBgmUrl() {
  const encoded = encodeAudioPath(SHORE_FISHING_BGM.url)
  return BGM_BASE_URL ? `${BGM_BASE_URL}${encoded}` : encoded
}

export function getShoreFishingBgmVolume() {
  const base = SHORE_FISHING_BGM.volume
  return isMobilePerfMode() ? base * 0.9 : base
}
