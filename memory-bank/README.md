# Memory Bank — Meebits Park

AI エージェントが作業を中断・再開しても文脈を失わないためのドキュメント群。

## 全体像（2026-07）

**Meebits Park** をハブに、複数テーマエリアとゲームがぶら下がる構成。

| ルート | エディション | 内容 |
|--------|-------------|------|
| `/` `/jp` | `top` | **Meebits Park**（テーマランドハブ・ゾーン切替） |
| `/find-the-meebit` `/jp/find-the-meebit` | `v1` | Find the Meebit（Museum / After Hours） |
| `/v2` `/jp/v2` | `v2` | Trait Hunt（特徴一致ハント試作） |
| `/8th-street` `/jp/8th-street` | `8th-street` | 8th Street（一人称・間違い探し系ループ） |
| `/mountain` `/jp/mountain` | `mountain` | Mountain Climb |

- ルート判定: `src/game/appEdition.ts`（`getAppEdition`）
- Park 設計: **[parkDesigner.md](./parkDesigner.md)**（共通骨格・橋ゲート・カージナル導線）
- `/` `/jp` は Park（`top`）。`find-the-meebit` セグメントで v1。

## 読む順序（推奨）

1. **[projectbrief.md](./projectbrief.md)** — プロジェクト概要・目的
2. **[techContext.md](./techContext.md)** — 技術スタック・デプロイ・パフォーマンス
3. **[systemPatterns.md](./systemPatterns.md)** — アーキテクチャ・主要ファイル・設計パターン
4. **[productContext.md](./productContext.md)** — ゲームデザイン・ユーザー嗜好・コンテンツ方針
5. **[parkDesigner.md](./parkDesigner.md)** — **Park 設計士ノート**（ゾーン／導線／衝突／配置ルール）
6. **[activeContext.md](./activeContext.md)** — 直近の作業内容・現在の状態
7. **[progress.md](./progress.md)** — 完了済み・既知の課題・未着手

## 更新ルール

- 大きな機能追加・設計変更・バグ修正のたびに **activeContext.md** と **progress.md** を更新する
- 恒久的な仕様変更は **productContext.md** / **systemPatterns.md** に反映する
- **Park のゾーン・導線・配置ルール**が変わったら **parkDesigner.md** も更新する
- ファイルパス・定数・インフラが変わったら **techContext.md** も更新する

## インフラ早見（2026-07）

| 配信物 | サービス |
|--------|---------|
| ゲーム本体 | Vercel（本番 `https://meebits-park.vercel.app`） |
| VRM | Cloudflare Worker + R2 |
| BGM（任意） | `public/audio/` または `VITE_BGM_BASE_URL` |
| 開発 | `npm run dev`（Vite + Worker） |

> **CORS 注意**: 本番ドメインを変えたら Worker の `ALLOWED_ORIGINS`（`workers/vrm-cache/wrangler.toml`）に追加して再デプロイしないと VRM が表示されない。

## プロジェクト名

- リポジトリ: `find-the-meebits`
- package.json 名: `meebits-world`
- 表示タイトル（`/`）: **Meebits Park**（各ゲームに入るとタイトルが切り替わる）
