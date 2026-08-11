import { isSoldMeebit, type ListedMeebit } from '../opensea/types'
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
 * 3ギャラリー分 — MAIN に最新30件を固定、残りを WEST/EAST へ。
 * 48時間以内の売却は最大 maxRecentSales 件を各室へ散らす。
 * 部屋間・部屋内とも tokenId 重複なし。
 */
export function pickSessionGalleries(
  listings: readonly ListedMeebit[],
): ListedMeebit[][] {
  const roomCount = OPEN_SEA_MARKET.roomCount
  const perRoom = OPEN_SEA_MARKET.maxPedestals
  const mainIndex = OPEN_SEA_MARKET.defaultRoomIndex
  const maxTotal = perRoom * roomCount
  const galleries = Array.from({ length: roomCount }, () => [] as ListedMeebit[])
  if (listings.length === 0) return galleries

  const active = listings.filter((item) => !isSoldMeebit(item))
  const listedIds = new Set(active.map((item) => item.tokenId))
  const newestFirst = [...active].sort((a, b) => (b.listedAt ?? 0) - (a.listedAt ?? 0))
  const unique: ListedMeebit[] = []
  const seen = new Set<number>()
  for (const listing of newestFirst) {
    if (seen.has(listing.tokenId)) continue
    seen.add(listing.tokenId)
    unique.push(listing)
    if (unique.length >= maxTotal) break
  }

  galleries[mainIndex] = unique.slice(0, perRoom)

  const sidePool = unique.slice(perRoom)
  const sideRoomIndices = Array.from({ length: roomCount }, (_, i) => i).filter(
    (i) => i !== mainIndex,
  )
  for (let i = 0; i < sidePool.length; i += 1) {
    const room = sideRoomIndices[i % sideRoomIndices.length]
    if (room == null) break
    const bucket = galleries[room]!
    if (bucket.length >= perRoom) {
      const other = sideRoomIndices.find((r) => (galleries[r]?.length ?? 0) < perRoom)
      if (other == null) break
      galleries[other]!.push(sidePool[i]!)
    } else {
      bucket.push(sidePool[i]!)
    }
  }

  mixRecentSales(galleries, listings, listedIds, perRoom, mainIndex, sideRoomIndices)

  const minuteSeed = Math.floor(Date.now() / 60_000)
  for (let room = 0; room < galleries.length; room += 1) {
    shuffleInPlace(galleries[room]!, minuteSeed ^ (0x0aea11 + room * 97))
  }

  return galleries
}

/** 出品と重複しない直近売却を MAIN → 左右へ順に混ぜる */
function mixRecentSales(
  galleries: ListedMeebit[][],
  listings: readonly ListedMeebit[],
  listedIds: ReadonlySet<number>,
  perRoom: number,
  mainIndex: number,
  sideRoomIndices: number[],
) {
  const soldNewest = [...listings]
    .filter(isSoldMeebit)
    .sort((a, b) => (b.soldAt ?? b.listedAt ?? 0) - (a.soldAt ?? a.listedAt ?? 0))

  const sold: ListedMeebit[] = []
  const soldSeen = new Set<number>()
  for (const item of soldNewest) {
    if (listedIds.has(item.tokenId) || soldSeen.has(item.tokenId)) continue
    soldSeen.add(item.tokenId)
    sold.push(item)
    if (sold.length >= OPEN_SEA_MARKET.maxRecentSales) break
  }
  if (sold.length === 0) return

  const roomCycle = [mainIndex, ...sideRoomIndices]
  const replaced = galleries.map(() => 0)
  for (let i = 0; i < sold.length; i += 1) {
    const room = roomCycle[i % roomCycle.length]
    if (room == null) break
    const bucket = galleries[room]
    if (!bucket) continue
    if (bucket.length < perRoom) {
      bucket.push(sold[i]!)
      continue
    }
    const replaceAt = bucket.length - 1 - replaced[room]!
    if (replaceAt < 0) continue
    bucket[replaceAt] = sold[i]!
    replaced[room] += 1
  }
}

/**
 * 台座展示用（単室） — MAIN ギャラリー相当。
 * @deprecated 3ギャラリー時は pickSessionGalleries を使う
 */
export function pickSessionPedestals(listings: readonly ListedMeebit[]): ListedMeebit[] {
  return pickSessionGalleries(listings)[OPEN_SEA_MARKET.defaultRoomIndex] ?? []
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

/** 空でないギャラリーを優先し、できれば MAIN（defaultRoomIndex） */
export function pickInitialRoomIndex(galleries: readonly ListedMeebit[][]): number {
  const preferred = OPEN_SEA_MARKET.defaultRoomIndex
  if ((galleries[preferred]?.length ?? 0) > 0) return preferred
  for (let i = 0; i < galleries.length; i += 1) {
    if ((galleries[i]?.length ?? 0) > 0) return i
  }
  return preferred
}
