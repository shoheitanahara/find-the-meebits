/**
 * セリフ断片の組み合わせで地区別プールを生成する。
 * plaza / mountain × EN / JA で各言語あたり約1000本を目指す。
 */

import type { ParkZoneId } from './parkZones'

export type ParkDialoguePools = {
  greetings: string[]
  gameFind: string[]
  gameTraits: string[]
  gameStreet: string[]
  gameMountain: string[]
  featuredAny: string[]
  featuredMatched: string[]
  themeAny: string[]
  themeMatched: string[]
  flavor: string[]
}

type Lang = 'en' | 'ja'

/** heads × tails の直積（重複除去）。 */
function product(heads: string[], tails: string[], joiner = ' '): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const h of heads) {
    for (const t of tails) {
      const line = joiner === '' ? `${h}${t}` : `${h}${joiner}${t}`
      if (seen.has(line)) continue
      seen.add(line)
      out.push(line)
    }
  }
  return out
}

// ─── English fragments ───────────────────────────────────────────────

const EN_PLAZA_GREET_H = [
  'Hey there!',
  'Welcome!',
  'Oh, hello!',
  'Yo!',
  'Hi friend!',
  'Evening!',
  'Hey traveler.',
  'Hello!',
  'Sup!',
  'Good to see you!',
  'Hey!',
  'Greetings!',
  'Oh hey!',
  'Hi!',
  'Welcome back!',
  'Look who it is!',
  'Nice timing!',
  'There you are!',
  'Hey buddy!',
  'Howdy!',
]

const EN_PLAZA_GREET_T = [
  'Nice night for a stroll in the Park.',
  'The lights look great tonight.',
  'Fancy bumping into you here.',
  'Taking a break between attractions?',
  'Don’t be shy — everyone’s friendly tonight.',
  'Got a favorite attraction yet?',
  'The Park’s buzzing tonight.',
  'Fresh air and Meebits — perfect combo.',
  'You look ready for a little adventure.',
  'Stick around — something’s always happening.',
  'The fountain’s glowing tonight.',
  'Watch your step near the benches.',
  'Is this your first loop around the plaza?',
  'I was just people-watching.',
  'Nights like this feel special.',
  'The golden path looks extra shiny.',
  'Plaza vibes are strong tonight.',
  'Feel free to chat with anyone.',
  'The crowd’s in a good mood.',
  'Grab a bench if you need a breather.',
]

const EN_MT_GREET_H = [
  'Hey climber!',
  'Welcome to the mountain!',
  'Oh, hello up here!',
  'Yo!',
  'Hi trail friend!',
  'Evening on the ridge!',
  'Hey traveler.',
  'Hello!',
  'Sup!',
  'Good to see you on the trail!',
  'Hey!',
  'Greetings from the pines!',
  'Oh hey!',
  'Hi!',
  'Welcome back to Mt. Meeb!',
  'Look who made it!',
  'Nice timing!',
  'There you are!',
  'Hey buddy!',
  'Howdy, highlander!',
]

const EN_MT_GREET_T = [
  'The air feels thinner — in a good way.',
  'Pine scent and voxel cliffs tonight.',
  'Fancy meeting you on this side of the bridge.',
  'Warming up before the climb?',
  'Watch the edges — cliffs don’t forgive.',
  'Got your jumping legs ready?',
  'The lodges look cozy from here.',
  'Mountain nights hit different.',
  'You look ready for a big ascent.',
  'Stick around — summit rumors fly fast.',
  'Torchlight on the rocks looks wild.',
  'Mind the loose gravel near the path.',
  'First time in the mountain district?',
  'I was just staring at the peaks.',
  'Nights like this feel epic.',
  'The bridge back to the plaza is that way.',
  'Highland vibes are strong tonight.',
  'Feel free to chat with other climbers.',
  'The crowd’s buzzing about Stage clears.',
  'Take a breath — the climb can wait a second.',
]

const EN_FIND_H = [
  'Find the Meebit is over that way —',
  'If you like searching crowds,',
  'The Museum attraction is wild.',
  'Museum tip:',
  'Find the Meebit gets intense later.',
  'Lost in a sea of Meebits?',
  'The Museum unlocks After Hours if you clear it.',
  'I love Find the Meebit —',
  'Clock’s ticking in the Museum.',
  'Wrong Meebit?',
  'Museum crowds look similar…',
  'If you beat the Museum,',
]

const EN_FIND_T = [
  'hunt them down in the Museum!',
  'try Find the Meebit.',
  'So many faces… one target.',
  'talk to folks — sometimes they drop hints.',
  'Bring focus!',
  'That’s the Museum vibe.',
  'Worth it.',
  'like hide-and-seek with style.',
  'Don’t freeze up!',
  'Keep walking. The right one is somewhere.',
  'until you really look.',
  'the Club night awaits.',
  'Stage clears feel amazing.',
  'Trust your eyes, not the panic.',
]

