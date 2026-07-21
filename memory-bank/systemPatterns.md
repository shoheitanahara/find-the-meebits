# System Patterns

## エディション振り分け（ルーティング）

```
src/App.tsx
  getAppEdition(pathname)  ← src/game/appEdition.ts
    '8th-street' → EightStreetApp   （/8th-street, /jp/8th-street）
    'v2'         → HuntApp(v2)       （/v2, /jp/v2）
    'v1'         → HuntApp(v1)       （/find-the-meebit, /jp/find-the-meebit）
    'top'        → TopApp            （/ , /jp）← デフォルト
```

- ルート判定は**パスセグメント**ベース（`segments.includes('...')`）。順序に注意（8th-street → v2 → find-the-meebit → top）
- `/` `/jp` は Park（`top`）。旧 `/`（本編）は `/find-the-meebit` へ移設。**互換リダイレクトなし**
- SPA fallback: `vite.config.ts`（`SPA_FALLBACK_PATHS`）+ `vercel.json`（rewrites）に全ルート列挙
- 全ゲームに `ParkReturnButton`（薄いヘッダー: 左「Meebits Park」/右「Back to Top」）を無条件マウント
- ページメタ（title / description / OGP / canonical）は `src/game/pageMetadata.ts` の `applyPageMetadata(edition, locale)` が edition ごとに切替

## ディレクトリ構成（主要）

```
src/
├── App.tsx                 # edition 分岐, ParkReturnButton, TabPauseSystem, Analytics
├── top/                    # Meebits Park ハブ（/）
│   ├── TopApp.tsx          # アバター選択 → パーク開始 / from クエリで自動復帰
│   ├── TopScene.tsx        # 3D シーン: 追従カメラ, 建物, 噴水, NPC30, 銅像
│   ├── topConfig.ts        # TOP_ATTRACTIONS（3 建物: find/traits/street）
│   └── topStore.ts         # start(spawn?), プレイヤー位置, AttractionId
├── eightStreet/            # 8th Street（/8th-street）
│   ├── EightStreetApp.tsx
│   ├── config.ts           # EIGHT_STREET（クランク路地座標）, NIGHT_MOOD
│   ├── logic/              # walkerPath, selectSimilarMeebit 等
│   └── ui/                 # TitleScreen, ProgressHud
├── avatar/
│   ├── VRMLoader.ts        # getMeebitVrmUrl
│   ├── VRMLocomotion.ts    # applyVRMLocomotion, applyVRMDjPose, applyVRMAttentionPose
│   ├── AvatarController.tsx
│   └── vrmInstancePool.ts
├── game/
│   ├── appEdition.ts       # getAppEdition（URL → edition）
│   ├── pageMetadata.ts     # applyPageMetadata（edition 別 title/OGP）
│   ├── GameCanvas.tsx      # frameloop タブ連動
│   ├── GameScene.tsx       # venueId で Club/Museum コンポーネント分岐
│   ├── gameProgression.ts  # Museum 8 + Club 5 ステップ
│   ├── venueConfig.ts      # VenueId, テーマ, After Hours ラベル
│   └── perfConfig.ts
├── npc/
│   ├── NPC.tsx             # isClubDj 分岐, タブ復帰処理
│   ├── npcGeneration.ts    # getCreatorNpcForVenue (club DJ 位置)
│   ├── npcClubDialogue.ts  # Club セリフプール
│   └── npcDialogue.ts      # talkCount, ヒント
├── stores/
│   └── gameStore.ts        # venueId, getElapsedSeconds + tab pause
├── world/
│   ├── worldLandmarks.ts   # Museum 座標
│   ├── clubLandmarks.ts    # Club 座標, DJ ブース, Shawn 位置
│   ├── ClubProps.tsx       # DjBooth, バー, VIP 等
│   ├── ClubMirrorBall.tsx
│   ├── ClubSpotlights.tsx
│   ├── ClubWorld.tsx
│   ├── VrmSculpture.tsx    # 銅像（hidePedestal で台座差替可）
│   └── WorldRoot.tsx       # venueId → ClubWorld | MuseumWorld
├── ui/
│   ├── ParkReturnButton.tsx # 全ゲーム共通ヘッダー + 戻る確認
│   ├── TargetPreview.tsx    # 静止画プレビュー
│   └── TargetPreviewCapture.tsx
├── collision/
│   └── obstacles.ts        # getWorldObstacles(venueId)
├── audio/
│   └── venueAudioConfig.ts
└── systems/
    ├── tabPause.ts
    ├── TabPauseSystem.tsx
    ├── TabResumeInvalidator.tsx
    ├── VenueBgmSystem.tsx
    └── save/localStorage.ts  # meebits-world-save-v2: talkedCountByMeebit, playerMeebitNumber, lastPlayerPosition

workers/vrm-cache/
public/audio/               # museum-bgm.mp3, club-bgm.mp3
```

## Meebits Park（`top`）パターン

