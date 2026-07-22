/**
 * Meebits Park 来場者のセリフプール（EN / JA）。
 * 挨拶・ゲーム紹介・本日の主役／共通点への言及を混ぜる（言語あたり約100本）。
 */

export type ParkDialoguePools = {
  greetings: string[]
  gameFind: string[]
  gameTraits: string[]
  gameStreet: string[]
  featuredAny: string[]
  featuredMatched: string[]
  themeAny: string[]
  themeMatched: string[]
  parkFlavor: string[]
}

export const PARK_DIALOGUE_EN: ParkDialoguePools = {
  greetings: [
    'Hey there! Nice night for a stroll in the Park.',
    'Welcome! The lights look great tonight.',
    'Oh, hello! Fancy bumping into you here.',
    'Yo! Taking a break between attractions?',
    'Hi! Don’t be shy — everyone’s friendly tonight.',
    'Evening! Got a favorite attraction yet?',
    'Hey traveler. The Park’s buzzing tonight.',
    'Hello! Fresh air and Meebits — perfect combo.',
    'Sup! You look ready for a little adventure.',
    'Hi friend! Stick around — something’s always happening.',
    'Good to see you! The fountain’s glowing tonight.',
    'Hey! Watch your step near the benches.',
    'Welcome back… or is this your first loop?',
    'Oh hey! I was just people-watching.',
    'Greetings! Nights like this feel special.',
  ],
  gameFind: [
    'Find the Meebit is over that way — hunt them down in the Museum!',
    'If you like searching crowds, try Find the Meebit.',
    'The Museum attraction is wild. So many faces… one target.',
    'Museum tip: talk to folks. Sometimes they drop hints.',
    'Find the Meebit gets intense on later stages. Bring focus!',
    'Lost in a sea of Meebits? That’s the Museum vibe.',
    'The Museum unlocks After Hours if you clear it. Worth it.',
    'I love Find the Meebit — like hide-and-seek with style.',
    'Clock’s ticking in the Museum. Don’t freeze up!',
    'Wrong Meebit? Keep walking. The right one is somewhere.',
    'Museum crowds look similar… until you really look.',
    'If you beat the Museum, the Club night awaits.',
  ],
  gameTraits: [
    'Trait Hunt is fun — match the clue and spot the lookalikes!',
    'Hair, clothes, accessories… Trait Hunt is all about the details.',
    'Feeling stylish? Trait Hunt’s gallery is calling.',
    'Trait Hunt rewards sharp eyes more than speed.',
    'Same shirt color? Same glasses? Trait Hunt will test you.',
    'I failed Trait Hunt once by ignoring the tiny earrings. Oops.',
    'Trait Hunt is like fashion bingo with Meebits.',
    'Check the clue carefully — one trait can change everything.',
    'Gallery lighting helps… if you know what you’re hunting.',
    'Trait Hunt’s short loops are perfect between longer games.',
    'Matching traits feels oddly satisfying. You’ll see.',
    'If you love outfits, Trait Hunt is your playground.',
  ],
  gameStreet: [
    '8th Street gets weird after dark. Notice what changed!',
    'The repeating alley on 8th Street still gives me chills.',
    'If you like spot-the-difference, walk into 8th Street.',
    '8th Street loops — blink and you miss the anomaly.',
    'Warm lamps, cold twists. That’s 8th Street.',
    'I swear the alley rearranged itself last time.',
    'First-person on 8th Street hits different at night.',
    'Watch the walkers carefully. One of them isn’t right.',
    '8th Street is short… unless you keep missing the change.',
    'Turn the corner. Look twice. Trust your gut.',
    'The white fade means the street is resetting. Stay sharp.',
    '8th Street rewards patience more than sprinting.',
  ],
  featuredAny: [
    'Did you see today’s star by the fountain? Gorgeous statue.',
    'Today’s featured Meebit is on the fountain pedestal — go look!',
    'There’s a copper statue of today’s star in the plaza. Hard to miss.',
    'The fountain Meebit changes every day. Today’s look is fire.',
    'I took a selfie with the copper statue. No shame.',
    'Today’s star has presence — even as metal.',
    'Check the board next to the fountain for the star’s traits.',
    'Half the crowd vibes with today’s star. Can you tell who?',
    'The Park crowns a new star every morning (JST).',
    'If you’re hunting lookalikes, start at the fountain.',
  ],
  featuredMatched: [
    'I’m one of today’s star guests — same vibe as the fountain statue!',
    'Look close… I match today’s featured look. Can you tell?',
    'Yep — I’m part of the star’s crew tonight. Seek me among the crowd!',
    'Statue twinsies! Well… almost. I’m the walking version.',
    'Today’s star and I share the spotlight. Nice, right?',
    'If the copper Meebit winked, that’d be me in spirit.',
    'I’m not the statue — but I’m in tonight’s featured circle.',
    'Find the other star guests. We’re scattered on purpose.',
    'Same energy as the fountain idol. That’s intentional.',
    'Being on the star team today feels kinda fancy.',
  ],
  themeAny: [
    'Check the board by the fountain — “Today’s Link” is the clue.',
    'Today’s shared trait is posted on that little sign. Handy!',
    'The Park picked a theme trait for today. Half the crowd shares it.',
    'Today’s Link ties fifteen of us together. Can you spot them?',
    'Read the board first — then scan the crowd for matches.',
    'One trait. Many Meebits. That’s the daily link game.',
    'The sign by the fountain isn’t decoration — it’s a hint.',
    'Today’s theme makes the Park feel like a matching party.',
    'If two Meebits look related, check today’s link.',
    'The daily trait changes with the date. Fresh hunt every day.',
  ],
  themeMatched: [
    'We share today’s link trait. Spot the others who match!',
    'Same theme trait as the star — that’s why I’m hanging here.',
    'Today’s link brought us together. Look for more like me!',
    'I’m wearing today’s theme loud and proud.',
    'If you found me, you’re getting the hang of today’s link.',
    'Fifteen of us carry the same trait tonight. Counting is fun.',
    'Match me, then match the board. You’re on a roll.',
    'Today’s link isn’t random — I was chosen for it.',
    'Shared trait club, reporting in. Where are my twins?',
    'The board said it, and I prove it. That’s today’s link.',
  ],
  parkFlavor: [
    'Three attractions, one Park. Pick a door and dive in.',
    'I love nights like this — ocean breeze and Meebits everywhere.',
    'If you get lost, follow the golden path back to the fountain.',
    'The lamps hum softly. Very cozy for a theme park.',
    'Benches look comfy… until you sit and an NPC stares.',
    'I keep circling the fountain. Habit, I guess.',
    'Park tip: talk to everyone. We gossip helpfully.',
    'Some guests are theme-matched. Some are just vibing.',
    'Back to Top anytime from the games. We’ll still be here.',
    'The ocean outside the island looks endless tonight.',
    'Classic night-park energy. Club vibes without the queue.',
    'Don’t rush all three attractions — savor the plaza too.',
  ],
}

