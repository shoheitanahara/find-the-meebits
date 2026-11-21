/**
 * 展示作品のトレイトを、ギャラリーの解説の言葉にする（台座の解説・案内係のおすすめで共用）。
 * OpenSea の出品番号 = Meebit の番号なので、パークと同じトレイトデータを引ける。
 */
import { getCachedMeebitTraits, type MeebitTraitMap } from '../../data/meebitTraits'
import type { ListedMeebit } from '../../opensea/types'

export type Phrase = { ja: string; en: string }
export type TraitHighlight = Phrase & { key: string }

function has(traits: MeebitTraitMap, key: string) {
  const v = traits[key]
  return v && v !== 'None' && v !== 'No' ? v : null
}

/** 見どころの一言（目立つものから順） */
export function getTraitHighlights(traits: MeebitTraitMap | null): TraitHighlight[] {
  if (!traits) return []
  const out: TraitHighlight[] = []
  if (traits.Type && traits.Type !== 'Human') {
    out.push({
      key: 'Type',
      ja: `めずらしい ${traits.Type} の一体。彫刻にすると、形のおもしろさがよく分かる`,
      en: `A rare ${traits.Type} — as a sculpture, its form really comes through`,
    })
  }
  const hat = has(traits, 'Hat')
  if (hat) out.push({ key: 'Hat', ja: `頭の ${hat} が、遠くからでも目を引く`, en: `the ${hat} catches the eye even from across the room` })
  const overshirt = has(traits, 'Overshirt')
  if (overshirt) out.push({ key: 'Overshirt', ja: `羽織った ${overshirt} が、全体に奥行きを出している`, en: `the ${overshirt} layered on top gives the figure depth` })
  const glasses = has(traits, 'Glasses')
  if (glasses) out.push({ key: 'Glasses', ja: `眼鏡（${glasses}）が、表情をぐっと引きしめている`, en: `its eyewear — ${glasses} — sharpens the whole expression` })
  const necklace = has(traits, 'Necklace')
  if (necklace) out.push({ key: 'Necklace', ja: `胸もとの ${necklace} が、さりげないアクセント`, en: `the ${necklace} adds a quiet accent at the chest` })
  const earring = has(traits, 'Earring')
  if (earring) out.push({ key: 'Earring', ja: `耳もとの ${earring} が、横顔に表情をつけている`, en: `the profile comes alive with ${earring}` })
  const motif = has(traits, 'Tattoo Motif')
  if (motif) out.push({ key: 'Tattoo Motif', ja: `${motif} のタトゥーが、静かに個性を語っている`, en: `the ${motif} tattoo quietly speaks to its character` })
  const jersey = has(traits, 'Jersey Number')
  if (jersey) out.push({ key: 'Jersey Number', ja: `背番号 ${jersey} が、名札みたいになっている`, en: `jersey number ${jersey} works like a name tag` })
  const hair = !hat ? has(traits, 'Hair Style') : null
  if (hair) out.push({ key: 'Hair Style', ja: `${hair} の髪型が、印象を決めている`, en: `the ${hair} hairstyle sets the tone` })
  const shirt = has(traits, 'Shirt')
  if (shirt) out.push({ key: 'Shirt', ja: `${shirt} がシンプルに効いている`, en: `the ${shirt} keeps it simple and strong` })
  const shoes = has(traits, 'Shoes')
  if (shoes) out.push({ key: 'Shoes', ja: `足もとの ${shoes} まで、きちんと見てほしい`, en: `don’t miss the ${shoes} at the feet` })
  return out
}

/** 台座の解説（いちばん目立つものを1つ） */
export function getListingCaption(tokenId: number): Phrase | null {
  const highlights = getTraitHighlights(getCachedMeebitTraits(tokenId))
  // Human 以外は種類を、ほかは上位から番号で1つ選ぶ（同じ作品はいつも同じ解説）
  const top = highlights[0]?.key === 'Type' ? [highlights[0]] : highlights.slice(0, 3)
  const pick = top[tokenId % Math.max(1, top.length)]
  return pick ? { ja: `${pick.ja}。`, en: `${capitalize(pick.en)}.` } : null
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** 台座の場所（6列×5行。左右3列ずつ、奥が1列目） */
export function describePedestalSpot(index: number): Phrase {
  const row = Math.floor(index / 6) + 1
  const col = index % 6
  const left = col < 3
  const byAisle = (left ? col : col - 3) === 0
  const sideJa = left ? '左側' : '右側'
  const sideEn = left ? 'on the left' : 'on the right'
  return {
    ja: `${sideJa}の、奥から${row}列目${byAisle ? '（真ん中の通路ぞい）' : ''}`,
    en: `${sideEn}, row ${row} from the back${byAisle ? ', right by the center aisle' : ''}`,
  }
}

/** 2体に共通するトレイトの言い方 */
export const SHARED_TRAIT_KEYS: Array<{ key: string; ja: (v: string) => string; en: (v: string) => string }> = [
  { key: 'Hat', ja: (v) => `${v} をかぶってる`, en: (v) => `wear a ${v}` },
  { key: 'Glasses', ja: (v) => `同じ眼鏡（${v}）をかけてる`, en: (v) => `wear the same eyewear (${v})` },
  { key: 'Overshirt', ja: (v) => `${v} を羽織ってる`, en: (v) => `wear a ${v}` },
  { key: 'Hair Style', ja: (v) => `${v} の髪型なんだ`, en: (v) => `have the ${v} hairstyle` },
  { key: 'Necklace', ja: (v) => `${v} をつけてる`, en: (v) => `wear a ${v}` },
  { key: 'Earring', ja: (v) => `${v} をつけてる`, en: (v) => `wear ${v}` },
  { key: 'Shirt', ja: (v) => `${v} を着てる`, en: (v) => `wear a ${v}` },
  { key: 'Shoes', ja: (v) => `${v} をはいてる`, en: (v) => `wear ${v}` },
]

const COLOR_JA: Record<string, string> = {
  Black: '黒',
  Blue: '青',
  Brown: '茶色',
  Camo: '迷彩',
  Cyan: 'シアン',
  Gold: '金色',
  Gray: 'グレー',
  Green: '緑',
  'Light Blue': '水色',
  Orange: 'オレンジ',
  Pink: 'ピンク',
  Purple: '紫',
  Red: '赤',
  Silver: 'シルバー',
  Tan: 'ベージュ',
  Teal: 'ティール',
  White: '白',
  Yellow: '黄色',
}

export function colorName(value: string, ja: boolean) {
  return ja ? (COLOR_JA[value] ?? value) : value.toLowerCase()
}

/** 展示中の作品と、その台座の番号 */
export type DisplayedPiece = { listing: ListedMeebit; index: number; traits: MeebitTraitMap | null }

export function getDisplayedPieces(listings: ListedMeebit[]): DisplayedPiece[] {
  return listings.slice(0, 30).map((listing, index) => ({
    listing,
    index,
    traits: getCachedMeebitTraits(listing.tokenId),
  }))
}
