/**
 * パーク NPC セリフプール（完結した一言）。
 * 方針: memory-bank/parkNpcDialogue.md
 * 日本語は口に出せる普通の雑談。気の利いた比喩・詩的断片は避ける。
 */

import type { ParkZoneId } from './parkZones'

export type ParkDialoguePools = {
  greetings: string[]
  gameFind: string[]
  gameTraits: string[]
  gameStreet: string[]
  gameMountain: string[]
  gameNeon: string[]
  gameShooting: string[]
  gameRunway: string[]
  gameLookLocker: string[]
  gameSergito: string[]
  featuredAny: string[]
  featuredMatched: string[]
  themeAny: string[]
  themeMatched: string[]
  flavor: string[]
}

type Lang = 'en' | 'ja'

// ─── Japanese（先に完成。口語・明快さ優先）──────────────────────────

const JA_PLAZA_GREET = [
  'あ、どうも。',
  'いま靴ひも直してた。',
  '噴水の前、また来ちゃった。',
  '行き先、まだ決めてない。',
  'こんばんは。',
  'ぼーっとしてた。',
  'また一周しそう。',
  '風、やわらかいね。',
  'ベンチ、空いてたから座った。',
  'ちょっと一息。',
  '広場って、止まりやすい。',
  'やあ。',
  '灯りが低い夜だね。',
  '計画、どこかで忘れた。',
  'あ、いた。',
  '今日はのんびりしてる。',
]

const JA_MT_GREET = [
  'あ、縁に気をつけて。',
  '松の匂いがする。',
  'ジャンプの数、忘れちゃった。',
  'トーチ、ちらついてるね。',
  '足、ちょっと疲れてる。',
  'ここ、風で声が飛ぶね。',
  '登る？それとも見るだけ？',
  'いま座って、理由忘れた。',
  'あの足場、ちょっと怖い。',
  '山の夜、静かだね。',
  'ああ。ちょっと待って。',
  '空気、冷たい。',
  '下りと上りで気分が違う。',
  'やあ。足元見てた。',
  '長い道、選んじゃった。',
  '一息ついてる。',
]

const JA_CU_GREET = [
  '青い光、多いね。',
  '看板、読んでた。',
  'スーツの人、多い。',
  '床、ちょっと冷たい。',
  'ランウェイ、今日の色なに？',
  '白い線、光ってる。',
  '中、暗いのに明るい。',
  '同じところ、ぐるぐるしてる。',
  'ショー、もう始まった？',
  '道、ちょっと迷ってる。',
  'モデル、歩き方うまい。',
  'こんばんは。',
  '静かだね。',
  'あ、今気づいた。',
  'ぶらぶらしてるだけ。',
  '影が長い。',
]

const JA_SEA_GREET = [
  '潮、静か。',
  'また砂だ。',
  'あ、いた。',
  '一分のつもりが、長居してる。',
  'ヤシの影、長いね。',
  'ランタン、あったかい。',
  '行くとこ、あったんだけどな。',
  '波の音、遠い。',
  '靴の中、もう砂。',
  '海のほう見てた。',
  '急がなくていい夜。',
  '泡の線ついてきた。',
  '座るのが予定だった。',
  'やあ。',
  '潮風、するね。',
  'ぼーっとしてる。',
]

const JA_FIND = [
  '顔は合ってた。靴が違った。',
  '一人覚えたら、もういなくなった。',
  '見つけたと思った。すぐ疑った。',
  '笑顔だけ同じ。他は違う。',
  '一人探してたら、三人気になった。',
  '同じ髪型、多くない？',
  '靴を覚えるべきだった。',
  '奥のほうでまた見失った。',
  '似てない二人のほうが、似てた。',
  '直感は信用しないことにした。',
  '違う子に手、振っちゃった。',
  '帽子で間違えた。',
  '靴ひも直してるあいだにいなくなった。',
  'もう一回見てくる。',
  '探してた子じゃない子が、いちばん好き。',
  '人混み、顔がいっぱい。',
]

const JA_TRAITS = [
  '帽子ばっかり見てた。靴だった。',
  '同じ青でも、並ぶと違うね。',
  'あの髪、覚えたつもりだった。',
  '服は見た。顔を見てなかった。',
  '眼鏡だと思ったら眉だった。',
  '近くで見ると、誰も似てない。',
  '今日、靴ばっかり気になる。',
  '特徴は分かった。名前が出てこない。',
  '同じシャツなのに、歩き方が違う。',
  'ピアス、最後に見た。最初に見るべきだった。',
  '色、間違えて見てたかも。',
  'アクセ一つで、印象が変わった。',
  '正解の横、何回も通った。',
  '目、ちょっと疲れた。',
  'あのスカーフ、さっきこっちにいたよね。',
  '細かいところ見ると、全然違う。',
]

const JA_STREET = [
  'あの角、さっきより近い。',
  '誰も変じゃなかった。それが変だった。',
  '同じ人を三回見た。',
  '止まると、足音も止まる。',
  '何もなかったよ。たぶん。',
  'あの窓、最初から開いてた？',
  '今日は振り返らないって決めた。',
  '出口だと思ったら入口だった。',
  '街灯はあったかい。うなじは冷たい。',
  '路地の並び、変わった気がする。',
  '瞬きしたら、何か逃した。',
  '道は同じ。歩いてる人の靴が違う。',
  '何もないって自分に言った。また確認した。',
  '白いあと、何を数えてたか忘れた。',
  '普通の角が欲しい。',
  '後ろ、気になる。',
]

