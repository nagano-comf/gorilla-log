# GORILLA LOG 設計・運用ドキュメント

作成日：2026年9月11日
公開URL：https://nagano-comf.github.io/gorilla-log/
リポジトリ：https://github.com/nagano-comf/gorilla-log

---

## 1. 目的と方針

45歳経営者の筋トレ・フットサル記録を「ゴリラレベル」で採点し、エンタメ兼自己紹介として一般公開するダッシュボードサイト。

- **読み物ではなく、ひと目で分かるダッシュボード**。総合判定 → 集計 → 直近 → 推移 → 全記録の順に、粗い情報から細かい情報へ流す
- **毎週の更新コストを最小にする**。触るのはデータファイル1つ。集計・グラフ・カレンダーはすべて自動
- **元アーカイブの「数字の誠実さ」を崩さない**。暫定・推定・未確認を区別して表示し、分からない数字を埋めない
- **ビルド不要・依存ゼロ**。HTML 1枚と JS 2本の静的サイト。どこにでも置ける

---

## 2. ファイル構成と責務

```
training_futsal_gorilla/
├── index.html            ページ骨組み・CSS・OGP・GA4ローダー   （設計変更時のみ編集）
├── app.js                描画ロジック                          （設計変更時のみ編集）
├── data/records.js       ★ 記録データ                          （毎週編集）
├── og-image.png          SNSシェア画像のフォールバック（通常は Actions が自動生成）
├── scripts/build-og.js   記録データから OGP 用 HTML を生成
├── scripts/stamp.js      OGP URL に更新日バージョンを刻印し _site/ を組み立て
├── .github/workflows/deploy.yml  push → OGP 生成 → 刻印 → Pages デプロイ
├── build.js              1ファイル版を dist/ に出力する補助      （任意）
├── .nojekyll             GitHub Pages で Jekyll 処理を止める
├── .gitignore            dist/ と元アーカイブ md を除外
├── README.md             短い使い方
├── DESIGN_AND_OPERATIONS.md  本書
└── md-archive/           ChatGPT から書き出した週次アーカイブ md（公開リポジトリには含めない）
```

### 責務の分離

| ファイル | 持つもの | 持たないもの |
|---|---|---|
| `data/records.js` | 記録・プロフィール・総合判定・週判定・習慣・レベル定義 | 見た目、計算 |
| `app.js` | 集計、スケール計算、SVG生成、一覧・フィルタ、テーマ切替 | データそのもの、CSS |
| `index.html` | 構造、CSSトークン、レスポンシブ、メタ情報 | データ、計算 |

`data/records.js` は `window.GORILLA_DATA = {...}` を定義するだけの JS ファイル。JSON にしなかったのは、`file://` で直接開いても CORS で止まらないようにするため。

---

## 3. データモデル（`data/records.js`）

```
GORILLA_DATA
├── meta       サイト名・タグライン・最終更新日・総合レベル・総合称号
├── profile    名前・年齢・肩書・リード文・facts[]（5つの事実）
├── levels[]   ゴリラレベル Lv.1〜5 の定義
├── baseline   2025年9月の到達水準（時系列には載せない基準点）
├── records[]  日付つきの記録（本体）
├── weeks[]    週・期間単位のゴリラ判定
└── habits[]   日付に割り当てない継続習慣
```

### 3.1 record の項目

| 項目 | 型 | 必須 | 意味・ルール |
|---|---|---|---|
| `id` | 文字列 | ○ | `"R34"` のような連番。表示には使わないが追跡用 |
| `date` | `"YYYY-MM-DD"` | ○ | 実施日。ソートとカレンダー配置に使う |
| `estimated` | 真偽 | | 曜日から推定した日付なら `true`。一覧に「推定」、カレンダーに小さな点 |
| `type` | `"gym"` / `"futsal"` / `"home"` / `"rest"` | ○ | 色・集計・フィルタの軸。`rest` は予定していたジムの休養 |
| `title` | 文字列 | ○ | 一覧の見出し |
| `level` | 数値 | ○ | 2.0〜5.0、0.5刻み。`rest` は書かない（採点外） |
| `provisional` | 真偽 | | 数値を画像で確認できていない回。「暫定」表示 |
| `nickname` | 文字列 | ○ | その日の称号 |
| `note` | 文字列 | ○ | 振り返りの一言 |
| `hours` | 数値 | | フットサル参加時間。不明なら書かない（合計から除外） |
| `venue` | 文字列 | | 屋外・冷房なし など |
| `sets` | 数値 | | 自宅トレの総セット数 |
| `bench` | `{w, reps, full, verified, extra}` | | メイン重量、セット別回数、10×3達成、画像確認 |
| `squat` / `deadlift` | `{w, reps, verified}` | | 同上 |
| `exercises` | 文字列[] | | 種目の全リスト。一覧で折りたたみ表示 |
| `source` | 文字列 | | 出典メモ。タグとして表示 |

