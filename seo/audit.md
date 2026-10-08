# feelytalk.com — Phase 1 SEO Audit (read-only)

Date: 2026-10-08 · Auditor: SEO agent · Scope: live https://www.feelytalk.com + local repo (commit 3c5370b)

## 0. Data sources and access status

| Source | Status |
|---|---|
| Local repo (6 HTML pages, components.js, motion.js, site.css) | Read in full |
| Live site via curl (status, headers, redirects, robots, sitemap, 404) | Done |
| Live vs local diff | All 6 pages + components.js are **byte-identical** live vs local, so line refs below apply to production |
| Google Search Console (Domain + URL-prefix) | **Phase 2 update: accessed via Chrome, but the signed-in account has no access to either property (see section 5).** Phase 1 note: **NOT ACCESSED.** Claude-in-Chrome tools were not available in this session; only an unauthenticated Playwright browser was present. No GSC queries, coverage, CWV, sitemaps or manual-actions data. All GSC items = **no data**. |
| PageSpeed Insights (mobile) | **NOT ACCESSED.** The keyless PSI API returned 429 (daily quota 0). One attempt to load pagespeed.web.dev in Playwright was stopped because Playwright writes logs into the repo (see section 6). LCP/INP/CLS = **no data**. Performance notes below come from reading the source. |
| Rich Results Test | Not run (there is no JSON-LD to test) |

Note: the brief says "7 root *.html pages". The repo has **6**: index, how-it-works, join-us, safety, help, blog. No 7th page exists locally or live (privacy/terms return 404).

## 1. Site-level findings

