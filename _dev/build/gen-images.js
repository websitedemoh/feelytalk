#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   gen-images.js – generates the site photos from _dev/IMAGE-PROMPTS.md with the
   Gemini image API (Nano Banana), via the @google/genai package.

   • Reads the API key ONLY from the GEMINI_API_KEY environment variable.
     The key is never printed, logged, written to disk or put in the state file;
     any error text is scrubbed of the key before it is shown.
   • Saves to <project>/new-images/ using the exact file names from the table.
     Files that already exist are skipped (so re-runs never pay twice).
   • Billing / quota / invalid-key errors STOP the run immediately and print the
     exact error. Nothing is ever retried automatically.

   Usage (from _dev/build):
     node gen-images.js --list                 show every job and its batch
     node gen-images.js --dry-run --batch 0    show what would be sent, no API call
     node gen-images.js --batch 0              batch 0 = hero-1.jpg only
     node gen-images.js --batch 1              batch 1.. = 6 images each
     node gen-images.js --only hero-2,blog-1   specific files (name without .jpg)
     node gen-images.js --redo hero-2          regenerate ONE image once (old one is kept in new-images/_rejected)

   Model: GEMINI_IMAGE_MODEL (default gemini-3.1-flash-image = Nano Banana 2).
          Original Nano Banana: gemini-2.5-flash-image. Nano Banana Pro: gemini-3-pro-image.
--------------------------------------------------------------------------- */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { GoogleGenAI } = require('@google/genai');

const ROOT = path.resolve(__dirname, '../..');
const MD = path.join(ROOT, '_dev', 'IMAGE-PROMPTS.md');
const OUT = path.join(ROOT, 'new-images');
const REVIEW = path.join(OUT, '_review');
const REJECTED = path.join(OUT, '_rejected');
const STATE = path.join(OUT, '.gen-state.json');
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
const SUPPORTED = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'];
const BATCH_SIZE = 6;

/* extra references: file -> files (already in new-images/) passed as face reference */
const REFS = { 'hero-chip-avatar': ['hero-1.jpg'] };

const redact = (s) => {
  let t = String(s);
  const k = process.env.GEMINI_API_KEY;
  if (k) t = t.split(k).join('[redacted]');
  return t;
};
const die = (msg, code = 1) => { console.error(redact(msg)); process.exit(code); };

/* ------------------------------ parse the markdown ------------------------------ */
function parseJobs() {
  const lines = fs.readFileSync(MD, 'utf8').split(/\r?\n/);
  const jobs = [];
  let page = '', stop = false;
  for (const line of lines) {
    if (line.startsWith('## Not photos')) { stop = true; continue; }
    if (stop) continue;
    if (line.startsWith('## ')) { page = line.slice(3).trim(); continue; }
    if (!line.startsWith('| `')) continue;
    const cells = line.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
    // cells: ['', file, slot, size, prompt, notes, '']
    const file = cells[1].replace(/`/g, '');
    const m = cells[3].match(/(\d+)\s*×\s*(\d+)/);
    if (!file.endsWith('.jpg') || !m || !cells[4]) continue;
    const w = +m[1], h = +m[2];
    jobs.push({ file, name: file.replace(/\.jpg$/, ''), page, slot: cells[2], w, h, prompt: cells[4] });
  }
  return jobs;
}

function planJob(j) {
  const r = j.w / j.h;
  let aspect = SUPPORTED.reduce((b, a) => {
    const [p, q] = a.split(':').map(Number);
    return Math.abs(p / q - r) < Math.abs(b.v - r) ? { a, v: p / q } : b;
  }, { a: '1:1', v: 1 }).a;
  let prompt = j.prompt;
  let note = '';
  if (r > 2.4) { // wider than anything the API can produce -> 21:9, crop afterwards
    aspect = '21:9';
    const keep = Math.round(((21 / 9) / r) * 100);
    note = `target ${r.toFixed(1)}:1 – generated at 21:9, to be cropped to the middle ${keep}% of the height`;
    prompt += ` FRAMING NOTE: this image will later be cropped to a much wider strip (${r.toFixed(1)}:1), keeping only the middle ${keep}% of the frame height. Place every face, phone and key element inside that central horizontal band and keep the top and bottom of the frame plain, soft or dark background.`;
  }
  const refs = REFS[j.name] || [];
  if (refs.length) {
    prompt = `A reference photo of the woman "Aanya" is attached. Generate a NEW photo of this exact same woman (same face, skin tone, hair and age), as described below. ` + prompt;
  }
  const imageSize = Math.max(j.w, j.h) > 1100 ? '2K' : '1K';
  return { ...j, aspect, prompt, refs, imageSize, note };
}

function batches(jobs) {
  const first = jobs.filter((j) => j.name === 'hero-1');
  const rest = jobs.filter((j) => j.name !== 'hero-1');
  const out = [first];
  for (let i = 0; i < rest.length; i += BATCH_SIZE) out.push(rest.slice(i, i + BATCH_SIZE));
  return out;
}

/* ---------------------------------- state ---------------------------------- */
const loadState = () => { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return {}; } };
const saveState = (s) => fs.writeFileSync(STATE, JSON.stringify(s, null, 2));

/* -------------------------------- generation -------------------------------- */
class NoImage extends Error {}
const FATAL = /api key|api_key|billing|quota|resource_exhausted|permission_denied|unauthenticated|credit|rate limit|insufficient/i;

async function generate(ai, job) {
  const parts = [{ text: job.prompt }];
  for (const ref of job.refs) {
    const p = path.join(OUT, ref);
    if (!fs.existsSync(p)) die(`Reference image new-images/${ref} is missing. Generate and approve it first.`);
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: fs.readFileSync(p).toString('base64') } });
  }
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts }],
    config: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: job.aspect, imageSize: job.imageSize } },
  });
  const cand = res.candidates && res.candidates[0];
  const outParts = (cand && cand.content && cand.content.parts) || [];
  const img = outParts.find((p) => p.inlineData && p.inlineData.data);
  if (!img) {
    const text = outParts.map((p) => p.text).filter(Boolean).join(' ').slice(0, 300);
    const why = [cand && cand.finishReason, res.promptFeedback && res.promptFeedback.blockReason].filter(Boolean).join(' / ');
    throw new NoImage(`No image returned (${why || 'no reason given'}) ${text}`);
  }
  return Buffer.from(img.inlineData.data, 'base64');
}

async function contactSheet(files, outPath) {
  const H = 360, parts = [];
  let x = 0;
  for (const f of files) {
    const p = path.join(OUT, f);
    if (!fs.existsSync(p)) continue;
    const b = await sharp(p).resize({ height: H, fit: 'inside' }).jpeg({ quality: 85 }).toBuffer();
    const m = await sharp(b).metadata();
    const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(m.width, 150)}" height="22"><rect width="100%" height="22" fill="#222"/><text x="6" y="16" font-size="13" fill="#fff" font-family="Arial">${f}</text></svg>`);
    parts.push({ input: label, left: x, top: 0 }, { input: b, left: x, top: 22 });
    x += Math.max(m.width, 150) + 8;
  }
  if (!parts.length) return;
  fs.mkdirSync(REVIEW, { recursive: true });
  await sharp({ create: { width: x, height: H + 22, channels: 3, background: '#555' } }).composite(parts).png().toFile(outPath);
}

