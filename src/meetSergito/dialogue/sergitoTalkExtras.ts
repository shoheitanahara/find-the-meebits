/**
 * Sergito の会話を飽きさせないための追加分。
 * - 来店回数と時間帯で変わるあいさつ
 * - 前回とちがう Meebit で来たときのひとこと
 * - 見た目のコメント以外の話題（工房の話）
 */
import type { ParkTimeOfDay } from '../../top/parkTimeOfDay'
import type { LocalizedText } from './sergitoDialogueData'

/** はじめて話すとき */
export const SERGITO_FIRST_MEETING: LocalizedText[][] = [
  [
    { ja: 'やあ、はじめまして。ここは海辺の工房だよ。', en: 'Hey, nice to meet you. Welcome to the beach workshop.' },
    { ja: 'Sergito っていうんだ。木を削ったり、フィギュアを作ったりしてる。', en: 'I’m Sergito. I carve wood and make figures here.' },
  ],
  [
    { ja: 'いらっしゃい。はじめて見る顔だね。', en: 'Welcome in. I don’t think I’ve seen you before.' },
    { ja: 'Sergito だよ。せっかくだから、その姿をよく見せてもらおうかな。', en: 'I’m Sergito. Since you’re here, let me get a good look at you.' },
  ],
]

/** 2〜4 回目（時間帯つきは優先） */
export const SERGITO_GREET_AGAIN: Array<{ text: LocalizedText; times?: ParkTimeOfDay[] }> = [
  { text: { ja: 'おはよう。朝の工房は、木の香りがいちばん強いんだ。', en: 'Morning. The workshop smells most like wood first thing.' }, times: ['morning'] },
  { text: { ja: 'やあ、いらっしゃい。ちょうど手を休めようと思ってたところ。', en: 'Hey, welcome. I was just about to rest my hands.' }, times: ['noon'] },
  { text: { ja: 'いらっしゃい。夕方は、窓の光が棚に当たる時間なんだ。', en: 'Welcome. Evening is when the window light hits the shelves.' }, times: ['evening'] },
  { text: { ja: 'こんばんは。夜の工房は静かで、作業がはかどるんだ。', en: 'Evening. The workshop’s quiet at night. Great for working.' }, times: ['night'] },
  { text: { ja: 'また来てくれたね。うれしいよ。', en: 'You came back. That makes me happy.' } },
  { text: { ja: 'お、いらっしゃい。今日はどんな顔を見せてくれるのかな。', en: 'Oh, welcome. Let’s see what you’ve brought me today.' } },
]

/** 5 回目以降（常連） */
export const SERGITO_GREET_REGULAR: LocalizedText[] = [
  { ja: 'お、来たね。きみの足音、もう覚えたよ。', en: 'Oh, it’s you. I know your footsteps by now.' },
  { ja: 'いらっしゃい、常連さん。今日もいいタイミングだ。', en: 'Welcome back, regular. Good timing as always.' },
  { ja: 'やあ。お茶でも出したいところだけど、ここには木くずしかないんだ。', en: 'Hey. I’d offer you tea, but all I’ve got is wood shavings.' },
  { ja: 'きみが来ると、工房の空気がちょっと明るくなるね。', en: 'The workshop feels a little brighter when you’re here.' },
]

/** 前回とちがう Meebit で来たとき */
export const SERGITO_NEW_GUEST: LocalizedText[][] = [
  [
    { ja: 'あれ、今日はちがう Meebit で来たんだね。', en: 'Oh? You came as a different Meebit today.' },
    { ja: '毎回ちがう姿で来てくれると、こっちも見がいがあるよ。', en: 'A new look every visit keeps things interesting for me.' },
  ],
  [
    { ja: 'お、今日は別の顔だ。', en: 'Oh, a different face today.' },
    { ja: 'どんな組み合わせか、じっくり見せてもらおうかな。', en: 'Let me take a good look at this combination.' },
  ],
  [
    { ja: '前とはちがう子だね。', en: 'Not the same one as last time, huh.' },
    { ja: '来るたびに新しいお客さんが来るみたいで、楽しいよ。', en: 'It’s like getting a brand-new guest every time. I like it.' },
  ],
]

