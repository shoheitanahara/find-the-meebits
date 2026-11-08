/**
 * ポッドキャストスタジオの日替わり客席。約60%をランダム Meebit で埋める。
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
} from './podcastSeats'

export type DailyPodcastShow = {
  dateKey: string
  audienceIds: number[]
  emptySeatIndices: number[]
}

let memoryCache: DailyPodcastShow | null = null
let loadPromise: Promise<DailyPodcastShow> | null = null

export async function getDailyPodcastShow(): Promise<DailyPodcastShow> {
  const dateKey = getUtcDateKey()
  if (memoryCache?.dateKey === dateKey) return memoryCache
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const dataset = await loadMeebitTraitsDataset()
    if (!dataset) {
      throw new Error('[dailyPodcast] failed to load meebit traits')
    }
    const show = buildPodcastShow(dataset, dateKey)
    memoryCache = show
    return show
  })().finally(() => {
    loadPromise = null
  })

  return loadPromise
}

function buildPodcastShow(dataset: MeebitTraitsDataset, dateKey: string): DailyPodcastShow {
  const rng = createSeededRng(hashStringToSeed(`meebits-podcast-audience:${dateKey}`))
  const seatRng = createSeededRng(hashStringToSeed(`meebits-podcast-seats:${dateKey}`))
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
