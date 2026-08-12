import type { MeebitTraitMap } from '../../data/meebitTraits'
import { getLocale } from '../../i18n/locale'
import type { DialogueLine } from '../../npc/npcTypes'
import { SERGITO_MEEBIT_ID } from '../config'
import {
  SERGITO_CATEGORY_COMMENTS,
  SERGITO_CLOSINGS,
  SERGITO_FALLBACK_DIALOGUES,
  SERGITO_GREETINGS,
  SERGITO_SPECIAL_DIALOGUES,
  SERGITO_TRAIT_SPECIFIC,
  TRAIT_KEY_TO_CATEGORY,
  type LocalizedText,
  type SergitoDialogueCategory,
} from './sergitoDialogueData'

export type SergitoDialogueContext = {
  meebitId: number
  traits: MeebitTraitMap | null
  talkCount: number
}

/** 1会話は最大2行。挨拶・観察・組み合わせ・締めをランダムに組み合わせる */
const SERGITO_LINES_PER_TALK = 2

type TraitFeature = {
  id: string
  category: SergitoDialogueCategory
  ja: string
  en: string
  impact: number
}

type TalkBeat = {
  text: LocalizedText
  category: SergitoDialogueCategory
}

const COLOR_JA: Record<string, string> = {
  Black: '黒',
  Blue: '青',
  Brown: 'ブラウン',
  Camo: 'カモ',
  Cyan: 'シアン',
  Gold: 'ゴールド',
  Gray: 'グレー',
  Green: 'グリーン',
  'Light Blue': 'ライトブルー',
  Orange: 'オレンジ',
  Pink: 'ピンク',
  Purple: 'パープル',
  Red: '赤',
  Silver: 'シルバー',
  Tan: 'タン',
  Teal: 'ティール',
  White: '白',
  Yellow: 'イエロー',
}

function pickLocalized(text: LocalizedText) {
  return getLocale() === 'ja' ? text.ja : text.en
}

function pickFromPool(pool: LocalizedText[], seed: number, talkCount: number) {
  return pool[seededIndex(seed, talkCount, pool.length)]
}

function resolveTraitSpecificPool(traitKey: string, value: string): LocalizedText[] | null {
  const byValue = SERGITO_TRAIT_SPECIFIC[traitKey]
  if (!byValue) return null

  const exact = byValue[value]
  if (exact?.length) return exact

  let bestKey = ''
  for (const key of Object.keys(byValue)) {
    if (!byValue[key]?.length) continue
    if (value.startsWith('No ') && !key.startsWith('No ')) continue
    const hit = value.includes(key) || key.includes(value)
    if (hit && key.length > bestKey.length) bestKey = key
  }
  return bestKey ? byValue[bestKey] : null
}

/** そのMeebitが持っている trait の固有セリフを全部集め、会話ごとに別の行を出す */
function pickTraitSpecificFromMeebit(
  traits: MeebitTraitMap,
  meebitId: number,
  talkCount: number,
): TalkBeat | null {
  const hits: TalkBeat[] = []
  for (const traitKey of Object.keys(SERGITO_TRAIT_SPECIFIC)) {
    const value = getTrait(traits, traitKey)
    if (!value) continue
    const pool = resolveTraitSpecificPool(traitKey, value)
    if (!pool?.length) continue
    const category = TRAIT_KEY_TO_CATEGORY[traitKey] ?? 'overall'
    for (const text of pool) {
      hits.push({ text, category })
    }
  }
  if (!hits.length) return null
  return hits[seededIndex(meebitId + 17, talkCount, hits.length)]
}

function seededIndex(seed: number, talkCount: number, length: number) {
  if (length <= 0) return 0
  return Math.abs((seed * 17 + talkCount * 31 + 7) % length)
}

function toLine(id: string, text: string, category: SergitoDialogueCategory): DialogueLine {
  return { id, text, category: category === 'special' || category === 'fallback' ? 'greeting' : category === 'closing' ? 'greeting' : category === 'body' ? 'meebits' : 'daily' }
}

function getTrait(traits: MeebitTraitMap, key: string) {
  const value = traits[key]
  return value && value !== 'No' ? value : null
}