const EN_TRAITS_H = [
  'Trait Hunt is fun —',
  'Hair, clothes, accessories…',
  'Feeling stylish?',
  'Trait Hunt rewards sharp eyes',
  'Same shirt color? Same glasses?',
  'I failed Trait Hunt once',
  'Trait Hunt is like',
  'Check the clue carefully —',
  'Gallery lighting helps…',
  'Trait Hunt’s short loops are',
  'Matching traits feels',
  'If you love outfits,',
]

const EN_TRAITS_T = [
  'match the clue and spot the lookalikes!',
  'Trait Hunt is all about the details.',
  'Trait Hunt’s gallery is calling.',
  'more than speed.',
  'Trait Hunt will test you.',
  'by ignoring the tiny earrings. Oops.',
  'fashion bingo with Meebits.',
  'one trait can change everything.',
  'if you know what you’re hunting.',
  'perfect between longer games.',
  'oddly satisfying. You’ll see.',
  'Trait Hunt is your playground.',
  'don’t rush the first glance.',
  'the gallery loves careful walkers.',
]

const EN_STREET_H = [
  '8th Street gets weird after dark.',
  'The repeating alley on 8th Street',
  'If you like spot-the-difference,',
  '8th Street loops —',
  'Warm lamps, cold twists.',
  'I swear the alley',
  'First-person on 8th Street',
  'Watch the walkers carefully.',
  '8th Street is short…',
  'Turn the corner.',
  'The white fade means',
  '8th Street rewards patience',
]

const EN_STREET_T = [
  'Notice what changed!',
  'still gives me chills.',
  'walk into 8th Street.',
  'blink and you miss the anomaly.',
  'That’s 8th Street.',
  'rearranged itself last time.',
  'hits different at night.',
  'One of them isn’t right.',
  'unless you keep missing the change.',
  'Look twice. Trust your gut.',
  'the street is resetting. Stay sharp.',
  'more than sprinting.',
  'Don’t sprint past the clues.',
  'Slow eyes win there.',
]

const EN_MT_GAME_H = [
  'Mt. Meeb is right there —',
  'If you like jumps and dashes,',
  'The mountain climb has 20 stages.',
  'Climb tip:',
  'Later stages on Mt. Meeb get spicy.',
  'Fell into a ravine?',
  'Clearing a stage feels huge.',
  'I love the voxel cliffs —',
  'Watch your footing near gaps.',
  'Wrong jump?',
  'Three lanes up the trail…',
  'If you reach the summit pad,',
]

const EN_MT_GAME_T = [
  'scale it with jumps and dashes!',
  'try the Mt. Meeb climb.',
  'Aim for that 1000m dream.',
  'read the blocks before you leap.',
  'Bring patience!',
  'Respawn and try again.',
  'Worth every stumble.',
  'like a parkour postcard.',
  'Don’t freeze on the edge!',
  'Reset your angle and go again.',
  'pick the lane that fits your rhythm.',
  'take a victory breath.',
  'BEST height is something to chase.',
  'Torchlight helps, guts help more.',
]

const EN_FEAT_H = [
  'Did you see today’s star',
  'Today’s featured Meebit',
  'There’s a copper statue',
  'The fountain Meebit changes daily.',
  'I took a selfie with the statue.',
  'Today’s star looks sharp',
  'Check the board by the fountain —',
  'Half the visitors share a link',
  'The Park picks a new star',
  'If you’re hunting lookalikes,',
  'Plaza chatter is all about',
  'Don’t miss the pedestal —',
]

const EN_FEAT_T = [
  'by the fountain? Gorgeous statue.',
  'is on the fountain pedestal — go look!',
  'of today’s star in the plaza. Hard to miss.',
  'Today’s look is a banger.',
  'No shame.',
  'even in metal.',
  'you can read the star’s traits.',
  'with today’s featured Meebit. Can you tell who?',
  'every morning (JST).',
  'start at the fountain.',
  'today’s featured face.',
  'today’s idol is waiting.',
  'the lights make it pop.',
  'it’s the plaza’s daily ritual.',
]

const EN_FEAT_MT_H = [
  'Heard about today’s star',
  'Today’s featured Meebit',
  'Even up here people talk about',
  'The plaza fountain has today’s idol.',
  'I hiked over just to peek at',
  'Today’s star looks sharp',
  'Check the plaza board sometime —',
  'Half the park crowd shares a link',
  'The Park picks a new star',
  'If you’re hunting lookalikes,',
  'Trail chatter mentions',
  'Don’t forget the plaza pedestal —',
]

const EN_FEAT_MT_T = [
  'down in the plaza? Worth the walk.',
  'is the talk of both districts tonight.',
  'the fountain statue.',
  'Mountain guests still care about it.',
  'today’s featured face.',
  'even from this altitude.',
  'you can read the star’s traits.',
  'with today’s featured Meebit.',
  'every morning (JST).',
  'start at the fountain after your climb.',
  'today’s featured Meebit a lot.',
  'today’s idol is the park’s heartbeat.',
  'torchlight and copper both glow.',
  'it’s the whole park’s daily ritual.',
]

