/**
 * OpenSea Market の案内係（ギャラリーの学芸員役）。一般の来場者とは別の話し方。
 * いま台座に並んでいる作品のトレイトを読んで、おすすめ・共通点・めずらしい作品・色の傾向などを話す。
 * OpenSea の出品番号 = Meebit の番号なので、パークと同じトレイトデータを使える。
 * 値段の良し悪しや投資の話はしない。
 */
import { getCachedMeebitTraits } from '../../data/meebitTraits'
import { traitDisplayName } from '../../data/traitDisplayName'
import { getLocale } from '../../i18n/locale'
import type { DialogueLine } from '../../npc/npcTypes'
import { isSoldMeebit, type ListedMeebit } from '../../opensea/types'
import { selectSilentLines } from '../../top/parkDialogue'
import { isSilentMeebit } from '../../top/parkTalk/personality'
import { getParkTimeOfDayFromDate, type ParkTimeOfDay } from '../../top/parkTimeOfDay'
import { useOpenSeaMarketStore } from '../store'
import {
  capitalize,
  colorName,
  describePedestalSpot,
  getDisplayedPieces,
  getTraitHighlights,
  SHARED_TRAIT_KEYS,
  type DisplayedPiece,
  type Phrase,
} from './marketTraitPhrases'

const STORAGE_KEY = 'meebits-market-guide-v1'

function loadGuideTalks(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const n = raw ? (JSON.parse(raw) as { talks?: number }).talks : 0
    return typeof n === 'number' ? n : 0
  } catch {
    return 0
  }
}

function saveGuideTalks(talks: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ talks }))
  } catch {
    // 保存できなくても会話はできる
  }
}

function hash(a: number, b: number) {
  return Math.imul(a ^ Math.imul(b, 2654435761), 1597334677) >>> 0
}

type Talk = Phrase[]

// ── あいさつ ─────────────────────────────────────────

const FIRST_GREETING: Talk = [
  { ja: 'OpenSea Market へようこそ！', en: 'Welcome to OpenSea Market!' },
  {
    ja: 'ここは、OpenSea に出ている Meebits を Digital Sculpture として展示しているギャラリーだよ。',
    en: 'This gallery shows Meebits listed on OpenSea as Digital Sculptures.',
  },
]

const RETURN_GREETINGS: Array<{ text: Phrase; times?: ParkTimeOfDay[] }> = [
  { text: { ja: 'おはよう！ 朝いちばんのギャラリーは、ゆっくり見られるよ。', en: 'Morning! The gallery’s nice and quiet this early.' }, times: ['morning'] },
  { text: { ja: 'いらっしゃい！ 今日もゆっくり見ていってね。', en: 'Welcome! Take your time today.' }, times: ['noon'] },
  { text: { ja: 'いらっしゃい。夕方は、台座の照明がいちばん映える時間だよ。', en: 'Welcome. Evening is when the pedestal lights look their best.' }, times: ['evening'] },
  { text: { ja: 'こんばんは！ 夜のギャラリーへようこそ。', en: 'Good evening! Welcome to the gallery at night.' }, times: ['night'] },
  { text: { ja: 'また来てくれたんだね！', en: 'You came back!' } },
  { text: { ja: 'おかえり！ 今日の展示も、見どころが多いよ。', en: 'Welcome back! Lots to see in today’s show.' } },
  { text: { ja: 'やあ。案内なら任せて。', en: 'Hey there. Leave the tour to me.' } },
]

function pickGreeting(guideId: number, talks: number, time: ParkTimeOfDay): Talk {
  if (talks === 0) return FIRST_GREETING
  const pool = RETURN_GREETINGS.flatMap((g) => (!g.times ? [g.text] : g.times.includes(time) ? [g.text, g.text] : []))
  return [pool[hash(guideId + 3, talks) % pool.length]]
}

// ── 話題 ───────────────────────────────────────────

const RECOMMEND_INTROS: Array<(id: number, spot: Phrase) => Phrase> = [
  (id, spot) => ({ ja: `今日のおすすめは #${id}。${spot.ja}の台座だよ。`, en: `My pick today is #${id}, ${spot.en}.` }),
  (id, spot) => ({ ja: `ぜひ見てほしいのが #${id}。${spot.ja}にあるよ。`, en: `You’ve got to see #${id} — it’s ${spot.en}.` }),
  (id, spot) => ({ ja: `最近いちばん気になってるのは #${id}。${spot.ja}の台座なんだ。`, en: `The one I keep coming back to is #${id}, ${spot.en}.` }),
]

