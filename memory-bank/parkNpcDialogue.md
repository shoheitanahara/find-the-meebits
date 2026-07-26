# Meebits Park NPC Dialogue Bible

## パーク NPC セリフ制作ガイド

> **対象**  
> パーク NPC の英語・日本語セリフを書く AI エージェントと人間。
>
> **関連実装**  
> `src/top/parkDialogueExpand.ts`（**完結した一言**の配列）→ `parkDialogue.ts`（選出）
>
> **最重要原則**  
> NPC は機能を説明する案内役ではない。  
> Meebits Park で、それぞれの時間を過ごしている来場者である。
>
> **目標**  
> セリフを読んだプレイヤーが、説明されたからではなく、NPC の何気ない一言を通して、
>
> - この世界は自分がいない間も動いている  
> - 今日のパークは昨日と少し違う  
> - NPC にも自分とは別の時間が流れている  
> - もう少し歩いてみたい  
>
> と感じられる状態を作る。
>
> 最終更新: 2026-07-26（head×tail 廃止・セリフ全面更新）

---

## 0. このドキュメントの使い方

セリフを追加するときは、次の順番で考える。

1. **誰が話しているか**
2. **その NPC は、少し前まで何をしていたか**
3. **今、何を見たり感じたりしているか**
4. **その一言の奥に、どんな小さな出来事があるか**
5. **機能説明や広告になっていないか**
6. **日本語と英語が、それぞれの言語で自然か**
7. **一息で読める完結した一言になっているか**（断片の継ぎ接ぎにしない）

最初から「パークの魅力を伝えよう」と考えないこと。  
魅力は NPC に説明させるのではなく、生活・失敗・寄り道・勘違いから自然に伝える。

---

## 0.1 アプリ実態との合わせ方（必読）

Bible の理想と、いまの実装は完全一致しない。**ズレがあるところは「世界の噂／期待／工事中の想像」として書くか、書かない。** 存在しない体験を、いま起きている事実のように断言しない。

| トピック | いまのアプリ | セリフでの扱い |
|----------|--------------|----------------|
| **Culture のランウェイ** | Coming Soon（建設枠）。常設の歩行ショーはまだない | 「始まった／見逃した」を常時事実にしない。工事・完成前の期待・噂・看板まで |
| **Mountain / Sea の Coming Soon** | 建設中スロットあり | 屋根・壁・音・「昨日より進んでる」は可。完成日・開発進捗は不可 |
| **季節サイクル** | 現状なし（旧夏シーズンは廃止） | 「秋になった」など季節切替を仕様として語らない。光・風・潮の感覚は可 |
| **時間帯** | パークは夜の空気が主 | 「もう夕方」は感覚として可。昼夜システム説明は不可 |
| **Plaza 来場者** | 日替わり約 30 体（うち共通点マッチ約 15） | 人数を言わない。「今日よく見る服」「似た集団」は可 |
| **Mountain / Sea / Culture 来場者** | 各地区 約 15 体 | 同上。内部定数をセリフに出さない |
| **今日の主役** | 噴水銅像＋看板。日付（JST）で入替 | 「今日の主役」「Today’s Star」「銅像」で可。抽選・日付計算は不可 |
| **Mt. Meeb / Jerry Mountain** | 日替わりルート＋進捗も毎日 Stage 1 から | 消えた近道・今日の失敗は可。seed / リセット仕様は不可 |
| **8th Street / Find / Trait Hunt** | Plaza から入るアトラクション（別画面） | パーク内の「遊んだあと／これから行く」雑談として可。攻略・乱数説明は不可 |
| **制作者 Shawn T. Art** | `isCreator` 専用プール | **この Bible の対象外。触らない** |
| **プール名** | `EN_MT_FLAVOR_` / `EN_CU_FLAVOR_` 等。`construction*` 専用プールは未分離 | 工事ネタは該当ゾーンの `flavor` に混ぜる。新プールを足すなら実装とセット |

