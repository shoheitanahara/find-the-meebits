# Meet Sergito コピー要件（他 AI 向け）

最終更新: 2026-08-12  
**状態: 採用済み（2026-08-12）** — 実装は `topConfig.ts` / `MeetSergitoLoadingOverlay.tsx` / `SergitoDialogueBox.tsx`

---

## 1. 依頼内容

**Meet Sergito**（パーク入口看板・ローディング・会話 UI）のコピーを、世界観とトーンに合う形で**一から決め直す**。

入口は「説明書」ではなく **ディズニーパークのアトラクション入口看板** のように書く。  
全施設共通の規約は `memory-bank/attractionCopy.md` を参照。

---

## 2. 世界観（必読）

### Sergito 是谁

- **Sergito**（Meebit #17600）は、砂浜の **木の工房** にいる NPC。
- プレイヤーの Meebit の見た目（trait）を観察し、短い会話を返す体験。
- 工房には **棚の Meebit 人形（フィギュア）**、作業デスク、歩行 NPC などがある。
- ウォルト・ディズニー的な **温かさ・顔の見える存在** だが、**創始者ではない**。

### MeebCo 是什么

- **MeebCo** = 現代 Meebits の運営主体。**The Walt Disney Company に相当する社名**。
- Meebits は **複数回の買収** を経て、**今** MeebCo が Meebits を扱っている。
- Sergito は **現在の MeebCo の顔**（代表・経営側の人物）として描く。

### 看板に書いてはいけない理由

> ディズニーランドの入口看板に **「The Walt Disney Company」** と書かないのと同じ。

- **MeebCo** を看板の見出し・本文・ tagline に載せない。
- **代表 / Rep / Representative** などの役職も看板に載せない（名刺口調）。
- **創設者 / Founder / すべてを始めた** も lore 違反で不可。

MeebCo は会話や別 UI で自然に触れてよいが、**入口の一行目に社名を出す必要はない**。

---

## 3. 修正対象ファイル

| 用途 | パス | フィールド |
|------|------|------------|
| パーク入口看板 | `src/top/topConfig.ts` | `id: 'sergito'` の `storyTitle` / `description` |
| 棟バナー（変更任意） | 同上 | `title` / `subtitle` — 現状 `MEET SERGITO` / `The Workshop` |
| 入室ローディング | `src/meetSergito/ui/MeetSergitoLoadingOverlay.tsx` | `copy.en/ja.tagline`（`title` は `Meet Sergito` 固定で可） |
| 会話 UI 肩書 | `src/meetSergito/dialogue/SergitoDialogueBox.tsx` | `role` 変数（名前 `Sergito` の上の小さい行） |

**触らない:** Sergito の会話本文（`sergitoDialogueData.ts` / `createSergitoDialogue.ts`）は今回のスコープ外。看板・入口 UI のみ。

---

## 4. 文字量・レイアウト制約

看板パネルは約 3.05 × 1.58。折り返すと見出しと重なる。

| 欄 | 行数 | EN | JA |
|----|------|----|-----|
| `storyTitle` | **1行のみ** | **16字以内** | **10字以内** | `whiteSpace: nowrap` |
| `description` | **2行**（`\n` 改行） | **1行 20字以内** | **1行 11字以内** |
| ローディング `tagline` | 1行 | 短い口語。loading 文より目立たせすぎない | 同上 |

---

## 5. トーン

### 書く

- **約束**（工房の中で誰に会うか／何が見えるか）
- **具体物**（木の工房、棚の人形、作業机、砂浜から来た客、など）
- **人**（Sergito という名前・存在。社名ではなく人）
- 短い招待・空気

### 書かない

| NG | 例 |
|----|-----|
| 社名を看板の主役に | 今のMeebCo / MeebCo TODAY / MeebCo.代表 |
| 創始者扱い | 創設者 / Founder / すべてを始めた人 |
| 職人・視線だけの抽象 | 職人が見る / He looks. |
| 機能説明 | Meebitを見せてコメント / traitを解析 |
| 買収の説明文 | 〇回買収されて…（看板には載せない） |
| 操作・秒数 | ジャンプ / 45秒 |
| おすすめ口調 | 〜しよう / Let's / enjoy |

