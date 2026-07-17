# Active Context

最終更新: 2026-07-17

## 直近の作業サマリー

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
2. **会場座標**: Museum → `worldLandmarks.ts` / Club → `clubLandmarks.ts`
3. **DJ ブース collision** は `CLUB_DJ_BOOTH_LAYOUT` と `ClubProps` を同期すること
4. **Shawn Club 回転** は `0`（+Z = ダンスフロア）。`Math.PI` は後ろ向きになる
5. タブ非表示は **全部止める**方針。常時 delta クランプは使わない
6. commit はユーザー依頼時のみ

## デプロイチェックリスト（VRM — 変更なし）

1. `npm run vrm-worker:deploy`
2. Vercel `VITE_VRM_BASE_URL` → Redeploy
3. 任意: `VITE_BGM_BASE_URL`（BGM を R2/CDN に置く場合）