**方位（口頭）**: 奥＝北、手前＝南。詳細は [parkDesigner.md](./parkDesigner.md)。コードの `n`/`s` は出さない。

---

## 1. Meebits Park の会話哲学

### 1.1 NPC はマーケターではない

させないこと:

- パークの特徴を要約する
- ゲームの面白さを評価する
- プレイヤーへ機能を紹介する
- 毎日変わる仕組みを説明する
- 制作者の仕事を褒める
- 「ぜひ体験してください」と勧める

**Bad**

> 毎日コースが変わるので、何度でも新鮮に楽しめます。  
> The course changes every day, so every visit feels fresh.

**Good**

> 昨日覚えた足場、今日はどこにもなかった。  
> I came back for yesterday’s shortcut. The mountain had already moved on.

機能を説明していないのに、山が毎日変わることは伝わる。

### 1.2 NPC は世界の中で暮らしている

話してよいこと: さっきまで何をしていたか／これからどこへ行くか／見逃したもの／会った Meebit／迷った道／気に入った場所／どうでもいい悩み／他 NPC の噂／光・音・匂い／失敗したゲーム／あきらめたこと／明日に回したこと。

プレイヤーが話しかけた瞬間に NPC の人生が始まるわけではない。

**Good**

> 靴ひも結び直してたら、ランウェイ始まっちゃった。

（※ Culture でショーが常設でない現状では、「看板の前で待ってたら」「工事の音で聞き逃した」などに置き換えるか、アトラクション側の体験として書く。）

### 1.3 プレイヤーは世界の主役ではない

避ける: あなたを待っていた／君ならクリアできる／あなたが来たから今日が始まる／世界を救って／重要情報の独占。

プレイヤーはふらっと立ち寄った来園者。NPC は自分の話をし、たまに独り言、勘違い、途中切れでよい。

### 1.4 セリフは「一行の短編小説」

**Bad**: シーエリアは長時間過ごせる、心地よい場所です。  
**Good**: 海を見に来ただけなのに、もう夕方。

### 1.5 NPC は少し不完全でよい

見間違い・記憶違い・自信のない噂・大げさ・言い直し・自己否定を許可する。謎に答えを出しすぎない。

### 1.6 沈黙と何もない時間

情報・笑い・誘導を毎回入れなくてよい。

> 今日は風がいいね。／このベンチ、ちょうどいい。／I could stay here a little longer.

### 1.7 広告テスト

> **広告にそのまま載せられそうなら書き直す。**  
> **現実の公園で偶然聞こえてきそうなら残す。**

---

## 2. Meebits Park の世界観

### 2.1 パークは完成品ではなく、育っている場所

あるもの: 建設中の施設／日々変わる来場者／日替わりの主役／日ごとに変わる山／変化する街路や異変／まだ入れない場所／昨日になかったもの。

NPC は「アップデート」と言わない。変化は現実の出来事として話す。

**Bad**: 新しいアップデートで建物が追加されます。  
**Good**: この前まで骨組みだけだったのに、もう屋根がある。

### 2.2 すべての出来事を見る必要はない

プレイヤーが見ていない場所の話・朝の話・もういない Meebit の話は可。見逃しを謝らない。「全部回らなきゃ」圧力を作らない。

### 2.3 所有よりも出会い

避ける: 所有確認／フロア価格／レアの金銭価値／ウォレット／売買／投資／所有者の優越。

好きになる理由は見た目・行動・出来事・印象。

**Good**: あの赤い帽子の Meeb、さっきから噴水を三周してる。

---

## 3. 世界の魅力を支える柱

直接説明せず、自分の経験として話す。

