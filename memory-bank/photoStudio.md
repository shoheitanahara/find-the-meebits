# Photo Booth — アバター操作・カメラの落とし所

最終更新: 2026-08-05

正方形 PFP / 来場証明書用スタジオ。ルート: `/photo-booth` `/jp/photo-booth`（互換 `/pfp-studio`）。  
正本: `src/photoStudio/`（`config.ts`・`poses.ts`・`player/StudioPlayer.tsx`・`world/`）

関連: **[meebitVrmArms.md](./meebitVrmArms.md)**（腕の軸）、`.cursor/rules/threejs-coordinates.mdc`（Y/Z 一般）

---

## 設計原則

1. **定数は `PHOTO_STUDIO`（`config.ts`）に置く** — マジックナンバーを JSX に直書きしない
2. **既存ロコモーションを再利用** — Walk / Jump / Shoot / Sit は `VRMLocomotion` と同じ関数を静止 or そのまま適用
3. **腕は捻らない** — 詳細は `meebitVrmArms.md`。例外は射撃／GM（前方出し）と Wave（顔横・`upperY`）
4. **小道具は右手ボーン追従** — `followRightHandProp`（オフセットは config）
5. **カメラはプリセット切替** — 上下回転の代わりに `cameraAngles`。左右 yaw はドラッグ

---

## ポーズ一覧（2026-08）

| id | 実装の要点 |
|----|------------|
| `attention` | 直立。腕 attention z |
| `wave` | 右手顔横。`upperY` 寄せ + 肘。左は下ろし |
| `cheer` | 両手を z のみ上げ（捻りなし） |
| `shoot` | `applyVRMShootingPose` + `ShootingPistol` 右手追従 |
| `gm` | 射撃と同じ腕。前傾リセット。顎上げ。マグ右手追従（白／黒選択・GM 文字は背景色） |
| `walk` | `applyVRMLocomotion` を **左手前・右足前** の位相で固定（`WALK_POSE_ELAPSED`） |
| `jump` | `isAirborne: true`（Mountain と同じ脚たたみ）。`jumpLiftY` で浮かせる |
| `sit` | `applyVRMSitPose` + `StudioSitChair`（Sit 時のみ表示） |

分岐: `poses.ts` → `applyStudioPose`。UI は `PHOTO_STUDIO.poses` を map。

### Walk 位相

`applyVRMLocomotion` で `speed=7` のとき `sin(elapsed*7) = -1` → 左手前・右足前。  
`WALK_POSE_ELAPSED = 3π/14`。`+ Math.PI` すると左右入れ替え。

### Jump

Mountain 空中ポーズそのもの。床にしゃがんで見えないよう root Y に `jumpLiftY`（現状 ~0.28）を加算。

### GM / 射撃の胴

`applyVRMShootingPose` はわずかな前傾付き。GM では Hips/Spine/Chest を 0 に戻して直立寄りにする。

### 頭（顎）— 符号に注意

Photo Booth の Head **正の X ≒ 顎上げ**、**負の X ≒ 顎引き**。  
（以前「負＝上げ」と書いて失敗した。見た目で確認すること）

---

## 右手小道具

共通: `StudioPlayer` の `followRightHandProp`  
（手ワールド位置 → root local + `handOffsetX/Y/Z`。回転は identity）

| 道具 | config | 調整の勘所 |
|------|--------|------------|
| ピストル | `shootPistol` | `handOffsetZ` で前方へ（手首持ちに見えないように） |
| マグ | `gmMug` | `handOffsetX/Y/Z` で掌に載せる。`scale`・`colorVariants`（白／黒） |

**体型フィット**（mesh 基準）: `src/avatar/vrmHandPropFit.ts`  
細い mesh を bind 幅で検出。補正は root local の **素直な X/Y/Z**:  
`offsetXPerDeficit` / `offsetYPerDeficit` / `offsetZPerDeficit`（不足 1.0 あたりの移動量）。  
通常の `handOffset*` にも scale（下限 `minScale`）が掛かる。#11143 幅以上は補正なし。

マグ形状・GM ラベル: `world/StudioGmMug.tsx`  
- 取っ手は体側（-X）、本体に食い込ませて隙間なし  
- 本体は中空シェル（中実だとコーヒー液面が縁より下で消える）  
- GM 文字: 円弧シリンダー + CanvasTexture。角度は `LABEL_THETA_START` / `LABEL_ARC`

---

## Sit 椅子

`sitChair`（`config.ts`）+ `StudioSitChair.tsx`

| 項目 | キー |
|------|------|
| 座面高さ | `seat.y` |
| 脚の長さ | `leg.size[1]`（高さ） |
| 脚の上下位置 | `leg.y`（中心）。下端 ≈ `y - size[1]/2` |
| 短くするとき | 高さを減らし、上端が座面に届くよう `y` を半分の減分だけ上げる |

背もたれは local **-Z**（Runway ベンチと同じ）。

---

## カメラ角度（構図の中央寄せ）

`cameraAngles[].setups.{full,bust}` — `cameraPosition` + `cameraLookAt` + `fov`

| id | 意図 |
|----|------|
| `default` | 斜め 3/4 |
| `high` | わずかに上から |
| `higher` | high より**少しだけ**高い（極端な真上は避ける） |
| `low` | 少し下から見上げ |

### アバターが枠の下寄り／上寄りになるとき

画面中央 = `cameraLookAt` の向く点。

- **下寄りすぎ** → `cameraLookAt` の **Y を下げる**（被写体がフレーム内で上がる）
- **上寄りすぎ** → lookAt Y を上げる
- アングルの「上から／下から」感は主に **cameraPosition.Y**（と lookAt との差）

`higher` は high の Y を少し足す程度に留める（例: full 1.95 → ~2.4）。頭上からの見下ろしはやりすぎになりやすい。

構図切替: `framings`（`full` / `bust`）。角度 × 構図は `getCameraSetup`。

---

## UI / ストア

- 状態: `store.ts`（pose / background / framing / cameraAngle / gmMugColor / brightness / rotYaw）
- パネル: `ui/PhotoStudioOverlays.tsx`  
  - GM 時のみマグ色スウォッチ  
  - 背景色スウォッチ（GM 文字色にも連動）
- 文言: `i18n.ts`

---

## 主要ファイル

| 用途 | パス |
|------|------|
| 定数・ポーズ一覧・カメラ・マグ・椅子 | `src/photoStudio/config.ts` |
| ポーズ適用 | `src/photoStudio/poses.ts` |
| プレイヤー・小道具追従 | `src/photoStudio/player/StudioPlayer.tsx` |
| マグ | `src/photoStudio/world/StudioGmMug.tsx` |
| Sit 椅子 | `src/photoStudio/world/StudioSitChair.tsx` |
| ロコモーション（Walk/Jump/Shoot/Sit/**Fishing**） | `src/avatar/VRMLocomotion.ts` |
| 腕規約メモ | `memory-bank/meebitVrmArms.md` |
| Shore Fishing | `memory-bank/shoreFishing.md` |
