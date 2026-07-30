# Active Context

最終更新: 2026-07-30

## 直近の作業サマリー

### Park NPC 会話

- Mountain NPC: Mt. Meeb / Jerry Mountain / Shooting Gallery の3施設を個別プールで話す
- Culture NPC: Runway / Look Locker を個別プールで話す
- Sea NPC: Meet Sergito 工房での観察・Traitコメント体験を話す
- Astro NPC: 地区固有の挨拶・工事中3棟・主役・Trait会話を使う

### Astro District（パーク新ゾーン）— Open（工事中建物のみ）

- **Zone ID**: `astro`（Mountain の北 × Culture の東）
- **接続**: Mountain 北門 `mountain-to-astro` / Culture 東門 `culture-to-astro`（双方向）
- **地面**: `AstroDistrictGround`（レゴリス・金属パネル・シアン発光ライン）
- **建物**: 共通3スロットに工事中のみ（STAR DOME / LUNAR LAB / ORBITAL PORT）。`TOP_ATTRACTIONS` 未登録＝進入不可
- **NPC**: 日次15体・Robot / Visitor 8体＋他Type 7体（`dailyFeatured` STORAGE_KEY `v11`）
- **家具**: Astro専用ベンチ＋環状ライト街灯（ベンチ横オブジェは置かない）
- **軽量化**: Astroの街灯・ビーコン・工事中棟はemissive表現を維持し、個別pointLightを省略
- **NPC会話**: Astro専用の挨拶・地区雑談・今日の主役・Trait会話。Mountain会話の流用なし
- **スロット正本**: `src/top/parkAttractionSlots.ts`（Mountain 配置を全区デフォルト化）

### Mountain Shooting Gallery（`/shooting-gallery`）— Open

- **名称**: Shooting Gallery（仮）
- **ルート**: `/shooting-gallery` `/jp/shooting-gallery` → edition `shooting` → `ShootingGalleryApp`（`src/shootingGallery/`）
- **パーク導線**: Mountain District 東棟 `TOP_ATTRACTIONS` id=`shooting`（建物位置 `(15.7, -11.0)`）
- **体験**: 45秒・固定射撃位置・三人称右肩越し。動く的をポインターで撃つスコアアタック
- **操作**: PC マウス照準 + クリック発砲（Pointer Lock）。SP 画面ドラッグ照準 + 右下 Fire
- **的**: 高品質な丸的（金／赤／通常／小）。Bullseye ×2
- **スコア**: 通常100 / 小・速200 / 金500 / 赤-300。コンボ倍率 1 / 1.5 / 2

主要ファイル:

| 用途 | パス |
|------|------|
| 定数 | `src/shootingGallery/config.ts` |
| 状態 | `src/shootingGallery/store.ts` |
| App | `src/shootingGallery/ShootingGalleryApp.tsx` |
| プレイヤー / カメラ / 入力 | `src/shootingGallery/player/` |
| 会場・的 | `src/shootingGallery/world/` |
| UI | `src/shootingGallery/ui/` |

### Meebits Runway（`/runway`）— Open

- **名称**: Meebits Runway（旧 Fashion Runway）
- **ルート**: `/runway` `/jp/runway` → edition `runway` → `RunwayApp`（`src/runway/`）
- **パーク導線**: Culture District の `TOP_ATTRACTIONS` id=`runway`。看板 subtitle `The Catwalk`、storyTitle `TODAY'S COLOR WALKS`
- **体験**: 白黒暗室＋中央ランウェイ。日替わりカラーテーマに合う Meebit がキャットウォーク。観客はベンチ着席＋呼吸ポーズ
- **空席・着席**: 日替わり 4〜8 空席。接近で Sit（E / モバイルボタン）。立ち上がりは通路側へ逃がす（`resolveRunwayStandUpPosition`）
- **ベンチ当たり**: mesh 軸は local X=長辺 / local Z=奥行。前後隣ベンチ間・列間通路側を非対称に短縮（`benchCollision` + `collisions.ts`）
- **視点**: 三人称オービット。マウス: `+movementY` = 下を見る。**スマホタッチ: `-lookDeltaY`（上下反転・指上スワイプで上を見る）**
- **座標・接地**: `.cursor/rules/threejs-coordinates.mdc`（alwaysApply）。Runway は +Z=手前（入口）、−Z=奥（スクリーン）
- **BGM**: `RunwayBgmSystem` + `src/audio/runwayAudioConfig.ts` → `/audio/runway/Meebits Runway.mp3`

主要ファイル:

| 用途 | パス |
|------|------|
| 寸法・接地・当たり | `src/runway/config.ts` |
| 衝突 | `src/runway/collisions.ts` |
| 座席・Sit | `src/runway/runwaySeats.ts` |
| 日替わりショー | `src/runway/dailyRunway.ts` |
| プレイヤー | `src/runway/player/RunwayPlayer.tsx` |
| 会場 | `src/runway/world/RunwayRoom.tsx` |
| 観客 | `src/runway/show/RunwayAudience.tsx` |
| Sit UI | `src/runway/ui/RunwaySitControls.tsx` |
| Three.js 座標ルール | `.cursor/rules/threejs-coordinates.mdc` |