/** 工房の話（見た目のコメントのかわりに出す） */
export const SERGITO_WORKSHOP_STORIES: LocalizedText[][] = [
  [
    { ja: 'いま、新しいフィギュアの土台を削ってるんだ。', en: 'I’m carving the base for a new figure right now.' },
    { ja: '木目をどっちに向けるかで、仕上がりの表情がずいぶん変わるんだよ。', en: 'Which way the grain runs changes the whole expression of the finished piece.' },
  ],
  [
    { ja: '棚のフィギュア、一体ずつ全部手で仕上げてるんだ。', en: 'Every figure on those shelves is finished by hand.' },
    { ja: '並べると似て見えるけど、近くで見ると一体ずつ顔がちがうよ。', en: 'Lined up they look alike, but up close every face is different.' },
  ],
  [
    { ja: '3D プリンターも使うけど、最後はやっぱり手で整えるんだ。', en: 'I use the 3D printer too, but the last touch is always by hand.' },
    { ja: '機械の線と手の線、両方あるほうが、あたたかく見えるんだよね。', en: 'A bit of machine line and a bit of hand line — that’s what makes it feel warm.' },
  ],
  [
    { ja: '塗料の棚、見た？ 同じ赤でも十種類くらいあるんだ。', en: 'Seen the paint shelf? I’ve got about ten different reds.' },
    { ja: 'Meebits の色を合わせるのは、思ったよりむずかしいんだよ。', en: 'Matching Meebits colors is harder than you’d think.' },
  ],
  [
    { ja: '外の波の音を聞きながら作業すると、手が落ち着くんだ。', en: 'Working to the sound of the waves outside keeps my hands steady.' },
    { ja: '海辺に工房をかまえたのは、それが理由かもしれないね。', en: 'Maybe that’s why I set up shop by the sea.' },
  ],
  [
    { ja: '四角い形って、かんたんそうに見えるでしょ。', en: 'Cubes look easy, right?' },
    { ja: 'でも角の丸め方ひとつで、やさしくも、かたくも見えるんだ。', en: 'But how you round a single corner makes it look gentle or stiff.' },
  ],
  [
    { ja: '失敗した作品も、ちゃんと取ってあるんだ。', en: 'I keep my failed pieces too.' },
    { ja: 'あとで見返すと、そのとき何を考えてたか分かるからね。', en: 'Looking back at them tells me what I was thinking at the time.' },
  ],
  [
    { ja: '作業台の上、散らかってるでしょ。', en: 'My workbench is a mess, I know.' },
    { ja: 'でも、どこに何があるかは全部分かってる。…たぶんね。', en: 'But I know exactly where everything is. …Probably.' },
  ],
  [
    { ja: '今日はね、帽子だけを十個削ったんだ。', en: 'Today I carved ten hats. Just hats.' },
    { ja: 'かぶせる相手は、まだ決まってないけどね。', en: 'Haven’t decided who gets to wear them yet.' },
  ],
  [
    { ja: 'フィギュアを作るとき、最初に決めるのは立ち方なんだ。', en: 'When I make a figure, the first thing I decide is how it stands.' },
    { ja: '立ち方が決まると、その子の性格まで見えてくるんだよ。', en: 'Once the stance is set, you can see its whole personality.' },
  ],
  [
    { ja: 'ここに来るお客さんを見てると、作りたいものが増えちゃうんだ。', en: 'Every guest who walks in gives me something new to make.' },
    { ja: 'きみも、そのうち棚に並ぶかもしれないよ。', en: 'You might end up on that shelf someday.' },
  ],
  [
    { ja: '木くずって、捨てるのがもったいなくてね。', en: 'I can never bring myself to throw out wood shavings.' },
    { ja: '集めて、小さなブロックにしてるんだ。いつか何かに使えるかもしれない。', en: 'I press them into little blocks. Might use them for something someday.' },
  ],
  [
    { ja: '最近、お客さんからパークのいろんなエリアの話を聞くんだ。', en: 'Lately guests have been telling me about all the areas in the park.' },
    { ja: 'ジャングルに動物がいるって本当？ いつか彫ってみたいな。', en: 'Are there really animals in the Jungle? I’d love to carve one someday.' },
  ],
  [
    { ja: '天井のペンダントライト、低めに吊るしてあるでしょ。', en: 'See how low the pendant lights hang?' },
    { ja: '手元に影が落ちないように、何回も高さを直したんだ。', en: 'I adjusted them again and again so no shadow falls on my hands.' },
  ],
  [
    { ja: '小さい作品ほど、時間がかかるんだよ。', en: 'The smaller the piece, the longer it takes.' },
    { ja: '指先の一ミリで、表情が変わっちゃうからね。', en: 'One millimeter at your fingertip changes the whole expression.' },
  ],
  [
    { ja: '朝いちばんに、棚のフィギュアにほこりがついてないか見て回るんだ。', en: 'First thing every morning, I check the shelf figures for dust.' },
    { ja: 'ちょっとした日課だよ。', en: 'Just a little daily ritual.' },
  ],
]