- **アバター選択**: `TopApp` で番号入力 / ランダム。`TargetPreviewCapture` を Park でもマウントし実 VRM プレビュー表示
- **カメラ**: `TopFollowCamera` — ワールド固定オフセットでプレイヤーを滑らかに追従（本編 FOV/距離感に合わせる）
- **建物**: `TOP_ATTRACTIONS`（`topConfig.ts`）が唯一の座標・見た目・説明ソース。`find` / `traits` / `street` の 3 棟。各 `entranceZ` を跨ぐと自動遷移
- **遷移**: 入口通過で該当ゲームへ（アバター ID をクエリ引継ぎ）
- **復帰**: `ParkReturnButton` が `?from=<attractionId>` を付けて `/` へ。`TopApp` が `useLayoutEffect` で自動 start(spawn) → 該当建物前にスポーン、選択カードをスキップ
- **NPC**: 30 体ランダム徘徊（`TopNpcCrowd` / 3 種歩行パターン / 会話・衝突なし）。`useVRMModel(exclusive: true)` で T ポーズ回避
- **銅像**: 噴水中央に Meebit #11143 を `VrmSculpture`（`hidePedestal`）で設置

## 会場（Venue）パターン

```ts
type VenueId = 'museum' | 'club'
```

| 会場 | 表示名 | 座標ソース | ワールド |
|------|--------|-----------|---------|
| museum | Museum | `worldLandmarks.ts` | MuseumWorld |
| club | After Hours | `clubLandmarks.ts` | ClubWorld |

- `gameStore.venueId` が描画・collision・BGM・NPC 生成を駆動
- `buildNpcProfiles(count, venueId)` — Shawn 位置は会場で上書き

## Shawn T. Art（CREATOR_NPC_ID）

| 会場 | 位置 | 挙動 |
|------|------|------|
| museum | `[-10, 0, -14]` | 通常 NPC 徘徊 |
| club | `[0, 0.06, -42.62]` rotation `0` | DJ 固定、`applyVRMDjPose` |

- VRM LOD では常に forced（`NPCVrmLodSystem`）
- ターゲット選択から除外（`targetSelection.ts`）

## DJ ブース（Club）

- 基準: `CLUB_DJ_BOOTH_POSITION = [0, 0, -42]`
- レイアウト: `CLUB_DJ_BOOTH_LAYOUT` — counter / platform / sideCabinet
- 描画: `ClubProps.tsx` → `DjBooth()`
- 当たり: `buildClubDjBoothObstacles()` — counter + cabinets（platform は通過可）

## タブ一時停止

```
visibility hidden:
  GameCanvas frameloop = "never"
  tabPause.noteTabHidden() → タイマー除外開始
  VenueBgmSystem pause

visibility visible:
  noteTabVisible() → tabResumeGeneration++
  frameloop = "always"
  TabResumeInvalidator.invalidate()
  clampFrameDeltaAfterTabResume (80ms)
  NPC: pauseUntilRef = 0
```

- `getElapsedSeconds(startedAt)` = `(Date.now() - startedAt - getTabPausedMs()) / 1000`
- `resetTabPauseClock()` on `beginPlaying` / `resetGame`

## BGM

- `VenueBgmSystem` — `venueId` + `gamePhase` + `document.visibilityState`
- 再生フェーズ: preparing, playing, timedOut, cleared
- URL: `resolveVenueBgmUrl()` — ローカル `/audio/` or `VITE_BGM_BASE_URL`

## ゲームフェーズ（`gameStore`）

```
intro → preparing → playing → cleared | timedOut | conquered
```

- Museum conquered → `afterHoursUnlockPending` → Club intro 可能
- Club 進行は `getClubProgressionSteps()` 独立

## 座標の単一ソース

| 会場 | ファイル |
|------|---------|
| Museum | `worldLandmarks.ts` |
| Club | `clubLandmarks.ts` |

描画・collision・ヒントは各 landmarks から参照。

## 会話記憶

- キー: `meebitTalkKey(meebitNumber)` — NPC ID ではない
- ストレージ: `meebits-world-save-v2`
- `selectDialogueLines` — talkCount で初回/再会

## VRM 配信フロー（変更なし）

```
getMeebitVrmUrl(id) → Worker / R2 → CORS 付き返却
```

## ヒント（Club）

- `buildClubHintLandmarks()` — バー, VIP, DJ, 彫刻, スポットライト等
- DJ ヒント座標: `CLUB_CREATOR_DJ_POSITION`

## 8th Street パターン

- **形状**: クランク（Z 字）型路地 1 本。Leg A(−Z) → Leg B(+X) → Leg C(−Z)。座標定数は `EIGHT_STREET`（`eightStreet/config.ts`）
- **一人称**: FOV 70、`moveSpeed 3.6` / `dashSpeed 6.5`、マウス/タッチルック
- **ループ**: 最後の左折で `forwardTransitionZ` を跨ぐと白フェード → スタートへワープ（`wrapFadeIn/MinWhite/FadeOut Ms`）。歩行者 10 体、`targetProgress`（8）回進むとクリア
- **当たり**: `clampToAlley()` が回廊クランプ + 最終コーナーの L 字ソリッド AABB（`getLastCornerSolids`）で押し出し
- **夜の見た目**: `NIGHT_MOOD` — 温白色ナトリウム灯（point light）、寒色白はワープ幕のみ
- **歩行者選定**: `logic/selectSimilarMeebit.ts`, 経路 `logic/walkerPath.ts`
