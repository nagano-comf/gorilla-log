/* index.html + data/records.js + app.js を1ファイルにまとめる（Artifact配布や単体プレビュー用）
   使い方: node build.js [出力先ディレクトリ]   → dist/gorilla-log.html を生成 */
const fs = require("fs");
const path = require("path");
const outDir = process.argv[2] || path.join(__dirname, "dist");
const read = (f) => fs.readFileSync(path.join(__dirname, f), "utf8");
let html = read("index.html")
  .replace('<script src="data/records.js"></script>', () => "<script>\n" + read("data/records.js") + "\n</script>")
  .replace('<script src="app.js"></script>', () => "<script>\n" + read("app.js") + "\n</script>");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "gorilla-log-full.html"), html);
// Artifact 用: <!doctype>/<html>/<head>/<body> の骨組みを外した本文だけ
const body = html
  .replace(/^[\s\S]*?<head>\s*/, "")
  .replace(/<meta charset[^>]*>\s*/, "")
  .replace(/<meta name="viewport"[^>]*>\s*/, "")
  .replace(/<\/head>\s*<body>\s*/, "")
  .replace(/<\/body>\s*<\/html>\s*$/, "");
fs.writeFileSync(path.join(outDir, "gorilla-log.html"), body);
console.log("built:", outDir);
