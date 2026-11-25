/**
 * 日替わりの話題（今日パークで起きていること＋曜日・季節・記念日）。
 * 性格ごとに言い方を変える。記念日の当日は、あいさつそのものが記念日のあいさつになる。
 */
import { colorDisplayName } from '../../data/traitDisplayName'
import type { DailyNews } from './dailyNews'
import type { Phrase } from './dynamicTopics'
import type { PersonalityId, TalkScript } from './types'
import { ZONE_NAMES } from './zonePlaces'

type Lines = { ja: string[]; en: string[] }
const L = (ja: string[], en: string[]): Lines => ({ ja, en })

type Holiday = { id: string; greet: Phrase; name: Phrase }

/** 世界共通の記念日（国ごとの祝日は入れない） */
export function getHolidayToday(now = new Date()): Holiday | null {
  const m = now.getMonth() + 1
  const d = now.getDate()
  if (m === 1 && d <= 3) return { id: 'newyear', greet: { ja: 'あけましておめでとう', en: 'Happy New Year' }, name: { ja: 'お正月', en: 'New Year' } }
  if (m === 2 && d === 14) return { id: 'valentine', greet: { ja: 'ハッピーバレンタイン', en: 'Happy Valentine’s' }, name: { ja: 'バレンタイン', en: 'Valentine’s Day' } }
  if (m === 5 && d === 3) {
    const years = now.getFullYear() - 2021
    return {
      id: 'meebits-day',
      greet: { ja: `Meebits、${years}歳おめでとう`, en: `Happy ${years}${ordinal(years)} birthday, Meebits` },
      name: { ja: 'Meebits の誕生日', en: 'the Meebits’ birthday' },
    }
  }
  if (m === 10 && d === 31) return { id: 'halloween', greet: { ja: 'ハッピーハロウィン', en: 'Happy Halloween' }, name: { ja: 'ハロウィン', en: 'Halloween' } }
  if (m === 12 && d === 24) return { id: 'xmas-eve', greet: { ja: 'メリークリスマス', en: 'Merry Christmas' }, name: { ja: 'クリスマスイブ', en: 'Christmas Eve' } }
  if (m === 12 && d === 25) return { id: 'xmas', greet: { ja: 'メリークリスマス', en: 'Merry Christmas' }, name: { ja: 'クリスマス', en: 'Christmas' } }
  if (m === 12 && d === 31) return { id: 'nye', greet: { ja: '今年もありがとう', en: 'Thanks for this year' }, name: { ja: '大みそか', en: 'New Year’s Eve' } }
  return null
}

function ordinal(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th'
  return n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th'
}

const DAY_JA = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
const DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function seasonOf(now: Date): Phrase {
  const m = now.getMonth() + 1
  if (m >= 3 && m <= 5) return { ja: '春', en: 'spring' }
  if (m >= 6 && m <= 8) return { ja: '夏', en: 'summer' }
  if (m >= 9 && m <= 11) return { ja: '秋', en: 'autumn' }
  return { ja: '冬', en: 'winter' }
}

type DailyTemplates = {
  holiday: (g: Phrase, n: Phrase) => Lines
  runway: (c: Phrase) => Lines
  sighting: (type: string, num: string, zone: Phrase) => Lines
  market: (pieces: number, sold: number) => Lines
  weekday: (day: Phrase, weekend: boolean) => Lines
  season: (s: Phrase) => Lines
}