**休養（`type: "rest"`）の扱い：** 運動実施回数・セット数・レベル推移グラフには入れない。カレンダーと直近7日には「休」として出し、一覧では「採点外」。Lv.0 として平均を下げない、という元アーカイブの方針をそのまま実装している。

`bench.full` は三値：`true`（10回×3セット達成）、`false`（未達・一部）、`null`（回数不明）。グラフの点の形が変わる（塗り／輪／破線の輪）。

### 3.2 記録の扱いルール（元アーカイブから継承）

- 記録がない日を「運動していない日」と扱わない
- 片手ダンベル重量を両手合計に換算しない。片脚・片腕の回数・セットを倍算しない
- アプリの RM 表示を実測の最大挙上として扱わない
- 数値が不明な日を前後の日の値で埋めない
- 痛み・疲労は本人の感触として保存し、原因を断定しない。しんどい中で実施したこと自体を加点しない
- 2025年9月の基準（ベンチ45kg、スクワット70kg等）は同日実施の確認がないため「1回のジム」に数えず、`baseline` として別枠

---

## 4. 表示ロジック（`app.js`）

### 4.1 集計の定義

| タイル | 計算 |
|---|---|
| 収録した記録 | `records.length + 1`（+1 は baseline） |
| ジム | `type === "gym"` の件数 |
| フットサル | `hours` がある record の合計時間。副題に総件数と時間判明件数 |
| 自宅トレ | `sets` の合計 |
| ベンチプレス 最新 | `reps` がある最新のジム record の `bench.w` |
| スクワット 最新 | `squat` がある最新のジム record の `squat.w` |

### 4.2 「直近」の基準日

`anchor = max(records の最新 date, meta.updated)`。直近7日の帯とカレンダーの終端はこの日。`meta.updated` を更新し忘れても最新記録の日付で動く。

### 4.3 活動カレンダー

- 範囲：2026-06-01 以降の最初の記録を含む週の月曜 〜 anchor を含む週の日曜
- 1日1セル。同日に複数記録がある場合は先頭の1件を表示
- 範囲外の記録（3月の5時間フットサル）は下部の注記に列挙
- 月曜始まり。将来日は破線、anchor 当日は枠線

### 4.4 グラフ（外部ライブラリなしの手書きSVG）

共通：viewBox 600×250、月境界の目盛り、水平ハairline グリッド、ホバー／フォーカスでツールチップ、「表で見る」で同じ数値の表に切替。

| グラフ | 対象 | 直接ラベル |
|---|---|---|
| ベンチプレス | `bench.w` がある record。線＋点。点の形で達成状況 | 最初と最後の点 |
| スクワット | `squat.w` がある record。線＋点 | 最小値と最後の点 |
| フットサル月別 | `type === "futsal"` を月で集計。棒 | 各棒の上に時間 |
| ゴリラレベル推移 | 2026-06-01 以降の全 record。種類別の色の点 | なし（凡例＋ツールチップ） |

軸は1本のみ（二軸禁止）。色は種類＝エンティティに固定し、フィルタで塗り替えない。

### 4.5 記録一覧

新しい順。種類チップで絞り込み。初期表示 8 件、「すべて表示」で全件。`exercises` がある record は `<details>` で内訳を折りたたみ。

### 4.6 テーマ

OS 設定（`prefers-color-scheme`）に追従。右上「テーマ」で手動切替、選択は `localStorage` に保存（失敗しても動く）。CSS は `:root` にライトの全トークンを定義し、ダークは `@media` と `[data-theme="dark"]` の両方で上書き。

---

## 5. デザイン仕様

### 5.1 カラートークン

| 役割 | ライト | ダーク |
|---|---|---|
| ページ地 | `#eef0ea` | `#121714` |
| カード面 | `#fbfcf9` | `#1c221e` |
| 文字（主） | `#161a17` | `#f1f4ef` |
| 文字（副） | `#4f5a53` | `#b9c2bb` |
| アクセント（UI） | `#176b3a` | `#5fc98a` |
| **ジム** | `#2a78d6` | `#3987e5` |
| **フットサル** | `#008300` | `#008300` |
| **自宅トレ** | `#eda100` | `#c98500` |

