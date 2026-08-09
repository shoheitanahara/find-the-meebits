# Shore Fishing — アバター操作・島・落とし所

最終更新: 2026-08-09

ルート: `/shore-fishing` `/jp/shore-fishing`（Sea エリア西スロット）。  
正本: `src/shoreFishing/`

関連:
- 腕・竿: **[meebitVrmArms.md](./meebitVrmArms.md)**（釣りセクション）
- 座標一般: `.cursor/rules/threejs-coordinates.mdc`（Shore は Runway の Z 慣習と必ずしも同じでない）
- TS リテラル型: **[techContext.md](./techContext.md)**「TypeScript 落とし穴」

---

## 体験の要点

- 歩けるボクセル孤島 + 岸からキャスト
- ニブル → 本食い窓でアワセ → リール
- 日替わり Visit Pass 系のベスト記録
- NPC 釣り人は対岸ウェイポイントを歩く／釣るだけ（**プレイヤーに反応しない**）

---

## アバター操作（苦労したところの正本）

### ポーズ

| 関数 | 用途 |
|------|------|
| `applyVRMFishingPose` | 下半身歩行 + 右腕竿 + cast/wait/reel |
| `applyVRMLocomotion` | 使わない（釣り専用に分岐） |

**右腕方針（再確認）**

1. **捻らない**（`upper.y = 0`、手も 0）
2. **歩行中**は脇をやや開ける（`rodArmZWalk`）— 見た目の自然さ優先
3. **立ち・待ち・キャスト・リール**は脇を強く閉じる（`rodArmZClosed`）
4. キャストはリールの逆タイムライン（振りかぶり → 振り下ろし）

詳細・係数は `meebitVrmArms.md` の釣り節。

### 竿・浮き

| 項目 | 場所 |
|------|------|
| 竿メッシュ・先端 | `world/FishingTackle.tsx`（`FishingRod`） |
| 手オフセット | `SHORE_FISHING.rodHand` |
| 体型フィット | `src/avatar/vrmHandPropFit.ts` |
| プレイヤー | `player/ShoreFishingPlayer.tsx` |
| NPC | `world/ShoreFishingNpcs.tsx`（`alwaysShow` / `publishTip: false`） |

**浮き:** 持ち歩き中も穂先に付く。カメラ用の `bobberActive` はキャスト中のみ。

### 接地

- `playerGroundY` / `islandTileTopY`: **0.16**（ボクセル床上面）
- VRM は `alignVrmFeetToGround` + `VRM_FEET_Y_OFFSET`（親 Y を触る前に座標ルールを読む）

---

## 島オブジェクト

- **ヤシは廃止**（`ShoreBeach` の `PALM_SPOTS` 削除済み）
- 代わりに小さなボクセル岩／小山: `islandRocks.ts` + `world/IslandVoxelRocks.tsx`
  - stone / darkStone / gravel + **コケ（grass top + 緑 tint）**
  - 歩行ブロックは `hitsIslandRock` → `canStandOnIsland` 経由（プレイヤー・NPC 共通）

---

## 歩行・型

```ts
// ✅ NPC 半径 0.38 を渡せる
canStandOnIsland(x, z, radius: number = SHORE_FISHING.playerCollisionRadius)
```

デフォルト引数に config の `0.45` をそのまま使うと **TS2345**（`0.38` が `0.45` に入らない）。  
→ `techContext.md` の TypeScript 落とし穴を必ず守る。

---

## 主要ファイル

| 用途 | パス |
|------|------|
| 定数 | `src/shoreFishing/config.ts` |
| 状態 | `src/shoreFishing/store.ts` |
| App | `src/shoreFishing/ShoreFishingApp.tsx` |
| 島タイル | `islandTiles.ts` / `world/VoxelIslandGround.tsx` |
| 岩 | `islandRocks.ts` / `world/IslandVoxelRocks.tsx` |
| 魚ボクセル | `world/VoxelFish.tsx`（ホオジロは頭を一番太く） |
| 影 | `world/SeaFishShadows.tsx` |
| 釣りポーズ | `src/avatar/VRMLocomotion.ts` → `applyVRMFishingPose` |
