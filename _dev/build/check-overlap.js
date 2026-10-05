#!/usr/bin/env node
/* check-overlap.js – layout audit for all 6 pages at 1920, 1440, 1280, 1024, 768 and 390.

   Reports:
     • floating elements (cards, chips, notes, hearts, badges) overlapping each other
       (hero cards must keep >= 24px apart at rest and >= 16px while floating)
     • floating elements covering a face / hands / phone (keep-clear zones, 16px margin)
     • floating hero elements leaving the photo box, or text/elements clipped by an
       ancestor's overflow or by the viewport edge
     • text overlapping other text / buttons / floating elements
     • horizontal scroll
   Each page+width is tested twice:  "rest" (reduced motion = nothing moves) and
   "peak" (normal motion, every float animation frozen at the top of its 6–8px move).

   Usage:   node check-overlap.js                run everything, write _dev/overlap-report.txt
            node check-overlap.js --shots        also save hero screenshots to _dev/hero-shots/
            node check-overlap.js --only index   one page
   Needs:   npm install   (playwright-core) and Edge or Chrome installed (or set BROWSER_PATH).
   Exit code 0 = no issues, 1 = issues found. */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '../..');
const PAGES = ['index', 'how-it-works', 'join-us', 'safety', 'help', 'blog'];
const WIDTHS = [1920, 1440, 1280, 1024, 768, 390];
const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const SHOTS = args.includes('--shots');

/* keep-clear zones as fractions [x0, y0, x1, y1] of the hero photo: faces (incl. hair top), hands, phones */
const ZONES = {
  'index':        [[.55, .15, .84, .52], [.68, .66, .97, .92]],
  'how-it-works': [[.50, .18, .74, .52], [.36, .58, .62, .84]],
  'join-us':      [[.52, .15, .76, .62]],
  'safety':       [[.55, .12, .80, .56], [.66, .56, .86, .84]],
  'help':         [[.56, .18, .84, .52], [.50, .56, .72, .86]],
  'blog':         [[.16, .13, .48, .62]],
};

