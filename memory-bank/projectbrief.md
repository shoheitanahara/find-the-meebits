# Project Brief

## 概要

**Find the Meebit** は、3D ワールドに大量の Meebits（VRM アバター）がいる中から、指定ターゲットを見つけて `E` でインタラクトする探しゲーム。

**2 会場**: Museum（美術館）と After Hours（クラブ）。Museum を制覇すると Club が解放される。

## コア体験

- ステージ開始時にターゲット Meebit 番号とプレビューを確認
- WASD / モバイルジョイスティックで移動
- 近づいて `E` で会話・検査 → 正解でクリア
- NPC 数・ターゲット数はステージと会場で増加
- 180 秒タイムアタック

## 対象プラットフォーム

| 区分 | 条件 |
|------|------|
| PC | 幅 1024px 以上 |
| タッチ UI | 幅 1023px 以下（スマホ + タブレット） |

## ワールド

### Museum

- 明るい美術館、入口 +Z（開始 `[0, 0, 62]`）
- VRM 彫刻 9、ブロック彫刻 8、ベンチ 6

### After Hours（Club）

- ダーククラブ、同一ワールド半径
- ネオン、VIP、バー、DJ ブース、ミラーボール
- Shawn T. Art が DJ ブースに固定

## インフラ

| 役割 | サービス |
|------|---------|
| ゲーム本体 | Vercel |
| VRM | Cloudflare R2 + Worker |
| BGM（任意 CDN） | `VITE_BGM_BASE_URL` or `public/audio/` |

## クリエイター NPC

- ID: `npc-shawn-t-art`
- Meebit #11143
- Museum: ギャラリー内 / Club: DJ ブース `[0, 0.06, -42.62]`

## 非目標

- サーバーゲームロジック・マルチプレイ・ランキングなし
- DB なし（localStorage: プレイヤー位置 + 会話回数 v2）
