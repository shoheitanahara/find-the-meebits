/**
 * 今日パークで実際に起きていること（会話の「今日の話題」に使う）。
 * どれも本当のことだけ。NPC の話を確かめに行くと、本当にそうなっている。
 * - ランウェイのテーマカラー
 * - 今日だけ来ているめずらしい種類の Meebit と、そのエリア
 * - OpenSea Market の展示数・48 時間以内に売れた数
 */
import { getCachedMeebitTraits } from '../../data/meebitTraits'
import { loadMeebitsListings } from '../../opensea/loadMeebitsListings'
import { isSoldMeebit } from '../../opensea/types'
import { getDailyRunwayShow } from '../../runway/dailyRunway'
import type { DailyParkLineup } from '../dailyFeatured'
import type { ParkZoneId } from '../parkZones'

export type RareSighting = { meebitNumber: number; type: string; zoneId: ParkZoneId }

export type DailyNews = {
  dateKey: string | null
  runwayColor: string | null
  sightings: RareSighting[]
  market: { pieces: number; sold: number } | null
}

const news: DailyNews = { dateKey: null, runwayColor: null, sightings: [], market: null }

/** パークではめったに見ない種類（Robot はアストロ以外で見かけたときだけ） */
const RARE_TYPES = new Set(['Elephant', 'Skeleton', 'Pig', 'Visitor', 'Dissected'])

export function getDailyNews(): DailyNews {
  return news
}

/** 今日の来場者一覧から、めずらしい種類の Meebit がどこにいるかを集める */
function collectSightings(lineup: DailyParkLineup): RareSighting[] {
  const byZone: Array<[ParkZoneId, DailyParkLineup['visitors']]> = [
    ['plaza', lineup.visitors],
    ['mountain', lineup.mountainVisitors],
    ['culture', lineup.cultureVisitors],
    ['sea', lineup.seaVisitors],
    ['astro', lineup.astroVisitors],
    ['musicArt', lineup.musicArtVisitors],
    ['jungle', lineup.jungleVisitors],
  ]
  const out: RareSighting[] = []
  for (const [zoneId, visitors] of byZone) {
    for (const visitor of visitors) {
      const type = getCachedMeebitTraits(visitor.meebitNumber)?.Type
      if (!type) continue
      if (RARE_TYPES.has(type) || (type === 'Robot' && zoneId !== 'astro')) {
        out.push({ meebitNumber: visitor.meebitNumber, type, zoneId })
      }
    }
  }
  return out
}

/**
 * パークに入ったときに一度だけ呼ぶ（同じ日なら二回目以降は何もしない）。
 * ランウェイと OpenSea は裏で読み込み、そろったものから話題に使う。
 */
export function primeDailyNews(lineup: DailyParkLineup) {
  if (news.dateKey === lineup.dateKey) return
  news.dateKey = lineup.dateKey
  news.sightings = collectSightings(lineup)
  news.runwayColor = null
  news.market = null
  void getDailyRunwayShow()
    .then((show) => {
      if (news.dateKey === lineup.dateKey) news.runwayColor = show.themeTrait.traitValue
    })
    .catch(() => undefined)
  void loadMeebitsListings()
    .then((payload) => {
      if (news.dateKey !== lineup.dateKey || payload.listings.length === 0) return
      news.market = {
        pieces: payload.listings.length,
        sold: payload.listings.filter((listing) => isSoldMeebit(listing)).length,
      }
    })
    .catch(() => undefined)
}
