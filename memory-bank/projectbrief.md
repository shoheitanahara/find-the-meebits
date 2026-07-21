# Project Brief

## 概要

**Meebits Park** は、遊園地ハブ（`/`）から 3 つの Meebits ゲームへ入場できるコレクション。プレイヤーは自分の Meebit（VRM アバター）を選び、パーク内を歩いてアトラクションへ入る。

| ルート | エディション | 内容 |
|--------|-------------|------|
| `/` `/jp` | `top` | Meebits Park（ハブ） |
| `/find-the-meebit` | `v1` | Find the Meebit |
| `/v2` | `v2` | Trait Hunt |
| `/8th-street` | `8th-street` | 8th Street |

ルート判定は `src/game/appEdition.ts`。`/` `/jp` は Park。

## 各ゲームのコア体験

### Meebits Park（`top`）

- 起動時にアバター選択カード（番号入力 / ランダム / 実 VRM プレビュー）
- 三人称・視点固定追従カメラ（本編 `FollowCamera` 相当のワールド固定オフセット）
- WASD / ジョイスティックで移動（速度 7、本編と同一）
- 建物の入口を通過すると自動でそのゲームへ遷移（アバター ID を引き継ぎ）
- 夜のクラシック遊園地。外周は海。噴水中央に Meebit #11143 の銅像
- NPC 30 体がランダム徘徊（3 種の歩行パターン、会話なし）

### Find the Meebit（`v1`）

- 大量の Meebits からターゲットを探し `E` でインタラクト
- **2 会場**: Museum（美術館）/ After Hours（クラブ）。Museum 制覇で Club 解放
- NPC 数・ターゲット数はステージと会場で増加。180 秒タイムアタック

### Trait Hunt（`v2`）

- 特徴（髪・服・アクセサリ等）のヒントに一致する Meebit を探す試作。Museum のみ・短ループ

### 8th Street（`8th-street`）

- 一人称。クランク型の夜の路地を歩き、変化を見破って進むループ
- 10 体の歩行者、8 回進むとクリア（`EIGHT_STREET.targetProgress`）

## 共通導線

- 各ゲームに**薄い常設ヘッダー**（左「Meebits Park」／右「Back to Top」）
- 「Back to Top」は確認ダイアログ付き（誤操作防止）。パークの元の建物前へ復帰
- パーク復帰時はアバター選択カードを再表示しない（`?from=<attraction>`）

## 対象プラットフォーム

| 区分 | 条件 |
|------|------|
| PC | 幅 1024px 以上 |
| タッチ UI | 幅 1023px 以下（スマホ + タブレット） |

## インフラ

| 役割 | サービス |
|------|---------|
| ゲーム本体 | Vercel（`https://meebits-park.vercel.app`） |
| VRM | Cloudflare R2 + Worker |
| BGM（任意 CDN） | `VITE_BGM_BASE_URL` or `public/audio/` |

## クリエイター NPC

- ID: `npc-shawn-t-art` / Meebit #11143
- Museum: ギャラリー内 / Club: DJ ブース `[0, 0.06, -42.62]`
- Park: 噴水中央の銅像として #11143 を使用（NPC ではなく彫刻）

## 非目標

- サーバーゲームロジック・マルチプレイ・ランキングなし
- DB なし（localStorage: プレイヤー位置 + 会話回数 + プレイヤー Meebit 番号）
