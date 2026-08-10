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
| ゲーム本体ホスティング | **Vercel**（静的サイトのみ） |
| **VRM 配信** | **Cloudflare R2 + Worker** |
| 分析 | `@vercel/analytics/react`（`App.tsx`） |

**Next.js ではない。** Analytics は `@vercel/analytics/next` ではなく `/react` を使う。

## ルーティング / SPA fallback

- URL パスで edition を判定（`src/game/appEdition.ts`）。`/` `/jp` = Park（`top`）
- ルート一覧: `/`(`top`), `/find-the-meebit`(`v1`), `/v2`(`v2`), `/8th-street`, `/runway`, `/mountain`, `/neon-stack`, `/opensea-market`(`opensea`)、各 `/jp` 版
- 新ルート追加時は 2 箇所に登録:
  - `vite.config.ts` の `SPA_FALLBACK_PATHS`（ローカル dev/preview 用）
  - `vercel.json` の `rewrites`（本番用）
- OpenSea Listing API: `api/opensea/meebits-listings.ts` + Vite `openseaListingsDevApi`。環境変数 `OPENSEA_API_KEY`（Portal 永続キー、`VITE_` なし）。詳細は `memory-bank/openSeaMarket.md`
- 旧 `/`（本編）→ `/find-the-meebit` に移設。**互換リダイレクトなし**
- ページメタ（title/OGP/canonical）は `src/game/pageMetadata.ts` の `applyPageMetadata` が edition 別に適用

## 開発コマンド

```bash
npm run dev              # Vite + VRM Worker 同時起動（concurrently）
npm run dev:vite         # Vite のみ
npm run build            # tsc -b && vite build
npm run preview          # プレビュー
npm run vrm-worker:dev   # Worker のみ（wrangler dev）
npm run vrm-worker:deploy
npm run vrm:seed         # 彫刻9体+デフォルトプレイヤーを R2 に事前アップロード
```

## TypeScript 落とし穴（頻出・ビルド落ち）

`npm run build` は `tsc -b` を通す。次のパターンは **繰り返し Vercel / ローカルで TS2345 を出す**。

### 1. 設定オブジェクトの数値リテラルがデフォルト引数の型になる

```ts
// config
export const SHORE_FISHING = {
  playerCollisionRadius: 0.45, // ← 型は literal `0.45`
}

// ❌ radius の型が `0.45` になり、0.38 などを渡せない
export function canStandOnIsland(x: number, z: number, radius = SHORE_FISHING.playerCollisionRadius) {}

// ✅ 引数に number を明示
export function canStandOnIsland(
  x: number,
  z: number,
  radius: number = SHORE_FISHING.playerCollisionRadius,
) {}
```

**症状:** `Argument of type '0.38' is not assignable to parameter of type '0.45'.`

**なぜ:** オブジェクトリテラルの数値プロパティは拡大されず、デフォルト引数の推論がそのまま literal になる。`as const` オブジェクトでも同様（より厳格）。

**ルール:**
- config 由来の数値をデフォルト引数にするときは **必ず `param: number = CONFIG.foo`**
- 複数箇所で共有する半径・秒数・距離も、関数シグネチャは `number` / `string` など widened 型にする
- 「プレイヤー専用定数」でも NPC 半径など別値を渡すなら、最初から `number` にする

### 2. 関連して起きやすいもの

| パターン | 対処 |
|----------|------|
| `foo?: 0.45` のような optional literal | `foo?: number` |
| `ReadonlyArray<0.45>` 的な推論 | 要素型を `number` にする／`as number` で widen |
| `as const` 全体に閉じた config から関数へ値を渡す | 受け側の型を widened にする（config 側を緩めない方が安全なことが多い） |

### 3. 確認コマンド

```bash
npx tsc --noEmit -p .
# または
npm run build
```

エディタ上は通っても CI / Vercel の `tsc -b` で落ちることがあるので、半径・秒・距離を「デフォルト引数 = config 定数」にしたら型を疑う。

## VRM 配信（Cloudflare R2 + Worker）

### なぜ Vercel 外か

- `files.meebits.app` 直リンクは **CORS 不可**
- Vercel `/api/vrm` プロキシや rewrite は **Fast Data / Origin Transfer が TB 級**になり得た
- R2 は **egress 無料**。Worker が CORS 付きで配信

### アーキテクチャ

```
本番:
  ブラウザ → Cloudflare Worker (/vrm/{id}.vrm)
           → R2 キャッシュヒット → 返却（CORS 付き）
           → ミス → files.meebits.app から取得 → R2 保存 → 返却

  ゲーム本体 → Vercel（HTML / JS / CSS のみ）
```

### 主要ファイル

| 用途 | パス |
|------|------|
| URL 生成 | `src/avatar/VRMLoader.ts` → `getMeebitVrmUrl()` |
| Worker | `workers/vrm-cache/src/index.ts` |
| Worker 設定 | `workers/vrm-cache/wrangler.toml` |
| R2 シード | `scripts/seed-vrm-sculptures.mjs` |
| 環境変数例 | `.env.example` |

### 本番 URL

