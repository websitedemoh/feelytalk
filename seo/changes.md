# feelytalk.com: Phase 3 changes (branch `seo-fixes`, uncommitted)

Date: 2026-10-08. Nothing has been committed, pushed or deployed, and no Search Console action was taken.

## Applied

| Fix | What changed | Files |
|---|---|---|
| 1 robots.txt | New file: allow all, disallow `/_dev/` and `/.impeccable/`, sitemap line | `robots.txt` |
| 2 sitemap.xml | New file: 5 clean URLs (`/`, `/how-it-works`, `/join-us`, `/safety`, `/help`), lastmod 2026-10-08. Blog excluded. | `sitemap.xml` |
| 3 Canonicals | `<link rel="canonical">` on all 6 pages (`https://www.feelytalk.com/` and clean paths). Replaces the "EDIT before launch" comment. | 6 pages |
| 5 Dev files | New `.vercelignore` (root-anchored): `/_dev`, `/.impeccable`, `/new-images`, `/sheet_*.png`, `/seo`, `/.playwright-mcp`. Checked first: no page, CSS or JS references `new-images/`, `sheet_*.png`, `_dev/` or `.impeccable`. `assets/` (including `assets/css/tailwind.min.css`) is not matched, so it stays deployed. | `.vercelignore` |
| 6 OG/Twitter | `og:url` (= canonical); absolute `og:image`; added `twitter:title`, `twitter:description` and `twitter:image` | 6 pages |
| 7 JSON-LD | Home: Organization + WebSite. Inner pages: BreadcrumbList. Help: FAQPage with the **7 confirmed Q&As only** (the pricing and payout answers are excluded; the script skips any `<details>` that follows an `EDIT: placeholder` comment). No JSON-LD on blog (noindex) or 404. No MobileApplication (no store URLs). No `sameAs` (no social URLs). | 5 pages |
| 10 Titles/descriptions | Per `seo/keyword-map.md`. Titles 55–57 chars, descriptions 141–153. Mirrored into og: and twitter: tags. Blog unchanged. | 5 pages |
| 11 Blog | `<meta name="robots" content="noindex, follow">`; left out of the sitemap; still in the nav | `blog.html` |
| 12 Headings | help.html category cards and join-us.html feature cards changed from `<h2 class="h3">` to `<h3 class="h3">` (same class, same look). Footer column titles changed from `<h2 class="foot-head">` to `<p class="foot-head">`. | `help.html`, `join-us.html`, `components.js` |
| 13 + 18 Clean URLs | `vercel.json` = `{"cleanUrls": true}`. All internal links are root-relative clean paths (`/`, `/how-it-works`, `/help#support`, `/#download` ...) in the pages and components.js. Component image paths are now root-absolute (`/assets/...`) so they also work on deep 404 URLs. | `vercel.json`, pages, `components.js` |
| 14 404 page | New branded `404.html` (noindex, nav + footer, links to main pages, root-absolute asset paths) | `404.html` |
| 15 LCP | The hero photo's `ft-photo-in` now animates scale only (no opacity 0 start). The hero H1 uses a new `ft-rise` (translate only). Other hero text still fades. | `assets/css/site.css` |
| 19 Locale/year | `lang="en-IN"` on all pages; footer © 2024 changed to © 2026 | pages, `components.js` |
| 20 (partial) | All 4 social icons (Instagram/Twitter/YouTube/Discord, all `#`) removed from the footer. The icon definitions remain in `ICONS` for later. | `components.js` |
| Housekeeping | `.playwright-mcp/` deleted; `.gitignore` created with `.playwright-mcp/` | `.gitignore` |
| CSS build | `npm run build:css` passed (Tailwind 3.4.19). Diff: added `gap-x-6` and `gap-y-2` (404 page), removed `pl-1` (only the social row used it). | `assets/css/tailwind.min.css` |

## Not done / skipped

- **8 Crawlable nav in raw HTML**: not in the approved order; it means duplicating nav markup across 6 pages. Googlebot renders JS, so the links are already followable. Recommend it as a follow-up.
- **16 Responsive hero images, 17 font/logo trim**: not in the approved order; they need image generation tooling and a design check.
- **4 Store links, 9 Privacy/Terms, 20 host signup/support email**: no inputs provided (see Needs Ashish).
- **PageSpeed Insights**: retried once via Chrome; stuck at "Running analysis" for about 4 minutes, so skipped.
- **GSC**: the signed-in account has no access to any property (audit.md section 5).

## Needs Ashish

- Search Console access: add the signed-in Chrome account (email withheld) to the property, or verify a Domain property via DNS. Then submit `https://www.feelytalk.com/sitemap.xml`.
- Play Store URL and App Store URL (`components.js` CTA buttons and `DL`). These unlock MobileApplication schema.
- Host signup URL (join-us "Join as a Host" buttons are `#`; "Watch Video" points to `#how`).
- Support email (help "Contact Support" is `#`).
- Instagram/YouTube/other social URLs (the icons were removed; re-add them with real URLs and add `sameAs` to the Organization JSON-LD).
- Privacy Policy and Terms content (footer links are still `#`). Also About Us and Careers (`#`).
- Confirmed pricing and payout answers (help.html). FAQPage can then include those two questions.
- Blog: real articles before removing `noindex`.

## Verification (local)

- Static check of all 7 HTML files: `lang=en-IN`; one H1 each; title and description lengths as above; canonical present on all 6 public pages; blog `noindex, follow`; 404 `noindex`; every JSON-LD block parses; **0 broken internal links or asset paths** in the pages and components.js; sitemap has 5 URLs; vercel.json is valid JSON.
- Rendered check (a local server mimicking cleanUrls and 404.html, loaded in Chrome) for `/`, `/how-it-works`, `/join-us`, `/safety`, `/help`, `/blog` and `/nope/deep/link`: correct title, 6 nav links, 16 footer links, 0 social icons, "© 2026", footer titles are `<p>`, logo loads (including on the deep 404 path), no broken eager images, no JS errors, hero H1 opacity 1.
- Screenshots could not be captured (the Chrome tab was in a hidden window), so check visually on the Vercel preview.

## Check on the Vercel preview before merging

1. `/how-it-works.html` returns 308 to `/how-it-works`. `/index.html` should end at `/`.
2. `/how-it-works/` (trailing slash): note what Vercel does. If it 404s, add `"trailingSlash": false` to vercel.json.
3. `/_dev/README.md`, `/new-images/...`, `/sheet_1440.png` and `/seo/audit.md` return 404. `/assets/css/tailwind.min.css` returns 200.
4. `/robots.txt` and `/sitemap.xml` return 200; an unknown URL shows the branded 404 with a 404 status.
5. Rich Results Test on `/` and `/help`; check the look of the footer (no social row) and the hero animation.
