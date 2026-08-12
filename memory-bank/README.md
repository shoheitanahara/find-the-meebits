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
| `/runway` `/jp/runway` | `runway` | Meebits Runway（日替わりカラー・観賞＋着席） |
| `/mountain` `/jp/mountain` | `mountain` | Mt. Meeb |
| `/neon-stack` | `neon` | Jerry Mountain（互換ルート） |
| `/shooting-gallery` `/jp/shooting-gallery` | `shooting` | Shooting Gallery |
| `/photo-booth` `/jp/photo-booth` | `pfp`（互換 `/pfp-studio`） | Photo Booth（PFP・来場証明書） |
| `/shore-fishing` `/jp/shore-fishing` | `fishing` | Shore Fishing（孤島釣り） |
| `/opensea-market` `/jp/opensea-market` | `opensea` | OpenSea Market（出品／直近売却を彫刻展示） |
| `/meet-sergito` `/jp/meet-sergito` | `sergito` | Meet Sergito |

- ルート判定: `src/game/appEdition.ts`（`getAppEdition`）
- Park 設計: **[parkDesigner.md](./parkDesigner.md)**（共通骨格・橋ゲート・カージナル導線）
- **配置の正**: `parkDesigner.md` **§14 Canonical Default Layout**（2026-07-24 凍結、Culture Runway は 2026-07-28 更新）+ `src/top/parkZones.ts` / `topConfig.ts`
- Runway 座標・接地: `.cursor/rules/threejs-coordinates.mdc`
- Meebit VRM 腕ボーン: **[meebitVrmArms.md](./meebitVrmArms.md)**（捻れ禁止・attention z・肘 x・**釣り竿脇**）
- Photo Booth（ポーズ・カメラ・小道具）: **[photoStudio.md](./photoStudio.md)**
- Shore Fishing（島・竿・NPC）: **[shoreFishing.md](./shoreFishing.md)**
- OpenSea Market（Listing / 直近売却・3ギャラリー彫刻）: **[openSeaMarket.md](./openSeaMarket.md)**
- `/` `/jp` は Park（`top`）。`find-the-meebit` セグメントで v1。

## 読む順序（推奨）

1. **[projectbrief.md](./projectbrief.md)** — プロジェクト概要・目的
2. **[techContext.md](./techContext.md)** — 技術スタック・デプロイ・**TS リテラル型落とし穴**・パフォーマンス
3. **[systemPatterns.md](./systemPatterns.md)** — アーキテクチャ・主要ファイル・設計パターン
4. **[productContext.md](./productContext.md)** — ゲームデザイン・ユーザー嗜好・コンテンツ方針
5. **[parkDesigner.md](./parkDesigner.md)** — **Park 設計士ノート**（ゾーン／導線／**§14 配置デフォルト**）
6. **[attractionCopy.md](./attractionCopy.md)** — **入口看板・スタートカード**（文字量／ディズニー入口トーン）
7. **[parkNpcDialogue.md](./parkNpcDialogue.md)** — **NPC Dialogue Bible**（来場者の生活として語る／アプリ実態との合わせ方）
8. **[meebitVrmArms.md](./meebitVrmArms.md)** / **[photoStudio.md](./photoStudio.md)** / **[shoreFishing.md](./shoreFishing.md)** — VRM 腕・スタジオ・釣り
9. **[activeContext.md](./activeContext.md)** — 直近の作業内容・現在の状態
10. **[progress.md](./progress.md)** — 完了済み・既知の課題・未着手

## 更新ルール

- 大きな機能追加・設計変更・バグ修正のたびに **activeContext.md** と **progress.md** を更新する
- 恒久的な仕様変更は **productContext.md** / **systemPatterns.md** に反映する
- **Park のゾーン・導線・配置ルール**が変わったら **parkDesigner.md** も更新する
- **入口看板・スタートカードのコピー**が変わったら **attractionCopy.md** も更新する
- **NPC の魅力トーン・日替わり伝え方**が変わったら **parkNpcDialogue.md** と `parkDialogueExpand.ts` をセットで更新する
- **Photo Booth のポーズ／カメラ／小道具**が変わったら **photoStudio.md**（と必要なら **meebitVrmArms.md**）を更新する
- **Shore Fishing の竿・島・NPC**が変わったら **shoreFishing.md** / **meebitVrmArms.md** を更新する
- **OpenSea Market**（API・ギャラリー・彫刻／売却リボン・カメラ）が変わったら **openSeaMarket.md** を更新する
- ファイルパス・定数・インフラ・**頻出 TS エラー**が変わったら **techContext.md** も更新する

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
