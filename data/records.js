/* =====================================================================
   GORILLA LOG — データファイル
   毎週の更新はこのファイルだけ編集すればOK。index.html / app.js は触らない。

   ■ 週次更新の手順
     1. records に新しい記録を「末尾に」追加する（id は連番、R34, R35 ...）
     2. weeks に今週の週判定を追加する（任意）
     3. meta.updated を更新日に書き換える
     4. 保存してデプロイ（git commit → push）

   ■ record の項目
     id        : "R34" のような連番
     date      : "2026-09-18"（YYYY-MM-DD）。曜日から推定した日付なら estimated: true
     type      : "gym" | "futsal" | "home"
     title     : 一覧に出る短い見出し
     level     : ゴリラレベル 2.0〜5.0（0.5刻み）
     provisional : true なら「暫定」。数値が画像未確認など
     nickname  : その日の称号（例「50kg三連完遂ゴリラ」）
     note      : 一言コメント（振り返り）
     hours     : フットサルの参加時間（不明なら省略）
     venue     : 会場メモ（屋外・冷房なし など。任意）
     bench     : { w: 50, reps: [10,10,10], full: true, verified: true }
                 w=メイン重量, reps=セットごとの回数, full=10回×3セット達成か, verified=画像で確認済みか
     squat     : { w: 65, reps: [10,10,10], verified: true }
     deadlift  : { w: 40, reps: [10,10,10], verified: true }
     exercises : [ "上体起こし 自重×10×3", ... ]  種目の全リスト（任意）
     sets      : 自宅トレの総セット数（任意）
     source    : 出典メモ（任意）
   ===================================================================== */

