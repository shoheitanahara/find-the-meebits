# Product Context

## 会場

| ID | 表示名 | 解放 |
|----|--------|------|
| museum | Museum | 初期 |
| club | After Hours | Museum Grand Final クリア後 |

## ステージ進行（`gameProgression.ts`）

### Museum — PC

| # | 種別 | NPC 数 | ターゲット |
|---|------|--------|-----------|
| 1–5 | regular | 200→400 | 1 |
| 6–8 | challenge | 400 | 2 / 3 / 5 |

### Museum — モバイル（≤1023px）

| # | NPC 数 | ターゲット |
|---|--------|-----------|
| 1–5 | 100→200 | 1 |
| 6–8 | 200 | 2 / 3 / 5 |

### After Hours（Club）— PC

| # | kind | NPC 数 | ターゲット |
|---|------|--------|-----------|
| 1–3 | afterhours | 300→400 | 2 |
| 4 | afterhours | 400 | 3 |
| 5 | lastcall | 400 | 5 |

### After Hours — モバイル

| # | NPC 数 | ターゲット |
|---|--------|-----------|
| 1–3 | 150→200 | 2 |
| 4–5 | 200 | 3 / 5 |

## Shawn T. Art

- **Museum**: ギャラリー内クリエイター NPC、11 件専用セリフ（温かいトーン）
- **Club**: DJ ブース固定、Club 専用セリフ（`CLUB_CREATOR_DIALOGUE_LINES`）
- 会話は Meebit **#11143 番号単位**で回数記憶（会場共通）

## 会話方針

- 初回 / 再会でセリフプールを分ける（Museum / Club 各）
- 温かく親しみやすいトーン
- Museum の Shawn セリフ内容はユーザー指定 11 件を維持

## ヒント

- Museum: 6 エリア + 彫刻/ベンチ/VRM 彫刻
- Club: バー, VIP, DJ, 彫刻, スポットライト等（`clubLandmarks.ts`）
- 確率: `TARGET_HINT_CHANCE = 0.25`
- 8 方向（NE 等）は使わない

## Club 演出

- ダークパープル会場、ネオン、スポットライト
- ミラーボール + 床ディスコ光（ダンスフロア）
- DJ ブース奥に Shawn — 頭うなずき + 横ステップ、腕は下ろす

## タブ・BGM

- タブ非表示 = **全部止める**（レンダー・タイマー・BGM）
- 復帰後すぐ動き再開（ランダム停止はリセット）
- BGM: Museum 控えめ / Club さらに控えめ（vol 0.11）

## UI

- タブレット = スマホ UI
- ゲーム内テキストは英語
- Lucide アイコン（モバイル UI）

## インフラ方針

- VRM: Cloudflare R2 + Worker（Vercel 経由しない）
- BGM: デフォルト `public/audio/`、任意 CDN `VITE_BGM_BASE_URL`
- ゲーム本体: Vercel

## コミット・PR

- ユーザー明示依頼まで commit / push / PR しない

## 言語

- ユーザー会話: **日本語**
- ゲーム内: 英語
