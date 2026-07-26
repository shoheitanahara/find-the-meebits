# Park NPC Dialogue — セリフ生成ノート

> **誰向け**: パーク NPC の英日コメントを書く／足す AI エージェントと人間。  
> **実装**: `src/top/parkDialogueExpand.ts`（head × tail の積でプール生成）→ `parkDialogue.ts`  
> **原則**: NPC は **パークを楽しむ来場者**。制作者・仕様説明口調にしない。

最終更新: 2026-07-26（`parkDialogueExpand.ts` を本ノート方針で全面刷新）

---

## 0. このワールドの魅力（必ず伝える柱）

Meebits Park の空気は「一度見た景色がそのまま残らない」こと。NPC はそれを **ワクワク／噂／自分の体験** として語る。

| 柱 | プレイヤー体験 | NPC が言うべきこと（例の方向） | 言ってはいけない |
|----|----------------|--------------------------------|------------------|
| **日替わりルート** | Mt. Meeb / Jerry Mountain のコースが毎日変わる。進捗も毎日 Stage 1 から | 「昨日の尾根と今日の崖、全然違う」「今朝また Stage 1 からワクワクしてる」 | seed / JST / リセット仕様の説明 |
| **路地の異変** | 8th Street の歩行者・異変が毎回ちがう | 「同じ路地なのに並びが違う気がする」「今日の歩行者、誰か一人おかしい」 | ループ回数・実装の種明かし |
| **群衆の新鮮さ** | Find the Meebit は常にランダムな顔ぶれ | 「ミュージアム、入るたびに顔が違う」「似てる海の中から一人を探す快感」 | 「乱数で生成」などメタ説明 |
| **日替わり主役** | 噴水の Featured / テーマトレイトが日付で変わる | 「今日の銅像、推し」「看板のリンク、今日はこれだよね」 | ストレージキー・抽選アルゴリズム |
| **地区の気分** | Plaza / Mountain / Culture / Sea で空気が違う | その場の灯・砂・ランウェイ・潮風を味わう一言 | ゾーン ID・座標・ゲート仕様 |

**トーンの正**: 友達同士のパーク雑談。短い。具体的な感覚（光・足場・人混み・ドキドキ）。  
**トーンの禁**: マニュアル口調、開発者目線、「このゲームは〜というシステムです」。

---

## 1. 声のキャラ（誰が話しているか）

- **来場者**: ほとんどのパーク NPC。遊んだ／遊ぼうとしている一人称。
- **Shawn T. Art（制作者）**: `isCreator` のみ別プール。**このノートの対象外**（既存 creator セリフを触らない）。
- 来場者は制作者の仕事を褒めすぎない。「パークが好き」「今日の雰囲気が好き」で十分。

### 一人称・距離感

| 言語 | 推奨 | 避ける |
|------|------|--------|
| EN | I / you、短い口語、軽い皮肉OK | We designed… / The system… / Procedural… |
| JA | ぼく／わたし混在可、ですます少なめの話し言葉 | 「仕様では」「シードで」「日次ジョブで」 |

---

## 2. 書き方ルール（実装とセット）

### 2.1 head × tail

`parkDialogueExpand.ts` は **head 全件 × tail 全件** を結合する。

- head: 導入・主語・場所のフック（切れても意味が立つ）
- tail: オチ・おすすめ・感情（切れても意味が立つ）
- **どの組み合わせでも自然な文になること**（変な接続にならない語尾）
- EN の joiner はスペース、JA は空文字想定。head 末尾の句読点・ダッシュを揃える

### 2.2 長さ

- 完成文はだいたい **EN 12〜22 words / JA 20〜40 文字** 前後
- 1 セリフに魅力を詰め込みすぎない（柱は1つ）

### 2.3 固有名

表示名に合わせる（改名したらセリフも追従）。

| 対象 | EN | JA |
|------|----|----|
| 山 | Mt. Meeb | Mt. Meeb |
| ゼリー塔 | Jerry Mountain | ジェリーマウンテン |
| 路地 | 8th Street | 8番ストリート |
| 探しもの | Find the Meebit | Find the Meebit |
| 特徴ハント | Trait Hunt | トレイトハント |
| 地区 | Plaza / Mountain / Culture / Sea District | 広場／山岳／カルチャー／シーエリア |

### 2.4 方位（口頭）