const JA_MT_GAME = [
  '昨日の近道、今日は崖。',
  '三段目まではうまくいった。',
  '山頂はまた今度。今日はここまで。',
  '風のせいってことにしてる。',
  '同じ場所で二回落ちた。',
  '上は遠い。下はもっと遠い。',
  '今日の山、ちょっと意地悪。',
  '途中の景色見てたら、登るのやめた。',
  'Mt. Meeb、ちょっと見るつもりだった。',
  '計画はあった。足場が違った。',
  'あのジャンプ、簡単に見えた。',
  'もうやめる。あと一回だけ。',
  '昨日の足場、取りに戻った。なかった。',
  'レーン、いちばん難しそうなの選んじゃった。',
  'また最初から。足が重い。',
  '落ちたあとの空気、静か。',
]

const JA_NEON = [
  '透明な足場、信じた瞬間だけ怖い。',
  '下を見ないつもりだった。つい見ちゃった。',
  'ジェリーマウンテン、今日ちょっと意地悪。',
  '昨日の足場、見当たらない。',
  'ブロックはやわらかそう。着地は違う。',
  '光ってるほうへ行ったら落ちた。',
  'ジャンプは同じ。下の黒さが違う。',
  '一段のつもりが、長居して落ちた。',
  'ピンクの足場、苦手。',
  '夜のうちに道、変わったみたい。',
  'もう一回やってから帰る。',
  '縁が光ってると、余計に気になる。',
  '昨夜の道のほうが好き。もうない。',
  'ジャンプの途中で喜ばないほうがいい。',
  'ジェリー、やさしそうに見えたのに。',
  '奈落、近い。',
]

const JA_RUNWAY = [
  '今日の色、似てる子多い。',
  'モデル、歩き方うまい。',
  '空席、見つけた。',
  'ショー、もう始まってる？',
  '白い線、光ってる。',
  '座って見た。足、伸ばした。',
  '次の子、誰だろ。',
  '今日のルック、覚えて帰る。',
  '背中ばっかり見てた。',
  '拍手、一人分。',
  '色、今日は青？',
  '通路、狭い。',
  'スクリーン、大きい。',
  '暗いのに、目が覚める。',
  '服より歩き方、見てる。',
  '立ち上がったら前の席に当たった。',
]

const JA_LOOK_LOCKER = [
  'ロッカーで帽子、替えてみた。',
  'いまとためし着、並べて見た。',
  'タイプから選ぶの、わかりやすい。',
  '似てる子いっぱい出てきて迷った。',
  'きせかえたら、南の門から出た。',
  '髪型だけ変えてみた。',
  '左の建物、試着室だって。',
  '同じ服の子、何体もいた。',
  'ためし着、気に入った。',
  'クリアしたら最初から。',
  'Pigにしたら髪型、ほぼなかった。',
  'いまの姿と並べて比べてる。',
  'シャツ変えたら別人みたい。',
  'ルックロッカー、人が入ってた。',
  'この姿でランウェイ見に行く。',
  '帽子、三つ試した。',
]

const JA_SHOOTING = [
  '的の真ん中を抜いた。次は端だった。',
  '金の的を追ってたら、普通の的を見失った。',
  '赤い的、反射で撃ちそうになった。',
  '四十五秒って、構えてると短い。',
  '最後の一発だけ、きれいに当たった。',
  'コンボが続いたら、急に手が固くなった。',
  '百点の的が動き出してから忙しかった。',
  '瓶の隙間を狙った。瓶は無事。',
  'ロッジのポスター、撃つ前に見入った。',
  '銃を下ろしたら、右腕だけ疲れてた。',
  '真ん中は二倍だって、終わってから気づいた。',
  'ゴールド、止まると思って待った。止まらなかった。',
  'デッドアイまで、あと少しだったらしい。',
  'カウントが始まる前から照準を動かしてた。',
  '点数より、最後に外した一発を覚えてる。',
  'カウンターの向こう、見た目より的が多い。',
]

const JA_SERGITO = [
  'Sergito、最初に帽子を見た。',
  'シャツの話から、靴の話まで行った。',
  '工房の棚、同じ顔が一体もいなかった。',
  '自分では気にしてない色を、Sergitoは覚えてた。',
  '話しかけたら、眼鏡を先に褒められた。',
  '二回話したら、今度は髪の話だった。',
  '奥のフィギュア、近くで見ると細かい。',
  '工房を出てから、自分の服を見直した。',
  'Sergito、こっちが忘れてた特徴まで見てた。',
  '棚の前で長居した。本人とは短く話した。',
  '同じタイプでも、並ぶと全然違う。',
  '靴の色を言い当てられて、下を見た。',
  '工房の中、歩いてる子まで展示みたいだった。',
  '感想を聞きに行ったのに、こっちが観察された。',
  '出口まで来て、もう一回話しに戻った。',
  '砂を落として入ったのに、帰りはまた砂だらけ。',
]

const JA_FEAT = [
  '今日の主役、ちょっと眠そう。',
  '像より、見てる人の服が気になる。',
  '銅像、こっちからだと温かく見える。',
  '写真撮ったら、親指入った。',
  '台座のまわり、人が多い。',
  '今日の主役、後ろ姿のほうが好きかも。',
  '噴水はうるさい。主役は静か。',
  '像の周りをぐるぐるしてる子がいる。',
  '看板、指紋だらけ。',
  '主役を見に来て、噂聞いて残った。',
  '像は動いてない。二回見た。',
  '今日の顔、どこかで見た気がする。',
  '金属なのに、なんか得意そう。',
  '似てないけど、つい見てしまう。',
  '今夜、あの台座の前だけ人が多い。',
  '名前忘れた。帽子だけ覚えた。',
]