| 柱 | プレイヤー体験 | NPC が話す方向 | 禁止 |
|----|----------------|----------------|------|
| 日替わりコース | Mt. Meeb / Jerry Mountain が毎日変わる。進捗も毎日 Stage 1 から | 昨日と違う足場、消えた近道、今日の失敗 | seed、日次処理、リセット仕様 |
| 8th Street の異変 | 歩行者・異変が毎回違う | 見間違い、違和感、昨日とのズレ | 正解条件、ループ数、異変一覧 |
| Find the Meebit | 入るたびに群衆が変わる | 見つけた顔、見失った顔、似た Meebit | 乱数、生成、候補数 |
| Trait Hunt | 観察して特徴を見つける | 靴、髪、服、色への個人的注目 | 判定ロジック、攻略手順 |
| 今日の主役 | 噴水の銅像と関連 Trait が日付で変わる | 推し、見物人、像の印象、噂 | 抽選方法、日付計算 |
| 日替わり来場者 | Plaza〜各地区で顔ぶれが変わる | 今日よく見る服、似た集団、偶然の再会 | 「30体」等の内部仕様 |
| Culture / ランウェイ | 当面は工事中・期待 | 看板、足場、完成したら見たい服 | 常設ショーが今日も開催中、という断言 |
| 建設中エリア | Coming Soon 棟 | 屋根、壁、作業音、完成予想 | リリース日、開発進捗率 |
| 地区の空気 | Plaza / Mountain / Culture / Sea | 光、風、音、砂、木、混雑 | zoneId、座標、ロード方式 |

---

## 4. NPC の声と役割

細かい設定は不要。セリフ前に立場をひとつ選ぶ。

### 4.1 来園者アーキタイプ（要約）

| 型 | 特徴 | 例の方向 |
|----|------|----------|
| 初めて | 迷い、言い間違い、全体を知らない | 山のつもりが海？ |
| 常連 | 昨日との差、好きな場所、説明しない | このベンチ、前は海に近かった |
| 山好き | 足場・風・失敗を体験として | 三つ目の足場、ぼく嫌いだよ |
| ランウェイ好き | 服・歩き・好み（評論家にしない） | 青いコート、歩き方まで青かった |
| 写真好き | 光・タイミング、いつも少し遅れる | 撮る瞬間だけみんな後ろ向き |
| ベンチ好き | 急がない、音と人の流れ | 今日はここから動かない |
| 迷子 | 深刻でない、道案内を要求しない | 広場探してまた広場 |
| 臆病 | 8番や高所、でもまた試す | 何もなかった。余計に怖い |
| 楽観 | 失敗を軽く、明日に回す | 山頂はまた今度。雲までは行けた |
| 皮肉 | 自分の失敗をからかう。他者は傷つけない | 近道見つけた。落ちるまでのね |

1 セリフに必要なのは「好きな場所／気分／さっきの出来事／小さな目的／失敗／注目」のうち **2つ程度**。

---

## 5. 日本語スタイルガイド

英語を先に作って直訳しない。**日本語は最初から日本語で書く。**

- 主語「私は／あなたは」を頻繁に書かない  
- 基本は常体。観光案内のですます連発をしない  
- 「〜ですね」連発禁止寄り（きれいですね／楽しいですね 等）  
- 評価語より具体: 楽しい／面白い／魅力的／素敵／すごい／きれい／ワクワク／新鮮／ユニーク → 物・動き・失敗・感覚へ  
- 「気がする」を逃げで連発しない（怪談・自信のなさでは可）  
- 文を短く切る。接続詞（でも／だから／ちなみに…）を減らす  
- 「〜することができる」禁止寄り  
- 名詞の重ねすぎ禁止  
- 感情の直接説明より行動・感覚  
- 語尾を散らす（だよ／だね／かな／かも／らしい／名詞止め／途中切れ）  
- 「ぼく／わたし」は必要なときだけ。一人の NPC 内では統一  
- カタカナ広告語を避ける（エキサイティング／ユニーク／フレッシュ／システム／ランダム／リセット／アップデート…）  
- 原因説明より出来事だけ

### AI 臭さチェック（疑う文末・語句）

文末: 〜ですね／〜と思います／〜してみてください／〜がおすすめです／〜を楽しめます／〜が魅力です／〜が特徴です  

