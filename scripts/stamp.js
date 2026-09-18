/* 公開用ディレクトリを組み立て、OGP の URL に更新日バージョンを刻印する。
   使い方: node scripts/stamp.js [出力ディレクトリ] [og-image のパス]   （既定: _site, og-image.png）

   やること
   - index.html の og:image / twitter:image を  og-image.png?v=YYYYMMDD  に
   - og:url を  <サイトURL>?w=YYYYMMDD  に（SNS が毎週「別のページ」として再取得する）
   - <meta name="gorilla-version"> を埋め込む（シェアボタンが同じ値を使う）
   - app.js / data/ / .nojekyll / og-image.png をコピー
   バージョンは data/records.js の meta.updated から取る。何度実行しても同じ結果（冪等）。 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const outDir = process.argv[2] || path.join(root, "_site");
const ogSrc = process.argv[3] || path.join(root, "og-image.png");

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "data", "records.js"), "utf8"), ctx);
const ver = ctx.window.GORILLA_DATA.meta.updated.replace(/-/g, "");

let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const site = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
if (!site) throw new Error("canonical URL not found in index.html");

html = html
  .replace(/(property="og:image" content="[^"?]+)(\?v=\d+)?"/, `$1?v=${ver}"`)
  .replace(/(name="twitter:image" content="[^"?]+)(\?v=\d+)?"/, `$1?v=${ver}"`)
  .replace(/(property="og:url" content="[^"?]+)(\?w=\d+)?"/, `$1?w=${ver}"`)
  .replace(/<meta name="gorilla-version" content="[^"]*">\n?/, "")
  .replace(/<link rel="canonical"/, `<meta name="gorilla-version" content="${ver}">\n<link rel="canonical"`);

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, "data"), { recursive: true });
fs.writeFileSync(path.join(outDir, "index.html"), html);
fs.copyFileSync(path.join(root, "app.js"), path.join(outDir, "app.js"));
fs.copyFileSync(path.join(root, "data", "records.js"), path.join(outDir, "data", "records.js"));
fs.copyFileSync(ogSrc, path.join(outDir, "og-image.png"));
fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
console.log(`stamped v=${ver} → ${outDir} (site ${site})`);