const BROWSERS = [process.env.BROWSER_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
const browserPath = BROWSERS.find((p) => fs.existsSync(p));

/* ------------------- runs inside the page; returns a list of issue strings ------------------- */
function audit({ page, mode, zones }) {
  const issues = [];
  const vw = document.documentElement.clientWidth;
  const label = (el) => {
    if (!el) return '?';
    const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24);
    return el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + (t ? ` "${t}"` : '');
  };
  const rectOf = (el) => el.getBoundingClientRect();
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (el.closest('[hidden]') || el.closest('.sr-only')) return false;
    const r = rectOf(el);
    return r.width > 0 && r.height > 0;
  };
  const gapBetween = (a, b) => {  // negative = overlapping depth, positive = distance
    const dx = Math.max(b.left - a.right, a.left - b.right);
    const dy = Math.max(b.top - a.bottom, a.top - b.bottom);
    return Math.max(dx, dy);
  };

  /* horizontal scroll */
  if (document.documentElement.scrollWidth > vw + 1) issues.push(`horizontal scroll: page is ${document.documentElement.scrollWidth}px wide in a ${vw}px viewport`);

  /* ---------- floating elements ---------- */
  const FLOAT = '.hero-pin, .float-card, .hand, .badge-online, .fav-btn, .badge-disc, .post-tag, .menu-card, .collage > *, .collage-3 > .c';
  const floats = [...document.querySelectorAll(FLOAT)].filter(visible);
  const sameCollage = (a, b) => { const ca = a.closest('.collage, .collage-3'), cb = b.closest('.collage, .collage-3'); return ca && ca === cb; };
  for (let i = 0; i < floats.length; i++) for (let j = i + 1; j < floats.length; j++) {
    const a = floats[i], b = floats[j];
    if (a.contains(b) || b.contains(a) || sameCollage(a, b)) continue;
    const g = gapBetween(rectOf(a), rectOf(b));
    const heroPair = a.classList.contains('hero-pin') && b.classList.contains('hero-pin');
    const need = heroPair ? (mode === 'rest' ? 24 : 16) : 0;
    if (g < need) issues.push(`floating elements ${g < 0 ? 'overlap' : 'too close'} (${Math.round(g)}px, need ${need}px): ${label(a)}  <>  ${label(b)}`);
  }

  /* ---------- hero: pins stay inside the photo box and clear of faces / hands / phones ---------- */
  const art = document.querySelector('.hero-art');
  const heroImg = art && art.querySelector('img');
  if (art && heroImg) {
    const ar = rectOf(art), ir = rectOf(heroImg);
    const pins = [...art.querySelectorAll('.hero-pin')].filter(visible);
    const MARGIN = 16;
    for (const p of pins) {
      const r = rectOf(p);
      if (r.left < ar.left - 1 || r.right > ar.right + 1 || r.top < ar.top - 1 || r.bottom > ar.bottom + 1)
        issues.push(`hero decoration leaves the photo box: ${label(p)} (box ${Math.round(ar.left)}–${Math.round(ar.right)}, element ${Math.round(r.left)}–${Math.round(r.right)})`);
      if (getComputedStyle(art).display === 'flex') continue;         // stacked under the photo on phones
      zones.forEach((z, zi) => {
        const zr = { left: ir.left + z[0] * ir.width, top: ir.top + z[1] * ir.height, right: ir.left + z[2] * ir.width, bottom: ir.top + z[3] * ir.height };
        const g = gapBetween(r, zr);
        if (g < MARGIN) issues.push(`covers/crowds the ${zi === 0 ? 'face' : 'hands/phone'} zone (${Math.round(g)}px clear, need ${MARGIN}px): ${label(p)}`);
      });
    }
    // stacked layout: the card must not overlap the photo
    if (getComputedStyle(art).display === 'flex') for (const p of pins) { if (rectOf(p).top < ir.bottom - 1) issues.push(`stacked card overlaps the photo: ${label(p)}`); }
  }

  /* ---------- collage info cards must leave the face/hands in the upper part of the photo free ---------- */
  document.querySelectorAll('.collage-3 .c').forEach((card) => {
    const ov = card.querySelector(':scope > div.absolute'); if (!ov || !visible(ov)) return;
    const cr = rectOf(card), or = rectOf(ov);
    const start = (or.top - cr.top) / cr.height;
    if (start < 0.72) issues.push();
  });

  /* ---------- collage info cards must leave the face / hands in the upper part of the photo free ---------- */
  document.querySelectorAll('.collage-3 .c').forEach((card) => {
    const ov = card.querySelector(':scope > div.absolute');
    if (!ov || !visible(ov)) return;
    const cr = rectOf(card), or = rectOf(ov);
    const start = (or.top - cr.top) / cr.height;
    if (start < 0.72) issues.push(`collage info card starts at ${Math.round(start * 100)}% of the photo (needs >= 72%, so it stays below the face and hands)`);
  });

  /* ---------- clipping (ancestor overflow) and viewport edge ---------- */
  const textEls = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textRects = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || !visible(el)) continue;
    const det = el.closest('details:not([open])'); if (det && !el.closest('summary')) continue;   // collapsed FAQ answer
    const range = document.createRange(); range.selectNodeContents(n);
    for (const r of range.getClientRects()) if (r.width > 1 && r.height > 1) textRects.push({ el, r, text: n.textContent.trim().slice(0, 24) });
    textEls.push(el);
  }
  const clipAncestors = (el) => {
    const out = []; let escaped = getComputedStyle(el).position === 'absolute';
    if (getComputedStyle(el).position === 'fixed') return out;
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.display === 'contents') continue;
      if (!escaped && (/(hidden|clip)/.test(cs.overflowX) || /(hidden|clip)/.test(cs.overflowY))) out.push(a);
      if (escaped && cs.position !== 'static') escaped = false;       // reached the containing block
      if (cs.position === 'fixed') break;
    }
    return out;
  };
  const checked = new Set([...floats, ...textEls]);
  for (const el of checked) {
    if (!visible(el)) continue;
    const r = rectOf(el);
    if (el.closest('.site-header') && getComputedStyle(el).position === 'fixed') continue;
    if (r.left < -1 || r.right > vw + 1) issues.push(`outside the viewport edge (${Math.round(r.left)}…${Math.round(r.right)} of ${vw}): ${label(el)}`);
    for (const a of clipAncestors(el)) {
      const ar = rectOf(a), cs = getComputedStyle(a);
      const cx = /(hidden|clip)/.test(cs.overflowX), cy = /(hidden|clip)/.test(cs.overflowY);
      const bad = (cx && (r.left < ar.left - 1.5 || r.right > ar.right + 1.5)) || (cy && (r.top < ar.top - 1.5 || r.bottom > ar.bottom + 1.5));
      if (bad) { issues.push(`clipped by ${label(a)}: ${label(el)}`); break; }
    }
    if (textEls.includes(el) && /(hidden|clip)/.test(getComputedStyle(el).overflowX) && el.scrollWidth > el.clientWidth + 1) issues.push(`text cut off inside its own box: ${label(el)}`);
  }

  /* ---------- text over text / buttons / floating elements ---------- */
  for (let i = 0; i < textRects.length; i++) for (let j = i + 1; j < textRects.length; j++) {
    const A = textRects[i], B = textRects[j];
    if (A.el === B.el || A.el.contains(B.el) || B.el.contains(A.el)) continue;
    const ox = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left);
    const oy = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
    if (ox > 2 && oy > 0.3 * Math.min(A.r.height, B.r.height)) issues.push(`text overlaps text: "${A.text}" (${label(A.el)})  <>  "${B.text}" (${label(B.el)})`);
  }
  for (const f of floats) {
    const fr = rectOf(f);
    for (const T of textRects) {
      if (f.contains(T.el) || T.el.contains(f)) continue;
      if (T.el.closest('.collage, .collage-3') && f.closest('.collage, .collage-3') === T.el.closest('.collage, .collage-3')) continue;
      const ox = Math.min(fr.right, T.r.right) - Math.max(fr.left, T.r.left);
      const oy = Math.min(fr.bottom, T.r.bottom) - Math.max(fr.top, T.r.top);
      if (ox > 2 && oy > 2) { issues.push(`floating element covers text "${T.text}": ${label(f)}`); break; }
    }
  }
  return [...new Set(issues)];
}