const EN_FEAT_MATCH_H = [
  'I’m on today’s star team!',
  'Look closely…',
  'Yep — star crew tonight.',
  'Matching the statue’s vibe…',
  'I’m soaking in the spotlight',
  'If the statue winked,',
  'I’m not the statue, but',
  'Hunt the other star guests too —',
  'Same aura as the fountain idol.',
  'Being on the star team',
  'We’re the daily lookalike squad.',
  'Catch me if you can —',
]

const EN_FEAT_MATCH_T = [
  'Same energy as the statue.',
  'I match today’s featured vibe. See it?',
  'Find us in the crowd!',
  'almost. I’m the walking edition.',
  'with today’s featured Meebit.',
  'that was my heart.',
  'I’m in tonight’s spotlight circle.',
  'we’re scattered on purpose.',
  'That’s the daily bit.',
  'makes me a little proud.',
  'twins wanted!',
  'star guest energy.',
  'plaza gold and mountain pine both suit us.',
  'the theme chose us today.',
]

const EN_THEME_H = [
  'Today’s shared trait is on the fountain board.',
  'That little sign by the fountain',
  'The Park chose a theme trait today.',
  'Today’s link connects fifteen guests.',
  'Read the board first,',
  'One trait, many Meebits.',
  'The fountain board isn’t decoration —',
  'When there’s a daily theme,',
  'If two guests look alike,',
  'The daily trait refreshes with the date.',
  'Look for “{theme}” energy tonight.',
  'The plaza clue points to',
]

const EN_THEME_T = [
  'That’s your scavenger clue.',
  'lists today’s common trait.',
  'Half the visitors share it.',
  'Can you spot them all?',
  'then scan the crowd.',
  'It’s the daily link game.',
  'it’s a hint.',
  'the Park turns into a matching party.',
  'suspect today’s shared trait.',
  'Fresh every day.',
  'It’s written as {theme}.',
  '{value} is having a moment.',
  'Don’t sleep on the board.',
  'the daily handshake of the Park.',
]

const EN_THEME_MT_H = [
  'Even on the mountain, today’s shared trait matters.',
  'Plaza board says the daily link —',
  'The Park chose a theme trait today.',
  'Today’s link connects fifteen guests.',
  'After you climb, read the plaza board,',
  'One trait, many Meebits.',
  'Highland gossip mentions the daily theme —',
  'When there’s a daily theme,',
  'If two climbers look alike,',
  'The daily trait refreshes with the date.',
  'Look for “{theme}” energy tonight.',
  'Trail talk keeps pointing to',
]

const EN_THEME_MT_T = [
  'That’s your scavenger clue across districts.',
  'it’s worth knowing up here too.',
  'Half the visitors share it — even some hikers.',
  'Can you spot them on the trail?',
  'then scan both crowds.',
  'It’s the daily link game.',
  'it’s a hint, not just chatter.',
  'the whole park turns into a matching party.',
  'suspect today’s shared trait.',
  'Fresh every day.',
  'It’s written as {theme}.',
  '{value} is having a moment.',
  'Don’t sleep on the plaza board.',
  'the daily handshake of Meebits Park.',
]

const EN_THEME_MATCH_H = [
  'We share today’s link.',
  'Same theme trait as the star.',
  'Today’s shared trait gathered us.',
  'I’m wearing today’s theme proudly.',
  'If you found me,',
  'Fifteen of us carry this trait tonight.',
  'Match me, then check the board —',
  'Today’s link isn’t random.',
  'Shared-trait club, reporting in.',
  'The board speaks it;',
  'Yes — I’m a {theme} guest tonight.',
  'Look for more of us with {value}.',
]

const EN_THEME_MATCH_T = [
  'Find our twins!',
  'That’s why I’m here.',
  'Spot the lookalikes!',
  'Can you tell?',
  'you’re learning the daily link.',
  'Counting is half the fun.',
  'nice flow!',
  'I was chosen.',
  'Where’s my twin?',
  'I prove it.',
  'Theme pride!',
  'We’re the daily matching set.',
  'plaza or mountain — same club.',
  'come say hi to the squad.',
]

const EN_PLAZA_FLAVOR_H = [
  'Three attractions tonight.',
  'I love nights like this —',
  'If you get lost,',
  'The lamps hum softly.',
  'Benches are comfy…',
  'I keep looping the fountain.',
  'Park tip:',
  'Some guests match the theme;',
  'You can always hit Back to Top.',
  'The outer water looks endless tonight.',
  'Classic night-park energy.',
  'Don’t rush all three games —',
  'Golden paths never lie.',
  'Plaza people-watching is elite.',
  'Shawn sometimes hangs near the fountain.',
]