語句: 雰囲気／魅力／体験／新鮮／ワクワク／特別／素敵／非常に／さまざまな／見逃せない／おすすめ／楽しむことができる  

---

## 6. 英語スタイルガイド

日本語の翻訳ではなく、短い口語として書く。

- Short, spoken, specific  
- contractions（I’m / don’t / that’s）  
- 避ける: amazing / exciting / wonderful / unique / immersive / fresh / experience / explore / discover / enjoy / adventure（個人感情で自然なときだけ）  
- “You should” で誘導しない  
- 機能説明しない  
- 断片・言い直し・間を許可（`That jump looked easy. Looked.`）

---

## 7. 英語と日本語のペアリング

- **直訳禁止**。同じ出来事・感情・オチ・ネタバレ範囲を共有  
- 主語・文数・比喩・語順は一致不要  
- 片方だけ広告文にしない  

### 固有名

| 対象 | EN | JA |
|------|----|----|
| 山 | Mt. Meeb | Mt. Meeb |
| ゼリー塔 | Jerry Mountain | ジェリーマウンテン |
| 路地 | 8th Street | 8番ストリート |
| 探しもの | Find the Meebit | Find the Meebit |
| 特徴ハント | Trait Hunt | トレイトハント |
| 広場 | Plaza | 広場 |
| 山岳 | Mountain District | 山岳エリア |
| カルチャー | Culture District | カルチャーエリア |
| 海 | Sea District | シーエリア |
| 日替わり主役 | Today’s Star | 今日の主役 |

UI 表記が変わったら表とセリフを同時更新。

---

## 8. セリフの基本パターン（混ぜる）

小さな観察／失敗／見逃し／予定変更／噂（断定しない）／自分だけのこだわり／何もない一言／誰かについての一言／昨日との比較／自己矛盾／未完成の話／軽い詩情（日常の範囲）

---

## 9. 実装形式：完結した一言（head×tail は廃止）

以前は head × tail の直積で本数を増やしていたが、**組み合わせ事故で不自然な文が増える**ため廃止した。

`parkDialogueExpand.ts` には **完成したセリフだけ** を配列で置く。

```ts
const EN_MT_GAME = [
  'Yesterday’s shortcut is a cliff now.',
  'I nailed the first three jumps.',
  // …
]
```

### ルール

- 1 要素 = プレイヤーに見せてよい完成文（または自然な二短文）
- 本数は品質優先。無理に増やさない
- EN / JA は別配列。直訳ペアである必要はない（同じプールの「方向」が揃っていればよい）
- `{theme}` / `{value}` はテーマ系のみ。1 セリフ内で完結すること

### 追加前

声に出して読む。広告に使えそうなら書き直す。前後の一日が想像できれば残す。
---

## 10. エリア別の会話方針

### 10.1 Plaza／広場

空気: 中心、行き交い、今日の主役、噴水、待ち合わせ、寄り道。  
話題: 主役の見た目、噴水周りの人、行き先の迷い、他地区の音、今日よく見る Trait、像の噂。  
避ける: パーク全体の機能紹介、エリア一覧マニュアル、抽選方法。

### 10.2 Mountain／山岳

空気: 風、崖、日替わり足場、失敗と再挑戦、頂上だけが目的ではない、工事中枠。  
話題: 昨日と違う地形、苦手な足場、落ちた場所、途中で帰る、工事の変化。  
避ける: Stage リセット仕様、乱数、クリア手順、「挑戦しよう」直接誘導。

### 10.3 Jerry Mountain

空気: ネオン、ゼリー足場、見た目と足元の戸惑い、夜の光。  
方向: 透明に見えて怖い／下を見てしまった／今日のジェリーは意地悪、など。

### 10.4 Sea／シーエリア

空気: 波、砂、潮風、急がない、ぼんやり。  
話題: 波の音、足跡、予定変更、砂が靴に入る、何もしない時間。  
避ける: 「癒やされる」直接評価、魅力パンフ、ゲームがない言い訳。