const JA_FEAT_MT = [
  '山上でも、噴水の主役の話してる。',
  '像を見に、一度降りた。',
  '今日の主役、眠そうらしい。',
  '足が楽になったら、台座を見に行く。',
  '銅像とトーチ、似た色だね。',
  '主役の話ばかり聞いて、まだ見てない。',
  '帽子の説明、誰か間違ってた気がする。',
  '先に登る？先に像？決まらない。',
  '主役、変わったらしい。まだ見てない。',
  '噂のほうが、ぼくより先に登る。',
  '看板、もう一回読んでから信じる。',
  '崖の上で像の話してる。変だね。',
  '今日の主役は待てる。この足場は待てない。',
  'もう一回見に降りる。たぶん。',
  '噴水の話、尾根まで届いてる。',
  '像、横から見ると印象違うらしい。',
]

const JA_FEAT_MATCH = [
  '今日の主役と、ちょっと似てるらしい。',
  '像と同じ系統の服、着てるって言われた。',
  '噴水の前で、二度見された。',
  '似てる係、頼んでないんだけど。',
  '同じ感じの人が、あちこちにいる。',
  '台座の近くにいると、見られる。',
  '像本人じゃないよ。紛らわしいだけ。',
  '今日の主役に寄せた服、たまたま。',
  '他の似てる子、探すならどうぞ。ぼくは休む。',
  '銅像の親戚みたいに言われた。',
  '看板の前で、自分に手振っちゃった。',
  '似てるのは気のせいかも。',
  '像には言わないで。気まずい。',
  '主役チーム、って呼ばれた。大げさ。',
  '今日は像の近くにいることが多い。',
  '似てるって言われると、姿勢よくなる。',
]

const JA_THEME = [
  '今日は {value}、よく見かける。',
  '看板には {theme} って書いてある。',
  'あ、あの子も {value} だ。',
  '噴水の前、{value} が多い気がする。',
  '{value} を見つけて、なんで気になったか忘れた。',
  '看板の字、{theme}。読んだ。',
  '{value}、ぼくだけ多くない？',
  '同じ {value} の子に、つい会釈した。',
  '{value}、像のほうが似合ってるかも。',
  '靴ひも解けたまま、{value} 数えてた。',
  '{theme}、三人に聞いたら答えが違った。',
  '{value}、もう一回見たら覚える。',
  '看板は {theme}。人は「まあね」って顔。',
  '今日よく見るの、{value} だね。',
  '{value} ついてくる気がする。気のせいかも。',
  '看板見てから、{value} ばかり目に入る。',
]

const JA_THEME_MT = [
  '尾根でも {value} の話、出てる。',
  '{value} が今日のポイントらしい。',
  '落ちるのやめてから、{value} 探す。',
  '広場の看板は {theme} だった気がする。',
  '{value}、頭に残ったまま登ってる。',
  '山では {value}、あんまり目立たない。',
  '看板の字、{theme}。フォントしか覚えてない。',
  '昼前に {value}、何回も聞いた。',
  '下りながら {value} 探すつもり。',
  '尾根の {value}、見え方が違う。',
  '{theme}、うなずいたけど中身はまだ。',
  '広場のこと考えてたら、また足場を踏み外した。',
  '登りながら {value} の話してた人、すごかった。',
  '看板、もう一回読めたら確認する。',
  '{value}、山でも気になる。',
  '今日の看板、{theme}。覚えておく。',
]

const JA_THEME_MATCH = [
  'うん、今日は {value}。',
  '{value} の人、近くにいるね。',
  'あ、同じ {value} だ。',
  '{value} 好きなら、話合うかも。',
  '看板の {theme}、当たってる気がする。',
  '{value}、着てるだけ。以上。',
  '同じ系統の人が、地区ちがってもいる。',
  '他の {value}、探すならどうぞ。ぼくは遅い。',
  '似てるって言われて、ちょっと嬉しい。',
  '{value}。変にしないで。',
  '看板、ちゃんと見てきたね。',
  '{value} の子に、つい手振りがち。',
  '同じでも、何してるかは別。',
  '今日は {value} で話しかけられた。',
  '{theme}、看板どおりだった。',
  '気づいたら、同じ帽子の子ばかり見てた。',
]

const JA_PLAZA_FLAVOR = [
  '待ち合わせ、帽子の色しか聞いてない。',
  '山か海か。まだ決まらない。',
  '一周したら、予定を忘れた。',
  'あの像、さっきよりこっち向いてない？',
  '噴水のまわり、今日は同じ髪型が多い。',
  '方向を決めるつもりが、居着いた。',
  '噴水の音、大きいね。',
  '金の道、帰るとつい乗る。',
  '赤い帽子の子、噴水を何周もしてる。',
  '東の橋のほう、松の匂いする。',
  '北の門、人が多い。',
  '海のほうから音、した気がする。',
  'ベンチに座ったら、動けなくなった。',
  '今日の主役はあとで。この影がいい。',
  '出かける直前で、また止まってる。',
  '広場の灯、やわらかい。',
]

