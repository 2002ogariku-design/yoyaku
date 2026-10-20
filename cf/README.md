# Cloudflare 版（試験運用）

タスク集計（渋谷）を Cloudflare Pages + D1 に載せたもの。
GitHub の公開リポジトリをデータ置き場にするのをやめ、
認証は Cloudflare Access がページの手前で行う。

## 構成

    public/index.html   タスク集計ツール（画面は従来と同じ）
    public/lib/         Chart.js / SheetJS を同梱（CDN依存をなくすため）
    functions/api/      データAPI（Pages Functions → D1）
      kpi.js    GET 一覧 / POST 1件保存
      staff.js  GET 名簿
      me.js     GET ログイン中のメールアドレス

## 従来版との違い

- 共有アクセスキーの手入力が不要（Access がログインを保証する）
- 保存は1件ずつ upsert。全件を書き戻さないので同時入力で消し合わない
- 誰がいつ保存したかを audit テーブルに記録
- 外部CDNに依存しない

## デプロイ

    wrangler pages deploy public --project-name rinkan-tools --branch main

`functions/_middleware.js` は Access 有効化までの仮の蓋。
鍵が入るため .gitignore 済み。Access が入ったら削除する。