/* --------------------------------------------- driver --------------------------------------------- */
(async () => {
  if (!browserPath) { console.error('No Edge/Chrome found. Set BROWSER_PATH to a Chromium-based browser.'); process.exit(2); }
  const browser = await chromium.launch({ executablePath: browserPath });
  const lines = [];
  let total = 0, runs = 0;
  const shotDir = path.join(ROOT, '_dev', 'hero-shots');
  if (SHOTS) fs.mkdirSync(shotDir, { recursive: true });

  for (const pg of PAGES) {
    if (only && pg !== only) continue;
    for (const w of WIDTHS) for (const mode of ['rest', 'peak']) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: mode === 'rest' ? 'reduce' : 'no-preference' });
      const p = await ctx.newPage();
      await p.goto(pathToFileURL(path.join(ROOT, pg + '.html')).href, { waitUntil: 'networkidle' });
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(mode === 'peak' ? 2200 : 500);
      if (mode === 'peak') {
        await p.evaluate(async () => {                       // trigger scroll reveals, come back to top
          const H = document.documentElement.scrollHeight;
          for (let y = 0; y < H; y += 400) { scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 70)); }
          await new Promise((r) => setTimeout(r, 1200)); scrollTo({ top: 0, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 400));
          // freeze every float animation at the top of its move (50% of the cycle)
          document.getAnimations().forEach((a) => {
            if (a.animationName === 'ft-float') { const t = a.effect.getTiming(); a.pause(); a.currentTime = (parseFloat(t.delay) || 0) + parseFloat(t.duration) * 0.5; }
          });
        });
      }
      const issues = await p.evaluate(audit, { page: pg, mode, zones: ZONES[pg] });
      runs++;
      if (issues.length) { total += issues.length; lines.push(`✗ ${pg} @${w} [${mode}]  ${issues.length} issue(s)`); issues.forEach((i) => lines.push('    - ' + i)); }
      if (SHOTS && mode === 'rest' && [1440, 1024, 390].includes(w)) {
        await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        const hero = await p.$('.hero');
        await hero.screenshot({ path: path.join(shotDir, `${pg}_${w}.png`) });
      }
      await ctx.close();
    }
  }
  await browser.close();
  const head = `Overlap audit – ${runs} runs (${PAGES.filter((x) => !only || x === only).length} pages × ${WIDTHS.length} widths × rest/peak)\n` + `Result: ${total === 0 ? '0 issues' : total + ' issue(s)'}\n`;
  const report = head + (lines.length ? '\n' + lines.join('\n') + '\n' : '');
  fs.writeFileSync(path.join(ROOT, '_dev', 'overlap-report.txt'), report);
  console.log(report);
  process.exit(total ? 1 : 0);
})();