const EN_PLAZA_FLAVOR_T = [
  'Pick a door and dive in!',
  'breeze and Meebits everywhere.',
  'follow the gold path back to the fountain.',
  'Weirdly calming for a theme park.',
  'until an NPC stares at you.',
  'Habit, maybe.',
  'talk to everyone. Useful rumors exist.',
  'others just vibing.',
  'We’ll still be here.',
  'Kinda poetic.',
  'Club vibes, no queue.',
  'savor the plaza too.',
  'They lead you home.',
  'Better than any feed.',
  'Creator energy in the plaza.',
  'Tonight’s mood is soft gold.',
  'Take a slow lap first.',
]

const EN_MT_FLAVOR_H = [
  'Mt. Meeb waits beyond the lodges.',
  'I love nights like this —',
  'If you get lost up here,',
  'Torchlight on voxel stone',
  'Trail benches are rough…',
  'I keep staring at the cliffs.',
  'Mountain tip:',
  'Some guests came to climb;',
  'You can always cross back to the plaza.',
  'The ravines look dramatic tonight.',
  'Highland night energy.',
  'Don’t rush the summit —',
  'Pine rows never lie about the wind.',
  'Trail people-watching is elite.',
  'Stages stack toward 1000m.',
]

const EN_MT_FLAVOR_T = [
  'Warm up, then go for a clear!',
  'pine air and Meebits everywhere.',
  'follow the path back to the bridge gate.',
  'hits different than plaza lamps.',
  'but the view pays rent.',
  'Habit of a climber, maybe.',
  'read the blocks before big jumps.',
  'others just vibe on the ridge.',
  'Fountain chatter will still be there.',
  'Kinda epic.',
  'Parkour vibes, mountain postcard.',
  'savor the district too.',
  'They tell you where the cold comes from.',
  'Better than any feed.',
  'Chase your BEST height.',
  'Tonight’s mood is amber stone.',
  'Take a slow ridge lap first.',
]

// ─── Japanese fragments ──────────────────────────────────────────────

const JA_PLAZA_GREET_H = [
  'やあ！',
  'ようこそ！',
  'おっ、こんにちは！',
  'よっ！',
  'こんにちは！',
  'こんばんは！',
  'やあ旅人。',
  'どうも！',
  'ひょっとして初対面？',
  '会えてうれしい！',
  'やあ！',
  'ごきげんよう！',
  'あっ、こんにちは！',
  'ハロー！',
  'おかえり！',
  'いたいた！',
  'いいタイミング！',
  'そこだ！',
  'やあ相棒！',
  'よう！',
]

const JA_PLAZA_GREET_T = [
  'パークの夜散歩、いいね。',
  '今夜のライト、きれいでしょう？',
  'ここで会うなんて奇遇だね。',
  'アトラクションの合間に休憩中？',
  '今夜はみんなフレンドリーだよ。',
  'お気に入りのアトラクション、もう決めた？',
  '今夜のパーク、にぎやかだね。',
  '潮風とMeebit、最高の組み合わせ。',
  '冒険の準備はできてそうだね。',
  'ちょっと見ていって。今夜は何か起きてるよ。',
  '噴水、今夜はきれいだよ。',
  'ベンチの近く、足元に気をつけて。',
  '広場の一周、初回り？',
  '人混みウォッチしてたところ。',
  'こういう夜って特別な感じがする。',
  '金の道、今夜は特に輝いてる。',
  'プラザの空気、最高潮だね。',
  '誰にでも話しかけてみて。',
  '今夜の人混み、機嫌がいいよ。',
  '一息つきたくなったらベンチへ。',
]

const JA_MT_GREET_H = [
  'やあ登山者！',
  '山岳地区へようこそ！',
  'おっ、こんにちは！',
  'よっ！',
  'トレイルの友よ！',
  '尾根のこんばんは！',
  'やあ旅人。',
  'どうも！',
  'ひょっとして初登山？',
  'トレイルで会えてうれしい！',
  'やあ！',
  '松からのごきげんよう！',
  'あっ、こんにちは！',
  'ハロー！',
  'Mt. Meebへおかえり！',
  '到着おめでとう！',
  'いいタイミング！',
  'そこだ！',
  'やあ相棒！',
  'よう、ハイランダー！',
]

const JA_MT_GREET_T = [
  '空気がうすい…いい意味でね。',
  '今夜は松の香りとボクセルの崖。',
  '橋の向こうで会うなんて奇遇だね。',
  '登る前のウォームアップ中？',
  '崖際は気をつけて。容赦ないよ。',
  'ジャンプ脚、準備できた？',
  'ロッジ、ここからだと居心地よく見える。',
  '山の夜は空気が違うね。',
  '大きな登攀、いけそうな顔だね。',
  'ちょっと見ていって。頂上の噂が速いよ。',
  '岩のトーチライト、すごいよね。',
  '道の砂利、足元注意。',
  '山岳地区は初めて？',
  '峰をぼーっと見てたところ。',
  'こういう夜は叙事詩っぽい。',
  'プラザへの橋はあっちだよ。',
  'ハイランドの空気、最高潮だね。',
  '他の登山者にも話しかけてみて。',
  'ステージクリアの話で盛り上がってるよ。',
  '一息ついてから登っても遅くない。',
]

