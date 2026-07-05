# Memory Bank — Find the Meebit

AI エージェントが作業を中断・再開しても文脈を失わないためのドキュメント群。

## 読む順序（推奨）

1. **[projectbrief.md](./projectbrief.md)** — プロジェクト概要・目的
2. **[techContext.md](./techContext.md)** — 技術スタック・デプロイ・パフォーマンス
3. **[systemPatterns.md](./systemPatterns.md)** — アーキテクチャ・主要ファイル・設計パターン
4. **[productContext.md](./productContext.md)** — ゲームデザイン・ユーザー嗜好・コンテンツ方針
5. **[activeContext.md](./activeContext.md)** — 直近の作業内容・現在の状態
6. **[progress.md](./progress.md)** — 完了済み・既知の課題・未着手

## 更新ルール

- 大きな機能追加・設計変更・バグ修正のたびに **activeContext.md** と **progress.md** を更新する
- 恒久的な仕様変更は **productContext.md** / **systemPatterns.md** に反映する
- ファイルパス・定数・インフラが変わったら **techContext.md** も更新する

## インフラ早見（2026-07）

| 配信物 | サービス |
|--------|---------|
| ゲーム本体 | Vercel |
| VRM | Cloudflare Worker + R2 |
| BGM（任意） | `public/audio/` または `VITE_BGM_BASE_URL` |
| 開発 | `npm run dev`（Vite + Worker） |

## プロジェクト名

- リポジトリ: `find-the-meebits`
- package.json 名: `meebits-world`
- 表示タイトル: **Find the Meebit**