const JA_MT_FLAVOR = [
  'ロッジの屋根、昨日より増えてる。',
  '風で、次のジャンプやめた。',
  'トーチの影で、松が高く見える。',
  'この尾根、もう一分いる。',
  '下で工事の音がする。',
  'ジェリーの光、ここから見える。',
  '登るつもりが、冷たい空気で長居。',
  '下りで笑ってた人、なんだったんだろ。',
  '疲れてると、橋まで遠い。',
  '工事場の壁、前あったっけ。',
  '雲が動いて、景色が変わった。',
  '座ってる。足がもう帰りたがってる。',
  '松の匂い、服についた。',
  '広場の西は海。塩、想像できる。',
  'カルチャー、中が光ってる。',
  '渓谷、もう一回見て帰る。',
]

const JA_CU_FLAVOR = [
  '外は静か。中は歩いてる。',
  '今日の色、似てる子多い。',
  '中で足音した。ショーだ。',
  '空席見つけたら座る。',
  'スクリーン、大きい。',
  '看板より中が派手。',
  '今日の色、聞いた。覚えてない。',
  'ショー見に来るの、好き。',
  '白い線、歩いてる。',
  '床に足跡が増えてる。',
  '青が強いときは、南の門から戻る。',
  'スーツの人と、青い光。',
  '通路、ちょっと狭い。',
  '次の子、誰だろ。',
  '左のロッカー、光ってる。',
  'きせかえてからショー見た。',
]

const JA_SEA_FLAVOR = [
  '海を見に来ただけなのに、もう夕方。',
  '砂、靴の中まで来た。',
  '波の音、今日は遠い。',
  '今日はここから動かない。',
  '海、予定になかったんだけど。',
  'あの子、波と同じ速さで歩いてる。',
  '夕日、ゆっくりだね。',
  '何もしないって決めたら、予定が空いた。',
  '濡れた砂に、ランタンの光。',
  '桟橋、光ってる。',
  '泡が足跡を消した。',
  '潮は静か。頭も静か。',
  'わざと広場と反対を向いてる。',
  '空気は塩っぱい。靴下は砂。',
  '岸の建物、壁が増えたかも。',
  'ランタンが冷めたら帰る。たぶん嘘。',
]

// ─── English（場面は共有。直訳しない）──────────────────────────────

const EN_PLAZA_GREET = [
  'Oh. Hey.',
  'Hang on — shoe’s untied.',
  'I keep ending up at the fountain.',
  'Still deciding where to go.',
  'Evening.',
  'I was zoning out.',
  'One more lap, maybe.',
  'Soft wind tonight.',
  'Grabbed an empty bench.',
  'Just catching my breath.',
  'Hard to leave the plaza.',
  'Hi.',
  'Lamps are low tonight.',
  'Forgot my plan somewhere.',
  'Oh — there you are.',
  'Taking it slow today.',
]

const EN_MT_GREET = [
  'Watch the edge.',
  'Smells like pine.',
  'Lost count of my jumps.',
  'Torch is flickering.',
  'Legs are tired.',
  'Wind eats half my words up here.',
  'Climbing, or just looking?',
  'Sat down and forgot why.',
  'Don’t trust that ledge.',
  'Quiet mountain night.',
  'Give me a second.',
  'Cold air. Kind of nice.',
  'Going down feels different from up.',
  'Hey. Watching my feet.',
  'Took the long path.',
  'Resting a minute.',
]

const EN_CU_GREET = [
  'Lots of blue light.',
  'Was reading the board.',
  'Lots of suits tonight.',
  'Floor’s a bit cold.',
  'Wonder what today’s color is.',
  'The white line’s glowing.',
  'Dark inside. Bright anyway.',
  'I keep looping the same spot.',
  'Show already started?',
  'I’m a little lost.',
  'That walk was clean.',
  'Evening.',
  'Quiet here.',
  'Oh — just noticed you.',
  'Just wandering.',
  'Long shadows.',
]

const EN_SEA_GREET = [
  'Tide’s quiet.',
  'Sand again.',
  'Oh. Hey.',
  'Meant to stay a minute. Stayed longer.',
  'Palm shadows are long.',
  'Lantern’s warm.',
  'I had somewhere to be.',
  'Waves sound far away.',
  'Sand in my shoes already.',
  'Was looking at the water.',
  'No rush tonight.',
  'Followed the foam line.',
  'Sitting was the plan.',
  'Hey.',
  'Salty air.',
  'Just staring.',
]

const EN_FIND = [
  'Right face. Wrong shoes.',
  'I memorized one Meeb. Then they were gone.',
  'Found them. Then doubted it.',
  'Same smile. Everything else different.',
  'Came looking for one. Noticed three.',
  'Too much of the same hair today.',
  'Should’ve remembered the shoes.',
  'Lost them again near the back.',
  'The ones who looked different were almost twins.',
  'Don’t trust the first glance.',
  'Waved at the wrong one.',
  'Got fooled by a hat.',
  'They vanished while I tied my shoe.',
  'Going back for one more look.',
  'My favorite wasn’t even the target.',
  'So many faces in there.',
]

const EN_TRAITS = [
  'I watched the hats. It was the shoes.',
  'Same blue looks different side by side.',
  'Thought I’d remember that hair.',
  'Saw the outfit. Missed the face.',
  'Thought those were glasses. Eyebrows.',
  'Up close, nobody matches.',
  'Can’t stop noticing shoes today.',
  'Got the trait. Forgot the name.',
  'Same shirt. Different walk.',
  'Checked earrings last. Should’ve been first.',
  'Might’ve misread the color.',
  'One accessory changed the whole look.',
  'Walked past the answer a few times.',
  'Eyes are tired.',
  'That scarf was over here a second ago.',
  'Details make them all different.',
]

