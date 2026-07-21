# Active Context

最終更新: 2026-07-22

## 直近の作業サマリー

### Meebits Park（`/`）ハブ新設 + ルーティング刷新（最新）

- **ルート変更**: `/` `/jp` = Meebits Park（`top`）。旧本編は `/find-the-meebit` へ移設。**互換リダイレクトなし**
  - `src/game/appEdition.ts` で判定。SPA fallback は `vite.config.ts` + `vercel.json` 両方に追加
- **パーク（`src/top/`）**:
  - `TopApp.tsx` — アバター選択カード（番号/ランダム + 実 VRM プレビュー）→ 入場。`?from=<attractionId>` があれば自動 start(spawn)（選択カードスキップ、該当建物前へ）
  - `TopScene.tsx` — `TopFollowCamera`（本編相当の追従）、3 建物、噴水 + #11143 銅像（`VrmSculpture` の `hidePedestal`）、NPC 30 体（3 種歩行、会話/衝突なし、`exclusive:true` で T ポーズ回避）、ベンチ衝突、夜 + 海の演出
  - `topConfig.ts` — `TOP_ATTRACTIONS`（find/traits/street）: 座標・色・説明看板（`storyTitle`/`description` EN/JA）
  - `topStore.ts` — `start(spawn?)` でスポーン座標指定可
- **共通ヘッダー**: `ParkReturnButton` を全ゲームに無条件マウント（左「Meebits Park」/右「Back to Top」）。確認ダイアログ付き。既存 UI（タイマー/HUD/言語切替）はヘッダー分だけ下げた
- **ページメタ**: `src/game/pageMetadata.ts` の `applyPageMetadata(edition, locale)` を `App.tsx` で edition 変化時に適用
- **本番ドメイン**: `https://meebits-park.vercel.app`。移行時に Worker `ALLOWED_ORIGINS` 追加漏れで VRM が CORS 全滅 → `wrangler.toml` に追加して再デプロイで解消

### 8th Street（`/8th-street`）

- 一人称・クランク型夜路地の間違い探しループ。定数は `src/eightStreet/config.ts`（`EIGHT_STREET` / `NIGHT_MOOD`）
- 10 体歩行者、`targetProgress`(8) 回前進でクリア。最終左折でワープ（白フェード）
- 当たり: `clampToAlley()`（回廊 + 最終コーナー L 字ソリッド）

### 日本語化 `/jp`（実装済み・翻訳は調整中）

- **ロケール**: `src/i18n/locale.ts` — `/jp` パスで `ja`、それ以外 `en`
- **UI辞書**: `src/i18n/ui.ts` — `ui()` で取得
- **セリフ**: `src/i18n/dialogue/` — Museum/Club 初回・再会・発見・Shawn、ヒント・ランドマーク
- **切替**: スタート画面右上 `LanguageSwitcher`（フルリロードで `/` ↔ `/jp`）
- **Vercel**: `vercel.json` で `/jp` → `index.html`
- **Vite**: `jpSpaFallback` プラグインでローカルでも `/jp` 表示可
- NPC セリフ・ヒント・Tips・HUD・クリア/タイムアップ等も locale 連動

### After Hours（Club 会場）— 主要実装済み

- **2 会場**: `museum`（Museum） / `club`（After Hours）— `venueId` で分岐
- **解放**: Museum Grand Final クリア後 → `afterHoursUnlockPending` → Club へ
- **進行**: Club 独自 5 ステージ（`afterhours` ×4 + `lastcall`）— `gameProgression.ts`
- **ワールド**: `ClubWorld.tsx`, `ClubProps.tsx`, `clubLandmarks.ts`, `ClubSpotlights.tsx`, `ClubMirrorBall.tsx`
- **当たり判定**: `obstacles.ts` の `buildClubObstacles()`（DJ ブースは counter + side cabinets のみ）

### Shawn T. Art — Club DJ ブース（完了）

- Museum: 従来位置 `[-10, 0, -14]` で徘徊・会話
- **Club**: DJ ブース奥に固定 — `CLUB_CREATOR_DJ_POSITION = [0, 0.06, -42.62]`, rotation `0`（ダンスフロア向き）
- **DJ ブース形状**: 手前カウンター + ターンテーブル + ミキサー + 奥プラットフォーム + サイドキャビネット
  - **削除済み**: 青いバックパネル、薄ピンクのネオン棒（カウンター上）
- **モーション**: `applyVRMDjPose()` — 頭の小ギザミうなずき、横ステップ、腕は他 NPC と同様に下ろす
- **NPC 分岐**: `NPC.tsx` の `isClubDj` — 徘徊なし、タブ復帰時も LOD スキップなし
- レイアウト定数: `CLUB_DJ_BOOTH_LAYOUT`（`clubLandmarks.ts`）— 描画・collision 共有

### タブ非表示時の完全停止（完了）