| # | Check | Finding (verified) |
|---|---|---|
| S1 | robots.txt | **404** on live (`/robots.txt`). There is no file in the repo. |
| S2 | sitemap.xml | **404** on live (`/sitemap.xml`). There is no file in the repo. |
| S3 | Apex to www | `https://feelytalk.com/*` returns **308** to `https://www.feelytalk.com/*` with the path preserved. OK. |
| S4 | http to https | `http://www.` returns 308 to `https://www.` (1 hop). OK. `http://feelytalk.com/` returns 308 to `https://feelytalk.com/` and then 308 to `https://www.` (**2-hop chain**). Minor. |
| S5 | .html / extensionless / trailing slash | `/how-it-works.html` returns 200. `/how-it-works` and `/how-it-works/` return **404**. `/index.html` returns **200 (duplicate of `/`)**, with no redirect and no canonical. |
| S6 | vercel.json | None. Vercel serves the repo root as static files with default settings (no cleanUrls, no redirects, no headers). |
| S7 | 404 behaviour | Returns a real 404 status (good) but Vercel's plain-text "NOT_FOUND" body (79 bytes). There is no branded 404.html with navigation. |
| S8 | Dev files publicly served | All of these return **200 on live**: `/_dev/README.md`, `/_dev/prompt-helper.html` (an indexable 58 KB HTML page), `/_dev/IMAGE-PROMPTS.md`, `/_dev/image-map.json`, `/_dev/build/gen-images.js`, `/.impeccable/config.json`, `/sheet_1440.png` (1.4 MB), and presumably `/new-images/*` [unverified per file]. git tracks 2,578 files, including 2,281 under `_dev/build/node_modules` (the one node_modules file tested returned 404 live). No secrets found: gen-images.js reads the key from an env var. |
| S9 | Canonical tags | **None on any page.** Every page has the comment `<!-- EDIT before launch: set <link rel="canonical"> ... -->` at line 12. |
| S10 | Absolute URL consistency (https://www.) | The site contains **no absolute self-URLs at all**: no canonical, no og:url, and og:image is relative (`assets/og-image.jpg`). All internal links are relative (`index.html`, `help.html`, ...). No apex or http URLs were found. Relative internal links are fine. Canonical, og:url, og:image and sitemap must be absolute `https://www.feelytalk.com/...`. |
| S11 | Home URL inconsistency | Every logo and "Home" link points to `index.html` (components.js:9, 95, 106, 135, 156; `index.html#download` at :85). This links to the duplicate `/index.html` rather than `/`. |
| S12 | lang / hreflang | `<html lang="en">` on all pages. The content is English and the audience is India, so `en-IN` would be more precise (og:locale is already `en_IN`). hreflang is not needed (single language). |
| S13 | Viewport / charset | Present on all pages. OK. |
| S14 | Mixed content | None found. The only external resource is Google Fonts over https. |
| S15 | Structured data | **No JSON-LD on any page.** |
| S16 | X-Robots-Tag / meta robots | Neither is present, so pages are indexable by default. OK. |

## 2. JS-injected components (assets/js/components.js)

The `<ft-nav>`, `<ft-footer>` and `<ft-cta>` custom elements build all primary nav, footer and store-badge markup in JS (light DOM, `innerHTML`). Links are real `<a href>` elements after rendering, so Googlebot (which renders JS) can follow them. The raw HTML contains none of them, so non-rendering crawlers (Bing's first pass, social scrapers, most AI crawlers) see almost no internal links.

**Internal links present in raw HTML (no JS):**

| Page | Links to other pages in raw HTML |
|---|---|
| index.html | how-it-works.html (1) |
| how-it-works.html | none |
| join-us.html | none |
| safety.html | help.html |
| help.html | join-us.html, safety.html |
| blog.html | none |

blog.html has no inbound link in raw HTML from anywhere, and join-us.html has only one (from help).

**Dead or placeholder links inside components.js:**
- L139: About Us `#`, Careers `#`
- L140: Terms of Service `#`, Privacy Policy `#`. **No privacy policy or terms page exists.** This is a trust/E-E-A-T and app-store compliance gap.
- L151/157: all 4 social icons point to `#`
- L183–184: "Get it on Google Play" and "App Store" buttons point to `#download`, a self-anchor. **There are no real app store URLs anywhere on the site.** Every "Download App" CTA leads to this banner, so the site cannot convert. This also blocks MobileApplication schema.
- L85: on pages without `<ft-cta>` (join-us, safety, help, blog), Download links go to `index.html#download`.
- L162: `© 2024` (stale year).
- The footer headings are `<h2>` (L147) and the CTA heading is `<h2>` (L180). They add generic "Product / Company / Support / Ready to Find Your People?" H2s to every page's outline. Minor.

## 3. Per-page findings

Title and description lengths are character counts. The target is a title of 60 or fewer and a description of 140–155.

| Page (live URL) | Title (len) | Meta desc (len) | H1 | Words in main | Imgs (empty alt / not lazy) | Notes |
|---|---|---|---|---|---|---|
| `/` index.html | "FeelyTalk – Real People. Real Conversations. Your Vibe." (57) | 162 (too long) | 1: "Real People. Real Conversations. Your Vibe." | ~349 | 12 (6 / 7) | No keyword (e.g. "talk to strangers", "video call app", "Indian") in the title or H1. Hero LCP image has `fetchpriority="high"`. Host-card H3s (Aanya/Rohan/...) are thin. |
| `/how-it-works.html` | "How it Works – FeelyTalk" (26) | 132 (short) | 1: "Simple Steps to Start Real Conversations." | ~277 | 15 (11 / 2) | The title is generic and wastes about 30 chars. Has an `<ft-cta>`. |
| `/join-us.html` | "Join Us – Become a FeelyTalk Host" (35) | 119 (short) | 1: "Turn Your Vibe Into Meaningful Conversations." | **~190 (thin)** | 9 (8 / 2) | The H1 doesn't say "host". 2 "Join as a Host" CTAs point to `#` (L126, L140). "Watch Video" points to `#how` (no video). There is no host application path. H2s at L72–74 are card labels (they should be H3). |
| `/safety.html` | "Safety – A Safer Space for Real Conversations \| FeelyTalk" (59) | 142 | 1 | ~284 | 4 (3 / 1) | The heading structure is good. |
| `/help.html` | "Help Center &amp; FAQ – FeelyTalk" (35) | 154 | 1: "We're Here to Help." | ~395 | 2 (1 / 1) | **Has a visible FAQ (9 `<details>`), so it qualifies for FAQPage schema.** 2 FAQ answers are marked as placeholders in comments (L80, L83: pricing/payouts), so the copy needs confirming before marking it up. The 5 category cards use `<h2>` (L58–62) inside links, which should be H3. "Contact Support" points to `#` (L101). There is no email/contact method. |
| `/blog.html` | "Blog – Real Stories, Helpful Insights \| FeelyTalk" (51) | 139 | 1 | ~302 | 10 (9 / 1) | **All 9 article cards link to `#` (L68–76). No article pages exist.** It is a blog index with zero posts, which is thin and soft-404-like. The newsletter form does nothing (`onsubmit="return false"`). "Latest articles" is an sr-only H2. One card uses category "Tips", which is not among the filters. |

**Common to all 6 pages (head, lines 6–28):**
- No canonical, robots meta, og:url or JSON-LD.
- og:image is relative (`assets/og-image.jpg`, L18), so many scrapers will fail to show a preview.
- Twitter has only `twitter:card` (L21). There is no twitter:title/description/image; X falls back to OG, which is acceptable once og:image is absolute.
- The title separator mixes "–" and "|" across pages, and the brand appears first on the homepage but last elsewhere.
- Images: no image is missing an `alt` attribute. Decorative images correctly use `alt=""`. Meaningful hero/feature images have descriptive alts. Host photos use "Aanya, 19"-style alts, which is acceptable. Blog thumbnails are `alt=""`; acceptable while they are decorative, but they need alts once posts exist. All `<img>` have width/height set.

## 4. Performance hints (source review only; no PSI data)

- **Render-blocking in `<head>`:** the Google Fonts CSS (Caveat 500 + **Nunito with 7 weights**, 300–900) plus 2 local CSS files (site.css 29.8 KB, tailwind.min.css 13.6 KB). Fonts use `display=swap` and have preconnects. Trimming the Nunito weights in use (likely 4) and inlining or merging the CSS would help.
- **LCP risk:** the hero photo (LCP candidate) is animated from `opacity:0` with `ft-photo-in .7s ... .1s both` (site.css ~L359). The text column also fades from 0 with a staggered delay up to about 0.5s (site.css ~L353–358). This likely delays LCP by about 0.8s [unverified, no lab data]. Wrapped in `prefers-reduced-motion: no-preference` [unverified scope].
- **Hero images are not responsive:** one size each (e.g. hero-1 is 1254×1200, 74 KB webp / 128 KB jpg). There is no `srcset`/`sizes`, so phones download the desktop size.
- **Logo:** `logo-trimmed.png` is 53 KB, displayed at 149×48 and loaded 3 times per page (nav, mobile menu, footer; same file, cached). It is a good candidate for a WebP or SVG of about 5 KB.
- Lazy-loading: below-fold images use `loading="lazy"`. Avatars on the home page (above the fold) are correctly not lazy.
- JS: components.js (18.8 KB, unminified) and motion.js (4.3 KB) are `defer`. Nav/footer render only after the JS runs, so a CLS risk exists if `<ft-nav>` has no reserved height [unverified].

## 5. Search Console + PageSpeed (Phase 2 attempt, 2026-10-08, Claude-in-Chrome, read-only)

**Result: this Chrome profile has no Search Console data available.**

| Check | Result |
|---|---|
| Signed-in account | the signed-in Chrome account (email withheld) |
| Domain property `sc-domain:feelytalk.com` | "Oops, you don't have access to this property" (not-verified page) |
| URL-prefix property `https://www.feelytalk.com/` | Same: no access |
| Property list (`/search-console/welcome`) | Opens the onboarding "Welcome to Google Search Console" page, so **this account has access to zero properties** |
| Performance (3 months of queries/pages), Page indexing, Core Web Vitals, Manual actions | **Not available** (blocked by the above) |
| PageSpeed Insights (pagespeed.web.dev, mobile, retried once) | Stuck at "Running analysis" for about 4 minutes with no result. **Skipped** as instructed. |

No verification or other GSC action was taken. There are two possibilities: (a) the property is verified under a different Google account, in which case sign Chrome into that account or add the signed-in Chrome account (email withheld) under GSC > Settings > Users and permissions; or (b) feelytalk.com has never been verified, in which case the quickest route is a Domain property verified by a DNS TXT record at the registrar. Once access exists, submit `https://www.feelytalk.com/sitemap.xml` and re-run this section.

Consequence for Phase 2: `seo/keyword-map.md` is built from on-page content and search-intent reasoning only, with no impression or click data. Treat it as a hypothesis to validate after GSC has 4–8 weeks of data.

## 6. Housekeeping caused by this audit

Playwright MCP automatically created **`.playwright-mcp/`** in the repo root (2 log files: a page snapshot and a console log from pagespeed.web.dev). It is untracked and was not committed. **Delete it, or add it to .gitignore, before any commit (needs your OK).** No other files were changed. The only file written intentionally is `seo/audit.md`.

---

## 7. Prioritized fix list (proposed, NOT applied)

Impact: H/M/L · Effort: S/M/L

| # | Fix | Impact | Effort | Where | Proposed change |
|---|---|---|---|---|---|
| 1 | Add robots.txt | H | S | new `/robots.txt` | `User-agent: *` / `Allow: /` / `Disallow: /_dev/` / `Disallow: /.impeccable/` / `Sitemap: https://www.feelytalk.com/sitemap.xml` |
| 2 | Add sitemap.xml | H | S | new `/sitemap.xml` | 6 absolute `https://www.feelytalk.com/...` URLs (home as `/`) with lastmod. Exclude blog until real posts exist (decision needed). |
| 3 | Canonical on every page | H | S | all 6 pages, L12 (replace the EDIT comment) | `<link rel="canonical" href="https://www.feelytalk.com/">` for home, and `.../how-it-works.html` etc. for the rest. Also consolidates `/index.html` into `/`. |
| 4 | Real app store links | H | S* | components.js L83–85, L183–184 | Point the Google Play / App Store buttons and the Download CTAs at real store URLs. *Needs URLs from you (business input).* Unblocks MobileApplication schema. |
| 5 | Stop serving dev files | H | S | new `vercel.json` or `.vercelignore` | Add `.vercelignore` with `_dev/`, `.impeccable/`, `new-images/`, `sheet_*.png`, `seo/`, `.playwright-mcp/`, or move them out of the deploy. Also add a robots Disallow (fix 1). |
| 6 | Absolute og:image + og:url; complete Twitter tags | M | S | all pages, L13–21 | `og:image` = `https://www.feelytalk.com/assets/og-image.jpg`; add `og:url` (= canonical); add twitter:title/description/image. |
| 7 | JSON-LD | M | M | head of each page | Home: Organization + WebSite (+ MobileApplication once store URLs exist). Help: FAQPage (after confirming the placeholder answers at L80/L83). Inner pages: BreadcrumbList. |
| 8 | Crawlable nav/footer in raw HTML | M | M | components.js + all pages | Server-render the nav/footer `<a>` links in each HTML file (a `<noscript>` link list, or static markup that JS enhances) so non-JS crawlers see the internal links. |
| 9 | Privacy Policy + Terms pages | M | M* | footer L140 | Create the pages (*needs legal content from you*) and link them; this is also required for the Play Store listing. Until then, remove the `#` links or keep them out of the sitemap. |
| 10 | Rewrite titles/descriptions (keyword-led, "\| Feelytalk") | M | S | L6–7, L16–17 of each page | Phase 2 keyword map first. Fix lengths: home description 162, so trim it; how-it-works title 26, join-us description 119, and how-it-works description 132 are under-length. |
| 11 | Blog: no real posts | M | L* | blog.html L68–76 | Either publish real articles (needs content) or noindex/remove the blog from the nav and sitemap until posts exist. *Content decision.* |
| 12 | Heading hierarchy cleanup | L | S | help.html L58–62, join-us.html L72–74, components.js L147 | Card titles from H2 to H3; footer column titles from H2 to `<p>`/`<h3>` (visual style unchanged). |
| 13 | Use `/` not `index.html` for home links | L | S | components.js L9, 95, 106, 135, 156, 85 | Change `href="index.html"` to `href="/"` (and `/#download`). |
| 14 | Branded 404 page | L | S | new `404.html` | Vercel serves `/404.html` automatically. Use a nav plus links to the main pages. |
| 15 | LCP: don't fade in the hero photo/H1 from opacity 0 | M | S | site.css ~L353–359 | Start the hero `img` at opacity 1 (keep only the transform), or drop the delay. Verify with PSI afterwards. |
| 16 | Responsive hero images | M | M | hero `<picture>` on each page + new 640/960 w variants | Add `srcset`/`sizes`; generating new images needs the `npm run webp`-style tooling (ask first). |
| 17 | Trim fonts, lighter logo | L | S | head L24; components.js L86 | Load only the Nunito weights in use; convert the logo to WebP/SVG. |
| 18 | Clean URLs (optional) | L | S | vercel.json `cleanUrls: true` | Serves `/how-it-works` and 308s `.html` to the clean URL. **Changes every URL; decide before submitting the sitemap.** If adopted, canonicals and the sitemap must use the clean form. |
| 19 | `lang="en-IN"`, © year | L | S | L2 of each page; components.js L162 | Change the attribute; the year is a visible copy change, so it needs your OK. |
| 20 | Dead CTAs | M | S* | join-us L126, L140, L44; help L101; footer socials | Real host signup URL, support email, and social URLs (*needs input*). |

**Suggested order for Phase 3 (no business input needed):** 1, 2, 3, 5, 6, 13, 12, 14, 15, then 7 (Organization/WebSite/Breadcrumb now; FAQPage after you confirm the answers; MobileApplication after you provide the store URLs).
**Blocked on you:** store URLs (4), privacy/terms content (9), blog decision (11), host signup/support/social URLs (20), clean-URL decision (18), GSC + PSI data (needs Chrome access).