function colorJa(value: string) {
  return COLOR_JA[value] ?? value
}

function featureNoun(id: string, value: string): { ja: string; en: string } | null {
  if (id === 'hair') return { ja: '髪', en: 'Hair' }
  if (id === 'beard') {
    if (/mask|mustache|muttonchops/i.test(value)) return null
    return { ja: '髭', en: 'Beard' }
  }
  if (id === 'glasses' && !/glasses|specs|sunglasses/i.test(value)) {
    return { ja: 'メガネ', en: 'Glasses' }
  }
  return null
}

function makeStyledFeature({
  id,
  value,
  color,
  category,
  impact,
}: {
  id: string
  value: string | null
  color?: string | null
  category: SergitoDialogueCategory
  impact: number
}): TraitFeature | null {
  if (!value) return null
  const noun = featureNoun(id, value)
  const labeledJa = noun ? `「${value}」の${noun.ja}` : `「${value}」`
  const labeledEn = noun ? `${value} ${noun.en}` : value
  return {
    id,
    category,
    ja: color ? `${colorJa(color)}の${labeledJa}` : labeledJa,
    en: color ? `${color} ${labeledEn}` : labeledEn,
    impact,
  }
}

/**
 * 色を単独traitとして扱わず、対応する服や髪へ結合する。
 * これにより「赤がいい」ではなく「赤のジャケットが主役」と具体的に褒められる。
 */
function buildFeatures(traits: MeebitTraitMap): TraitFeature[] {
  const features: Array<TraitFeature | null> = []
  const type = getTrait(traits, 'Type')

  if (type && type !== 'Human') {
    // Type名はカタカナ化せず、Trait表記どおり Pig / Robot 等を使う。
    features.push({
      id: 'type',
      category: 'body',
      ja: `「${type}」`,
      en: `${type} body`,
      impact: 100,
    })
  }

  features.push(
    makeStyledFeature({
      id: 'overshirt',
      value: getTrait(traits, 'Overshirt'),
      color: getTrait(traits, 'Overshirt Color'),
      category: 'clothing',
      impact: 92,
    }),
    makeStyledFeature({
      id: 'hat',
      value: getTrait(traits, 'Hat'),
      color: getTrait(traits, 'Hat Color'),
      category: 'head',
      impact: 90,
    }),
    makeStyledFeature({
      id: 'glasses',
      value: getTrait(traits, 'Glasses'),
      category: 'face',
      impact: 88,
    }),
    makeStyledFeature({
      id: 'shirt',
      value: getTrait(traits, 'Shirt'),
      color: getTrait(traits, 'Shirt Color'),
      category: 'clothing',
      impact: 84,
    }),
    makeStyledFeature({
      id: 'pants',
      value: getTrait(traits, 'Pants'),
      color: getTrait(traits, 'Pants Color'),
      category: 'clothing',
      impact: 76,
    }),
    makeStyledFeature({
      id: 'shoes',
      value: getTrait(traits, 'Shoes'),
      color: getTrait(traits, 'Shoes Color'),
      category: 'overall',
      impact: 68,
    }),
    makeStyledFeature({
      id: 'earring',
      value: getTrait(traits, 'Earring'),
      category: 'face',
      impact: 66,
    }),
  )

  // Human 以外は Hair Style がほぼ Bald 固定なので言及しない。代わりに他特徴へ寄せる。
  if (!type || type === 'Human') {
    features.push(
      makeStyledFeature({
        id: 'hair',
        value: getTrait(traits, 'Hair Style'),
        color: getTrait(traits, 'Hair Color'),
        category: 'head',
        impact: 82,
      }),
      makeStyledFeature({
        id: 'beard',
        value: getTrait(traits, 'Beard'),
        color: getTrait(traits, 'Beard Color'),
        category: 'face',
        impact: 74,
      }),
    )
  }

  if (getTrait(traits, 'Tattoo')) {
    features.push({
      id: 'tattoo',
      category: 'overall',
      ja: 'タトゥー',
      en: 'tattoo',
      impact: 64,
    })
  }

  return features.filter((feature): feature is TraitFeature => feature !== null)
}

