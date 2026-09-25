/* data/records.js から OGP 画像用の HTML を生成する。
   使い方: node scripts/build-og.js [出力ファイル]   （既定: dist/og.html）
   その後、ヘッドレスブラウザで 1200×630 のスクリーンショットを撮ると og-image.png になる。
   - GitHub Actions: .github/workflows/deploy.yml が自動で実行
   - Windows ローカル:
       & "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --screenshot="og-image.png" "file:///<絶対パス>/dist/og.html"
*/
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const out = process.argv[2] || path.join(root, "dist", "og.html");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "data", "records.js"), "utf8"), ctx);
const D = ctx.window.GORILLA_DATA;

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const records = D.records.slice().sort((a, b) => a.date.localeCompare(b.date));
const gym = records.filter((r) => r.type === "gym");
const futsalHours = records.filter((r) => r.type === "futsal" && r.hours != null).reduce((s, r) => s + r.hours, 0);
const lastBench = gym.slice().reverse().find((r) => r.bench && r.bench.reps);
const week = D.weeks[D.weeks.length - 1];
const lv = D.meta.overallLevel;
const fmtReps = (x) => (x.reps.every((v) => v === x.reps[0]) ? `×${x.reps[0]}回×${x.reps.length}セット` : `×${x.reps.join("・")}回`);
const updated = D.meta.updated.replace(/-/g, ".");

const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{background:#121714;color:#f1f4ef;font-family:"Noto Sans CJK JP","Noto Sans JP","Yu Gothic UI","Yu Gothic","Meiryo","Segoe UI",sans-serif;position:relative}
.bg{position:absolute;inset:0;background:radial-gradient(900px 500px at 85% 20%, rgba(95,201,138,.22), transparent 60%),linear-gradient(180deg,#151b17 0%,#121714 100%)}
.rule{position:absolute;left:72px;right:72px;top:96px;height:3px;background:#f1f4ef}
.brand{position:absolute;left:72px;top:118px;font-size:96px;font-weight:900;letter-spacing:.02em;line-height:1}
.tag{position:absolute;left:76px;top:232px;font-size:28px;font-weight:500;color:#b9c2bb}
.gor{position:absolute;right:88px;top:112px;font-size:150px;line-height:1;font-family:"Noto Color Emoji","Segoe UI Emoji","Apple Color Emoji",sans-serif}
.lvwrap{position:absolute;left:72px;top:318px;display:flex;align-items:baseline;gap:22px}
.lv{font-size:150px;font-weight:900;line-height:1;letter-spacing:-.01em}
.lv small{font-size:34px;font-weight:700;color:#8b958e;vertical-align:top;position:relative;top:22px;margin-right:6px}
.title{font-size:54px;font-weight:900;line-height:1.1}
.week{position:absolute;left:76px;top:478px;font-size:24px;color:#b9c2bb;max-width:600px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.week b{color:#f1f4ef;font-weight:900}
.meter{position:absolute;left:76px;bottom:58px;display:flex;gap:10px}
.meter span{width:120px;height:16px;border-radius:4px;background:#2f3a33;overflow:hidden;position:relative}
.meter span i{position:absolute;inset:0;background:#5fc98a;border-radius:4px}
.cap{position:absolute;left:76px;bottom:32px;font-size:18px;color:#8b958e;letter-spacing:.14em;font-weight:700}
.stats{position:absolute;right:72px;bottom:56px;text-align:right;font-size:24px;color:#b9c2bb;line-height:1.55}
.stats b{color:#f1f4ef;font-size:34px;font-weight:900}
.upd{position:absolute;right:72px;bottom:32px;font-size:16px;color:#8b958e;letter-spacing:.08em}
</style></head><body>
<div class="bg"></div>
<div class="rule"></div>
<div class="brand">${esc(D.meta.siteName)}</div>
<div class="tag">${esc(D.meta.tagline)}</div>
<div class="gor">🦍</div>
<div class="lvwrap"><div class="lv"><small>Lv.</small>${lv.toFixed(1)}</div><div class="title">${esc(D.meta.overallTitle)}</div></div>
<div class="week">今週：<b>${esc(week.name)}</b>${week.level != null ? `　Lv.${week.level.toFixed(1)}` : ""}</div>
<div class="meter">${[1, 2, 3, 4, 5].map((i) => `<span><i style="width:${Math.max(0, Math.min(1, lv - (i - 1))) * 100}%"></i></span>`).join("")}</div>
<div class="cap">GORILLA LEVEL ${lv.toFixed(1)} / 5</div>
<div class="stats">${lastBench ? `<b>ベンチ ${lastBench.bench.w}kg</b> ${fmtReps(lastBench.bench)}<br>` : ""}<b>フットサル ${futsalHours}h</b> 記録分の合計</div>
<div class="upd">UPDATED ${esc(updated)}</div>
</body></html>
`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log("og html:", out);