### 参考比喩（コピーの方向性のみ）

- **ウォルトに会う** のではなく、**ウォルト的な温かさを持つ「今の」人物に会う**。
- ディズニーなら看板は **「MEET SERGITO」「His Workshop」「The man in the wood shop」** 寄り。**会社名は出さない**。
- 他アトラクションの良い例（`topConfig.ts`）:  
  `ひとり探せ` / 美術館の群衆。  
  `Sergitoが待つ` / 木の工房、棚の人形。（※ storyTitle 側は社名なしで再検討可）

---

## 6. 却下済み案（再提案しないこと）

| 案 | 却下理由 |
|----|----------|
| 職人が見る / He looks. | 抽象で意味が弱い |
| MeebCo.代表です / MeebCo Rep | 名刺・役職口調で入口に不向き |
| 創設者 / THE FOUNDER / すべてを始めた人 | lore 違反（Sergito は創始者ではない） |
| 今のMeebCo / MeebCo TODAY / 今のMeebCo、Sergito | MeebCo は Disney Company 級の社名。看板の主語にするのは変 |
| 継いでいく人 / He carries MeebCo on. | 本文に社名が入るのも同様に NG 寄り |

---

## 7. 会話 UI の `role` 行について

現状: 名前 `Sergito` の上に小さく `MeebCo` と表示。

**決めること:**

- 空にする / 省略する
- 場所ベース（例: `The Workshop` / `工房`）
- 人ベースで社名なし（例: 肩書なし、または lore に沿った短い一行）

**社名 MeebCo をここに出すか** も含めて提案すること。出す場合は「看板より会話 UI なら許容」かどうか、提案理由を添える。

---

## 8. 納品形式

1. **各フィールドの EN / JA 案**（看板 storyTitle・description、loading tagline、会話 role）
2. **却下案との違いを1〜2文で説明**
3. `memory-bank/attractionCopy.md` のセクション 6 表の `sergito` 行を更新
4. 上記 TypeScript 3 ファイルへ反映

---

## 9. 採用コピー（確定）

| Field | EN | JA |
|-------|----|-----|
| `storyTitle` | Sergito Awaits | Sergitoが待つ |
| `description` 1行目 | Wood shop by the sea | 海辺の木の工房。 |
| `description` 2行目 | Figures on shelves. | 棚に並ぶ人形たち。 |
| loading `tagline` | Sergito's inside. | Sergitoは中にいる。 |
| dialogue `role` | MeebCo. CEO | MeebCo. CEO（会話 UI のみ。看板には出さない） |

---

## 10. 旧 placeholder（差し替え済み）

```ts
// src/top/topConfig.ts (sergito)
storyTitle: { en: 'MeebCo TODAY', ja: '今のMeebCo' }
description: {
  en: 'Wood shop. Shelf of figures.\nHe carries MeebCo on.',
  ja: '木の工房、棚の人形。\n継いでいく人。',
}

// MeetSergitoLoadingOverlay.tsx
tagline en: 'MeebCo today. That’s Sergito.'
tagline ja: '今のMeebCo、Sergito。'

// SergitoDialogueBox.tsx
role: 'MeebCo'
```

---

## 11. チェックリスト

- [ ] 看板 `storyTitle` に社名・役職・創設者がない
- [ ] 看板 `description` に MeebCo / 買収説明 / 操作説明がない
- [ ] JA は直訳臭くない・常体・「〜しよう」なし
- [ ] 文字数制限内
- [ ] lore（買収後の現 MeebCo の Sergito、創始者ではない）と矛盾しない
- [ ] 工房・棚・人形など**具体**が一言はある
- [ ] 他 AI / 人間が `attractionCopy.md` だけ読んでも方針が追える