function takeTalkWindow(pool: LocalizedText[], seed: number, talkCount: number): LocalizedText[] {
  if (pool.length <= SERGITO_LINES_PER_TALK) return pool
  const start = seededIndex(seed, talkCount, pool.length - SERGITO_LINES_PER_TALK + 1)
  return pool.slice(start, start + SERGITO_LINES_PER_TALK)
}

function buildSpecialDialogue(talkCount: number): DialogueLine[] {
  const pool = SERGITO_SPECIAL_DIALOGUES[seededIndex(SERGITO_MEEBIT_ID, talkCount, SERGITO_SPECIAL_DIALOGUES.length)]
  return takeTalkWindow(pool, SERGITO_MEEBIT_ID + 3, talkCount).map((line, index) =>
    toLine(`sergito-special-${index}`, pickLocalized(line), 'special'),
  )
}

function buildFallbackDialogue(talkCount: number): DialogueLine[] {
  const pool = SERGITO_FALLBACK_DIALOGUES[seededIndex(0, talkCount, SERGITO_FALLBACK_DIALOGUES.length)]
  return takeTalkWindow(pool, 5, talkCount).map((line, index) =>
    toLine(`sergito-fallback-${index}`, pickLocalized(line), 'fallback'),
  )
}

function rotateFeatures(features: TraitFeature[], seed: number, talkCount: number) {
  const sorted = [...features].sort((a, b) => b.impact - a.impact)
  if (sorted.length < 2) return sorted

  // 再訪時は主役traitをずらし、同じMeebitでも別の魅力を話す。
  const focusWindow = Math.min(sorted.length, 6)
  const focusIndex = seededIndex(seed, talkCount, focusWindow)
  const [focus] = sorted.splice(focusIndex, 1)
  return [focus, ...sorted]
}

function joinJa(features: TraitFeature[]) {
  return features.map((feature) => feature.ja).join('、')
}

