# Tech Context

## スタック

| 層 | 技術 |
|----|------|
| ビルド | Vite 6 |
| UI | React 19 + TypeScript |
| スタイル | Tailwind CSS 4（`@tailwindcss/vite`） |
| 3D | Three.js + React Three Fiber + Drei |
| アバター | `@pixiv/three-vrm` |
| 状態管理 | Zustand |
| デプロイ | Vercel（静的サイト + Serverless Function） |
| 分析 | `@vercel/analytics/react`（`App.tsx`） |

**Next.js ではない。** Analytics は `@vercel/analytics/next` ではなく `/react` を使う。

## 開発コマンド

```bash
npm run dev      # 開発サーバー
npm run build    # tsc -b && vite build
npm run preview  # プレビュー
```

## VRM 配信

- 本番 URL: `/api/vrm/{meebitId}`（`VRMLoader.ts` → `getMeebitVrmUrl`）
- 実装: `api/vrm/[id].ts` が `https://files.meebits.app/vrm/{id}.vrm` をプロキシ
- キャッシュ: `Cache-Control: public, max-age=86400, s-maxage=86400, immutable`
- `vercel.json` に `/vrm/:path*` → files.meebits.app の rewrite もある（CORS 回避用）

## 静的アセット

- `public/favicon.jpg` — サイト favicon（実体は JPEG 1024×1024）
- `index.html` に `<link rel="icon">` と `apple-touch-icon`

## パフォーマンス設計（ブラウザ側がボトルネック）

ゲーム処理は **すべてクライアント**。アクセス増でサーバー CPU はほぼ増えない。

### PC（`perfConfig.ts` / `gameConfig.ts`）

- 同時 VRM 上限: 300
- 同時ロード数: 24
- ステージ準備完了の最小 ready 数: 24

### モバイル・タブレット（幅 ≤ 1023px）

- NPC 数は PC の半分（`gameProgression.ts`）
- 同時 VRM 上限: 100
- 同時ロード数: 8
- ステージ準備完了の最小 ready 数: 12

### VRM プール（`vrmInstancePool.ts`）

- テンプレート LRU キャッシュ（上限: `getNpcMaxConcurrentVrm() + 12`）
- NPC は `SkeletonUtils.clone` で複製、primary はアニメーション用
- プレイヤー・TargetPreviewCapture は `exclusive: true` で独自ロード（プール外 deepDispose）

### ステージ切替 / RETRY のメモリ管理

1. `resetVrmInstancePoolForStageChange(keepMeebitIds)` — ロードキュー無効化、破棄は遅延
2. `npcLayoutVersion` 更新 → `NPCManager` が旧 NPC ツリーをアンマウント
3. `NPCManager` の `useLayoutEffect` で `finalizeVrmInstancePoolEviction()` — **アンマウント後**に不要テンプレート破棄
4. `clearTargetPreviewCacheExcept(keepMeebitIds)` — base64 プレビュー画像キャッシュ整理

**重要:** `queueMicrotask` で即 dispose すると描画中シーンが壊れ、RETRY 後に重くなる原因になる（修正済み）。

## ターゲットプレビュー（静止画）

- 全ステージで `<img>` 表示（`TargetPreview.tsx`）
- 共有キャプチャ: `TargetPreviewCapture.tsx` + `targetPreviewCache.ts`
- `PREVIEW_RENDER_VERSION` を上げるとキャッシュ無効化
- カメラ: 左斜前、Z=4 付近、足元が切れないフレーミング

## Vercel Hobby 制限（参考）

- 帯域 ~100GB/月、Function 呼び出し ~100 万/月
- Hobby は **非商用・個人利用** が規約上の前提
- 重いのはクライアント。VRM プロキシの転送量と Function 回数だけサーバー負荷

## レスポンシブ

- ブレークポイント: `TOUCH_UI_MAX_WIDTH_PX = 1023`（`perfConfig.ts`）
- UI の `md:` は `lg:` に統一済み（タブレット = SP UI）
- モバイル: `MobileTopBar`, `MobileControls`, 仮想ジョイスティック
