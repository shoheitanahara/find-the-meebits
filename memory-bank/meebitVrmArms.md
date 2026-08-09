# Meebit VRM 腕ボーン規約（normalized）

PFP Studio / 射的 / 歩行などで使う**落とし所**。Meebit のボクセル腕は「手のひらの向き」が崩れると一気に安っぽく見える。

正本: `src/photoStudio/poses.ts`（スタジオ）、`src/avatar/VRMLocomotion.ts`（attention / 射的 / 歩行 / ジャンプ）  
スタジオ全体: **[photoStudio.md](./photoStudio.md)**

## いちばん大事なコツ

**手をひねらない。**  
手のひらを表に向けたり後ろに向けたりする回転を入れると、肩・袖が壊れて見える。

腕を高く上げたいときも、基本は**下ろした向きのまま `z` だけで上げる**（Cheer）。

## 軸の意味（UpperArm）

| 軸 | 役割 | 使い方 |
|----|------|--------|
| **z** | 上げ下ろし（体側 ↔ 横水平） | attention: 左 `+1.56` / 右 `−1.56`。**同じ符号のまま** `|z|` を減らすほど上がる（→0 でほぼ T）。**符号を反転すると掌が表を向いて壊れる** |
| **x** | 前後スイング（正＝前） | 歩行アームスイング・**射撃／GM の前方出し**で使う。Cheer の「高く上げ」には使わない |
| **y** | 捻り／寄せ | **原則禁止**。例外: Wave の顔横寄せのみ（`setArm` 内で左右符号反転） |

## LowerArm / Hand / Shoulder

- LowerArm: **x のみ**肘曲げが基本。Wave は `lowerY` もわずかに使用
- Hand: 毎フレーム `{0,0,0}`（掌の残留捻り防止）が安全
- Shoulder: 毎フレーム `{0,0,0}`

## 安全なパターン

| 意図 | やり方 |
|------|--------|
| 下ろす | `upper x=0,y=0`, `z=attention` |
| 高く上げる（Cheer） | `x=0,y=0` のまま `|z|` だけ減らす（符号維持） |
| 肘を曲げる | 上腕は下ろしたまま（attention `z`）+ `lowerArm.x` |
| 前方に出す（Shoot / GM） | `applyVRMShootingPose`（`x≈π/2` + attention `z`、**y は使わない**） |
| 歩行アーム | `applyVRMLocomotion` の stride（スタジオは位相固定） |
| 着席 | 脚中心。腕は rest（`applyVRMSitPose`） |
| 釣り竿持ち | `applyVRMFishingPose`（右腕 `y=0`、脇は z のみ。詳細下） |

## 釣り（Shore Fishing）— 今回も苦労した点

正本: `applyVRMFishingPose`（`VRMLocomotion.ts`）+ `FishingRod`（`shoreFishing/world/FishingTackle.tsx`）+ `vrmHandPropFit.ts`  
アトラクション全体: **[shoreFishing.md](./shoreFishing.md)**

### 竿持ち右腕の脇（z）

| 定数 | 値の意味 | いつ使う |
|------|----------|----------|
| `rodArmZWalk` = `armRestZ.right * 0.88` | 歩行時は**やや開いた**従来寄り | `carry` かつ移動中 |
| `rodArmZClosed` = `armRestZ.right * 1.15` | 立ち／釣りは**ガッツリ脇を閉める** | idle・wait・cast・reel・catch |

```ts
// carry: 移動量で脇の開きを lerp（歩＝開、止＝閉）
z: MathUtils.lerp(rodArmZClosed, rodArmZWalk, movementWeight)
```

**やってはいけない:** 歩行も閉じて「棒立ちで歩く」、立ちも開いたまま「脇が空いて竿が浮く」。  
**調整順:** まず `rodArmZClosed` / `rodArmZWalk` の係数だけ。UpperArm **y は触らない**（捻れ＝即崩れ）。

### キャスト＝リールの逆再生

- キャスト前半（`castWindupRatio`）: 竿を上げる（リール終端へ）
- 後半: 振り下ろし（リールの逆で wait へ）
- 浮き飛行時間は `castFlightSec`、合計尺は `reelSec` に揃える方針

腕の `x`（前後）は射撃と同様「前に出す」用途。掌を回す `y` は禁止のまま。

### 右手の竿フィット

- オフセット定数は `SHORE_FISHING.rodHand`（`config.ts`）
- 体型差は `HAND_PROP_ARM_FIT`（`vrmHandPropFit.ts`）— deficit に応じて root local **素直な X/Y/Z**
- 細い Meebit で竿が体に食い込む／離れるときは、まず `handOffset*` と `offset*PerDeficit`。回転で誤魔化さない

### 小道具の親子付け

射的ピストルと同じく、React の `attach` でボーン直下に入れると衝突しやすい。  
ワールド行列コピー／毎フレーム追従（手ワールド → root local）を優先。NPC 竿は `publishTip: false` でプレイヤー線と分離。

## やってはいけないこと

1. Cheer のように上げる意図で **UpperArm.x** を入れる（ゾンビ前出し＆掌が回る）
2. Wave 以外で **UpperArm.y** で掌を回す
3. 肘の不要な `y/z` を触る
4. 一部軸だけ書いて前ポーズの捻りを残す

## 限界とポーズ選定

- 完全な腕組み・腰に手・力こぶは、肘曲げ近似でも掌／肩が崩れる → **採用しない**
- Photo Booth 採用ポーズ: Stand / Wave / Cheer / Shoot / GM / Walk / Jump / Sit（詳細は `photoStudio.md`）
- 射的・GM の前方銃／マグ構えは意図的に `x` を使う例外（掌より道具の向き優先）
- 釣りの前方出しも `x` を使うが、**y は常に 0**。脇の調整は **z 係数だけ**（`rodArmZClosed` / `rodArmZWalk`）

## 頭（スタジオ）

Photo Booth では Head **正の X ≒ 顎上げ**、**負の X ≒ 顎引き**（見た目で確認済み）。

## 検証（2026-08）

- `#11143` で「z のみ上げ」がきれい、`x` 付き上げは掌が回って崩れることを確認
- 旧メモの「`|z|<0.7` 禁止」は **x と併用したとき**の肩割れ。`x=0` の純 `z` 上げなら高くしてよい
- GM: 射撃腕 + 前傾リセット + 顎上げ（正 X）が安定
- Walk: locomotion の左手前・右足前位相が自然
- Fishing（2026-08）: 立ちは `rodArmZClosed`、歩きは `rodArmZWalk`。脇を歩くときまで閉じると棒、立ちで開けると竿が浮く
