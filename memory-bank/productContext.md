# Product Context

## ステージ進行（`gameProgression.ts`）

### PC

| # | 種別 | NPC 数 | ターゲット |
|---|------|--------|-----------|
| 1–5 | regular | 200→250→300→350→400 | 1 |
| 6 | semifinal | 400 | 2 |
| 7 | final | 400 | 3 |
| 8 | grandfinal | 400 | 5 |

### モバイル・タブレット（≤1023px）

| # | 種別 | NPC 数 | ターゲット |
|---|------|--------|-----------|
| 1–5 | regular | 100→125→150→175→200 | 1 |
| 6–8 | challenge | 200 | 2 / 3 / 5 |

## ユーザー嗜好（会話で確定した方針）

### ヒント

- 単独で 8 方向は出さない
- 東西 + 奥/前の組み合わせは OK
- ランドマーク:
  - ブロック彫刻: `near a black sculpture` / `near a white sculpture`
  - **VRM 彫刻**: `near a gray Meebit sculpture on a white/black pedestal`
  - ベンチ: `near a bench`
- Golden Tree ヒントは **削除済み**
- 壁アート・看板・ステージ等のピンポイントヒントは削除済み
- 遠距離はエリア名をぼかす
- ヒント確率: **0.25**

### ターゲットプレビュー

- **常に静止画**（3D ライブプレビューは使わない）
- 共有 1 Canvas でキャプチャ（パフォーマンス重視）

### UI

- タブレットはスマホと同じ UI・操作（ストティック必須）
- PC の Grand Final（5 体）HUD は 3 体版と同じ `h-28 w-28` サイズ
- ゲーム内 UI テキストは英語

### ワールドオブジェクト

- Sculpture は美術館**内側**に配置
- Sculpture は正面をギャラリー中心に向ける
- light sculpture は白土台 + 白彫刻で dark と明確に区別
- **VRM 彫刻**はグレー Meebit + 白/黒台座（Golden Tree の代替）

### インフラ方針

- **VRM は Vercel 経由にしない**（帯域コスト）
- Cloudflare R2 + Worker で CORS 付き配信
- ゲーム本体は Vercel のまま

### 一般 NPC セリフ（`npcDialoguePool.ts`）

- 英検準 2 級程度の簡単英語
- 嘘の方向・ヒントっぽい台詞は削除
- Meebits 世界観の台詞を増やす方向

### Shawn T. Art セリフ

- `npcGeneration.ts` にユーザー指定 11 件

## コミット・PR

- ユーザーが明示依頼するまで **git commit / push / PR 作成しない**
- コミットメッセージは why 重視、1–2 文

## 言語

- ユーザーとの会話: **日本語**
- ゲーム内テキスト: 英語
