/**
 * その場のデータから作る会話（組み合わせで、ほぼ無数になる）。
 * - プレイヤーの見た目への一言（帽子・眼鏡・上着など、プレイヤーのトレイト）
 * - ほかの来場者のうわさ（同じエリアにいる実際の来場者の特徴と、いまいる場所）
 * - 今日の主役のトレイト
 * - 話している本人の見た目（自分のトレイトの話）
 * 性格ごとに言い方を変える。トレイトの値（例 Backwards Cap）はそのまま使う。
 */
import type { MeebitTraitMap } from '../../data/meebitTraits'
import { traitDisplayName } from '../../data/traitDisplayName'
import type { PersonalityId, TalkScript } from './types'

export type Phrase = { ja: string; en: string }

export type DynamicTalkData = {
  /** 話している本人のトレイト */
  selfTraits: MeebitTraitMap | null
  playerTraits: MeebitTraitMap | null
  featuredTraits: MeebitTraitMap | null
  /** 同じエリアにいるほかの来場者と、いまいる場所 */
  others: Array<{ meebitNumber: number; traits: MeebitTraitMap | null; place: Phrase }>
}

/** 話題にしやすいトレイトと、その呼び方 */
const TRAIT_WORDS: Array<{ key: string; ja: string; en: string }> = [
  { key: 'Hat', ja: '帽子', en: 'hat' },
  { key: 'Glasses', ja: '眼鏡', en: 'glasses' },
  { key: 'Overshirt', ja: '上着', en: 'jacket' },
  { key: 'Necklace', ja: 'ネックレス', en: 'necklace' },
  { key: 'Earring', ja: 'イヤリング', en: 'earrings' },
  { key: 'Hair Style', ja: '髪型', en: 'hairstyle' },
  { key: 'Shirt', ja: 'シャツ', en: 'shirt' },
  { key: 'Shoes', ja: '靴', en: 'shoes' },
]

type Trait = { value: string; cat: Phrase }

/** 話題にできるトレイト（色＋値＋ジャンルの名前つき。Human 以外の髪型は除く） */
function traitsOf(traits: MeebitTraitMap | null): Trait[] {
  if (!traits) return []
  return TRAIT_WORDS.flatMap((w) => {
    const name = traitDisplayName(traits, w.key)
    return name ? [{ value: name, cat: { ja: w.ja, en: w.en } }] : []
  })
}

type Lines = { ja: string[]; en: string[] }
type LookT = (v: string, cat: Phrase) => Lines
type GossipT = (v: string, npc: string, place: Phrase) => Lines
type StarT = (v: string, cat: Phrase) => Lines
type SelfT = (v: string, cat: Phrase) => Lines

const L = (ja: string[], en: string[]): Lines => ({ ja, en })

