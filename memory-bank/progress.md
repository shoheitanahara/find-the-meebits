# Progress

## 完了済み

### コアゲーム

- [x] 8 ステージ進行（regular ×5 + semifinal / final / grandfinal）
- [x] PC / モバイル NPC 数分岐
- [x] 複数ターゲット（最大 5）の発見・クリアフロー
- [x] タイムアタック 180 秒
- [x] 会話システム（E キー / モバイルインタラクト）

### 3D・VRM

- [x] VRM 足元接地（`alignVrmFeetToGround`, `VRM_FEET_Y_OFFSET`）
- [x] VRM インスタンスプール + LRU キャッシュ
- [x] LOD（距離ベース VRM ロード/アンロード）
- [x] ステージ切替時の安全なメモリ回収
- [x] RETRY 時のメモリリーク修正（finalize eviction + preview cache clear）
- [x] **Cloudflare R2 + Worker による VRM 配信**（CORS + オンデマンドキャッシュ）
- [x] VRM 彫刻 9 体（専用キャッシュ、Golden Tree 廃止）
- [x] ウォームアップ距離・準備 ready 数の引き上げ

### インフラ・開発体験

- [x] Vercel Serverless VRM プロキシ廃止（帯域削減）
- [x] `npm run dev` で Vite + Worker 同時起動
- [x] `.gitignore`（node_modules / dist / .wrangler）
- [x] VRM シードスクリプト（`npm run vrm:seed`）

### UI・UX

- [x] モバイル UI（TopBar, Controls, ジョイスティック）
- [x] タブレット = SP 設定（1024px → 1023px ブレークポイント）
- [x] ターゲット静止画プレビュー（全ステージ）
- [x] PC TargetHUD 5 体サイズ統一
- [x] TimeUpOverlay 複数ターゲット対応
- [x] favicon
- [x] Vercel Analytics 組み込み

### ワールド

- [x] MonochromeSculpture 3 バリエーション（像・アーチ・螺旋）8 体
- [x] **VRM 彫刻 9 体**（グレー Meebit + 白/黒台座）
- [x] Sculpture 内側配置・正面向き
- [x] light/dark sculpture の色分け
- [x] ベンチ 6 箇所（背もたれなし、脚 3.6）
- [x] 当たり判定とヒント座標の共通化

### コンテンツ

- [x] ヒント 3 段階 + 6 エリア（8 方向削除）
- [x] VRM 彫刻ヒント（台座色: white / black pedestal）
- [x] `TARGET_HINT_CHANCE = 0.25`
- [x] 一般 NPC セリフプール整理
- [x] Shawn T. Art セリフ差し替え（11 件）

### 影

- [x] receiveShadow オフ（VRM 足元）
- [x] shadow-normalBias 調整

## 既知の課題・制約

| 項目 | 内容 |
|------|------|
| Final 400 体 | 端末によっては重い（クライアント GPU/メモリ限界） |
| Worker 無料枠 | 10 万 req/日。超過時 Workers Paid $5/月 程度 |
| Meebits 利用許諾 | R2 への再配信が許されているかは別途確認 |
| Worker URL | `find-the-meebits-vrm.find-the-meebits-vrm.workers.dev`（見た目冗長だが問題なし） |
| SP 5 体 HUD | `MobileTopBar` は PC `TargetHUD` とは別レイアウト |

## 未着手・任意改善

- [ ] `TimeUpOverlay` の 5 体プレビューサイズを TargetHUD に完全統一
- [ ] Worker カスタムドメイン（例: `vrm.example.com`）
- [ ] README.md（リポジトリに未作成）
- [ ] favicon を真の PNG/ICO + 複数サイズに最適化
- [ ] Vercel Hobby にダウングレード可能か（VRM 帯域削減後）Usage 確認

## テスト観点（手動）

1. ステージ進行後も FPS が落ち続けないか
2. RETRY 5 回以上繰り返しても重くならないか
3. Grand Final 5 体 HUD（PC / SP）
4. VRM 彫刻 / light・dark ブロック彫刻のヒント区別
5. モバイルジョイスティック + 縦画面
6. **本番**: VRM が Worker URL から 200 + CORS OK
7. **本番**: Vercel Usage で Fast Data Transfer が VRM 移行前より低下
8. `npm run dev` 単一コマンドでローカルプレイ可能
