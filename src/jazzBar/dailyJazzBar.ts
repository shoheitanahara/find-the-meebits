/**
 * Jazz Bar の日替わり客席。約55%をランダム Meebit で埋める。
 * 約半数がスーツ。上裸・チューブトップは入れない。
 */

import {
  loadMeebitTraitsDataset,
  type MeebitTraitsDataset,
} from '../data/meebitTraits'
import { CREATOR_MEEBIT_ID } from '../game/gameConfig'
import {
  createSeededRng,
  getUtcDateKey,
  hashStringToSeed,
  isCultureSuitShirt,
  isSeaBeachShirt,
  MEEBIT_ID_MAX,
} from '../top/dailyFeatured'
import {
  getOccupiedSeatIndices,
  pickDailyEmptySeatIndices,
} from './jazzBarSeats'

export type DailyJazzBarShow = {
  dateKey: string
  audienceIds: number[]
  emptySeatIndices: number[]
}

let memoryCache: DailyJazzBarShow | null = null
let loadPromise: Promise<DailyJazzBarShow> | null = null

export async function getDailyJazzBarShow(): Promise<DailyJazzBarShow> {
  const dateKey = getUtcDateKey()
  if (memoryCache?.dateKey === dateKey) return memoryCache
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const dataset = await loadMeebitTraitsDataset()
    if (!dataset) {
      throw new Error('[dailyJazzBar] failed to load meebit traits')
    }
    const show = buildJazzBarShow(dataset, dateKey)
    memoryCache = show
    return show
  })().finally(() => {
    loadPromise = null
  })

  return loadPromise
}

function buildJazzBarShow(dataset: MeebitTraitsDataset, dateKey: string): DailyJazzBarShow {
  const rng = createSeededRng(hashStringToSeed(`meebits-jazz-bar-audience:${dateKey}`))
  const seatRng = createSeededRng(hashStringToSeed(`meebits-jazz-bar-seats:${dateKey}`))
  const emptySeatIndices = pickDailyEmptySeatIndices(seatRng)
  const occupiedCount = getOccupiedSeatIndices(emptySeatIndices).length
  const audienceIds = pickGuestIds(dataset, rng, occupiedCount)

  return { dateKey, audienceIds, emptySeatIndices }
}

/** バー客のスーツ比率（Culture と同程度） */
const JAZZ_BAR_SUIT_MIN_RATIO = 0.5

function shuffleInPlace(ids: number[], rng: () => number) {
  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = ids[i]
    ids[i] = ids[j]
    ids[j] = tmp
  }
}

function pickGuestIds(dataset: MeebitTraitsDataset, rng: () => number, count: number): number[] {
  const suitPool: number[] = []
  const otherPool: number[] = []

  for (const idText of Object.keys(dataset.byId)) {
    const id = Number(idText)
    if (!Number.isFinite(id) || id < 1 || id > MEEBIT_ID_MAX || id === CREATOR_MEEBIT_ID) continue
    const traits = dataset.byId[idText]
    // 上裸・チューブトップ・No Shirt はバーに入れない
    if (isSeaBeachShirt(traits)) continue
    if (isCultureSuitShirt(traits)) suitPool.push(id)
    else otherPool.push(id)
  }

  shuffleInPlace(suitPool, rng)
  shuffleInPlace(otherPool, rng)

  const targetSuit = Math.min(suitPool.length, Math.ceil(count * JAZZ_BAR_SUIT_MIN_RATIO))
  const picked: number[] = suitPool.slice(0, targetSuit)
  const fillPool = [...otherPool, ...suitPool.slice(targetSuit)]
  for (const id of fillPool) {
    if (picked.length >= count) break
    picked.push(id)
  }

  shuffleInPlace(picked, rng)
  return picked
}
