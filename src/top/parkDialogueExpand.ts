/**
 * パーク NPC セリフプール（完結した一言）。
 * 方針: memory-bank/parkNpcDialogue.md
 * 日本語は口に出せる普通の雑談。比喩・詩的な断片・言い回しの凝りすぎは避ける。
 * EN / JA は別々に書いた配列で、直訳ペアではない（場面の方向だけ揃える）。
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

// ─── Japanese（日本語から先に書く。口語・具体物優先）──────────────────

const JA_PLAZA_GREET = [
  'あ、どうも。',
  '靴ひも結んでた。',
  '噴水の前、また来ちゃった。',
  '行き先、まだ決めてない。',
  'こんばんは。',
  'ぼーっとしてた。',
  'もう一周しそう。',
  '風、やわらかいね。',
  'ベンチ空いてたから座った。',
  'ちょっと一息。',
  '広場ってつい足が止まる。',
  'やあ。',
  '今夜は灯りが低いね。',
  '計画、どこかに置いてきた。',
  'あ、いた。',
  '今日はのんびりしてる。',
]

const JA_MT_GREET = [
  '縁に気をつけて。',
  '松のにおいがする。',
  'ジャンプの数、もう忘れた。',
  'トーチがちらついてる。',
  '足が少し疲れた。',
  'ここ、風で声が飛ぶね。',
  '登る？ それとも眺めるだけ？',
  '座ったら、理由を忘れた。',
  'あの足場、ちょっと怖い。',
  '山の夜、静かだね。',
  'ちょっと待って。',
  '空気が冷たい。',
  '下りと上りで気分が違う。',
  '足元を見てた。',
  '長い道を選んじゃった。',
  '一息ついてる。',
]

const JA_CU_GREET = [
  '青い光、多いね。',
  '看板、読んでた。',
  'スーツの人が多い。',
  '床、ちょっと冷たい。',
  'ランウェイ、今日の色なに？',
  '白い線が光ってる。',
  '中は暗いけど、すぐ目が慣れる。',
  '同じところを回ってる。',
  'ショー、もう始まった？',
  '道に迷ってる。',
  'モデルの歩き方、きれい。',
  'こんばんは。',
  '静かだね。',
  'あ、今気づいた。',
  'ぶらぶらしてるだけ。',
  '影が長い。',
]

const JA_SEA_GREET = [
  '波、静かだね。',
  'また砂だ。',
  'あ、いた。',
  '一分だけのつもりが、もう長居してる。',
  'ヤシの影、長いね。',
  'ランタン、あったかい。',
  '行くとこあったんだけどな。',
  '波の音が遠い。',
  '靴の中、もう砂だらけ。',
  '海のほうを見てた。',
  '急がなくていい夜。',
  '波の白い線を、ずっと追ってた。',
  '座るつもりで来た。',
  'やあ。',
  '潮の匂いがする。',
  'ぼーっとしてる。',
]

const JA_FIND = [
  '顔は合ってた。靴が違った。',
  'ひとり覚えたら、その子はもういなかった。',
  '見つけたと思ったけど、違った。',
  '笑った顔だけ同じ。',
  '一人を探してたら、三人が気になった。',
  '同じ髪型、多くない？',
  '靴を覚えとけばよかった。',
  '奥のほうでまた見失った。',
  '服は似てるのに、顔が違う。',
  '勘はあてにしないことにした。',
  '違う子に手を振っちゃった。',
  '帽子で間違えた。',
  '靴ひもを結んでる間に消えた。',
  'もう一回見てくる。',
  '探してた子より、別の子が気になる。',
  '人が多くて、顔が追いきれない。',
]

const JA_TRAITS = [
  '帽子ばっかり見てた。靴だった。',
  '同じ青でも、並ぶと違って見える。',
  'あの髪、覚えたつもりだった。',
  '服は見たけど、顔を見てなかった。',
  '眼鏡だと思ったら眉毛だった。',
  '近くで見ると、誰も似てない。',
  '今日は靴が気になる。',
  '特徴は分かった。名前が出てこない。',
  '同じシャツなのに、歩き方が違う。',
  'ピアスは最後に見た。最初に見るべきだった。',
  '色、見間違えてたかも。',
  '小物一つで、ずいぶん印象が変わる。',
  '正解の隣を何回も通ってた。',
  '目が疲れた。',
  'あのスカーフ、さっきこっちにいたよね。',
  '細かいところを見ると、全然違う。',
]

const JA_STREET = [
  'あの角、さっきより近くない？',
  '誰も変じゃなかった。なのに落ち着かない。',
  '同じ人を三回見た。',
  '立ち止まると、足音も止まる。',
  '何もなかったよ。たぶん。',
  'あの窓、最初から開いてたっけ？',
  '今日は振り返らないことにした。',
  '出口だと思ったら入口だった。',
  '街灯はあったかい。首の後ろは冷たい。',
  '路地の並び、変わった気がする。',
  'まばたきしたら、何か見逃した。',
  '道は同じ。歩いてる人の靴が違う。',
  '何もないって自分に言い聞かせた。もう一回確認した。',
  '白い光が消えたら、どこまで数えたか分からなくなった。',
  '普通の角でいいから、歩きたい。',
  '後ろが気になる。',
]

const JA_MT_GAME = [
  '昨日の近道、今日は崖になってた。',
  '三段目までは順調だった。',
  '山頂はまた今度。今日はここまで。',
  '風のせいにしてる。',
  '同じ場所で二回落ちた。',
  '上は遠い。下はもっと遠い。',
  '今日の山、ちょっと意地悪。',
  '途中の景色を見てたら、登るのをやめた。',
  'Mt. Meebは眺めるだけのつもりだった。',
  '計画はあった。足場が違った。',
  'あのジャンプ、簡単に見えた。',
  'もうやめる。あと一回だけ。',
  '昨日の足場を探したけど、なかった。',
  '一番難しそうなルートを選んでしまった。',
  '最初からやり直し。足が重い。',
  '落ちたあとは、妙に静か。',
]

const JA_NEON = [
  '透明な足場は、信じるほど怖くなる。',
  '下を見ないつもりだった。見ちゃった。',
  'ジェリーマウンテン、今日は意地悪。',
  '昨日の足場、どこにもない。',
  '見た目は柔らかいのに、着地は硬い。',
  '光っているほうへ行ったら落ちた。',
  'ジャンプは同じ。下の暗さが違う。',
  '一段のつもりが、長居して落ちた。',
  'ピンクの足場は苦手。',
  '夜のあいだに道が変わったみたい。',
  'もう一回やってから帰る。',
  '縁が光ってると、つい目がいく。',
  '昨夜のルートのほうが好きだったのに、もうない。',
  '跳んでる途中で喜ぶと、だいたい落ちる。',
  'ジェリーは見た目がやさしいんだよな。',
  '下が、やけに近い。',
]

const JA_RUNWAY = [
  '今日の色、似てる子が多い。',
  'モデル、歩き方がうまい。',
  '空席、見つけた。',
  'ショー、もう始まってる？',
  '白い線が光ってる。',
  '座って見た。足を伸ばした。',
  '次の子、誰だろ。',
  '今日の服、覚えて帰ろう。',
  '背中ばっかり見てた。',
  '拍手、ひとりだけ。',
  '色、今日は青？',
  '通路が狭い。',
  'スクリーンが大きい。',
  '暗いのに目が冴える。',
  '服より歩き方を見てる。',
  '立ち上がったら、前の席にぶつかった。',
]

const JA_LOOK_LOCKER = [
  'ロッカーで帽子を替えてみた。',
  'いまと試着、並べて見た。',
  'タイプから選ぶの、分かりやすい。',
  '似てる子がたくさん出てきて迷う。',
  '着替えたら、南の門から出た。',
  '髪型だけ変えてみた。',
  '左のロッカー、また人が入っていく。',
  '同じ服の子、何人もいた。',
  '試着、気に入った。',
  '一通り試したら、また最初から見直す。',
  'Pigにしたら、髪型の候補がほとんどなかった。',
  'いまの姿と並べて比べてる。',
  'シャツを替えたら別人みたい。',
  'ロッカーの前、列ができてる。',
  'この姿でランウェイ見に行こう。',
  '帽子を三つ試した。',
]

const JA_SHOOTING = [
  '真ん中を抜いた。次は端を狙った。',
  '金の的を追ったら、普通の的を外した。',
  '赤い的が出ると、つい反応して撃っちゃう。',
  '構えてると、時間があっという間に終わる。',
  '最後の一発だけ、きれいに当たった。',
  '続けて当たると、急に手がかたくなる。',
  '点の高い的が出てから、急に忙しくなった。',
  '的の隙間を狙った。当たらなかった。',
  'ロッジのポスターが気になって、撃つ前に見てしまった。',
  '銃を下ろしたら、右腕だけ疲れてた。',
  '真ん中ばっかり狙ってた。端のほうが楽だった。',
  '金の的が止まるのを待った。止まらなかった。',
  'もう少しで高得点だったのに。',
  'カウントが始まる前から照準を動かしてた。',
  '点数より、最後に外した一発のほうを覚えてる。',
  '射的の奥、的が思ったより多い。',
]

const JA_SERGITO = [
  'Sergitoに、まず帽子を見られた。',
  'シャツの話から、靴の話になった。',
  '工房の棚に、同じ顔が一つもない。',
  'Sergitoは、自分でも気にしてない色を覚えてた。',
  '話しかけたら、まず眼鏡のことを言われた。',
  '二回目は髪の話だった。',
  '奥の人形、近くで見ると細かいな。',
  '工房を出てから、自分の服を見直した。',
  'Sergitoは、こっちが忘れてた特徴まで見てた。',
  '棚の前で長居した。本人とは短く話した。',
  '同じタイプでも、並ぶと全然違う。',
  '靴の色を言い当てられて、思わず下を見た。',
  '工房では、客まで展示品に見えてくる。',
  '感想を聞きに行ったら、こっちが観察されてた。',
  '出口まで来て、もう一回話しに戻った。',
  '砂を落として入ったのに、帰りはまた砂だらけ。',
]

const JA_FEAT = [
  '今日の主役、ちょっと眠そう。',
  '像より、見ている人の服が気になる。',
  '銅像、こっちからだと温かく見える。',
  '写真を撮ったら、親指が入ってた。',
  '台座のまわりは人が多い。',
  '今日の主役、後ろ姿のほうが好きだな。',
  '噴水はうるさい。主役は静か。',
  '像のまわりをぐるぐる回ってる子がいる。',
  '看板、指紋だらけ。',
  '主役を見に来て、噂を聞いて残った。',
  '像は動いてない。二回見た。',
  '今日の顔、どこかで見た気がする。',
  '金属なのに、なんか得意そう。',
  '似てないけど、つい見てしまう。',
  '今夜、あの台座の前だけ人が多い。',
  '名前は忘れた。帽子だけ覚えた。',
]

const JA_FEAT_MT = [
  '山の上でも、噴水の主役の話をしてる。',
  '像を見に、一度下りた。',
  '今日の主役は眠そうだって聞いた。',
  '足が楽になったら、台座を見に行く。',
  '銅像とトーチ、似た色だね。',
  '主役の話ばかり聞いて、まだ見てない。',
  '帽子の説明、誰か間違えてた気がする。',
  '先に登る？ 先に像？ 決まらない。',
  '主役が変わったらしい。まだ見てない。',
  '噂のほうが先に山頂に着きそう。',
  '看板、もう一回読んでから信じる。',
  '崖の上で像の話をしてる。変だね。',
  '今日の主役は待てる。この足場は待ってくれない。',
  'もう一回見に下りる。たぶん。',
  '噴水の話、尾根まで届いてる。',
  '像は横から見ると印象が違うらしい。',
]

const JA_FEAT_MATCH = [
  '今日の主役と、ちょっと似てるらしい。',
  '像と同じ系統の服を着てるって言われた。',
  '噴水の前で二度見された。',
  '似てるって言われても、何もしてないんだけど。',
  '同じ感じの人が、あちこちにいる。',
  '台座の近くにいると、よく見られる。',
  '像本人じゃないよ。紛らわしいだけ。',
  '主役に合わせた服じゃない。たまたまだよ。',
  '似てる人を探すなら、ご自由に。ぼくは休んでる。',
  '銅像の親戚みたいに言われた。',
  '看板の前で、自分に手を振っちゃった。',
  '似てるのは気のせいかもしれない。',
  '像には言わないで。気まずい。',
  '今日の主役に似てるって、大げさだよ。',
  '今日は像の近くにいることが多い。',
  '似てるって言われると、姿勢が良くなる。',
]

const JA_THEME = [
  '今日は {value}、よく見かける。',
  '看板には {theme} って書いてある。',
  'あ、あの子も {value} だ。',
  '噴水の前、{value} が多い気がする。',
  '{value} を見つけて、なんで気になったか忘れた。',
  '看板の字、{theme}。読んだ。',
  '{value}、今日多くない？',
  '同じ {value} の子に、つい会釈した。',
  '{value}なら、像のほうが似合うかも。',
  '靴ひもが解けたまま、{value} を数えてた。',
  '{theme}、三人に聞いたら答えが違った。',
  '{value}、もう一回見たら覚えられそう。',
  '看板は {theme}。みんな「まあね」って顔。',
  '今日よく見るのは {value} だね。',
  '{value} がついてくる。気のせいかも。',
  '看板を見てから、{value} ばかり目に入る。',
]

const JA_THEME_MT = [
  '尾根でも {value} の話が出てる。',
  '{value} が今日のポイントらしい。',
  '落ちるのをやめてから、{value} を探してる。',
  '広場の看板は {theme} だった気がする。',
  '{value}、頭に残ったまま登ってる。',
  '山では {value}、あんまり目立たない。',
  '看板の字、{theme}。フォントしか覚えてない。',
  '昼前に {value} の話を何回も聞いた。',
  '下りながら {value} を探すつもり。',
  '尾根の {value}、見え方が違う。',
  '{theme}、うなずいたけど中身はまだ。',
  '広場のこと考えてたら、また足を踏み外した。',
  '登りながら {value} の話してた人、すごかった。',
  '看板、もう一回読めたら確認する。',
  '{value}、山でも気になる。',
  '今日の看板、{theme}。覚えておこう。',
]

const JA_THEME_MATCH = [
  'うん、今日は {value}。',
  '{value} の人、近くにいるね。',
  'あ、同じ {value} だ。',
  '{value} が好きなら、話が合うかも。',
  '看板の {theme}、当たってる気がする。',
  '{value}、ただ着てるだけなんだけど。',
  '同じ系統の人が、エリアが違ってもいる。',
  '{value} の子、探すならどうぞ。ぼくは歩くの遅いから。',
  '似てるって言われて、ちょっと嬉しい。',
  '{value}。変な目で見ないで。',
  '看板、ちゃんと見てきたんだね。',
  '{value} の子に、つい手を振りがち。',
  '同じ服でも、やってることは別。',
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
  '方向を決めるつもりが、居ついた。',
  '噴水の音、大きいね。',
  '金色の道、つい歩いちゃう。',
  '赤い帽子の子、噴水を何周もしてる。',
  '東の橋のほう、松のにおいがする。',
  '北の門、人が多い。',
  '海のほうから音がした気がする。',
  'ベンチに座ったら、動けなくなった。',
  '今日の主役はあとで。この影がいい。',
  '出かける直前で、また止まってる。',
  '広場の灯、やわらかい。',
]

const JA_MT_FLAVOR = [
  'ロッジの屋根、昨日より増えてる。',
  '風で、次のジャンプをやめた。',
  'トーチの影で、松が高く見える。',
  'この尾根、もう少しいる。',
  '下で工事の音がする。',
  'ジェリーの光、ここから見える。',
  '登るつもりが、冷たい空気で長居した。',
  '下りで笑ってた人、なんだったんだろ。',
  '疲れてると、橋まで遠い。',
  '工事場の壁、前あったっけ。',
  '雲が動いて、景色が変わった。',
  '座ってる。足がもう帰りたがってる。',
  '松のにおいが服についた。',
  '広場の西は海。塩のにおいを想像できる。',
  'カルチャー、中が光ってる。',
  '渓谷、もう一回見て帰る。',
]

const JA_CU_FLAVOR = [
  '外は静か。中では歩いてる。',
  '今日の色、似てる子が多い。',
  '中で足音がした。ショーだ。',
  '空席を見つけたら座る。',
  'スクリーン、大きい。',
  '看板より中のほうが派手。',
  '今日の色、聞いたけど覚えてない。',
  'ショーを見に来るのが好き。',
  '白い線の上を歩いてる。',
  '床に足跡が増えてる。',
  '青が強いときは、南の門から戻る。',
  'スーツの人と、青い光。',
  '通路、ちょっと狭い。',
  '次の子、誰だろ。',
  '左のロッカー、光ってる。',
  'きせかえてからショーを見た。',
]

const JA_SEA_FLAVOR = [
  '海を見に来ただけなのに、もう夕方。',
  '砂、靴の中まで入ってきた。',
  '波の音、今日は遠い。',
  '今日はここから動かない。',
  '海は予定になかったんだけど。',
  'あの子、波と同じ速さで歩いてる。',
  '夕日、ゆっくりだね。',
  '何もしないと決めたら、予定が空いた。',
  '濡れた砂に、ランタンの光。',
  '桟橋が光ってる。',
  '泡が足跡を消した。',
  '潮は静か。気持ちも静か。',
  'わざと広場と反対を向いてる。',
  '空気は塩っぽい。靴下は砂だらけ。',
  '岸の建物、壁が増えたかも。',
  'ランタンが冷めたら帰る。たぶん嘘。',
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

/** 11–12月だけ greetings に混ぜる（全区共通・軽め） */
const JA_XMAS_GREET = [
  'メリークリスマス。',
  'あ、メリークリスマス。',
  'この時期っぽい空気だね。',
  'イルミ、いい感じ。',
  '季節もの、ちょっと好き。',
  '今夜、少し華やかだね。',
  '冬のパーク、悪くない。',
  'やあ。メリークリスマス。',
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

const JA_FEAT_ASTRO = [
  '広場の主役、ここまで噂が来てる。',
  '今日の主役を見てから、こっちへ来た。',
  '像の帽子だけ覚えてる。',
  'ロボットが今日の主役のことをぶつぶつ言ってた。',
  'スタードームの前でも、主役の話してた。',
  '主役の看板、写真だけ見せてもらった。',
  '広場まで戻ったら、もう一度像を見る。',
  '今日の主役、ここの照明だと違って見えそう。',
  'ビジターが主役の服を細かく説明してた。',
  '像を見てないのに、特徴だけ詳しくなった。',
  '主役の名前をメモしようとして、ペンを探して忘れた。',
  'ここには像がないから、噂だけ増える。',
  '広場の銅像、ロボットも見に行くらしい。',
  '主役と同じ帽子、さっき門の近くにいた。',
  '工事の話より、今日は主役の話が多い。',
  '帰りに噴水へ寄る。今度こそ忘れない。',
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

const JA_MUSIC_ART_GREET = [
  '音、聞こえる？',
  'マゼンタの床、いい色。',
  'ステージの前で立ち止まった。',
  '映像、もう始まってる？',
  'ヘッドホン、外したくない夜。',
  'ビートに合わせて歩いてた。',
  'ここ、ちょっと落ち着く。',
  'スクリーンの光、きれい。',
]

const JA_MUSIC_ART_FLAVOR = [
  '工事中のホール、気になる。',
  '音と映像が一緒にあるの、いいな。',
  'カルチャーの奥って、空気が変わる。',
  'アンバーの灯り、ステージっぽい。',
  'いつかここで上映会やりたい。',
  '波形の床、踏むだけで気分が出る。',
]

const JA_JUNGLE_GREET = [
  'ブタ、こっち見てた。',
  '牛って、近くで見ると大きい。',
  '羊、ずっと草食べてる？',
  'この柵、つい覗きたくなる。',
  '迷彩で来たら、森にとけた。',
  '土の道、歩きやすい。',
  'あの羊、さっきから動かない。',
  '夜の牧場、静かでいい。',
]

const JA_JUNGLE_FLAVOR = [
  '豚の囲い、ちょっと泥っぽい。',
  'ここ、迷彩の人が多くない？',
  'いつか餌やりできたらいいな。',
  '牛が歩き出すと、つい目で追う。',
  'カルチャーの隣に森があるの、意外。',
  '羊の毛、さわってみたい。',
]

// ─── English（場面は共有。直訳しない・口語で書く）──────────────────────

const EN_PLAZA_GREET = [
  'Oh, hi.',
  'Hang on, my shoe’s untied.',
  'Ended up at the fountain again.',
  'Still deciding where to go.',
  'Evening.',
  'Was zoning out.',
  'Might do one more lap.',
  'Soft wind tonight.',
  'Grabbed an empty bench.',
  'Just catching my breath.',
  'Hard to leave the plaza.',
  'Hi.',
  'Lamps are low tonight.',
  'Lost my plan somewhere.',
  'Oh, there you are.',
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
  'Going down feels different from going up.',
  'Watching my feet.',
  'Took the long way.',
  'Resting a minute.',
]

const EN_CU_GREET = [
  'Lots of blue light.',
  'Was reading the sign.',
  'Lots of suits tonight.',
  'Floor’s a bit cold.',
  'What’s today’s color?',
  'The white line’s glowing.',
  'Dark inside, but my eyes adjust.',
  'Keep circling the same spot.',
  'Has the show started?',
  'A little lost.',
  'That walk was clean.',
  'Evening.',
  'Quiet here.',
  'Oh, just noticed you.',
  'Just wandering.',
  'Long shadows.',
]

const EN_SEA_GREET = [
  'Tide’s quiet.',
  'Sand again.',
  'Oh, there you are.',
  'Meant to stay a minute. Stayed longer.',
  'Palm shadows are long.',
  'Lantern’s warm.',
  'I had somewhere to be.',
  'Waves sound far away.',
  'Sand in my shoes already.',
  'Was looking at the water.',
  'No rush tonight.',
  'Followed the foam line.',
  'Sitting down was the plan.',
  'Hey.',
  'Salty air.',
  'Just staring.',
]

const EN_FIND = [
  'Right face. Wrong shoes.',
  'I memorized one Meeb, then lost them.',
  'Thought I found them. Doubted it.',
  'Same smile, everything else different.',
  'Came looking for one, noticed three.',
  'Too much of the same hair today.',
  'Should’ve remembered the shoes.',
  'Lost them again near the back.',
  'Matched the shirt, not the face.',
  'Don’t trust the first glance.',
  'Waved at the wrong one.',
  'Got fooled by a hat.',
  'They vanished while I tied my shoe.',
  'Going back for one more look.',
  'Found someone else more interesting.',
  'So many faces in there.',
]

const EN_TRAITS = [
  'Watched the hats. It was the shoes.',
  'Same blue looks different side by side.',
  'Thought I’d remember that hair.',
  'Saw the outfit, missed the face.',
  'Thought those were glasses. Eyebrows.',
  'Up close, nobody matches.',
  'Can’t stop noticing shoes today.',
  'Got the trait, forgot the name.',
  'Same shirt, different walk.',
  'Checked earrings last. Should’ve been first.',
  'Might have misread the color.',
  'One accessory changed the whole look.',
  'Walked past the answer a few times.',
  'Eyes are tired.',
  'That scarf was over here a second ago.',
  'Look closer and they’re all different.',
]

const EN_STREET = [
  'That corner’s closer than before.',
  'Nothing looked wrong. That’s what bugged me.',
  'Saw the same walker three times.',
  'When I stop, the footsteps stop.',
  'Nothing happened. Probably.',
  'Was that window always open?',
  'Not looking back today.',
  'Thought I found the exit. It was the entrance.',
  'Warm lamps. Cold neck.',
  'The alley feels rearranged.',
  'Blinked and missed something.',
  'Same street. Different shoes on everyone.',
  'Told myself it was nothing. Checked again.',
  'After the white flash, I lost my count.',
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
  'Mountain’s being mean today.',
  'The view halfway up talked me out of climbing.',
  'Only meant to glance at Mt. Meeb.',
  'Had a plan. The ledges disagreed.',
  'That jump looked easy.',
  'I’m done. One more try.',
  'Went back for yesterday’s ledge. Gone.',
  'Picked the hardest-looking lane.',
  'Starting over. Legs feel heavy.',
  'Quiet after a fall.',
]

const EN_NEON = [
  'Clear platforms scare me once I trust them.',
  'Wasn’t going to look down. Did anyway.',
  'Jerry Mountain’s being mean today.',
  'Can’t find last night’s ledge.',
  'Blocks look soft. Landing isn’t.',
  'Followed the glow. Fell.',
  'Same jumps, darker below.',
  'Meant to stay one stage. Stayed too long. Fell.',
  'Not a fan of the pink ones.',
  'Path changed overnight, I think.',
  'One more try, then I’m leaving.',
  'Lit edges make me stare.',
  'Liked last night’s route better. It’s gone.',
  'Don’t celebrate mid-jump.',
  'Jelly looked friendly. It wasn’t.',
  'The void feels close.',
]

const EN_RUNWAY = [
  'Lots of the same color tonight.',
  'That walk was clean.',
  'Found an empty seat.',
  'Has the show started?',
  'The white line’s glowing.',
  'Sat down. Stretched my legs.',
  'Who’s next?',
  'Trying to remember today’s look.',
  'Mostly watched their backs.',
  'One person clapping.',
  'Blue today, maybe?',
  'The aisle’s tight.',
  'The screen’s huge.',
  'Dark room. Wide awake.',
  'Watching the walk more than the clothes.',
  'Stood up and bumped the row in front.',
]

const EN_LOOK_LOCKER = [
  'Tried a new hat in the locker.',
  'Took ages to pick between two nearly identical hats.',
  'Starting from Type makes sense.',
  'Too many matches. Got stuck.',
  'Changed looks, then took the south gate.',
  'Only switched the hair.',
  'Left building’s a fitting room, apparently.',
  'Saw a bunch of people in the same shirt.',
  'Liked the try-on.',
  'Cleared it and started over.',
  'Tried Pig. Hardly any hair to choose from.',
  'Comparing side by side with my current look.',
  'New shirt. Barely recognized myself.',
  'People keep going into Look Locker.',
  'Wearing this to the runway next.',
  'Tried three hats.',
]

const EN_SHOOTING = [
  'Hit the center once. Caught the edge next.',
  'Chased the gold target and missed the easy ones.',
  'Almost fired at a red one on reflex.',
  'Forty-five seconds goes fast once you’re aiming.',
  'The last shot was the clean one.',
  'The combo held, then my hand went stiff.',
  'The hundred-point targets got busy later.',
  'Aimed between two targets. Both survived.',
  'Stared at the lodge posters before I started.',
  'Put the pistol down. Right arm felt heavy.',
  'Stuck to the center. Probably should’ve gone for the edges.',
  'Waited for the gold to stop. It never did.',
  'Almost got the perfect score.',
  'Started aiming before the countdown ended.',
  'Forgot the score. Remember the last miss.',
  'More targets behind that counter than it looks.',
]

const EN_SERGITO = [
  'Sergito noticed the hat first.',
  'Started with my shirt. Ended up on shoes.',
  'Not one repeated face on those shelves.',
  'Sergito caught a color I barely notice.',
  'Walked up and got a comment on my glasses.',
  'Talked twice. The second time was all hair.',
  'The figures have tiny details up close.',
  'Left the workshop checking my own outfit.',
  'Sergito caught a trait I’d forgotten about.',
  'Spent longer at the shelves than talking.',
  'Same type, completely different side by side.',
  'Got my shoe color called out. Looked down.',
  'Even the people walking inside looked like displays.',
  'Went in for an opinion. Got studied instead.',
  'Reached the exit, then went back for one more talk.',
  'Brushed off the sand going in. Came out with more.',
]

const EN_FEAT = [
  'Today’s Star looks a little sleepy.',
  'I’m watching the crowd more than the statue.',
  'The copper looks warmer from here.',
  'My thumb got into the photo.',
  'Crowded around the pedestal tonight.',
  'I like the Star better from behind.',
  'The fountain’s loud. The Star’s quiet.',
  'Someone keeps circling the statue.',
  'The board is covered in fingerprints.',
  'Came for the Star. Stayed for the gossip.',
  'The statue didn’t move. Checked twice.',
  'Today’s face feels familiar.',
  'Metal shouldn’t look that smug.',
  'Not a match, but I keep staring.',
  'Crowd’s thickest by that pedestal tonight.',
  'Forgot the name. Remembered the hat.',
]

const EN_FEAT_MT = [
  'People up here still talk about the fountain Star.',
  'Went down once just to see the statue.',
  'Heard today’s Star looks sleepy.',
  'I’ll visit the pedestal when my legs recover.',
  'The statue and the torch are close in color.',
  'All this talk, and I still haven’t seen them.',
  'Someone got the hat wrong, I think.',
  'Climb first or statue first? Undecided.',
  'The Star changed, apparently. Haven’t looked yet.',
  'Rumors are climbing faster than I am.',
  'I’ll read the board again before I believe it.',
  'Weird, talking about a statue on a cliff.',
  'The Star can wait. This ledge can’t.',
  'Going back down to look again. Probably.',
  'The fountain talk made it all the way up here.',
  'The statue looks different from the side, they say.',
]

const EN_FEAT_MATCH = [
  'People say I look a bit like today’s Star.',
  'Someone said my outfit matches the statue.',
  'Got a double take by the fountain.',
  'Lookalike duty. Didn’t ask for it.',
  'A few of us look alike tonight.',
  'Stand near the pedestal and people stare.',
  'Not the statue. Just confusing.',
  'The outfit’s a coincidence. Really.',
  'Go find the others if you want. I’m resting.',
  'Someone called me the statue’s cousin.',
  'Waved at my reflection by the board. Awkward.',
  'Maybe we don’t actually look that alike.',
  'Don’t tell the statue. Embarrassing.',
  'Someone said I look like a Star double. Dramatic.',
  'Spending a lot of time near the statue today.',
  'When people say we match, I stand up straighter.',
]

const EN_THEME = [
  'Seeing a lot of {value} today.',
  'Board says {theme}.',
  'Oh, that one has {value} too.',
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
  'The most common one today seems to be {value}.',
  '{value} keeps showing up. Probably a coincidence.',
  'After reading the board, I only notice {value}.',
]

const EN_THEME_MT = [
  'Even on the ridge, people mention {value}.',
  'Heard {value} is today’s thing.',
  'I’ll look for {value} once I stop falling.',
  'Plaza board was {theme}, I think.',
  'Climbing with {value} stuck in my head.',
  '{value} doesn’t stand out as much up here.',
  'Board said {theme}. I only remember the font.',
  'Heard {value} a few times before noon.',
  'Going to look for {value} on the way down.',
  '{value} looks different on the ridge.',
  'Nodded at {theme}. Still not sure what it means.',
  'Thinking about the plaza. Missed a step.',
  'Someone talked about {value} mid-climb. Impressive.',
  'I’ll check the board again later.',
  'Still noticing {value} on the mountain.',
  'Today’s board: {theme}. Noted.',
]

const EN_THEME_MATCH = [
  'Yeah, {value} today.',
  'Other {value} folks nearby.',
  'Oh. Same {value}.',
  'If you like {value}, we might get along.',
  'The board’s {theme} feels right.',
  'Just wearing {value}. That’s all.',
  'The same look shows up in other districts too.',
  'Go hunt more {value} if you want. I’m slow.',
  'Being told we match is oddly nice.',
  '{value}. Don’t make it weird.',
  'You actually read the board.',
  'I keep waving at people with {value}.',
  'Same trait, different plans.',
  'Got talked to because of {value} today.',
  '{theme} on the board was accurate.',
  'Kept staring at the same hats without meaning to.',
]

const EN_PLAZA_FLAVOR = [
  'Meeting someone. Only know the hat color.',
  'Mountain or sea. Still deciding.',
  'Walked a lap and forgot my plan.',
  'Was the statue facing this way earlier?',
  'Same haircut all over the fountain today.',
  'Meant to pick a direction. Stayed put.',
  'Fountain’s loud tonight.',
  'The gold path always pulls me back.',
  'The red-hat Meeb keeps looping the fountain.',
  'The east bridge smells like pine from here.',
  'North gate’s busy.',
  'Thought I heard the sea.',
  'Sat on a bench and couldn’t get up.',
  'The Star can wait. This shadow’s nice.',
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
  'Someone smiled on the way down. Wonder why.',
  'The bridge feels farther when you’re tired.',
  'I don’t remember that wall at the build site.',
  'Clouds moved. The view changed.',
  'Sitting. My legs want to go home.',
  'Pine smell stuck to my jacket.',
  'West of the plaza is the sea. I can almost taste salt.',
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
  'When the blue gets heavy, I take the south gate.',
  'Suits and cool light.',
  'The aisle’s a little tight.',
  'Who’s next?',
  'Left locker’s lit up.',
  'Changed looks, then watched the show.',
]

const EN_SEA_FLAVOR = [
  'Only came to look at the sea. Somehow it’s evening.',
  'Sand got into my shoes.',
  'Waves sound far today.',
  'Not moving from this spot.',
  'The sea wasn’t in the plan.',
  'That Meeb walks at wave speed.',
  'Sunset’s taking its time.',
  'Decided to do nothing. Schedule cleared.',
  'Lantern light on wet sand.',
  'The pier’s lit up.',
  'Foam erased my footprints.',
  'Quiet tide. Quiet head.',
  'Facing away from the plaza on purpose.',
  'Air tastes like salt. Socks full of sand.',
  'The shore buildings got a new wall, maybe.',
  'Leaving when the lantern cools. Probably lying.',
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

const EN_XMAS_GREET = [
  'Merry Christmas.',
  'Oh — Merry Christmas.',
  'Feels like that time of year.',
  'Lights look nice tonight.',
  'Kind of into the seasonal stuff.',
  'Night feels a bit brighter.',
  'Winter park’s not bad.',
  'Hey. Merry Christmas.',
]

/** シーズン中だけ通常挨拶プールに追加する行。 */
export function getChristmasGreetingLines(lang: Lang): readonly string[] {
  return lang === 'ja' ? JA_XMAS_GREET : EN_XMAS_GREET
}

const EN_ASTRO_FLAVOR = [
  'Star Dome’s still just a frame.',
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

const EN_FEAT_ASTRO = [
  'Talk of the plaza Star made it all the way here.',
  'Saw today’s Star before walking over.',
  'Only remember the statue’s hat.',
  'A robot was muttering about today’s Star.',
  'They were talking about the Star by Star Dome too.',
  'Someone showed me a photo of the Star board.',
  'I’ll look at the statue again when I head back.',
  'Today’s Star would look different under these lights.',
  'A visitor gave a very detailed report on the outfit.',
  'Haven’t seen the statue. Somehow know every trait.',
  'Nearly scribbled the Star’s name on a supply crate.',
  'No statue here, so the story keeps changing.',
  'Even the robots are going to see the plaza statue.',
  'Saw the same hat by the gate a minute ago.',
  'More Star talk than construction talk tonight.',
  'Stopping by the fountain on the way back. This time.',
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

const EN_JUNGLE_GREET = [
  'That pig was staring at me.',
  'Cows are bigger up close.',
  'Do the sheep ever stop eating?',
  'Can’t help peeking over the fence.',
  'Wore camo. Kind of blend in here.',
  'Nice to walk on dirt for once.',
  'That sheep hasn’t moved in ages.',
  'Quiet night at the farm.',
]

const EN_JUNGLE_FLAVOR = [
  'The pig pen’s a little muddy.',
  'Lot of camo out here, right?',
  'Hope they let us feed them someday.',
  'Once a cow starts walking, I just watch.',
  'Didn’t expect a forest next to Culture.',
  'I kind of want to pet the sheep.',
]

const EN_MUSIC_ART_GREET = [
  'You hear that?',
  'Love this magenta floor.',
  'Paused by the stage.',
  'Did the screening start?',
  'Hard to take the headphones off.',
  'Walking to the beat.',
  'Feels calm here.',
  'Screen glow looks good.',
]

const EN_MUSIC_ART_FLAVOR = [
  'Curious about those halls under construction.',
  'Like sound and picture sharing one plaza.',
  'Past Culture, the air changes.',
  'Amber lights feel like a stage.',
  'Want a screening night here someday.',
  'Wave floor alone sets the mood.',
]

// ─── build ───────────────────────────────────────────────────────────

function buildPools(lang: Lang, zone: ParkZoneId): ParkDialoguePools {
  const isJa = lang === 'ja'
  const isMt = zone === 'mountain'
  const isCu = zone === 'culture'
  const isSea = zone === 'sea'
  const isAstro = zone === 'astro'
  const isMusicArt = zone === 'musicArt'
  const isJungle = zone === 'jungle'

  const greetings = isJungle
    ? isJa
      ? JA_JUNGLE_GREET
      : EN_JUNGLE_GREET
    : isMt
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
          : isMusicArt
            ? isJa
              ? JA_MUSIC_ART_GREET
              : EN_MUSIC_ART_GREET
            : isJa
              ? JA_PLAZA_GREET
              : EN_PLAZA_GREET

  const flavor = isJungle
    ? isJa
      ? JA_JUNGLE_FLAVOR
      : EN_JUNGLE_FLAVOR
    : isMt
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
          : isMusicArt
            ? isJa
              ? JA_MUSIC_ART_FLAVOR
              : EN_MUSIC_ART_FLAVOR
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

/** 開発用: プール全体の本数を数える */
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