window.GORILLA_DATA = {
  meta: {
    siteName: "GORILLA LOG",
    tagline: "45歳経営者の、筋トレとフットサルの記録",
    updated: "2026-09-11",
    since: "2025-09",
    overallLevel: 4.0,
    overallTitle: "走れる都市型ゴリラ",
    overallNote:
      "最大重量だけで威圧するタイプではなく、ジム、フットサル、自宅トレを生活の中に組み込んできたタイプ。休む週も含めて運動を続けていることへの称号。",
  },

  profile: {
    name: "ナガノ",
    age: 45,
    role: "経営者",
    lead: "平日は会社を回し、週末はボールを蹴り、週1でバーベルを担ぐ。ゴリラなのかどうかを、記録で確かめているページです。",
    facts: [
      { label: "パーソナルジム", value: "週1回・約3年" },
      { label: "フットサル", value: "週1回程度・4年以上" },
      { label: "自宅トレ", value: "火・木にダンベル7.5kg" },
      { label: "ジムまで", value: "バス停4個分を徒歩で往復" },
      { label: "基本姿勢", value: "エンジョイ・けがをしない・長く続ける" },
    ],
  },

  /* ゴリラレベルの定義（5段階・0.5刻み・ユーモラスな評価） */
  levels: [
    { lv: 1, name: "身体を起こすゴリラ", desc: "ごく軽い運動・導入的な内容" },
    { lv: 2, name: "軽やかゴリラ", desc: "軽い補助トレや、本人がゆるいと述べるスポーツ参加" },
    { lv: 3, name: "日常に定着したゴリラ", desc: "独立した1回として扱える筋トレや、まとまったスポーツ参加" },
    { lv: 4, name: "都市型ゴリラ", desc: "内容のある筋トレ、反復の達成・安定、密度のある運動週" },
    { lv: 5, name: "記録上の規格外ゴリラ", desc: "この日誌の中でも際立つ内容。競技者級の認定ではない" },
  ],

  /* 2025年9月の基準点（時系列チャートには載せず、基準として表示） */
  baseline: {
    label: "2025年9月の到達水準",
    bench: "45kg × 10回 × 3セット",
    squat: "70kg（回数・セット数は不明）",
    deadlift: "50kg（回数・セット数は不明）",
    level: 3.5,
    nickname: "すでに土台のあるゴリラ",
  },

  records: [
    {
      id: "R02", date: "2026-03-06", estimated: true, type: "futsal",
      title: "フットサル5時間", hours: 5, level: 4.5, provisional: true,
      nickname: "フットサル長編上映ゴリラ",
      note: "記録上、最長の参加枠。「もう運動ではなく業務」。5時間ずっと走り続けたという評価ではない。",
      source: "3月6日に報告。実施は直前の土曜日。",
    },
    {
      id: "R03", date: "2026-06-08", estimated: true, type: "gym",
      title: "ベンチ47.5kg×10×3／スクワット55kg×10×3", level: 3.5,
      nickname: "47.5kgを積む基礎工事ゴリラ",
      note: "47.5kgでベンチを3セットそろえ、脚も55kgで3セット。後の50kgを振り返るうえでの基準点。",
      bench: { w: 47.5, reps: [10, 10, 10], full: true, verified: true },
      squat: { w: 55, reps: [10, 10, 10], verified: true },
      exercises: ["上体起こし 自重×10×3", "ベンチプレス 20×10, 30×5, 47.5×10×3, 30×10", "ダンベルフライ 12kg×10×3", "バーベルスクワット 20×5, 40×5, 55×10×3", "フロントレイズ 4kg×15, 6kg×10×2"],
      source: "画像で確認（日付はファイル名）",
    },
    {
      id: "R04", date: "2026-06-14", type: "futsal",
      title: "フットサル3時間", hours: 3, level: 3.5, provisional: true,
      nickname: "週末を使い切るゴリラ",
      note: "参加時間としてはまとまった1回。6月の記録を並べると継続の一部として位置づけられる。",
    },
    {
      id: "R05", date: "2026-06-17", type: "futsal",
      title: "フットサル1.5時間", hours: 1.5, level: 2.5, provisional: true,
      nickname: "平日参加型ゴリラ",
      note: "長さだけを競わず、日常の中で継続している記録。",
    },
    {
      id: "R06", date: "2026-06-20", type: "futsal",
      title: "フットサル3.5時間", hours: 3.5, level: 4.0, provisional: true,
      nickname: "延長戦までいるゴリラ",
      note: "14日の3時間、17日の1.5時間から続く。1週間の参加頻度も印象的。",
    },
    {
      id: "R07", date: "2026-06-22", type: "gym",
      title: "ベンチ47.5kg 10・10・9／スクワット50kg×10×3", level: 3.5,
      nickname: "あと1回を記録するゴリラ",
      note: "ベンチは47.5kgで計29回。3セット目の1回不足を隠さず記録しつつ、胸・背中・脚・肩まで実施。",
      bench: { w: 47.5, reps: [10, 10, 9], full: false, verified: true },
      squat: { w: 50, reps: [10, 10, 10], verified: true },
      exercises: ["上体起こし 自重×10×2", "ベンチプレス 20×10, 30×5, 47.5×10・10・9, 35×10", "ダンベルフライ 10kg×10×3", "ラットプルダウン 25kg×10×3", "バーベルスクワット 20×10, 30×10, 50×10×3", "フロントレイズ 6kg×10×2, 8kg×10"],
      source: "画像で確認",
    },
    {
      id: "R08", date: "2026-06-24", type: "futsal",
      title: "フットサル2時間", hours: 2, level: 3.0, provisional: true,
      nickname: "いつもの2時間ゴリラ",
      note: "22日のジムと26日のジムの間。筋トレと球技を同じ生活の中で続けている。",
    },
    {
      id: "R09", date: "2026-06-26", type: "gym",
      title: "ベンチ50kg 10・10・6／デッドリフト40kg×10×3", level: 3.5,
      nickname: "50kgへ進出するゴリラ",
      note: "ベンチ50kgが登場する回。10回を2セットそろえ、3セット目は6回。",
      bench: { w: 50, reps: [10, 10, 6], full: false, verified: true },
      deadlift: { w: 40, reps: [10, 10, 10], verified: true },
      exercises: ["上体起こし 自重×10×3", "ベンチプレス 20×10, 30×5, 50×10・10・6, 30×10", "デッドリフト 20×10, 40×10×3", "ラットプルダウン 25kg×20, 28kg×20×2", "フロントレイズ 6kg×12×3"],
      source: "画像で確認",
    },
    {
      id: "R10", date: "2026-06-29", type: "gym",
      title: "ベンチ50kg×10×2＋40kg×10×2／スクワット40kg×10×3", level: 3.5,
      nickname: "重量を切り替えて積むゴリラ",
      note: "50kgを2セット行ったあと、40kgに切り替えて反復を積んだ。その日のメニューとして重量を変えている。",
      bench: { w: 50, reps: [10, 10], full: false, verified: true, extra: "その後 40kg×10×2" },
      squat: { w: 40, reps: [10, 10, 10], verified: true },
      exercises: ["上体起こし 自重×10×3", "ベンチプレス 20×10, 30×5, 50×10×2, 40×10×2", "ダンベルフライ 12kg×10×3", "バーベルスクワット 20×10, 40×10×3"],
      source: "画像で確認",
    },
    {
      id: "R11", date: "2026-07-06", type: "gym",
      title: "ベンチ50kg×10×3 達成／足首のためスクワットなし", level: 4.0,
      nickname: "50kg三連完遂ゴリラ",
      note: "6月26日の10／10／6回から、3セットとも10回へ。50kg×10回×3セットの明確な節目。脚を休んだことは減点しない。",
      bench: { w: 50, reps: [10, 10, 10], full: true, verified: true },
      exercises: ["上体起こし 自重×10×3", "ベンチプレス 20×10, 30×5, 50×10×3, 35×10", "ダンベルフライ 12kg×10×3", "ラットプルダウン 25×10, 30×10, 35×10", "フロントレイズ 6kg×15, 8kg×10×2", "スクワット 実施なし（左足首）"],
      source: "画像で確認",
    },
    {
      id: "R12", date: "2026-07-12", estimated: true, type: "futsal",
      title: "フットサル3時間", hours: 3, level: 3.5, provisional: true,
      venue: "屋内・冷房なし",
      nickname: "屋内コート常駐ゴリラ",
      note: "同じ週の水曜・木曜にも参加記録があり、週単位では密度が高い。暑さは加点理由にしない。",
    },
    {
      id: "R13", date: "2026-07-14", type: "gym",
      title: "ベンチ50kg×10×3 が安定／スクワット50kg×10×3", level: 4.0,
      nickname: "再現性がついてきたゴリラ",
      note: "一度だけそろった記録から、本人も「安定」と感じる記録へ。トレーナーは「ベンチもスクワットもまだ伸ばせる」。",
      bench: { w: 50, reps: [10, 10, 10], full: true, verified: false },
      squat: { w: 50, reps: [10, 10, 10], verified: false },
      exercises: ["ベンチプレス 20×10, 30×5, 50×10×3, 35×10", "バーベルスクワット 20×10, 50×10×3", "ラットプルダウン 35kg×10×3", "フロントレイズ 8kg×10×3"],
      source: "保存メモ・当時の回答・二次レポート",
    },
    {
      id: "R14", date: "2026-07-15", estimated: true, type: "futsal",
      title: "フットサル2時間", hours: 2, level: 3.0, provisional: true,
      venue: "屋外・直射日光",
      nickname: "平日屋外コートゴリラ",
      note: "前後にジムとフットサルの記録がある週の1回。",
    },
    {
      id: "R15", date: "2026-07-16", estimated: true, type: "futsal",
      title: "フットサル・クリニック1.5時間", hours: 1.5, level: 2.5, provisional: true,
      venue: "屋根あり",
      nickname: "クリニック参加ゴリラ",
      note: "ゲーム参加だけでなく、クリニックにも通っている。この週のフットサルは3回・計6.5時間。",
    },
    {
      id: "R16", date: "2026-07-21", type: "gym",
      title: "ベンチで力が出ず、全体にブレ", level: 3.5, provisional: true,
      nickname: "出力が揺れる日も記録するゴリラ",
      note: "好調だけでなく、不安定だった日も保存。原因は確定しない。重量・回数は不明。",
    },
    {
      id: "R17", date: "2026-07-27", type: "gym",
      title: "ベンチが再びブレる／10日ほど体調がすっきりしない", level: 3.5, provisional: true,
      nickname: "コンディション観察ゴリラ",
      note: "本人が体調の揺らぎを言語化している。よかった日だけでは分からない経過。",
    },
    {
      id: "R18", date: "2026-07-31", estimated: true, type: "futsal",
      title: "金曜日のフットサル（時間不明）", level: 3.0, provisional: true,
      nickname: "金曜もボールを蹴るゴリラ",
      note: "日曜にも参加し、その後ジムへ行った並びの一部。時間不明のため合計には含めない。",
    },
    {
      id: "R19", date: "2026-08-02", estimated: true, type: "futsal",
      title: "日曜日のフットサル（時間不明）", level: 3.0, provisional: true,
      nickname: "日曜もボールを蹴るゴリラ",
      note: "金曜日に続く参加で、翌日にはジム。",
    },
    {
      id: "R20", date: "2026-08-03", type: "gym",
      title: "ベンチの感触良好／自分でフォーム修正", level: 4.0, provisional: true,
      nickname: "セルフ修正できるゴリラ",
      note: "フォームが少し崩れた気がしたので自分で修正。左膝が少し気になる。「スクワットは毎回バーベルスクワット」と本人が明示した日。",
      bench: { w: 50, reps: [10, 10, 10], full: true, verified: false },
      source: "後日の回答にある値。元画像は未照合",
    },
    {
      id: "R21", date: "2026-08-09", estimated: true, type: "futsal",
      title: "フットサル2時間", hours: 2, level: 3.0, provisional: true,
      venue: "屋外",
      nickname: "日曜屋外ゴリラ",
      note: "日曜フットサル、月曜ジム、火曜フットサルという3日間の起点。",
    },
    {
      id: "R22", date: "2026-08-10", type: "gym",
      title: "ベンチ50kg、ラスト3回を耐えた", level: 3.5, provisional: true,
      nickname: "昭和の根性・回数は要確認ゴリラ",
      note: "「ベンチ50のラスト3回は昭和の根性で耐えました」。各セットの正確な回数は保留。膝の調子はいまひとつ。",
      bench: { w: 50, reps: null, full: null, verified: false },
    },
    {
      id: "R23", date: "2026-08-11", type: "futsal",
      title: "フットサル3時間", hours: 3, level: 3.5, provisional: true,
      venue: "冷房完備",
      nickname: "空調完備の連日稼働ゴリラ",
      note: "日月火の3日連続運動。「私はドMなのでしょうか」はユーモアとして保存。",
    },
    {
      id: "R24", date: "2026-08-16", estimated: true, type: "futsal",
      title: "フットサル1.5時間（すごくゆるい）", hours: 1.5, level: 2.0,
      venue: "屋外",
      nickname: "ゆるく遊べるゴリラ",
      note: "本人が「すごくゆるく」と明示。低めのレベルは「悪い運動」という意味ではない。",
    },
    {
      id: "R25", date: "2026-08-18", type: "gym",
      title: "ベンチ50kg 10・10・9／スクワット60kg×10×3", level: 4.0, provisional: true,
      nickname: "29回で踏みとどまるゴリラ",
      note: "最後の1回が半分上がらなかった。それでも50kgを計29回、スクワット60kgを3セット。当時の総合評価は8／10。",
      bench: { w: 50, reps: [10, 10, 9], full: false, verified: false },
      squat: { w: 60, reps: [10, 10, 10], verified: false },
      exercises: ["ベンチプレス 50×10・10・9", "バーベルスクワット 60×10×3", "インクラインベンチプレス 35×10×3"],
      source: "当時の回答情報。元画像は未照合",
    },
    {
      id: "R26", date: "2026-08-22", estimated: true, type: "futsal",
      title: "フットサル3時間", hours: 3, level: 3.5, provisional: true,
      nickname: "週末3時間の常連ゴリラ",
      note: "ゆるい1.5時間の回と3時間の回。時間と本人の感触を分けて残す。",
    },
    {
      id: "R27", date: "2026-08-24", type: "gym",
      title: "朝は頭がぼんやり／その割に仕事も身体も動いた", level: 3.5, provisional: true,
      nickname: "頭は曇天、記録は継続ゴリラ",
      note: "頭の感覚と身体の動きにずれがあった日。重量・反復数は不明。",
    },
    {
      id: "R28", date: "2026-08-31", type: "gym",
      title: "スクワットのフォームが崩れず、まだ伸びそう", level: 3.5, provisional: true,
      nickname: "間隔が空いても戻るゴリラ",
      note: "1週間ぶりの運動。トレーナー評価「フォームが崩れないのでまだ伸びそう」。休養週を低評価に変換しない。",
    },
    {
      id: "R29", date: "2026-09-05", type: "futsal",
      title: "フットサル2.5時間", hours: 2.5, level: 3.5, provisional: true,
      nickname: "週の開幕を蹴るゴリラ",
      note: "9月5〜11日の週の、フットサル1回目。",
    },
    {
      id: "R30", date: "2026-09-08", type: "home",
      title: "自宅トレ 4種目・10セット", level: 3.0, sets: 10,
      nickname: "リビング筋トレゴリラ",
      note: "自宅でも肩・上腕三頭筋・胸・脚まで触れている。",
      exercises: ["フロントレイズ 7.5kg×10×2", "フレンチプレス 7.5kg×15×2", "ダンベルフライ 7.5kg×10×3", "ブルガリアンスクワット 自重×20×3"],
      source: "画像で確認",
    },
    {
      id: "R31", date: "2026-09-09", type: "futsal",
      title: "フットサル2時間", hours: 2, level: 3.0, provisional: true,
      nickname: "平日にも出場するゴリラ",
      note: "前日に自宅トレ、翌日も自宅トレ、その翌日にジムという並びの中の1回。",
    },
    {
      id: "R32", date: "2026-09-10", type: "home",
      title: "自宅トレ 6種目・16セット", level: 3.5, sets: 16,
      nickname: "自宅を支店ジムにするゴリラ",
      note: "重量だけ見ると軽く見えやすいが、種目とセット数を並べるとしっかりメニューを組んでいる。",
      exercises: ["ダンベルプレス 7.5kg×15×3", "ブルガリアンスクワット 自重×20×3", "ワンハンドローイング 7.5kg×30×3", "ダンベルフライ 7.5kg×10×3", "フロントレイズ 7.5kg×10×2", "フレンチプレス 7.5kg×15×2"],
      source: "画像で確認",
    },
    {
      id: "R33", date: "2026-09-11", type: "gym",
      title: "ベンチ50kg×10×3／スクワット65kg×10×3", level: 4.0,
      nickname: "走れる都市型ゴリラ",
      note: "数値を画像で確認できる最新の全身トレーニング。前後に自宅トレとフットサルがある点が、本人らしい運動生活。",
      bench: { w: 50, reps: [10, 10, 10], full: true, verified: true },
      squat: { w: 65, reps: [10, 10, 10], verified: true },
      exercises: ["上体起こし 自重×10×3", "ベンチプレス 20×10, 30×5, 50×10×3, 35×10", "インクラインベンチプレス 30×10×3", "バーベルスクワット 20×10, 40×5, 65×10×3", "フロントレイズ 8kg×12×3"],
      source: "画像で確認",
    },
  ],

  /* 週単位・期間単位のゴリラ判定（新しいものを末尾に追加） */
  weeks: [
    { range: "6月14〜20日", combo: "フットサル3回・計8時間", level: 4.0, name: "コート滞在多めゴリラ", note: "参加枠として長い週。実働強度は不明" },
    { range: "7月12〜16日ごろ", combo: "フットサル3回・計6.5時間＋7月14日のジム", level: 4.0, name: "球技と鉄の二刀流ゴリラ", note: "一部の日付は推定" },
    { range: "8月9〜11日ごろ", combo: "フットサル2時間 → ジム → フットサル3時間", level: 4.0, name: "日月火の三連ゴリラ", note: "本人の「ドM？」発言が出た並び" },
    { range: "8月24〜31日", combo: "8月31日は先週のジム以来の運動", level: null, name: "休養・間隔を含む継続", note: "運動量の少ない期間を低評価に変換しない" },
    { range: "9月5〜11日", combo: "筋トレ3日＋フットサル2日・計4.5時間", level: 4.0, name: "走れる都市型ゴリラ", note: "自宅10＋16セット、ジム16セット。胸・肩にやや偏り" },
  ],

  /* 個別の日付に割り当てない継続習慣 */
  habits: [
    { title: "週1回のパーソナルジムを約3年", level: 4.0, name: "長期運用ゴリラ", body: "「週1回・比較的軽い重量でも、長く続ける」が方針。トレーナーからは週1回でも筋肉が増えていると言われた（本人談）。" },
    { title: "フットサルを週1回程度、4年以上", level: 4.0, name: "ボールを蹴る生活が定着したゴリラ", body: "基本姿勢はエンジョイ、けがの回避、有酸素運動としての活用。週2〜3回の週もある。" },
    { title: "火・木の自宅トレ", level: 2.5, name: "自宅補強ゴリラ", body: "7月時点は腹筋20回×3と10kgスクワット。9月からは7.5kgダンベル種目とブルガリアンスクワットのメニューに。" },
    { title: "ジム往復の徒歩", level: null, name: "徒歩通勤型ゴリラ", body: "バス停4個分ほどを歩く習慣。運動回数の集計には入れない。" },
  ],
};