function joinEn(features: TraitFeature[]) {
  const labels = features.map((feature) => feature.en)
  if (labels.length <= 1) return labels[0] ?? ''
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, and ${labels.at(-1)}`
}

function getCategoryOpenings(feature: TraitFeature): LocalizedText[] {
  const byCategory: Partial<Record<SergitoDialogueCategory, LocalizedText[]>> = {
    body: [
      {
        ja: `${feature.ja}のシルエット、ものすごくきれいだ。立ってるだけで絵になるね。`,
        en: `The silhouette of that ${feature.en} is beautiful. You look composed just standing there.`,
      },
      {
        ja: `${feature.ja}って、こんなに表情が出るんだ。近くで見るとますます好きになる。`,
        en: `I did not know a ${feature.en} could have this much expression. It gets better up close.`,
      },
      {
        ja: `その${feature.ja}、存在感がすごいな。服に着られず、全部自分のものにしてる。`,
        en: `That ${feature.en} has serious presence. The clothes do not wear you — you own all of it.`,
      },
      {
        ja: `${feature.ja}ならではの輪郭が、今日のスタイルにぴったりはまってる。`,
        en: `The distinct shape of the ${feature.en} fits today's whole look perfectly.`,
      },
      {
        ja: `まず${feature.ja}に拍手したい。どの角度から見てもキャラクターが立ってるよ。`,
        en: `First, applause for that ${feature.en}. It has character from every angle.`,
      },
    ],
    clothing: [
      {
        ja: `${feature.ja}を選ぶセンス、かなり信頼できる。主張があるのに着こなしは自然だ。`,
        en: `I trust anyone who chooses ${feature.en}. It makes a statement, but you wear it effortlessly.`,
      },
      {
        ja: `${feature.ja}が今日のルックの芯だね。ここが決まってるから、全体がぶれない。`,
        en: `The ${feature.en} is the backbone of this look. It keeps everything else perfectly grounded.`,
      },
      {
        ja: `その${feature.ja}、ただ似合うだけじゃない。ちゃんと君の服になってる。`,
        en: `That ${feature.en} does more than suit you. It already feels completely yours.`,
      },
      {
        ja: `${feature.ja}の見せ方がうまいなあ。目立つのに、全体を食ってない。`,
        en: `You know exactly how to show off the ${feature.en}. It stands out without swallowing the look.`,
      },
      {
        ja: `お、その${feature.ja}！ それを中心に組み立てたなら、狙いは大成功だよ。`,
        en: `Oh, that ${feature.en}! If you built the look around it, the plan worked beautifully.`,
      },
      {
        ja: `${feature.ja}、色も形も今の君にしっくりきてる。これは替えたくなくなるね。`,
        en: `The color and shape of that ${feature.en} feel made for you. Hard to imagine changing it.`,
      },
    ],
    head: [
      {
        ja: `${feature.ja}で輪郭が一気に決まってる。遠くからでも君だってわかるよ。`,
        en: `The ${feature.en} locks in your whole silhouette. I would know it was you from across the room.`,
      },
      {
        ja: `その${feature.ja}、顔まわりの完成度をぐっと上げてる。選び方がうまい。`,
        en: `That ${feature.en} lifts the whole face area. Excellent choice.`,
      },
      {
        ja: `${feature.ja}がいいアクセントだね。見た瞬間、ちょっと嬉しくなった。`,
        en: `The ${feature.en} is such a good accent. It made me smile the moment I saw it.`,
      },
      {
        ja: `正直、その${feature.ja}はずるい。ひと目で好きになるシルエットだ。`,
        en: `Honestly, that ${feature.en} is almost unfair. It is a silhouette you love on sight.`,
      },
      {
        ja: `${feature.ja}に目が行って、それから全身を見たくなる。視線の流れまでできてるよ。`,
        en: `The ${feature.en} catches your eye, then invites you to take in the whole look. Great visual flow.`,
      },
      {
        ja: `その${feature.ja}、ちゃんと遊び心があるのに子どもっぽくない。絶妙だね。`,
        en: `That ${feature.en} is playful without feeling childish. Beautifully judged.`,
      },
    ],
    face: [
      {
        ja: `${feature.ja}が表情を作ってるね。無言でもキャラクターが伝わってくる。`,
        en: `The ${feature.en} gives the face a whole expression. Your character comes through without a word.`,
      },
      {
        ja: `その${feature.ja}、顔にリズムが生まれていいな。ずっと見ていられる。`,
        en: `That ${feature.en} gives the face such a good rhythm. I could keep looking.`,
      },
      {
        ja: `${feature.ja}が効いてる！ 小さなディテールなのに、印象はすごく大きい。`,
        en: `The ${feature.en} really lands! A small detail with a huge effect.`,
      },
      {
        ja: `その${feature.ja}があるだけで、どんな性格なのか想像したくなるよ。`,
        en: `That ${feature.en} alone makes me want to imagine your whole personality.`,
      },
      {
        ja: `${feature.ja}を入れたことで、顔が一気に忘れられなくなってる。`,
        en: `Adding the ${feature.en} makes the face instantly unforgettable.`,
      },
      {
        ja: `近くで見て正解だった。その${feature.ja}、思ってた以上にいい仕事してる。`,
        en: `I am glad I looked closer. That ${feature.en} is doing even more than I first thought.`,
      },
    ],
    overall: [
      {
        ja: `${feature.ja}まで気を抜いてないのがいい。全身でひとつのルックになってる。`,
        en: `I love that you did not neglect the ${feature.en}. The look works from head to toe.`,
      },
      {
        ja: `最後に${feature.ja}で締めるの、わかってるね。全体がぐっと引き締まった。`,
        en: `Finishing with the ${feature.en} shows real instinct. It pulls the whole look together.`,
      },
      {
        ja: `${feature.ja}を見て、このMeebitは細部まで強いって確信したよ。`,
        en: `The ${feature.en} convinced me this Meebit is strong right down to the details.`,
      },
      {
        ja: `その${feature.ja}、脇役に見えて実はかなり大事だ。バランスを作ってる。`,
        en: `That ${feature.en} may look secondary, but it is doing important work for the balance.`,
      },
      {
        ja: `${feature.ja}まで含めて抜かりなし。どこで切り取っても君らしい。`,
        en: `Nothing is accidental, right down to the ${feature.en}. Every crop still feels like you.`,
      },
    ],
  }
  const commentCategory = feature.category as keyof typeof SERGITO_CATEGORY_COMMENTS
  const categoryComments =
    commentCategory in SERGITO_CATEGORY_COMMENTS ? SERGITO_CATEGORY_COMMENTS[commentCategory] : undefined
  return [...(byCategory[feature.category] ?? []), ...(categoryComments ?? [])]
}