/** 性格ごとの言い方（{you} {star} は会話の組み立て側で差し込む） */
const TEMPLATES: Record<PersonalityId, { look: LookT[]; gossip: GossipT[]; star: StarT[]; self: SelfT[] }> = {
  street: {
    look: [
      (v, c) => L([`その ${v}、いいじゃん。`, `${c.ja}で個性出すの、俺は好きだよ。`], [`That ${v} is fresh.`, `I like people who show their style through their ${c.en}.`]),
      (v, c) => L([`お、今日の ${v}、キマってんな。`, `俺も今度、${c.ja}変えてみようかな。`], [`Oh, that ${v} looks sharp today.`, `Maybe I should switch up my ${c.en} too.`]),
    ],
    gossip: [
      (v, n, p) => L([`さっき${p.ja}のあたりで、${n} を見たよ。`, `${v} が似合っててさ、ちょっと見とれた。`], [`Saw ${n} near ${p.en} just now.`, `That ${v} suited them. Had to look twice.`]),
      (v, n, p) => L([`${n} って知ってる？ ${v} のやつ。`, `${p.ja}のほうにいたよ。センスいいんだよね。`], [`You know ${n}? The one with the ${v}.`, `They were over by ${p.en}. Good taste.`]),
    ],
    star: [
      (v, c) => L([`今日の主役の {star}、${v} なんだよね。`, `銅像になっても、あの${c.ja}は目立つよな。`], [`Today’s star {star} has the ${v}.`, `Even as a statue, that ${c.en} stands out.`]),
      (v) => L([`{star} の ${v}、近くで見た？`, `ああいうの、俺のコレクションに欲しいわ。`], [`Seen {star}’s ${v} up close?`, `I’d want that in my collection.`]),
    ],
    self: [
      (v, c) => L([`この ${v}、けっこう気に入ってんだよね。`, `${c.ja}は、俺のこだわりポイント。`], [`I’m pretty into this ${v}.`, `${capital(c.en)} is where I go all out.`]),
      (v) => L([`俺の ${v}、気づいた？`, `…気づいてなくても、まあいいけど。`], [`Notice my ${v}?`, `…It’s fine if you didn’t.`]),
    ],
  },
  sporty: {
    look: [
      (v, c) => L([`おっ、その ${v}、かっこいいな！`, `オレも${c.ja}には、ちょっとこだわってるんだぜ！`], [`Whoa, that ${v} looks cool!`, `I’m kinda picky about my ${c.en} too!`]),
      (v) => L([`{you}、今日の ${v}、気合い入ってるな！`, `見てるだけで、走りたくなってきた！`], [`{you}, that ${v} looks fired up today!`, `Just looking at it makes me want to run!`]),
    ],
    gossip: [
      (v, n, p) => L([`さっき${p.ja}のあたりで ${n} に会ったぜ！`, `${v} がよく目立ってたから、すぐ分かった！`], [`Ran into ${n} near ${p.en} just now!`, `That ${v} stands out, so I spotted them right away!`]),
      (v, n, p) => L([`${n} と、${p.ja}の前でかけっこしたんだ！`, `あの ${v} のやつ、めちゃくちゃ速かったぜ！`], [`I raced ${n} in front of ${p.en}!`, `The one with the ${v} — super fast!`]),
    ],
    star: [
      (v, c) => L([`今日の主役 {star} は、${v} だってよ！`, `銅像でも、あの${c.ja}はキマってたぜ！`], [`Today’s star {star} has the ${v}!`, `Even in bronze, that ${c.en} looks sharp!`]),
      (v) => L([`{star} の銅像、${v} まで再現されてたぜ！`, `細かいとこまで、すげえよな！`], [`The {star} statue even has the ${v}!`, `They got every detail!`]),
    ],
    self: [
      (v, c) => L([`見てくれよ、オレの ${v}！`, `この${c.ja}だと、なんか速く走れる気がするんだ！`], [`Check out my ${v}!`, `I swear this ${c.en} makes me faster!`]),
      (v) => L([`オレの ${v}、今日の勝負服なんだぜ！`, `…なんの勝負かは、まだ決めてないけどな！`], [`My ${v} is my lucky gear today!`, `…Haven’t decided what for yet!`]),
    ],
  },
  cool: {
    look: [
      (v) => L([`…その ${v}。`, `悪くない。`], [`…That ${v}.`, `Not bad.`]),
      (v, c) => L([`${c.ja}は、その人をいちばんよく表す。`, `君の ${v} は…君らしい、と思う。`], [`A person’s ${c.en} says the most about them.`, `Your ${v}… suits you, I think.`]),
    ],
    gossip: [
      (v, n, p) => L([`${n} が、${p.ja}のあたりにいた。`, `${v} の。…静かなやつだった。`], [`${n} was over near ${p.en}.`, `The one with the ${v}. …Quiet type.`]),
      (v, n, p) => L([`${p.ja}のそばで、${n} とすれ違った。`, `${v} が、灯りによく映えてた。`], [`Passed ${n} by ${p.en}.`, `That ${v} caught the light nicely.`]),
    ],
    star: [
      (v) => L([`今日の主役、{star}。`, `${v}。…銅像でも、ちゃんと分かる。`], [`Today’s star: {star}.`, `The ${v}. …You can tell, even in bronze.`]),
      (v, c) => L([`{star} の ${v}。`, `ああいう${c.ja}は、遠くからでも目に入る。`], [`{star}’s ${v}.`, `${capital(c.en)} like that catch your eye from far away.`]),
    ],
    self: [
      (v) => L([`この ${v} は、昔から変えてない。`, `…変える理由がないだけだ。`], [`I’ve never changed this ${v}.`, `…No reason to.`]),
      (v, c) => L([`${c.ja}を見られるのは、少し落ち着かない。`, `…この ${v}、変じゃないか？`], [`Having my ${c.en} looked at is a little unsettling.`, `…Is this ${v} weird?`]),
    ],
  },
  photographer: {
    look: [
      (v, c) => L([`{you}、その ${v}、写真映えするね。`, `${c.ja}って、写真だといちばん目に入るところなんだ。`], [`{you}, that ${v} would look great in a photo.`, `In photos, your ${c.en} is the first thing people notice.`]),
      (v) => L([`あ、動かないで…`, `その ${v}、いま一枚撮りたくなった。`], [`Oh, hold still…`, `That ${v} — I need a quick shot.`]),
    ],
    gossip: [
      (v, n, p) => L([`さっき${p.ja}のあたりで、${n} の写真を撮らせてもらったんだ。`, `${v} が、すごく写真映えしてた。`], [`I got to photograph ${n} near ${p.en} earlier.`, `That ${v} looked great on camera.`]),
      (v, n, p) => L([`${n} の ${v}、見た？`, `${p.ja}のほうにいたよ。色の組み合わせがきれいなんだ。`], [`Did you see ${n}’s ${v}?`, `They were near ${p.en}. Beautiful color combo.`]),
    ],
    star: [
      (v, c) => L([`今日の主役の {star}、${v} なんだ。`, `銅像だと、${c.ja}の形がよく写るんだよね。`], [`Today’s star {star} has the ${v}.`, `As a statue, the ${c.en} really shows up in photos.`]),
      (v) => L([`{star} の銅像、${v} がきれいに写る角度を探してるんだ。`, `まだ見つかってないけどね。`], [`I’m hunting for the angle where the ${v} on the {star} statue looks best.`, `Haven’t found it yet.`]),
    ],
    self: [
      (v, c) => L([`ボクの ${v}、自撮りするとけっこう目立つんだ。`, `自分の${c.ja}を撮るのって、意外とむずかしいんだよ。`], [`My ${v} really stands out in selfies.`, `Photographing your own ${c.en} is harder than you’d think.`]),
      (v) => L([`この ${v}、色が気に入ってるんだ。`, `光の加減で、写真に撮るたびにちがって見えるんだよね。`], [`I love the color of this ${v}.`, `It looks different in every photo, depending on the light.`]),
    ],
  },
  stylish: {
    look: [
      (v, c) => L([`あら、その ${v}、すてきじゃない。`, `${c.ja}選び、センスあるわね。`], [`Oh, that ${v} is lovely.`, `You’ve got taste in ${c.en}.`]),
      (v, c) => L([`今日の {you}、${v} がポイントね。`, `わたしなら、その${c.ja}に合わせて小物を足すかしら。`], [`{you}, the ${v} is the star of your look today.`, `I’d add an accessory to match that ${c.en}.`]),
    ],
    gossip: [
      (v, n, p) => L([`さっき${p.ja}のあたりで ${n} を見かけたの。`, `${v} の合わせ方、なかなかだったわよ。`], [`I spotted ${n} near ${p.en} earlier.`, `The way they styled that ${v} — not bad at all.`]),
      (v, n, p) => L([`${n} って子、知ってる？`, `${v} がよく似合う子よ。${p.ja}のほうにいたわ。`], [`Do you know ${n}?`, `The ${v} really suits them. They were by ${p.en}.`]),
    ],
    star: [
      (v, c) => L([`今日の主役 {star}、${v} なのよ。`, `銅像でも、${c.ja}の主張がちゃんとあるわ。`], [`Today’s star {star} has the ${v}.`, `Even in bronze, that ${c.en} makes a statement.`]),
      (v) => L([`{star} の ${v}、見た？`, `わたしも今度、まねしてみようかしら。`], [`Did you see {star}’s ${v}?`, `Maybe I’ll try that look myself.`]),
    ],
    self: [
      (v, c) => L([`わたしの ${v}、どう？`, `今日の${c.ja}は、ちょっと自信作なの。`], [`How do you like my ${v}?`, `I’m rather proud of today’s ${c.en}.`]),
      (v) => L([`この ${v}、合わせるのに一時間かかったのよ。`, `…ほんとは三十分くらいだけど。`], [`This ${v} took me an hour to style.`, `…Okay, thirty minutes.`]),
    ],
  },
  bubbly: {
    look: [
      (v, c) => L([`わあ、{you} の ${v}、かわいい！`, `あたしも${c.ja}、そういうのにしたいな！`], [`Ooh, {you}, your ${v} is so cute!`, `I want ${c.en} like that too!`]),
      (v) => L([`ねえねえ、その ${v}、どこで見つけたの？`, `すっごく似合ってるよ！`], [`Hey hey, where’d you find that ${v}?`, `It looks amazing on you!`]),
    ],
    gossip: [
      (v, n, p) => L([`さっきね、${p.ja}のところで ${n} に会ったの！`, `${v} がかわいくて、つい声かけちゃった！`], [`I met ${n} by ${p.en} just now!`, `Their ${v} was so cute, I had to say hi!`]),
      (v, n, p) => L([`${n} って子、知ってる？ ${v} の子！`, `${p.ja}のあたりにいたよ！ なかよくなれそう！`], [`Do you know ${n}? The one with the ${v}!`, `They were near ${p.en}! I think we’d be friends!`]),
    ],
    star: [
      (v) => L([`今日の主役 {star}、${v} なんだって！`, `銅像になっても、かわいいよね！`], [`Today’s star {star} has the ${v}!`, `Still cute even as a statue!`]),
      (v) => L([`{star} の銅像の ${v}、見た？`, `あたし、近くで十回くらい見ちゃった！`], [`Did you see the ${v} on the {star} statue?`, `I’ve looked at it up close like ten times!`]),
    ],
    self: [
      (v) => L([`見て見て、あたしの ${v}！`, `お気に入りなんだ！ かわいいでしょ！`], [`Look, look, my ${v}!`, `It’s my favorite! Isn’t it cute?`]),
      (v, c) => L([`あたしね、${c.ja}は毎朝ちがうのにしたいの！`, `でも、結局いつもこの ${v} になっちゃう！`], [`I want to wear different ${c.en} every morning!`, `But I always end up in this ${v}!`]),
    ],
  },
  sisterly: {
    look: [
      (v) => L([`{you}、その ${v}、似合ってるじゃない。`, `自信持っていいよ。`], [`{you}, that ${v} looks good on you.`, `Be proud of it.`]),
      (v, c) => L([`今日の ${v}、いい感じだね。`, `${c.ja}がきまってると、歩き方まで変わるんだよ。`], [`That ${v} looks great today.`, `When your ${c.en} is on point, even your walk changes.`]),
    ],
    gossip: [
      (v, n, p) => L([`さっき${p.ja}のあたりで、${n} が迷ってたんだ。`, `${v} の子。道を教えてあげたよ。`], [`${n} was lost near ${p.en} earlier.`, `The one with the ${v}. I pointed the way.`]),
      (v, n, p) => L([`${n}、知ってる？ ${v} の子。`, `${p.ja}のそばにいたよ。今度話しかけてみな。`], [`Know ${n}? The one with the ${v}.`, `They were by ${p.en}. Go say hi sometime.`]),
    ],
    star: [
      (v) => L([`今日の主役は {star}。${v} の子だよ。`, `緊張してないといいけどね。`], [`Today’s star is {star} — the one with the ${v}.`, `Hope they’re not too nervous.`]),
      (v) => L([`{star} の銅像、${v} まできれいに作ってあるの。`, `作った人、えらいよね。`], [`The {star} statue even gets the ${v} right.`, `Whoever made it did great work.`]),
    ],
    self: [
      (v) => L([`うちの ${v}？ もう長いこと使ってるんだ。`, `なじんでて、手放せないんだよね。`], [`My ${v}? I’ve had it for ages.`, `It’s so worn in, I can’t let it go.`]),
      (v, c) => L([`${c.ja}って、気分を変えてくれるでしょ。`, `うちは、この ${v} で気合いを入れてるの。`], [`Your ${c.en} can change your whole mood, right?`, `This ${v} is how I get myself fired up.`]),
    ],
  },
  explorer: {
    look: [
      (v, c) => L([`{you}、その ${v}、旅に似合いそうだね。`, `${c.ja}は、遠くから仲間を見つける目印になるんだ。`], [`{you}, that ${v} looks made for travel.`, `A good ${c.en} helps friends spot you from far away.`]),
      (v) => L([`お、今日は ${v} なんだ。`, `それなら、遠くからでもきみだってすぐ分かるね。`], [`Oh, the ${v} today.`, `I’d spot you from far away with that.`]),
    ],
    gossip: [
      (v, n, p) => L([`さっき${p.ja}のあたりで、${n} とすれ違ったよ。`, `${v} が目印になって、遠くからでも分かった。`], [`I passed ${n} near ${p.en} earlier.`, `That ${v} made them easy to spot from afar.`]),
      (v, n, p) => L([`${n} を探してるなら、${p.ja}のほうに行ってみて。`, `${v} の子だから、すぐ見つかるよ。`], [`If you’re looking for ${n}, try near ${p.en}.`, `They’re the one with the ${v} — easy to find.`]),
    ],
    star: [
      (v) => L([`今日の主役 {star} は、${v} なんだって。`, `旅の目印にしたいくらい、目立つね。`], [`Today’s star {star} has the ${v}.`, `Stands out enough to navigate by.`]),
      (v) => L([`{star} の銅像、${v} がよく見える角度があるんだ。`, `噴水のまわりを、ぐるっと歩いてみて。`], [`There’s an angle where the ${v} on the {star} statue really shows.`, `Take a walk around the fountain.`]),
    ],
    self: [
      (v, c) => L([`わたしの ${v}、旅のあいだずっといっしょなんだ。`, `${c.ja}を見ると、歩いた道を思い出すよ。`], [`My ${v} has been with me on every trip.`, `Looking at my ${c.en} reminds me of every road I’ve walked.`]),
      (v) => L([`この ${v}、どこへ行っても目印にされるんだ。`, `「あの ${v} の人」って、けっこう覚えてもらえるよ。`], [`Everywhere I go, people use this ${v} as a landmark.`, `“The one with the ${v}” — that’s how they remember me.`]),
    ],
  },
  sage: {
    look: [
      (v, c) => L([`{you}、その ${v}、すてきですね。`, `${c.ja}の組み合わせは、Meebits の個性そのものなんですよ。`], [`{you}, that ${v} is lovely.`, `Combinations like your ${c.en} are what make each Meebit unique.`]),
      (v) => L([`今日の ${v}、よくお似合いです。`, `同じ ${v} でも、合わせ方で印象が変わるのが面白いですね。`], [`The ${v} suits you very well today.`, `Fascinating how the same ${v} changes with what it’s paired with.`]),
    ],
    gossip: [
      (v, n, p) => L([`さきほど、${p.ja}のあたりで ${n} さんをお見かけしました。`, `${v} が印象的な方でしたよ。`], [`I saw ${n} near ${p.en} a moment ago.`, `The ${v} was quite striking.`]),
      (v, n, p) => L([`${n} さんをご存じですか？`, `${v} の方で、${p.ja}のほうにいらっしゃいました。`], [`Do you know ${n}?`, `The one with the ${v}. They were near ${p.en}.`]),
    ],
    star: [
      (v, c) => L([`今日の主役 {star} は、${v} なんですよ。`, `銅像でも、${c.ja}の特徴がよく分かりますね。`], [`Today’s star {star} has the ${v}.`, `Even as a statue, you can see the ${c.en} clearly.`]),
      (v) => L([`{star} の ${v}、なかなかめずらしい組み合わせです。`, `近くでご覧になってみてください。`], [`{star}’s ${v} is quite a rare combination.`, `Do take a closer look.`]),
    ],
    self: [
      (v, c) => L([`わたしの ${v} ですか？`, `${c.ja}には、その人の考え方が出ると言われているんですよ。`], [`My ${v}?`, `They say your ${c.en} reflects how you think.`]),
      (v) => L([`この ${v}、気に入っているんです。`, `同じ ${v} の方を見かけると、つい親近感がわきますね。`], [`I’m rather fond of this ${v}.`, `Whenever I see someone else in a ${v}, I feel a little kinship.`]),
    ],
  },
  robot: {
    look: [
      (v) => L([`ピピッ。{you} ノ ${v} ヲ検知。`, `評価：トテモ、ヨク似合ッテイマス。`], [`BEEP. {you}’s ${v} detected.`, `Assessment: suits you very well.`]),
      (v, c) => L([`{you} ノ${c.ja}ヲ、記録シマシタ。`, `${v}。…本機モ、欲シイデス。`], [`{you}’s ${c.en}: recorded.`, `${v}. …This unit wants one too.`]),
    ],
    gossip: [
      (v, n, p) => L([`${n} ヲ、${p.ja}付近デ検知シマシタ。`, `特徴：${v}。以上、報告デシタ。`], [`${n} detected near ${p.en}.`, `Feature: ${v}. End of report.`]),
      (v, n, p) => L([`${n} ハ、${p.ja}ノ近クニイマス。`, `${v} ヲ目印ニ、探シテクダサイ。`], [`${n} is located near ${p.en}.`, `Use the ${v} as a marker.`]),
    ],
    star: [
      (v) => L([`本日ノ主役 {star} ノ特徴：${v}。`, `銅像ノ再現度ハ、高イト判定シマス。`], [`Today’s star {star}. Feature: ${v}.`, `Statue accuracy: high.`]),
      (v) => L([`{star} ノ ${v}。`, `本機ノ頭部ニモ、装備デキルカ検討中。`], [`{star}’s ${v}.`, `Evaluating whether this unit can equip one.`]),
    ],
    self: [
      (v, c) => L([`本機ノ装備：${v}。`, `${c.ja}ノ状態ハ、良好デス。`], [`This unit’s equipment: ${v}.`, `${capital(c.en)} status: good.`]),
      (v) => L([`コノ ${v} ハ、本機ノオ気ニ入リデス。`, `…オ気ニ入リ、トイウ感覚ヲ、最近覚エマシタ。`], [`This ${v} is this unit’s favorite.`, `…I recently learned the feeling called “favorite.”`]),
    ],
  },
}