const JA_FIND_H = [
  'Find the Meebit はあっち！',
  '人混みが好きなら',
  'ミュージアムのアトラクション、',
  'ミュージアムのコツ：',
  'Find the Meebit は後半ほど本気。',
  'Meebitの海に迷子？',
  'ミュージアムをクリアすると After Hours が開く。',
  'Find the Meebit、',
  'ミュージアムは時間が命。',
  '違うMeebitだった？',
  'ミュージアムの人混み、',
  'ミュージアムを制覇したら、',
]

const JA_FIND_T = [
  '美術館でターゲットを探してね。',
  'Find the Meebit、おすすめ。',
  '顔がいっぱいで熱いよ。',
  '話しかけるとヒントが出ることあるよ。',
  '集中力を持って！',
  'それがミュージアムの味だよ。',
  'やる価値あり。',
  'おしゃれかくれんぼって感じで好き。',
  '固まらないで！',
  '歩き続けて。正解はどこかにいる。',
  '似てるようで違うんだよね。',
  'クラブの夜が待ってるよ。',
  'ステージクリアの快感、やばいよ。',
  '焦らず目を信じるんだ。',
]

const JA_TRAITS_H = [
  'トレイトハントは楽しいよ。',
  '髪型・服・アクセ…',
  'おしゃれ好きなら',
  'トレイトハントは速さより',
  '同じシャツ色？同じメガネ？',
  'ピアスを見落として',
  'トレイトハントは',
  '手がかりはよく読んで。',
  'ギャラリーの明かり、',
  'トレイトハントの短ループ、',
  '特徴が一致した瞬間、',
  'コーデが好きなら、',
]

const JA_TRAITS_T = [
  'ヒントと同じ特徴を探そう！',
  'トレイトハントは細部勝負。',
  'トレイトハントのギャラリーへ！',
  '観察眼が大事。',
  'トレイトハントが試してくる。',
  'トレイトハントに負けたことある…。',
  'Meebit版ファッションビンゴ。',
  '一つのトレイトで全部変わる。',
  '狙いが分かると味方になるよ。',
  '合間遊びにぴったり。',
  '妙に気持ちいいんだ。',
  'トレイトハントが遊び場だよ。',
  '最初の一目で焦らないで。',
  '丁寧に歩く人が勝つギャラリーだよ。',
]

const JA_STREET_H = [
  '8番ストリートは夜になると変だよ。',
  '繰り返す路地、',
  '間違い探しが好きなら、',
  '8番ストリートはループする。',
  '温かい街灯、冷たいひねり。',
  'この前も路地の並びが',
  '8番ストリートの一人称、',
  '歩行者をよく見て。',
  '8番ストリートは短い…',
  '角を曲がったら二度見。',
  '白いフェードはストリートのリセット。',
  '8番ストリートは',
]

const JA_STREET_T = [
  '変化に気づけるかな？',
  'いまだにゾクッとするんだ。',
  '8番ストリートに入ってみて。',
  '瞬きすると変化を逃すよ。',
  'それが8番ストリート。',
  '変わった気がする…。',
  '夜だと印象が違うよね。',
  '誰か一人、おかしいはず。',
  '見逃し続けなければね。',
  '直感を信じて。',
  '気を引き締めて。',
  'ダッシュより粘り勝ち。',
  '手がかりを走り抜けないで。',
  '遅い目が勝つ場所だよ。',
]

const JA_MT_GAME_H = [
  'Mt. Meeb はすぐそこ！',
  'ジャンプとダッシュが好きなら、',
  '山登りは全20ステージ。',
  '登攀のコツ：',
  'Mt. Meeb の後半ステージ、熱いよ。',
  '渓谷に落ちた？',
  'ステージクリアの快感、でかい。',
  'ボクセルの崖、好きなんだ —',
  '穴の手前、足元注意。',
  'ジャンプミス？',
  'トレイルは3レーン…',
  '頂上の平台まで着いたら、',
]

const JA_MT_GAME_T = [
  'ジャンプとダッシュで登ってみて！',
  'Mt. Meeb 登攀、おすすめ。',
  '1000mの夢を狙おう。',
  '跳ぶ前にブロックを読んで。',
  '粘り強くいこう！',
  'リスポーンして再挑戦だ。',
  'つまずき全部に価値がある。',
  'パルクールの絵葉書みたい。',
  '縁で固まらないで！',
  '角度を直してもう一回。',
  '自分のリズムに合うレーンを選んで。',
  '勝利の一息を。',
  'BEST標高、追いかけがいがあるよ。',
  'トーチも大事、胆力もっと大事。',
]

