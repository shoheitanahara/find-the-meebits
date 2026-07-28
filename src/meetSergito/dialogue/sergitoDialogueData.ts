export type LocalizedText = {
  ja: string
  en: string
}

export type SergitoDialogueCategory =
  | 'greeting'
  | 'body'
  | 'clothing'
  | 'head'
  | 'face'
  | 'color'
  | 'overall'
  | 'closing'
  | 'special'
  | 'fallback'

export const SERGITO_GREETINGS: LocalizedText[] = [
  { ja: 'やあ、ようこそ。', en: 'Hey, welcome in.' },
  { ja: '来てくれてありがとう。', en: 'Thanks for stopping by.' },
  { ja: 'お、見せに来てくれたんだね。', en: 'Oh, you came to show me.' },
  { ja: 'いいね、そのMeebit。', en: 'Nice Meebit you’ve got there.' },
  { ja: 'ちょうど作業を休もうと思ってたんだ。', en: 'Perfect timing — I was about to take a break.' },
  { ja: 'お、面白いMeebitが来たね。', en: 'Oh, an interesting one just walked in.' },
]

export const SERGITO_CLOSINGS: LocalizedText[] = [
  { ja: 'また別のMeebitでも遊びに来てよ。', en: 'Come back with a different Meebit sometime.' },
  { ja: 'いいものを見せてもらったよ。', en: 'Appreciate you showing me.' },
  { ja: 'またいつでも寄って。', en: 'Drop by anytime.' },
  { ja: '工房はいつでも開けておくよ。', en: 'The workshop door stays open.' },
  { ja: '次に会う時は、また違って見えるかもね。', en: 'Next time you might look different again.' },
  { ja: 'こういう出会いがあるから、Meebitsは面白いんだ。', en: 'That’s what makes Meebits fun — moments like this.' },
]

export const SERGITO_CATEGORY_COMMENTS: Record<
  Exclude<SergitoDialogueCategory, 'greeting' | 'closing' | 'special' | 'fallback'>,
  LocalizedText[]
> = {
  body: [
    { ja: 'そのボディ、近くで見ると細かい作りが面白いね。', en: 'Up close, that body type has some great details.' },
    { ja: '体のシルエットがはっきりしてて、覚えやすい。', en: 'The silhouette reads clearly — easy to remember.' },
    { ja: 'こういうタイプは、工房に置いても違和感がないな。', en: 'A type like this fits right in around the workshop.' },
    { ja: '形から個性が出てるね。', en: 'The shape alone says a lot.' },
  ],
  clothing: [
    { ja: 'その服、かなり似合ってるね。', en: 'Those clothes really suit you.' },
    { ja: 'その格好、全体のまとまりがいい。', en: 'That outfit hangs together nicely.' },
    { ja: '服の選び方にちゃんと個性があるね。', en: 'You can tell there’s taste in the outfit pick.' },
    { ja: 'そのスーツは存在感があるな。', en: 'That suit has real presence.' },
    { ja: '派手だけど、ちゃんとまとまってる。', en: 'Bold, but it still works as a whole.' },
    { ja: '工房でも目立つ組み合わせだね。', en: 'Even in here, that combo stands out.' },
  ],
  head: [
    { ja: 'その帽子、かなり効いてるね。', en: 'That hat really works on you.' },
    { ja: '頭まわりのシルエットがいい。', en: 'Great silhouette around the head.' },
    { ja: '遠くからでもすぐ見つけられそうだ。', en: 'You’d spot that from across the room.' },
    { ja: 'その髪型、Meebitらしくて好きだな。', en: 'That hair feels very Meebit — I like it.' },
    { ja: '顔まわりとのバランスがいいね。', en: 'Nice balance with the face.' },
    { ja: 'その組み合わせは覚えやすい。', en: 'That combo sticks in your memory.' },
  ],
  face: [
    { ja: '顔まわりの印象が強くていいね。', en: 'Strong impression around the face — in a good way.' },
    { ja: 'そのメガネ、雰囲気が出てる。', en: 'Those glasses add a lot of character.' },
    { ja: '表情まで違って見える組み合わせだ。', en: 'The whole face reads differently because of it.' },
    { ja: '近くで見ると、細かいところが面白いね。', en: 'The little details up close are fun.' },
    { ja: 'その顔は一度見たら忘れなさそうだ。', en: 'That’s a face you wouldn’t forget.' },
    { ja: 'ディテールがちゃんと効いてる。', en: 'The details are doing their job.' },
  ],
  color: [
    { ja: 'その色、かなり目を引くね。', en: 'That color really catches the eye.' },
    { ja: '色の組み合わせがきれいだ。', en: 'The color pairing is clean.' },
    { ja: 'その柄、思った以上にまとまってる。', en: 'The pattern holds together better than you’d expect.' },
    { ja: '派手すぎないのに、ちゃんと目立つね。', en: 'Not loud, but it still pops.' },
    { ja: 'その色は、この部屋の中でもよく映える。', en: 'That color plays well in this room too.' },
    { ja: '見れば見るほど味がある色だね。', en: 'The color grows on you.' },
  ],
  overall: [
    { ja: 'そのtraitの組み合わせ、かなり覚えやすい。', en: 'That trait combo is easy to remember.' },
    { ja: 'ちゃんと個性が立ってるね。', en: 'You’ve got a clear sense of style.' },
    { ja: '工房に飾りたくなるタイプだ。', en: 'The kind I’d want on a shelf in here.' },
    { ja: 'こういう組み合わせがあるから、Meebitsは面白い。', en: 'Combos like this are why Meebits stay interesting.' },
    { ja: '見れば見るほど味があるね。', en: 'There’s more to it the longer you look.' },
    { ja: 'そのMeebit、自分のスタイルを持ってるね。', en: 'That Meebit has its own style.' },
    { ja: '20,000体いても、ちゃんと違って見えるのが面白いよね。', en: 'Out of 20,000, it still reads as its own thing.' },
  ],
}

