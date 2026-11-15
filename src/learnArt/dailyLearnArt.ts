/**
 * 映画館の日替わり客席。約60%をランダム Meebit で埋める。
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
  MEEBIT_ID_MAX,
} from '../top/dailyFeatured'
import {
  getOccupiedSeatIndices,
  pickDailyEmptySeatIndices,
} from './learnArtSeats'

export type DailyLearnArtShow = {
  dateKey: string
  audienceIds: number[]
  emptySeatIndices: number[]
}

let memoryCache: DailyLearnArtShow | null = null
let loadPromise: Promise<DailyLearnArtShow> | null = null

export async function getDailyLearnArtShow(): Promise<DailyLearnArtShow> {
  const dateKey = getUtcDateKey()
  if (memoryCache?.dateKey === dateKey) return memoryCache
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const dataset = await loadMeebitTraitsDataset()
    if (!dataset) {
      throw new Error('[dailyLearnArt] failed to load meebit traits')
    }
    const show = buildLearnArtShow(dataset, dateKey)
    memoryCache = show
    return show
  })().finally(() => {
    loadPromise = null
  })

  return loadPromise
}

function buildLearnArtShow(dataset: MeebitTraitsDataset, dateKey: string): DailyLearnArtShow {
  const rng = createSeededRng(hashStringToSeed(`meebits-learn-art-audience:${dateKey}`))
  const seatRng = createSeededRng(hashStringToSeed(`meebits-learn-art-seats:${dateKey}`))
  const emptySeatIndices = pickDailyEmptySeatIndices(seatRng)
  const occupiedCount = getOccupiedSeatIndices(emptySeatIndices).length
  const audienceIds = pickGuestIds(dataset, rng, occupiedCount)

  return { dateKey, audienceIds, emptySeatIndices }
}

function pickGuestIds(dataset: MeebitTraitsDataset, rng: () => number, count: number): number[] {
  const pool: number[] = []
  for (const idText of Object.keys(dataset.byId)) {
    const id = Number(idText)
    if (!Number.isFinite(id) || id < 1 || id > MEEBIT_ID_MAX || id === CREATOR_MEEBIT_ID) continue
    pool.push(id)
  }

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = pool[i]
    pool[i] = pool[j]
    pool[j] = tmp
  }
  return pool.slice(0, count)
}