function statusLine(listing: ListedMeebit): Phrase {
  return isSoldMeebit(listing)
    ? { ja: 'もう SOLD のリボンが付いちゃったけど、近くで見る価値はあるよ。', en: 'It already has a SOLD ribbon, but it’s still worth a close look.' }
    : { ja: '値札に近づくと、OpenSea で詳しく見られるよ。', en: 'Walk up to its price tag to see the details on OpenSea.' }
}

/** おすすめの一体（場所・見どころ2つ・状態） */
function recommend(pieces: DisplayedPiece[], guideId: number, talks: number): Talk | null {
  const candidates = pieces.filter((p) => getTraitHighlights(p.traits).length > 0)
  if (candidates.length === 0) return null
  const piece = candidates[hash(guideId * 7 + 1, talks) % candidates.length]
  const highlights = getTraitHighlights(piece.traits)
  const first = highlights[hash(piece.listing.tokenId, talks) % Math.min(3, highlights.length)]
  const second = highlights.find((h) => h.key !== first.key && h.key !== 'Shirt') ?? null
  const spot = describePedestalSpot(piece.index)
  const intro = RECOMMEND_INTROS[hash(guideId + 5, talks) % RECOMMEND_INTROS.length](piece.listing.tokenId, spot)
  const detail: Phrase = second
    ? { ja: `${first.ja}。それに、${second.ja}。`, en: `${capitalize(first.en)}, and ${second.en}.` }
    : { ja: `${first.ja}。`, en: `${capitalize(first.en)}.` }
  return [intro, detail, statusLine(piece.listing)]
}

/** 同じトレイトの2体 */
function pair(pieces: DisplayedPiece[], guideId: number, talks: number): Talk | null {
  const start = hash(guideId + 11, talks)
  for (let k = 0; k < SHARED_TRAIT_KEYS.length; k += 1) {
    const rule = SHARED_TRAIT_KEYS[(start + k) % SHARED_TRAIT_KEYS.length]
    const groups = new Map<string, DisplayedPiece[]>()
    for (const p of pieces) {
      // 2体で色がちがうこともあるので、色なし（値＋ジャンル）でまとめる
      const v = p.traits ? traitDisplayName(p.traits, rule.key, false) : null
      if (!v) continue
      groups.set(v, [...(groups.get(v) ?? []), p])
    }
    const shared = [...groups.entries()].filter(([, list]) => list.length >= 2)
    if (shared.length === 0) continue
    const [value, list] = shared[hash(guideId, talks + k) % shared.length]
    const a = list[0]
    const b = list[1]
    const spotA = describePedestalSpot(a.index)
    const spotB = describePedestalSpot(b.index)
    return [
      { ja: `#${a.listing.tokenId} と #${b.listing.tokenId}、どっちも ${rule.ja(value)}。`, en: `#${a.listing.tokenId} and #${b.listing.tokenId} both ${rule.en(value)}.` },
      { ja: `#${a.listing.tokenId} は${spotA.ja}、#${b.listing.tokenId} は${spotB.ja}にあるよ。`, en: `#${a.listing.tokenId} is ${spotA.en}, and #${b.listing.tokenId} is ${spotB.en}.` },
      { ja: '見くらべると、ほかのところのちがいがよく分かっておもしろいよ。', en: 'Compare them and the other differences really jump out.' },
    ]
  }
  return null
}

/** Human 以外のめずらしい作品 */
function rare(pieces: DisplayedPiece[], guideId: number, talks: number): Talk | null {
  const list = pieces.filter((p) => p.traits?.Type && p.traits.Type !== 'Human')
  if (list.length === 0) return null
  const piece = list[hash(guideId + 13, talks) % list.length]
  const type = piece.traits!.Type
  const spot = describePedestalSpot(piece.index)
  return [
    { ja: `この部屋には、めずらしい ${type} の作品があるんだ。`, en: `There’s a rare ${type} in this room.` },
    { ja: `#${piece.listing.tokenId}、${spot.ja}の台座だよ。`, en: `#${piece.listing.tokenId}, ${spot.en}.` },
    { ja: 'Human とは形がまるでちがうから、ぜひ近くで見てみて。', en: 'Its shape is nothing like a Human’s — go see it up close.' },
  ]
}

const COLOR_KEYS = ['Shirt Color', 'Overshirt Color', 'Hat Color', 'Pants Color']

