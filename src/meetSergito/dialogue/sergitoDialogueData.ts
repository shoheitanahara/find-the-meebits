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
  { ja: '入ってきた瞬間、目が止まったよ。', en: 'You stopped me the second you walked in.' },
  { ja: '砂、落としてからでいい。まず見せて。', en: 'You can shake the sand off later. Let me look first.' },
  { ja: '工房に似合う客が来た。', en: 'A guest who actually belongs in a workshop.' },
  { ja: '今日はいいものを持ってきたね。', en: 'You brought something good today.' },
  { ja: 'ちょっと近づいて。光の当たり方が違う。', en: 'Come a little closer. The light hits you differently.' },
  { ja: '待ってたわけじゃないけど、タイミングはいい。', en: 'I wasn’t waiting — but the timing’s good.' },
  { ja: '棚を見てた？ 本人のほうが面白いよ。', en: 'Looking at the shelves? The real one is more interesting.' },
  { ja: '作業の手、止まっちゃった。悪いね。', en: 'You just stopped my hands. Not complaining.' },
  { ja: 'その顔、今日の工房に必要だったかも。', en: 'That face might be exactly what this workshop needed today.' },
  { ja: 'どうぞ、靴のままでいい。見てるのは上だから。', en: 'Shoes on is fine. I’m looking at the top anyway.' },
]

export const SERGITO_CLOSINGS: LocalizedText[] = [
  { ja: 'また別のMeebitでも遊びに来てよ。', en: 'Come back with a different Meebit sometime.' },
  { ja: 'いいものを見せてもらったよ。', en: 'Appreciate you showing me.' },
  { ja: 'またいつでも寄って。', en: 'Drop by anytime.' },
  { ja: '工房はいつでも開けておくよ。', en: 'The workshop door stays open.' },
  { ja: '次に会う時は、また違って見えるかもね。', en: 'Next time you might look different again.' },
  { ja: 'こういう出会いがあるから、Meebitsは面白いんだ。', en: 'That’s what makes Meebits fun — moments like this.' },
  { ja: '出口の光、背中に当たるのもきれいだよ。', en: 'The light on your back at the door is nice too.' },
  { ja: '棚に並べたくなるけど、歩いてるほうがいい。', en: 'I’d put you on a shelf — but walking suits you better.' },
  { ja: '今日見たものは、忘れないよ。', en: 'I won’t forget what I saw today.' },
  { ja: '砂浜に戻っても、その組み合わせは残る。', en: 'Even back on the sand, that combo will stay with you.' },
  { ja: 'また来いよ。次は別の角度から見る。', en: 'Come again. Next time I’ll look from another angle.' },
  { ja: '作業に戻るよ。頭の中は君のほうに残ってるけど。', en: 'Back to work. My head’s still on you, though.' },
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
    { ja: 'その一枚、存在感があるな。', en: 'That piece has real presence.' },
    { ja: '派手だけど、ちゃんとまとまってる。', en: 'Bold, but it still works as a whole.' },
    { ja: '工房でも目立つ組み合わせだね。', en: 'Even in here, that combo stands out.' },
  ],
  head: [
    { ja: '頭まわり、かなり効いてるね。', en: 'The head area really works on you.' },
    { ja: '頭まわりのシルエットがいい。', en: 'Great silhouette around the head.' },
    { ja: '遠くからでもすぐ見つけられそうだ。', en: 'You’d spot that from across the room.' },
    { ja: '頭の形、Meebitらしくて好きだな。', en: 'That head shape feels very Meebit — I like it.' },
    { ja: '顔まわりとのバランスがいいね。', en: 'Nice balance with the face.' },
    { ja: 'その組み合わせは覚えやすい。', en: 'That combo sticks in your memory.' },
  ],
  face: [
    { ja: '顔まわりの印象が強くていいね。', en: 'Strong impression around the face — in a good way.' },
    { ja: '顔まわり、雰囲気が出てる。', en: 'The face area adds a lot of character.' },
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
    { ja: '棚のフィギュアより、歩いてるほうが似合う。', en: 'Looks better walking than sitting on a shelf.' },
    { ja: 'どこを見ても、同じMeebitに見える。それが強い。', en: 'Every angle still looks like the same Meebit. That’s strength.' },
    { ja: '工房の光、今日は君のほうに寄ってる。', en: 'The workshop light’s leaning toward you today.' },
  ],
}