const EN_STREET = [
  'That corner’s closer than before.',
  'Nothing looked wrong. That felt wrong.',
  'Saw the same walker three times.',
  'When I stop, the footsteps stop.',
  'Nothing happened. Probably.',
  'Was that window always open?',
  'Not looking back today.',
  'Thought I found the exit. Entrance.',
  'Warm lamps. Cold neck.',
  'Alley feels rearranged.',
  'Blinked and missed something.',
  'Same street. Different shoes on people.',
  'Told myself it was nothing. Checked again.',
  'After the white fade, I forgot my count.',
  'I just want a normal corner.',
  'Something behind me feels off.',
]

const EN_MT_GAME = [
  'Yesterday’s shortcut is a cliff now.',
  'First three jumps went fine.',
  'Summit can wait. Stopping here today.',
  'Blaming the wind.',
  'Fell in the same spot twice.',
  'Up looks far. Down looks farther.',
  'Mountain’s a little mean today.',
  'View halfway up talked me out of climbing.',
  'Only meant to glance at Mt. Meeb.',
  'Had a plan. Ledges disagreed.',
  'That jump looked easy.',
  'I’m done. One more try.',
  'Came back for yesterday’s ledge. Gone.',
  'Picked the hardest-looking lane.',
  'Starting over. Legs feel heavy.',
  'Quiet after a fall.',
]

const EN_NEON = [
  'Clear platforms scare me the second I trust them.',
  'Wasn’t going to look down. Did anyway.',
  'Jerry Mountain’s a little mean today.',
  'Can’t find last night’s ledge.',
  'Blocks look soft. Landing isn’t.',
  'Followed the glow. Fell.',
  'Same jumps. Darker below.',
  'Meant one stage. Stayed too long. Fell.',
  'Not a fan of the pink ones.',
  'Path changed overnight, I think.',
  'One more try, then I’m leaving.',
  'Lit edges make me stare.',
  'Liked last night’s route better. It’s gone.',
  'Don’t celebrate mid-jump.',
  'Jelly looked friendly. Wasn’t.',
  'Void feels close.',
]

const EN_RUNWAY = [
  'Lots of the same color tonight.',
  'That walk was clean.',
  'Found an empty seat.',
  'Show already on?',
  'The white line’s glowing.',
  'Sat down. Stretched my legs.',
  'Who’s next?',
  'Trying to remember today’s look.',
  'Mostly watched their backs.',
  'One-person applause.',
  'Blue today, maybe?',
  'Aisle’s tight.',
  'Screen’s huge.',
  'Dark room. Wide awake.',
  'Watching the walk more than the clothes.',
  'Stood up and bumped the row in front.',
]

const EN_LOOK_LOCKER = [
  'Tried a new hat in the locker.',
  'Lined up Now and New. Hard to choose.',
  'Starting from Type makes sense.',
  'Too many matches. Got stuck.',
  'Changed looks, then took the south gate.',
  'Only switched the hair.',
  'Left building’s a fitting room, they said.',
  'Saw a bunch in the same shirt.',
  'Liked the try-on.',
  'Cleared it and started over.',
  'Went Pig. Almost no hair options.',
  'Comparing side by side with my current look.',
  'New shirt. Barely recognized myself.',
  'Look Locker had people going in.',
  'Wearing this to the runway next.',
  'Tried three hats.',
]

const EN_SHOOTING = [
  'Hit the center once. Caught the edge next.',
  'Chased the gold target and lost the easy ones.',
  'Nearly fired at a red target on instinct.',
  'Forty-five seconds gets short once you’re aiming.',
  'Last shot was the clean one.',
  'The combo held. Then my hand went stiff.',
  'Those hundred-point targets got busy later.',
  'Shot through the bottles. Bottles survived.',
  'Got distracted by the old posters before I started.',
  'Put the pistol down. Right arm felt twice as heavy.',
  'Found out about double points after I was done.',
  'Waited for gold to stop moving. It never did.',
  'Missed Deadeye by less than I wanted to know.',
  'Started moving the aim before the countdown ended.',
  'Forgot the score. Remembered the last miss.',
  'More targets behind that counter than it first looks.',
]

const EN_SERGITO = [
  'Sergito noticed the hat first.',
  'Started with my shirt. Ended up talking shoes.',
  'Not one repeated face on those workshop shelves.',
  'Sergito remembered a color I barely notice.',
  'Walked up and got a comment about my glasses.',
  'Talked twice. Second time was all about the hair.',
  'Those figures have tiny details up close.',
  'Left the workshop checking my own outfit.',
  'Sergito caught a trait I’d forgotten about.',
  'Spent longer by the shelves than in the conversation.',
  'Same Type. Completely different side by side.',
  'Got my shoe color called out. Had to look down.',
  'Even the walkers inside looked like part of the display.',
  'Went in for an opinion. Got studied instead.',
  'Reached the exit, then went back for one more talk.',
  'Knocked off the sand going in. Left with more.',
]

