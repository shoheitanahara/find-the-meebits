# System Patterns

## ディレクトリ構成（主要）

```
src/
├── App.tsx                 # TabPauseSystem, VenueBgmSystem, Analytics
├── avatar/
│   ├── VRMLoader.ts
│   ├── VRMLocomotion.ts    # applyVRMLocomotion, applyVRMDjPose, applyVRMAttentionPose
│   ├── AvatarController.tsx
│   └── vrmInstancePool.ts
├── game/
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
│   └── WorldRoot.tsx       # venueId → ClubWorld | MuseumWorld
├── collision/
│   └── obstacles.ts        # getWorldObstacles(venueId)
├── audio/
│   └── venueAudioConfig.ts
└── systems/
    ├── tabPause.ts
    ├── TabPauseSystem.tsx
    ├── TabResumeInvalidator.tsx
    ├── VenueBgmSystem.tsx
    └── save/localStorage.ts  # meebits-world-save-v2, talkedCountByMeebit

workers/vrm-cache/
public/audio/               # museum-bgm.mp3, club-bgm.mp3
```

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