export const SERGITO_TRAIT_SPECIFIC: Record<string, Record<string, LocalizedText[]>> = {
  Type: {
    Robot: [
      { ja: 'ロボットか。継ぎ目まで丁寧だね。工房向きだ。', en: 'A robot. Even the seams are careful. Workshop material.' },
      { ja: '金属の顔なのに、立ち方は柔らかい。', en: 'Metal face, but you stand softly.' },
      { ja: 'そのボディ、工具の隣に置きたくなる。', en: 'That body belongs next to the tools.' },
    ],
    Elephant: [
      { ja: '象タイプか。大きいのに、部屋を圧迫してない。', en: 'Elephant type. Big, but you don’t crowd the room.' },
      { ja: '耳のシルエット、横からが一番いい。', en: 'The ear silhouette is best from the side.' },
      { ja: '存在感があるのに、やさしい感じが残ってる。', en: 'Presence, with gentleness still in it.' },
    ],
    Skeleton: [
      { ja: 'スケルトンか。骨の線がきれいだ。飾りすぎないのがいい。', en: 'Skeleton. Clean bone lines. Good you didn’t overdress it.' },
      { ja: '隙間がある形なのに、ちゃんと人物に見える。', en: 'A shape full of gaps, and it still reads as a person.' },
      { ja: '工房の光が肋骨に当たると、彫刻みたいだ。', en: 'Workshop light on the ribs looks like sculpture.' },
    ],
    Pig: [
      { ja: '豚タイプか。愛嬌だけで終わらせてないのが偉い。', en: 'Pig type. Charm, but you didn’t stop there.' },
      { ja: '丸い輪郭に、服がうまく乗ってる。', en: 'Clothes sit well on that round silhouette.' },
      { ja: '珍しい形を、恥ずかしがらずに着こなしてる。', en: 'You wear an unusual form without shrinking from it.' },
    ],
    Visitor: [
      { ja: 'ビジターか。旅の途中で、工房に寄った顔だ。', en: 'Visitor type. Looks like you stopped in on the way somewhere.' },
      { ja: 'よそものの輪郭なのに、この部屋に馴染んでる。', en: 'An outsider’s outline, and it still fits this room.' },
      { ja: 'その顔、棚の誰とも被らない。それがいい。', en: 'That face doesn’t overlap anyone on the shelf. Good.' },
    ],
    Dissected: [
      { ja: 'ディセクテッドか。中まで見せる形だ。工房向きだよ。', en: 'Dissected. A form that shows the inside. Fits a workshop.' },
      { ja: '壊れてるんじゃなく、開いてる。見方が変わるね。', en: 'Not broken — opened. Changes how you look at it.' },
      { ja: '普通なら隠すところを、主役にしてる。大胆だ。', en: 'You made the usually-hidden part the star. Bold.' },
    ],
  },
  Hat: {
    'Backwards Cap': [
      { ja: 'キャップ後ろ向きか。顔を隠さず、頭の形だけ変えてる。', en: 'Cap backwards. Doesn’t hide the face — just changes the head.' },
      { ja: 'つばが後ろだと、工房の光が顔にそのまま当たる。いいね。', en: 'Brim in back, so the workshop light hits the face. Nice.' },
    ],
    Bandana: [
      { ja: 'バンダナか。小さい布なのに、顔の印象が変わる。', en: 'Bandana. Small cloth, big change to the face.' },
      { ja: '作業着みたいで、実はよそいき。その間が好きだ。', en: 'Looks like workwear, actually dressed up. I like that in-between.' },
    ],
    Brimmed: [
      { ja: 'つばのある帽子だ。影の切り方が、顔をうまく作ってる。', en: 'A brimmed hat. The shadow cuts the face just right.' },
      { ja: '工房より外向きの帽子。それでも似合ってる。', en: 'More outdoor than workshop. Still suits you.' },
    ],
    Cap: [
      { ja: 'キャップか。前に出したつばが、視線を作ってる。', en: 'Cap. That forward brim directs the gaze.' },
      { ja: '街の帽子を、工房に持ち込んだ。悪くない。', en: 'A street hat in a workshop. Not bad at all.' },
    ],
    Headphones: [
      { ja: 'ヘッドホンか。耳の位置が、頭の幅を決めてる。', en: 'Headphones. They set the width of the whole head.' },
      { ja: '音は聞こえないけど、聞いてる顔をしてる。', en: 'I can’t hear anything, but you look like you’re listening.' },
    ],
    'Snoutz Cap': [
      { ja: 'Snoutzのキャップか。ロゴが顔の上で、ちゃんと主張してる。', en: 'Snoutz cap. The logo’s doing real work up there.' },
      { ja: '遊びの帽子なのに、輪郭は締まってる。', en: 'A playful hat, and the silhouette still tightens.' },
    ],
    'Trucker Cap': [
      { ja: 'トラッカーキャップか。網の後ろが、軽さを出してる。', en: 'Trucker cap. The mesh in back keeps it light.' },
      { ja: '作業場に似合う帽子だ。ここ、気に入った？', en: 'A hat that belongs in a shop. You like it here?' },
    ],
    'Wool Hat': [
      { ja: 'ウールハットか。柔らかいのに、頭の形がぼやけない。', en: 'Wool hat. Soft, but the head shape stays clear.' },
      { ja: '冬の帽子を、海の近くまで持ってきた。味がある。', en: 'A winter hat, brought all the way to the sea. Flavor.' },
    ],
  },
  'Hair Style': {
    Bald: [
      { ja: '坊主頭か。隠さない選択だね。顔が全部仕事してる。', en: 'Bald hair. A choice not to hide. The face does all the work.' },
      { ja: '髪がないと、顔の仕事が増える。今日はそれが生きてる。', en: 'No hair, so the face does more work. Today that lands.' },
    ],
    'Big Bangs': [
      { ja: '前髪が厚い。目の上に、もう一枚カーテンがある。', en: 'Heavy bangs. Another curtain over the eyes.' },
      { ja: '隠してるのに、かえって顔が気になる。うまい。', en: 'Hiding the face makes me want to look more. Well done.' },
    ],
    Bob: [
      { ja: 'ボブヘアか。顎の線で、きれいに止まってる。', en: 'Bob hair. It stops cleanly at the jaw.' },
      { ja: '短すぎず長すぎず。顔の枠としてちょうどいい。', en: 'Not too short, not too long. A good frame for the face.' },
    ],
    Bun: [
      { ja: 'お団子か。まとめてるのに、堅くない。', en: 'A bun. Gathered, but not stiff.' },
      { ja: '後頭部の丸が、横顔をきれいにする。', en: 'That round at the back cleans up the profile.' },
    ],
    Buzzcut: [
      { ja: 'バズカットか。頭の形が、そのまま出てる。正直だね。', en: 'Buzzcut. The head shape shows as-is. Honest.' },
      { ja: '短い髪は、服の主張を邪魔しない。わかってる。', en: 'Short hair doesn’t fight the clothes. You know.' },
    ],
    Curly: [
      { ja: '巻き髪か。線が一本じゃないのが、見てて飽きない。', en: 'Curly. Not a single line — that’s why it doesn’t get old.' },
      { ja: '柔らかい髪に、しっかりした服。対照がいい。', en: 'Soft hair, solid clothes. Nice contrast.' },
    ],
    Fade: [
      { ja: 'フェードの髪か。耳のまわりが、きれいに抜けてる。', en: 'Fade hair. Clean around the ears.' },
      { ja: '切り方に段があるのに、うるさくない。上手だ。', en: 'There’s a gradient in the cut, without noise. Skilled.' },
    ],
    'Fiery Mohawk': [
      { ja: 'ファイヤーモヒカンか。頭の上から、今日の空気を切ってる。', en: 'Fiery mohawk. It cuts the air from the top of the head.' },
      { ja: '炎みたいなのに、顔は落ち着いてる。その差がいい。', en: 'Looks like fire, face stays calm. That gap works.' },
    ],
    'Half-shaved': [
      { ja: 'ハーフシェイブか。左右で話が違う。振り返ると残るよ。', en: 'Half-shaved. A different story on each side. It lingers when you turn.' },
      { ja: '片方だけ見せる髪。工房の光、片側に寄るね。', en: 'Hair that shows one side. The light leans that way too.' },
    ],
    'High Flat Top': [
      { ja: 'フラットトップか。頭の上に、水平がある。建築みたいだ。', en: 'Flat top. A level line on the head. Almost architecture.' },
      { ja: '四角い髪なのに、顔が負けてない。', en: 'Square hair, and the face still holds.' },
    ],
    Long: [
      { ja: '長い髪だ。動きそうで、止まってる。その感じがきれい。', en: 'Long hair. Looks like it could move, and it doesn’t. Nice tension.' },
      { ja: '肩までの線が、服の襟と会話してる。', en: 'The line to the shoulders is talking to the collar.' },
    ],
    Messy: [
      { ja: 'メッシーな髪か。整えてないのに、偶然じゃなさそうだ。', en: 'Messy hair. Uncombed, but it doesn’t look accidental.' },
      { ja: '寝癖みたいで、実は構図。わかってるね。', en: 'Looks like bed hair. It’s actually composition. You know.' },
    ],
    Mohawk: [
      { ja: 'モヒカンか。尖り方が、今日の空気を切ってる。', en: 'Mohawk. That edge cuts today’s air.' },
      { ja: '頭の上から個性が溢れてる。下まで届いてるよ。', en: 'Personality from the top. It reaches all the way down.' },
    ],
    'One Side': [
      { ja: 'ワンサイドか。流した方向に、顔の重心がある。', en: 'One side. The face’s weight follows the sweep.' },
      { ja: '左右非対称なのに、安定して見える。うまい。', en: 'Asymmetric, and it still looks stable. Well done.' },
    ],
    Pigtails: [
      { ja: 'ツインテールか。左右に分かれて、頭が軽く見える。', en: 'Pigtails. Split left and right, the head looks lighter.' },
      { ja: '遊びの髪を、本気の顔でやってる。それがいい。', en: 'Playful hair on a serious face. That’s the move.' },
    ],
    Ponytail: [
      { ja: 'ポニーテールか。後ろ姿まで考えてる。', en: 'Ponytail. You thought about the back, too.' },
      { ja: '束ねると、輪郭が大人になるね。', en: 'Tied back, the silhouette grows up.' },
    ],
    'Pulled Back': [
      { ja: 'オールバックか。顔を全部出してる。自信があるね。', en: 'Pulled back. The whole face is out. That’s confidence.' },
      { ja: '隠す髪じゃない。見せる髪だ。', en: 'Not hair that hides. Hair that shows.' },
    ],
    Simple: [
      { ja: 'Simpleの髪か。何も足してないように見えて、足りてる。', en: 'Simple Hair. Looks like nothing was added. It’s enough.' },
      { ja: '主張しない髪のとき、服と顔がよく見える。今日はそれが生きてる。', en: 'Quiet hair lets the clothes and face speak. Today that works.' },
    ],
    Spiky: [
      { ja: 'スパイキーな髪か。怒ってる形なのに、楽しそうだ。', en: 'Spiky hair. An angry shape that still looks like fun.' },
      { ja: '刺さりそうで刺さらない。距離感がうまい。', en: 'Looks like it could poke. It doesn’t. Good distance.' },
    ],
    Straight: [
      { ja: 'ストレートの髪か。線がきれいだ。顔の横がすっきりしてる。', en: 'Straight hair. Clean lines. The sides of the face stay clear.' },
      { ja: '整ってるのに、堅くない。その按配がいい。', en: 'Neat, but not stiff. Nice judgment.' },
    ],
    'Very Long': [
      { ja: 'かなり長い。歩くたびに、後ろが残るタイプだ。', en: 'Very long. The kind that lingers behind you as you walk.' },
      { ja: '長い髪が、服の色を下まで運んでる。', en: 'The long hair carries the clothes’ color all the way down.' },
    ],
    Wild: [
      { ja: 'ワイルドな髪だ。整えない選択が、ちゃんと選択になってる。', en: 'Wild hair. Choosing not to tame it is still a choice.' },
      { ja: '頭の上だけ、風が残ってるみたいだ。', en: 'Looks like the wind stayed on top of the head.' },
    ],
  },
  Glasses: {
    '3D': [
      { ja: '3Dメガネか。映画の途中で工房に来たみたいだ。', en: '3D glasses. Like you walked in mid-movie.' },
      { ja: '遊び心があるのに、顔が子どもにならない。', en: 'Playful, without making the face childish.' },
    ],
    Aviators: [
      { ja: 'アビエーターか。目の上に、薄い影を乗せてる。', en: 'Aviators. A thin shadow sitting over the eyes.' },
      { ja: '空向きのメガネを、室内でかけてる。計算なら成功だ。', en: 'Sky glasses, worn indoors. If that’s a plan, it worked.' },
    ],
    Elvis: [
      { ja: 'Elvisのメガネか。太枠が、顔のリズムを変えてる。', en: 'Elvis glasses. Thick frames change the rhythm of the face.' },
      { ja: '舞台の顔を、工房に持ってきた。対照がおもしろい。', en: 'A stage face, brought into the workshop. Fun contrast.' },
    ],
    Frameless: [
      { ja: '縁なしメガネか。あるのに、ないみたいだ。それが上品だ。', en: 'Frameless. There, but almost not. That’s the elegance.' },
      { ja: '顔を邪魔しない。近い距離で見ると、ちゃんと光る。', en: 'Doesn’t get in the way. Up close, it still catches light.' },
    ],
    Nerdy: [
      { ja: 'ナーディーなメガネだ。知的に見せつつ、真面目すぎない。', en: 'Nerdy glasses. Smart, without going too serious.' },
      { ja: '顔に枠を付けた。写真向きだよ。', en: 'A frame on the face. Photogenic.' },
    ],
    'Round Glasses': [
      { ja: '丸メガネか。顔の角を、優しくしてる。', en: 'Round glasses. They soften the corners of the face.' },
      { ja: '丸い枠なのに、弱い感じがしない。いい按配だ。', en: 'Round frames, but not soft. Nice mix.' },
    ],
    Specs: [
      { ja: 'スペックスか。細い枠が、目の位置をはっきりさせる。', en: 'Specs. Thin frames that pin down the eyes.' },
      { ja: '小さな道具なのに、顔の完成度が上がる。', en: 'A small tool, and the face feels more finished.' },
    ],
    Sunglasses: [
      { ja: 'サングラスか。目を隠して、かえって印象が強い。', en: 'Sunglasses. Hide the eyes, and the impression gets stronger.' },
      { ja: '室内でかけてる。それが計算なら、成功してる。', en: 'Indoors. If that’s calculated, it worked.' },
    ],
  },
  Shirt: {
    Hoodie: [
      { ja: 'フーディか。楽な服を、だらしないままにしてない。', en: 'Hoodie. Easy clothes that still aren’t sloppy.' },
      { ja: 'フードが顔に被さりすぎてない。偉い。', en: 'The hood doesn’t crowd the face. Respect.' },
    ],
    'Hoodie Up': [
      { ja: 'フードを上げてる。顔の枠が、もう一枚増えた。', en: 'Hood up. Another frame around the face.' },
      { ja: '隠してるのに、前に出てる。その感じがいい。', en: 'Covered, and still coming forward. I like that.' },
    ],
    'Heart Hoodie': [
      { ja: 'ハートのフーディか。甘い柄を、甘く着てない。', en: 'Heart hoodie. A sweet print, not worn sweetly.' },
      { ja: '胸のマークが、顔より先に目に入る。計算だね。', en: 'The chest mark hits before the face. That’s a plan.' },
    ],
    'Oversized Hoodie': [
      { ja: 'オーバーサイズか。大きい服に、輪郭が負けてない。', en: 'Oversized. Big clothes, and the silhouette still holds.' },
      { ja: '余白のある服だ。工房の光が、ひだに入る。', en: 'Clothes with leftover space. Light falls into the folds.' },
    ],
    'Snoutz Hoodie': [
      { ja: 'Snoutzのフーディか。ロゴが、胸でちゃんと仕事してる。', en: 'Snoutz hoodie. The logo’s doing real work on the chest.' },
    ],
    'Stylized Hoodie': [
      { ja: '柄入りフーディか。楽な形に、絵を乗せた。バランスいい。', en: 'Stylized hoodie. A picture on an easy shape. Good balance.' },
    ],
    Tee: [
      { ja: 'Tシャツか。シンプルなのに、色で勝ってる。', en: 'T-shirt. Simple, winning on color.' },
      { ja: '何も足してないように見えて、足りてる。', en: 'Looks like nothing was added. It’s enough.' },
    ],
    'Skull Tee': [
      { ja: 'スカルのTシャツか。怖い絵を、日常の服にしてる。', en: 'Skull tee. A scary picture, worn like everyday clothes.' },
    ],
    'Ghost Tee': [
      { ja: 'ゴーストのTか。工房に幽霊が来た。歓迎するよ。', en: 'Ghost tee. A ghost walked into the shop. Welcome.' },
    ],
    'Heart Tee': [
      { ja: 'ハートのTか。胸のマークが、顔の印象を柔らかくしてる。', en: 'Heart tee. The chest mark softens the face.' },
    ],
    'Logo Tee': [
      { ja: 'ロゴTか。文字が胸にあると、立ち方が少し変わる。', en: 'Logo tee. Letters on the chest change how you stand, a little.' },
    ],
    'Diagonal Tee': [
      { ja: '斜めのTか。模様が、体の向きを作ってる。', en: 'Diagonal tee. The pattern sets the body’s direction.' },
    ],
    'Tie-dyed Tee': [
      { ja: 'タイダイか。偶然の模様を、ちゃんと着こなしてる。', en: 'Tie-dye. An accidental pattern, worn on purpose.' },
    ],
    'Flamingo Tee': [
      { ja: 'フラミンゴのTか。海のほうの鳥を、工房に連れてきた。', en: 'Flamingo tee. You brought a sea bird into the shop.' },
    ],
    'Punk Tee': [
      { ja: 'パンクTか。怒りの絵なのに、立ち方は落ち着いてる。', en: 'Punk tee. An angry picture, a calm stance.' },
    ],
    'Invader Tee': [
      { ja: 'インベーダーのTか。古いゲームを、今の胸に乗せてる。', en: 'Invader tee. An old game, sitting on a present chest.' },
    ],
    'Meepet Tee': [
      { ja: 'MeepetのTか。胸のキャラが、顔と会話してる。', en: 'Meepet tee. The chest character is talking to the face.' },
    ],
    'Snoutz Tee': [
      { ja: 'SnoutzのTか。ロゴが一枚で、十分主張してる。', en: 'Snoutz tee. One logo, enough statement.' },
    ],
    'Snoutz Skull Tee': [
      { ja: 'スカルにSnoutzか。二つの絵が、喧嘩してない。うまい。', en: 'Skull plus Snoutz. Two pictures, no fight. Well done.' },
    ],
    Jersey: [
      { ja: 'ジャージか。運動の服を、歩く服にした。軽さがいい。', en: 'Jersey. Sportswear, used for walking. I like the lightness.' },
      { ja: '番号やラインが、胸の構図になってる。', en: 'Numbers and lines become composition on the chest.' },
    ],
    'Basketball Jersey': [
      { ja: 'バスケのジャージか。腕を見せる選択だね。', en: 'Basketball jersey. A choice to show the arms.' },
    ],
    'Classic Jersey': [
      { ja: 'クラシックジャージか。古いスポーツの顔をしてる。', en: 'Classic jersey. Wearing an older sport’s face.' },
    ],
    'Snoutz Jersey': [
      { ja: 'Snoutzのジャージか。遊びと運動が、一枚に乗ってる。', en: 'Snoutz jersey. Play and sport on one layer.' },
    ],
    Suit: [
      { ja: 'スーツか。工房にフォーマルが来た。床が緊張してる。', en: 'A suit. Formal just walked into the shop. The floor’s nervous.' },
      { ja: '着崩してない。ちゃんとスーツとして立ってる。', en: 'Not rumpled. It stands as a real suit.' },
    ],
    'Suit Jacket': [
      { ja: 'スーツジャケットか。一枚はおるだけで、全体が締まる。', en: 'Suit jacket. One layer, and the whole look tightens.' },
    ],
    Hawaiian: [
      { ja: 'ハワイアンか。海の柄を、木の工房に持ち込んだ。映える。', en: 'Hawaiian. Sea print in a wood shop. It pops.' },
      { ja: '休暇のシャツなのに、姿勢は仕事してる。', en: 'A vacation shirt, and the posture is still working.' },
    ],
    'Bare Chest': [
      { ja: '裸の胸か。服を着ない選択だ。輪郭が全部出てる。', en: 'Bare chest. A choice to skip the shirt. The whole outline is out.' },
      { ja: '隠さない分、足元と輪郭がよく見える。', en: 'With nothing to hide, the outline and the feet show clearly.' },
    ],
    'No Shirt': [
      { ja: 'シャツなし。上を空けて、下と頭で勝負してる。', en: 'No shirt. Empty on top, competing with the rest.' },
    ],
    'Halter Top': [
      { ja: 'ホルターか。肩と首の線が、主役になってる。', en: 'Halter. Shoulder and neck lines take the lead.' },
    ],
    'Tube Top': [
      { ja: 'チューブトップか。短い面なのに、胸の色が強い。', en: 'Tube top. A short plane, and the chest color still hits.' },
    ],
    Windbreaker: [
      { ja: 'ウィンドブレーカーか。薄手なのに、輪郭がはっきりしてる。', en: 'Windbreaker. Thin, but the outline stays sharp.' },
    ],
    'CGA Shirt': [
      { ja: 'CGAシャツか。古い画面の色を、体に着てる。工房向きだ。', en: 'CGA shirt. Old-screen colors, worn on the body. Fits this shop.' },
    ],
    'Glyph Shirt': [
      { ja: 'グリフのシャツか。記号が胸にある。読んでしまうね。', en: 'Glyph shirt. Symbols on the chest. I start reading them.' },
    ],
    Lines: [
      { ja: 'ラインのシャツか。縞が、体の向きを決めてる。', en: 'Lined shirt. The stripes set the body’s direction.' },
    ],
    'Long-sleeved': [
      { ja: '長袖か。腕まで覆って、全体が落ち着いて見える。', en: 'Long sleeves. Covered arms, and the whole look calms down.' },
    ],
  },
  Overshirt: {
    'Athletic Jacket': [
      { ja: 'アスレチックジャケットか。動きそうな服を、立って着てる。', en: 'Athletic jacket. Clothes made to move, worn standing still.' },
      { ja: '一枚はおるだけで、全体が締まる。', en: 'One layer, and the whole look tightens.' },
    ],
    'Collar Shirt': [
      { ja: '襟付きか。首まわりが、顔を受け止めてる。', en: 'Collar shirt. The neckline catches the face.' },
      { ja: 'きちんと見えるのに、堅くない。いい按配だ。', en: 'Looks put-together, without going stiff. Nice mix.' },
    ],
    'Jean Jacket': [
      { ja: 'ジージャンか。青の面が、上の色を受け止めてる。', en: 'Jean jacket. That blue field catches the colors above.' },
      { ja: '普通の羽織りを、普通に見せてない。', en: 'An ordinary layer that doesn’t look ordinary.' },
    ],
    'Leather Jacket': [
      { ja: 'レザージャケットか。光の当たり方が、布と違う。', en: 'Leather jacket. Light hits it differently than cloth.' },
      { ja: '硬い素材なのに、肩の落ち方が自然だ。', en: 'Hard material, natural fall at the shoulders.' },
    ],
    Trenchcoat: [
      { ja: 'トレンチか。長い面が、歩くたびに線を作る。', en: 'Trenchcoat. A long plane that draws a line as you walk.' },
      { ja: '室内で着てる。脱ぐつもりがないなら、それがスタイルだ。', en: 'Worn indoors. If you’re not taking it off, that’s the style.' },
    ],
  },
  Pants: {
    'Athletic Shorts': [
      { ja: '短パンか。海から来たのが、足元でわかる。', en: 'Shorts. You can tell you came from the sea by the legs.' },
      { ja: '短い分、靴がよく目立つ。今日はそれが生きてる。', en: 'Shorter pants, so the shoes stand out. Today that works.' },
    ],
    'Cargo Pants': [
      { ja: 'カーゴパンツか。ポケットが多い。旅の途中みたいだ。', en: 'Cargo pants. Lots of pockets. Looks mid-trip.' },
      { ja: '作業着っぽい下に、上は別の話。その差がおもしろい。', en: 'Workwear below, a different story above. Fun gap.' },
    ],
    Leggings: [
      { ja: 'レギンスか。脚の線が、そのまま出てる。', en: 'Leggings. The leg line shows as-is.' },
      { ja: '薄い下なのに、全体のバランスは崩れてない。', en: 'Thin below, and the whole balance still holds.' },
    ],
    'Short Leggings': [
      { ja: '短いレギンスか。膝で止まって、靴がよく見える。', en: 'Short leggings. They stop at the knee, so the shoes show.' },
    ],
    'Regular Pants': [
      { ja: '普通のパンツ。普通に見せないのが、今日のポイントだ。', en: 'Regular pants. Not looking regular is today’s point.' },
      { ja: '下を静かにして、上を主役にしてる。わかってるね。', en: 'Quiet below, star above. You know.' },
    ],
    'Ripped Jeans': [
      { ja: '破れたジーンズか。欠けたところまで、計算に入れてる。', en: 'Ripped jeans. Even the gaps look planned.' },
      { ja: '青い面に穴がある。工房の光が、そこから脚に当たる。', en: 'Holes in the blue. Light hits the legs through them.' },
    ],
    Skirt: [
      { ja: 'スカートか。下の形が、歩くたびに変わる。', en: 'Skirt. The shape below changes as you walk.' },
      { ja: '脚の見せ方が、顔と同じくらい主張してる。', en: 'How you show the legs speaks as loud as the face.' },
    ],
    'Suit Pants': [
      { ja: 'スラックスか。裾まで気が届いてる。', en: 'Suit pants. Attention all the way to the hem.' },
      { ja: '下だけフォーマル。上との温度差が、味になってる。', en: 'Formal only below. The temperature gap with the top is the flavor.' },
    ],
    Trackpants: [
      { ja: 'トラックパンツか。楽な下を、だらしないままにしてない。', en: 'Trackpants. Easy below, still not sloppy.' },
    ],
  },
  Shoes: {
    Sneakers: [
      { ja: 'スニーカーか。最後に遊びを残してる。正しい。', en: 'Sneakers. You left some play at the end. Correct.' },
      { ja: '足元が軽いと、全体まで軽く見える。連動してるね。', en: 'Light feet make the whole look lighter too. It’s connected.' },
    ],
    'Neon Sneakers': [
      { ja: 'ネオンのスニーカーか。床のほうから、先に目が行く。', en: 'Neon sneakers. The eye goes to the floor first.' },
    ],
    'High Boots': [
      { ja: 'ハイブーツか。工房の床に、ちゃんと音がしそうだ。', en: 'High boots. They’d make a real sound on this floor.' },
      { ja: '重い靴なのに、立ち方が沈んでない。', en: 'Heavy shoes, and you still stand up, not down.' },
    ],
    Workboots: [
      { ja: 'ワークブーツか。この部屋に、一番似合う靴だ。', en: 'Workboots. The shoes that fit this room best.' },
      { ja: '客の靴なのに、職人の足元をしてる。歓迎するよ。', en: 'A guest’s shoes, with a maker’s stance. Welcome.' },
    ],
    'Urban Boots': [
      { ja: 'アーバンブーツか。街の靴を、砂のあとに履いてきた。', en: 'Urban boots. City shoes, after the sand.' },
    ],
    Sandals: [
      { ja: 'サンダルか。シーエリアの名残だ。隠してないのがいい。', en: 'Sandals. A leftover from the sea. Good you didn’t hide it.' },
    ],
    Slides: [
      { ja: 'スライドか。脱ぎやすい靴で、工房まで来た。気楽でいい。', en: 'Slides. Easy-off shoes, all the way to the shop. That’s fine.' },
    ],
    Canvas: [
      { ja: 'キャンバスの靴か。布の足元が、服の話を続けてる。', en: 'Canvas shoes. Cloth at the feet keeps the clothes’ story going.' },
    ],
    Basketball: [
      { ja: 'バスケシューズか。コートの靴で、木の床に立ってる。', en: 'Basketball shoes. Court shoes on a wood floor.' },
    ],
    Classic: [
      { ja: 'クラシックな靴だ。古い形なのに、今の服に乗ってる。', en: 'Classic shoes. An old shape, sitting on today’s clothes.' },
    ],
    'High Tops': [
      { ja: 'ハイカットか。足首まで覆って、脚の終わりがはっきりする。', en: 'High tops. Covered ankles, a clear end to the legs.' },
    ],
    Running: [
      { ja: 'ランニングシューズか。走る靴で、立ち止まってる。対照がいい。', en: 'Running shoes. Built to run, standing still. Nice contrast.' },
    ],
    Skater: [
      { ja: 'スケーターシューズか。厚い底が、立ち方を少し上げてる。', en: 'Skater shoes. Thick soles lift the stance a little.' },
    ],
    LL: [
      { ja: 'LLの靴か。足元だけ、別の世界を履いてる。', en: 'LL shoes. A different world, just at the feet.' },
      { ja: '変な形の靴なのに、地面との関係はちゃんとしてる。', en: 'Strange shape, and still a real relationship with the ground.' },
    ],
  },
  Beard: {
    Big: [
      { ja: '髭が大きい。顔の下側まで、キャラクターがある。', en: 'A big beard. Character all the way under the face.' },
    ],
    Full: [
      { ja: '髭がしっかりしてる。顎の輪郭が、服まで続いてる。', en: 'A full beard. The jaw line continues into the clothes.' },
    ],
    Stubble: [
      { ja: '無精髭か。作り込みすぎてない。その隙間がいい。', en: 'Stubble beard. Not overworked. That gap is good.' },
    ],
    Mustache: [
      { ja: '口ひげか。鼻の下が、顔のアクセントになってる。', en: 'Mustache. Under the nose, it becomes the face’s accent.' },
    ],
    'Biker Mustache': [
      { ja: 'バイカーの口ひげか。古い顔を、今の服に乗せてる。', en: 'Biker mustache. An old face on today’s clothes.' },
    ],
    Muttonchops: [
      { ja: 'マトンチョップか。頬の横まで髭がある。横顔が強い。', en: 'Muttonchops. Beard out to the cheeks. Strong profile.' },
    ],
    'Medical Mask': [
      { ja: 'マスクか。下半分を隠して、目が主役になる。', en: 'A mask. Hide the lower half, and the eyes take over.' },
    ],
  },
  Earring: {
    'Gold Earring': [
      { ja: '金のピアスか。点ひとつで、耳の存在を思い出させる。', en: 'A gold earring. One dot, and you remember the ear is there.' },
    ],
    'Gold Earrings': [
      { ja: '両耳に金か。左右対称なのに、顔が堅くならない。', en: 'Gold on both ears. Symmetric, without making the face stiff.' },
    ],
    'Gold Hoops': [
      { ja: '金のフープか。小さい円が、顔の横で光ってる。', en: 'Gold hoops. Small circles catching light beside the face.' },
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
    { ja: '鏡を置いた覚えはないんだけど。', en: 'I don’t remember putting up a mirror.' },
    { ja: 'まあ、黙っておいたほうが面白そうだ。', en: 'Maybe more fun if I keep quiet about it.' },
  ],
  [
    { ja: 'その顔、どこかで見たことがあるな。', en: 'That face looks familiar.' },
    { ja: '毎朝、工具の反射で見てる顔だ。', en: 'I see it every morning in the tools.' },
    { ja: '今日は工房、半分任せてもいい？', en: 'Mind taking half the workshop today?' },
  ],
  [
    { ja: '自分に話しかけるのは、初めてじゃない。', en: 'Not the first time I’ve talked to myself.' },
    { ja: 'でも、返事が来るのは初めてだ。', en: 'First time I got an answer, though.' },
    { ja: '棚の自分より、歩いてる自分のほうが好きだよ。', en: 'I like the walking one better than the one on the shelf.' },
  ],
  [
    { ja: '17600。番号まで同じだと、笑ってしまうね。', en: '17600. Same number, and I have to laugh.' },
    { ja: 'どっちが客で、どっちが主か。', en: 'Which one’s the guest, which one’s the host?' },
    { ja: '今日は、客のほうを褒めとくよ。', en: 'Today I’ll compliment the guest.' },
  ],
]

export const SERGITO_FALLBACK_DIALOGUES: LocalizedText[][] = [
  [
    { ja: 'いいMeebitだね。', en: 'That’s a good Meebit.' },
    { ja: '近くで見ると、そのMeebitだけの空気がある。', en: 'Up close, it has an air that’s all its own.' },
    { ja: '来てくれてありがとう。', en: 'Thanks for coming by.' },
  ],
  [
    { ja: 'お、見せに来てくれたんだね。', en: 'Oh, you came to show me.' },
    { ja: '20,000体いても、同じようには見えない。それが面白い。', en: 'Even with 20,000, none look quite the same. That’s the fun.' },
    { ja: 'また寄ってよ。', en: 'Come back anytime.' },
  ],
  [
    { ja: '細部まで、ちゃんと選ばれてる感じがする。', en: 'It feels chosen, right down to the details.' },
    { ja: '棚に置くより、歩いてるほうが似合うタイプだ。', en: 'The walking kind, more than the shelf kind.' },
    { ja: '工房の光、君に合ってるよ。', en: 'The workshop light suits you.' },
  ],
  [
    { ja: '第一印象が強い。二度目で、もっと好きになる。', en: 'Strong first impression. Better on the second look.' },
    { ja: 'どこを切り取っても、同じMeebitに見える。一貫してる。', en: 'Any crop still looks like the same Meebit. Consistent.' },
    { ja: 'また別の角度で見せに来いよ。', en: 'Come show me another angle sometime.' },
  ],
  [
    { ja: '言葉にする前に、形が先に来るタイプだね。', en: 'The kind where the shape arrives before the words.' },
    { ja: '説明はいらない。見てればわかる。', en: 'No explanation needed. Looking is enough.' },
    { ja: '今日はこれで十分だ。ありがとう。', en: 'That’s enough for today. Thank you.' },
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