const EN_FEAT = [
  'Today’s Star looks a little sleepy.',
  'Watching the crowd more than the statue.',
  'Copper looks warmer from this side.',
  'Photo came out with my thumb in it.',
  'Busy around the pedestal tonight.',
  'I like the Star better from the back.',
  'Fountain’s loud. Star’s quiet.',
  'Someone keeps circling the statue.',
  'Board’s covered in fingerprints.',
  'Came for the Star. Stayed for the gossip.',
  'Statue didn’t move. Checked twice.',
  'Today’s face feels familiar.',
  'Metal shouldn’t look that smug.',
  'Not a match. Still staring.',
  'Crowd’s thickest by that pedestal tonight.',
  'Forgot the name. Remembered the hat.',
]

const EN_FEAT_MT = [
  'People up here still talk about the fountain Star.',
  'Went down once just to see the statue.',
  'Heard today’s Star looks sleepy.',
  'I’ll visit the pedestal when my legs recover.',
  'Statue and torchlight are close in color.',
  'All this talk, and I still haven’t seen them.',
  'Someone got the hat wrong, I think.',
  'Climb first or statue first? Undecided.',
  'Star changed, apparently. Haven’t looked yet.',
  'Rumors climb faster than I do.',
  'I’ll trust the board when I read it again.',
  'Weird talking about a statue on a cliff.',
  'Star can wait. This ledge can’t.',
  'Going down for another look. Probably.',
  'Fountain talk made it all the way up here.',
  'Side view of the statue is different, they say.',
]

const EN_FEAT_MATCH = [
  'People say I look a bit like today’s Star.',
  'Got told my outfit matches the statue’s vibe.',
  'Got a double take by the fountain.',
  'Lookalike duty. Didn’t ask for it.',
  'A few of us look similar tonight.',
  'Stand near the pedestal and people stare.',
  'Not the statue. Just confusing.',
  'Outfit’s a coincidence. Really.',
  'Go find the others if you want. I’m resting.',
  'Someone called me the statue’s cousin.',
  'Waved at myself by the board. Awkward.',
  'Maybe we don’t really match.',
  'Don’t tell the statue. Embarrassing.',
  'Got called “Star team.” Overdramatic.',
  'Spending a lot of time near the statue today.',
  'When people say we match, I stand up straighter.',
]

const EN_THEME = [
  'Seeing a lot of {value} today.',
  'Board says {theme}.',
  'Oh — that one has {value} too.',
  'Lots of {value} by the fountain.',
  'Spotted {value}, forgot why I cared.',
  'Sign text is {theme}. Read it.',
  'Is it just me, or is {value} everywhere?',
  'Nodded at someone with the same {value}.',
  '{value} looks better on the statue, maybe.',
  'Counted {value} with my shoes untied.',
  'Asked three people about {theme}. Three answers.',
  'I’ll remember {value} if I see it twice.',
  'Board says {theme}. Crowd says “sure.”',
  'Today’s common one seems to be {value}.',
  '{value} keeps showing up. Maybe coincidence.',
  'After the board, I only notice {value}.',
]

const EN_THEME_MT = [
  'Even on the ridge, people mention {value}.',
  'Heard {value} is today’s thing.',
  'I’ll look for {value} after I stop falling.',
  'Plaza board was {theme}, I think.',
  'Climbing with {value} stuck in my head.',
  '{value} doesn’t stand out as much up here.',
  'Board said {theme}. Only remember the font.',
  'Heard {value} a few times before noon.',
  'Going to look for {value} on the way down.',
  '{value} looks different on the ridge.',
  'Nodded at {theme}. Still unclear.',
  'Thinking about the plaza. Missed a step.',
  'Someone talked {value} mid-climb. Impressive.',
  'I’ll check the board again later.',
  'Still noticing {value} on the mountain.',
  'Today’s board: {theme}. Noted.',
]

const EN_THEME_MATCH = [
  'Yeah — {value} today.',
  'Other {value} folks nearby.',
  'Oh. Same {value}.',
  'If you like {value}, we might get along.',
  'Board’s {theme} feels right.',
  'Just wearing {value}. That’s all.',
  'Same look shows up in other districts too.',
  'Hunt more {value} if you want. I’m slow.',
  'Being told we match is oddly nice.',
  '{value}. Don’t make it weird.',
  'You actually read the board.',
  'I keep waving at people with {value}.',
  'Same trait. Different plans.',
  'Got talked to because of {value} today.',
  '{theme} on the board was accurate.',
  'Kept staring at the same hats without meaning to.',
]

const EN_PLAZA_FLAVOR = [
  'Meeting someone. Only know the hat color.',
  'Mountain or sea. Still deciding.',
  'Walked a lap and forgot my plan.',
  'Was the statue facing this way earlier?',
  'Same haircut around the fountain today.',
  'Meant to pick a direction. Stayed put.',
  'Fountain’s loud tonight.',
  'Gold path always pulls me home.',
  'Red-hat Meeb keeps looping the fountain.',
  'East bridge smells like pine from here.',
  'North gate’s busy.',
  'Thought I heard the sea.',
  'Sat on a bench and couldn’t get up.',
  'Star can wait. This shadow’s good.',
  'Almost left. Stopped again.',
  'Plaza lamps are soft.',
]

const EN_MT_FLAVOR = [
  'Lodge roof grew since yesterday.',
  'Wind talked me out of the next jump.',
  'Torch shadows make the pines look taller.',
  'Staying on this ridge another minute.',
  'Construction noise below.',
  'Can see Jerry’s glow from here.',
  'Came to climb. Stayed for the cold air.',
  'Someone smiled going down. Wonder why.',
  'Bridge feels farther when you’re tired.',
  'Don’t remember that wall on the build site.',
  'Clouds moved. View changed.',
  'Sitting. Legs want to go home.',
  'Pine smell stuck to my jacket.',
  'West of the plaza is sea. I can almost taste salt.',
  'Culture’s lit up inside, I hear.',
  'One more look at the ravine, then down.',
]

