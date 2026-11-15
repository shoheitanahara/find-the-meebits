/**
 * Hip Hop Club の日替わりダンサー ID。人数は Podcast と同じロジック。
 * 位置は入場時に createClubNpcSpawns でランダム配置する。
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
  isMusicArtNecklace,
  MEEBIT_ID_MAX,
} from '../top/dailyFeatured'
import { pickDailyNpcCount } from './clubDancers'

export type DailyClubShow = {
  dateKey: string
  audienceIds: number[]
}

let memoryCache: DailyClubShow | null = null
let loadPromise: Promise<DailyClubShow> | null = null

export async function getDailyClubShow(): Promise<DailyClubShow> {
  const dateKey = getUtcDateKey()
  if (memoryCache?.dateKey === dateKey) return memoryCache
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const dataset = await loadMeebitTraitsDataset()
    if (!dataset) {
      throw new Error('[dailyClub] failed to load meebit traits')
    }
    const show = buildClubShow(dataset, dateKey)
    memoryCache = show
    return show
  })().finally(() => {
    loadPromise = null
  })

  return loadPromise
}

function buildClubShow(dataset: MeebitTraitsDataset, dateKey: string): DailyClubShow {
  const rng = createSeededRng(hashStringToSeed(`meebits-hiphop-dancers:${dateKey}`))
  const countRng = createSeededRng(hashStringToSeed(`meebits-hiphop-count:${dateKey}`))
  const count = pickDailyNpcCount(countRng)
  const audienceIds = pickGuestIds(dataset, rng, count)

  return { dateKey, audienceIds }
}

/** クラブ内もパークと同様、約半数がネックレス */
const CLUB_NECKLACE_MIN_RATIO = 0.5

function pickGuestIds(dataset: MeebitTraitsDataset, rng: () => number, count: number): number[] {
  const necklacePool: number[] = []
  const otherPool: number[] = []
  for (const idText of Object.keys(dataset.byId)) {
    const id = Number(idText)
    if (!Number.isFinite(id) || id < 1 || id > MEEBIT_ID_MAX || id === CREATOR_MEEBIT_ID) continue
    if (isMusicArtNecklace(dataset.byId[idText])) necklacePool.push(id)
    else otherPool.push(id)
  }

  for (let i = necklacePool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = necklacePool[i]
    necklacePool[i] = necklacePool[j]
    necklacePool[j] = tmp
  }
  for (let i = otherPool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = otherPool[i]
    otherPool[i] = otherPool[j]
    otherPool[j] = tmp
  }

  const targetNecklace = Math.min(necklacePool.length, Math.ceil(count * CLUB_NECKLACE_MIN_RATIO))
  const picked: number[] = necklacePool.slice(0, targetNecklace)
  const fillPool = [...otherPool, ...necklacePool.slice(targetNecklace)]
  for (const id of fillPool) {
    if (picked.length >= count) break
    picked.push(id)
  }

  for (let i = picked.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = picked[i]
    picked[i] = picked[j]
    picked[j] = tmp
  }
  return picked
}
