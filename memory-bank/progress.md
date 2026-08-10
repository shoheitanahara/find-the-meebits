# Progress

## 完了済み

### OpenSea Market（`/opensea-market`）

- [x] Sea 中央 TIDE POOL 工事中枠を `opensea` アトラクションに置換
- [x] Listing API（`fetchMeebitsListings` + Vercel/Vite `/api/opensea/meebits-listings`）
- [x] 室内 walkers・価格会話・OpenSea リンク・Exit
- [x] `OPENSEA_API_KEY`（Portal 永続キーのみ。Instant Key 機構は削除）
- [x] 失敗時 listings=[] で入場継続
- [x] ノウハウ: `memory-bank/openSeaMarket.md`

### Shore Fishing（`/shore-fishing`）

- [x] Sea 西スロットから入場。ボクセル孤島 + 岸釣りスコアアタック
- [x] **Open**（工事中解除）。看板・スタート文言をキャッチーに
- [x] 入口 `entranceZ` 調整 + 西棟に被るヤシ削除
- [x] `applyVRMFishingPose`（歩行脇開き／立ち脇クローズ、キャスト＝リール逆）
- [x] 竿フィット（`rodHand` + `vrmHandPropFit`）
- [x] NPC 釣り人（プレイヤー無反応・対岸ループ）
- [x] 島内ヤシ廃止 → コケ付きボクセル岩
- [x] ホオジロ頭太めシルエット
- [x] BGM `Meebits Shore Fishing.mp3`
- [x] `canStandOnIsland(radius: number = ...)` で TS2345 回避
- [x] ノウハウ: `memory-bank/shoreFishing.md` / `meebitVrmArms.md` / `techContext.md`（TS 落とし穴）

### Photo Booth（`/photo-booth`）

- [x] 正方形 PFP 撮影 + 来場証明書発行
- [x] ポーズ: Stand / Wave / Cheer / Shoot / GM / Walk / Jump / Sit
- [x] Walk・Jump は `VRMLocomotion` 再利用（Walk 位相固定・Jump は `jumpLiftY`）
- [x] GM マグ（白／黒選択・GM 文字は背景色連動・右手追従）
- [x] Sit 用ボクセル椅子（脚長は `sitChair.leg`）
- [x] カメラ角度: default / high / higher / low（中央寄せは lookAt Y）
- [x] 操作ノウハウを `memory-bank/photoStudio.md` に記録（腕規約も更新）

### Astro District（パーク新ゾーン）

- [x] `ParkZoneId` に `astro` 追加（Mountain 北 × Culture 東）
- [x] 双方向ゲート（Mountain↔Astro / Culture↔Astro）
- [x] Astro 地面・外周・ポータル・工事中3棟（STAR DOME / LUNAR LAB / ORBITAL PORT）
- [x] 共通建物スロット正本化（`parkAttractionSlots.ts`）
- [x] Robot / Visitor 8体＋他Type 7体の日次15 NPC + Astro 会話プール
- [x] Astro専用ベンチ＋環状ライト街灯（個別pointLight削減、ベンチ横オブジェ撤去）
- [x] Astro専用の挨拶・エリア雑談・今日の主役・Trait会話

### Mountain Shooting Gallery（`/shooting-gallery`）

- [x] Mountain 東棟 `(15.7, -11.0)` に Shooting Gallery を配置（id=`shooting`）
- [x] 45秒三人称射的（固定射撃位置・右肩越しカメラ）
- [x] PC マウス照準 + クリック／SP 画面ドラッグ + Fire
- [x] 複数種の動く的（Meebit/trait 的なし）・レイキャスト命中
- [x] スコア／コンボ／赤ペナルティ／金色ボーナス／リザルト評価
- [x] Mountain NPC向け Shooting Gallery専用会話（日英）

### Meebits Park（ハブ / `top`）

- [x] `/` を Park に、本編を `/find-the-meebit` に移設（互換リダイレクトなし）
- [x] Sea NPC向け Meet Sergito専用会話、Culture NPC向け Look Locker専用会話（日英）
- [x] アバター選択カード（番号 / ランダム + 実 VRM プレビュー）
- [x] 固定追従カメラ（本編相当の距離感）+ WASD/ジョイスティック移動
- [x] Plaza 3 建物（find / traits / street）+ Mountain エリア＋ Coming Soon 棟
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

### Meebits Runway（`/runway`）

- [x] Culture District から入場（id=`runway`）。名称 **Meebits Runway**、Open 看板
- [x] 暗室＋キャットウォークショー（日替わりカラーテーマ `dailyRunway.ts`）
- [x] 観客ベンチ着席＋呼吸ポーズ（`applyVRMSitPose` / `getAudienceBreathParams`）
- [x] 日替わり空席 4〜8 + プレイヤー着席（E / Sit ボタン）・立ち上がり位置補正
- [x] ベンチ当たり非対称化（前後隣・列間通路側を短縮）
- [x] 三人称オービット視点（マウス / タッチ）。スマホ pitch は上下反転
- [x] Runway 専用 BGM（`RunwayBgmSystem`）
- [x] Three.js 座標ルール（`.cursor/rules/threejs-coordinates.mdc`）

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
- [x] Runway 専用 BGM（`/audio/runway/Meebits Runway.mp3`）
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
| Runway 接地 Y | `playerGroundY` / `benchGroundY` / `audienceSeatY` は見た目で微調整。符号は座標ルール参照 |
| Runway 建物看板 | Open（`The Catwalk` / `本日の色が歩く`）。**New Open 表記は使わない** |

## 未着手・任意改善

- [ ] `TimeUpOverlay` プレビューサイズ完全統一
- [ ] Worker カスタムドメイン
- [ ] README.md
- [ ] BGM を R2 に置いて `VITE_BGM_BASE_URL` 本番設定
- [ ] アバター変更時の会話リセット（スタート時 Meebit 変更のみ、等）
- [ ] Runway ベンチ間当たりのプレイ確認（奥席立ち上がり・列間通路）

## テスト観点（手動）

1. Museum → Grand Final クリア → After Hours 遷移
2. Club DJ ブース: Shawn がカウンター向こうに見える、DJ モーション
3. タブ切替: タイマー止まる / 復帰ですぐ歩き再開
4. BGM: 会場切替・タブ非表示で pause
5. 会話: 初回/再会セリフ、Meebit 番号で記憶
6. RETRY 後メモリ・FPS
7. 本番 VRM Worker 200 + CORS
8. Runway: 空席 Sit / 立ち上がりでベンチ判定に捕まらない / スマホ視点上下
9. Culture → Fashion Runway 入場 → Park 復帰（`?from=runway`）