/** この部屋でいちばん多い色 */
function colorTrend(pieces: DisplayedPiece[]): Talk | null {
  const counts = new Map<string, number>()
  for (const p of pieces) {
    const colors = new Set(COLOR_KEYS.map((k) => p.traits?.[k]).filter((c): c is string => Boolean(c)))
    for (const c of colors) counts.set(c, (counts.get(c) ?? 0) + 1)
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  if (!top || top[1] < 3) return null
  const [color, n] = top
  return [
    { ja: `この部屋、${colorName(color, true)}を使った作品が多いんだ。`, en: `This room has a lot of ${colorName(color, false)} in it.` },
    { ja: `数えてみたら、${n}体もあったよ。`, en: `I counted ${n} pieces.` },
    { ja: '色に注目して回るのも楽しいよ。', en: 'Following a single color around the room is a fun way to look.' },
  ]
}

/** 48 時間以内に売れた作品の数 */
function soldCount(pieces: DisplayedPiece[]): Talk | null {
  const n = pieces.filter((p) => isSoldMeebit(p.listing)).length
  if (n === 0) return null
  return [
    { ja: `この部屋には、48時間以内に売れた作品が${n}体あるよ。`, en: `${n} piece${n > 1 ? 's' : ''} in this room sold within the last 48 hours.` },
    { ja: 'SOLD のリボンが目印。売れた作品も、しばらくはここで見られるんだ。', en: 'Look for the SOLD ribbon. Sold pieces stay on view here for a while.' },
  ]
}

/** ギャラリーの使い方 */
function guideInfo(pieces: DisplayedPiece[], guideId: number, talks: number): Talk {
  const infos: Talk[] = [
    [
      { ja: '台座の値札に近づくと、OpenSea のページが開けるよ。', en: 'Walk up to a pedestal’s price tag to open its OpenSea page.' },
      { ja: '気になる作品は、そこから詳しく見てね。', en: 'That’s where you can see the details on anything you like.' },
    ],
    [
      { ja: 'ギャラリーは全部で3部屋あるんだ。', en: 'There are three gallery rooms in all.' },
      { ja: '左右の門が開いていたら、となりの部屋にも行けるよ。', en: 'If the side gates are open, you can walk through to the next room.' },
    ],
    [
      { ja: 'ここに並んでいるのは、ぜんぶ OpenSea に出ている Meebits なんだ。', en: 'Everything on display here is a Meebit listed on OpenSea.' },
      { ja: 'ひとつひとつ、トレイトの組み合わせがちがうよ。', en: 'Every single one has a different combination of traits.' },
    ],
    [
      { ja: '歩いているのは案内係。作品は台座の上だけだよ。', en: 'The folks walking around are guides. The works are only on the pedestals.' },
      { ja: 'わからないことがあったら、いつでも声をかけてね。', en: 'If you have any questions, just ask.' },
    ],
  ]
  if (pieces.length > 0) {
    infos.push([
      { ja: `この部屋には、${pieces.length}体の作品が並んでいるよ。`, en: `There are ${pieces.length} pieces in this room.` },
      { ja: 'ぜんぶ見て回るなら、真ん中の通路から左右に回るのがおすすめ。', en: 'To see them all, start from the center aisle and work out to each side.' },
    ])
  }
  return infos[hash(guideId + 17, talks) % infos.length]
}

/**
 * 案内係との会話。あいさつ ＋ 話題ひとつ。
 * 話題はおすすめを多めに、共通点・めずらしい作品・色・売れた数・使い方を混ぜる。
 */
export function createGuideDialogue(guideId: number): DialogueLine[] {
  const ja = getLocale() === 'ja'
  const talks = loadGuideTalks()
  // Visitor と Dissected の案内係はほとんど話さない
  const guideTraits = getCachedMeebitTraits(guideId)
  if (isSilentMeebit(guideTraits)) {
    saveGuideTalks(talks + 1)
    return selectSilentLines(`opensea-guide-${guideId}`, talks, guideTraits?.Type === 'Visitor' ? 'sea' : null)
  }
  const pieces = getDisplayedPieces(useOpenSeaMarketStore.getState().sessionPedestalListings)

  const weighted: Array<[() => Talk | null, number]> = [
    [() => recommend(pieces, guideId, talks), 4],
    [() => pair(pieces, guideId, talks), 2],
    [() => rare(pieces, guideId, talks), 2],
    [() => colorTrend(pieces), 1],
    [() => soldCount(pieces), 1],
    [() => guideInfo(pieces, guideId, talks), talks === 0 ? 3 : 1],
  ]
  const order: Array<() => Talk | null> = []
  for (const [fn, w] of weighted) for (let i = 0; i < w; i += 1) order.push(fn)
  const start = hash(guideId + 23, talks) % order.length
  let topic: Talk | null = null
  for (let i = 0; i < order.length && !topic; i += 1) topic = order[(start + i) % order.length]()
  topic ??= guideInfo(pieces, guideId, talks)

  saveGuideTalks(talks + 1)
  const lines = [...pickGreeting(guideId, talks, getParkTimeOfDayFromDate()), ...topic]
  return lines.map((p, i) => ({ id: `opensea-guide-${guideId}-${talks}-${i}`, text: ja ? p.ja : p.en, category: 'meebits' }))
}
