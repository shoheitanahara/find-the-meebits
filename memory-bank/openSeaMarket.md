# OpenSea Market（`/opensea-market`）

Sea 中央の室内アトラクション。OpenSea の **公開 Listing** と **直近売却** を、Digital Sculpture として台座展示するギャラリー。

**体験の正**: 出品個体は歩かない。2倍スケールのカラー静止 VRM が台座に立つ。歩くのは案内 NPC のみ（値段・自己出品には触れない）。

## ルート / 配線

| 項目 | 値 |
|------|-----|
| パス | `/opensea-market` `/jp/opensea-market` |
| edition | `opensea`（`appEdition.ts`） |
| Park | Sea 中央スロット `attractionId: opensea`（旧 TIDE POOL 工事中枠を置換） |
| 看板 | `topConfig.ts` — JA「美しいMeebitsの彫刻が並ぶギャラリー。」 / EN「A gallery of beautiful Meebits sculptures.」 |
| 復帰 | `?from=opensea`。Visitor Pass は入場で Visited |

## Listing / Sales API

- **本番**: Vercel Serverless `api/opensea/meebits-listings.ts` → `GET /api/opensea/meebits-listings`
- **ローカル**: Vite middleware（`vite.config.ts` の `openseaListingsDevApi`）が同パスを処理
- **共有ロジック**: `api/opensea/meebits-listings.ts`（**依存ゼロの単一ファイル**。`src/` 相対 import 禁止 — ESM で FUNCTION_INVOCATION_FAILED になる）
- **キー**: Developer Portal の永続キー `OPENSEA_API_KEY`（`VITE_` 禁止）。Instant Key は使わない
- **出品**: `listings/collection/meebits/best`（最大5ページ・unique 上限100）。契約一致で tokenId 正規化。安い方を残す
- **売却**: `events/collection/meebits?event_type=sale&after=now-48h`。最大 **10** unique。出品中 token は売却扱いしない（再出品を優先）
- **payload**: `listings: ListedMeebit[]` に出品＋売却を混在。売却は `status: 'sold'` + `soldAt`
- **キャッシュ**: メモリ 15分 + `Cache-Control: s-maxage=900, stale-while-revalidate=3600`
- **障害時**: 出品失敗 → `{ listings: [], error }` で入場継続。売却だけ失敗 → 出品のみ返す（ギャラリーは止めない）

クライアント型: `src/opensea/types.ts`（`ListedMeebit` / `isSoldMeebit`）。API ファイルは型を複製する。

## 室内（`src/openSeaMarket/`）

| ファイル | 役割 |
|----------|------|
| `OpenSeaMarketApp.tsx` | Canvas + HUD + 会話 + ギャラリー切替 |
| `config.ts` | 部屋寸法（`ROOM_SCALE` 2.7）・台座30・案内10・売却混ぜ上限10・3室 |
| `pickSessionListings.ts` | MAIN=最新30、残り WEST/EAST。売却を MAIN→左右へ散らす |
| `store.ts` | galleries / activeRoomIndex / ゲート開口 / boot |
| `world/MarketRoom.tsx` | 青系室内。MAIN のみ入口壁開口。左右は隣があれば空洞ゲート |
| `world/MarketPedestals.tsx` | 彫刻台座・透明値札・SOLD リボン |
| `world/soldRibbonTexture.ts` | 左上コーナリボン CanvasTexture（SOLD） |
| `world/MarketWalkers.tsx` | 案内歩行 NPC（listing 非紐づけ・日シードランダム ID） |
| `world/MarketGalleryPortals.tsx` | 左右空洞ゲート。奥まで踏むとフェード切替 |
| `world/MarketExitPad.tsx` | **MAIN のみ** EXIT |
| `ui/MarketMinimap.tsx` | WEST / MAIN / EAST。ゲート位置の短い印。会話中は薄く |
| `ui/SoldCornerRibbon.tsx` | 会話プレビュー用 CSS リボン |
| `dialogue/` | 出品／売却で文言分岐 + OpenSea リンク |
| `player/MarketPlayer.tsx` | 移動。彫刻カメラは **プレイヤー位置非依存の正面斜め固定** |

### 3ギャラリー

- **WEST / MAIN / EAST**（`roomCount: 3`、`defaultRoomIndex: 1` = MAIN）
- 同時表示は最大30体（現在部屋のみ）
- MAIN = 最新30件（台座配置はシャッフル）
- 残り出品 → WEST / EAST
- 48時間以内の売却（最大10）を MAIN→WEST→EAST の順に混ぜる。満室ならその室の古い出品と入れ替え
- 部屋間・部屋内とも tokenId 重複なし
- 入室: 左右壁の空洞ゲート（建物入口と同じフェード）。WEST 到着は右下、EAST 到着は左下（Y字）
- EXIT は MAIN のみ。WEST/EAST 手前壁は閉塞
- UI 切替ボタンなし。ミニマップ左上（MAIN に EXIT、接続壁にゲート印）

### 彫刻 / 値札

- `acquireVrmColorExhibitScene`（グレー化しない。直立ポーズは Photo Booth と共通 `applyVRMAttentionPose`）
- スケール約2倍（`sculptureVrmScale`）
- 向き: 入口（+Z）正面（`rotationY: 0`）
- 値札: 半透明＋アウトライン文字（足元が見える）。サイズは出品／売却で共通（1.85 × 0.72）
- 売却: 値札左上に赤い斜めリボン＋金文字 **SOLD**。価格行は ETH のまま中央（番号を右寄せしない）
- リボン定数: `RIBBON_SIZE = 0.7`。文字位置は `soldRibbonTexture.ts` の translate（内側寄せ）

### 会話 / カメラ

- 彫刻: `createListingDialogue` — 出品は価格、売却は「48時間以内に売れた」
- 案内: `createGuideDialogue` — 値段・自己出品に触れない
- SP: 彫刻は View/見る、案内は Talk/話す。彫刻に赤ピンは出さない
- 彫刻カメラ: 彫刻 `rotationY` 基準の正面斜め。左右は壁クリアランスだけで選び会話中ロック。プレイヤー位置は使わない
- 案内カメラ: 従来どおりプレイヤー基準
- 会話中は歩行停止。ミニマップは `dialogueChromeDimClass`（消さず薄く）

### 座標系（Runway と同じ）

- **+Z = 手前（入口）**、**+Y = 上**
- 詳細は `.cursor/rules/threejs-coordinates.mdc`

## 手動確認

1. `.env` / Vercel に `OPENSEA_API_KEY`（Portal 永続キー）
2. `/api/opensea/meebits-listings` が `listings` を返す。売却は `status: "sold"`
3. Sea 中央 **OpenSea Market** → 入場 → 彫刻が並ぶ（歩いて出品しない）
4. 値札で価格 / SOLD リボン。近づいて会話 + OpenSea リンク
5. 左右ゲートで WEST / EAST。ミニマップの印と一致。EXIT は MAIN のみ
6. 彫刻カメラはどこから話しかけても正面斜め
7. API 失敗でも白画面にならない
