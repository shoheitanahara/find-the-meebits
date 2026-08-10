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

/**
 * 台座展示用 — 新しい出品を優先し、上位プールから軽くシャッフル。
 */
export function pickSessionPedestals(listings: readonly ListedMeebit[]): ListedMeebit[] {
  const max = OPEN_SEA_MARKET.maxPedestals
  if (listings.length === 0) return []

  const newestFirst = [...listings].sort((a, b) => (b.listedAt ?? 0) - (a.listedAt ?? 0))
  const poolSize = Math.min(newestFirst.length, Math.max(max, max * 2))
  const pool = newestFirst.slice(0, poolSize)
  shuffleInPlace(pool, Math.floor(Date.now() / 60_000) ^ 0x0aea11)
  return pool.slice(0, Math.min(max, pool.length))
}

/** @deprecated 互換エイリアス */
export const pickSessionListings = pickSessionPedestals

/**
 * 案内歩行NPC — listing 非紐づけ。UTC 日シードのランダム ID（台座 ID 除外）。
 */
export function pickSessionWalkerIds(
  excludeTokenIds: ReadonlySet<number> | readonly number[],
  count = OPEN_SEA_MARKET.maxWalkers,
): number[] {
  const exclude = excludeTokenIds instanceof Set ? excludeTokenIds : new Set(excludeTokenIds)
  const daySeed = Math.floor(Date.now() / 86_400_000)
  let s = (daySeed ^ 0x0ea11d) >>> 0
  const nextRand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s
  }

  const ids: number[] = []
  let guard = 0
  while (ids.length < count && guard < count * 80) {
    guard += 1
    const id = (nextRand() % 20000) + 1
    if (exclude.has(id) || ids.includes(id)) continue
    ids.push(id)
  }
  return ids
}
