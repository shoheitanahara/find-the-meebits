/**
 * パーク NPC セリフプール（完結した一言の配列）。
 * plaza / mountain / culture / sea × EN / JA。
 *
 * 方針: memory-bank/parkNpcDialogue.md
 * head×tail 結合は使わない（組み合わせ事故を避ける）。
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

// ─── English ─────────────────────────────────────────────────────────

const EN_PLAZA_GREET = [
  'Oh. Hey.',
  'Didn’t see you there.',
  'Hang on — shoe’s untied.',
  'I was just… standing here.',
  'You too?',
  'Evening.',
  'Huh. Hi.',
  'Back already?',
  'I keep ending up at the fountain.',
  'Sorry — thinking out loud.',
  'Nice night for doing nothing.',
  'I lost my plan somewhere around here.',
  'Wind’s soft tonight.',
  'Don’t mind me.',
  'Was talking to myself. Anyway.',
  'One more lap. Probably.',
]

const EN_MT_GREET = [
  'Oh. Trail’s loud tonight.',
  'Pine in my nose again.',
  'Almost walked off that edge.',
  'Hey. Watching my feet.',
  'Torchlight’s doing that flicker thing.',
  'I was counting jumps. Lost count.',
  'Cold up here. Kind of like it.',
  'You climb, or just looking?',
  'Ridge wind hit me mid-sentence.',
  'I’m blaming the height for everything.',
  'Took the long way. On purpose. Sort of.',
  'Legs still buzzing.',
  'Don’t trust that ledge. I didn’t.',
  'Quiet for a mountain night.',
  'I sat down and forgot why.',
  'Hi. Need a second.',
]

const EN_CU_GREET = [
  'Blue light makes everyone look serious.',
  'Oh — didn’t hear you.',
  'I’ve been staring at that board.',
  'Suits. So many suits.',
  'This floor’s colder than the plaza.',
  'I came for the runway. It’s… not ready.',
  'Someone left footprints in the dust.',
  'Quiet gallery. Loud thoughts.',
  'Hey. Lost in the navy.',
  'Was reading a construction sign. Thrilling.',
  'Spotlights without a show. Weird mood.',
  'I keep circling the same stripe.',
  'Evening. Or whatever this hour is.',
  'Don’t ask me for directions. I’m guessing.',
  'Scaffolding’s new. Or I’m late.',
  'Hi. Just wandering.',
]

const EN_SEA_GREET = [
  'Tide’s quiet.',
  'Sand again. Always sand.',
  'Oh. Didn’t notice you.',
  'I stopped for a minute. Then another.',
  'Palm shadows are long tonight.',
  'Lantern’s warm. Water’s not.',
  'I had somewhere to be.',
  'Waves sound farther than they look.',
  'Hey. Shore brain.',
  'Shoes full of grit already.',
  'I keep facing the dark water.',
  'No rush. Really.',
  'Foam line pulled me this way.',
  'Evening by the sea. Sort of.',
  'I sat down. That was the plan.',
  'Hi. Listening to nothing.',
]

const EN_FIND = [
  'Right face. Wrong shoes.',
  'I memorized one Meeb. The crowd replaced everyone.',
  'Found them. Then immediately doubted it.',
  'Same smile. Different everything else.',
  'I came looking for one and left liking three.',
  'There is entirely too much of the same hair.',
  'I should’ve remembered the shoes.',
  'Lost that Meeb again near the back wall.',
  'The two who looked different were almost identical.',
  'Museum tip from me: don’t trust first glances.',
  'I waved at the wrong one. Twice.',
  'Clock was loud. Faces were louder.',
  'Thought I had them. Hat said otherwise.',
  'Crowd reshuffled while I tied my shoe.',
  'After Hours can wait. I need one more look.',
  'I found a favorite who wasn’t the target.',
]

const EN_TRAITS = [
  'I watched the hats. It was the shoes.',
  '“Blue” stops being one color when they stand together.',
  'I thought I’d remember that hair. I did not.',
  'Saw the outfit. Forgot the face.',
  'Thought those were glasses. Eyebrows.',
  'Up close, none of them look alike.',
  'Can’t stop noticing shoes today.',
  'Found the trait. Forgot the word.',
  'Same shirt, different walk. That threw me.',
  'I checked earrings last. Should’ve checked first.',
  'Gallery light lied about the color. Or I did.',
  'Matching feels like cheating until it doesn’t.',
  'One accessory flipped the whole hunt.',
  'I walked past the answer three times.',
  'Trait Hunt made my eyes tired in a good way.',
  'I swear that scarf moved rooms.',
]

const EN_STREET = [
  'That corner’s closer than it was.',
  'Nothing looked wrong. That felt wrong.',
  'Passed the same walker three times. Maybe they passed me.',
  'Footsteps stop when I stop.',
  'Nothing happened. Probably.',
  'Was that window open before?',
  'I decided not to look back today.',
  'Found the exit. It was the entrance.',
  'Warm lamps. Cold neck.',
  'Someone rearranged the alley. Or my memory.',
  'Blinked once. Missed whatever it was.',
  'Same street. Different shoes on the walkers.',
  'I’m fine. The silence isn’t.',
  'White fade hit. I forgot what I was counting.',
  'Told myself it was nothing. Kept checking.',
  '8th Street owes me one normal corner.',
]

const EN_MT_GAME = [
  'Yesterday’s shortcut is a cliff now.',
  'I nailed the first three jumps.',
  'The summit can wait. I reached the clouds.',
  'I’m blaming the wind.',
  'Fell in the same place twice. Definitely the place.',
  'Up looked far. Down looked worse.',
  'The mountain woke up annoyed today.',
  'View halfway up talked me out of climbing.',
  'I only meant to watch Mt. Meeb for a minute.',
  'Had a plan. The ledges didn’t.',
  'That jump looked easy. Looked.',
  'I’m done. One more try.',
  'Torchlight helped. Guts didn’t.',
  'Came back for yesterday’s ledge. It’s gone.',
  'Three lanes. Picked the rude one.',
  'Stage one again. Legs already arguing.',
]

const EN_NEON = [
  'Clear platforms are fine until I remember they’re clear.',
  'Wasn’t going to look down. Then everything lit up.',
  'Jerry Mountain feels smug today.',
  'Yesterday’s neon ledge? Missing.',
  'Soft blocks. Hard landings.',
  'I trusted the glow. The glow laughed.',
  'Same jumps. Meaner void.',
  'Came for one stage. Stayed for the sparkles. Then fell.',
  'Jelly looked friendly. Wasn’t.',
  'I’m blaming the pink one.',
  'Abyss is patient. I’m not.',
  'Route remixed itself overnight. Rude.',
  'One more glow-up. Then I’m done. Then one more.',
  'Edges are louder when they’re neon.',
  'I liked last night’s path better. It’s gone.',
  'Jerry tip: don’t celebrate mid-jump.',
]

const EN_FEAT = [
  'Today’s Star looks a little sleepy.',
  'I keep watching the crowd instead of the statue.',
  'Copper looks warmer from this side.',
  'Took a photo. Thumb in the frame. Classic.',
  'That pedestal’s busy tonight.',
  'I like the Star better from the back.',
  'Fountain’s loud. Star’s quiet.',
  'Someone’s circling the statue like it’s a campfire.',
  'Board’s covered in fingerprints already.',
  'I came for the Star. Stayed for the gossip.',
  'Statue didn’t move. I still checked twice.',
  'Today’s face feels familiar. Or I want it to.',
  'Metal shouldn’t look that smug.',
  'I’m not matching. Still staring.',
  'Plaza heartbeat’s on that pedestal tonight.',
  'Missed the name. Remembered the hat.',
]

const EN_FEAT_MT = [
  'Even up here people talk about the fountain Star.',
  'Hiked down just to squint at the statue. Worth it.',
  'Trail gossip says today’s Star looks tired.',
  'I’ll check the pedestal after my legs forgive me.',
  'Copper and torchlight. Same family somehow.',
  'Plaza Star followed me up here in conversation only.',
  'I keep pointing at the valley like the statue’s there.',
  'Featured face. Mountain air. Odd mix.',
  'Someone on the ridge described the hat wrong. I think.',
  'Climb first. Pedestal second. Or reverse. Undecided.',
  'Heard the Star changed. Haven’t seen it yet.',
  'Fountain rumors climb faster than I do.',
  'I’ll believe the board when I can read it again.',
  'Statue talk on a cliff. Park logic.',
  'Today’s Star can wait. This ledge can’t.',
  'Going back down for one more look. Probably.',
]

const EN_FEAT_MATCH = [
  'I’m in the Star’s orbit tonight. Quietly.',
  'Same vibe as the statue. Different height.',
  'If the fountain winked, that was me flinching.',
  'Lookalike duty. Didn’t ask for it.',
  'We’re scattered on purpose. Or by accident.',
  'Matching the pedestal. Feeling watched.',
  'Star team without the plaque.',
  'I keep getting double-takes. Fair.',
  'Not the statue. Close enough to confuse people.',
  'Today chose this look. I just showed up.',
  'Find the others if you want. I’m resting.',
  'Spotlight’s imaginary. Still standing in it.',
  'Copper cousin. Walking edition.',
  'I waved at my own reflection near the board.',
  'Matching feels like a soft club.',
  'Don’t tell the statue. Awkward.',
]

const EN_THEME = [
  'Board says {theme}. I’m still translating that into people.',
  'Lots of {value} drifting past the fountain.',
  'I keep spotting {value} and forgetting why it matters.',
  'Today’s link is {theme}. Or so the sign claims.',
  'Half the plaza is quietly matching. Half isn’t.',
  'Came for a stroll. Left counting {value}.',
  'Is it just me, or is {value} everywhere?',
  'I nodded at a stranger for {theme}. They nodded back. Maybe.',
  'Fountain board’s sticky with {theme} talk.',
  'I’m not hunting. I’m noticing. Difference.',
  '{value} looked better on the statue. Controversial.',
  'Daily link day. Shoes still untied.',
  'I asked what {theme} meant. Got three answers.',
  'Matching thread pulled me across the plaza.',
  'I’ll believe {value} when I see it twice.',
  'Sign says {theme}. Crowd says maybe.',
]

const EN_THEME_MT = [
  'Ridge talk mentions {theme}. I’m behind on plaza news.',
  'Someone said {value} is the link. Sounded sure.',
  'I’ll look for {theme} after I stop falling.',
  'Highland gossip: {value}. Take with pine air.',
  'Climbing with {theme} stuck in my head. Distracting.',
  'If {value} is today’s thread, the mountain didn’t get the memo.',
  'Fountain board said {theme}. I only remember the font.',
  'Trail matching is quieter. Still there.',
  'Heard {value} three times before lunch. Weird.',
  'I’ll hunt {theme} downhill. Gravity helps.',
  'Theme days climb with you whether you like it or not.',
  '{value} on a ridge. Looks different up here.',
  'I nodded along about {theme}. Still unclear.',
  'Plaza link, mountain legs. Split brain.',
  'Someone matched {value} mid-climb. Priorities.',
  'I’ll trust {theme} when I see the board again.',
]

const EN_THEME_MATCH = [
  'Yeah — {theme} tonight. Soft flex.',
  'Looking for more {value}. Not hard.',
  'We’re the quiet matching set.',
  'If you like {value}, you’re among friends.',
  'Board wasn’t lying about {theme}.',
  'I prove {value} by standing here. That’s it.',
  'Same link, different district air.',
  'Catch other {theme} guests if you want. I’m slow.',
  'Matched. Mildly proud. Moving on.',
  'Today’s thread found me first.',
  '{value}. Don’t make it weird.',
  'You’re learning the link. Eyes are good.',
  'Club without a password: {theme}.',
  'I keep waving at {value} strangers.',
  'Matching doesn’t mean I know what I’m doing.',
  'Say hi to the squad. Or don’t. We’re scattered.',
]

const EN_PLAZA_FLAVOR = [
  'I’m meeting someone. I only know the hat color.',
  'Mountain or sea. Still deciding.',
  'Walked one lap and forgot my plan.',
  'Was the statue facing this way earlier?',
  'There’s a lot of the same hair around the fountain today.',
  'I came here to choose a direction. I may just stay.',
  'Fountain sounds louder than the gossip. Barely.',
  'Gold path keeps pulling me home.',
  'That Meeb in the red hat circled the fountain three times.',
  'East bridge smells like pine from here.',
  'North gate’s busy. South side of me is tired.',
  'I could hear something from the sea. Or imagined it.',
  'Bench claimed me. Not arguing.',
  'Today’s Star can wait. This shadow’s perfect.',
  'I keep almost leaving. Don’t.',
  'Plaza’s doing that soft lamp hum again.',
]

const EN_MT_FLAVOR = [
  'Lodge has more roof than yesterday. I think.',
  'Wind talked me off the next jump.',
  'Torch shadows make the pines look taller.',
  'I’m staying on this ridge a minute.',
  'Construction noise below. Probably.',
  'Jerry’s glow is cheating from here.',
  'Came for the climb. Stayed for the cold air.',
  'Someone passed me going down smiling. Suspicious.',
  'Path back to the bridge is longer when you’re tired.',
  'I don’t remember that wall on the build site.',
  'Clouds moved. Summit mood changed.',
  'Sitting. Legs negotiating with tomorrow.',
  'Pine smell stuck to my jacket.',
  'West of the plaza is sea. I can almost taste salt.',
  'North rumors say Culture’s still scaffolding. Fits.',
  'One more look at the ravine. Then I’m done. Then one more.',
]

const EN_CU_FLAVOR = [
  'There’s one more piece of roof than yesterday.',
  'I don’t remember that wall.',
  'Something moved inside. Construction, I think.',
  'I’ll be here on opening day. If I remember.',
  'That crane hasn’t moved all day.',
  'The sign looks more finished than the building.',
  'I asked what they’re making. They smiled.',
  'I kind of like visiting the construction.',
  'Runway stripe with no runway yet. Patience.',
  'Navy floor’s collecting footprints.',
  'South gate’s my exit when the blue gets heavy.',
  'Suits under cool light. Soft parade.',
  'Scaffolding shadow looks like a coat rack.',
  'Board promised fashion. Dust delivered.',
  'I’m waiting for walls to become rooms.',
  'Gallery night without a show. Still wandered in.',
]

const EN_SEA_FLAVOR = [
  'I only came to look at the sea. Somehow it’s evening.',
  'Sand made it into my shoes.',
  'Waves sound far away today.',
  'I’m not moving from this spot.',
  'The sea wasn’t part of the plan.',
  'That Meeb keeps walking at the same speed as the waves.',
  'Sunset’s taking its time. Or I am.',
  'Decided to do nothing. Cleared my schedule.',
  'Lantern light on wet sand. Soft math.',
  'Pier’s glowing like it knows a secret.',
  'Foam erased my footprints. Fair.',
  'Tide’s quiet. Head’s quieter.',
  'I keep facing away from the plaza on purpose.',
  'Salt in the air. Sand in the socks.',
  'Building by the shore grew a wall. Maybe.',
  'I’ll leave when the lantern cools. Lying.',
]

// ─── Japanese ────────────────────────────────────────────────────────

const JA_PLAZA_GREET = [
  'あ、どうも。',
  'いま靴ひも直してた。',
  '噴水の前、また来ちゃった。',
  '計画、どこかで落とした。',
  'こんばんは。夜の感じ。',
  'あ、いた。',
  'ぼーっとしてた。',
  'また一周しそう。',
  '風、やわらかい。',
  '独り言、聞こえてた？',
  '行き先、まだ決めてない。',
  '灯りが低い夜だね。',
  'ベンチ、空いてたから。',
  'ちょっと一息。',
  '広場って、止まりやすい。',
  'やあ。今こっち見てた。',
]

const JA_MT_GREET = [
  'あ、縁に気をつけて。',
  '松の匂い、またする。',
  'ジャンプ数、数え忘れた。',
  'トーチがちらついてる。',
  '高いせいにしてる。全部。',
  '足、まだ震えてる。',
  '尾根の風、会話を切るね。',
  '登る？見るだけ？',
  '長い道、わざと選んだ。たぶん。',
  'いま座って理由を忘れた。',
  'あの足場、信用してない。',
  '山の夜、静かめ。',
  'ああ。ちょっと待って。',
  '冷たい空気、好きかも。',
  '下りと上り、気分が違う。',
  'やあ。足元見てた。',
]

const JA_CU_GREET = [
  '青い光、みんな真面目に見える。',
  '看板、ずっと読んでた。',
  'スーツ、多いね。',
  '床、広場より冷たい。',
  'ランウェイ、まだだよね。',
  'ほこりに足跡がある。',
  'スポットだけ先にいる夜。',
  '同じ線、ぐるぐるしてる。',
  '工事の札、やけに立派。',
  '迷ってる。案内はできない。',
  '足場、増えてない？',
  'こんばんは。濃紺の中。',
  '音が少ない。考えが多い。',
  'あ、今気づいた。',
  'ぶらぶらしてるだけ。',
  '影がコート掛けみたい。',
]

const JA_SEA_GREET = [
  '潮、静か。',
  'また砂。',
  'あ、いた。',
  '一分のつもりが、もう少し。',
  'ヤシの影、長い。',
  'ランタンは温い。水は違う。',
  '行くとこ、あったんだけど。',
  '波の音、遠い。',
  '岸の脳みその時間。',
  '靴の中、もう砂。',
  '暗い海のほう見てた。',
  '急がない。本気で。',
  '泡の線につられてきた。',
  '座るのが予定だった。',
  '何も聞いてない。いい感じ。',
  'やあ。潮風。',
]

const JA_FIND = [
  '顔は合ってた。靴が違った。',
  '一人覚えたら、群衆が入れ替わった。',
  '見つけた。直後に疑った。',
  '笑顔だけ同じ。他は全部違う。',
  '一人探して、三人好きになった。',
  '同じ髪、多すぎない？',
  '靴を覚えるべきだった。',
  '奥の壁のあたりでまた見失った。',
  '似てない二人のほうが、似てた。',
  '一目目は信用しない。今回の教訓。',
  '違う子に手、振っちゃった。二回。',
  '時計うるさい。顔もうるさい。',
  '帽子で負けた。',
  '靴ひも直してるあいだに入れ替わった。',
  'After Hours はあと。もう一回見る。',
  'ターゲットじゃない子が、いちばん好き。',
]

const JA_TRAITS = [
  '帽子ばっかり見てた。靴だった。',
  '同じ青でも、並ぶと別物。',
  'あの髪、覚えたつもりだった。',
  '服は見た。顔を見てなかった。',
  '眼鏡だと思ったら眉だった。',
  '近いと、誰も似てない。',
  '今日、靴ばっかり気になる。',
  '特徴は見つけた。名前が出てこない。',
  '同じシャツ、歩き方が違う。困った。',
  'ピアス、最後に見た。最初に見るべき。',
  'ギャラリーの灯り、色を嘘ついた。ぼくかも。',
  '一致した瞬間、ズルく感じる。すぐ消える。',
  'アクセ一つで、全部ひっくり返った。',
  '正解の横、三回通った。',
  '目、いい意味で疲れた。',
  'あのスカーフ、部屋移った？',
]

const JA_STREET = [
  'あの角、さっきより近い。',
  '誰も変じゃなかった。それが変だった。',
  '同じ人を三回見た。向こうもそうかも。',
  '止まると、足音も止まる。',
  '何もなかったよ。たぶん。',
  'あの窓、最初から開いてた？',
  '今日は振り返らないって決めた。',
  '出口だと思ったら入口だった。',
  '街灯は温い。うなじは冷たい。',
  '路地、並べ替えられた。記憶かも。',
  '瞬き一回。何か逃した。',
  '道は同じ。歩行者の靴が違う。',
  'ぼくは平気。沈黙が平気じゃない。',
  '白いフェードのあと、数を忘れた。',
  '何もないって自分に言った。また確認した。',
  '8番ストリート、普通の角を一つ貸して。',
]

const JA_MT_GAME = [
  '昨日の近道、今日は崖。',
  '三段目までは完璧だった。',
  '山頂はまた今度。今日は雲まで。',
  '風のせいってことにしてる。',
  '同じ場所で二回落ちた。場所のせい。',
  '上は遠かった。下はもっと遠かった。',
  '今日の山、朝から機嫌悪くない？',
  '途中の景色がよすぎて、登るのやめた。',
  'Mt. Meeb、一分だけ見るつもりだった。',
  '計画はあった。足場が同意しなかった。',
  'あのジャンプ、簡単に見えた。見えただけ。',
  'もうやめる。あと一回だけ。',
  'トーチは味方。胆力は欠勤。',
  '昨日の足場、取りに戻った。なかった。',
  'レーン三つ。いちばん意地悪なのを選んだ。',
  'また Stage 1。足が先に文句。',
]

const JA_NEON = [
  '透明な足場、信じた瞬間だけ怖い。',
  '下を見ないつもりだった。光ってて見ちゃった。',
  'ジェリーマウンテン、今日ちょっと得意顔。',
  '昨日のネオン棚、いない。',
  'ブロックはやわらかい。着地は違う。',
  '光を信じた。光に笑われた。',
  'ジャンプは同じ。奈落の態度が違う。',
  '一段のつもり。スパークルで長居。落ちた。',
  'ジェリー、友善そうに見えた。嘘だった。',
  'ピンクのせいってことにする。',
  '奈落は忍耐強い。ぼくは違う。',
  '夜のうちに道、組み直された。失礼。',
  'もう一回光ってから終わり。そのあとにもう一回。',
  '縁、ネオンだとうるさい。',
  '昨夜の道のほうが好き。もうない。',
  'ジャンプの途中で喜ばない。今日の教訓。',
]

const JA_FEAT = [
  '今日の主役、ちょっと眠そう。',
  '像より、見てる人の服が気になる。',
  '銅、こっちからだと温く見える。',
  '写真、親指入った。いつもの。',
  '台座のまわり、今夜にぎやか。',
  '今日の主役、後ろ姿のほうが好きかも。',
  '噴水はうるさい。主役は静か。',
  '焚き火みたいに、像の周りを回ってる子がいる。',
  '看板、もう指紋だらけ。',
  '主役を見に来て、噂で残った。',
  '像は動いてない。二回確認した。',
  '今日の顔、知ってる気がする。したいだけかも。',
  '金属なのに、得意そう。',
  '一致してない。それでも見てる。',
  '今夜の心拍、あの台座。',
  '名前忘れた。帽子だけ覚えた。',
]

const JA_FEAT_MT = [
  '山上でも噴水の主役の話してる。',
  '像を見に、一度降りた。元は取れた。',
  '尾根の噂、今日の主役は眠そうらしい。',
  '足が許したら、台座を見に行く。',
  '銅とトーチ、親戚みたい。',
  '会話の中だけ、主役がついてきた。',
  '谷のほう指差して、像があるみたいに話してる。',
  '主役の顔と山の空気、変な取り合わせ。',
  '帽子の説明、誰かが間違ってた。たぶん。',
  '先に登る？先に台座？決まらない。',
  '主役、変わったらしい。まだ見てない。',
  '噴水の噂、ぼくより先に登る。',
  '看板、また読めるようになったら信じる。',
  '崖で像の話。パークあるある。',
  '今日の主役は待てる。この足場は待てない。',
  'もう一回見に降りる。たぶん。',
]

const JA_FEAT_MATCH = [
  '今夜、主役の軌道にいる。静かに。',
  '像と同じ気配。身長は違う。',
  '噴水がウインクしたとしたら、ぼくがびびっただけ。',
  '似てる係。頼んでない。',
  '散らばってる。わざと？たまたま？',
  '台座に寄せてる。見られてる感じ。',
  '銘板なしのスター組。',
  '二度見される。まあ妥当。',
  '像本人じゃない。紛らわしい程度。',
  '今日のルックに選ばれた。ぼくは来ただけ。',
  '他も探すならどうぞ。ぼくは休む。',
  'スポットライトは想像。でも立ってる。',
  '銅の親戚。歩いてる版。',
  '看板の前で、自分に手振った。',
  '似てるの、ゆるいクラブみたい。',
  '像には言わないで。気まずい。',
]

const JA_THEME = [
  '看板は {theme}。人に翻訳中。',
  '噴水の前、{value} がよく通る。',
  '{value} を見つけて、なんで大事か忘れる。',
  '今日のリンクは {theme}。看板がそう言ってる。',
  '広場の半分、静かに一致してる。半分は違う。',
  '散歩のつもりが、{value} を数え始めた。',
  '{value}、ぼくだけ多くない？',
  '{theme} で知らない人に会釈した。返ってきた。たぶん。',
  '噴水の看板、{theme} の話でベタベタ。',
  '狩ってない。気づいてるだけ。',
  '{value}、像のほうが似合ってた。異論歓迎。',
  'リンクの日。靴ひもは解けたまま。',
  '{theme} の意味、三人に聞いて答えが三つ。',
  '糸につられて広場を横切った。',
  '{value}、二回見たら信じる。',
  '看板は {theme}。人混みは「まあね」。',
]

const JA_THEME_MT = [
  '尾根でも {theme} の話。広場ニュース遅れてる。',
  '{value} がリンクらしい。自信ありげだった。',
  '落ちるのやめてから {theme} 探す。',
  'ハイランドの噂：{value}。松の空気つけて解釈。',
  '{theme} が頭に残ったまま登ってる。危ない。',
  '{value} が今日の糸なら、山は読んでない。',
  '看板は {theme}。フォントしか覚えてない。',
  '山の一致、静か。でもある。',
  '昼前に {value}、三回聞いた。変。',
  '{theme} は下りで狩る。重力が味方。',
  'テーマの日は、好き嫌いに関係なくついてくる。',
  '尾根の {value}、見え方が違う。',
  '{theme} にうなずいた。中身はまだ。',
  '広場のリンク、山の足。頭が分裂。',
  '登りながら {value} 一致してた人、優先順位すごい。',
  '看板、もう一回読めたら {theme} 信じる。',
]

const JA_THEME_MATCH = [
  'うん、今夜は {theme}。小さい自慢。',
  '{value} 仲間、探さなくてもいる。',
  '静かめのマッチング組。',
  '{value} 好きなら、友だちに近い。',
  '看板、{theme} について嘘ついてなかった。',
  '{value}、ここに立ってるだけで証明。以上。',
  '同じリンク、地区の空気は違う。',
  '他の {theme} 探すならどうぞ。ぼくは遅い。',
  '一致した。ちょっと誇らしい。次。',
  '今日の糸のほうから、ぼくを見つけた。',
  '{value}。変にしないで。',
  'リンク、分かってきたね。目がいい。',
  'パスワードなしのクラブ：{theme}。',
  '{value} の見知らぬ人に、手振りがち。',
  '一致しても、何してるかは分かってない。',
  'チームに挨拶して。しなくても散らばってる。',
]

const JA_PLAZA_FLAVOR = [
  '待ち合わせ、帽子の色しか聞いてない。',
  '山か海か。まだ決まらない。',
  '一周したら、予定を忘れた。',
  'あの像、さっきよりこっち向いてない？',
  '噴水のまわり、今日は同じ髪型が多い。',
  '方向を決めるつもりが、居着いた。',
  '噴水の音、噂より大きい。ぎりぎり。',
  '金の道、帰路に引き戻す。',
  '赤い帽子の子、噴水を三周した。',
  '東の橋、ここから松の匂い。',
  '北の門はにぎやか。ぼくの南側は疲れてる。',
  '海のほうから何か聞こえた。気のせいかも。',
  'ベンチに捕獲された。抗わない。',
  '今日の主役は待てる。この影がいい。',
  '出かける直前で、また止まる。',
  '広場の灯、また小さく鳴ってる。',
]

const JA_MT_FLAVOR = [
  'ロッジの屋根、昨日より増えてる。たぶん。',
  '風に次のジャンプをやめさせられた。',
  'トーチの影で、松が高く見える。',
  'この尾根、もう一分いる。',
  '下で工事の音。たぶん。',
  'ジェリーの光、ここからチート。',
  '登るつもりが、冷たい空気で長居。',
  '下りで笑ってた人、怪しい。',
  '疲れてると、橋までの道が長い。',
  '工事場の壁、前あったっけ。',
  '雲が動いて、山頂の気分が変わった。',
  '座ってる。足が明日と交渉中。',
  '松の匂い、ジャケットについた。',
  '広場の西は海。塩、想像できる。',
  '北はカルチャー、まだ足場らしい。納得。',
  '渓谷、もう一回見る。それで終わり。そのあともう一回。',
]

const JA_CU_FLAVOR = [
  '屋根、一枚増えてる。',
  '昨日は壁なかったよね。',
  '中で音した。工事だと思う。',
  '完成したら最初に来る。覚えてたら。',
  'あのクレーン、ずっと同じところ。',
  '看板だけ先に立派。',
  '何ができるか聞いた。笑われた。',
  '工事を見に来るの、ちょっと好き。',
  'ランウェイの線だけ先にいる。待ち。',
  '濃紺の床、足跡が増えてる。',
  '青が重いときは南の門から戻る。',
  'スーツとクールな光。ゆるい行列。',
  '足場の影、コート掛けみたい。',
  '看板はファッション。現場はほこり。',
  '壁が部屋になるのを待ってる。',
  'ショーなしのギャラリー夜。それでも来た。',
]

const JA_SEA_FLAVOR = [
  '海を見に来ただけなのに、もう夕方。',
  '砂、靴の中まで来た。',
  '波の音、今日は遠い。',
  '今日はここから動かない。',
  '海、予定になかったんだけど。',
  'あの子、波と同じ速さで歩いてる。',
  '夕日、ゆっくり。ぼくも。',
  '何もしないって決めたら、予定が空いた。',
  '濡れた砂にランタン。やわらかい計算。',
  '桟橋、秘密知ってるみたいに光ってる。',
  '泡が足跡を消した。公平。',
  '潮は静か。頭も静かめ。',
  'わざと広場と反対を向いてる。',
  '空気は塩。靴下は砂。',
  '岸の建物、壁が増えた。かも。',
  'ランタンが冷めたら帰る。嘘。',
]

// ─── build ───────────────────────────────────────────────────────────

function buildPools(lang: Lang, zone: ParkZoneId): ParkDialoguePools {
  const isJa = lang === 'ja'
  const isMt = zone === 'mountain'
  const isCu = zone === 'culture'
  const isSea = zone === 'sea'

  const greetings = isMt
    ? isJa
      ? JA_MT_GREET
      : EN_MT_GREET
    : isCu
      ? isJa
        ? JA_CU_GREET
        : EN_CU_GREET
      : isSea
        ? isJa
          ? JA_SEA_GREET
          : EN_SEA_GREET
        : isJa
          ? JA_PLAZA_GREET
          : EN_PLAZA_GREET

  const flavor = isMt
    ? isJa
      ? JA_MT_FLAVOR
      : EN_MT_FLAVOR
    : isCu
      ? isJa
        ? JA_CU_FLAVOR
        : EN_CU_FLAVOR
      : isSea
        ? isJa
          ? JA_SEA_FLAVOR
          : EN_SEA_FLAVOR
        : isJa
          ? JA_PLAZA_FLAVOR
          : EN_PLAZA_FLAVOR

  return {
    greetings,
    gameFind: isJa ? JA_FIND : EN_FIND,
    gameTraits: isJa ? JA_TRAITS : EN_TRAITS,
    gameStreet: isJa ? JA_STREET : EN_STREET,
    gameMountain: isJa ? JA_MT_GAME : EN_MT_GAME,
    gameNeon: isJa ? JA_NEON : EN_NEON,
    featuredAny: isMt
      ? isJa
        ? JA_FEAT_MT
        : EN_FEAT_MT
      : isJa
        ? JA_FEAT
        : EN_FEAT,
    featuredMatched: isJa ? JA_FEAT_MATCH : EN_FEAT_MATCH,
    themeAny: isMt
      ? isJa
        ? JA_THEME_MT
        : EN_THEME_MT
      : isJa
        ? JA_THEME
        : EN_THEME,
    themeMatched: isJa ? JA_THEME_MATCH : EN_THEME_MATCH,
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

/** 後方互換：プラザ EN。 */
export const PARK_DIALOGUE_EN = getParkDialoguePools('en', 'plaza')
/** 後方互換：プラザ JA。 */
export const PARK_DIALOGUE_JA = getParkDialoguePools('ja', 'plaza')
