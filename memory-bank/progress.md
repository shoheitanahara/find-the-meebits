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
- [x] Vercel VRM プロキシ API（CORS 回避）

### UI・UX

- [x] モバイル UI（TopBar, Controls, ジョイスティック）
- [x] タブレット = SP 設定（1024px → 1023px ブレークポイント）
- [x] ターゲット静止画プレビュー（全ステージ）
- [x] PC TargetHUD 5 体サイズ統一
- [x] TimeUpOverlay 複数ターゲット対応
- [x] favicon
- [x] Vercel Analytics 組み込み

### ワールド

- [x] GoldenTree（段々の葉）
- [x] MonochromeSculpture 3 バリエーション（像・アーチ・螺旋）
- [x] Sculpture 内側配置・正面向き
- [x] light/dark sculpture の色分け
- [x] ベンチ 6 箇所・足 2 倍長
- [x] 当たり判定とヒント座標の共通化

### コンテンツ

- [x] ヒント 3 段階 + 6 エリア（8 方向削除）
- [x] 一般 NPC セリフプール整理（簡単英語、世界観寄り）
- [x] Shawn T. Art セリフ差し替え（11 件）

### 影

- [x] receiveShadow オフ（VRM 足元）
- [x] shadow-normalBias 調整

## 既知の課題・制約

| 項目 | 内容 |
|------|------|
| Final 400 体 | 端末によっては重い（クライアント GPU/メモリ限界） |
| VRM ファイルサイズ | ユニーク ID が多いと初回ロード・Vercel 転送が増える |
| Hobby プラン | 非商用前提、超過で pause の可能性 |
| `TARGET_HINT_CHANCE` | コード上 0.15。過去会話では 0.25 の希望もあった |
| SP 5 体 HUD | `MobileTopBar` は PC `TargetHUD` とは別レイアウト |

## 未着手・任意改善

- [ ] `TimeUpOverlay` の 5 体プレビューサイズを TargetHUD に完全統一
- [ ] VRM 配信を rewrite 直結にして Serverless 削減
- [ ] `TARGET_HINT_CHANCE` を 0.25 に戻すかユーザー確認
- [ ] README.md（リポジトリに未作成）
- [ ] favicon を真の PNG/ICO + 複数サイズに最適化

## テスト観点（手動）

1. ステージ進行後も FPS が落ち続けないか
2. RETRY 5 回以上繰り返しても重くならないか
3. Grand Final 5 体 HUD（PC / SP）
4. light sculpture が dark と区別できるか
5. モバイルジョイスティック + 縦画面
6. Vercel 本番で VRM ロード成功（/api/vrm）