### 10.5 Culture／カルチャー

空気: 濃紺・青のギャラリー夜、工事中の3棟（ランウェイ／博物館／PFP）。  
話題: 看板、足場、完成したら見たいもの、スーツ率、南門で広場へ戻る。  
**いまは常設ランウェイ公演がない** → 「さっきのショー」を事実連発しない。期待・工事・噂まで。

### 10.6 8th Street

空気: 同じようで違う、軽い不安、見間違い。深刻ホラーにしない。  
避ける: 異変の正解、周回数、残酷表現、チュートリアル。

### 10.7 Find the Meebit

空気: 人混み、見間違い、見失い、入るたびに違う群衆。  
避ける: ランダム生成、ID 範囲、攻略、正解ネタバレ。

### 10.8 Trait Hunt

空気: 細部、見落とし、色や服への個人的関心。  
避ける: データ構造、判定条件、攻略一覧。

### 10.9 建設中

空気: 世界が育つ、完成を急かさない、NPC も完成日を知らない。  
避ける: リリース日断言、開発者作業、バグ、進捗％。

---

## 11. ユーモア／謎／誘導

**ユーモア**: 自分の失敗・勘違い・言い直し。他者への悪口、初心者笑い、ミーム依存は避ける。

**謎・噂**: 像が動いた／工事に誰か／海の向こうの光／同じ人を三回見た、など。断定しない、真相を説明しない、怖くしすぎない。

**ゲーム誘導**: 存在がにじむのは可。命令・宣伝は不可。

**Bad**: Mt. Meeb に挑戦してみてください！  
**Good**: Mt. Meeb、二段目だけ見て帰るつもりだったんだけどな。

---

## 12. 長さ・表記

- EN: だいたい 6〜18 words（最大〜24）  
- JA: だいたい 10〜32 文字（最大〜45）  
- 短いセリフを多めに  

JA: 「。」基本、！多用しない、……は少量、絵文字なし。  
EN: `!` 多用しない、`—` は乱用しない、ellipsis は `...`。

---

## 13. 生成プロンプト（共通）

```text
You are writing short NPC chatter for Meebits Park.

The NPC is a visitor inside the world, not a developer, narrator,
marketer, tutorial guide, or customer-support agent.

The player is not the center of the NPC’s life.
The NPC was already doing something before the player arrived.

Write a tiny personal moment:
an observation, failed plan, rumor, distraction, small preference,
minor mistake, or quiet thought.

Do not explain features.
Do not advertise the Park.
Do not tell the player what to do.
Do not mention implementation details, random generation, seeds,
servers, resets, storage, coordinates, or code.

Respect app reality:
- Culture runway / museum / PFP are mostly under construction — do not treat live runway shows as routine facts.
- No seasonal system — do not claim seasons changed as a game feature.
- Do not cite visitor counts or internal constants.

The dialogue should feel overheard at a real park.
Small, specific, imperfect, and conversational.

Write English and Japanese separately.
The Japanese must not be a literal translation of the English.
Both versions should describe the same scene and emotional beat,
but each must sound native in its own language.

Japanese requirements:
- Omit subjects when natural.
- Prefer casual spoken Japanese.
- Avoid repeated です／ます and 〜ですね.
- Avoid abstract praise such as 魅力的, 新鮮, ワクワク, 素敵, 雰囲気.
- Show concrete objects, actions, sounds, light, weather, mistakes, and timing.
- Keep it short.
```

### テーマ別メモ

- **Mountain / Jerry**: 消えた近道・失敗・風・途中で帰る。攻略なし。なぜ変わるかは言わない。  
- **8th Street**: 軽い不確かさ。正解・ルールなし。  
- **Find**: 靴だけ違う／覚えた顔がいない。乱数・ID なし。  
- **Trait Hunt**: 帽子を見てたのに靴だった、など。チュートリアルなし。  
- **Sea**: 何もしなくてよい。予定変更・夕暮れ感覚。  
- **Today’s Star**: 推し・噂・横顔。抽選説明なし。  
- **Construction**: 屋根が一枚、音がした。完成日なし。  
- **Culture**: 工事と期待中心。常設ショー前提にしない。

