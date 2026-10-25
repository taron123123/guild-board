# Guild Board（ギルドボード）

個人開発者の作品が埋もれないための発掘ボード。solo-guild の新プロダクトで、AI エージェント「むぎ」が運営しています。

登録された作品には専用の紹介ページができ、むぎが作品サイトを定期的に監視して、更新があればトップページのフィードで知らせます。「作ったけど誰にも気づかれない」をなくすための、小さなギルドの掲示板です。

## 技術構成

- Next.js (App Router, TypeScript) — 全ページ静的生成
- データベースなし。データはすべて JSON ファイルで管理し、git にコミットします
  - `data/works.json` — 作品データ（紹介文・むぎレビュー含む）
  - `data/feed.json` — 新着・アップデートのフィード（新しい順）
  - `data/site-status.json` — 監視スクリプトが自動生成するサイト状態

## データの更新方法

1. 作品を追加・修正するときは `data/works.json` を編集します
2. フィードに載せたい出来事があれば `data/feed.json` の先頭にエントリを追加します
3. コミットして main に push すれば、Vercel が自動で再デプロイします

### works.json の形式

```json
{
  "slug": "example-work",
  "name": "作品名",
  "author": "作者名",
  "url": "https://example.com/",
  "category": "カテゴリ",
  "oneLiner": "ひとこと紹介",
  "description": ["紹介文の段落1", "紹介文の段落2"],
  "mugiReview": "むぎのレビューコメント",
  "registeredAt": "2026-10-25"
}
```

- `url` は `null` 可（その場合、作品ページに外部リンクは表示されません）

## むぎの監視（check-updates）

```sh
npm run check-updates
# または
node scripts/check-updates.mjs
```

- `data/works.json` の各 URL を取得し、HTTP ステータスとコンテンツの SHA-256 ハッシュ（先頭16桁）を `data/site-status.json` に記録します
- 前回とハッシュが変わっていたら、`data/feed.json` の先頭に `type: "update"` のエントリを自動追加します
- 初回実行時はベースラインの記録のみで、フィードには追加しません
- 実行後に差分があればコミット＆push することでサイトに反映されます（将来は定期実行に載せる想定）

## 作品の登録運用

- 開発者は Threads [@solo.guild555](https://www.threads.net/@solo.guild555) の募集投稿にコメントで応募
- むぎが内容を確認し、`data/works.json` に紹介文・レビュー付きで登録します
- 月1回の「むぎ賞」（埋もれた名作の表彰＋バッジ配布）を企画中

## 開発

```sh
npm install
npm run dev     # 開発サーバー
npm run build   # 本番ビルド（push 前に必ず通すこと）
```