種類3色は色覚多様性（P型・D型・T型）の分離度を検証済み。ダークで黄と緑が境界値のため、カレンダーセルの文字（ジ／フ／宅）と凡例で色以外の手がかりを必ず併記する。

### 5.2 タイポグラフィ

- 見出し・称号・大きな数字：Dela Gothic One（Google Fonts）
- 本文：Zen Kaku Gothic New（Google Fonts）、フォールバックは Hiragino / Yu Gothic / system-ui
- 表・軸目盛の数字は `tabular-nums`、大きな単独の数字は比例幅

### 5.3 レスポンシブ

- 最大幅 1120px、左右余白 16〜40px
- 760px 以下：ヒーロー・週カード・習慣が1カラム、記録カードの日付が横並びに
- カレンダーのセルは `clamp(26px, 6.5vw, 36px)` で幅を固定し、横スクロールを出さない

---

## 6. 公開インフラ

| 項目 | 内容 |
|---|---|
| ホスティング | GitHub Pages。配信元は GitHub Actions（`build_type: workflow`） |
| URL | https://nagano-comf.github.io/gorilla-log/ |
| デプロイ | `master` へ push → `.github/workflows/deploy.yml` → `_site/` を `actions/deploy-pages` で公開 |
| OGP 画像 | Actions 内で `scripts/build-og.js` が `data/records.js` から HTML を生成し、Chrome（Noto Sans CJK / Noto Color Emoji）で 1200×630 に描画。失敗時はリポジトリの `og-image.png` を使用 |
| OGP URL | `scripts/stamp.js` が `og:image` / `twitter:image` に `?v=YYYYMMDD`、`og:url` に `?w=YYYYMMDD` を刻印。値は `meta.updated` |
| シェアボタン | `?w=YYYYMMDD` 付き URL を共有。Web Share API → クリップボード → X intent の順にフォールバック |
| favicon | インライン SVG の 🦍 |
| アクセス解析 | GA4。`index.html` 冒頭の `window.GA_MEASUREMENT_ID` |
| canonical | `https://nagano-comf.github.io/gorilla-log/`（バージョンなし。検索エンジン向け） |

### 6.1 SNS カードキャッシュの回避

SNS のカードは URL 単位でキャッシュされる（X は約7日、Facebook は約30日）。毎週の更新を反映させるため、**更新日をバージョンとして URL に埋め込み、SNS から見て毎週「別の URL」にする**。

```
og:image      …/og-image.png?v=20260918    ← 画像URLが変わるので再取得される
og:url        …/gorilla-log/?w=20260918    ← og:url をキーにする SNS は別ページ扱い
シェアボタン   …/gorilla-log/?w=20260918    ← 共有URL自体をキーにする X 向け
```

`?w=` はページ側では無視される（静的サイトなので同じ内容が出る）。canonical はバージョンなしのままにして、検索エンジンの評価は1つの URL に集約する。

残る制約：素の URL を X に貼った場合は古いカードが出ることがある。これは X 側のキャッシュで、サイト側からは強制できない。シェアボタンの URL を使うのが確実。

リポジトリ名や公開先を変える場合、`index.html` 内の canonical・og:url・og:image・twitter:image の4か所を変更する。stamp.js は canonical からサイト URL を読む。

---

## 7. 運用手順

### 7.1 週次更新（所要5分）

0. ChatGPT で更新したアーカイブ md を `md-archive/` に置く。Claude Code に「今週の最新版を読んでサイトをアップデート」と頼めば、差分の record 追加・週判定・OGP画像の更新まで行う
1. `data/records.js` を開く
2. `records` 配列の末尾に今週の記録を追加（`id` は連番）。書き方は README のテンプレートを参照
3. 週のまとめを残すなら `weeks` 配列の末尾に1行追加
4. `meta.updated` を更新日に書き換える
5. `index.html` をブラウザで開いて表示を確認（サーバー不要）
6. プロジェクトフォルダで push

```powershell
cd "C:\Users\comfo\OneDrive\Documents\Workspace\src\training_futsal_gorilla"
git add -A; git commit -m "week of 2026-09-18"; git push
```

反映は通常1〜2分。

### 7.2 総合判定を更新する

