# Active Context

最終更新: 2026-06-21

## 直近の作業サマリー

### VRM 配信 — Cloudflare R2 + Worker 移行（完了）

- **背景**: Vercel で Fast Data / Origin Transfer が月 30–50GB。`files.meebits.app` 直リンクは CORS 不可
- **構成**: ゲーム本体 **Vercel**、VRM **Cloudflare R2 + Worker**
- **Worker URL**: `https://find-the-meebits-vrm.find-the-meebits-vrm.workers.dev`
- **Vercel 環境変数**: `VITE_VRM_BASE_URL`（ビルド時埋め込み → redeploy 必須）
- **削除**: `api/vrm/[id].ts`, `vercel.json`
- **追加**: `workers/vrm-cache/`, `scripts/seed-vrm-sculptures.mjs`, `.gitignore`, `.env.example`
- **ローカル**: `npm run dev` = Vite + Worker 同時起動（concurrently）

### ワールド・プロップ

- **Golden Tree 廃止** → **VRM 彫刻 9 体**（`VRM_SCULPTURE_PLACEMENTS`）
- ブロック彫刻（MonochromeSculpture）8 体は維持
- VRM 彫刻: グレー本体、白/黒台座、I ポーズ、入口向き、1.5× スケール
- ベンチ: 背もたれなし、4 脚+横棒、`y: 0.5`、脚長 `3.6`

### 初期 VRM ロード（ウォームアップ）調整

- ウォームアップ距離: PC **60m** / SP **50m**（以前 40m のみ）
- 準備完了 ready 数: PC **36** / SP **18**（以前 24 / 12）
- SP 同時ロード: **12**（以前 8）
- 準備タイムアウト: **18秒**（以前 12秒）

### UI・その他

- favicon: `public/favicon.jpg`
- Vercel Analytics: `@vercel/analytics/react`
- ヒント: VRM 彫刻は台座色で区別、`TARGET_HINT_CHANCE = 0.25`

### Git

- `node_modules` / `dist` / `.wrangler` を Git 管理外に（`.gitignore`）
- wrangler 追加で 106MB バイナリがコミットされ push 失敗 → 修正済み

## 現在のブランチ状態

- R2 移行・memory-bank 更新は **ユーザー明示 commit 前**
- Worker はデプロイ済み、本番 Vercel 環境変数設定済み（ローカル動作確認済み）

## 次に触る可能性が高いファイル

| 用途 | パス |
|------|------|
| VRM URL | `src/avatar/VRMLoader.ts` |
| Worker / CORS | `workers/vrm-cache/wrangler.toml` |
| オブジェクト座標 | `src/world/worldLandmarks.ts` |
| VRM 彫刻 | `src/world/VrmSculpture.tsx`, `vrmSculptureCache.ts` |
| ウォームアップ設定 | `src/game/perfConfig.ts` |
| VRM メモリ | `src/avatar/vrmInstancePool.ts`, `src/npc/NPCManager.tsx` |
| ゲーム進行 | `src/stores/gameStore.ts` |

## エージェント向け注意

1. **Next.js ではない** — Vite + React。Analytics は `/react`
2. **VRM は Vercel 経由にしない** — Worker URL + R2
3. オブジェクト座標は `worldLandmarks.ts` が唯一のソース
4. VRM dispose は **NPC アンマウント後**（`finalizeVrmInstancePoolEviction`）
5. タブレット = モバイル perf（1023px 以下）
6. `npm run dev` で Worker も起動する（別ターミナル不要）
7. commit はユーザー依頼時のみ

## デプロイチェックリスト

1. `npm run vrm-worker:deploy`（`ALLOWED_ORIGINS` に本番 URL）
2. Vercel `VITE_VRM_BASE_URL` 設定 → **Redeploy**
3. 本番で Network タブ: VRM が `workers.dev/vrm/` から 200 + CORS OK