/* ----------------------------------- main ----------------------------------- */
(async () => {
  const args = process.argv.slice(2);
  const flag = (n) => args.includes(n);
  const val = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };

  const jobs = parseJobs().map(planJob);
  if (!jobs.length) die('No jobs parsed from IMAGE-PROMPTS.md');
  const bs = batches(jobs);

  if (flag('--list')) {
    bs.forEach((b, i) => console.log(`batch ${i}: ${b.map((j) => j.name).join(', ')}`));
    console.log(`\n${jobs.length} images · model ${MODEL}`);
    jobs.filter((j) => j.note).forEach((j) => console.log(`note ${j.name}: ${j.note}`));
    return;
  }

  let selected;
  if (val('--redo')) selected = jobs.filter((j) => j.name === val('--redo').replace(/\.jpg$/, ''));
  else if (val('--only')) { const names = val('--only').split(',').map((s) => s.trim().replace(/\.jpg$/, '')); selected = jobs.filter((j) => names.includes(j.name)); }
  else if (val('--batch') !== undefined) selected = bs[+val('--batch')];
  else die('Choose what to run: --list | --batch N | --only a,b | --redo name   (add --dry-run to preview)');
  if (!selected || !selected.length) die('Nothing matches that selection.');

  if (flag('--dry-run')) {
    for (const j of selected) console.log(`[dry] ${j.file}  ${j.aspect}  ${j.imageSize}  refs:${j.refs.join(',') || '-'}  ${j.note}\n      ${j.prompt.slice(0, 160)}…`);
    return;
  }

  if (!process.env.GEMINI_API_KEY) die('GEMINI_API_KEY is not set in this environment. Set it, then re-run.');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  fs.mkdirSync(OUT, { recursive: true });
  const state = loadState();
  const done = [], skipped = [], failed = [];
  let stopped = false;

  for (const j of selected) {
    const out = path.join(OUT, j.file);
    const st = state[j.file] || { attempts: 0 };

    if (val('--redo')) {
      if (st.attempts >= 2) { console.log(`⚠ ${j.file}: already regenerated once – flag it for manual attention instead of regenerating again.`); failed.push(j.file); continue; }
      if (fs.existsSync(out)) { fs.mkdirSync(REJECTED, { recursive: true }); fs.renameSync(out, path.join(REJECTED, `${j.name}.attempt${st.attempts}.jpg`)); }
    } else if (fs.existsSync(out)) { console.log(`↷ skip ${j.file} (already exists)`); skipped.push(j.file); continue; }

    process.stdout.write(`… ${j.file}  ${j.aspect} ${j.imageSize}${j.refs.length ? ' +ref' : ''}  `);
    try {
      const raw = await generate(ai, j);
      await sharp(raw).jpeg({ quality: 93, mozjpeg: true }).toFile(out);
      const m = await sharp(out).metadata();
      st.attempts += 1; st.model = MODEL; st.aspect = j.aspect; st.size = `${m.width}x${m.height}`; st.at = new Date().toISOString();
      state[j.file] = st; saveState(state);
      console.log(`✓ ${m.width}×${m.height}`);
      done.push(j.file);
    } catch (e) {
      const msg = redact(e && e.message ? e.message : e);
      console.log('✗');
      if (!(e instanceof NoImage) && (FATAL.test(msg) || [401, 403, 429].includes(e && e.status))) {
        console.error(`\nSTOPPED – the API returned an error that needs your attention (not retried):\n${msg}`);
        process.exitCode = 2; stopped = true; break;
      }
      st.attempts += 1; state[j.file] = st; saveState(state);
      console.error(`  ${j.file}: ${msg}`);
      failed.push(j.file);
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  if (stopped) return;
  const files = selected.map((j) => j.file);
  const sheet = path.join(REVIEW, `batch-${val('--batch') ?? val('--redo') ?? 'custom'}.png`);
  await contactSheet(files, sheet);
  console.log(`\ngenerated ${done.length} · skipped ${skipped.length} · failed ${failed.length}`);
  if (done.length || skipped.length) console.log(`review sheet: ${path.relative(ROOT, sheet)}`);
  if (failed.length) process.exitCode = 3;
})();
