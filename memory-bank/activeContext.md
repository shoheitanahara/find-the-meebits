# Active Context

最終更新: 2026-06-19

## 直近の作業サマリー

### ワールド・プロップ

- Sculpture 8 体を外周から内側（z/x おおよそ 32–40）へ移動
- ベンチ 2 つ追加（計 6）、足の長さ 2 倍（1.8）
- light sculpture: 全白（土台・彫刻 `#ffffff`, metalness 0）
- dark sculpture: 黒土台 + シルバー彫刻
- 彫刻の向き: ギャラリー中心向き（`getSculptureFacing`）

### UI

- PC `TargetHUD`: 3 体以上・5 体とも `h-28 w-28`、2 列グリッド
- favicon: `public/favicon.jpg` + `index.html` link タグ
- Vercel Analytics: `App.tsx` に `@vercel/analytics/react`

### メモリ・パフォーマンス（RETRY 対応）

- **問題**: RETRY 後に重くなる。VRM テンプレート破棄が React アンマウントより早かった
- **修正**:
  - `finalizeVrmInstancePoolEviction()` を `NPCManager` の `useLayoutEffect` で呼ぶ
  - `clearTargetPreviewCacheExcept()` を `resetStageRuntimeState` に追加
- ステージ進行時と同じ経路（`continueToNextStage` / `retryStage`）でリセット

### 議論のみ（未実装の提案）

- VRM を `/api/vrm` プロキシではなく `vercel.json` rewrite 直結にすると Serverless 枠節約の可能性
- `TimeUpOverlay` の 5 体サイズを `TargetHUD` に揃える（ユーザー未依頼）

## 現在のブランチ状態

- memory-bank 作成時点で **commit / deploy 状況は未確認**
- ユーザーは明示的な commit 依頼なし

## 次に触る可能性が高いファイル

| 用途 | パス |
|------|------|
| オブジェクト座標 | `src/world/worldLandmarks.ts` |
| 3D プロップ見た目 | `src/world/Props.tsx` |
| ヒントロジック | `src/npc/npcTargetHint.ts` |
| 会話・ヒント確率 | `src/npc/npcDialogue.ts` |
| VRM メモリ | `src/avatar/vrmInstancePool.ts`, `src/npc/NPCManager.tsx` |
| ゲーム進行 | `src/stores/gameStore.ts` |
| PC ターゲット UI | `src/ui/TargetHUD.tsx` |
| SP ターゲット UI | `src/ui/mobile/MobileTopBar.tsx` |

## エージェント向け注意

1. **Next.js ではない** — Vite + React。Analytics は `/react`
2. オブジェクト座標は `worldLandmarks.ts` が唯一のソース
3. VRM dispose は **NPC アンマウント後**（`finalizeVrmInstancePoolEviction`）
4. タブレット = モバイル perf（1023px 以下）
5. commit はユーザー依頼時のみ
