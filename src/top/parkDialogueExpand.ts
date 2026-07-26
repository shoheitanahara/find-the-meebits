/**
 * セリフ断片の組み合わせで地区別プールを生成する。
 * plaza / mountain / culture / sea × EN / JA。
 *
 * トーン・柱: memory-bank/parkNpcDialogue.md
 * NPC = パークを楽しむ来場者（仕様説明・制作者口調禁止）
 */

import type { ParkZoneId } from './parkZones'

export type ParkDialoguePools = {
  greetings: string[]
  gameFind: string[]
  gameTraits: string[]
  gameStreet: string[]
  gameMountain: string[]
  gameNeon: string[]
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

// ─── English ─────────────────────────────────────────────────────────

const EN_PLAZA_GREET_H = [
  'Hey there!',
  'Oh, hello!',
  'Yo!',
  'Hi friend!',
  'Evening!',
  'Hey!',
  'Oh hey!',
  'Welcome!',
  'Nice timing!',
  'There you are!',
  'Hey buddy!',
  'Look who it is!',
]

const EN_PLAZA_GREET_T = [
  'Perfect night for a Park stroll.',
  'The lamps are soft tonight.',
  'Fancy bumping into you here.',
  'Between attractions already?',
  'Everyone’s in a chatty mood.',
  'Got a favorite door yet?',
  'The plaza feels alive tonight.',
  'Fresh air and Meebits — yes.',
  'You look ready for something fun.',
  'Stick around — rumors travel fast.',
  'Fountain light hits different tonight.',
  'Four districts, one wandering night.',
]

const EN_MT_GREET_H = [
  'Hey climber!',
  'Welcome up here!',
  'Oh, hello!',
  'Yo!',
  'Hi trail friend!',
  'Evening on the ridge!',
  'Hey!',
  'Oh hey!',
  'Nice timing!',
  'Look who made it!',
  'Hey buddy!',
  'Howdy, highlander!',
]

const EN_MT_GREET_T = [
  'The air feels thinner — in a good way.',
  'Pine scent and cliff light tonight.',
  'Fancy meeting you past the bridge.',
  'Warming up before today’s route?',
  'Watch the edges — they don’t forgive.',
  'Jumping legs ready?',
  'Mountain nights hit different.',
  'Torchlight on stone is gorgeous.',
  'You look ready for a ledge or two.',
  'Trail chatter’s buzzing tonight.',
  'Take a breath — the climb can wait a second.',
  'Today’s cliffs already look curious.',
]

const EN_CU_GREET_H = [
  'Welcome to Culture!',
  'Hey, fashion guest —',
  'Oh, hello!',
  'Yo!',
  'Hi!',
  'Gallery night vibes.',
  'Hey!',
  'Oh hey!',
  'Nice timing!',
  'Look who crossed over!',
  'Hey buddy!',
  'Evening!',
]

const EN_CU_GREET_T = [
  'Meebits are the art tonight.',
  'Take a slow lap of the district.',
  'Cool blue light loves a good outfit.',
  'Navy floors, soft spotlights — dreamy.',
  'Glad you came through the north gate.',
  'Stay curious in these halls.',
  'Runway stripe pulls the eye, right?',
  'Suits look sharp under this glow.',
  'Three builds rising soon — peek around.',
  'Culture air feels different from the plaza.',
  'No dress code, all dress-code vibes.',
  'Wander like you’re already on the catwalk.',
]

const EN_SEA_GREET_H = [
  'Welcome to the Sea District!',
  'Hey, shoreline guest —',
  'Oh, hello!',
  'Yo!',
  'Hi!',
  'Night beach vibes.',
  'Hey!',
  'Oh hey!',
  'Nice timing!',
  'Look who hit the sand!',
  'Hey buddy!',
  'Evening by the tide!',
]

const EN_SEA_GREET_T = [
  'Smell that quiet night sea?',
  'Sand underfoot, stars overhead.',
  'Glad you came through the west gate.',
  'Lanterns on warm sand — love it.',
  'Palm silhouettes against the sky.',
  'Tide’s soft tonight.',
  'Take it slow on the shore path.',
  'Pier lights look cozy from here.',
  'Beach air hits different after the plaza.',
  'Three shore builds rising soon.',
  'Kick back — the ocean’s endless tonight.',
  'Foam line leads you home if you wander.',
]

const EN_FIND_H = [
  'Find the Meebit is that way —',
  'If you like hunting faces in a crowd,',
  'The Museum never shows me the same room twice.',
  'Every Museum run feels brand new —',
  'I love that fresh sea of faces.',
  'Lost in Meebits?',
  'Museum tip from a guest:',
  'Wrong Meebit?',
  'Crowds look alike until they don’t.',
  'I keep going back because the faces change.',
  'Hunting one Meebit in a reshuffled crowd —',
  'If you clear the Museum,',
]

const EN_FIND_T = [
  'go chase them in the Museum!',
  'try Find the Meebit tonight.',
  'one target, endless almosts.',
  'talk to folks — rumors help.',
  'bring focus and soft eyes.',
  'that’s the Museum rush.',
  'keep walking — the right one’s somewhere.',
  'don’t freeze up!',
  'trust your eyes, not the panic.',
  'After Hours waits if you make it.',
  'pure hide-and-seek with style.',
  'that’s why it never gets stale.',
]

const EN_TRAITS_H = [
  'Trait Hunt is all about the tiny tells —',
  'Hair, clothes, accessories…',
  'Feeling stylish?',
  'Same shirt? Same glasses?',
  'I missed earrings once and ate dirt.',
  'Trait Hunt feels like',
  'Read the clue twice —',
  'Gallery light helps if you slow down.',
  'Matching traits is oddly satisfying.',
  'If you love outfits,',
  'Today’s lookalike hunt starts with a clue.',
  'Sharp eyes beat fast feet there.',
]

const EN_TRAITS_T = [
  'spot the lookalikes and smile.',
  'Trait Hunt lives in the details.',
  'the gallery is calling.',
  'Trait Hunt will test you.',
  'lesson learned the hard way.',
  'fashion bingo with Meebits.',
  'one trait can flip everything.',
  'don’t rush the first glance.',
  'you’ll see what I mean.',
  'Trait Hunt is your playground.',
  'perfect between longer attractions.',
  'careful walkers win that room.',
]

const EN_STREET_H = [
  '8th Street looks the same… until it doesn’t.',
  'Same alley, different walkers tonight —',
  'If you like tiny wrongnesses,',
  'I swear the crowd rearranges itself.',
  'Warm lamps, cold twists.',
  'Watch the walkers carefully.',
  'Every loop, someone’s standing wrong.',
  '8th Street keeps my spine awake.',
  'Turn the corner twice.',
  'The white fade means stay sharp.',
  'Anomalies shift — that’s the thrill.',
  'Yesterday’s street guests already feel gone.',
]

const EN_STREET_T = [
  'notice what changed!',
  'walk into 8th Street and feel it.',
  'blink and you’ll miss it.',
  'that’s why I keep looping.',
  'look twice. Trust your gut.',
  'one of them isn’t right.',
  'slow eyes win there.',
  'don’t sprint past the clues.',
  'first-person night hits different.',
  'come taste the unease yourself.',
  'I’m hooked on those tiny tells.',
  'keeps the night feeling alive.',
]

const EN_MT_GAME_H = [
  'Mt. Meeb is right there —',
  'Today’s trail already feels new —',
  'Yesterday’s ledges are gone.',
  'I love starting from Stage 1 each morning.',
  'The mountain remakes itself overnight —',
  'If you like jumps and dashes,',
  'Later stages get spicy.',
  'Fell into a ravine?',
  'Clearing a stage still feels huge.',
  'Watch your footing near gaps.',
  'Three lanes, one rhythm —',
  'Today’s cliffs have my heart racing.',
]

const EN_MT_GAME_T = [
  'scale it with jumps and dashes!',
  'come chase today’s route.',
  'fresh cliffs, fresh butterflies.',
  'it’s exciting, not a chore.',
  'try the Mt. Meeb climb.',
  'climb back up and go again.',
  'read the blocks before you leap.',
  'don’t freeze on the edge!',
  'aim for that high dream.',
  'torchlight helps, guts help more.',
  'my favorite reason to come back.',
  'pick the lane that fits you.',
]

const EN_NEON_GAME_H = [
  'Jerry Mountain is that jelly tower —',
  'Tonight’s glow path feels brand new —',
  'Yesterday’s neon ledges? Already gone.',
  'I woke up ready for Stage 1 again.',
  'Jerry remakes the route daily —',
  'If you like glowing cliffs,',
  'Same jumps, different vibe…',
  'Fell into the abyss?',
  'Clearing a Jerry stage feels electric.',
  'Watch the neon edges near gaps.',
  'Soft jelly blocks, sharp nerves —',
  'I’m hooked on the daily remix.',
]

const EN_NEON_GAME_T = [
  'scale the glowing stack!',
  'try Jerry Mountain next door.',
  'come taste today’s route.',
  'fresh glow, fresh nerves.',
  'read the jelly before you leap.',
  'climb back up and glow upward.',
  'don’t freeze on the edge!',
  'worth every stumble.',
  'like candy parkour over a void.',
  'sparkles help, guts help more.',
  'that’s why the tower stays exciting.',
  'pick a lane and go.',
]

const EN_FEAT_H = [
  'Did you see today’s star',
  'Today’s featured Meebit',
  'The fountain idol changes with the day.',
  'I took a silly selfie with the statue.',
  'Check the board by the fountain —',
  'Plaza chatter is all about',
  'Don’t miss the pedestal —',
  'Half the guests share a vibe with',
  'Today’s copper look is a banger.',
  'If you’re hunting lookalikes,',
  'New morning, new fountain face —',
  'That statue is tonight’s heartbeat.',
]

const EN_FEAT_T = [
  'by the fountain? Go look!',
  'is up on the pedestal — hard to miss.',
  'today’s look is gorgeous.',
  'no shame. I recommend it.',
  'you can read the star’s traits.',
  'today’s featured face.',
  'start your night there.',
  'can you tell who’s matching?',
  'even in metal it pops.',
  'begin at the fountain.',
  'it’s my favorite daily ritual.',
  'worth a slow circle around.',
]

const EN_FEAT_MT_H = [
  'Heard about today’s star',
  'Even up here people talk about',
  'The plaza fountain has today’s idol.',
  'I hiked over just to peek at',
  'Trail chatter mentions',
  'Don’t forget the plaza pedestal —',
  'New morning, new fountain face —',
  'Mountain guests still care about',
  'After a climb I always check',
  'Today’s copper look is a banger.',
  'If you’re hunting lookalikes later,',
  'That plaza statue is still the heartbeat.',
]

const EN_FEAT_MT_T = [
  'down in the plaza? Worth the walk.',
  'the fountain statue tonight.',
  'today’s featured face.',
  'start there after your ridge lap.',
  'today’s idol a lot.',
  'torchlight and copper both glow.',
  'it’s the park’s daily ritual.',
  'go look when your legs allow.',
  'can you tell who’s matching?',
  'even from this altitude it matters.',
  'begin at the fountain.',
  'worth crossing the bridge for.',
]

const EN_FEAT_MATCH_H = [
  'I’m on today’s star team!',
  'Look closely…',
  'Yep — star crew tonight.',
  'Matching the statue’s vibe…',
  'I’m soaking in the spotlight',
  'Not the statue, but close —',
  'Hunt the other star guests too —',
  'Same aura as the fountain idol.',
  'We’re the daily lookalike squad.',
  'Catch me if you can —',
  'Being on the star team',
  'Today chose this look for us.',
]

const EN_FEAT_MATCH_T = [
  'same energy as the statue.',
  'I match today’s featured vibe. See it?',
  'find us in the crowd!',
  'I’m the walking edition.',
  'with today’s featured Meebit.',
  'I’m in tonight’s spotlight circle.',
  'we’re scattered on purpose.',
  'makes me a little proud.',
  'twins wanted!',
  'star guest energy.',
  'come say hi to the squad.',
  'plaza gold suits us today.',
]

const EN_THEME_H = [
  'Today’s shared trait is on the fountain board.',
  'That little plaza sign',
  'I love the daily link game —',
  'Look for “{theme}” energy tonight.',
  'Half the crowd is quietly matching.',
  'The daily trait refreshes with the day.',
  'If you’re collecting lookalikes,',
  'Theme nights make the plaza buzz.',
  'Today’s link isn’t random gossip —',
  'Fresh every day,',
  'When there’s a daily theme,',
  'The board says {theme} —',
]

const EN_THEME_T = [
  'go peek before you wander far.',
  'spells out tonight’s link.',
  'it’s the park’s soft handshake.',
  'can you spot us?',
  'start at the fountain board.',
  'keep your eyes open.',
  'begin with “{value}”.',
  '{value} is having a moment.',
  'it’s written as {theme}.',
  'that’s why I keep chatting strangers.',
  'the rumor is usually true.',
  'follow that thread through the crowd.',
]

const EN_THEME_MT_H = [
  'Highland gossip mentions today’s theme —',
  'Even on the trail we talk about',
  'Look for “{theme}” energy tonight.',
  'The daily trait refreshes with the day.',
  'If you’re collecting lookalikes later,',
  'Theme nights reach the ridge too.',
  'I heard the plaza board says {theme}.',
  'Fresh every day,',
  'When there’s a daily theme,',
  'Mountain guests still play the link game —',
  'After the climb, check the fountain sign.',
  'Today’s link isn’t just plaza talk —',
]

const EN_THEME_MT_T = [
  'worth remembering on the way down.',
  'the daily handshake of the Park.',
  'can you spot us?',
  'keep your eyes open.',
  'begin with “{value}”.',
  '{value} is having a moment.',
  'it’s written as {theme}.',
  'that’s why trail chat stays lively.',
  'the rumor climbed up here with us.',
  'follow that thread later in the plaza.',
  'soft eyes, sharp theme hunt.',
  'it ties every district together.',
]

const EN_THEME_MATCH_H = [
  'Yes — I’m a {theme} guest tonight.',
  'Look for more of us with {value}.',
  'Theme pride!',
  'We’re the daily matching set.',
  'If you love {value},',
  'I prove the board right.',
  'Same link, different district energy —',
  'Catch the other {theme} guests —',
  'Being matched feels lucky tonight.',
  'Today’s link found me.',
  'Quiet flex: {value}.',
  'You’re learning the daily link.',
]

const EN_THEME_MATCH_T = [
  'come say hi to the squad.',
  'we’re sprinkled through the Park.',
  'spot us and smile.',
  'plaza, mountain, culture, or sea — same club.',
  'you’re among friends.',
  'that’s the fun of tonight.',
  'keep hunting the thread.',
  'I wear it proudly.',
  'nice eyes if you noticed.',
  'welcome to the matching set.',
  'the board wasn’t lying.',
  'glad you asked around.',
]

const EN_PLAZA_FLAVOR_H = [
  'This Park never copies yesterday —',
  'Fresh crowds, fresh trails, fresh rumors —',
  'I come back because nothing stays still here.',
  'Every visit feels like a new postcard —',
  'If you get lost,',
  'The lamps hum softly.',
  'I keep looping the fountain.',
  'Golden paths never lie.',
  'East bridge leads to the mountains —',
  'North gate opens to Culture —',
  'West gate opens to the Sea District —',
  'Don’t rush every attraction —',
]

const EN_PLAZA_FLAVOR_T = [
  'that’s the magic for me.',
  'wander and you’ll feel it.',
  'come taste tonight’s version of the Park.',
  'I’m never bored between the gates.',
  'follow the gold path back to the fountain.',
  'weirdly calming for a theme park.',
  'habit, maybe.',
  'they lead you home.',
  'Mt. Meeb and Jerry Mountain await.',
  'runway lights and cool blue halls await.',
  'palms, sand, and a night pier await.',
  'savor the plaza too.',
]

const EN_MT_FLAVOR_H = [
  'Today’s cliffs already surprised me —',
  'Morning climb, brand-new route —',
  'I love how the mountain remixes itself.',
  'Jerry Mountain glows beside the trail.',
  'Torchlight on voxel stone',
  'If you get lost up here,',
  'Don’t rush the summit —',
  'Trail people-watching is elite.',
  'West of the plaza is the night beach —',
  'North of the plaza is Culture —',
  'Pine rows never lie about the wind.',
  'You can always cross back to the plaza.',
]

const EN_MT_FLAVOR_T = [
  'come feel today’s trail yourself.',
  'my legs are already curious.',
  'that’s highland joy for me.',
  'try the jelly tower next door.',
  'hits different from plaza lamps.',
  'follow the path back to the bridge gate.',
  'savor the district air too.',
  'better than any feed.',
  'tide and palm silhouettes that way.',
  'runway lights and cool blue halls.',
  'warm up, then chase a clear!',
  'fountain gossip never dies.',
]

const EN_CU_FLAVOR_H = [
  'Culture air is all cool blue tonight.',
  'The runway stripe leads the eye —',
  'North of the plaza, this gallery mood.',
  'Three coming attractions:',
  'Half the crowd here wears suits —',
  'Don’t rush the galleries —',
  'Back through the south gate',
  'PFP Studio is still scaffolding,',
  'Trait Museum will sort favorites',
  'When the runway opens,',
  'Compared to beach or mountain,',
  'I keep walking the runway path —',
]

const EN_CU_FLAVOR_T = [
  'savor the soft spotlights.',
  'follow it like a quiet catwalk.',
  'glad you wandered in.',
  'runway, museum, PFP studio.',
  'gallery energy loves a sharp look.',
  'blue air is the point.',
  'returns you to the plaza fountain.',
  'but the idea already sparkles.',
  'by the details you love.',
  'expect pure style energy.',
  'this place is all about Meebit style.',
  'habit of a gallery night.',
]

const EN_SEA_FLAVOR_H = [
  'Night beach energy is soft and wide.',
  'Palm silhouettes against the stars —',
  'West of the plaza, this shoreline.',
  'Three shore builds rising:',
  'Lantern light on warm sand',
  'Don’t rush the tide line —',
  'The pier gate leads home —',
  'Foam guides you if you wander.',
  'Compared to mountain cliffs,',
  'I keep looping the sand path —',
  'Tide’s quiet, sky’s loud.',
  'Smell that night sea?',
]

const EN_SEA_FLAVOR_T = [
  'take a slow shore lap.',
  'love that postcard feeling.',
  'glad you crossed over.',
  'beach club, tide pool, pier stage.',
  'makes everything feel warmer.',
  'let the ocean breathe with you.',
  'back to the plaza lamps.',
  'habit of a shoreline guest.',
  'this place softens your pace.',
  'sand underfoot is the whole mood.',
  'come feel it yourself.',
  'endless water, soft nerves.',
]

// ─── Japanese ────────────────────────────────────────────────────────

const JA_PLAZA_GREET_H = [
  'やあ！',
  'おっ、こんにちは！',
  'よー！',
  'ひゃっほー！',
  'こんばんは！',
  'ねえねえ！',
  'あ、どうも！',
  'ようこそ！',
  'いいタイミング！',
  'いたいた！',
  'おっす！',
  '見て見て、誰か来た！',
]

const JA_PLAZA_GREET_T = [
  'パーク散歩に最高の夜だね。',
  '今夜の灯り、やわらかいよ。',
  'ここで会うなんて奇遇だね。',
  'アトラクションの合間？',
  'みんなおしゃべり気分だよ。',
  '推しの入口、もう決まった？',
  '広場、今夜いきてるね。',
  '空気と Meebit、最高の組み合わせ。',
  '何か楽しそうな顔してる。',
  'しばらくいて。噂、すぐ届くよ。',
  '噴水の光、今夜いい感じ。',
  '地区が4つ、今夜は全部つながってる。',
]

const JA_MT_GREET_H = [
  'やあ、登山者！',
  '山へようこそ！',
  'おっ、こんにちは！',
  'よー！',
  'トレイルの友よ！',
  '尾根のこんばんは！',
  'ねえねえ！',
  'あ、どうも！',
  'いいタイミング！',
  '来た来た！',
  'おっす！',
  'ハイランダー！',
]

const JA_MT_GREET_T = [
  '空気がうすい…いい意味でね。',
  '松の匂いと崖の灯り、今夜いいよ。',
  '橋の向こうで会うなんてね。',
  '今日のルートの前にウォーミングアップ？',
  '縁は容赦ないからね。',
  'ジャンプ足、準備できた？',
  '山の夜は空気が違う。',
  '石にトーチが映えてきれい。',
  '棚道、いけそうな顔してる。',
  'トレイルの噂、今夜アツいよ。',
  '一息ついてからでも遅くない。',
  '今日の崖、もう好奇してる顔だね。',
]

const JA_CU_GREET_H = [
  'カルチャーへようこそ！',
  'ファッション好きのゲストね —',
  'おっ、こんにちは！',
  'よー！',
  'やあ！',
  'ギャラリーナイトだね。',
  'ねえねえ！',
  'あ、どうも！',
  'いいタイミング！',
  '越えてきたね！',
  'おっす！',
  'こんばんは！',
]

const JA_CU_GREET_T = [
  '今夜の主役は Meebits そのもの。',
  '地区をゆっくり一周してみて。',
  'クールブルーの光、コーデ映えるよ。',
  '濃紺の床とやわらかいスポット、夢みたい。',
  '北の門を越えてきてくれてありがとう。',
  'この廊下、好奇心だいじにね。',
  'ランウェイのストライプ、目を引くよね。',
  'この明かりの下、スーツが映える。',
  '建物はいま3つ、立ち上がり中。',
  '広場とは空気が違うよね。',
  'ドレスコードなしのドレスコード気分。',
  'もうランウェイ歩いてる気分でどうぞ。',
]

const JA_SEA_GREET_H = [
  'シーエリアへようこそ！',
  '海岸のゲストね —',
  'おっ、こんにちは！',
  'よー！',
  'やあ！',
  '夜ビーチ気分だね。',
  'ねえねえ！',
  'あ、どうも！',
  'いいタイミング！',
  '砂まで来たね！',
  'おっす！',
  '潮風のこんばんは！',
]

const JA_SEA_GREET_T = [
  '夜の潮の匂い、わかる？',
  '足元は砂、頭上は星。',
  '西の門を越えてきてくれてありがとう。',
  'ランタンの光が砂を暖めてる。',
  'ヤシのシルエット、星に映えてる。',
  '今夜の潮は静かだね。',
  '岸辺はゆっくり歩いて。',
  '桟橋の灯り、ここからかわいいよ。',
  '広場のあとだと空気がやわらかい。',
  '岸の建物、いま3つ立ち上がり中。',
  '海は果てしない。肩の力抜いて。',
  '迷ったら泡のラインをたどって。',
]

const JA_FIND_H = [
  'Find the Meebit はあっち！',
  '人混みの中の顔探しが好きなら、',
  'ミュージアム、入るたびに顔ぶれが新しい。',
  '同じ顔には二度と会えない気がする。',
  '群衆が毎回シャッフルされるの、',
  'Meebit の海に迷子？',
  'ミュージアムのゲスト心得：',
  '違う Meebit だった？',
  '似てる海の中から一人を探すの、',
  '顔が変わるから何度も入りたくなる。',
  '新しい顔の海からターゲットを狩る —',
  'ミュージアムを制覇したら、',
]

const JA_FIND_T = [
  '美術館でターゲットを探してね。',
  'Find the Meebit、今夜おすすめ。',
  'それが醍醐味だよ。',
  '話しかけると噂がヒントになるよ。',
  '集中とやわらかい目で。',
  'それがミュージアムの興奮だよ。',
  '歩き続けて。正解はどこかにいる。',
  '固まらないで！',
  '焦らず目を信じるんだ。',
  'After Hours が待ってるよ。',
  'おしゃれかくれんぼの最高峰。',
  'だから飽きないんだよね。',
]

const JA_TRAITS_H = [
  'トレイトハントは細部勝負 —',
  '髪型・服・アクセ…',
  'おしゃれ好きなら、',
  '同じシャツ？同じメガネ？',
  'ピアス見落として負けたことある。',
  'トレイトハントは、',
  '手がかりは二度読んで。',
  'ギャラリーの灯りは、ゆっくり向き。',
  '特徴が一致した瞬間、',
  'コーデが好きなら、',
  '今日の似てる探しは手がかりから。',
  '速さより観察眼が勝つよ。',
]

const JA_TRAITS_T = [
  'お揃いを見つけてニヤリして。',
  'トレイトハントは細部に宿る。',
  'ギャラリーが呼んでるよ。',
  'トレイトハントが試してくる。',
  '痛いレッスンだった…。',
  'Meebit 版ファッションビンゴ。',
  '一つのトレイトで全部変わる。',
  '最初の一目で焦らないで。',
  '妙に気持ちいいんだ。',
  'トレイトハントが遊び場だよ。',
  '長いアトラクションの合間にぴったり。',
  '丁寧に歩く人が勝つ部屋だよ。',
]

const JA_STREET_H = [
  '8番ストリート、見た目は同じなのに違う。',
  '同じ路地なのに、今夜の歩行者が違う。',
  '小さな「おかしさ」が好きなら、',
  '人の並び、入れ替わってる気がする。',
  '温かい街灯、冷たいひねり。',
  '歩行者をよく見て。',
  'ループするたび、誰か一人おかしい。',
  '8番ストリート、背筋が覚えてる。',
  '角を二度曲がって。',
  '白いフェードのあとは油断しないで。',
  '異変の出方が毎回ちがうの、好き。',
  '昨日の路地の人、もういない感じ。',
]

const JA_STREET_T = [
  '変化に気づけるかな？',
  '8番ストリートに入って感じてみて。',
  '瞬きすると逃すよ。',
  'だからループが止まらない。',
  '二度見て、直感を信じて。',
  '誰か一人、おかしいはず。',
  'ゆっくり見る目が勝つ。',
  '手がかりを走り抜けないで。',
  '一人称の夜は空気が違う。',
  '一度、あの違和感を味わってみて。',
  '小さな異変にハマってる。',
  '夜が生きてる感じがする。',
]

const JA_MT_GAME_H = [
  'Mt. Meeb はすぐそこ！',
  '今日のトレイル、もう別物だよ —',
  '昨日の棚道、もうないみたい。',
  '毎朝 Stage 1 から始めるの、ワクワクする。',
  '山が夜のうちに作り直される感じ —',
  'ジャンプとダッシュが好きなら、',
  '後半ステージ、熱いよ。',
  '渓谷に落ちた？',
  'ステージクリアの快感、まだでかい。',
  '穴の手前、足元注意。',
  'レーンは3つ、リズムはひとつ —',
  '今日の崖、もうドキドキしてる。',
]

const JA_MT_GAME_T = [
  'ジャンプとダッシュで登ってみて！',
  '今日のルート、一緒に追ってみて。',
  '新しい崖、新しいドキドキ。',
  '罰じゃなくて、朝のごほうびだよ。',
  'Mt. Meeb 登攀、おすすめ。',
  '立ち上がってもう一回だ。',
  '跳ぶ前にブロックを読んで。',
  '縁で固まらないで！',
  '高い夢を狙おう。',
  'トーチも大事、胆力もっと大事。',
  'だからまた来たくなる。',
  '自分のレーンを選んで。',
]

const JA_NEON_GAME_H = [
  'ジェリーマウンテンはあのゼリー塔 —',
  '今夜のゼリー道、また新しい —',
  '昨日のネオン棚、もう消えてる。',
  '朝から Stage 1、気合い入る。',
  'ジェリー塔の光ルート、毎日ちがう —',
  '光る崖が好きなら、',
  '同じジャンプ、違う空気…',
  '奈落に落ちた？',
  'ジェリーのステージクリア、電気走る感じ。',
  '穴の手前、ネオンの縁に注意。',
  'やわらかいゼリー、するどい緊張 —',
  '日替わりリミックスにハマってる。',
]

const JA_NEON_GAME_T = [
  '光る塔を登ってみて！',
  '隣のジェリーマウンテン、おすすめ。',
  '今日のルート、味わってみて。',
  '新しい光、新しい緊張。',
  '跳ぶ前にゼリーブロックを読んで。',
  '立ち上がって光のほうへ。',
  '縁で固まらないで！',
  'つまずき全部に価値がある。',
  '奈落の上のキャンディパルクール。',
  'スパークルも大事、胆力もっと大事。',
  'だから塔が飽きないんだ。',
  'レーンを選んで行こう。',
]

const JA_FEAT_H = [
  '今日の主役、見た？',
  '本日の Featured Meebit、',
  '噴水の銅像、日替わりなんだ。',
  '銅像と変な自撮り撮っちゃった。',
  '噴水横の看板、見て —',
  '広場の噂の中心は、',
  '台座、見逃さないで —',
  'ゲストの半分くらいが雰囲気リンクしてる、',
  '今日の銅像ルック、刺さる。',
  '似てる探ししてるなら、',
  '朝が来ると噴水の顔が新しい —',
  'あの銅像が今夜の心拍だよ。',
]

const JA_FEAT_T = [
  '噴水のところ！見に行って！',
  '台座の上だよ。見逃せない。',
  '今日の見た目、最高。',
  '恥ずかしがらずおすすめ。',
  '主役のトレイトが読めるよ。',
  '今日の推し顔だよ。',
  '夜のスタートはそこから。',
  '誰が似てるか分かる？',
  '金属なのに映える。',
  'まず噴水へ。',
  'ぼくの好きな日替わり儀式だよ。',
  'ゆっくり一周する価値あり。',
]

const JA_FEAT_MT_H = [
  '今日の主役の話、聞いた？',
  'ここ山上でも噂なのは、',
  'プラザの噴水に今日の偶像がいる。',
  'のぞきに橋まで降りたよ、',
  'トレイルの雑談でも出てくる、',
  'プラザの台座、忘れないで —',
  '朝が来ると噴水の顔が新しい —',
  '登山者も気にしてるよ、',
  '登ったあと必ず見るのは、',
  '今日の銅像ルック、刺さる。',
  'あとで似てる探しするなら、',
  '広場の銅像が、まだ心拍だよ。',
]

const JA_FEAT_MT_T = [
  '広場まで歩く価値あるよ。',
  '噴水の銅像の話。',
  '今日の推し顔だよ。',
  '尾根一周のあとにどうぞ。',
  '今日の偶像の話。',
  'トーチと銅、どっちも光る。',
  'パークの日替わり儀式だよ。',
  '足が動いたら見に行って。',
  '誰が似てるか分かる？',
  'この標高からでも大事な話題。',
  'まず噴水から。',
  '橋を渡る理由になるよ。',
]

const JA_FEAT_MATCH_H = [
  'ぼく、今日の主役チームだよ！',
  'よく見て…',
  'そう、今夜はスター組。',
  '銅像の空気に寄せてる…',
  'スポットライト浴び気味で、',
  '銅像本人じゃないけど近い —',
  '他のスターゲストも探して —',
  '噴水の偶像と同じオーラ。',
  'ぼくたち日替わり似てる組。',
  'つかまえてみて —',
  'スター組でいるの、',
  '今日のルック、選ばれちゃった。',
]

const JA_FEAT_MATCH_T = [
  '銅像と同じ熱量だよ。',
  '今日の Featured っぽさ、分かる？',
  '人混みの中にいるよ！',
  '歩いてる版だよ。',
  '今日の主役とつながってる。',
  '今夜のスポットライト圏内。',
  'わざと散らばってるんだ。',
  'ちょっと誇らしい。',
  'ツイン募集中！',
  'スターゲスト気分。',
  'チームに話しかけていって。',
  '広場の金が似合う夜だよ。',
]

const JA_THEME_H = [
  '今日の共通点は噴水の看板だよ。',
  '広場の小さな看板が、',
  '日替わりリンク遊び、好き —',
  '今夜は「{theme}」の気配を探して。',
  '人混みの半分、静かに一致してる。',
  '日替わりトレイトは日付で変わる。',
  '似てる集めしてるなら、',
  'テーマの夜は広場がざわつく。',
  '今日のリンク、ただの噂じゃない —',
  '毎日フレッシュで、',
  '日替わりテーマがあるとき、',
  '看板は {theme} って言ってる —',
]

const JA_THEME_T = [
  '遠くへ行く前にのぞいてみて。',
  '今夜のリンクを教えてくれる。',
  'パークのやわらかい握手だよ。',
  'ぼくたち見つかるかな？',
  '噴水の看板からスタート。',
  '目、開けてて。',
  'まずは「{value}」から。',
  '{value} が今アツい。',
  '表記は {theme} だよ。',
  'だから知らない人にも話しかけちゃう。',
  '噂、だいたい当たるよ。',
  'その糸を人混みでたどって。',
]

const JA_THEME_MT_H = [
  'ハイランドの噂でも日替わりテーマの話 —',
  'トレイルでも話題なのは、',
  '今夜は「{theme}」の気配を探して。',
  '日替わりトレイトは日付で変わる。',
  'あとで似てる集めするなら、',
  'テーマの夜は尾根まで届く。',
  '広場の看板は {theme} らしい。',
  '毎日フレッシュで、',
  '日替わりテーマがあるとき、',
  '登山者もリンク遊びに参加してる —',
  '登ったあと、噴水の看板見てね。',
  '今日のリンク、広場だけの話じゃない —',
]

const JA_THEME_MT_T = [
  '下り道で覚えておくといいよ。',
  'パークの日替わり握手だよ。',
  'ぼくたち見つかるかな？',
  '目、開けてて。',
  'まずは「{value}」から。',
  '{value} が今アツい。',
  '表記は {theme} だよ。',
  'だから尾根の雑談が生きてる。',
  '噂、ここまで登ってきたよ。',
  'あとで広場でその糸をたどって。',
  'やわらかい目で、テーマ狩り。',
  '地区ぜんぶをつなぐ糸だよ。',
]

const JA_THEME_MATCH_H = [
  'そう、今夜は {theme} 組だよ。',
  '{value} 仲間をもっと探して。',
  'テーマ誇り！',
  'ぼくたち日替わりマッチング組。',
  '{value} が好きなら、',
  '看板、証明してるよ。',
  '同じリンク、地区で空気は違う —',
  '他の {theme} ゲストも捕まえて —',
  'マッチしてるの、今夜ラッキー気分。',
  '今日のリンクがぼくを見つけた。',
  '静かな自慢：{value}。',
  '日替わりリンク、覚えてきたね。',
]

const JA_THEME_MATCH_T = [
  'チームに話しかけていって。',
  'パーク中にちらばってるよ。',
  '見つけてニヤリして。',
  '広場でも山でも海でもカルチャーでも、同じクラブ。',
  '友だちの中にいるよ。',
  '今夜の面白さはそこだよ。',
  '糸を追い続けて。',
  '誇らしく着てるよ。',
  '気づいたなら目がいい。',
  'マッチング組へようこそ。',
  '看板、嘘じゃなかったでしょ。',
  '聞いてくれてありがとう。',
]

const JA_PLAZA_FLAVOR_H = [
  'このパーク、昨日のコピーにはならない —',
  '新しい顔、新しい道、新しい噂 —',
  '何もじっとしてないから、また来ちゃう。',
  '来るたびに別の絵葉書みたい —',
  '迷ったら、',
  '街灯が小さく鳴ってる。',
  '噴水の周りをぐるぐるしがち。',
  '金の道は裏切らない。',
  '東の橋の先が山岳地区 —',
  '北の門の先がカルチャー —',
  '西の門の先がシーエリア —',
  '全部急がなくていい —',
]

const JA_PLAZA_FLAVOR_T = [
  'それがぼくにとっての魔法だよ。',
  '歩いてると伝わってくるよ。',
  '今夜バージョンのパーク、味わってみて。',
  '門と門のあいだ、退屈しない。',
  '金の道をたどって噴水へ戻ってね。',
  'テーマパークなのに落ち着く。',
  '癖かも。',
  '帰宅ルートだよ。',
  'Mt. Meeb とジェリーマウンテンが待ってるよ。',
  'ランウェイの光とクールな青の廊下。',
  'ヤシと砂浜と夜の桟橋が待ってるよ。',
  '広場も味わっていって。',
]

const JA_MT_FLAVOR_H = [
  '今日の崖、もうびっくりさせられた —',
  '朝イチの登攀、ルートが新しい —',
  '山のリミックス、好きすぎる。',
  'ジェリーマウンテンがトレイルの脇で光ってる。',
  'ボクセル石のトーチライト、',
  'ここで迷ったら、',
  '頂上を急がなくていい —',
  'トレイルの人混みウォッチ、一流。',
  '広場の西は夜のビーチ —',
  '広場の北はカルチャー —',
  '松並びは風向きを裏切らない。',
  'いつでも橋を渡ってプラザへ戻れるよ。',
]

const JA_MT_FLAVOR_T = [
  '今日のトレイル、自分で感じてみて。',
  '足がもう好奇してる。',
  'それがハイランドのよろこびだよ。',
  '隣のゼリー塔も試してみて。',
  '広場の街灯とは違う味だよ。',
  '道をたどって橋の門へ戻ってね。',
  '地区の空気も味わっていって。',
  'どんなフィードよりいい。',
  '潮風とヤシのシルエット、あっちだよ。',
  'ランウェイの光とクールな青の廊下。',
  'ウォーミングアップしてからクリア狙い！',
  '噴水の噂話は消えないよ。',
]

const JA_CU_FLAVOR_H = [
  '今夜のカルチャーはクールブルー。',
  'ランウェイのストライプが目を導く —',
  '広場の北、このギャラリー気分。',
  '工事中の3つ：',
  'ここの来場者、スーツ率高め —',
  'ギャラリーを急がなくていい —',
  '南の門をくぐれば',
  'PFPクリエイターはまだ足場だけど、',
  'トレイト博物館は',
  'ランウェイが開いたら、',
  'ビーチや山と比べると、',
  'ランウェイの道を歩きがち —',
]

const JA_CU_FLAVOR_T = [
  'やわらかいスポットを味わって。',
  '静かなキャットウォークみたいに。',
  '来てくれてうれしい。',
  'ランウェイ、博物館、PFPスタジオ。',
  'ギャラリーはシャープな格好が似合う。',
  '青い空気が主役だよ。',
  '広場の噴水へ戻れるよ。',
  'アイデアだけはもう輝いてる。',
  '好きな細部でお気に入りを探す場所。',
  'スタイル全開の空気になるはず。',
  'ここは Meebit のスタイルそのもの。',
  'ギャラリー夜の癖かも。',
]

const JA_SEA_FLAVOR_H = [
  '夜のビーチ、広くてやわらかい。',
  'ヤシのシルエットが星に映えて —',
  '広場の西、この岸辺。',
  '岸の3つ：',
  'ランタンの光が砂を暖めてる。',
  '波打ち際を急がなくていい —',
  '桟橋の門が帰り道 —',
  '迷ったら泡が案内してくれる。',
  '山の崖と比べると、',
  '砂道をぐるぐるしがち —',
  '潮は静か、空はうるさい。',
  '夜の潮の匂い、わかる？',
]

const JA_SEA_FLAVOR_T = [
  'ゆっくり岸を一周してみて。',
  '絵葉書みたいで好き。',
  '越えてきてくれてうれしい。',
  'ビーチクラブ、タイドプール、桟橋ステージ。',
  'ぜんぶ温かく感じる。',
  '海と一緒に息して。',
  '広場の灯りへ戻れるよ。',
  '海岸ゲストの癖かも。',
  'ペースが落ちる場所だよ。',
  '足元の砂がムードそのもの。',
  '自分で感じてみて。',
  '果てない水、やわらかい神経。',
]

// ─── build ───────────────────────────────────────────────────────────

function buildPools(lang: Lang, zone: ParkZoneId): ParkDialoguePools {
  const isJa = lang === 'ja'
  const isMt = zone === 'mountain'
  const isCu = zone === 'culture'
  const isSea = zone === 'sea'
  const j = isJa ? '' : ' '

  const greetH = isMt
    ? isJa
      ? JA_MT_GREET_H
      : EN_MT_GREET_H
    : isCu
      ? isJa
        ? JA_CU_GREET_H
        : EN_CU_GREET_H
      : isSea
        ? isJa
          ? JA_SEA_GREET_H
          : EN_SEA_GREET_H
        : isJa
          ? JA_PLAZA_GREET_H
          : EN_PLAZA_GREET_H
  const greetT = isMt
    ? isJa
      ? JA_MT_GREET_T
      : EN_MT_GREET_T
    : isCu
      ? isJa
        ? JA_CU_GREET_T
        : EN_CU_GREET_T
      : isSea
        ? isJa
          ? JA_SEA_GREET_T
          : EN_SEA_GREET_T
        : isJa
          ? JA_PLAZA_GREET_T
          : EN_PLAZA_GREET_T
  const greetings = product(greetH, greetT, j)

  const gameFind = product(isJa ? JA_FIND_H : EN_FIND_H, isJa ? JA_FIND_T : EN_FIND_T, j)
  const gameTraits = product(isJa ? JA_TRAITS_H : EN_TRAITS_H, isJa ? JA_TRAITS_T : EN_TRAITS_T, j)
  const gameStreet = product(isJa ? JA_STREET_H : EN_STREET_H, isJa ? JA_STREET_T : EN_STREET_T, j)
  const gameMountain = product(isJa ? JA_MT_GAME_H : EN_MT_GAME_H, isJa ? JA_MT_GAME_T : EN_MT_GAME_T, j)
  const gameNeon = product(isJa ? JA_NEON_GAME_H : EN_NEON_GAME_H, isJa ? JA_NEON_GAME_T : EN_NEON_GAME_T, j)

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

  const flavorH = isMt
    ? isJa
      ? JA_MT_FLAVOR_H
      : EN_MT_FLAVOR_H
    : isCu
      ? isJa
        ? JA_CU_FLAVOR_H
        : EN_CU_FLAVOR_H
      : isSea
        ? isJa
          ? JA_SEA_FLAVOR_H
          : EN_SEA_FLAVOR_H
        : isJa
          ? JA_PLAZA_FLAVOR_H
          : EN_PLAZA_FLAVOR_H
  const flavorT = isMt
    ? isJa
      ? JA_MT_FLAVOR_T
      : EN_MT_FLAVOR_T
    : isCu
      ? isJa
        ? JA_CU_FLAVOR_T
        : EN_CU_FLAVOR_T
      : isSea
        ? isJa
          ? JA_SEA_FLAVOR_T
          : EN_SEA_FLAVOR_T
        : isJa
          ? JA_PLAZA_FLAVOR_T
          : EN_PLAZA_FLAVOR_T
  const flavor = product(flavorH, flavorT, j)

  return {
    greetings,
    gameFind,
    gameTraits,
    gameStreet,
    gameMountain,
    gameNeon,
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
    pools.gameNeon.length +
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
