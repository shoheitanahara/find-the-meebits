/**
 * 来場者がいまいる場所を、会話で使える言葉にする（いちばん近い目印）。
 */
import { FOUNTAIN_CENTER_Z } from '../dailyFeatured'
import { PARK_MAP_BOARD_SPOTS } from '../ParkMapBoard'
import { getAttractionsForZone } from '../topConfig'
import type { AttractionId } from '../topStore'
import { getParkZone, type ParkZoneId } from '../parkZones'
import type { Phrase } from './dynamicTopics'

const ATTRACTION_NAMES: Record<AttractionId, Phrase> = {
  find: { ja: '美術館', en: 'the museum' },
  podcast: { ja: 'ポッドキャストのスタジオ', en: 'the podcast studio' },
  street: { ja: '8th Street の入口', en: 'the 8th Street entrance' },
  mountain: { ja: 'Mt. Meeb の入口', en: 'the Mt. Meeb entrance' },
  neon: { ja: 'ジェリーマウンテンの入口', en: 'the Jerry Mountain entrance' },
  shooting: { ja: '射的の小屋', en: 'the shooting booth' },
  runway: { ja: 'ランウェイの入口', en: 'the Runway entrance' },
  closet: { ja: 'ルックロッカー', en: 'Look Locker' },
  pfp: { ja: 'フォトブース', en: 'the Photo Booth' },
  fishing: { ja: '釣り場の小屋', en: 'the fishing hut' },
  opensea: { ja: 'OpenSea マーケット', en: 'the OpenSea Market' },
  sergito: { ja: 'Sergito の工房', en: 'Sergito’s workshop' },
  starlight: { ja: 'スターライトラッシュ', en: 'Starlight Rush' },
  cinema: { ja: 'シネマ', en: 'the Cinema' },
  traits: { ja: 'トレイトハント', en: 'Trait Hunt' },
  hiphop: { ja: 'ヒップホップクラブ', en: 'the Hip Hop Club' },
  learnArt: { ja: 'Learn Art', en: 'Learn Art' },
  jazzBar: { ja: 'ジャズバー', en: 'the Jazz Bar' },
} as Record<AttractionId, Phrase>

const ZONE_NAMES: Record<ParkZoneId, Phrase> = {
  plaza: { ja: '広場', en: 'the Plaza' },
  mountain: { ja: 'マウンテンエリア', en: 'the Mountain District' },
  culture: { ja: 'カルチャーエリア', en: 'the Culture District' },
  sea: { ja: 'シーエリア', en: 'the Sea District' },
  astro: { ja: 'アストロエリア', en: 'the Astro District' },
  musicArt: { ja: 'ミュージック＆アートエリア', en: 'the Music & Art District' },
  jungle: { ja: 'ジャングルエリア', en: 'the Jungle District' },
}

type Landmark = { x: number; z: number; phrase: Phrase }

const cache = new Map<ParkZoneId, Landmark[]>()

function landmarksFor(zoneId: ParkZoneId): Landmark[] {
  const hit = cache.get(zoneId)
  if (hit) return hit
  const zone = getParkZone(zoneId)
  const list: Landmark[] = []
  for (const a of getAttractionsForZone(zoneId)) {
    const name = ATTRACTION_NAMES[a.id]
    if (name) list.push({ x: a.x, z: a.entranceZ, phrase: name })
  }
  const [mx, , mz] = PARK_MAP_BOARD_SPOTS[zoneId]
  list.push({ x: mx, z: mz + 1, phrase: { ja: 'マップ看板', en: 'the map board' } })
  if (zone.hasFountain) list.push({ x: 0, z: FOUNTAIN_CENTER_Z, phrase: { ja: '噴水', en: 'the fountain' } })
  for (const [bx, bz] of zone.benches) list.push({ x: bx, z: bz, phrase: { ja: 'ベンチ', en: 'the benches' } })
  for (const gate of zone.gates) {
    const target = ZONE_NAMES[gate.targetZone]
    list.push({ x: gate.x, z: gate.z, phrase: { ja: `${target.ja}への門`, en: `the gate to ${target.en}` } })
  }
  cache.set(zoneId, list)
  return list
}

/** (x, z) にいちばん近い目印。遠ければ「エリアのまんなか」 */
export function describePlace(zoneId: ParkZoneId, x: number, z: number): Phrase {
  let best: Landmark | null = null
  let bestDistance = Infinity
  for (const mark of landmarksFor(zoneId)) {
    const d = Math.hypot(mark.x - x, mark.z - z)
    if (d < bestDistance) {
      best = mark
      bestDistance = d
    }
  }
  if (!best || bestDistance > 7) {
    const zone = ZONE_NAMES[zoneId]
    return { ja: `${zone.ja}のまんなか`, en: `the middle of ${zone.en}` }
  }
  return best.phrase
}