const JA_FEAT_H = [
  '噴水の銅像、今日の主役だよ。',
  '本日の主役は噴水の台座の上！',
  '広場の銅像が今日のスター。',
  '噴水のMeebitは日替わり。',
  '銅像とセルフィー撮った。',
  '今日の主役、金属でも',
  '噴水横の看板で、',
  '来場者の半分は今日の主役とつながってる。',
  'パークは毎朝（JST）',
  '似た子探しなら、',
  '広場の話題は全部',
  '台座、見逃さないで —',
]

const JA_FEAT_T = [
  '見てきた？',
  '見逃さないで。',
  '光ってて目立つよね。',
  '今日の見た目、かっこいい。',
  '全然恥ずかしくないよ。',
  '存在感あるよね。',
  '主役のトレイトが見られるよ。',
  'わかる？',
  '新しい主役を選ぶんだ。',
  'まず噴水から始めてみて。',
  '今日の主役の顔だよ。',
  '今日の偶像が待ってる。',
  'ライトでさらに映える。',
  '広場の日課だよ。',
]

const JA_FEAT_MT_H = [
  '今日の主役の話、聞いた？',
  '本日の主役Meebit、',
  'ここ山岳でも話題は',
  'プラザの噴水に今日の偶像がいるよ。',
  'ちょっと覗きに歩いてきたんだ、',
  '今日の主役、高度が高くても',
  'いつかプラザの看板も見て —',
  'パーク来場者の半分は',
  'パークは毎朝（JST）',
  '似た子探しなら、',
  'トレイルの噂でも',
  'プラザの台座、忘れないで —',
]

const JA_FEAT_MT_T = [
  'プラザまで歩く価値あるよ。',
  '両地区の今夜の話題だよ。',
  '噴水の銅像なんだ。',
  '山岳ゲストも気にしてるよ。',
  '今日の主役の顔を。',
  '存在感あるよね。',
  '主役のトレイトが読めるよ。',
  '今日の主役とつながってる。',
  '新しい主役を選ぶんだ。',
  '登ったあと噴水から始めてみて。',
  '今日の主役の話が多いよ。',
  '今日の偶像はパークの鼓動だよ。',
  'トーチも銅も光る夜だ。',
  'パーク全体の日課だよ。',
]

const JA_FEAT_MATCH_H = [
  'ぼく、今日の主役チームの一人！',
  'よく見て…',
  'そう、今夜のスター仲間。',
  '銅像とおそろい…ほぼ。',
  '今日の主役と一緒に',
  '銅像がウインクしたら、',
  'ぼくは銅像じゃないけど、',
  '他のスターゲストも探して。',
  '噴水の偶像と同じ気配。',
  '今日スターチームなの、',
  'ぼくたち日替わり似てる組。',
  '捕まえられるものなら —',
]

const JA_FEAT_MATCH_T = [
  '銅像と同じ雰囲気だよ。',
  '今日の主役と同じ系統なんだ。わかる？',
  '人混みの中で探してみて！',
  'ぼくは歩けるバージョン。',
  'スポットライト浴びてる気分。',
  'ぼくの心だと思って。',
  '今夜の主役サークルだよ。',
  'わざと散らばってるから。',
  'それが今日の演出。',
  'ちょっと得意かも。',
  '双子募集中！',
  'スターゲスト気分かな。',
  '広場の金も山の松も似合うよ。',
  '今日のテーマに選ばれた側。',
]

const JA_THEME_H = [
  '噴水の看板の「本日の共通点」がヒントだよ。',
  '今日の共通トレイト、あの小さな看板に書いてあるよ。',
  'パークが今日のテーマトレイトを決めたんだ。',
  '本日の共通点が15人をつないでる。',
  '先に看板を読んで、',
  'トレイトひとつ、Meebitたくさん。',
  '噴水の看板は飾りじゃない。',
  '今日のテーマがあると、',
  '似てる二人がいたら、',
  '日替わりトレイトは日付で変わる。',
  '今夜は「{theme}」の気配を探して。',
  '広場の手がかりは',
]

const JA_THEME_T = [
  'それが宝探しの手がかり。',
  '読んでから人混みへ。',
  '来場者の半分が共有してるよ。',
  '全部見つけられるかな？',
  'それから人混みをスキャンして。',
  '日替わりリンク遊びだよ。',
  'ヒントなんだ。',
  'パークがマッチングパーティみたい。',
  '本日の共通点を疑ってみて。',
  '毎日フレッシュ。',
  '表記は {theme} だよ。',
  '{value} が今アツい。',
  '看板、なめないでね。',
  'パークの日替わり握手だよ。',
]

