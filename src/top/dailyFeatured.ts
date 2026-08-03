/**
 * 日付（UTC）シードで「本日の主役」と来場者を決定的に選ぶ。
 * 誰がアクセスしても同日は同じラインナップになる。
 *
 * 広場: マッチ枠15体 + ランダム5体（計20）
 * マウンテン地区: ランダム15体（広場と重複しない）
 * シーエリア: 15体（全員が上裸 / チューブトップ）
 * カルチャー地区: 15体（スーツが半数）
 * アストロエリア: 15体（Robot / Visitor が約半数、残りは他 Type）
 */

import {
  getMeebitTraitsFromDataset,
  loadMeebitTraitsDataset,
  type MeebitTraitMap,
  type MeebitTraitsDataset,
} from '../data/meebitTraits'
import { CREATOR_MEEBIT_ID } from '../game/gameConfig'

export const DAILY_VISITOR_COUNT = 20
export const DAILY_MATCHED_VISITOR_COUNT = 15
export const DAILY_MOUNTAIN_VISITOR_COUNT = 15
export const DAILY_SEA_VISITOR_COUNT = 15
export const DAILY_CULTURE_VISITOR_COUNT = 15
export const DAILY_ASTRO_VISITOR_COUNT = 15
/** 15体中8体をRobot / Visitorにする（奇数なので半数切り上げ）。 */
export const DAILY_ASTRO_TYPE_COUNT = Math.ceil(DAILY_ASTRO_VISITOR_COUNT / 2)
/** シー来場者は全員ビーチ服 */
export const SEA_BEACH_SHIRT_MIN_RATIO = 1
/** カルチャー来場者のうちスーツを最低この割合にする */
export const CULTURE_SUIT_MIN_RATIO = 0.5
export const MEEBIT_ID_MAX = 20000

const STORAGE_KEY = 'meebits-park-daily-v12'

/** ビーチらしい上半身（上裸・チューブトップ） */
const SEA_BEACH_SHIRTS = new Set(['Bare Chest', 'Tube Top', 'No Shirt'])
/** カルチャー向けスーツ */
const CULTURE_SUIT_SHIRTS = new Set(['Suit', 'Suit Jacket'])

/** 噴水の右前・正面向きの主役説明看板（見た目・当たり判定で共有）。 */
export const FEATURED_BOARD_POSITION: [number, number, number] = [2.85, 0, 6.15]

/** 噴水・銅像の中心 Z（看板・衝突と共有）。 */
export const FOUNTAIN_CENTER_Z = 4.4

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
  /** マウンテン地区の日替わり来場者（ランダム・広場と非重複）。 */
  mountainVisitors: DailyVisitor[]
  /** シーエリアの日替わり来場者（全員ビーチ服・他地区と非重複）。 */
  seaVisitors: DailyVisitor[]
  /** カルチャー地区の日替わり来場者（スーツ半数・他地区と非重複）。 */
  cultureVisitors: DailyVisitor[]
  /** アストロエリアの日替わり来場者（Robot / Visitor 約半数＋他Type）。 */
  astroVisitors: DailyVisitor[]
}

type StoredDailyLineup = {
  dateKey: string
  featuredId: number
  themeTrait: DailyThemeTrait
  visitors: DailyVisitor[]
  mountainVisitors: DailyVisitor[]
  seaVisitors: DailyVisitor[]
  cultureVisitors: DailyVisitor[]
  astroVisitors: DailyVisitor[]
}

let memoryCache: DailyParkLineup | null = null
let loadPromise: Promise<DailyParkLineup> | null = null

