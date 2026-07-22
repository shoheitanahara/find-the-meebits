/**
 * 日付（JST）シードで「本日の主役」と来場者30体を決定的に選ぶ。
 * 誰がアクセスしても同日は同じラインナップになる。
 */

import {
  getMeebitTraitsFromDataset,
  loadMeebitTraitsDataset,
  type MeebitTraitMap,
  type MeebitTraitsDataset,
} from '../data/meebitTraits'

export const DAILY_VISITOR_COUNT = 30
export const DAILY_MATCHED_VISITOR_COUNT = 15
export const MEEBIT_ID_MAX = 20000

const STORAGE_KEY = 'meebits-park-daily-v3'

/** 噴水の右前・正面向きの主役説明看板（見た目・当たり判定で共有）。 */
export const FEATURED_BOARD_POSITION: [number, number, number] = [2.85, 0, 5.15]

export type DailyVisitor = {
  meebitNumber: number
  matched: boolean
}

export type DailyParkLineup = {
  dateKey: string
  featuredId: number
  featuredTraits: MeebitTraitMap
  visitors: DailyVisitor[]
}

type StoredDailyLineup = {
  dateKey: string
  featuredId: number
  visitors: DailyVisitor[]
}

let memoryCache: DailyParkLineup | null = null
let loadPromise: Promise<DailyParkLineup> | null = null

/** JST の YYYY-MM-DD。日替わり境界は日本時間 0:00。 */
export function getJstDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** 文字列から 32bit シードを作る（同日・同キーで常に同じ）。 */
export function hashStringToSeed(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** mulberry32 — 決定的な [0, 1) PRNG。 */
export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 主役と1つでもトレイト（キー・値）が一致すれば true。 */
export function sharesAnyTrait(a: MeebitTraitMap, b: MeebitTraitMap): boolean {
  for (const [key, value] of Object.entries(a)) {
    if (b[key] !== undefined && b[key] === value) return true
  }
  return false
}

function shuffleInPlace<T>(items: T[], rng: () => number): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = items[i]
    items[i] = items[j]
    items[j] = tmp
  }
  return items
}

function pickFeaturedId(dataset: MeebitTraitsDataset, rng: () => number): number {
  // 欠損トレイトを避けるため、シード順に最大 64 回まで再抽選。
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const id = 1 + Math.floor(rng() * MEEBIT_ID_MAX)
    if (getMeebitTraitsFromDataset(dataset, id)) return id
  }

  // フォールバック: dataset 先頭の有効 ID（決定的にソート）
  const ids = Object.keys(dataset.byId)
    .map(Number)
    .filter((id) => Number.isFinite(id) && id >= 1 && id <= MEEBIT_ID_MAX)
    .sort((a, b) => a - b)
  if (ids.length === 0) {
    throw new Error('[dailyFeatured] traits dataset has no valid meebit ids')
  }
  return ids[Math.floor(rng() * ids.length)] ?? ids[0]
}

function buildLineupFromScratch(
  dataset: MeebitTraitsDataset,
  dateKey: string,
): DailyParkLineup {
  const rng = createSeededRng(hashStringToSeed(`meebits-park:${dateKey}`))
  const featuredId = pickFeaturedId(dataset, rng)
  const featuredTraits = getMeebitTraitsFromDataset(dataset, featuredId)
  if (!featuredTraits) {
    throw new Error(`[dailyFeatured] missing traits for featured #${featuredId}`)
  }

  // トレイト共有候補と、全体プール（フィラーは全体からランダム）
  const matchedIds: number[] = []
  const allOtherIds: number[] = []

  for (const key of Object.keys(dataset.byId)) {
    const id = Number(key)
    if (!Number.isFinite(id) || id === featuredId) continue
    const traits = dataset.byId[key]
    if (!traits) continue
    allOtherIds.push(id)
    if (sharesAnyTrait(featuredTraits, traits)) {
      matchedIds.push(id)
    }
  }

  shuffleInPlace(matchedIds, rng)

  const visitors: DailyVisitor[] = []
  const used = new Set<number>()

  // 来場者の1体は必ず主役本人（銅像と同じ Meebit がパークを歩く）
  visitors.push({ meebitNumber: featuredId, matched: true })
  used.add(featuredId)

  // 共通トレイト枠（主役本人を含めて DAILY_MATCHED_VISITOR_COUNT）
  for (const id of matchedIds) {
    if (visitors.filter((v) => v.matched).length >= DAILY_MATCHED_VISITOR_COUNT) break
    if (used.has(id)) continue
    used.add(id)
    visitors.push({ meebitNumber: id, matched: true })
  }

  // 残りは未選定プールからの完全ランダム（トレイト非一致に限定しない）
  const randomPool = allOtherIds.filter((id) => !used.has(id))
  shuffleInPlace(randomPool, rng)
  for (const id of randomPool) {
    if (visitors.length >= DAILY_VISITOR_COUNT) break
    used.add(id)
    const traits = dataset.byId[String(id)]
    visitors.push({
      meebitNumber: id,
      // 表示・集計用。選出枠としてはランダム枠
      matched: traits ? sharesAnyTrait(featuredTraits, traits) : false,
    })
  }

  // 来場者の並びも日次で固定
  shuffleInPlace(visitors, rng)

  return {
    dateKey,
    featuredId,
    featuredTraits,
    visitors,
  }
}

function readStoredLineup(dateKey: string): StoredDailyLineup | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredDailyLineup
    if (
      parsed?.dateKey !== dateKey ||
      typeof parsed.featuredId !== 'number' ||
      !Array.isArray(parsed.visitors) ||
      parsed.visitors.length !== DAILY_VISITOR_COUNT ||
      !parsed.visitors.some((visitor) => visitor.meebitNumber === parsed.featuredId)
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeStoredLineup(lineup: DailyParkLineup) {
  if (typeof sessionStorage === 'undefined') return
  try {
    const payload: StoredDailyLineup = {
      dateKey: lineup.dateKey,
      featuredId: lineup.featuredId,
      visitors: lineup.visitors,
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // sessionStorage 不可でもゲームは続行
  }
}

function hydrateFromStored(
  dataset: MeebitTraitsDataset,
  stored: StoredDailyLineup,
): DailyParkLineup | null {
  const featuredTraits = getMeebitTraitsFromDataset(dataset, stored.featuredId)
  if (!featuredTraits) return null
  return {
    dateKey: stored.dateKey,
    featuredId: stored.featuredId,
    featuredTraits,
    visitors: stored.visitors,
  }
}

/**
 * 本日のパークラインナップを返す。
 * メモリ → sessionStorage → 日付シード再計算の順。
 */
export async function getDailyParkLineup(now = new Date()): Promise<DailyParkLineup> {
  const dateKey = getJstDateKey(now)

  if (memoryCache?.dateKey === dateKey) {
    return memoryCache
  }

  if (loadPromise) {
    return loadPromise
  }

  loadPromise = (async () => {
    const dataset = await loadMeebitTraitsDataset()
    if (!dataset) {
      throw new Error('[dailyFeatured] failed to load meebit traits dataset')
    }

    const stored = readStoredLineup(dateKey)
    if (stored) {
      const hydrated = hydrateFromStored(dataset, stored)
      if (hydrated) {
        memoryCache = hydrated
        return hydrated
      }
    }

    const lineup = buildLineupFromScratch(dataset, dateKey)
    memoryCache = lineup
    writeStoredLineup(lineup)
    return lineup
  })()

  try {
    return await loadPromise
  } finally {
    loadPromise = null
  }
}