function buildOpening(feature: TraitFeature, seed: number, talkCount: number): LocalizedText {
  const genericOpenings: LocalizedText[] = [
    {
      ja: `待って、${feature.ja}が最高だ。そこを主役にしたの、大正解。`,
      en: `Wait — the ${feature.en} is fantastic. Making that the star was exactly right.`,
    },
    {
      ja: `おお、まず${feature.ja}に目を奪われた。これは強い。`,
      en: `Oh, the ${feature.en} grabbed me immediately. That is a strong choice.`,
    },
    {
      ja: `${feature.ja}、めちゃくちゃ似合ってる。入ってきた瞬間に空気が変わったよ。`,
      en: `That ${feature.en} looks incredible on you. The room changed when you walked in.`,
    },
    {
      ja: `いいね！ ${feature.ja}だけで、もう物語が始まってる。`,
      en: `Yes! The ${feature.en} already tells a whole story.`,
    },
    {
      ja: `なるほど、${feature.ja}を持ってきたか。見れば見るほど、この選択が効いてくる。`,
      en: `I see — you went with ${feature.en}. The longer I look, the smarter that choice feels.`,
    },
    {
      ja: `ちょっと一周見せて。うん、やっぱり${feature.ja}が抜群にいい。`,
      en: `Give me one full turn. Yes — the ${feature.en} is exceptionally good.`,
    },
    {
      ja: `入ってきた時から気になってたんだ。その${feature.ja}、ものすごく君らしい。`,
      en: `I noticed it the moment you walked in. That ${feature.en} feels completely you.`,
    },
    {
      ja: `これは好きだな。${feature.ja}に、ちゃんと選んだ理由が見える。`,
      en: `I love this. The ${feature.en} feels chosen with real intention.`,
    },
    {
      ja: `その${feature.ja}、写真より実物のほうがずっといい。空気まで含めて似合ってる。`,
      en: `That ${feature.en} is even better in person. It suits your whole presence.`,
    },
    {
      ja: `いいところを突いてくるね。${feature.ja}があるから、ありきたりで終わってない。`,
      en: `That is exactly the right move. The ${feature.en} keeps the look from ever feeling ordinary.`,
    },
    {
      ja: `うん、${feature.ja}は残したい。これが君のサインみたいになってる。`,
      en: `Yes, keep the ${feature.en}. It has become something like your signature.`,
    },
    {
      ja: `最初の一秒で${feature.ja}に目が行ったよ。強いけど、ちゃんと品がある。`,
      en: `My eye went straight to the ${feature.en}. Strong, but still beautifully composed.`,
    },
    {
      ja: `作業の手、止まったよ。その${feature.ja}、近くで見たかった。`,
      en: `You stopped my hands. I wanted a closer look at that ${feature.en}.`,
    },
    {
      ja: `棚にも似たのはある。でもその${feature.ja}は、歩いてるほうがいい。`,
      en: `I’ve got something like it on the shelf. That ${feature.en} looks better walking.`,
    },
    {
      ja: `今日の工房、その${feature.ja}が来て完成した感じだ。`,
      en: `The workshop feels finished now that that ${feature.en} walked in.`,
    },
  ]
  const openings = [...getCategoryOpenings(feature), ...genericOpenings]
  return openings[seededIndex(seed + feature.id.length, talkCount, openings.length)]
}

