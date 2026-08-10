import { isMobilePerfMode } from '../game/perfConfig'
import type { ListedMeebit } from '../opensea/types'
import { OPEN_SEA_MARKET } from './config'

function shuffleInPlace<T>(items: T[], seed: number) {
  let s = seed >>> 0
  for (let i = items.length - 1; i > 0; i -= 1) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    const j = s % (i + 1)
    const tmp = items[i]!
    items[i] = items[j]!
    items[j] = tmp
  }
  return items
}

/** セッション固定の表示メンバーを選ぶ */
export function pickSessionListings(listings: readonly ListedMeebit[]): ListedMeebit[] {
  const max = isMobilePerfMode()
    ? OPEN_SEA_MARKET.maxNpcsMobile
    : OPEN_SEA_MARKET.maxNpcsDesktop
  if (listings.length === 0) return []
  const copy = [...listings]
  shuffleInPlace(copy, Math.floor(Date.now() / 60_000) ^ 0x0aea11)
  return copy.slice(0, Math.min(max, copy.length))
}
