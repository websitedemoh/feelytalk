#!/usr/bin/env node
/* Builds _dev/prompt-helper.html from _dev/IMAGE-PROMPTS.md (no dependencies).
   Run:  node make-prompt-helper.js
   The page is a single local file – no network requests, not part of the website. */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const MD = path.join(ROOT, '_dev', 'IMAGE-PROMPTS.md');
const OUT = path.join(ROOT, '_dev', 'prompt-helper.html');
const SUPPORTED = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'];

/* ---------- parse IMAGE-PROMPTS.md (same table format the generator script reads) ---------- */
const jobs = [];
let page = '', stop = false;
for (const line of fs.readFileSync(MD, 'utf8').split(/\r?\n/)) {
  if (line.startsWith('## Not photos')) { stop = true; continue; }
  if (stop) continue;
  if (line.startsWith('## ')) { page = line.slice(3).trim(); continue; }
  if (!line.startsWith('| `')) continue;
  const c = line.split(/(?<!\\)\|/).map((x) => x.trim().replace(/\\\|/g, '|'));
  const file = c[1].replace(/`/g, '');
  const m = c[3].match(/(\d+)\s*×\s*(\d+)/);
  if (!file.endsWith('.jpg') || !m || !c[4]) continue;
  const w = +m[1], h = +m[2], r = w / h;
  let aspect = SUPPORTED.reduce((b, a) => {
    const [p, q] = a.split(':').map(Number);
    return Math.abs(p / q - r) < Math.abs(b.v - r) ? { a, v: p / q } : b;
  }, { a: '1:1', v: 1 }).a;
  let prompt = c[4], cropNote = '';
  if (r > 2.4) {
    aspect = '21:9';
    const keep = Math.round(((21 / 9) / r) * 100);
    cropNote = `Needs a ${r.toFixed(1)}:1 strip. Generate at 21:9, then crop to the middle ${keep}% of the height.`;
    prompt += ` FRAMING NOTE: this image will later be cropped to a much wider strip (${r.toFixed(1)}:1), keeping only the middle ${keep}% of the frame height. Place every face, phone and key element inside that central horizontal band and keep the top and bottom of the frame plain, soft or dark background.`;
  }
  const refNeeded = file === 'hero-chip-avatar.jpg';
  if (refNeeded) prompt = 'A reference photo of the woman "Aanya" is attached. Generate a NEW photo of this exact same woman (same face, skin tone, hair and age), as described below. ' + prompt;
  jobs.push({
    file, page, slot: c[2], size: `${w} × ${h} px`, aspect,
    note: [c[5], cropNote].filter(Boolean).join(' '),
    ref: refNeeded ? 'hero-1.jpg' : '',
    prompt: prompt + ` Aspect ratio ${aspect}, photorealistic.`,
  });
}
if (!jobs.length) { console.error('No rows found in IMAGE-PROMPTS.md'); process.exit(1); }
// hero-1.jpg first, then the Aanya chip, then the rest in file order
const rank = (j) => (j.file === 'hero-1.jpg' ? 0 : j.file === 'hero-chip-avatar.jpg' ? 1 : 2);
jobs.sort((a, b) => rank(a) - rank(b));

const data = JSON.stringify(jobs).replace(/</g, '\\u003c');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>FeelyTalk – image prompt helper (local only)</title>
<style>
  :root { --brand:#C42C4C; --brand-dark:#A82041; --tint:#FCF2F4; --tint2:#F9EAED; --line:#F4D9DF; --ink:#0A0F2B; --text:#565A70; --muted:#686C82; --ok:#15803D; --bg:#FCF8F7; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif; }
  header { position:sticky; top:0; z-index:5; background:#fff; border-bottom:1px solid var(--line); }
  .bar { max-width:980px; margin:0 auto; padding:12px 20px; display:flex; flex-wrap:wrap; gap:12px 20px; align-items:center; }
  h1 { margin:0; font-size:18px; color:var(--ink); }
  .grow { flex:1; min-width:180px; }
  .meter { height:8px; border-radius:99px; background:var(--tint2); overflow:hidden; }
  .meter > i { display:block; height:100%; width:0; background:var(--brand); transition:width .2s; }
  .count { font-weight:700; color:var(--ink); white-space:nowrap; }
  label.toggle { display:flex; gap:8px; align-items:center; font-size:14px; cursor:pointer; }
  button { font:inherit; cursor:pointer; }
  .btn { border:1.5px solid var(--brand); background:var(--brand); color:#fff; border-radius:99px; padding:8px 18px; font-weight:700; }
  .btn:hover { background:var(--brand-dark); }
  .btn.ghost { background:#fff; color:var(--brand); }
  .btn.ghost:hover { background:var(--tint); }
  .btn.small { padding:5px 12px; font-size:13px; }
  main { max-width:980px; margin:0 auto; padding:20px; display:grid; gap:16px; }
  .intro { background:#fff; border:1px solid var(--line); border-radius:14px; padding:14px 18px; font-size:14.5px; }
  .intro b { color:var(--ink); }
  .card { background:#fff; border:1.5px solid var(--line); border-radius:16px; padding:18px 20px; display:grid; gap:12px; }
  .card.next { border-color:var(--brand); box-shadow:0 0 0 4px var(--tint2); }
  .card.done { opacity:.62; }
  .card.done .prompt { max-height:3.2em; overflow:hidden; }
  .top { display:flex; gap:14px; align-items:flex-start; }
  .tick { width:30px; height:30px; flex:none; accent-color:var(--ok); cursor:pointer; margin-top:2px; }
  .num { font-size:12px; font-weight:800; letter-spacing:.08em; color:var(--brand); text-transform:uppercase; }
  .file { font:700 19px/1.3 ui-monospace,Consolas,monospace; color:var(--ink); word-break:break-all; }
  .where { color:var(--muted); font-size:14px; }
  .chips { display:flex; flex-wrap:wrap; gap:8px; }
  .chip { background:var(--tint2); color:var(--brand-dark); border-radius:99px; padding:3px 12px; font-size:13px; font-weight:700; }
  .chip.ref { background:#FFF4D6; color:#7A4B00; }
  .prompt { background:var(--tint); border:1px solid var(--line); border-radius:10px; padding:12px 14px; font-size:14.5px; white-space:pre-wrap; user-select:all; }
  .note { font-size:13.5px; color:var(--muted); }
  .row { display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
  .toast { position:fixed; left:50%; bottom:24px; transform:translateX(-50%) translateY(20px); opacity:0; background:var(--ink); color:#fff; padding:9px 18px; border-radius:99px; font-size:14px; transition:.2s; pointer-events:none; }
  .toast.show { opacity:1; transform:translateX(-50%); }
  :focus-visible { outline:3px solid var(--brand); outline-offset:2px; }
</style>
</head>
<body>
<header>
  <div class="bar">
    <h1>Image prompt helper</h1>
    <div class="grow"><div class="meter" role="progressbar" aria-label="Images done" aria-valuemin="0" aria-valuemax="100"><i id="bar"></i></div></div>
    <span class="count" id="count">0 / 0</span>
    <label class="toggle"><input type="checkbox" id="hideDone"> Hide finished</label>
    <button class="btn ghost small" id="reset">Reset ticks</button>
  </div>
</header>
<main>
  <div class="intro">
    <b>How to use:</b> go top to bottom. Press <b>Copy prompt</b>, paste it into your image tool, save the result with the <b>exact file name</b>
    shown, then tick the box. Ticks are saved in this browser. Do <b>hero-1.jpg</b> first &mdash; the Aanya chip needs it as a face reference.
    The file is local only (nothing is sent anywhere) and is not part of the website.
  </div>
  <div id="cards"></div>
</main>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script>
const JOBS = ${data};
const KEY = 'feelytalk-prompt-helper-v1';
let done = {};
try { done = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {} };

const $ = (s) => document.querySelector(s);
const cards = $('#cards');
let toastTimer;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1600); }

async function copy(text, label) {
  try { await navigator.clipboard.writeText(text); }
  catch (e) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  toast(label + ' copied');
}

JOBS.forEach((j, i) => {
  const el = document.createElement('article');
  el.className = 'card'; el.dataset.file = j.file;
  el.innerHTML =
    '<div class="top">' +
      '<input class="tick" type="checkbox" id="t' + i + '" aria-label="Done: ' + j.file + '">' +
      '<div class="grow">' +
        '<div class="num">' + (i + 1) + ' of ' + JOBS.length + '</div>' +
        '<label for="t' + i + '" class="file">' + j.file + '</label>' +
        '<div class="where">' + j.page + ' &middot; ' + j.slot + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="chips"><span class="chip">Aspect ratio ' + j.aspect + '</span><span class="chip">Final size ' + j.size + '</span>' +
      (j.ref ? '<span class="chip ref">Attach ' + j.ref + ' as the face reference</span>' : '') + '</div>' +
    '<div class="prompt"></div>' +
    (j.note ? '<div class="note"></div>' : '') +
    '<div class="row"><button class="btn" data-act="prompt">Copy prompt</button><button class="btn ghost small" data-act="file">Copy file name</button></div>';
  el.querySelector('.prompt').textContent = j.prompt;
  if (j.note) el.querySelector('.note').textContent = 'Note: ' + j.note;
  const box = el.querySelector('.tick');
  box.checked = !!done[j.file];
  box.addEventListener('change', () => { if (box.checked) done[j.file] = 1; else delete done[j.file]; save(); refresh(); });
  el.querySelector('[data-act=prompt]').addEventListener('click', () => copy(j.prompt, 'Prompt'));
  el.querySelector('[data-act=file]').addEventListener('click', () => copy(j.file, 'File name'));
  cards.appendChild(el);
});

function refresh() {
  const hide = $('#hideDone').checked;
  let n = 0, next = null;
  cards.querySelectorAll('.card').forEach((el) => {
    const isDone = !!done[el.dataset.file];
    el.classList.toggle('done', isDone);
    el.hidden = hide && isDone;
    el.classList.remove('next');
    if (isDone) n++; else if (!next) next = el;
  });
  if (next) next.classList.add('next');
  $('#count').textContent = n + ' / ' + JOBS.length + ' done';
  $('#bar').style.width = (100 * n / JOBS.length) + '%';
  $('.meter').setAttribute('aria-valuenow', Math.round(100 * n / JOBS.length));
}
$('#hideDone').addEventListener('change', refresh);
$('#reset').addEventListener('click', () => {
  if (!confirm('Clear all ticks?')) return;
  done = {}; save(); cards.querySelectorAll('.tick').forEach((b) => (b.checked = false)); refresh();
});
refresh();
const first = cards.querySelector('.card.next'); if (first && Object.keys(done).length) first.scrollIntoView({ block: 'center' });
</script>
</body>
</html>
`;
fs.writeFileSync(OUT, html);
console.log(`wrote ${path.relative(ROOT, OUT)} · ${jobs.length} cards · first: ${jobs[0].file}, ${jobs[1].file}, ${jobs[2].file}`);