- ゲーム本体（Vercel）: `https://meebits-park.vercel.app`
- Worker: `https://find-the-meebits-vrm.find-the-meebits-vrm.workers.dev`
- Vercel 環境変数: `VITE_VRM_BASE_URL`（末尾スラッシュなし）
- 生成 URL 形式: `{VITE_VRM_BASE_URL}/vrm/{meebitId}.vrm`

> **⚠️ CORS の落とし穴**: Vercel の本番ドメインを変更・追加したら、必ず Worker の
> `ALLOWED_ORIGINS`（`workers/vrm-cache/wrangler.toml`）に新ドメインを追加して
> `npm run vrm-worker:deploy` すること。追加漏れだと VRM が CORS で全滅する
> （`meebits-park.vercel.app` への移行時に実際に発生）。

### ローカル開発

- `VITE_VRM_BASE_URL` 未設定時: `getMeebitVrmUrl` は `/vrm/{id}.vrm`（相対パス）
- Vite が `/vrm/*` を `http://127.0.0.1:8787`（wrangler dev）へプロキシ（`vite.config.ts`）
- `npm run dev` で Vite + Worker を同時起動

### Worker 設定メモ

- R2 バケット: `meebits-vrm`、キー: `vrm/{id}.vrm`
- `ALLOWED_ORIGINS`: 本番 Vercel URL（`https://meebits-park.vercel.app`）+ localhost
- `Cache-Control: public, max-age=31536000, immutable`

### 削除済み（Vercel VRM 経路）

- `api/vrm/[id].ts`（Serverless プロキシ）
- `vercel.json`（`/vrm/*` rewrite）

## Git / リポジトリ

- `.gitignore`: `node_modules/`, `dist/`, `.wrangler/`, `.env`
- **`node_modules` と `dist` は Git 管理外**（Vercel がビルド）

### 環境変数（ビルド時）

| 変数 | 用途 |
|------|------|
| `VITE_VRM_BASE_URL` | VRM Worker URL（本番必須） |
| `VITE_BGM_BASE_URL` | BGM CDN ベース（任意、末尾スラッシュなし） |

## 静的アセット

- `public/favicon.jpg`
- `public/audio/museum-bgm.mp3`, `public/audio/club-bgm.mp3`
- `public/audio/runway/Meebits Runway.mp3`
- `public/audio/fishing/Meebits Shore Fishing.mp3`
- `public/audio/park/`（Park BGM）

## パフォーマンス設計（ブラウザ側がボトルネック）

ゲーム処理は **すべてクライアント**。VRM バイト転送は **Vercel 帯域に乗らない**。

### PC（`perfConfig.ts` / `gameConfig.ts`）

- 同時 VRM 上限: 300
- 同時ロード数: 24
- ステージ準備完了の最小 ready 数: **36**
- ウォームアップ先読み距離: **60m**（intro/preparing）
- 準備タイムアウト: **18秒**（`StagePrepareSystem`）

### モバイル・タブレット（幅 ≤ 1023px）

- NPC 数は PC の半分（会場別 `gameProgression.ts`）
- 同時 VRM 上限: 100（Club PC max 400 でも SP は 200）
- Canvas **DPR 最大 1**（`getMaxCanvasDpr()`）
- 同時ロード数: **12**
- ステージ準備完了の最小 ready 数: **18**
- ウォームアップ先読み距離: **50m**

### タブ非表示（`systems/tabPause.ts`）

- `GameCanvas`: `frameloop="never"` — useFrame 全停止
- ゲームタイマー: `getTabPausedMs()` を `getElapsedSeconds` から差し引き
- 復帰: 80ms のみ `clampFrameDeltaAfterTabResume`（常時クランプは使わない）

### 会場 BGM（`VenueBgmSystem.tsx`）

- Museum vol 0.7 / Club vol 0.11
- タブ hidden で pause、`cleared` 中も再生可

### 準備完了条件（`vrmLodState.ts`）

- `readyCount >= getStageReadyMinCount()`
- active の **85%** 以上 ready
- **40m 以内**（`NPC_VRM_ALWAYS_LOAD_DISTANCE`）の NPC が全員 ready
- または 18 秒タイムアウト

### VRM 彫刻キャッシュ（ワールド固定）

- `src/world/vrmSculptureCache.ts` — 9 体専用、NPC プールと分離
- `VrmSculpturePreloader.tsx` — 起動時 preload

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

## コスト（参考）

| サービス | 役割 | 帯域 |
|---------|------|------|
| Vercel PRO | ゲーム本体 | JS/CSS のみ（小） |
| Cloudflare R2 | VRM 保存 | egress **$0** |
| Cloudflare Worker | CORS + キャッシュミス時 fetch | 無料枠 10万 req/日、超過 $5/月 程度 |

## レスポンシブ

- ブレークポイント: `TOUCH_UI_MAX_WIDTH_PX = 1023`（`perfConfig.ts`）
- UI の `md:` は `lg:` に統一済み（タブレット = SP UI）
- モバイル: `MobileTopBar`, `MobileControls`, 仮想ジョイスティック
