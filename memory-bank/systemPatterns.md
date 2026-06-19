# System Patterns

## ディレクトリ構成（主要）

```
src/
├── App.tsx                 # ルート UI、Analytics
├── main.tsx
├── avatar/                 # VRM ロード・プレイヤー・プール
│   ├── VRMLoader.ts        # getMeebitVrmUrl, alignVrmFeetToGround
│   ├── vrmInstancePool.ts  # テンプレートキャッシュ・ステージリセット
│   ├── vrmLoadQueue.ts     # 同時ロード数制限
│   ├── useVRMModel.ts      # exclusive フラグでプレイヤー/キャプチャ分岐
│   └── PlayerAvatar.tsx
├── game/
│   ├── GameCanvas.tsx      # R3F Canvas
│   ├── gameConfig.ts       # 定数（WORLD_RADIUS, VRM 距離など）
│   ├── gameProgression.ts  # 8 ステージ定義
│   └── perfConfig.ts       # モバイル/PC 性能分岐
├── npc/
│   ├── NPC.tsx             # 個別 NPC（VRM LOD, 徘徊 AI）
│   ├── NPCManager.tsx      # layout key + finalizeVrmInstancePoolEviction
│   ├── npcGeneration.ts    # プロファイル生成、Shawn セリフ
│   ├── npcDialogue.ts      # 会話選択、ヒント確率
│   ├── npcDialoguePool.ts  # 一般 NPC セリフプール
│   ├── npcTargetHint.ts    # 3 段階ヒント、6 エリア
│   └── vrmLodState.ts      # アクティブ VRM NPC セット
├── stores/
│   ├── gameStore.ts        # ゲームフェーズ、ステージ、retry/continue
│   ├── npcStore.ts         # NPC 位置、nearest
│   └── playerStore.ts
├── world/
│   ├── worldLandmarks.ts   # オブジェクト座標（描画・当たり・ヒント共有）
│   ├── Props.tsx           # 3D プロップ（木・ベンチ・彫刻）
│   ├── Buildings.tsx
│   └── Plaza.tsx           # 床タイル、ギャラリーフレーム 34m
├── collision/
│   ├── obstacles.ts        # worldLandmarks から当たり判定生成
│   └── spawnValidation.ts
├── ui/
│   ├── TargetHUD.tsx       # PC 右上ターゲット一覧
│   ├── TargetPreview.tsx
│   ├── TargetPreviewCapture.tsx
│   ├── targetPreviewCache.ts
│   ├── mobile/             # SP/タブレット UI
│   └── ...
└── systems/                # 非表示ロジックコンポーネント

api/vrm/[id].ts               # Vercel Serverless VRM プロキシ
public/favicon.jpg
vercel.json
```

## ゲームフェーズ（`gameStore`）

```
intro → preparing → playing → cleared | timedOut | conquered
```

- `preparing`: VRM ロード待ち + Tips 確認 → `StagePrepareSystem` が `beginPlaying`
- `continueToNextStage` / `retryStage`: 同じリセット経路（`resetStageRuntimeState`）
- `retryStage`: ターゲットは前回と被らないよう `pickRandomTargetNpcIds(..., exclude)`

## NPC レイアウト再生成

```ts
createNpcLayout(npcCount, npcLayoutVersion)
// → npcProfiles 再生成, npcLayoutVersion++
```

`NPCManager` の `key={layout-${npcLayoutVersion}}` で React ツリー全体を差し替え。

## 座標の単一ソース

**オブジェクト位置は `worldLandmarks.ts` に集約。**

- `Props.tsx` — 描画
- `obstacles.ts` — 当たり判定
- `npcTargetHint.ts` — `buildHintLandmarks()` 経由でヒント

座標を変えるときは必ずこのファイルを更新。

## 彫刻（MonochromeSculpture）

- `SCULPTURE_POSITIONS` 8 体、ギャラリー内側（外周 50m → 32–40m に移動済み）
- **偶数 index**: dark sculpture — 黒土台 + シルバー彫刻
- **奇数 index**: light sculpture — **土台・彫刻とも `#ffffff` マット白**（metalness 0）
- 回転: `getSculptureFacing(position)` でギャラリー中心 `(0,0)` を正面に向ける（ランダム回転なし）

## ベンチ

- 6 箇所（`BENCH_POSITIONS`）
- 足の高さ 1.8（座面から、元 0.9 の 2 倍）

## ヒントシステム（3 段階）

| 距離 | 内容 |
|------|------|
| ≤ 14m | 「すぐ近く」 |
| ≤ 10m（ランドマーク） | golden trees / dark or light sculpture / bench |
| それ以外 | 6 エリア（entrance, front, center, back, west, east） |
| ≥ 48m かつ別ゾーン | `far toward the ...` でぼかし |

- **8 方向（NE 等）は使わない**（単独ヒントでは易しすぎ）
- 東西 + 前後の組み合わせで絞るのは OK
- ヒント確率: `TARGET_HINT_CHANCE` in `npcDialogue.ts`（コード上は **0.15**。過去に 0.25 の議論あり）

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

- PC ターゲット HUD: `TargetHUD.tsx`（`lg:block`）、3 体以上は `h-28 w-28` 2 列グリッド（5 体も同サイズ）
- SP: `MobileTopBar.tsx`（5 体レイアウトは PC とは別実装）
- タイムアップ: `TimeUpOverlay.tsx`（複数ターゲット時コンパクトグリッド）

## 影・VRM 接地

- `VRMLoader.ts`: `alignVrmFeetToGround()`, `VRM_FEET_Y_OFFSET = 0.06`
- NPC/プレイヤー: `receiveShadow = false`（足元の不自然な影防止）
- `Lighting.tsx`: `shadow-normalBias` 調整済み