const EN_CU_FLAVOR = [
  'Quiet outside. Walking inside.',
  'Same color everywhere tonight.',
  'Heard footsteps inside. That’s the show.',
  'If I find a seat, I’m sitting.',
  'Screen’s huge.',
  'Inside’s louder than the sign.',
  'Asked today’s color. Forgot the answer.',
  'I like coming for the show.',
  'The white line’s moving.',
  'More footprints on the floor.',
  'When the blue feels heavy, I take the south gate.',
  'Suits and cool light.',
  'Aisle’s a little tight.',
  'Who’s next?',
  'Left locker’s lit up.',
  'Changed looks, then watched the show.',
]

const EN_SEA_FLAVOR = [
  'Only came to look at the sea. Somehow it’s evening.',
  'Sand made it into my shoes.',
  'Waves sound far today.',
  'Not moving from this spot.',
  'Sea wasn’t in the plan.',
  'That Meeb walks at wave speed.',
  'Sunset’s taking its time.',
  'Decided to do nothing. Schedule cleared.',
  'Lantern light on wet sand.',
  'Pier’s lit up.',
  'Foam erased my footprints.',
  'Quiet tide. Quiet head.',
  'Facing away from the plaza on purpose.',
  'Air tastes like salt. Socks full of sand.',
  'Shore building grew a wall, maybe.',
  'Leaving when the lantern cools. Probably lying.',
]

const JA_ASTRO_GREET = [
  'あ、床の線を見てた。',
  '山側から来た？',
  'こっちは静かだね。',
  '金属の床、足音が響く。',
  '三つとも、まだ工事中。',
  'ロボット、多い夜だね。',
  '紫の灯り、さっき点いた。',
  'カルチャーから歩いてきた。',
  'こんばんは。少し迷ってる。',
  'この先、まだ入れないみたい。',
  '星、広場より見やすい。',
  '足元、少し冷たい。',
  'さっき資材が通った。',
  'ここで一息ついてる。',
  '門を間違えて、ここまで来た。',
  'やあ。建物を見てた。',
]

const JA_ASTRO_FLAVOR = [
  'スタードーム、まだ骨組みだけ。',
  'ルナラボの奥で、金属の音がした。',
  'オービタルポートのリングが光ってる。',
  'ロボが資材を運んでた。',
  'ビジターの靴跡が残ってる。',
  'シアンの線を追ったら、同じ場所に戻った。',
  '三つの建物、今日は外から見るだけ。',
  '山側の門、振り返ると岩だらけ。',
  'カルチャーの光、ここからも見える。',
  'クレーターの縁で靴を直した。',
  '紫のビーコンが点滅してる。',
  '足場の下、金属の音。',
  '星を数えてた。途中で資材が通った。',
  'ロボットの歩幅、規則正しい。',
  '地図を見てたビジター、同じ角を二回曲がった。',
  'スタードームの前、写真を撮る人が多い。',
  'ルナラボの扉、昨日より厚く見える。',
  'オービタルポート、輪だけ先に完成しそう。',
  '工事の音が止まると、急に静か。',
  '暗い床だと、靴の色が変わって見える。',
  'ロボットに道を聞いたら、建物を指された。',
  '門を二つ見比べて、まだ迷ってる。',
  '資材箱、さっきと場所が違う。',
  '帰る前に、三つの看板をもう一度見る。',
]

const EN_ASTRO_GREET = [
  'Oh. I was watching the floor line.',
  'Come through the mountain side?',
  'Quiet over here.',
  'Footsteps carry on this metal.',
  'All three are still under construction.',
  'A lot of robots out tonight.',
  'That purple light just came on.',
  'Walked over from Culture.',
  'Hey. Slightly lost.',
  'Still can’t go in there.',
  'Stars are easier to see from here.',
  'Floor’s cold under the shoes.',
  'A load of materials just went by.',
  'Taking a minute here.',
  'Wrong gate brought me all the way out.',
  'Hey. Just looking at the buildings.',
]

const EN_ASTRO_FLAVOR = [
  'Star Dome’s still just ribs.',
  'Heard metal clanking deep in Lunar Lab.',
  'Orbital Port ring’s glowing.',
  'A robot hauled crates past me.',
  'Visitor footprints on the metal.',
  'Followed the cyan line. Ended up where I started.',
  'All three are closed. Just looking from outside.',
  'Mountain gate is all rock when you look back.',
  'Can still see Culture’s glow from here.',
  'Fixed my shoe by the crater rim.',
  'Purple beacon keeps blinking.',
  'Metal clanks under the scaffold.',
  'Was counting stars. A material cart interrupted.',
  'Robots walk like metronomes.',
  'Visitor with a map passed the same corner twice.',
  'People keep taking photos by Star Dome.',
  'Lunar Lab’s door looks thicker than yesterday.',
  'Orbital Port might finish the ring first.',
  'When construction stops, this place gets very quiet.',
  'Dark floor changes the color of every shoe.',
  'Asked a robot for directions. It pointed at a building.',
  'Compared both gates. Still undecided.',
  'That supply crate moved since I last looked.',
  'One more look at all three signs before I leave.',
]