export const SERGITO_TRAIT_SPECIFIC: Record<string, Record<string, LocalizedText[]>> = {
  Type: {
    Robot: [
      { ja: 'ロボットか。細かい作りを近くで見たくなるね。', en: 'A robot — makes you want to inspect the details up close.' },
      { ja: 'そのボディは、工房にいると妙に馴染むな。', en: 'That body feels oddly at home in the workshop.' },
    ],
    Elephant: [
      { ja: '象タイプか。存在感があっていいね。', en: 'An elephant type — great presence.' },
      { ja: '大きな形だけど、ちゃんと個性が出てる。', en: 'Big shape, but the personality comes through.' },
    ],
    Skeleton: [
      { ja: 'スケルトンか。骨格のシルエットがきれいだね。', en: 'Skeleton type — clean silhouette.' },
      { ja: 'こういう形も、並べると面白いんだよ。', en: 'Shapes like this look great lined up on a shelf.' },
    ],
    Pig: [
      { ja: '豚タイプか。愛嬌があっていいね。', en: 'Pig type — lots of charm.' },
      { ja: '珍しい形だけど、ちゃんと映える。', en: 'Unusual form, but it really works.' },
    ],
  },
  Hat: {
    'Cowboy Hat': [
      { ja: 'その帽子、ずいぶん堂々としてるね。', en: 'That hat carries itself with confidence.' },
      { ja: '工房より、広い荒野が似合いそうだ。', en: 'Feels more frontier than workshop — in a good way.' },
    ],
    'Top Hat': [
      { ja: 'シルクハットか。格式ある雰囲気だね。', en: 'A top hat — classy vibe.' },
      { ja: 'その帽子、部屋の中でも目を引くよ。', en: 'Even in here, that hat draws the eye.' },
    ],
  },
  'Hair Style': {
    Mohawk: [
      { ja: 'モヒカンか。尖り方がいいね。', en: 'Mohawk — love the angle on it.' },
      { ja: '頭の上から個性が溢れてる。', en: 'Personality spilling out from the top.' },
    ],
  },
  Glasses: {
    '3D': [
      { ja: '3Dメガネか。ちょっと遊び心があっていい。', en: '3D glasses — fun little twist.' },
      { ja: 'その顔まわり、見てて飽きなさそう。', en: 'The face area never gets boring.' },
    ],
  },
}

export const SERGITO_SPECIAL_DIALOGUES: LocalizedText[][] = [
  [
    { ja: '……あれ？', en: '…Wait.' },
    { ja: '今日は自分で来たのか。', en: 'You came as yourself today?' },
    { ja: '工房の主が二人いるみたいだね。', en: 'Looks like there are two workshop owners now.' },
  ],
  [
    { ja: 'これは少し不思議だな。', en: 'This is a little strange.' },
    { ja: 'どっちが本物かは、', en: 'Which one is real?' },
    { ja: '黙っておいたほうが面白そうだ。', en: 'Maybe more fun if I keep quiet about it.' },
  ],
  [
    { ja: 'その顔、どこかで見たことがあるな。', en: 'That face looks familiar.' },
    { ja: 'まあいいか。', en: 'Ah, never mind.' },
    { ja: '今日は工房を任せてもいい？', en: 'Mind holding down the workshop today?' },
  ],
]

export const SERGITO_FALLBACK_DIALOGUES: LocalizedText[][] = [
  [
    { ja: 'いいMeebitだね。', en: 'That’s a good Meebit.' },
    { ja: '近くで見ると、', en: 'Up close,' },
    { ja: 'ちゃんとそのMeebitだけの雰囲気がある。', en: 'it has a vibe that’s all its own.' },
    { ja: '来てくれてありがとう。', en: 'Thanks for coming by.' },
  ],
  [
    { ja: 'お、見せに来てくれたんだね。', en: 'Oh, you came to show me.' },
    { ja: '20,000体いても、', en: 'Even with 20,000 out there,' },
    { ja: '同じように見えないのが面白いよね。', en: 'none of them look quite the same.' },
    { ja: 'また寄ってよ。', en: 'Come back anytime.' },
  ],
]

/** trait キー → 会話カテゴリ */
export const TRAIT_KEY_TO_CATEGORY: Record<string, SergitoDialogueCategory> = {
  Type: 'body',
  Shirt: 'clothing',
  Overshirt: 'clothing',
  Pants: 'clothing',
  Hat: 'head',
  'Hair Style': 'head',
  Glasses: 'face',
  Beard: 'face',
  Earring: 'face',
  'Hair Color': 'color',
  'Shirt Color': 'color',
  'Overshirt Color': 'color',
  'Pants Color': 'color',
  'Hat Color': 'color',
  'Shoes Color': 'color',
  'Beard Color': 'color',
  Shoes: 'overall',
  Tattoo: 'overall',
}

/** 優先順位（高いほど先） */
export const TRAIT_CATEGORY_PRIORITY: SergitoDialogueCategory[] = [
  'body',
  'clothing',
  'head',
  'face',
  'color',
  'overall',
]

export const TRAIT_KEY_PRIORITY = [
  'Type',
  'Shirt',
  'Overshirt',
  'Pants',
  'Hat',
  'Hair Style',
  'Glasses',
  'Beard',
  'Earring',
  'Hair Color',
  'Shirt Color',
  'Overshirt Color',
  'Pants Color',
  'Hat Color',
  'Shoes Color',
  'Beard Color',
  'Shoes',
  'Tattoo',
] as const