const T: Record<PersonalityId, DailyTemplates> = {
  street: {
    holiday: (g, n) => L([`${g.ja}、{you}。`, `${n.ja}って、なんかパークの空気が変わるよな。`], [`${g.en}, {you}.`, `${n.en} always changes the vibe of the park.`]),
    runway: (c) => L([`今日のランウェイ、テーマカラーは${c.ja}なんだって。`, `${c.ja}の服、俺も持ってたかな…。`], [`Today’s Runway theme color is ${c.en}.`, `Do I even own anything ${c.en}…?`]),
    sighting: (t, n, z) => L([`今日、${z.ja}に ${t} の ${n} が来てるらしいよ。`, `めったに見ないから、会えたらラッキーだな。`], [`Heard ${n}, a ${t}, is in ${z.en} today.`, `You don’t see that often. Lucky if you catch them.`]),
    market: (p, s) => s > 0
      ? L([`OpenSea マーケット、ここ48時間で ${s} 体も売れたらしいよ。`, `コレクター心がうずくわ。`], [`The OpenSea Market sold ${s} pieces in the last 48 hours.`, `The collector in me is restless.`])
      : L([`OpenSea マーケット、今 ${p} 体も並んでるらしいよ。`, `全部見て回るの、けっこう時間かかるぜ。`], [`There are ${p} pieces at the OpenSea Market right now.`, `Seeing them all takes a while.`]),
    weekday: (d, w) => w
      ? L([`${d.ja}か。`, `週末って、なんか時間がゆっくり流れる気がするよな。`], [`${d.en}, huh.`, `Weekends always feel slower somehow.`])
      : L([`${d.ja}のパーク、のんびりしてていいよね。`], [`The park on a ${d.en} has such a laid-back feel.`]),
    season: (s) => L([`もう${s.ja}だね。`, `${s.ja}の服、そろそろ考えないとな。`], [`It’s ${s.en} already.`, `Time to think about my ${s.en} fits.`]),
  },
  sporty: {
    holiday: (g, n) => L([`${g.ja}、{you}！`, `${n.ja}だからって、オレは今日も走るぜ！`], [`${g.en}, {you}!`, `${n.en} or not, I’m still running today!`]),
    runway: (c) => L([`今日のランウェイ、${c.ja}の日らしいぜ！`, `${c.ja}を着たモデルが、ずらっと歩くんだ！`], [`Today’s Runway is ${c.en} day!`, `A whole line of models in ${c.en}!`]),
    sighting: (t, n, z) => L([`聞いたか？ ${z.ja}に ${t} の ${n} が来てるってよ！`, `会いに行こうぜ！`], [`Did you hear? ${n}, a ${t}, is in ${z.en}!`, `Let’s go say hi!`]),
    market: (p, s) => s > 0
      ? L([`OpenSea マーケット、48時間で ${s} 体売れたってよ！`, `人気者ぞろいだな！`], [`The OpenSea Market sold ${s} pieces in 48 hours!`, `Popular bunch!`])
      : L([`OpenSea マーケット、今 ${p} 体並んでるんだって！`, `全部見て回ったら、いい運動になるぜ！`], [`${p} pieces on display at the OpenSea Market!`, `Walking past them all is a solid workout!`]),
    weekday: (d, w) => w
      ? L([`${d.ja}だ！`, `週末は、いつもより多めに走るって決めてるんだ！`], [`It’s ${d.en}!`, `On weekends I always run extra laps!`])
      : L([`${d.ja}も、朝から一周してきたぜ！`], [`Already ran a lap this ${d.en} morning!`]),
    season: (s) => L([`${s.ja}は、走るのにいい季節だぜ！`, `…まあ、オレはどの季節も走ってるけどな！`], [`${capital(s.en)} is great running weather!`, `…Then again, I run every season!`]),
  },
  cool: {
    holiday: (g, n) => L([`…${g.ja}、{you}。`, `${n.ja}か。…悪くない日だ。`], [`…${g.en}, {you}.`, `${n.en}. …Not a bad day.`]),
    runway: (c) => L([`今日のランウェイは${c.ja}。`, `…客席の後ろから、ゆっくり観るつもりだ。`], [`Today’s Runway color: ${c.en}.`, `…I’ll watch from the back row.`]),
    sighting: (t, n, z) => L([`${z.ja}に、${t} の ${n} がいるらしい。`, `…めずらしいな。`], [`${n}, a ${t}, is apparently in ${z.en}.`, `…That’s rare.`]),
    market: (p, s) => s > 0
      ? L([`OpenSea マーケット。48時間で ${s} 体、売れたそうだ。`, `…誰かのところへ行ったんだな。`], [`The OpenSea Market. ${s} sold in 48 hours.`, `…Off to someone new.`])
      : L([`OpenSea マーケットに、${p} 体並んでいる。`, `…静かに見て回るには、ちょうどいい。`], [`${p} pieces at the OpenSea Market.`, `…Good for a quiet walk-through.`]),
    weekday: (d, w) => w
      ? L([`${d.ja}か。`, `…週末は、少しだけにぎやかだな。`], [`${d.en}.`, `…Weekends are a little livelier.`])
      : L([`${d.ja}は、静かでいい。`], [`${d.en}s are nice and quiet.`]),
    season: (s) => L([`${s.ja}か。`, `…季節が変わると、灯りの見え方も少し変わる。`], [`${capital(s.en)}.`, `…The lights look a little different every season.`]),
  },
  photographer: {
    holiday: (g, n) => L([`${g.ja}、{you}！`, `${n.ja}の日のパーク、記念に撮っておかなきゃ。`], [`${g.en}, {you}!`, `I have to get some shots of the park on ${n.en}.`]),
    runway: (c) => L([`今日のランウェイ、${c.ja}なんだ。`, `${c.ja}の日は、写真がいつもとちがう雰囲気になるんだよ。`], [`Today’s Runway is ${c.en}.`, `${c.en} days give the photos a whole different mood.`]),
    sighting: (t, n, z) => L([`今日、${z.ja}に ${t} の ${n} が来てるんだって。`, `写真に撮りたいなあ。`], [`${n}, a ${t}, is in ${z.en} today.`, `I’d love to get a photo.`]),
    market: (p, s) => s > 0
      ? L([`OpenSea マーケット、48時間で ${s} 体売れたんだって。`, `売れる前に、写真を撮っておけばよかった。`], [`The OpenSea Market sold ${s} pieces in 48 hours.`, `Wish I’d photographed them first.`])
      : L([`OpenSea マーケットに、今 ${p} 体並んでるんだ。`, `照明がきれいだから、撮りがいがあるよ。`], [`${p} pieces on display at the OpenSea Market.`, `The lighting makes them great to shoot.`]),
    weekday: (d, w) => w
      ? L([`${d.ja}のパーク、人の流れがいい写真になるんだ。`], [`The crowds on a ${d.en} make for great photos.`])
      : L([`${d.ja}は、ゆっくり撮影できていいね。`], [`${d.en}s are great for taking my time with photos.`]),
    season: (s) => L([`${s.ja}の光って、写真にするとすぐ分かるんだ。`, `同じ場所でも、季節で色がちがうんだよ。`], [`You can tell ${s.en} light in a photo right away.`, `Same spot, different colors every season.`]),
  },
  stylish: {
    holiday: (g, n) => L([`${g.ja}、{you}。`, `${n.ja}だもの、いつもより少しおめかししてきたの。`], [`${g.en}, {you}.`, `It’s ${n.en}, so I dressed up a little.`]),
    runway: (c) => L([`今日のランウェイのテーマカラー、${c.ja}よ。`, `${c.ja}をどう着こなすか、お手並み拝見ね。`], [`Today’s Runway theme color is ${c.en}.`, `Let’s see how they style the ${c.en}.`]),
    sighting: (t, n, z) => L([`${z.ja}に、${t} の ${n} が来てるらしいわよ。`, `どんな着こなしなのか、気になるわね。`], [`${n}, a ${t}, is in ${z.en} today.`, `I’m curious about their look.`]),
    market: (p, s) => s > 0
      ? L([`OpenSea マーケット、48時間で ${s} 体売れたんですって。`, `選ばれる子には、やっぱり理由があるのよ。`], [`The OpenSea Market sold ${s} pieces in 48 hours.`, `The chosen ones always have a reason.`])
      : L([`OpenSea マーケット、今 ${p} 体も並んでるの。`, `着こなしのお手本が、ずらっとよ。`], [`${p} pieces at the OpenSea Market right now.`, `A whole lookbook on pedestals.`]),
    weekday: (d, w) => w
      ? L([`${d.ja}は、ちょっと気合いを入れた服で来るの。`], [`On ${d.en}s, I dress up a bit more.`])
      : L([`${d.ja}は、肩の力を抜いた着こなしがいいわね。`], [`A ${d.en} calls for something relaxed.`]),
    season: (s) => L([`${s.ja}のおしゃれ、もう考えてる？`, `季節の変わり目は、服を考えるのがいちばん楽しいのよ。`], [`Thought about your ${s.en} look yet?`, `Changing seasons are the best time to plan outfits.`]),
  },
  bubbly: {
    holiday: (g, n) => L([`${g.ja}、{you}！`, `${n.ja}だよ！ なんだかずっとワクワクしてるの！`], [`${g.en}, {you}!`, `It’s ${n.en}! I’ve been excited all day!`]),
    runway: (c) => L([`ねえねえ、今日のランウェイ、${c.ja}だって！`, `${c.ja}のモデルがいっぱい歩くんだよ！ 見に行こうよ！`], [`Hey hey, today’s Runway is ${c.en}!`, `Lots of models in ${c.en}! Let’s go watch!`]),
    sighting: (t, n, z) => L([`ねえねえ！ ${z.ja}に ${t} の ${n} がいるんだって！`, `あたし、あとで会いに行くんだ！`], [`Hey hey! ${n}, a ${t}, is in ${z.en}!`, `I’m going to go say hi later!`]),
    market: (p, s) => s > 0
      ? L([`OpenSea マーケット、48時間で ${s} 体も売れたんだって！`, `新しいおうちが決まった子がいっぱいだね！`], [`The OpenSea Market sold ${s} pieces in 48 hours!`, `So many found new homes!`])
      : L([`OpenSea マーケットに ${p} 体も並んでるんだよ！`, `全部に「かわいいね」って言いに行かなきゃ！`], [`There are ${p} pieces at the OpenSea Market!`, `I have to tell every one how cute it is!`]),
    weekday: (d, w) => w
      ? L([`${d.ja}だよ！ 週末だよ！`, `なにして遊ぶ？`], [`It’s ${d.en}! It’s the weekend!`, `What should we do?`])
      : L([`${d.ja}も、パークに来ちゃった！`], [`Came to the park even on a ${d.en}!`]),
    season: (s) => L([`ねえねえ、もう${s.ja}だよ！`, `${s.ja}って、なんだかワクワクするよね！`], [`Hey hey, it’s ${s.en} already!`, `${capital(s.en)} is so exciting!`]),
  },
  sisterly: {
    holiday: (g, n) => L([`${g.ja}、{you}。`, `${n.ja}くらい、ゆっくり楽しみな。`], [`${g.en}, {you}.`, `It’s ${n.en} — take it easy and enjoy it.`]),
    runway: (c) => L([`今日のランウェイは${c.ja}の日だってさ。`, `客席、空いてるうちに座っておきな。`], [`Today’s Runway is ${c.en} day.`, `Grab a seat while there’s room.`]),
    sighting: (t, n, z) => L([`今日は${z.ja}に ${t} の ${n} が来てるみたいだよ。`, `会ったら、やさしくしてあげてね。`], [`${n}, a ${t}, is in ${z.en} today.`, `Be nice to them if you meet.`]),
    market: (p, s) => s > 0
      ? L([`OpenSea マーケット、48時間で ${s} 体売れたんだって。`, `売れた子も、しばらくは飾ってあるから見ておいで。`], [`The OpenSea Market sold ${s} pieces in 48 hours.`, `Sold ones stay on display a while — go have a look.`])
      : L([`OpenSea マーケットに、${p} 体並んでるよ。`, `疲れたときに、ゆっくり見て回るといいよ。`], [`There are ${p} pieces at the OpenSea Market.`, `Nice to stroll through when you’re tired.`]),
    weekday: (d, w) => w
      ? L([`${d.ja}だね。`, `週末くらい、のんびりしていきな。`], [`It’s ${d.en}.`, `It’s the weekend — relax a little.`])
      : L([`${d.ja}も来てくれたんだ。`, `無理しないでね。`], [`You came even on a ${d.en}.`, `Don’t overdo it.`]),
    season: (s) => L([`${s.ja}になったね。`, `季節の変わり目は、体調をくずしやすいから気をつけな。`], [`It’s ${s.en} now.`, `Changing seasons — take care of yourself.`]),
  },
  explorer: {
    holiday: (g, n) => L([`${g.ja}、{you}。`, `${n.ja}の日は、いつもとちがう道を歩きたくなるんだ。`], [`${g.en}, {you}.`, `On ${n.en}, I always want to take a different path.`]),
    runway: (c) => L([`今日のランウェイ、${c.ja}だったよ。`, `通りがかりに見てきたんだ。カルチャーエリアにあるよ。`], [`Today’s Runway is ${c.en}.`, `Saw it on my way through — it’s in the Culture District.`]),
    sighting: (t, n, z) => L([`${z.ja}で、${t} の ${n} を見かけたよ。`, `今日しか会えないかもしれないから、行ってみたら？`], [`I spotted ${n}, a ${t}, in ${z.en}.`, `Might be your only chance — go see!`]),
    market: (p, s) => s > 0
      ? L([`OpenSea マーケット、48時間で ${s} 体売れたんだって。`, `どこか新しい場所へ旅立っていったんだね。`], [`The OpenSea Market sold ${s} pieces in 48 hours.`, `Off on journeys somewhere new.`])
      : L([`OpenSea マーケットに、${p} 体並んでるよ。`, `ぐるっと一周するだけで、ちょっとした旅だね。`], [`${p} pieces at the OpenSea Market.`, `One loop around is a little journey.`]),
    weekday: (d, w) => w
      ? L([`${d.ja}は、遠くのエリアまで足をのばすんだ。`], [`On ${d.en}s, I walk out to the far areas.`])
      : L([`${d.ja}も、いつもの道を一周してきたよ。`], [`Did my usual loop this ${d.en} too.`]),
    season: (s) => L([`${s.ja}の空気って、歩いてるとすぐ分かるんだ。`, `季節ごとに、パークの歩き心地が変わるんだよ。`], [`You can feel ${s.en} in the air as you walk.`, `The park feels different underfoot every season.`]),
  },
  sage: {
    holiday: (g, n) => L([`${g.ja}、{you}。`, `${n.ja}は、パークにとっても特別な日ですね。`], [`${g.en}, {you}.`, `${capital(n.en)} is a special day for the park too.`]),
    runway: (c) => L([`本日のランウェイのテーマカラーは、${c.ja}だそうです。`, `その色を身につけたモデルたちが歩くんですよ。`], [`Today’s Runway theme color is ${c.en}.`, `Models wearing that color walk the show.`]),
    sighting: (t, n, z) => L([`本日は、${z.ja}に ${t} の ${n} さんがいらしているそうです。`, `${t} の Meebits は、めずらしいんですよ。`], [`${n}, a ${t}, is visiting ${z.en} today.`, `${t} Meebits are quite rare.`]),
    market: (p, s) => s > 0
      ? L([`OpenSea マーケットでは、この48時間で ${s} 体が売れたそうです。`, `売れた作品も、しばらくは展示されていますよ。`], [`${s} pieces sold at the OpenSea Market in the last 48 hours.`, `Sold pieces remain on display for a while.`])
      : L([`OpenSea マーケットには、いま ${p} 体の作品が並んでいます。`, `一体ずつ、ゆっくりご覧になってください。`], [`There are ${p} pieces at the OpenSea Market now.`, `Do take your time with each one.`]),
    weekday: (d, w) => w
      ? L([`${d.ja}ですね。`, `週末のパークは、少しだけ華やいで見えます。`], [`It’s ${d.en}.`, `The park looks a little more festive on weekends.`])
      : L([`${d.ja}のパークも、落ち着いていていいものですね。`], [`The park on a ${d.en} is pleasantly calm.`]),
    season: (s) => L([`${s.ja}になりましたね。`, `季節が変わっても、パークの楽しみ方はつきませんね。`], [`It’s ${s.en} now.`, `Whatever the season, the park never runs out of things to enjoy.`]),
  },
  robot: {
    holiday: (g, n) => L([`${g.ja}…と、出力します、{you}。`, `本日は、${n.ja}。カレンダーデータ、確認済み。`], [`${g.en}… Output complete, {you}.`, `Today: ${n.en}. Calendar data confirmed.`]),
    runway: (c) => L([`本日のランウェイ：テーマカラー ${c.ja}。`, `本機のボディにも、${c.ja}を塗装するか、検討中。`], [`Today’s Runway: theme color ${c.en}.`, `Considering painting this unit ${c.en}.`]),
    sighting: (t, n, z) => L([`情報：${z.ja}に、${t} の ${n} を確認。`, `会いに行くことを、推奨します。`], [`Info: ${n}, type ${t}, confirmed in ${z.en}.`, `Recommend paying a visit.`]),
    market: (p, s) => s > 0
      ? L([`OpenSea マーケット：48時間の売却数、${s}。`, `ロボットの作品が含まれているかは、不明です。`], [`OpenSea Market: ${s} sold in 48 hours.`, `Whether any robot pieces were among them: unknown.`])
      : L([`OpenSea マーケット：現在の展示数、${p}。`, `全て見るには、約${Math.max(1, Math.round(p / 6))}分と推定します。`], [`OpenSea Market: ${p} pieces on display.`, `Estimated viewing time: about ${Math.max(1, Math.round(p / 6))} minutes.`]),
    weekday: (d, w) => w
      ? L([`本日は${d.ja}。週末モードです。`], [`Today: ${d.en}. Weekend mode.`])
      : L([`本日は${d.ja}。通常稼働中です。`], [`Today: ${d.en}. Normal operation.`]),
    season: (s) => L([`現在の季節：${s.ja}。`, `外気温の変化に、適応中です。`], [`Current season: ${s.en}.`, `Adapting to the temperature change.`]),
  },
}