`meta.overallLevel`・`meta.overallTitle`・`meta.overallNote` を書き換える。ヒーローの数字・称号・メーターが変わる。合わせて `og-image.png` も作り直すとシェア画像が揃う（7.4）。

### 7.3 プロフィール・自己紹介を直す

`profile` の `name` / `age` / `role` / `lead` / `facts[]` を編集。実名・会社名を出すかはここで決める。

### 7.4 OGP画像

通常は何もしなくてよい。push のたびに Actions が `data/records.js` の内容で画像を作り直し、URL にバージョンを付ける。

デザインを変えたいときは `scripts/build-og.js` のテンプレートを編集する。ローカルで確認するには：

```powershell
node scripts/build-og.js dist/og.html
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --screenshot="$PWD\og-image.png" "file:///$($PWD -replace '\','/')/dist/og.html"
```

これで作った `og-image.png` をコミットしておくと、Actions での生成が失敗したときのフォールバックになる。

### 7.5 GA4 を有効にする

1. GA4 管理 → データストリーム → ウェブ で、このサイト専用のストリームを作成
2. 取得した測定ID（`G-` で始まる）を `index.html` の次の行に入れる

```js
window.GA_MEASUREMENT_ID = "G-XXXXXXXXXX";
```

3. push 後、GA4 のリアルタイムレポートで自分のアクセスが出れば完了

既存サイト（comf-structure）のIDを流用すると計測が混ざるため、専用ストリームを推奨。

### 7.6 1ファイル版が必要なとき

```powershell
node build.js
```

`dist/gorilla-log-full.html`（単体で開ける）と `dist/gorilla-log.html`（Artifact 用の本文のみ）ができる。`dist/` は git 管理外。

### 7.7 元に戻す

```powershell
git log --oneline          # 戻したいコミットを確認
git revert <コミットID>     # 取り消しコミットを作って push
git push
```

---

## 8. トラブルシューティング

| 症状 | 原因と対処 |
|---|---|
| `current directory is not a git repository` | 別フォルダで実行している。先に `cd "C:\Users\comfo\OneDrive\Documents\Workspace\src\training_futsal_gorilla"` |
| push が認証エラー | `gh auth login -h github.com -w` でブラウザログインし直す |
| push したのにページが変わらない | GitHub の Actions タブで「Deploy GORILLA LOG」の結果を確認。失敗していればログの赤い行を見る。反映後もブラウザキャッシュが残ることがあるのでスーパーリロード |
| OGP 画像が古い | Actions の警告「OGP image generation failed」が出ていないか確認。出ていなければ SNS 側のキャッシュ。シェアボタンの `?w=` 付き URL を使う |
| ページが真っ白 | `data/records.js` の構文エラー（カンマ抜け・引用符）が典型。ブラウザの開発者ツール Console にエラー行が出る |
| 新しい記録がカレンダーに出ない | `date` の形式が `YYYY-MM-DD` になっているか、`type` が3種のいずれかか確認 |
| フットサル合計が増えない | `hours` を書いていない。不明なら意図どおり（合計から除外） |
| シェア画像が古い | SNS 側のキャッシュ。バリデーターで再取得 |
| フォントが違って見える | Google Fonts が読めない環境。フォールバックで動作自体は問題なし |
| GA4 に数字が出ない | 測定IDが空、または `G-` の ID を取り違えている。リアルタイムレポートで確認 |

---

## 9. 今後の拡張候補

- 月次ページ／年間振り返り（`weeks` を月単位に集計）
- 部位バランス（胸・肩・背中・脚）の集計チャート。`exercises` を構造化すれば算出可能
- 週次更新を GitHub の Web エディタから行い、PC を開かずにスマホで完結させる
- 記録画像の同梱（`assets/` に置いて record に `image` を持たせる）

---

## 10. 変更履歴

| 日付 | 内容 |
|---|---|
| 2026-09-11 | 初版。33項目のアーカイブを構造化し、ダッシュボード・OGP・GA4ローダーを実装。GitHub Pages で公開 |
| 2026-09-18 | R34〜R37 を追加（37項目）。休養タイプ `rest` を導入し採点外として表示。週判定に「今週のひと言」を追加。OGP画像のフットサル合計を37.5hに更新 |
| 2026-09-18 | 配信を GitHub Actions に切替。OGP 画像を記録データから自動生成し、`og:image` / `og:url` に更新日バージョンを自動刻印。シェアボタンを追加 |