- **レンダー**: `GameCanvas` — `frameloop="never"` when hidden
- **タイマー**: `tabPause.ts` + `TabPauseSystem` — 非表示時間を `getElapsedSeconds` から除外
- **BGM**: `VenueBgmSystem` — visibility で pause/resume
- **復帰時**: `TabResumeInvalidator` で `invalidate()`、`clampFrameDeltaAfterTabResume`（80ms 窓）、NPC `pauseUntilRef` リセット
- **削除**: 常時 `clampFrameDelta`（通常プレイのガタつき原因だった）

### BGM（会場別 MP3）

- `VenueBgmSystem.tsx` + `venueAudioConfig.ts`
- Museum: `/audio/museum-bgm.mp3` vol 0.7
- Club: `/audio/club-bgm.mp3` vol 0.11
- 任意 CDN: `VITE_BGM_BASE_URL`
- `cleared` フェーズ中も再生継続

### 会話・記憶

- **初回/再会セリフ** — Museum / Club 各プール、温かいトーン
- **会話回数**: Meebit **番号単位** — `talkedCountByMeebit` in `meebits-world-save-v2`
- Shawn Museum セリフ 11 件維持、Club 用は `npcClubDialogue.ts` の `CLUB_CREATOR_DIALOGUE_LINES`
- 会話カメラ: `FollowCamera.tsx` — 左右 2 候補（近い位置 +Z 側優先）

### Club 演出

- **ミラーボール**: `ClubMirrorBall.tsx` — 床ディスコ光（ダンスフロア中心）
- **スポットライト**: `ClubSpotlights.tsx` — ランドマーク別プール

### パフォーマンス（モバイル）

- Canvas DPR 最大 **1** 固定（`getMaxCanvasDpr()`）
- 同時 VRM 上限削減（モバイル perf モード）

## 現在のブランチ状態

- 上記 Club / タブ停止 / DJ / BGM 等は **作業ツリーに未コミットの可能性あり**
- Worker / Vercel VRM 構成は以前どおり（変更なし）

## 次に触る可能性が高いファイル

| 用途 | パス |
|------|------|
| パーク UI/入場 | `src/top/TopApp.tsx` |
| パーク 3D/NPC | `src/top/TopScene.tsx` |
| パーク建物設定 | `src/top/topConfig.ts` |
| 共通ヘッダー/戻る | `src/ui/ParkReturnButton.tsx` |
| ルート判定 | `src/game/appEdition.ts` |
| SPA fallback | `vite.config.ts`, `vercel.json` |
| ページメタ | `src/game/pageMetadata.ts` |
| 8th Street 座標 | `src/eightStreet/config.ts` |
| Club 座標・DJ | `src/world/clubLandmarks.ts`, `ClubProps.tsx` |
| Shawn DJ ポーズ | `src/avatar/VRMLocomotion.ts` (`applyVRMDjPose`) |
| Shawn 配置 | `src/npc/npcGeneration.ts` (`getCreatorNpcForVenue`) |
| タブ停止 | `src/systems/tabPause.ts`, `GameCanvas.tsx` |
| BGM | `src/systems/VenueBgmSystem.tsx`, `src/audio/venueAudioConfig.ts` |
| 会場進行 | `src/game/gameProgression.ts`, `src/stores/gameStore.ts` |
| 会話記憶 | `src/systems/save/localStorage.ts` |
| VRM URL | `src/avatar/VRMLoader.ts` |

## エージェント向け注意

1. **Next.js ではない** — Vite + React
2. **`/` は Park**（`top`）。本編は `/find-the-meebit`。新ルートは `vite.config.ts` + `vercel.json` の両方に登録
3. **本番ドメイン変更時は Worker `ALLOWED_ORIGINS` を更新して再デプロイ**（忘れると VRM が CORS 全滅）
4. **会場座標**: Museum → `worldLandmarks.ts` / Club → `clubLandmarks.ts` / Park 建物 → `topConfig.ts`
5. **パーク NPC は `useVRMModel(exclusive:true)`**（プール共有だと T ポーズになる）
6. **DJ ブース collision** は `CLUB_DJ_BOOTH_LAYOUT` と `ClubProps` を同期すること
7. **Shawn Club 回転** は `0`（+Z = ダンスフロア）。`Math.PI` は後ろ向きになる
8. タブ非表示は **全部止める**方針。常時 delta クランプは使わない
9. commit はユーザー依頼時のみ

## デプロイチェックリスト

1. **本番ドメインを変えた場合**: `workers/vrm-cache/wrangler.toml` の `ALLOWED_ORIGINS` に新ドメイン追加
2. `npm run vrm-worker:deploy`
3. Vercel `VITE_VRM_BASE_URL` → Redeploy
4. 新ルートを足したら `vite.config.ts`（`SPA_FALLBACK_PATHS`）と `vercel.json` を確認
5. 任意: `VITE_BGM_BASE_URL`（BGM を R2/CDN に置く場合）