function capital(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function hash(a: number, b: number) {
  return Math.imul(a ^ Math.imul(b, 2654435761), 1597334677) >>> 0
}

/** 記念日の当日は、あいさつを記念日のあいさつにする */
export function buildHolidayGreeting(p: PersonalityId, now = new Date()): TalkScript | null {
  const holiday = getHolidayToday(now)
  if (!holiday) return null
  const lines = T[p].holiday(holiday.greet, holiday.name)
  return { id: `${p}-holiday-${holiday.id}`, p, kind: 'greetAgain', ja: lines.ja, en: lines.en }
}

/** 今日の話題の候補（重みつき） */
export function buildDailyScripts(
  p: PersonalityId,
  news: DailyNews,
  seed: number,
  talkCount: number,
  now = new Date(),
): Array<{ script: TalkScript; weight: number }> {
  const t = T[p]
  const out: Array<{ script: TalkScript; weight: number }> = []
  const make = (id: string, lines: Lines, weight: number) =>
    out.push({ script: { id: `${p}-daily-${id}`, p, kind: 'topic', ja: lines.ja, en: lines.en }, weight })

  if (news.runwayColor) {
    make(`runway-${news.runwayColor}`, t.runway({ ja: colorDisplayName(news.runwayColor, 'ja'), en: news.runwayColor }), 2)
  }
  if (news.sightings.length > 0) {
    const sight = news.sightings[hash(seed, talkCount) % news.sightings.length]
    make(`sighting-${sight.meebitNumber}`, t.sighting(sight.type, `#${sight.meebitNumber}`, ZONE_NAMES[sight.zoneId]), 2)
  }
  if (news.market) {
    make(`market-${news.market.sold}`, t.market(news.market.pieces, news.market.sold), 1)
  }
  const day = now.getDay()
  make(`weekday-${day}`, t.weekday({ ja: DAY_JA[day], en: DAY_EN[day] }, day === 0 || day === 6), 1)
  const season = seasonOf(now)
  make(`season-${season.en}`, t.season(season), 1)
  return out
}