### Park 配置の凍結

- **Canonical Default Layout** を `memory-bank/parkDesigner.md` §14 に記録（2026-07-24）
- 正本コード: `src/top/parkZones.ts`（家具・ゲート・Coming Soon）+ `src/top/topConfig.ts`（建物）
- Culture の Meebits Runway は **Open**（§14.4 更新済み）
- 封印門は本ゲートと同品質（開口・橋・門・通過不可衝突）
- Coming Soon は南西／南東の建設中ランドマーク棟
- 以降の Park レイアウト変更は §14 とコードをセットで更新すること

### Meebits Park（`/`）ハブ + ルーティング

- **ルート変更**: `/` `/jp` = Meebits Park（`top`）。旧本編は `/find-the-meebit` へ移設。**互換リダイレクトなし**
  - `src/game/appEdition.ts` で判定。SPA fallback は `vite.config.ts` + `vercel.json` 両方に追加
- **パーク（`src/top/`）**: アバター選択 → 入場。`?from=<attractionId>` で自動 start(spawn)
- **共通ヘッダー**: `ParkReturnButton`（左「Meebits Park」/右「Back to Top」）
- **本番ドメイン**: `https://meebits-park.vercel.app`。ドメイン変更時は Worker `ALLOWED_ORIGINS` 必須

### 8th Street / After Hours / タブ停止 / BGM

- 8th Street: 一人称クランク路地。定数 `src/eightStreet/config.ts`
- Club: Museum Grand Final 後解放。Shawn は DJ 固定（`CLUB_CREATOR_DJ_POSITION`）
- タブ非表示: レンダー停止 + タイマー除外 + BGM pause（常時 delta クランプは使わない）
- Museum/Club BGM: `VenueBgmSystem` + `venueAudioConfig.ts`

## 現在のブランチ状態

- Fashion Runway（着席・ベンチ当たり・タッチ視点反転・BGM・接地調整）は **作業ツリーに未コミットの可能性あり**
- Worker / Vercel VRM 構成は以前どおり（変更なし）

## 次に触る可能性が高いファイル

| 用途 | パス |
|------|------|
| Runway 寸法・接地・当たり | `src/runway/config.ts` |
| Runway 衝突 | `src/runway/collisions.ts` |
| Runway 座席 | `src/runway/runwaySeats.ts` |
| Runway プレイヤー | `src/runway/player/RunwayPlayer.tsx` |
| Three.js 座標 | `.cursor/rules/threejs-coordinates.mdc` |
| パーク UI/入場 | `src/top/TopApp.tsx` |
| パーク建物設定 | `src/top/topConfig.ts` |
| パーク ゾーン | `src/top/parkZones.ts` |
| ルート判定 | `src/game/appEdition.ts` |
| SPA fallback | `vite.config.ts`, `vercel.json` |
| Club 座標・DJ | `src/world/clubLandmarks.ts`, `ClubProps.tsx` |
| BGM（会場） | `src/systems/VenueBgmSystem.tsx`, `src/audio/venueAudioConfig.ts` |
| BGM（Runway） | `src/runway/RunwayBgmSystem.tsx`, `src/audio/runwayAudioConfig.ts` |

## エージェント向け注意

1. **Next.js ではない** — Vite + React
2. **`/` は Park**（`top`）。本編は `/find-the-meebit`。新ルートは `vite.config.ts` + `vercel.json` の両方に登録
3. **本番ドメイン変更時は Worker `ALLOWED_ORIGINS` を更新して再デプロイ**（忘れると VRM が CORS 全滅）
4. **会場座標**: Museum → `worldLandmarks.ts` / Club → `clubLandmarks.ts` / Park 建物 → `topConfig.ts` / **Runway → `runway/config.ts`**
5. **パーク NPC は `useVRMModel(exclusive:true)`**（プール共有だと T ポーズになる）
6. **DJ ブース collision** は `CLUB_DJ_BOOTH_LAYOUT` と `ClubProps` を同期すること
7. **Shawn Club 回転** は `0`（+Z = ダンスフロア）。`Math.PI` は後ろ向きになる
8. タブ非表示は **全部止める**方針。常時 delta クランプは使わない
9. **Runway 座標**: +Z=手前（入口）、−Z=奥。ベンチ mesh は local X=長辺 / local Z=奥行。詳細は `.cursor/rules/threejs-coordinates.mdc`
10. **Runway タッチ視点**: pitch は `-lookDeltaY`（マウスの `+movementY` とは逆）。変えるときは両方確認
11. commit はユーザー依頼時のみ

## デプロイチェックリスト

1. **本番ドメインを変えた場合**: `workers/vrm-cache/wrangler.toml` の `ALLOWED_ORIGINS` に新ドメイン追加
2. `npm run vrm-worker:deploy`
3. Vercel `VITE_VRM_BASE_URL` → Redeploy
4. 新ルートを足したら `vite.config.ts`（`SPA_FALLBACK_PATHS`）と `vercel.json` を確認（`/runway` 済み）
5. 任意: `VITE_BGM_BASE_URL`（BGM を R2/CDN に置く場合）