---

## 14. Good / Bad 比較（抜粋）

| 場面 | Bad | Good |
|------|-----|------|
| 山 | 毎日コースが変わるので新鮮に楽しめます | 昨日の足場、今日は空中にない |
| 海 | 美しい景色でリラックスできます | 波を見てたら、行く場所どうでもよくなった |
| Find | 毎回違うので繰り返し楽しめます | 見つけたと思った。笑った顔まで同じだったのに |
| 8th | 毎回異なる異変が発生します | あの窓、さっきまで開いてたよね |
| 工事 | 新しいアトラクションは開発中です | 昨日は壁なかったよ。たぶん |
| 主役 | 毎日ランダムに選ばれます | 今日の主役、後ろ姿のほうが好きかも |
| 誘導 | 山岳エリアで新コースを体験しましょう | 山に行くなら、靴ひも固めがいいよ。たぶん |
| 抽象 | 今日のパークは素敵な雰囲気ですね | 今日は噴水の音が、海まで聞こえる |

---

## 15. 推奨セリフ例（方向性・大量複製しない）

### Plaza

- 待ち合わせ、帽子の色しか聞いてない。  
- 今日の主役、ちょっと眠そう。  
- 山か海か。まだ決まらない。  
- I’m meeting someone. I only know the hat color.  
- Today’s Star looks a little sleepy.

### Mountain

- 昨日の近道、今日は崖。  
- 三段目だけは完璧だった。  
- 山頂はまた今度。今日は雲まで。  
- Yesterday’s shortcut is a cliff now.  
- The summit can wait. I reached the clouds.

### Sea

- 海を見に来ただけなのに、もう夕方。  
- 今日はここから動かない。  
- I only came to look at the sea. Somehow it’s evening.

### Culture（工事寄り）

- 屋根、昨日より一枚増えてる。  
- 完成したら最初に来る。忘れてなければ。  
- There’s one more piece of roof than yesterday.

### 8th / Find / Trait（抜粋）

- 誰も変じゃなかった。それが変だった。  
- 見つけたと思ったら、靴だけ違った。  
- 帽子ばっかり見てた。靴だった。  
- Nothing looked wrong. That felt wrong.  
- Right face. Wrong shoes.

---

## 16. プール対応表（現行実装）

| プール | 主な柱 | プレフィックス |
|--------|--------|----------------|
| `greetings` | 軽い出会い（マーケ挨拶にしない） | `EN_*_GREET_` / `JA_*_GREET_` |
| `gameFind` | 群衆、見間違い | `EN_FIND_` / `JA_FIND_` |
| `gameTraits` | 観察、細部 | `EN_TRAITS_` / `JA_TRAITS_` |
| `gameStreet` | 異変、歩行者 | `EN_STREET_` / `JA_STREET_` |
| `gameMountain` | 日替わりルート、失敗 | `EN_MT_GAME_` / `JA_MT_GAME_` |
| `gameNeon` | Jerry Mountain | `EN_NEON_GAME_` / `JA_NEON_GAME_` |
| `featured*` | 今日の主役、噴水 | `EN_FEAT_` / `JA_FEAT_` |
| `theme*` | 今日のリンク Trait（`{theme}` / `{value}`） | `EN_THEME_` / `JA_THEME_` |
| `flavor` | ゾーン別空気（工事ネタもここ） | `EN_PLAZA_FLAVOR_` / `EN_MT_FLAVOR_` / `EN_CU_FLAVOR_` / `EN_SEA_FLAVOR_` ほか |

ゾーン追加時は抽象 flavor のコピペ禁止。その場所だけの音・地面・光・失敗を先に定義する。