function capital(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function hash(a: number, b: number) {
  return Math.imul(a ^ Math.imul(b, 2654435761), 1597334677) >>> 0
}

/**
 * いまの状況から、話題の候補を作る（どれを話すかは会話の組み立て側が選ぶ）。
 * 同じ話題でも、使うトレイトや来場者を会話の回数で入れかえる。
 */
export function buildDynamicScripts(
  p: PersonalityId,
  data: DynamicTalkData,
  seed: number,
  talkCount: number,
): Array<{ script: TalkScript; weight: number }> {
  const t = TEMPLATES[p]
  const out: Array<{ script: TalkScript; weight: number }> = []
  const make = (id: string, lines: Lines, weight: number) =>
    out.push({ script: { id: `${p}-dyn-${id}`, p, kind: 'topic', ja: lines.ja, en: lines.en }, weight })

  const mine = traitsOf(data.playerTraits)
  if (mine.length > 0) {
    t.look.forEach((tpl, i) => {
      const trait = mine[hash(seed + i * 7, talkCount) % mine.length]
      make(`look-${i}-${trait.value}`, tpl(trait.value, trait.cat), 2)
    })
  }

  const others = data.others.filter((o) => traitsOf(o.traits).length > 0)
  if (others.length > 0) {
    t.gossip.forEach((tpl, i) => {
      const other = others[hash(seed + i * 11, talkCount) % others.length]
      const traits = traitsOf(other.traits)
      const trait = traits[hash(other.meebitNumber, talkCount) % traits.length]
      make(`gossip-${i}-${other.meebitNumber}`, tpl(trait.value, `#${other.meebitNumber}`, other.place), 2)
    })
  }

  const own = traitsOf(data.selfTraits)
  if (own.length > 0) {
    t.self.forEach((tpl, i) => {
      const trait = own[hash(seed + i * 17, talkCount) % own.length]
      make(`self-${i}-${trait.value}`, tpl(trait.value, trait.cat), 2)
    })
  }

  const star = traitsOf(data.featuredTraits)
  if (star.length > 0) {
    t.star.forEach((tpl, i) => {
      const trait = star[hash(seed + i * 13, talkCount) % star.length]
      make(`star-${i}-${trait.value}`, tpl(trait.value, trait.cat), 1)
    })
  }
  return out
}