function getSynergyTemplates(
  focus: TraitFeature,
  picked: TraitFeature[],
  jaTraits: string,
  enTraits: string,
): LocalizedText[] {
  const categories = new Set([focus, ...picked].map((feature) => feature.category))
  const templates: LocalizedText[] = []

  if (categories.has('head') && categories.has('face')) {
    templates.push(
      {
        ja: `${focus.ja}と${jaTraits}で、顔まわりにちゃんと物語がある。表情まで違って見えるよ。`,
        en: `The ${focus.en} with ${enTraits} tells a story around the face. It changes the whole expression.`,
      },
      {
        ja: `${jaTraits}が${focus.ja}をうまく受け止めてる。上半身だけでも忘れられない組み合わせだ。`,
        en: `${enTraits} balance the ${focus.en} beautifully. The upper silhouette alone is unforgettable.`,
      },
      {
        ja: `顔は${jaTraits}、頭は${focus.ja}。見る順番が自然にできる。`,
        en: `Face is ${enTraits}, head is the ${focus.en}. The eye knows where to go.`,
      },
    )
  }

  if (categories.has('head') && categories.has('clothing')) {
    templates.push(
      {
        ja: `${focus.ja}のあと、服の${jaTraits}に目が落ちる。上から下がつながってる。`,
        en: `After the ${focus.en}, the eye drops to ${enTraits}. Top to bottom, it connects.`,
      },
      {
        ja: `頭の${focus.ja}に、${jaTraits}が負けてない。`,
        en: `${enTraits} hold their own against the ${focus.en} up top.`,
      },
    )
  }

  if (categories.has('face') && categories.has('clothing')) {
    templates.push(
      {
        ja: `${jaTraits}があるから、顔だけ見て終わらない。`,
        en: `${enTraits} keep you from stopping at the face.`,
      },
      {
        ja: `顔の${focus.ja}と、${jaTraits}。距離が違うのに、同じMeebitに見える。`,
        en: `The ${focus.en} on the face, then ${enTraits}. Different distance, same Meebit.`,
      },
    )
  }

  if (picked.filter((feature) => feature.category === 'clothing').length >= 2) {
    templates.push(
      {
        ja: `${jaTraits}の重ね方、かなり上手だ。単品で強い服同士なのに、けんかしてない。`,
        en: `The layering between ${enTraits} is excellent. Strong pieces, yet none of them fight.`,
      },
      {
        ja: `${focus.ja}から${jaTraits}まで、ちゃんとひとつのコーデとして読める。完成度が高いよ。`,
        en: `From the ${focus.en} through ${enTraits}, it reads as one complete outfit. Beautifully resolved.`,
      },
      {
        ja: `${jaTraits}で色と形のテンポができてる。服を並べただけじゃなく、ちゃんと編集してるね。`,
        en: `${enTraits} create a real tempo of color and shape. This is styled, not merely assembled.`,
      },
      {
        ja: `${jaTraits}、一枚ずつなら普通なのに、重ねると君になる。`,
        en: `${enTraits} look ordinary one by one. Together, they become you.`,
      },
    )
  }

  if (categories.has('body')) {
    const bodyFeature = [focus, ...picked].find((feature) => feature.category === 'body')
    templates.push(
      {
        ja: `${bodyFeature?.ja ?? 'ボディ'}の個性に${jaTraits}が負けてない。それどころか、輪郭の魅力をもっと引き出してる。`,
        en: `${enTraits} hold their own against the ${bodyFeature?.en ?? 'body'} — they bring even more out of its silhouette.`,
      },
      {
        ja: `${jaTraits}を合わせたことで、シルエットが上から下まできれいにつながってる。`,
        en: `Adding ${enTraits} makes the silhouette flow cleanly from top to bottom.`,
      },
      {
        ja: `${bodyFeature?.ja ?? 'その形'}に${jaTraits}を乗せるの、工房向きだ。`,
        en: `${enTraits} on that ${bodyFeature?.en ?? 'shape'} belong in a workshop.`,
      },
    )
  }

  if (categories.has('overall')) {
    templates.push(
      {
        ja: `${jaTraits}まで見ると、偶然じゃなくて全部狙ってるのがわかる。細部まで気持ちいいよ。`,
        en: `Once I notice ${enTraits}, I can tell none of this is accidental. The details are deeply satisfying.`,
      },
      {
        ja: `最後に${jaTraits}。そこで全体が締まる。`,
        en: `Then ${enTraits} at the end. That’s what tightens the whole look.`,
      },
    )
  }

  return templates
}

