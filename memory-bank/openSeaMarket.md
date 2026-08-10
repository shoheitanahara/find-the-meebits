# OpenSea Market（`/opensea-market`）

Sea 中央の室内アトラクション。OpenSea の **公開 Listing** から Meebit を選び、室内を歩かせて会話で価格を教える。

## ルート / 配線

| 項目 | 値 |
|------|-----|
| パス | `/opensea-market` `/jp/opensea-market` |
| edition | `opensea`（`appEdition.ts`） |
| Park | Sea 中央スロット `attractionId: opensea`（旧 TIDE POOL 工事中枠を置換） |
| 復帰 | `?from=opensea` |

## Listing API

- **本番**: Vercel Serverless `api/opensea/meebits-listings.ts` → `GET /api/opensea/meebits-listings`
- **ローカル**: Vite middleware（`vite.config.ts` の `openseaListingsDevApi`）が同パスを処理
- **共有ロジック**: `api/opensea/meebits-listings.ts`（単一ファイル。ESM 相対 import 事故回避）
- **キー**: Developer Portal の永続キー `OPENSEA_API_KEY`（`VITE_` 禁止）。Instant Key は使わない
- **取得**: `listings/collection/meebits/best`（最大数ページ）。契約一致で tokenId 正規化
- **キャッシュ**: Listing メモリ 15分 + `Cache-Control: s-maxage=900, stale-while-revalidate=3600`
- **障害時**: `{ listings: [], error }` — Park / 入場は止めない。NPC 0。UI に error を表示

## 室内（`src/openSeaMarket/`）

Meet Sergito 同型の別ルート室内。

| ファイル | 役割 |
|----------|------|
| `OpenSeaMarketApp.tsx` | Canvas + HUD + 会話 |
| `config.ts` | 部屋寸法・NPC 上限（PC/SP とも 30） |
| `store.ts` | listings / session 固定選抜 / boot |
| `world/MarketRoom.tsx` | 青系軽量室内 |
| `world/MarketWalkers.tsx` | Listing メンバーの徘徊 |
| `dialogue/` | 価格テンプレ + OpenSea リンク |
| `player/` | 移動・タッチ・会話カメラ |

### NPC 選抜

1. 起動時に `/api/opensea/meebits-listings` を1回
2. シャッフルして最大 N（`isMobilePerfMode`）
3. セッション中は入れ替えない（`sessionListings`）
4. 空配列なら NPC 0・入場可

### 会話

- EN/JA 固定2行 + 任意 `View on OpenSea`
- URL: `https://opensea.io/assets/ethereum/{contract}/{tokenId}`

## 手動確認

1. `.env` / Vercel に `OPENSEA_API_KEY`（Portal 永続キー）
2. `/api/opensea/meebits-listings` が `listings` を返す（失敗時は `error`）
3. Sea 中央に **OpenSea Market** → 入場 → Listing Meebit が歩く
4. 話しかけて価格 + リンク
5. API 失敗でも白画面にならない
