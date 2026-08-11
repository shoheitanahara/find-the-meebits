import type { MarketRoomIndex } from '../store'

export const MARKET_GALLERY_IDS = ['west', 'main', 'east'] as const

export type MarketGalleryId = (typeof MARKET_GALLERY_IDS)[number]

export const MARKET_GALLERY_LABELS = {
  en: { west: 'WEST', main: 'MAIN', east: 'EAST' } as const,
  ja: { west: 'WEST', main: 'MAIN', east: 'EAST' } as const,
}

export function galleryIdFromRoomIndex(index: MarketRoomIndex): MarketGalleryId {
  return MARKET_GALLERY_IDS[index] ?? 'main'
}

export function galleryLabel(
  index: MarketRoomIndex,
  locale: 'en' | 'ja' = 'en',
): string {
  return MARKET_GALLERY_LABELS[locale][galleryIdFromRoomIndex(index)]
}
