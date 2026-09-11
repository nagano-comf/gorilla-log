# GORILLA LOG

45歳経営者の筋トレ・フットサル記録を「ゴリラレベル」で採点して公開する、静的ダッシュボードサイト。
ビルド不要。HTML 1枚＋JS 2本で動く。

```
index.html          ページ本体（レイアウト・CSS）
app.js              描画ロジック（グラフ・一覧・カレンダー）
data/records.js     ★ 記録データ。毎週ここだけ編集する
build.js            1ファイル版を dist/ に出力する補助スクリプト（任意）
training_futsal_gorilla_archive_2026-09-11.md   元になったアーカイブ（ChatGPTメモリ由来）
```

## 毎週の更新手順（5分）

1. `data/records.js` を開く
2. `records` 配列の **末尾** に今週の記録を追加する（`id` は連番）
3. 週のまとめを書くなら `weeks` 配列の末尾に1行追加する
4. `meta.updated` を更新日に書き換える
5. 保存 → `git add -A && git commit -m "week of 2026-09-18" && git push`

### 記録の書き方（コピペ用）

```js
// ジム
{
  id: "R34", date: "2026-09-18", type: "gym",
  title: "ベンチ50kg×10×3／スクワット65kg×10×3", level: 4.0,
  nickname: "○○ゴリラ",
  note: "一言コメント",
  bench: { w: 50, reps: [10, 10, 10], full: true, verified: true },
  squat: { w: 65, reps: [10, 10, 10], verified: true },
  exercises: ["上体起こし 自重×10×3", "ベンチプレス 20×10, 30×5, 50×10×3"],
  source: "画像で確認",
},
// フットサル
{
  id: "R35", date: "2026-09-20", type: "futsal",
  title: "フットサル3時間", hours: 3, level: 3.5, provisional: true,
  venue: "屋内・冷房あり",
  nickname: "○○ゴリラ",
  note: "一言コメント",
},
// 自宅トレ
{
  id: "R36", date: "2026-09-22", type: "home",
  title: "自宅トレ 6種目・16セット", level: 3.5, sets: 16,
  nickname: "○○ゴリラ",
  note: "一言コメント",
  exercises: ["ダンベルプレス 7.5kg×15×3", "ブルガリアンスクワット 自重×20×3"],
},
```

| 項目 | 意味 |
|---|---|
| `date` | `YYYY-MM-DD`。曜日から推定した日付なら `estimated: true` を付ける（一覧に「推定」、カレンダーに小さな点が出る） |
| `type` | `gym` / `futsal` / `home` |
| `level` | ゴリラレベル 2.0〜5.0、0.5刻み |
| `provisional` | 数値を画像で確認できていない回は `true`（「暫定」表示） |
| `hours` | フットサルの参加時間。不明なら書かない（合計から除外される） |
| `bench.full` | 10回×3セット達成なら `true`、未達なら `false`、回数不明なら `null` |
| `bench.verified` | 画像で確認済みなら `true`。メモ・回答情報だけなら `false` |
| `sets` | 自宅トレの総セット数（集計タイルに使う） |

自動で更新されるもの：集計タイル、直近7日、活動カレンダー、4つのグラフ、記録一覧、週判定の表。
`index.html` と `app.js` は触らなくてよい。

### 自己紹介やプロフィールを直す

`data/records.js` の `profile`（名前・年齢・肩書・リード文・5つの事実）と `meta`（総合レベル・称号）を編集する。

## ローカルで確認

`index.html` をブラウザで開くだけ。サーバー不要。

## 公開（GitHub Pages）

公開URL: **https://nagano-comf.github.io/gorilla-log/**
（リポジトリ名を変える場合は `index.html` の canonical / og:url / og:image のURLも合わせて変える）

初回だけ：

```powershell
gh auth login -h github.com -w        # ブラウザでGitHubにログイン
gh repo create gorilla-log --public --source . --push
gh api -X POST repos/nagano-comf/gorilla-log/pages -f build_type=legacy -f "source[branch]=master" -f "source[path]=/"
```

数分後に上のURLで公開される。2回目以降は `git push` だけ。

- `.nojekyll` を置いてあるので、GitHub側でJekyll処理はされない
- `training_futsal_gorilla_archive_2026-09-11.md`（元アーカイブ）は `.gitignore` で公開リポジトリから外している

## OGP（SNSシェア画像）

`og-image.png`（1200×630）を同梱。X / LINE / Slack などで共有すると、ゴリラレベルとベンチ・フットサルの数字が出る。
数字を更新したいときは、画像を作り直して同じファイル名で上書きする。

## アクセス解析（Google Analytics 4）

`index.html` の先頭付近にある1行に測定IDを入れる：

```js
window.GA_MEASUREMENT_ID = "G-XXXXXXXXXX";
```

空のままなら gtag は読み込まれない。測定IDは GA4 の 管理 → データストリーム → ウェブ から取得する
（このサイト専用のストリームを作るのが推奨。既存サイトのIDを入れると計測が混ざる）。

## 設計メモ

- グラフは外部ライブラリなしの手書きSVG。各グラフに「表で見る」があり、色に頼らず数値を読める
- 種類別の色（ジム＝青、フットサル＝緑、自宅トレ＝黄）は色覚多様性の検証済み。ダークテーマでも同じ役割で配色
- ライト／ダークは OS 設定に追従。右上の「テーマ」で手動切り替えもできる
- 2025年9月の到達水準（ベンチ45kg等）は時系列グラフには載せず、基準点として別枠表示