const JA_FEAT_ASTRO = [
  '広場の主役、ここまで噂が来てる。',
  '今日の主役を見てから、こっちへ来た。',
  '像の帽子だけ覚えてる。',
  'ロボットが主役の番号を言ってた。',
  'スタードームの前でも、主役の話してた。',
  '主役の看板、写真だけ見せてもらった。',
  '広場まで戻ったら、もう一度像を見る。',
  '今日の主役、ここの照明だと違って見えそう。',
  'ビジターが主役の服を細かく説明してた。',
  '像を見てないのに、特徴だけ詳しくなった。',
  '主役の番号、資材箱に書きそうになった。',
  'ここには像がないから、噂だけ増える。',
  '広場の銅像、ロボットも見に行くらしい。',
  '主役と同じ帽子、さっき門の近くにいた。',
  '工事の話より、今日は主役の話が多い。',
  '帰りに噴水へ寄る。今度こそ忘れない。',
]

const EN_FEAT_ASTRO = [
  'Talk of the plaza Star made it all the way here.',
  'Saw today’s Star before walking over.',
  'Only remember the statue’s hat.',
  'A robot was reciting the Star’s number.',
  'They were talking about the Star by Star Dome too.',
  'Someone showed me a photo of the Star board.',
  'I’ll look at the statue again when I head back.',
  'Today’s Star would look different under these lights.',
  'A visitor gave a very detailed report on the outfit.',
  'Haven’t seen the statue. Somehow know every trait.',
  'Nearly wrote the Star’s number on a supply crate.',
  'No statue here, so the story keeps changing.',
  'Even the robots are going to see the plaza statue.',
  'Saw the same hat by the gate a minute ago.',
  'More Star talk than construction talk tonight.',
  'Stopping by the fountain on the way back. This time.',
]

const JA_THEME_ASTRO = [
  'ここの照明だと、{value} が少し青く見える。',
  'さっき門の近くで {value} を見た。',
  '広場の看板、今日は {theme} だった。',
  '{value} の子、金属の床だと見つけやすい。',
  'ロボットが {value} を数えてた。',
  'スタードームの前に、{value} が集まってた。',
  '{value}、暗い床では目立つね。',
  'ビジターが {theme} の話をしてた。',
  '工事灯の下だと、{value} の色が変わる。',
  '山側の門で {value} とすれ違った。',
  '今日よく見るのは {value}。ここでも同じ。',
  '{theme}、看板を見なくても覚えた。',
  '資材箱の横にも {value} がいた。',
  'ルナラボの前、{value} が二人いた。',
  '帰り道でも {value} を探しそう。',
  'ここまで来ても、今日の {value} は多い。',
]

const EN_THEME_ASTRO = [
  '{value} looks a little blue under these lights.',
  'Saw {value} by the gate a minute ago.',
  'Plaza board said {theme} today.',
  '{value} is easy to spot against the metal floor.',
  'A robot was counting the {value} crowd.',
  'A few {value} folks gathered by Star Dome.',
  '{value} stands out on the dark floor.',
  'A visitor was talking about {theme}.',
  'Construction lights change the look of {value}.',
  'Passed someone with {value} at the mountain gate.',
  'Seeing {value} everywhere today. Same out here.',
  'Remembered {theme} without checking the board again.',
  'Saw {value} beside the supply crates.',
  'Two {value} visitors by Lunar Lab.',
  'I’ll probably keep spotting {value} on the way back.',
  'Came all this way. Still seeing plenty of {value}.',
]

// ─── build ───────────────────────────────────────────────────────────

function buildPools(lang: Lang, zone: ParkZoneId): ParkDialoguePools {
  const isJa = lang === 'ja'
  const isMt = zone === 'mountain'
  const isCu = zone === 'culture'
  const isSea = zone === 'sea'
  const isAstro = zone === 'astro'

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
        : isAstro
          ? isJa
            ? JA_ASTRO_GREET
            : EN_ASTRO_GREET
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
        : isAstro
          ? isJa
            ? JA_ASTRO_FLAVOR
            : EN_ASTRO_FLAVOR
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
    gameShooting: isJa ? JA_SHOOTING : EN_SHOOTING,
    gameRunway: isJa ? JA_RUNWAY : EN_RUNWAY,
    gameLookLocker: isJa ? JA_LOOK_LOCKER : EN_LOOK_LOCKER,
    gameSergito: isJa ? JA_SERGITO : EN_SERGITO,
    featuredAny: isAstro
      ? isJa
        ? JA_FEAT_ASTRO
        : EN_FEAT_ASTRO
      : isMt
        ? isJa
          ? JA_FEAT_MT
          : EN_FEAT_MT
        : isJa
          ? JA_FEAT
          : EN_FEAT,
    featuredMatched: isJa ? JA_FEAT_MATCH : EN_FEAT_MATCH,
    themeAny: isAstro
      ? isJa
        ? JA_THEME_ASTRO
        : EN_THEME_ASTRO
      : isMt
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
    pools.gameShooting.length +
    pools.gameRunway.length +
    pools.gameLookLocker.length +
    pools.gameSergito.length +
    pools.featuredAny.length +
    pools.featuredMatched.length +
    pools.themeAny.length +
    pools.themeMatched.length +
    pools.flavor.length
  )
}

export const PARK_DIALOGUE_EN = getParkDialoguePools('en', 'plaza')
export const PARK_DIALOGUE_JA = getParkDialoguePools('ja', 'plaza')