export const PARK_DIALOGUE_JA: ParkDialoguePools = {
  greetings: [
    'やあ！パークの夜散歩、いいね。',
    'ようこそ！今夜のライト、きれいでしょう？',
    'おっ、こんにちは！ここで会うなんて奇遇だね。',
    'よっ！アトラクションの合間に休憩中？',
    'こんにちは！今夜はみんなフレンドリーだよ。',
    'こんばんは！お気に入りのアトラクション、もう決めた？',
    'やあ旅人。今夜のパーク、にぎやかだね。',
    'こんにちは！潮風とMeebit、最高の組み合わせ。',
    'よっ！冒険の準備はできてそうだね。',
    'やあ！ちょっと見ていって。今夜は何か起きてるよ。',
    '会えてうれしい！噴水、今夜はきれいだよ。',
    'こんにちは！ベンチの近く、足元に気をつけて。',
    'おかえり…それとも初回り？',
    'あっ、こんにちは！人混みウォッチしてたところ。',
    'ごきげんよう！こういう夜って特別な感じがする。',
  ],
  gameFind: [
    'Find the Meebit はあっち！美術館でターゲットを探してね。',
    '人混みが好きなら Find the Meebit、おすすめ。',
    'ミュージアムのアトラクション、顔がいっぱいで熱いよ。',
    'ミュージアムのコツ：話しかけるとヒントが出ることあるよ。',
    'Find the Meebit は後半ほど本気。集中力を持って！',
    'Meebitの海に迷子？それがミュージアムの味だよ。',
    'ミュージアムをクリアすると After Hours が開く。やる価値あり。',
    'Find the Meebit、おしゃれかくれんぼって感じで好き。',
    'ミュージアムは時間が命。固まらないで！',
    '違うMeebitだった？歩き続けて。正解はどこかにいる。',
    'ミュージアムの人混み、似てるようで違うんだよね。',
    'ミュージアムを制覇したら、クラブの夜が待ってるよ。',
  ],
  gameTraits: [
    'トレイトハントは楽しいよ。ヒントと同じ特徴を探そう！',
    '髪型・服・アクセ…トレイトハントは細部勝負。',
    'おしゃれ好きならトレイトハントのギャラリーへ！',
    'トレイトハントは速さより観察眼が大事。',
    '同じシャツ色？同じメガネ？トレイトハントが試してくる。',
    'ピアスを見落としてトレイトハントに負けたことある…。',
    'トレイトハントはMeebit版ファッションビンゴ。',
    '手がかりはよく読んで。一つのトレイトで全部変わる。',
    'ギャラリーの明かり、狙いが分かると味方になるよ。',
    'トレイトハントの短ループ、合間遊びにぴったり。',
    '特徴が一致した瞬間、妙に気持ちいいんだ。',
    'コーデが好きなら、トレイトハントが遊び場だよ。',
  ],
  gameStreet: [
    '8番ストリートは夜になると変だよ。変化に気づけるかな？',
    '繰り返す路地、いまだにゾクッとするんだ。',
    '間違い探しが好きなら、8番ストリートに入ってみて。',
    '8番ストリートはループする。瞬きすると変化を逃すよ。',
    '温かい街灯、冷たいひねり。それが8番ストリート。',
    'この前も路地の並びが変わった気がする…。',
    '8番ストリートの一人称、夜だと印象が違うよね。',
    '歩行者をよく見て。誰か一人、おかしいはず。',
    '8番ストリートは短い…見逃し続けなければね。',
    '角を曲がったら二度見。直感を信じて。',
    '白いフェードはストリートのリセット。気を引き締めて。',
    '8番ストリートはダッシュより粘り勝ち。',
  ],
  featuredAny: [
    '噴水の銅像、今日の主役だよ。見てきた？',
    '本日の主役は噴水の台座の上！見逃さないで。',
    '広場の銅像が今日のスター。光ってて目立つよね。',
    '噴水のMeebitは日替わり。今日の見た目、かっこいい。',
    '銅像とセルフィー撮った。全然恥ずかしくないよ。',
    '今日の主役、金属でも存在感あるよね。',
    '噴水横の看板で、主役のトレイトが見られるよ。',
    '来場者の半分は今日の主役とつながってる。わかる？',
    'パークは毎朝（JST）新しい主役を選ぶんだ。',
    '似た子探しなら、まず噴水から始めてみて。',
  ],
  featuredMatched: [
    'ぼく、今日の主役チームの一人！銅像と同じ雰囲気だよ。',
    'よく見て…今日の主役と同じ系統なんだ。わかる？',
    'そう、今夜のスター仲間。人混みの中で探してみて！',
    '銅像とおそろい…ほぼ。ぼくは歩けるバージョン。',
    '今日の主役と一緒にスポットライト浴びてる気分。',
    '銅像がウインクしたら、ぼくの心だと思って。',
    'ぼくは銅像じゃないけど、今夜の主役サークルだよ。',
    '他のスターゲストも探して。わざと散らばってるから。',
    '噴水の偶像と同じ気配。それが今日の演出。',
    '今日スターチームなの、ちょっと得意かも。',
  ],
  themeAny: [
    '噴水の看板の「本日の共通点」がヒントだよ。',
    '今日の共通トレイト、あの小さな看板に書いてあるよ。',
    'パークが今日のテーマトレイトを決めたんだ。来場者の半分が共有してるよ。',
    '本日の共通点が15人をつないでる。見つけられるかな？',
    '先に看板を読んで、それから人混みをスキャンして。',
    'トレイトひとつ、Meebitたくさん。日替わりリンク遊びだよ。',
    '噴水の看板は飾りじゃない。ヒントなんだ。',
    '今日のテーマがあると、パークがマッチングパーティみたい。',
    '似てる二人がいたら、本日の共通点を疑ってみて。',
    '日替わりトレイトは日付で変わる。毎日フレッシュ。',
  ],
  themeMatched: [
    'ぼくたち、今日の共通点をシェアしてるんだ。仲間を見つけて！',
    '主役と同じテーマトレイト持ち。だからここにいるのさ。',
    '本日の共通点がぼくたちを集めたんだ。似た子をもっと探して！',
    '今日のテーマ、堂々と身につけてるよ。',
    'ぼくを見つけられたなら、本日の共通点、わかってきたね。',
    '今夜このトレイト持ちは15人。数えるのも楽しいよ。',
    'ぼくをマッチしたら、次は看板。いい流れ！',
    '本日の共通点はランダムじゃない。ぼくは選ばれた側。',
    '共通点クラブ、ただいま参上。双子はどこ？',
    '看板が言って、ぼくが証明する。それが本日の共通点。',
  ],
  parkFlavor: [
    'アトラクションは3つ。好きな入口から飛び込んで！',
    'こういう夜が好き。潮風と Meebit がいっぱい。',
    '迷ったら金の道をたどって噴水に戻ってきてね。',
    '街灯が小さく鳴ってる。テーマパークなのに落ち着く。',
    'ベンチは快適…座るとNPCに見つめられるけど。',
    '噴水の周りをぐるぐるしがち。癖かも。',
    'パークのコツ：みんなに話しかけて。役立つ噂があるよ。',
    'ゲストにはテーマ一致組と、ただののんびり組がいる。',
    'ゲームからはいつでも Back to Top。ぼくたちはここにいるよ。',
    '島の外の海、今夜は果てしなく見える。',
    'クラシックな夜のパーク感。クラブっぽいのに並ばなくていい。',
    '3つ全部急がなくていい。広場も味わっていって。',
  ],
}

/** デバッグ／確認用：言語あたりの総セリフ数。 */
export function countParkDialogueLines(pools: ParkDialoguePools) {
  return (
    pools.greetings.length +
    pools.gameFind.length +
    pools.gameTraits.length +
    pools.gameStreet.length +
    pools.featuredAny.length +
    pools.featuredMatched.length +
    pools.themeAny.length +
    pools.themeMatched.length +
    pools.parkFlavor.length
  )
}
