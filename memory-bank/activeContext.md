# Active Context

最終更新: 2026-11-09

## 直近の作業サマリー

### Visit Pass（来場証）— 表示・装飾・クリア数

- **合成**: `src/photoStudio/capture/composeVisitPass.ts`
- **日替わり色**: `visitPassTheme.ts`（5テーマ・UTC日付固定）。DEV でテーマピッカー可
- **QR**: 右上配置
- **クリスマス装飾**（11–12月 / `isParkChristmasSeason`）: 画素リース（中央上）・サイドストライプ・丸い降雪（写真枠と非重複）。DEV で Auto/On/Off
- **クリア数 off-by-one 修正**: Mt. Meeb / Jerry は全クリア後 `unlockedStage = COUNT+1` を保存。来場証は `unlocked - 1`。旧セーブ（unlocked=20 頭打ち）は高度 ≥1000m なら 20クリア扱い（`dailyRecords.climbDetail`）
- 記録集約: `src/park/dailyRecords.ts`

### Meebits Park — 時間帯ライティング

- **時間帯**: `morning` / `noon` / `evening` / `night`（`parkTimeOfDay.ts`）
- **自動**: 端末ローカル時刻（朝 5–10 / 昼 11–15 / 夕 16–19 / 夜 20–4）
- **適用**: `applyTimeOfDayLook` → `TopScene`。ベース look は旧「夜」相当。朝昼は色味中心、夕は暗め、夜は一段暗く
- **UI**: 時計 `HH:mm`。DEV のみ時間帯トグル（言語切替付近の左）
- **橋ライト**: 通行可能な左右レール橋のみ点灯（`ParkPerimeter`）
- 状態: `topStore.timeOfDay`

### Park クリスマスシーズン（11–12月）

- `parkChristmas.ts`: Sea 以外で look / デコ差し替え。骨格レイアウトは変えない
- 来場証のクリスマス装飾は上記シーズン判定を共有

### Mt. Meeb / Jerry Mountain — コース幅・風

- **7レーン**: `MOUNTAIN_LANES` = LLL/LL/L/C/R/RR/RRR（`mountain/config.ts`）
- 道幅・棚・山体生成を拡張。両脇は低めの flank 斜面
- 高ステージほど `windAmplitude` / `windFrequency` を強化（`stages.ts`）
- 進捗: `mountain/store.ts`（日替わり。全クリア哨兵は COUNT+1）

主要ファイル（直近）:

| 用途 | パス |
|------|------|
| 来場証合成 | `src/photoStudio/capture/composeVisitPass.ts` |
| 来場証テーマ | `src/photoStudio/capture/visitPassTheme.ts` |
| 日次記録・クリア表示 | `src/park/dailyRecords.ts` |
| 時間帯 look | `src/top/parkTimeOfDay.ts` |
| クリスマス | `src/top/parkChristmas.ts` |
| 登山進捗 | `src/mountain/store.ts` |
| レーン・地形 | `src/mountain/config.ts` / `stages.ts` |
| Photo Booth メモ | `memory-bank/photoStudio.md` |

### Meet Sergito / OpenSea / Shore Fishing / Photo Booth ポーズ

（安定済み。詳細は各ノウハウファイルと下記「既存オープン施設」）

### JA ゾーン表記
- すべて「〜エリア」に統一（地区は使わない）
- マウンテンエリア／カルチャーエリア／シーエリア／アストロエリア／ミービッツ広場

### Park NPC 会話

- Mountain NPC: Mt. Meeb / Jerry Mountain / Shooting Gallery の3施設を個別プールで話す
- Culture NPC: Runway / Look Locker を個別プールで話す
- Sea NPC: Meet Sergito 工房での観察・Traitコメント体験を話す
- Astro NPC: エリア固有の挨拶・工事中3棟・主役・Trait会話を使う

### Astro District — Open（工事中建物のみ）

