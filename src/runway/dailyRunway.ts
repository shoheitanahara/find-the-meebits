/**
 * ランウェイ専用の「本日のトレイト」。
 * パークの themeTrait とは別シードで決定する。
 */

import {
  getCachedMeebitTraits,
  loadMeebitTraitsDataset,
  type MeebitTraitMap,
  type MeebitTraitsDataset,
} from '../data/meebitTraits'
import { CREATOR_MEEBIT_ID } from '../game/gameConfig'
import {
  createSeededRng,
  getJstDateKey,
  hashStringToSeed,
  MEEBIT_ID_MAX,
  type DailyThemeTrait,
} from '../top/dailyFeatured'

const MIN_MATCHING = 24
const AUDIENCE_COUNT = 32
const ROAMER_COUNT = 0

/** ファッション寄りのトレイト種別を優先 */
const FASHION_TRAIT_TYPES = [
  'Shirt',
  'Pants',
  'Overshirt',
  'Hat',
  'Shoes',
  'Glasses',
  'Earrings',
  'Necklace',
  'Bracelet',
  'Hair Color',
  'Outfit Type',
] as const

const EXCLUDED_VALUES = new Set(['Leopard Print'])

export type DailyRunwayShow = {
  dateKey: string
  themeTrait: DailyThemeTrait
  matchingIds: number[]
  audienceIds: number[]
  roamerIds: number[]
}

let memoryCache: DailyRunwayShow | null = null
let loadPromise: Promise<DailyRunwayShow> | null = null

export async function getDailyRunwayShow(): Promise<DailyRunwayShow> {
  const dateKey = getJstDateKey()
  if (memoryCache?.dateKey === dateKey) return memoryCache
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const dataset = await loadMeebitTraitsDataset()
    if (!dataset) {
      throw new Error('[dailyRunway] failed to load meebit traits')
    }
    const show = buildRunwayShow(dataset, dateKey)
    memoryCache = show
    return show
  })().finally(() => {
    loadPromise = null
  })

  return loadPromise
}

function buildRunwayShow(dataset: MeebitTraitsDataset, dateKey: string): DailyRunwayShow {
  const rng = createSeededRng(hashStringToSeed(`meebits-runway:${dateKey}`))
  const themeTrait = pickRunwayThemeTrait(dataset, rng)
  const matchingIds = collectMatchingIds(dataset, themeTrait)
  const audienceIds = pickGuestIds(dataset, matchingIds, rng, AUDIENCE_COUNT)
  const used = new Set([...matchingIds, ...audienceIds])
  const roamerIds = pickGuestIds(dataset, [...used], rng, ROAMER_COUNT)

  return { dateKey, themeTrait, matchingIds, audienceIds, roamerIds }
}

function pickRunwayThemeTrait(
  dataset: MeebitTraitsDataset,
  rng: () => number,
): DailyThemeTrait {
  type Candidate = DailyThemeTrait & { count: number; fashionBoost: number }
  const counts = new Map<string, number>()

  for (const traits of Object.values(dataset.byId)) {
    for (const [traitType, traitValue] of Object.entries(traits)) {
      if (EXCLUDED_VALUES.has(traitValue)) continue
      const key = `${traitType}::${traitValue}`
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  const candidates: Candidate[] = []
  for (const [key, count] of counts) {
    if (count < MIN_MATCHING) continue
    const [traitType, traitValue] = key.split('::')
    if (!traitType || !traitValue) continue
    const fashionIndex = (FASHION_TRAIT_TYPES as readonly string[]).indexOf(traitType)
    candidates.push({
      traitType,
      traitValue,
      count,
      fashionBoost: fashionIndex >= 0 ? 1.4 - fashionIndex * 0.04 : 0.35,
    })
  }

  if (candidates.length === 0) {
    return { traitType: 'Shirt', traitValue: 'Suit' }
  }

  const weights = candidates.map((c) => (1 / Math.sqrt(c.count)) * c.fashionBoost)
  const total = weights.reduce((sum, w) => sum + w, 0)
  let roll = rng() * total
  for (let i = 0; i < candidates.length; i += 1) {
    roll -= weights[i]
    if (roll <= 0) {
      const picked = candidates[i]
      return { traitType: picked.traitType, traitValue: picked.traitValue }
    }
  }

  const fallback = candidates[candidates.length - 1]
  return { traitType: fallback.traitType, traitValue: fallback.traitValue }
}

function collectMatchingIds(dataset: MeebitTraitsDataset, theme: DailyThemeTrait): number[] {
  const ids: number[] = []
  for (const [idText, traits] of Object.entries(dataset.byId)) {
    const id = Number(idText)
    if (!Number.isFinite(id) || id < 1 || id > MEEBIT_ID_MAX || id === CREATOR_MEEBIT_ID) {
      continue
    }
    if (traits[theme.traitType] === theme.traitValue) {
      ids.push(id)
    }
  }
  return ids
}

function pickGuestIds(
  dataset: MeebitTraitsDataset,
  excludeIds: number[],
  rng: () => number,
  count: number,
): number[] {
  const excluded = new Set(excludeIds)
  const pool: number[] = []
  for (const idText of Object.keys(dataset.byId)) {
    const id = Number(idText)
    if (!Number.isFinite(id) || id === CREATOR_MEEBIT_ID || excluded.has(id)) continue
    if (dataset.byId[idText]) pool.push(id)
  }

  const source = pool.length >= count ? pool : [...pool, ...excludeIds.filter((id) => id !== CREATOR_MEEBIT_ID)]
  for (let i = source.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = source[i]
    source[i] = source[j]
    source[j] = tmp
  }
  return source.slice(0, count)
}

export function getRunwayModelTraits(meebitNumber: number): MeebitTraitMap | null {
  return getCachedMeebitTraits(meebitNumber)
}