const JA_THEME_MT_H = [
  '山岳でも本日の共通点は大事だよ。',
  'プラザの看板が日替わりリンクを言ってる —',
  'パークが今日のテーマトレイトを決めたんだ。',
  '本日の共通点が15人をつないでる。',
  '登ったあとプラザの看板を読んで、',
  'トレイトひとつ、Meebitたくさん。',
  'ハイランドの噂でも日替わりテーマの話 —',
  '今日のテーマがあると、',
  '似てる登山者がいたら、',
  '日替わりトレイトは日付で変わる。',
  '今夜は「{theme}」の気配を探して。',
  'トレイルの話題はいつも',
]

const JA_THEME_MT_T = [
  '地区をまたぐ宝探しの手がかりだよ。',
  'ここでも知っとく価値あるよ。',
  '来場者の半分が共有してる — 登山者にもいるよ。',
  'トレイルでも見つけられるかな？',
  '両方の人混みをスキャンして。',
  '日替わりリンク遊びだよ。',
  'ただの噂じゃなくヒントなんだ。',
  'パーク全体がマッチングパーティみたい。',
  '本日の共通点を疑ってみて。',
  '毎日フレッシュ。',
  '表記は {theme} だよ。',
  '{value} が今アツい。',
  'プラザの看板、なめないでね。',
  'Meebits Park の日替わり握手だよ。',
]

const JA_THEME_MATCH_H = [
  'ぼくたち、今日の共通点をシェアしてるんだ。',
  '主役と同じテーマトレイト持ち。',
  '本日の共通点がぼくたちを集めたんだ。',
  '今日のテーマ、堂々と身につけてるよ。',
  'ぼくを見つけられたなら、',
  '今夜このトレイト持ちは15人。',
  'ぼくをマッチしたら、次は看板。',
  '本日の共通点はランダムじゃない。',
  '共通点クラブ、ただいま参上。',
  '看板が言って、ぼくが証明する。',
  'そう、今夜は {theme} 組だよ。',
  '{value} 仲間をもっと探して。',
]

const JA_THEME_MATCH_T = [
  '仲間を見つけて！',
  'だからここにいるのさ。',
  '似た子をもっと探して！',
  'わかる？',
  '本日の共通点、わかってきたね。',
  '数えるのも楽しいよ。',
  'いい流れ！',
  'ぼくは選ばれた側。',
  '双子はどこ？',
  'それが本日の共通点。',
  'テーマ誇り！',
  'ぼくたち日替わりマッチング組。',
  '広場でも山でも同じクラブ。',
  'チームに話しかけていって。',
]

const JA_PLAZA_FLAVOR_H = [
  'アトラクションは3つ。',
  'こういう夜が好き。',
  '迷ったら金の道をたどって',
  '街灯が小さく鳴ってる。',
  'ベンチは快適…',
  '噴水の周りをぐるぐるしがち。',
  'パークのコツ：',
  'ゲストにはテーマ一致組と、',
  'ゲームからはいつでも Back to Top。',
  '島の外の水、今夜は果てしなく見える。',
  'クラシックな夜のパーク感。',
  '3つ全部急がなくていい。',
  '金の道は裏切らない。',
  '広場の人混みウォッチ、一流。',
  'Shawn、噴水の近くにいることあるよ。',
]

const JA_PLAZA_FLAVOR_T = [
  '好きな入口から飛び込んで！',
  '潮風と Meebit がいっぱい。',
  '噴水に戻ってきてね。',
  'テーマパークなのに落ち着く。',
  '座るとNPCに見つめられるけど。',
  '癖かも。',
  'みんなに話しかけて。役立つ噂があるよ。',
  'ただののんびり組がいる。',
  'ぼくたちはここにいるよ。',
  '詩的だよね。',
  'クラブっぽいのに並ばなくていい。',
  '広場も味わっていって。',
  '帰宅ルートだよ。',
  'どんなフィードよりいい。',
  '作成者の気配がプラザにある。',
  '今夜のムードは柔らかい金。',
  'まずゆっくり一周してみて。',
]

const JA_MT_FLAVOR_H = [
  'Mt. Meeb はロッジの先で待ってる。',
  'こういう夜が好き。',
  'ここで迷ったら、',
  'ボクセル石のトーチライト、',
  'トレイルのベンチはごつごつ…',
  '崖をぼーっと見がち。',
  '山岳のコツ：',
  'ゲストには登りに来た組と、',
  'いつでも橋を渡ってプラザへ戻れるよ。',
  '今夜の渓谷、ドラマチックだね。',
  'ハイランドの夜の空気。',
  '頂上を急がなくていい。',
  '松並びは風向きを裏切らない。',
  'トレイルの人混みウォッチ、一流。',
  'ステージは1000mへ積み上がる。',
]