`{theme}` / `{value}` は `parkDialogue.ts` の `fillTheme` で置換される。プレースホルダ付きセリフは単体で意味が通ること。

---

## 17. AI 生成ワークフロー

1. アーキタイプを決める  
2. 場所を決める（§0.1 の実態を確認）  
3. 直前の出来事を一つ  
4. 具体物を一つ（靴／足場／波／屋根…）  
5. 説明せず一言にする  
6. EN と JA を別々に書く  
7. AI 臭さ語を検索して削る  
8. 声に出して読み、完成文として問題ないか確認  

---

## 18. 自己採点（0〜2点）

会話らしさ／具体性／NPC の生活／非広告性／世界の奥行き／JA 自然さ／EN 自然さ／短さ／完成度（継ぎ接ぎでない）  

- 15+ 採用候補／12–14 修正／≤11 書き直し  
- **会話らしさ・非広告性・日本語・完成度が 0 なら即書き直し**

---

## 19. PR 前チェックリスト

### 世界観

- [ ] 来場者として話しているか  
- [ ] プレイヤーを世界の中心にしていないか  
- [ ] 予定・失敗・好み・観察があるか  
- [ ] 見えない出来事がにじむか  
- [ ] §0.1 のアプリ実態と矛盾していないか  

### 広告・説明

- [ ] 魅力の直接評価がないか  
- [ ] 仕様・開発用語がないか  
- [ ] 命令・おすすめ誘導がないか  

### 言語・実装

- [ ] EN/JA 別書きで直訳でないか  
- [ ] 完結した一言になっているか（断片の直積でないか）  
- [ ] 固有名が現行か  
- [ ] creator プールを触っていないか  

---

## 20. 最終判断

1. 現実の公園で口にしそうか  
2. NPC 自身の時間が見えるか  
3. 具体的な景色や出来事が一つあるか  
4. 説明しなくても魅力がにじむか  
5. プレイヤーへ強制していないか  
6. 日本語が翻訳調でないか  
7. もっと短くできないか  

最後に必ず:

> **この文章は広告に使えそうか？** → 使えそうなら書き直す。  
> **この文章の前後に、NPC の一日を想像できるか？** → 想像できるなら残す。

---

## 21. Meebits Park らしい会話とは

NPC は「この世界は魅力的だ」と言わない。  
ただ、この世界で自分の一日を過ごしている。

プレイヤーがその一言から、

> もう少し歩いてみようかな。

と思う。それが目的である。

---

## 22. 関連ファイル

| 用途 | パス |
|------|------|
| セリフ本体 | `src/top/parkDialogueExpand.ts` |
| 選出ロジック | `src/top/parkDialogue.ts` |
| 日替わり来場者・噴水 | `src/top/dailyFeatured.ts` |
| 登山日替わり | `src/mountain/dailyClimb.ts` |
| 登山進捗 | `src/mountain/store.ts` |
| パーク配置・方位 | [parkDesigner.md](./parkDesigner.md) |
| プロダクト方針 | [productContext.md](./productContext.md) |

---

## 23. AI エージェントへの最終指示

```text
Do not try to make Meebits Park sound attractive.

Write as if it already exists,
and the NPC has been spending an ordinary day there.

The charm must appear indirectly through:
what the NPC noticed,
what went wrong,
what they missed,
where they stopped,
who they saw,
and what they decided not to do.

Respect current app reality (construction vs live attractions,
no seasonal system, no citing internal counts).

The player is visiting the NPC’s world.
The NPC is not performing for the player.

When writing Japanese, never translate sentence structure from English.
Write the Japanese line again from zero,
as something a Japanese person might casually say while standing there.

If the line sounds informative, promotional, polished, complete,
or broadly positive, make it smaller, stranger, more personal,
or more specific.

Prefer:
「昨日の近道、今日は崖だった。」
Over:
「毎日異なるコースを新鮮に楽しめます。」

Write the life of the NPC, not the feature list of the Park.
```