奥＝北、手前＝南。詳細は [parkDesigner.md](./parkDesigner.md) の方位表。  
NPC は「北の門」「広場の北はカルチャー」など口頭方位のみ。コードの `n`/`s` は出さない。

---

## 3. 柱別プロンプト（生成時に使う）

新しいセリフを足すときは、下のプロンプトを意識する。

### A. 日替わりコース（Mountain / Jerry）

```
Write visitor chatter (not a tutorial) about how the mountain trail
feels different every day, and how starting over from Stage 1 each morning
is exciting — not punishing. EN + JA. Short. Sensory (ledges, jumps, night air).
No mention of seeds, servers, or reset mechanics.
```

### B. 8th Street の異変・人

```
Write visitor chatter about 8th Street’s repeating alley where walkers
and tiny anomalies feel different each run. Wonder and slight unease.
EN + JA. No spoiler of exact rules. First-person guest voice.
```

### C. Find the Meebit のランダム群衆

```
Write visitor chatter celebrating that every Museum visit feels like a
fresh crowd — hunting one face in a sea of Meebits. Playful, not technical.
EN + JA.
```

### D. パーク全体の「今日だけの空気」

```
Write plaza flavor lines about the Park never feeling copy-pasted —
fountain star, themes, districts, rumors. Guest-to-guest. EN + JA.
```

---

## 4. Good / Bad 例

### Good（来場者・魅力）

- EN: `Yesterday’s cliff path is gone — today’s trail already has my heart racing.`
- JA: `昨日の尾根、もうないみたい。今日のトレイル、もうドキドキしてる。`
- EN: `8th Street looks the same… until the walkers don’t.`
- JA: `8番ストリート、見た目は同じなのに歩行者が違う気がする。`
- EN: `Every Museum run, brand-new faces. That’s the fun.`
- JA: `ミュージアム、入るたびに顔ぶれが新しい。それが醍醐味だよ。`

### Bad（制作者・仕様）

- EN: `The climb seed rotates daily at JST midnight.`
- JA: `シード値が毎日更新されるからコースが変わります。`
- EN: `NPCs are procedurally picked from 1–20000.`
- JA: `乱数でMeebitを選んで配置しています。`

---

## 5. プール対応表

| プール | 主な柱 | ファイル内プレフィックス |
|--------|--------|-------------------------|
| `gameFind` | C 群衆の新鮮さ | `EN_FIND_` / `JA_FIND_` |
| `gameTraits` | 観察・細部（日替わりテーマと相性可） | `EN_TRAITS_` / `JA_TRAITS_` |
| `gameStreet` | B 異変・歩行者 | `EN_STREET_` / `JA_STREET_` |
| `gameMountain` | A 日替わりルート | `EN_MT_GAME_` / `JA_MT_GAME_` |
| `gameNeon` | A Jerry の日替わり | `EN_NEON_GAME_` / `JA_NEON_GAME_` |
| `featured*` / `theme*` | 日替わり主役・リンク | `EN_FEAT_` / `EN_THEME_` 他 |
| `flavor` | D 全体の空気（ゾーン別 H/T） | `EN_PLAZA_FLAVOR_` 他 |

ゾーン別 flavor は `getParkDialoguePools(locale, zoneId)` で切替。新区を足すときは **同じ柱** をゾーンの言葉で言い換える。

---

## 6. チェックリスト（PR 前）

- [ ] 来場者の一人称／二人称になっているか
- [ ] 魅力の柱が文から伝わるか（仕様説明になっていないか）
- [ ] EN / JA の両方を足したか（片方だけ増やさない）
- [ ] head×tail のどの組み合わせでも破綻しないか
- [ ] 固有名が現行ブランドと一致しているか（Jerry Mountain 等）
- [ ] 制作者セリフプールを誤って汚していないか

---

## 7. 関連ファイル

| 用途 | パス |
|------|------|
| セリフ本体 | `src/top/parkDialogueExpand.ts` |
| 選出ロジック | `src/top/parkDialogue.ts` |
| 日替わり来場者・噴水 | `src/top/dailyFeatured.ts` |
| 登山日替わりシード／進捗 | `src/mountain/dailyClimb.ts` / `store.ts` |
| パーク配置・方位 | [parkDesigner.md](./parkDesigner.md) |
| プロダクト方針 | [productContext.md](./productContext.md) |