function buildCombination(
  focus: TraitFeature,
  supporting: TraitFeature[],
  seed: number,
  talkCount: number,
): LocalizedText {
  // 列挙は少なめ。1つだけの回を多めにして、同じリズムにしない。
  const pickedCount = supporting.length >= 2 && (seed + talkCount) % 5 === 0 ? 2 : 1
  const picked = supporting.slice(0, pickedCount)
  const jaTraits = joinJa(picked)
  const enTraits = joinEn(picked)
  const generalTemplates: LocalizedText[] = [
    {
      ja: `${jaTraits}まで全部つながってる。派手な要素を重ねてるのに、ちゃんと君のスタイルになってる。`,
      en: `Then ${enTraits} all connect. Lots of bold pieces, but together they become unmistakably yours.`,
    },
    {
      ja: `${focus.ja}に${jaTraits}を合わせる発想、かなり好き。どこを見ても発見がある。`,
      en: `Pairing the ${focus.en} with ${enTraits} is inspired. There is something to discover everywhere you look.`,
    },
    {
      ja: `${jaTraits}が脇役じゃなく、全部ちゃんと効いてる。20,000体の中でも一発で覚えるよ。`,
      en: `${enTraits} are not background details — every one lands. I would remember you instantly out of 20,000.`,
    },
    {
      ja: `${jaTraits}のリズムが気持ちいい。作り込んだのに無理して見えない、そのバランスがすごい。`,
      en: `The rhythm between ${enTraits} is so satisfying. Detailed without looking forced — that balance is rare.`,
    },
    {
      ja: `それに${jaTraits}でしょう？ 見る順番によって印象が変わる。すごく楽しいMeebitだ。`,
      en: `And then there is ${enTraits}. The impression changes as your eye moves — such a joyful Meebit to look at.`,
    },
    {
      ja: `${focus.ja}だけで終わらず、${jaTraits}でもう一段ひねってる。そこが好きだな。`,
      en: `You did not stop at the ${focus.en}; ${enTraits} add another turn. That is the part I love.`,
    },
    {
      ja: `${jaTraits}を見つけた瞬間、全体の意味がつながったよ。これは考えられた組み合わせだね。`,
      en: `The moment I noticed ${enTraits}, the whole look clicked. This combination has real thought behind it.`,
    },
    {
      ja: `近くで見ると${jaTraits}まで効いてくる。第一印象が強くて、二度目にもっと好きになる。`,
      en: `Up close, ${enTraits} start to land too. Strong first impression, even better on the second look.`,
    },
    {
      ja: `${focus.ja}と${jaTraits}、普通ならまとまりにくいのに完全に成立してる。君が着ると正解になるんだね。`,
      en: `The ${focus.en} with ${enTraits} should be hard to balance, yet it completely works. You make it feel inevitable.`,
    },
    {
      ja: `${jaTraits}がいい余韻を残してる。前から見ても、振り返っても、ちゃんと面白い。`,
      en: `${enTraits} leave a great final impression. Interesting from the front and still interesting as you turn away.`,
    },
    {
      ja: `色、形、ディテール。その全部を${jaTraits}がつないでる。かなり完成されたスタイルだよ。`,
      en: `Color, shape, detail — ${enTraits} tie all three together. This is a remarkably complete style.`,
    },
    {
      ja: `${jaTraits}まで自信を持って見せてるのがいい。似合うかどうかじゃなく、もう君のものだ。`,
      en: `I love the confidence in ${enTraits}. This is beyond whether they suit you — they belong to you now.`,
    },
    {
      ja: `この組み合わせ、きれいにまとめすぎてないのがいい。${jaTraits}がちゃんと意外性を残してる。`,
      en: `I love that this is not polished into predictability. ${enTraits} preserve exactly the right surprise.`,
    },
    {
      ja: `${jaTraits}、あとからじわじわ効いてくるね。話してる間にも好きなところが増えてるよ。`,
      en: `${enTraits} keep growing on me. I am finding more to love even while we talk.`,
    },
    {
      ja: `20,000体の中からでも、${focus.ja}と${jaTraits}を手がかりにすぐ君を見つけられる。`,
      en: `Even among 20,000, I could find you immediately by the ${focus.en} and ${enTraits}.`,
    },
    {
      ja: `${focus.ja}で惹きつけて、${jaTraits}で記憶に残す。見せ方まで完璧だね。`,
      en: `The ${focus.en} pulls me in; ${enTraits} make the memory stick. Even the presentation is perfect.`,
    },
    {
      ja: `あと${jaTraits}。そこ、最初は見てなかった。`,
      en: `And ${enTraits}. Missed that at first.`,
    },
    {
      ja: `${focus.ja}の次に目が行ったのが${jaTraits}だ。`,
      en: `After the ${focus.en}, my eye went to ${enTraits}.`,
    },
    {
      ja: `${jaTraits}もいいね。${focus.ja}の隣に置いても喧嘩しない。`,
      en: `${enTraits} work too. They don’t fight sitting next to the ${focus.en}.`,
    },
    {
      ja: `横からだと${jaTraits}のほうが先に来る。`,
      en: `From the side, ${enTraits} show up first.`,
    },
    {
      ja: `${jaTraits}、工房の光だとまた違う。`,
      en: `${enTraits} look different in this light.`,
    },
    {
      ja: `${focus.ja}を見て、${jaTraits}で納得した。`,
      en: `Saw the ${focus.en}. ${enTraits} made it click.`,
    },
    {
      ja: `${jaTraits}はおまけじゃない。ちゃんと残る。`,
      en: `${enTraits} aren’t extra. They stick.`,
    },
    {
      ja: `棚に並べたら、${jaTraits}のほうから探しそうだ。`,
      en: `On a shelf, I’d look for you by the ${enTraits}.`,
    },
    {
      ja: `${jaTraits}があるから、上だけ見て終わらない。`,
      en: `${enTraits} keep you from stopping at the top.`,
    },
    {
      ja: `振り返るとき、${jaTraits}が残るタイプだ。`,
      en: `The kind where ${enTraits} linger when you turn away.`,
    },
  ]
  const templates = [
    ...getSynergyTemplates(focus, picked, jaTraits, enTraits),
    ...generalTemplates,
  ]
  return templates[seededIndex(seed + picked.length * 13, talkCount, templates.length)]
}

