/**
 * ランウェイ専用の「本日のルック」。
 * 衣装カラー（Shirt/Pants/Shoes 等）を横断して同じ色ならマッチ。
 * パークの themeTrait とは別シード。
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
  getUtcDateKey,
  hashStringToSeed,
  MEEBIT_ID_MAX,
  type DailyThemeTrait,
} from '../top/dailyFeatured'

import {
  getOccupiedSeatIndices,
  pickDailyEmptySeatIndices,
} from './runwaySeats'

const MIN_MATCHING = 24
/** 全席数に合わせ、空席分だけ観客を減らす */
const ROAMER_COUNT = 0

/** ファッションカラーとして横断マッチするトレイト種別（靴・メガネは対象外） */
export const RUNWAY_COLOR_TRAIT_TYPES = [
  'Shirt Color',
  'Pants Color',
  'Overshirt Color',
  'Hat Color',
] as const

const EXCLUDED_VALUES = new Set(['Leopard Print'])

/** UI 用の仮想トレイト種別（実際の Meebit 属性名ではない） */
export const RUNWAY_COLOR_THEME_TYPE = 'Color'

export type DailyRunwayShow = {
  dateKey: string
  themeTrait: DailyThemeTrait
  matchingIds: number[]
  audienceIds: number[]
  /** プレイヤーが座れる日替わり空席（座席 index） */
  emptySeatIndices: number[]
  roamerIds: number[]
}

let memoryCache: DailyRunwayShow | null = null
let loadPromise: Promise<DailyRunwayShow> | null = null

export async function getDailyRunwayShow(): Promise<DailyRunwayShow> {
  const dateKey = getUtcDateKey()
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
  const rng = createSeededRng(hashStringToSeed(`meebits-runway-color:${dateKey}`))
  const seatRng = createSeededRng(hashStringToSeed(`meebits-runway-seats:${dateKey}`))
  const themeTrait = pickRunwayColorTheme(dataset, rng)
  const matchingIds = collectMatchingIds(dataset, themeTrait.traitValue)
  const emptySeatIndices = pickDailyEmptySeatIndices(seatRng)
  const occupiedCount = getOccupiedSeatIndices(emptySeatIndices).length
  const audienceIds = pickGuestIds(dataset, matchingIds, rng, occupiedCount)
  const used = new Set([...matchingIds, ...audienceIds])
  const roamerIds = pickGuestIds(dataset, [...used], rng, ROAMER_COUNT)

  return { dateKey, themeTrait, matchingIds, audienceIds, emptySeatIndices, roamerIds }
}

/** いずれかの衣装カラーが themeColor と一致するか */
export function meebitHasRunwayColor(traits: MeebitTraitMap, themeColor: string): boolean {
  return RUNWAY_COLOR_TRAIT_TYPES.some((type) => traits[type] === themeColor)
}

function pickRunwayColorTheme(
  dataset: MeebitTraitsDataset,
  rng: () => number,
): DailyThemeTrait {
  const counts = new Map<string, number>()

  for (const traits of Object.values(dataset.byId)) {
    const colorsOnMeebit = new Set<string>()
    for (const type of RUNWAY_COLOR_TRAIT_TYPES) {
      const value = traits[type]
      if (!value || EXCLUDED_VALUES.has(value)) continue
      colorsOnMeebit.add(value)
    }
    for (const color of colorsOnMeebit) {
      counts.set(color, (counts.get(color) ?? 0) + 1)
    }
  }

  const candidates = [...counts.entries()]
    .filter(([, count]) => count >= MIN_MATCHING)
    .map(([traitValue, count]) => ({ traitValue, count }))

  if (candidates.length === 0) {
    return { traitType: RUNWAY_COLOR_THEME_TYPE, traitValue: 'Red' }
  }

  // 希少寄りに少し寄せつつ、毎日バラけるよう重み付け
  const weights = candidates.map((c) => 1 / Math.sqrt(c.count))
  const total = weights.reduce((sum, w) => sum + w, 0)
  let roll = rng() * total
  for (let i = 0; i < candidates.length; i += 1) {
    roll -= weights[i]
    if (roll <= 0) {
      return { traitType: RUNWAY_COLOR_THEME_TYPE, traitValue: candidates[i].traitValue }
    }
  }

  const fallback = candidates[candidates.length - 1]
  return { traitType: RUNWAY_COLOR_THEME_TYPE, traitValue: fallback.traitValue }
}

function collectMatchingIds(dataset: MeebitTraitsDataset, themeColor: string): number[] {
  const ids: number[] = []
  for (const [idText, traits] of Object.entries(dataset.byId)) {
    const id = Number(idText)
    if (!Number.isFinite(id) || id < 1 || id > MEEBIT_ID_MAX || id === CREATOR_MEEBIT_ID) {
      continue
    }
    if (meebitHasRunwayColor(traits, themeColor)) {
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

/** 画面表示用（例: Color · Red / カラー · Red） */
export function formatRunwayThemeLabel(
  themeTrait: DailyThemeTrait,
  locale: 'en' | 'ja',
): string {
  const typeLabel =
    themeTrait.traitType === RUNWAY_COLOR_THEME_TYPE
      ? locale === 'ja'
        ? 'カラー'
        : 'Color'
      : themeTrait.traitType
  return `${typeLabel} · ${themeTrait.traitValue}`
}