const JA_MT_FLAVOR_T = [
  'ウォーミングアップしてからクリア狙い！',
  '松の空気と Meebit がいっぱい。',
  '道をたどって橋の門へ戻ってね。',
  '広場の街灯とは違う味だよ。',
  'でも景色が家賃を払ってくれる。',
  '登山者の癖かも。',
  '大きなジャンプの前にブロックを読んで。',
  '尾根でのんびり組がいる。',
  '噴水の噂話は消えないよ。',
  '叙事詩っぽいよね。',
  'パルクール味の山の絵葉書。',
  '地区の空気も味わっていって。',
  '寒さの出所を教えてくれる。',
  'どんなフィードよりいい。',
  'BEST標高を追いかけよう。',
  '今夜のムードは琥珀色の石。',
  'まずゆっくり尾根を一周してみて。',
]

function buildPools(lang: Lang, zone: ParkZoneId): ParkDialoguePools {
  const isJa = lang === 'ja'
  const isMt = zone === 'mountain'
  const j = isJa ? '' : ' '

  const greetings = product(
    isMt ? (isJa ? JA_MT_GREET_H : EN_MT_GREET_H) : isJa ? JA_PLAZA_GREET_H : EN_PLAZA_GREET_H,
    isMt ? (isJa ? JA_MT_GREET_T : EN_MT_GREET_T) : isJa ? JA_PLAZA_GREET_T : EN_PLAZA_GREET_T,
    j,
  )

  const gameFind = product(isJa ? JA_FIND_H : EN_FIND_H, isJa ? JA_FIND_T : EN_FIND_T, j)
  const gameTraits = product(isJa ? JA_TRAITS_H : EN_TRAITS_H, isJa ? JA_TRAITS_T : EN_TRAITS_T, j)
  const gameStreet = product(isJa ? JA_STREET_H : EN_STREET_H, isJa ? JA_STREET_T : EN_STREET_T, j)
  const gameMountain = product(isJa ? JA_MT_GAME_H : EN_MT_GAME_H, isJa ? JA_MT_GAME_T : EN_MT_GAME_T, j)

  const featuredAny = product(
    isMt ? (isJa ? JA_FEAT_MT_H : EN_FEAT_MT_H) : isJa ? JA_FEAT_H : EN_FEAT_H,
    isMt ? (isJa ? JA_FEAT_MT_T : EN_FEAT_MT_T) : isJa ? JA_FEAT_T : EN_FEAT_T,
    j,
  )

  const featuredMatched = product(
    isJa ? JA_FEAT_MATCH_H : EN_FEAT_MATCH_H,
    isJa ? JA_FEAT_MATCH_T : EN_FEAT_MATCH_T,
    j,
  )

  const themeAny = product(
    isMt ? (isJa ? JA_THEME_MT_H : EN_THEME_MT_H) : isJa ? JA_THEME_H : EN_THEME_H,
    isMt ? (isJa ? JA_THEME_MT_T : EN_THEME_MT_T) : isJa ? JA_THEME_T : EN_THEME_T,
    j,
  )

  const themeMatched = product(
    isJa ? JA_THEME_MATCH_H : EN_THEME_MATCH_H,
    isJa ? JA_THEME_MATCH_T : EN_THEME_MATCH_T,
    j,
  )

  const flavor = product(
    isMt ? (isJa ? JA_MT_FLAVOR_H : EN_MT_FLAVOR_H) : isJa ? JA_PLAZA_FLAVOR_H : EN_PLAZA_FLAVOR_H,
    isMt ? (isJa ? JA_MT_FLAVOR_T : EN_MT_FLAVOR_T) : isJa ? JA_PLAZA_FLAVOR_T : EN_PLAZA_FLAVOR_T,
    j,
  )

  return {
    greetings,
    gameFind,
    gameTraits,
    gameStreet,
    gameMountain,
    featuredAny,
    featuredMatched,
    themeAny,
    themeMatched,
    flavor,
  }
}

const CACHE: Partial<Record<`${Lang}-${ParkZoneId}`, ParkDialoguePools>> = {}

export function getParkDialoguePools(lang: Lang, zone: ParkZoneId): ParkDialoguePools {
  const key = `${lang}-${zone}` as const
  const hit = CACHE[key]
  if (hit) return hit
  const built = buildPools(lang, zone)
  CACHE[key] = built
  return built
}

export function countParkDialogueLines(pools: ParkDialoguePools) {
  return (
    pools.greetings.length +
    pools.gameFind.length +
    pools.gameTraits.length +
    pools.gameStreet.length +
    pools.gameMountain.length +
    pools.featuredAny.length +
    pools.featuredMatched.length +
    pools.themeAny.length +
    pools.themeMatched.length +
    pools.flavor.length
  )
}

/** 後方互換：プラザ EN（生成プール）。 */
export const PARK_DIALOGUE_EN = getParkDialoguePools('en', 'plaza')
/** 後方互換：プラザ JA（生成プール）。 */
export const PARK_DIALOGUE_JA = getParkDialoguePools('ja', 'plaza')
