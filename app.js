/* GORILLA LOG — 描画ロジック。データは data/records.js を編集する。 */
(function () {
  "use strict";
  const D = window.GORILLA_DATA;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const TYPE = { gym: "ジム", futsal: "フットサル", home: "自宅トレ" };
  const TYPE_SHORT = { gym: "ジ", futsal: "フ", home: "宅" };
  const DOW = ["日", "月", "火", "水", "木", "金", "土"];
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const md = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
  const lv = (n) => (n == null ? "—" : n.toFixed(1));
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

  const records = D.records.slice().sort((a, b) => a.date.localeCompare(b.date));
  const updated = parse(D.meta.updated);
  const latestDate = records.reduce((m, r) => (r.date > m ? r.date : m), D.meta.updated);
  const anchor = parse(latestDate);

  /* ---------- header / hero / profile ---------- */
  $("#tagline").textContent = D.meta.tagline;
  $("#updated").textContent = D.meta.updated.replace(/-/g, ".");
  $("#heroLv").innerHTML = `<sup>Lv.</sup>${lv(D.meta.overallLevel)}`;
  $("#heroTitle").textContent = D.meta.overallTitle;
  $("#heroNote").textContent = D.meta.overallNote;
  $("#meter").innerHTML = [1, 2, 3, 4, 5].map((i) => {
    const f = Math.max(0, Math.min(1, D.meta.overallLevel - (i - 1)));
    return `<span><i style="--fill:${f * 100}%"></i></span>`;
  }).join("");
  $("#pName").textContent = `${D.profile.name}（${D.profile.age}）`;
  $("#pRole").textContent = D.profile.role;
  $("#pLead").textContent = D.profile.lead;
  $("#pFacts").innerHTML = D.profile.facts.map((f) => `<dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd>`).join("");

  /* ---------- tiles ---------- */
  const gym = records.filter((r) => r.type === "gym");
  const futsal = records.filter((r) => r.type === "futsal");
  const home = records.filter((r) => r.type === "home");
  const futsalKnown = futsal.filter((r) => r.hours != null);
  const futsalHours = futsalKnown.reduce((s, r) => s + r.hours, 0);
  const lastBench = gym.slice().reverse().find((r) => r.bench && r.bench.reps);
  const lastSquat = gym.slice().reverse().find((r) => r.squat);
  const fmtReps = (x) => (x.reps ? (x.reps.every((v) => v === x.reps[0]) ? `×${x.reps[0]}回×${x.reps.length}` : `×${x.reps.join("・")}`) : "");
  $("#tiles").innerHTML = [
    { c: "", l: "収録した記録", v: records.length + 1, u: "件", s: `${D.meta.since.replace("-", "年")}月〜` },
    { c: "gym", l: "ジム", v: gym.length, u: "回", s: "週1のパーソナルジム" },
    { c: "futsal", l: "フットサル", v: futsalHours, u: "時間", s: `${futsal.length}回。時間が分かる${futsalKnown.length}回の合計` },
    { c: "home", l: "自宅トレ", v: home.reduce((s, r) => s + (r.sets || 0), 0), u: "セット", s: `${home.length}回分のログ` },
    { c: "gym", l: "ベンチプレス 最新", v: lastBench ? lastBench.bench.w : "—", u: "kg", s: lastBench ? `${fmtReps(lastBench.bench)}（${md(parse(lastBench.date))}）` : "" },
    { c: "gym", l: "スクワット 最新", v: lastSquat ? lastSquat.squat.w : "—", u: "kg", s: lastSquat ? `${fmtReps(lastSquat.squat)}（${md(parse(lastSquat.date))}）` : "" },
  ].map((t) => `<div class="tile ${t.c}"><span class="label">${esc(t.l)}</span><span class="value">${esc(t.v)}<small>${esc(t.u)}</small></span><span class="sub">${esc(t.s)}</span></div>`).join("");

  /* ---------- this week ---------- */
  const wk = D.weeks[D.weeks.length - 1];
  $("#weekCard").innerHTML = `
    <div class="card-head"><h3>最新の週判定</h3><span class="sub">${esc(wk.range)}</span></div>
    <div class="week-card">
      <div class="week-lv"><small>WEEK LV.</small>${lv(wk.level)}</div>
      <div><div class="week-name">${esc(wk.name)}</div><div class="week-combo">${esc(wk.combo)}</div><div class="week-combo" style="font-size:13px;color:var(--muted)">${esc(wk.note)}</div></div>
    </div>`;
  const byDate = {};
  records.forEach((r) => { (byDate[r.date] = byDate[r.date] || []).push(r); });
  const stripDays = [];
  for (let i = 6; i >= 0; i--) stripDays.push(addDays(anchor, -i));
  $("#stripRange").textContent = `${md(stripDays[0])}〜${md(stripDays[6])}`;
  $("#strip").innerHTML = stripDays.map((d) => {
    const rs = byDate[iso(d)] || [];
    const r = rs[0];
    const t = r ? `<span class="t">${esc(TYPE[r.type])}</span><span>${r.hours != null ? r.hours + "h" : r.sets ? r.sets + "set" : "Lv." + lv(r.level)}</span>` : `<span>休</span>`;
    return `<div class="day ${r ? r.type : ""}"><b>${md(d)}</b>${DOW[d.getDay()]}${t}</div>`;
  }).join("");

  /* ---------- calendar ---------- */
  (function calendar() {
    const first = parse(records.find((r) => r.date >= "2026-06-01").date);
    const start = addDays(first, -((first.getDay() + 6) % 7)); // Monday
    const end = addDays(anchor, 6 - ((anchor.getDay() + 6) % 7)); // Sunday of anchor week
    let html = `<div></div>` + ["月", "火", "水", "木", "金", "土", "日"].map((d) => `<div class="dh">${d}</div>`).join("");
    for (let w = new Date(start); w <= end; w = addDays(w, 7)) {
      html += `<div class="wk">${md(w)}〜</div>`;
      for (let i = 0; i < 7; i++) {
        const d = addDays(w, i), k = iso(d), rs = byDate[k] || [];
        const r = rs[0];
        const cls = ["cell", r ? r.type : "", r && r.estimated ? "est" : "", k > latestDate ? "future" : "", k === latestDate ? "today" : ""].join(" ");
        const title = r ? `${k}（${DOW[d.getDay()]}）${TYPE[r.type]}：${r.title}` : `${k}（${DOW[d.getDay()]}）記録なし`;
        html += `<div class="${cls}" title="${esc(title)}" aria-label="${esc(title)}">${r ? TYPE_SHORT[r.type] : ""}</div>`;
      }
    }
    $("#cal").innerHTML = html;
    const before = records.filter((r) => r.date < iso(start));
    $("#calNote").textContent = before.length
      ? `カレンダー範囲外の記録：${before.map((r) => `${md(parse(r.date))} ${TYPE[r.type]}${r.hours ? r.hours + "時間" : ""}`).join("、")}。空欄は「記録がない日」であり、休んだ証明ではない。`
      : "空欄は「記録がない日」であり、休んだ証明ではない。";
  })();

  /* ---------- chart helpers ---------- */
  const W = 600, H = 250, PAD = { t: 18, r: 22, b: 34, l: 40 };
  const IW = W - PAD.l - PAD.r, IH = H - PAD.t - PAD.b;
  function timeScale(dates) {
    const min = parse(dates[0]).getTime(), max = parse(dates[dates.length - 1]).getTime();
    const span = Math.max(max - min, 86400000 * 30);
    const lo = min - span * 0.06, hi = max + span * 0.06;
    return { x: (s) => PAD.l + ((parse(s).getTime() - lo) / (hi - lo)) * IW, lo, hi };
  }
  function monthTicks(sc) {
    const out = [];
    const d = new Date(sc.lo); d.setDate(1); d.setHours(0, 0, 0, 0); d.setMonth(d.getMonth() + 1);
    for (; d.getTime() <= sc.hi; d.setMonth(d.getMonth() + 1)) out.push({ x: sc.x(iso(d)), label: `${d.getMonth() + 1}月` });
    return out;
  }
  function yScale(lo, hi) { return (v) => PAD.t + IH - ((v - lo) / (hi - lo)) * IH; }
  function gridY(vals, y, fmt) {
    return `<g class="grid">${vals.map((v) => `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${PAD.l - 6}" y="${y(v) + 4}" text-anchor="end">${fmt ? fmt(v) : v}</text>`).join("")}</g>`;
  }
  function axisX(ticks) {
    return `<g class="axis"><line x1="${PAD.l}" x2="${W - PAD.r}" y1="${PAD.t + IH}" y2="${PAD.t + IH}"/>${ticks.map((t) => `<text x="${t.x}" y="${H - 12}" text-anchor="middle">${t.label}</text>`).join("")}</g>`;
  }
  function mount(id, svg, tableHtml, tips) {
    const el = document.getElementById(id);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="チャート。数値は「表で見る」で確認できます">${svg}</svg><div class="tip" role="status"></div><div class="chart-table">${tableHtml}</div>`;
    const tip = el.querySelector(".tip");
    const show = (e, html) => {
      const r = el.getBoundingClientRect();
      tip.innerHTML = html;
      const pt = e.target.getBoundingClientRect();
      tip.style.left = `${pt.left - r.left + pt.width / 2}px`;
      tip.style.top = `${pt.top - r.top}px`;
      tip.classList.add("on");
    };
    el.querySelectorAll("[data-i]").forEach((h) => {
      const html = tips[+h.dataset.i];
      h.addEventListener("mouseenter", (e) => show(e, html));
      h.addEventListener("mouseleave", () => tip.classList.remove("on"));
      h.addEventListener("focus", (e) => show(e, html));
      h.addEventListener("blur", () => tip.classList.remove("on"));
      h.setAttribute("tabindex", "0");
    });
  }
  function tbl(head, rows) {
    return `<table><thead><tr>${head.map((h) => `<th${h.r ? ' class="r"' : ""}>${esc(h.t)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${head[i].r ? ' class="r num"' : ""}>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }
  const dateLabel = (r) => `${r.date.replace(/-/g, "/")}${r.estimated ? " ごろ" : ""}`;

  /* ---------- bench chart ---------- */
  (function bench() {
    const pts = gym.filter((r) => r.bench && r.bench.w);
    const sc = timeScale(pts.map((p) => p.date));
    const y = yScale(40, 55);
    const line = pts.map((p, i) => `${i ? "L" : "M"}${sc.x(p.date).toFixed(1)},${y(p.bench.w).toFixed(1)}`).join(" ");
    let svg = gridY([40, 45, 50, 55], y, (v) => v + "kg") + axisX(monthTicks(sc));
    svg += `<path d="${line}" fill="none" stroke="var(--gym)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    const tips = [];
    pts.forEach((p, i) => {
      const cx = sc.x(p.date), cy = y(p.bench.w), b = p.bench;
      const solid = b.full === true;
      svg += `<circle cx="${cx}" cy="${cy}" r="6" fill="var(--surface)"/>`;
      svg += solid
        ? `<circle cx="${cx}" cy="${cy}" r="4.5" fill="var(--gym)"/>`
        : `<circle cx="${cx}" cy="${cy}" r="4" fill="var(--surface)" stroke="var(--gym)" stroke-width="2"${b.full == null ? ' stroke-dasharray="2 2"' : ""}/>`;
      svg += `<circle class="hit" data-i="${i}" cx="${cx}" cy="${cy}" r="13"/>`;
      const reps = b.reps ? b.reps.join("・") + "回" : "回数は要確認";
      tips.push(`<b>${dateLabel(p)}</b>${b.w}kg × ${reps}${b.extra ? "<br>" + esc(b.extra) : ""}<br><small>${b.verified ? "画像で確認" : "メモ・回答情報（元画像未照合）"}${p.provisional ? "・暫定" : ""}</small>`);
      if (i === 0 || i === pts.length - 1) svg += `<text class="lbl" x="${cx}" y="${cy - 12}" text-anchor="middle">${b.w}kg</text>`;
    });
    const rows = pts.map((p) => [dateLabel(p), p.bench.w + "kg", p.bench.reps ? p.bench.reps.join("・") : "要確認", p.bench.full === true ? "達成" : p.bench.full === false ? "未達・一部" : "不明", p.bench.verified ? "画像" : "メモ"]);
    mount("benchChart", svg, tbl([{ t: "日付" }, { t: "重量", r: 1 }, { t: "回数" }, { t: "10×3" }, { t: "確認" }], rows), tips);
  })();

  /* ---------- squat chart ---------- */
  (function squat() {
    const pts = gym.filter((r) => r.squat && r.squat.w);
    const sc = timeScale(pts.map((p) => p.date));
    const y = yScale(30, 70);
    const line = pts.map((p, i) => `${i ? "L" : "M"}${sc.x(p.date).toFixed(1)},${y(p.squat.w).toFixed(1)}`).join(" ");
    let svg = gridY([30, 40, 50, 60, 70], y, (v) => v + "kg") + axisX(monthTicks(sc));
    svg += `<path d="${line}" fill="none" stroke="var(--gym)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    const tips = [];
    pts.forEach((p, i) => {
      const cx = sc.x(p.date), cy = y(p.squat.w), s = p.squat;
      svg += `<circle cx="${cx}" cy="${cy}" r="6" fill="var(--surface)"/><circle cx="${cx}" cy="${cy}" r="4.5" fill="var(--gym)"/><circle class="hit" data-i="${i}" cx="${cx}" cy="${cy}" r="13"/>`;
      tips.push(`<b>${dateLabel(p)}</b>${s.w}kg × ${s.reps.join("・")}回<br><small>${s.verified ? "画像で確認" : "メモ・回答情報（元画像未照合）"}</small>`);
      if (i === pts.length - 1 || s.w === Math.min(...pts.map((q) => q.squat.w))) svg += `<text class="lbl" x="${cx}" y="${cy - 12}" text-anchor="middle">${s.w}kg</text>`;
    });
    const rows = pts.map((p) => [dateLabel(p), p.squat.w + "kg", p.squat.reps.join("・"), p.squat.verified ? "画像" : "メモ"]);
    mount("squatChart", svg, tbl([{ t: "日付" }, { t: "重量", r: 1 }, { t: "回数" }, { t: "確認" }], rows), tips);
  })();

  /* ---------- futsal monthly ---------- */
  (function futsalMonthly() {
    const months = {};
    futsal.forEach((r) => {
      const k = r.date.slice(0, 7);
      months[k] = months[k] || { hours: 0, n: 0, unknown: 0 };
      months[k].n++;
      if (r.hours != null) months[k].hours += r.hours; else months[k].unknown++;
    });
    const keys = Object.keys(months).sort();
    const maxH = Math.max(10, ...keys.map((k) => months[k].hours));
    const top = Math.ceil(maxH / 5) * 5;
    const y = yScale(0, top);
    const band = IW / keys.length, bw = Math.min(24, band * 0.5);
    const ticks = []; for (let v = 0; v <= top; v += 5) ticks.push(v);
    let svg = gridY(ticks, y, (v) => v + "h");
    const tips = [];
    keys.forEach((k, i) => {
      const m = months[k], cx = PAD.l + band * (i + 0.5), yb = y(m.hours), h = PAD.t + IH - yb;
      const label = `${+k.slice(0, 4) !== anchor.getFullYear() ? k.slice(0, 4) + "年" : ""}${+k.slice(5)}月`;
      svg += `<path d="M${cx - bw / 2},${PAD.t + IH} v${-(h - 4)} a4,4 0 0 1 4,-4 h${bw - 8} a4,4 0 0 1 4,4 v${h - 4} z" fill="var(--futsal)"/>`;
      svg += `<text class="lbl" x="${cx}" y="${yb - 6}" text-anchor="middle">${m.hours}h</text>`;
      svg += `<text x="${cx}" y="${H - 12}" text-anchor="middle">${label}</text>`;
      svg += `<rect class="hit" data-i="${i}" x="${cx - band / 2}" y="${PAD.t}" width="${band}" height="${IH}"/>`;
      tips.push(`<b>${label}</b>${m.n}回・計${m.hours}時間${m.unknown ? `<br><small>うち${m.unknown}回は時間不明（合計に含まず）</small>` : ""}`);
    });
    svg += `<g class="axis"><line x1="${PAD.l}" x2="${W - PAD.r}" y1="${PAD.t + IH}" y2="${PAD.t + IH}"/></g>`;
    const rows = keys.map((k) => [`${k.slice(0, 4)}年${+k.slice(5)}月`, months[k].n, months[k].hours + "h", months[k].unknown || ""]);
    mount("futsalChart", svg, tbl([{ t: "月" }, { t: "回数", r: 1 }, { t: "時間", r: 1 }, { t: "時間不明", r: 1 }], rows), tips);
  })();

  /* ---------- level timeline ---------- */
  (function levels() {
    const pts = records.filter((r) => r.date >= "2026-06-01");
    const sc = timeScale(pts.map((p) => p.date));
    const y = yScale(1.5, 5);
    let svg = gridY([2, 3, 4, 5], y, (v) => "Lv." + v) + axisX(monthTicks(sc));
    const tips = [];
    pts.forEach((p, i) => {
      const cx = sc.x(p.date), cy = y(p.level);
      svg += `<circle cx="${cx}" cy="${cy}" r="6.5" fill="var(--surface)"/><circle cx="${cx}" cy="${cy}" r="4.5" fill="var(--${p.type})"/><circle class="hit" data-i="${i}" cx="${cx}" cy="${cy}" r="12"/>`;
      tips.push(`<b>${dateLabel(p)}・${TYPE[p.type]}</b>Lv.${lv(p.level)}${p.provisional ? "（暫定）" : ""} ${esc(p.nickname)}<br><small>${esc(p.title)}</small>`);
    });
    const rows = pts.slice().reverse().map((p) => [dateLabel(p), TYPE[p.type], lv(p.level) + (p.provisional ? " 暫定" : ""), p.nickname]);
    mount("levelChart", svg, tbl([{ t: "日付" }, { t: "種類" }, { t: "Lv.", r: 1 }, { t: "称号" }], rows), tips);
  })();

  /* table toggles */
  document.querySelectorAll("[data-table]").forEach((b) => {
    b.addEventListener("click", () => {
      const el = document.getElementById(b.dataset.table);
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on);
      b.textContent = on ? "グラフに戻す" : "表で見る";
      el.classList.toggle("table-on", on);
      el.querySelector(".chart-table").classList.toggle("on", on);
      el.parentElement.querySelector(".legend")?.toggleAttribute("hidden", on);
    });
  });

  /* ---------- records ---------- */
  let filter = "all", showAll = false;
  const LIMIT = 8;
  $("#filters").innerHTML = [["all", "すべて", records.length], ["gym", "ジム", gym.length], ["futsal", "フットサル", futsal.length], ["home", "自宅トレ", home.length]]
    .map(([k, n, c]) => `<button class="chip" type="button" data-f="${k}" aria-pressed="${k === "all"}">${k !== "all" ? `<i class="sw ${k}"></i>` : ""}${n} <span class="num">${c}</span></button>`).join("");
  function renderRecords() {
    const list = records.slice().reverse().filter((r) => filter === "all" || r.type === filter);
    const shown = showAll ? list : list.slice(0, LIMIT);
    $("#recList").innerHTML = shown.map((r) => {
      const d = parse(r.date);
      const tags = [];
      if (r.hours != null) tags.push(`${r.hours}時間`);
      if (r.venue) tags.push(r.venue);
      if (r.sets) tags.push(`${r.sets}セット`);
      if (r.bench && r.bench.w) tags.push(`ベンチ ${r.bench.w}kg`);
      if (r.squat) tags.push(`スクワット ${r.squat.w}kg`);
      if (r.deadlift) tags.push(`デッドリフト ${r.deadlift.w}kg`);
      if (r.provisional) tags.push("暫定");
      if (r.source) tags.push(r.source);
      const det = r.exercises ? `<details><summary>種目の内訳（${r.exercises.length}種目）</summary><ul>${r.exercises.map((e) => `<li>${esc(e)}</li>`).join("")}</ul></details>` : "";
      return `<article class="rec ${r.type}">
        <div class="date"><b class="num">${d.getMonth() + 1}/${d.getDate()}</b><span class="dow">${d.getFullYear()}年・${DOW[d.getDay()]}曜${r.estimated ? "・推定" : ""}</span></div>
        <div class="main"><div class="type">${esc(TYPE[r.type])}</div><div class="title">${esc(r.title)}</div><div class="nick">${esc(r.nickname)}</div><p class="note">${esc(r.note)}</p>
          <div class="meta">${tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div></div>
        <div class="lv"><b>${lv(r.level)}</b><small>/ 5</small></div>${det}
      </article>`;
    }).join("");
    $("#moreBtn").hidden = showAll || list.length <= LIMIT;
    $("#moreBtn").textContent = `すべて表示（残り${list.length - LIMIT}件）`;
  }
  $("#filters").addEventListener("click", (e) => {
    const b = e.target.closest("[data-f]"); if (!b) return;
    filter = b.dataset.f; showAll = false;
    $("#filters").querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === b));
    renderRecords();
  });
  $("#moreBtn").addEventListener("click", () => { showAll = true; renderRecords(); });
  renderRecords();

  /* ---------- habits / weeks / levels / baseline ---------- */
  $("#habits").innerHTML = D.habits.map((h) => `<div class="habit"><h3>${esc(h.title)}</h3><div class="lv">${h.level != null ? "Lv." + lv(h.level) : "—"}</div><div class="name">${esc(h.name)}</div><p>${esc(h.body)}</p></div>`).join("");
  $("#weeksTable").innerHTML = `<thead><tr><th>期間</th><th>組み合わせ</th><th class="r">Lv.</th><th>判定</th></tr></thead><tbody>${D.weeks.slice().reverse().map((w) => `<tr><td style="white-space:nowrap">${esc(w.range)}</td><td>${esc(w.combo)}<br><small style="color:var(--muted)">${esc(w.note)}</small></td><td class="r num">${w.level != null ? lv(w.level) : "採点外"}</td><td><b>${esc(w.name)}</b></td></tr>`).join("")}</tbody>`;
  $("#lvList").innerHTML = D.levels.map((l) => `<li><span class="k">Lv.${l.lv}</span><span><span class="n">${esc(l.name)}</span><br><span class="d">${esc(l.desc)}</span></span></li>`).join("");
  const b = D.baseline;
  $("#baselineCard").innerHTML = `<div class="card-head"><h3>${esc(b.label)}</h3><span class="sub">時系列グラフには載せない基準点</span></div>
    <dl class="facts" style="margin-top:8px"><dt>ベンチプレス</dt><dd>${esc(b.bench)}</dd><dt>スクワット</dt><dd>${esc(b.squat)}</dd><dt>デッドリフト</dt><dd>${esc(b.deadlift)}</dd><dt>当時のレベル</dt><dd>Lv.${lv(b.level)}（暫定）・${esc(b.nickname)}</dd></dl>
    <p style="font-size:13px;color:var(--ink-2);margin-top:10px">同じ日に3種目すべてを実施したと確認できる記録ではないため、「1回のジム」とは数えない。2026年9月のスクワット65kg×10×3を「過去最高」とは呼ばないのは、この70kgの保存メモがあるため。</p>`;

  /* ---------- theme ---------- */
  const root = document.documentElement;
  try { const t = localStorage.getItem("gorilla-theme"); if (t) root.setAttribute("data-theme", t); } catch (e) {}
  $("#themeBtn").addEventListener("click", () => {
    const dark = root.getAttribute("data-theme") === "dark" || (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    const next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("gorilla-theme", next); } catch (e) {}
  });
})();
