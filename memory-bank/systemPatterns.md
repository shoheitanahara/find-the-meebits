# System Patterns

## ディレクトリ構成（主要）

```
src/
├── App.tsx                 # ルート UI、Analytics
├── main.tsx
├── avatar/                 # VRM ロード・プレイヤー・プール
│   ├── VRMLoader.ts        # getMeebitVrmUrl → Worker URL
│   ├── vrmInstancePool.ts  # テンプレートキャッシュ・ステージリセット
│   ├── vrmLoadQueue.ts     # 同時ロード数制限
│   ├── useVRMModel.ts      # exclusive フラグでプレイヤー/キャプチャ分岐
│   └── PlayerAvatar.tsx
├── game/
│   ├── GameCanvas.tsx      # R3F Canvas
│   ├── gameConfig.ts       # 定数（WORLD_RADIUS, VRM 距離など）
│   ├── gameProgression.ts  # 8 ステージ定義
│   └── perfConfig.ts       # モバイル/PC 性能分岐・ウォームアップ距離
├── npc/
│   ├── NPC.tsx             # 個別 NPC（VRM LOD, 徘徊 AI）
│   ├── NPCManager.tsx      # layout key + finalizeVrmInstancePoolEviction
│   ├── NPCVrmLodSystem.tsx # LOD 選択・ウォームアップ距離
│   ├── npcGeneration.ts    # プロファイル生成、Shawn セリフ
│   ├── npcDialogue.ts      # 会話選択、ヒント確率
│   ├── npcTargetHint.ts    # 3 段階ヒント、6 エリア
│   └── vrmLodState.ts      # アクティブ VRM NPC セット・準備完了判定
├── stores/
│   ├── gameStore.ts        # ゲームフェーズ、warmStartActiveVrmNpcIds
│   ├── npcStore.ts
│   └── playerStore.ts
├── world/
│   ├── worldLandmarks.ts   # 座標（描画・当たり・ヒント共有）
│   ├── Props.tsx           # ベンチ・ブロック彫刻
│   ├── VrmSculpture.tsx    # VRM 彫刻 9 体
│   ├── vrmSculptureCache.ts
│   ├── VrmSculpturePreloader.tsx
│   ├── Buildings.tsx
│   └── Plaza.tsx
├── collision/
│   ├── obstacles.ts
│   └── spawnValidation.ts
├── ui/
│   ├── TargetHUD.tsx
│   ├── PrepareOverlay.tsx  # 準備中 UI（near 40m / preload 60m）
│   └── mobile/
└── systems/
    ├── StagePrepareSystem.tsx  # 18秒タイムアウト
    └── TargetVrmPreloader.tsx

workers/vrm-cache/
├── src/index.ts            # R2 キャッシュ + upstream fetch + CORS
└── wrangler.toml

scripts/seed-vrm-sculptures.mjs
.env.example
.gitignore
public/favicon.jpg
```

## VRM 配信フロー

```
getMeebitVrmUrl(id)
  → 本番: ${VITE_VRM_BASE_URL}/vrm/{id}.vrm
  → 開発: /vrm/{id}.vrm → Vite proxy → wrangler dev

Worker:
  GET /vrm/{id}.vrm
  → R2 get → ヒットなら返却
  → ミス → files.meebits.app fetch → R2 put → 返却
  → Access-Control-Allow-Origin（ALLOWED_ORIGINS 一致時）
```

## ゲームフェーズ（`gameStore`）

```
intro → preparing → playing → cleared | timedOut | conquered
```

- `intro`: スタート画面、バックグラウンド VRM ロード開始
- `preparing`: VRM ロード待ち + Tips → `StagePrepareSystem` が `beginPlaying`
- `warmStartActiveVrmNpcIds`: 開始位置から `getWarmupLoadDistance()` 以内を先読み
- `continueToNextStage` / `retryStage`: 同じリセット経路（`resetStageRuntimeState`）

## NPC レイアウト再生成

```ts
createNpcLayout(npcCount, npcLayoutVersion)
// → npcProfiles 再生成, npcLayoutVersion++
```

`NPCManager` の `key={layout-${npcLayoutVersion}}` で React ツリー全体を差し替え。

## 座標の単一ソース

**オブジェクト位置は `worldLandmarks.ts` に集約。**

- `Props.tsx` / `VrmSculpture.tsx` — 描画
- `obstacles.ts` — 当たり判定
- `npcTargetHint.ts` — `buildHintLandmarks()` 経由でヒント

## ブロック彫刻（MonochromeSculpture）

- `SCULPTURE_POSITIONS` 8 体、ギャラリー内側
- **偶数 index**: dark — 黒土台 + シルバー彫刻
- **奇数 index**: light — 白土台 + 白彫刻（`#ffffff`, metalness 0）
- 回転: `getSculptureFacing(position)` で中心向き

## VRM 彫刻（VrmSculpture）

- `VRM_SCULPTURE_PLACEMENTS` **9 体**
- グレー Meebit、I ポーズ、1.5× スケール、入口（+Z）向き
- 台座: `light` = 白 / `dark` = 黒
- 専用キャッシュ（`vrmSculptureCache.ts`）、NPC プールと独立
- ID 例: 17600, 11143, 8506, 605, 10326, 11796, 7347, 3458, 8369

## ベンチ

- 6 箇所（`BENCH_POSITIONS`）、`y: 0.5`
- 背もたれなし、4 脚 + 横棒、脚長 3.6

## ヒントシステム（3 段階）

| 距離 | 内容 |
|------|------|
| ≤ 14m | 「すぐ近く」 |
| ≤ 10m（ランドマーク） | dark/light sculpture / **VRM 彫刻（台座色）** / bench |
| それ以外 | 6 エリア（entrance, front, center, back, west, east） |
| ≥ 48m かつ別ゾーン | `far toward the ...` でぼかし |

- **8 方向（NE 等）は使わない**
- ヒント確率: `TARGET_HINT_CHANCE = 0.25`（`npcDialogue.ts`）
- Golden Tree ヒントは **削除済み**

## ゾーン境界（`classifyZone`）

```
x < -26 → west
x > 26  → east
z > 36  → entrance
z < -26 → back
z > 6   → front
else    → center
```

## UI パターン

- PC ターゲット HUD: `TargetHUD.tsx`（`lg:block`）、3 体以上は `h-28 w-28` 2 列グリッド
- SP: `MobileTopBar.tsx`
- 準備中: `PrepareOverlay.tsx` — near 40m / preload 60m（PC）表示

## 影・VRM 接地

- `VRMLoader.ts`: `alignVrmFeetToGround()`, `VRM_FEET_Y_OFFSET = 0.06`
- NPC/プレイヤー: `receiveShadow = false`
- `Lighting.tsx`: `shadow-normalBias` 調整済み