function assembleTalk(beats: TalkBeat[]): DialogueLine[] {
  return beats.slice(0, SERGITO_LINES_PER_TALK).map((beat, index) =>
    toLine(`sergito-${index}`, pickLocalized(beat.text), beat.category),
  )
}

export function createSergitoDialogue(context: SergitoDialogueContext): DialogueLine[] {
  if (context.meebitId === SERGITO_MEEBIT_ID) {
    return buildSpecialDialogue(context.talkCount)
  }

  if (!context.traits) {
    return buildFallbackDialogue(context.talkCount)
  }

  const features = rotateFeatures(buildFeatures(context.traits), context.meebitId, context.talkCount)
  const focus = features[0]
  if (!focus) {
    return buildFallbackDialogue(context.talkCount)
  }

  const greeting: TalkBeat = {
    text: pickFromPool(SERGITO_GREETINGS, context.meebitId, context.talkCount),
    category: 'greeting',
  }
  const closing: TalkBeat = {
    text: pickFromPool(SERGITO_CLOSINGS, context.meebitId + 11, context.talkCount),
    category: 'closing',
  }
  const observation: TalkBeat =
    pickTraitSpecificFromMeebit(context.traits, context.meebitId, context.talkCount) ?? {
      text: buildOpening(focus, context.meebitId, context.talkCount),
      category: focus.category,
    }
  const supporting = features.slice(1)
  const combination: TalkBeat | null = supporting.length
    ? {
        text: buildCombination(focus, supporting, context.meebitId, context.talkCount),
        category: 'overall',
      }
    : null

  if (combination && seededIndex(context.meebitId + 23, context.talkCount, 4) === 0) {
    return assembleTalk([observation, combination])
  }

  const patterns: TalkBeat[][] = [
    [greeting, observation],
    [observation, closing],
  ]
  return assembleTalk(patterns[seededIndex(context.meebitId + 19, context.talkCount, patterns.length)])
}