- **Zone ID**: `astro`（Mountain の北 × Culture の東）
- **接続**: `mountain-to-astro` / `culture-to-astro`
- **建物**: 工事中のみ（STAR DOME / LUNAR LAB / ORBITAL PORT）。進入不可
- **スロット正本**: `src/top/parkAttractionSlots.ts`

### 既存オープン施設（要約）

| 施設 | 要点 |
|------|------|
| Shooting Gallery | Mountain 東棟。45秒三人称射的 |
| Meebits Runway | Culture。日替わりカラー・着席。座標は `.cursor/rules/threejs-coordinates.mdc` |
| Photo Booth | PFP + 来場証。ポーズ詳細は `photoStudio.md` |
| Shore Fishing | Sea 西。`shoreFishing.md` |
| OpenSea Market | Sea 中央。彫刻ギャラリー。`openSeaMarket.md` |
| Meet Sergito | Sea 東。最大2行会話 |

### Park 配置の凍結

- **Canonical Default Layout**: `parkDesigner.md` §14（2026-07-24）+ Culture Runway Open 更新
- 正本: `parkZones.ts` / `topConfig.ts`

### ルーティング

- `/` `/jp` = Park（`top`）。本編は `/find-the-meebit`。互換リダイレクトなし
- 本番: `https://meebits-park.vercel.app`。ドメイン変更時は Worker `ALLOWED_ORIGINS` 必須

## 現在のブランチ状態

- Visit Pass クリア数修正・時間帯・山7レーン・来場証クリスマスは **作業ツリーに未コミットの可能性あり**
- Worker / Vercel VRM 構成は以前どおり

## 次に触る可能性が高いファイル

| 用途 | パス |
|------|------|
| 来場証合成 | `src/photoStudio/capture/composeVisitPass.ts` |
| 来場証テーマ | `src/photoStudio/capture/visitPassTheme.ts` |
| 日次記録 | `src/park/dailyRecords.ts` |
| 時間帯 | `src/top/parkTimeOfDay.ts` |
| 登山進捗 | `src/mountain/store.ts` |
| レーン・地形 | `src/mountain/config.ts` |
| Photo Booth メモ | `memory-bank/photoStudio.md` |
| パーク UI | `src/top/TopApp.tsx` / `TopScene.tsx` |

## エージェント向け注意

1. **Next.js ではない** — Vite + React
2. **`/` は Park**（`top`）。本編は `/find-the-meebit`。新ルートは `vite.config.ts` + `vercel.json` の両方に登録
3. **本番ドメイン変更時は Worker `ALLOWED_ORIGINS` を更新して再デプロイ**
4. **会場座標**: Museum → `worldLandmarks.ts` / Club → `clubLandmarks.ts` / Park → `topConfig.ts` / Runway → `runway/config.ts` / Photo Booth → `photoStudio/config.ts`
5. **パーク NPC は `useVRMModel(exclusive:true)`**
6. **Runway 座標**: +Z=手前（入口）、−Z=奥。詳細は `.cursor/rules/threejs-coordinates.mdc`
7. **登山 unlockedStage**: プレイ選択は 1..20。全クリア保存は **21**。来場証クリア数は `unlocked - 1`（旧セーブは高度ヒューリスティック）
8. **時間帯**: マジックナンバーを JSX に直書きせず `parkTimeOfDay` / config 定数へ
9. **来場証クリスマス雪**: 写真枠と重ねない。画素デコは画像 import せず canvas 描画
10. commit はユーザー依頼時のみ

## デプロイチェックリスト

1. **本番ドメインを変えた場合**: `workers/vrm-cache/wrangler.toml` の `ALLOWED_ORIGINS` に新ドメイン追加
2. `npm run vrm-worker:deploy`
3. Vercel `VITE_VRM_BASE_URL` → Redeploy
4. 新ルートを足したら `vite.config.ts`（`SPA_FALLBACK_PATHS`）と `vercel.json` を確認
5. 任意: `VITE_BGM_BASE_URL`
