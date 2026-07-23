/**
 * 日付（JST）シードで「本日の主役」と来場者30体を決定的に選ぶ。
 * 誰がアクセスしても同日は同じラインナップになる。
 *
 * マッチ枠15体: 主役から選んだ「本日の共通トレイト」1つを共有する Meebit。
 * 残り15体: 未選定プールからの完全ランダム。
 */

import {
  getMeebitTraitsFromDataset,
  loadMeebitTraitsDataset,
  type MeebitTraitMap,
  type MeebitTraitsDataset,
} from '../data/meebitTraits'
import { CREATOR_MEEBIT_ID } from '../game/gameConfig'

export const DAILY_VISITOR_COUNT = 30
export const DAILY_MATCHED_VISITOR_COUNT = 15
export const MEEBIT_ID_MAX = 20000

const STORAGE_KEY = 'meebits-park-daily-v6'

/** 噴水の右前・正面向きの主役説明看板（見た目・当たり判定で共有）。 */
export const FEATURED_BOARD_POSITION: [number, number, number] = [2.85, 0, 6.75]

/** 噴水・銅像の中心 Z（看板・衝突と共有）。 */
export const FOUNTAIN_CENTER_Z = 5.0

export type DailyThemeTrait = {
  traitType: string
  traitValue: string
}

export type DailyVisitor = {
  meebitNumber: number
  matched: boolean
}

export type DailyParkLineup = {
  dateKey: string
  featuredId: number
  featuredTraits: MeebitTraitMap
  /** 本日のマッチ枠の基準になるトレイト1つ。 */
  themeTrait: DailyThemeTrait
  visitors: DailyVisitor[]
}

type StoredDailyLineup = {
  dateKey: string
  featuredId: number
  themeTrait: DailyThemeTrait
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

export function hasThemeTrait(traits: MeebitTraitMap | null | undefined, theme: DailyThemeTrait) {
  if (!traits) return false
  return traits[theme.traitType] === theme.traitValue
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
    if (id === CREATOR_MEEBIT_ID) continue
    if (getMeebitTraitsFromDataset(dataset, id)) return id
  }

  const ids = Object.keys(dataset.byId)
    .map(Number)
    .filter(
      (id) =>
        Number.isFinite(id) && id >= 1 && id <= MEEBIT_ID_MAX && id !== CREATOR_MEEBIT_ID,
    )
    .sort((a, b) => a - b)
  if (ids.length === 0) {
    throw new Error('[dailyFeatured] traits dataset has no valid meebit ids')
  }
  return ids[Math.floor(rng() * ids.length)] ?? ids[0]
}

/** 「本日の共通点」に選ばないトレイト種別 */
const THEME_TRAIT_EXCLUDED_TYPES = new Set(['Hair Style'])

/**
 * 主役のトレイトから「本日の共通点」を1つ選ぶ。
 * マッチ枠を満たせる候補を優先し、その中では出現数が少ない（特徴的な）トレイトを好む。
 */
function pickThemeTrait(
  featuredTraits: MeebitTraitMap,
  featuredId: number,
  dataset: MeebitTraitsDataset,
  rng: () => number,
): DailyThemeTrait {
  const allEntries = Object.entries(featuredTraits)
  const entries = allEntries.filter(([traitType]) => !THEME_TRAIT_EXCLUDED_TYPES.has(traitType))
  if (entries.length === 0) {
    throw new Error(
      `[dailyFeatured] featured #${featuredId} has no eligible theme traits (excluded Hair Style)`,
    )
  }

  // 1パスで各候補トレイトの他 Meebit 数を集計
  const counts = new Map<string, number>()
  for (const [traitType, traitValue] of entries) {
    counts.set(`${traitType}::${traitValue}`, 0)
  }
  for (const key of Object.keys(dataset.byId)) {
    const id = Number(key)
    if (!Number.isFinite(id) || id === featuredId) continue
    const traits = dataset.byId[key]
    if (!traits) continue
    for (const [traitType, traitValue] of entries) {
      if (traits[traitType] === traitValue) {
        const mapKey = `${traitType}::${traitValue}`
        counts.set(mapKey, (counts.get(mapKey) ?? 0) + 1)
      }
    }
  }

  const neededOthers = DAILY_MATCHED_VISITOR_COUNT - 1
  const scored = entries.map(([traitType, traitValue]) => ({
    theme: { traitType, traitValue },
    others: counts.get(`${traitType}::${traitValue}`) ?? 0,
  }))

  // シードで並べ替えてから、充足 → 希少さの順で安定ソート
  shuffleInPlace(scored, rng)
  scored.sort((a, b) => {
    const aOk = a.others >= neededOthers ? 0 : 1
    const bOk = b.others >= neededOthers ? 0 : 1
    if (aOk !== bOk) return aOk - bOk
    if (a.others !== b.others) return a.others - b.others
    return 0
  })

  return scored[0]?.theme ?? { traitType: entries[0][0], traitValue: entries[0][1] }
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

  const themeTrait = pickThemeTrait(featuredTraits, featuredId, dataset, rng)

  const matchedIds: number[] = []
  const allOtherIds: number[] = []

  for (const key of Object.keys(dataset.byId)) {
    const id = Number(key)
    if (!Number.isFinite(id) || id === featuredId || id === CREATOR_MEEBIT_ID) continue
    const traits = dataset.byId[key]
    if (!traits) continue
    allOtherIds.push(id)
    if (hasThemeTrait(traits, themeTrait)) {
      matchedIds.push(id)
    }
  }

  shuffleInPlace(matchedIds, rng)

  const visitors: DailyVisitor[] = []
  const used = new Set<number>()

  // 来場者の1体は必ず主役本人
  visitors.push({ meebitNumber: featuredId, matched: true })
  used.add(featuredId)

  // 同じ themeTrait を持つ Meebit でマッチ枠を埋める
  for (const id of matchedIds) {
    if (visitors.filter((v) => v.matched).length >= DAILY_MATCHED_VISITOR_COUNT) break
    if (used.has(id)) continue
    used.add(id)
    visitors.push({ meebitNumber: id, matched: true })
  }

  // 残りは未選定プールからの完全ランダム
  const randomPool = allOtherIds.filter((id) => !used.has(id))
  shuffleInPlace(randomPool, rng)
  for (const id of randomPool) {
    if (visitors.length >= DAILY_VISITOR_COUNT) break
    used.add(id)
    const traits = dataset.byId[String(id)]
    visitors.push({
      meebitNumber: id,
      matched: hasThemeTrait(traits, themeTrait),
    })
  }

  shuffleInPlace(visitors, rng)

  return {
    dateKey,
    featuredId,
    featuredTraits,
    themeTrait,
    visitors,
  }
}

function isValidThemeTrait(value: unknown): value is DailyThemeTrait {
  if (!value || typeof value !== 'object') return false
  const theme = value as DailyThemeTrait
  return typeof theme.traitType === 'string' && typeof theme.traitValue === 'string'
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
      !isValidThemeTrait(parsed.themeTrait) ||
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
      themeTrait: lineup.themeTrait,
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
  if (!hasThemeTrait(featuredTraits, stored.themeTrait)) return null
  return {
    dateKey: stored.dateKey,
    featuredId: stored.featuredId,
    featuredTraits,
    themeTrait: stored.themeTrait,
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
