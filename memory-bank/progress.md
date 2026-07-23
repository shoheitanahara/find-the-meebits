# Progress

## 完了済み

### Meebits Park（ハブ / `top`）

- [x] `/` を Park に、本編を `/find-the-meebit` に移設（互換リダイレクトなし）
- [x] アバター選択カード（番号 / ランダム + 実 VRM プレビュー）
- [x] 固定追従カメラ（本編相当の距離感）+ WASD/ジョイスティック移動
- [x] Plaza 3 建物（find / traits / street）+ Mountain 地区＋ Coming Soon 棟
- [x] 外周キット（川・壁・橋・本ゲート・封印門）+ ゾーン切替
- [x] **Canonical Default Layout 凍結**（`parkDesigner.md` §14 / 2026-07-24）
- [x] ストーリーテリング調の説明看板（EN/JA）
- [x] 噴水 + 本日の主役、街灯・ベンチ・植栽（対称グリッド）
- [x] NPC 30 体（3 種歩行、会話/衝突なし、T ポーズ修正）
- [x] パーク復帰時のスポーン（建物前）+ 選択カードスキップ（`?from=`）

### 8th Street（`/8th-street`）

- [x] 一人称・クランク型夜路地のループ
- [x] 歩行者 10 体 / 8 回前進クリア / 白フェードワープ
- [x] 夜のムード（`NIGHT_MOOD`）+ 路地当たり判定（`clampToAlley`）

### 共通導線・ルーティング

- [x] 全ゲーム共通ヘッダー（Meebits Park / Back to Top、確認ダイアログ付き）
- [x] URL パス判定（`appEdition.ts`）+ SPA fallback（Vite / Vercel）
- [x] edition 別ページメタ（`pageMetadata.ts`）
- [x] 本番ドメイン `meebits-park.vercel.app` + Worker CORS 追加

### コアゲーム

- [x] Museum 8 ステージ進行（regular ×5 + semifinal / final / grandfinal）
- [x] **After Hours（Club）5 ステージ**（afterhours ×4 + lastcall）
- [x] Museum クリア後 Club アンロック
- [x] PC / モバイル NPC 数分岐（会場別）
- [x] 複数ターゲット（最大 5）の発見・クリアフロー
- [x] タイムアタック 180 秒
- [x] 会話システム（E キー / モバイルインタラクト）

### 3D・VRM

- [x] VRM 足元接地（`alignVrmFeetToGround`, `VRM_FEET_Y_OFFSET`）
- [x] VRM インスタンスプール + LRU キャッシュ
- [x] LOD（距離ベース VRM ロード/アンロード）
- [x] ステージ切替時の安全なメモリ回収
- [x] RETRY 時のメモリリーク修正
- [x] Cloudflare R2 + Worker による VRM 配信
- [x] Museum VRM 彫刻 9 体 / Club VRM 彫刻 6 体
- [x] モバイル DPR=1、同時 VRM 上限調整

### After Hours（Club）

- [x] Club ワールド（床・ネオン・VIP・バー・スピーカー・パーティション）
- [x] DJ ブース（カウンター + デッキ + ミキサー、バックパネル・ピンク棒なし）
- [x] **Shawn T. Art DJ 固定配置 + `applyVRMDjPose`**
- [x] Club スポットライト
- [x] ミラーボール + 床ディスコ光
- [x] Club 当たり判定・ヒントランドマーク

### オーディオ

- [x] 会場別 BGM（Museum / Club MP3）
- [x] `VenueBgmSystem` — フェーズ・タブ visibility 連動
- [x] 任意 `VITE_BGM_BASE_URL`

### タブ・パフォーマンス

- [x] **タブ非表示: レンダー停止 + タイマー停止 + BGM 一時停止**
- [x] タブ復帰: invalidate + 復帰直後 delta クランプ + ランダム停止リセット
- [x] 常時 delta クランプ削除（ガタつき対策）

### 会話・コンテンツ

- [x] 初回/再会セリフ分割（Museum / Club）
- [x] 会話記憶 **Meebit 番号単位**（`meebits-world-save-v2`）
- [x] 会話カメラ 2 候補（FollowCamera）
- [x] Shawn Museum 11 件 + Club 専用セリフ

### インフラ・開発体験

- [x] Vercel Serverless VRM プロキシ廃止
- [x] `npm run dev` で Vite + Worker 同時起動
- [x] Vercel Analytics

### UI・UX

- [x] モバile UI（Lucide アイコン、ジョイスティック）
- [x] タブレット = SP 設定
- [x] ターゲット静止画プレビュー
- [x] favicon

### Museum ワールド

- [x] MonochromeSculpture 8 体、VRM 彫刻 9 体、ベンチ 6
- [x] 当たり判定とヒント座標の共通化

## 既知の課題・制約

| 項目 | 内容 |
|------|------|
| Final / Club 400 体 | 端末によっては重い |
| Worker 無料枠 | 10 万 req/日 |
| BGM ファイル | `public/audio/` に配置。本番 CDN は任意 |
| SP 5 体 HUD | PC `TargetHUD` とは別レイアウト |
| Shawn DJ 位置 | 微調整は `CLUB_CREATOR_DJ_POSITION` の z のみ |

## 未着手・任意改善

- [ ] `TimeUpOverlay` プレビューサイズ完全統一
- [ ] Worker カスタムドメイン
- [ ] README.md
- [ ] BGM を R2 に置いて `VITE_BGM_BASE_URL` 本番設定
- [ ] アバター変更時の会話リセット（スタート時 Meebit 変更のみ、等）

## テスト観点（手動）

1. Museum → Grand Final クリア → After Hours 遷移
2. Club DJ ブース: Shawn がカウンター向こうに見える、DJ モーション
3. タブ切替: タイマー止まる / 復帰ですぐ歩き再開
4. BGM: 会場切替・タブ非表示で pause
5. 会話: 初回/再会セリフ、Meebit 番号で記憶
6. RETRY 後メモリ・FPS
7. 本番 VRM Worker 200 + CORS