/** UTC の YYYY-MM-DD。日替わり境界は協定世界時 0:00。 */
export function getUtcDateKey(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

/** @deprecated 互換用。`getUtcDateKey` を使うこと。 */
export const getJstDateKey = getUtcDateKey

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

export function isSeaBeachShirt(traits: MeebitTraitMap | null | undefined) {
  const shirt = traits?.Shirt
  return typeof shirt === 'string' && SEA_BEACH_SHIRTS.has(shirt)
}

export function isCultureSuitShirt(traits: MeebitTraitMap | null | undefined) {
  const shirt = traits?.Shirt
  return typeof shirt === 'string' && CULTURE_SUIT_SHIRTS.has(shirt)
}

/** Astro 地区で優先する Type。 */
export function isAstroMeebitType(traits: MeebitTraitMap | null | undefined) {
  const type = traits?.Type
  return type === 'Robot' || type === 'Visitor'
}

/**
 * 指定トレイトを minRatio 以上確保して来場者を抽選。
 * 足りない場合のみ非該当で埋める。
 */
function pickShirtBiasedVisitors(
  dataset: MeebitTraitsDataset,
  availableIds: number[],
  rng: () => number,
  count: number,
  isPreferred: (traits: MeebitTraitMap | null | undefined) => boolean,
  minRatio: number,
): DailyVisitor[] {
  const preferredPool: number[] = []
  const otherPool: number[] = []
  for (const id of availableIds) {
    const traits = dataset.byId[String(id)]
    if (isPreferred(traits)) preferredPool.push(id)
    else otherPool.push(id)
  }
  shuffleInPlace(preferredPool, rng)
  shuffleInPlace(otherPool, rng)

  const targetPreferred = Math.min(preferredPool.length, Math.ceil(count * minRatio))
  const picked: number[] = []
  for (const id of preferredPool) {
    if (picked.length >= targetPreferred) break
    picked.push(id)
  }
  // minRatio < 1 のとき残りは preferred 余り → other の順。minRatio = 1 なら preferred のみ優先
  const fillPool =
    minRatio >= 1
      ? [...preferredPool.slice(picked.length), ...otherPool]
      : [...otherPool, ...preferredPool.slice(picked.length)]
  for (const id of fillPool) {
    if (picked.length >= count) break
    picked.push(id)
  }
  shuffleInPlace(picked, rng)
  return picked.map((meebitNumber) => ({ meebitNumber, matched: false }))
}

function pickSeaVisitors(
  dataset: MeebitTraitsDataset,
  availableIds: number[],
  rng: () => number,
): DailyVisitor[] {
  return pickShirtBiasedVisitors(
    dataset,
    availableIds,
    rng,
    DAILY_SEA_VISITOR_COUNT,
    isSeaBeachShirt,
    SEA_BEACH_SHIRT_MIN_RATIO,
  )
}

function pickCultureVisitors(
  dataset: MeebitTraitsDataset,
  availableIds: number[],
  rng: () => number,
): DailyVisitor[] {
  return pickShirtBiasedVisitors(
    dataset,
    availableIds,
    rng,
    DAILY_CULTURE_VISITOR_COUNT,
    isCultureSuitShirt,
    CULTURE_SUIT_MIN_RATIO,
  )
}

/**
 * Astro: Robot / Visitor を半数（15体中8体）、残りを他 Type から抽選する。
 * 他地区未使用プールを優先し、足りないカテゴリだけ全域から補完する。
 */
function pickAstroVisitors(
  dataset: MeebitTraitsDataset,
  preferredIds: number[],
  allIds: number[],
  rng: () => number,
): DailyVisitor[] {
  const preferredAstro = preferredIds.filter((id) =>
    isAstroMeebitType(dataset.byId[String(id)]),
  )
  const preferredOther = preferredIds.filter(
    (id) => !isAstroMeebitType(dataset.byId[String(id)]),
  )
  shuffleInPlace(preferredAstro, rng)
  shuffleInPlace(preferredOther, rng)

  const picked: number[] = []
  const used = new Set<number>()

  for (const id of preferredAstro) {
    if (picked.length >= DAILY_ASTRO_TYPE_COUNT) break
    picked.push(id)
    used.add(id)
  }

  if (picked.length < DAILY_ASTRO_TYPE_COUNT) {
    const fallback = allIds.filter(
      (id) => !used.has(id) && isAstroMeebitType(dataset.byId[String(id)]),
    )
    shuffleInPlace(fallback, rng)
    for (const id of fallback) {
      if (picked.length >= DAILY_ASTRO_TYPE_COUNT) break
      picked.push(id)
      used.add(id)
    }
  }

  for (const id of preferredOther) {
    if (picked.length >= DAILY_ASTRO_VISITOR_COUNT) break
    picked.push(id)
    used.add(id)
  }

  if (picked.length < DAILY_ASTRO_VISITOR_COUNT) {
    const fallback = allIds.filter(
      (id) => !used.has(id) && !isAstroMeebitType(dataset.byId[String(id)]),
    )
    shuffleInPlace(fallback, rng)
    for (const id of fallback) {
      if (picked.length >= DAILY_ASTRO_VISITOR_COUNT) break
      picked.push(id)
      used.add(id)
    }
  }

  shuffleInPlace(picked, rng)
  return picked.map((meebitNumber) => ({ meebitNumber, matched: false }))
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
/** 「本日の共通点」に選ばないトレイト値（VRM 表示バグなど） */
const THEME_TRAIT_EXCLUDED_VALUES = new Set(['Leopard Print'])

function isThemeTraitEligible(traitType: string, traitValue: string) {
  return !THEME_TRAIT_EXCLUDED_TYPES.has(traitType) && !THEME_TRAIT_EXCLUDED_VALUES.has(traitValue)
}

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
  const entries = allEntries.filter(([traitType, traitValue]) =>
    isThemeTraitEligible(traitType, traitValue),
  )
  if (entries.length === 0) {
    throw new Error(
      `[dailyFeatured] featured #${featuredId} has no eligible theme traits (excluded Hair Style / Leopard Print)`,
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

  // マウンテン地区: 広場未使用プールから日替わり15体
  const mountainRng = createSeededRng(hashStringToSeed(`meebits-park-mountain:${dateKey}`))
  const mountainPool = allOtherIds.filter((id) => !used.has(id))
  shuffleInPlace(mountainPool, mountainRng)
  const mountainVisitors: DailyVisitor[] = []
  for (const id of mountainPool) {
    if (mountainVisitors.length >= DAILY_MOUNTAIN_VISITOR_COUNT) break
    used.add(id)
    mountainVisitors.push({ meebitNumber: id, matched: false })
  }

  // シーエリア: 全員ビーチ服（上裸・チューブトップ）
  const seaRng = createSeededRng(hashStringToSeed(`meebits-park-sea:${dateKey}`))
  const seaPool = allOtherIds.filter((id) => !used.has(id))
  const seaVisitors = pickSeaVisitors(dataset, seaPool, seaRng)
  for (const visitor of seaVisitors) used.add(visitor.meebitNumber)

  // カルチャー地区: スーツ半数
  const cultureRng = createSeededRng(hashStringToSeed(`meebits-park-culture:${dateKey}`))
  const culturePool = allOtherIds.filter((id) => !used.has(id))
  const cultureVisitors = pickCultureVisitors(dataset, culturePool, cultureRng)
  for (const visitor of cultureVisitors) used.add(visitor.meebitNumber)

  // アストロエリア: Robot / Visitor 約半数＋他 Type
  const astroRng = createSeededRng(hashStringToSeed(`meebits-park-astro:${dateKey}`))
  const astroPreferred = allOtherIds.filter((id) => !used.has(id))
  const astroVisitors = pickAstroVisitors(dataset, astroPreferred, allOtherIds, astroRng)
  for (const visitor of astroVisitors) used.add(visitor.meebitNumber)

  return {
    dateKey,
    featuredId,
    featuredTraits,
    themeTrait,
    visitors,
    mountainVisitors,
    seaVisitors,
    cultureVisitors,
    astroVisitors,
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
      !Array.isArray(parsed.mountainVisitors) ||
      parsed.mountainVisitors.length !== DAILY_MOUNTAIN_VISITOR_COUNT ||
      !Array.isArray(parsed.seaVisitors) ||
      parsed.seaVisitors.length !== DAILY_SEA_VISITOR_COUNT ||
      !Array.isArray(parsed.cultureVisitors) ||
      parsed.cultureVisitors.length !== DAILY_CULTURE_VISITOR_COUNT ||
      !Array.isArray(parsed.astroVisitors) ||
      parsed.astroVisitors.length !== DAILY_ASTRO_VISITOR_COUNT ||
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
      mountainVisitors: lineup.mountainVisitors,
      seaVisitors: lineup.seaVisitors,
      cultureVisitors: lineup.cultureVisitors,
      astroVisitors: lineup.astroVisitors,
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
  // 除外ルール追加後のキャッシュを破棄して再抽選
  if (!isThemeTraitEligible(stored.themeTrait.traitType, stored.themeTrait.traitValue)) {
    return null
  }
  return {
    dateKey: stored.dateKey,
    featuredId: stored.featuredId,
    featuredTraits,
    themeTrait: stored.themeTrait,
    visitors: stored.visitors,
    mountainVisitors: stored.mountainVisitors,
    seaVisitors: stored.seaVisitors,
    cultureVisitors: stored.cultureVisitors,
    astroVisitors: stored.astroVisitors,
  }
}

/**
 * 本日のパークラインナップを返す。
 * メモリ → sessionStorage → 日付シード再計算の順。
 */
export async function getDailyParkLineup(now = new Date()): Promise<DailyParkLineup> {
  const dateKey = getUtcDateKey(now)

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
