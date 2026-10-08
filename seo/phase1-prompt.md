Use the feelytalk-seo agent to run Phase 1 (audit only) and stop at Checkpoint 1.
Context:
- Live site: https://www.feelytalk.com (apex 308-redirects to www; www is canonical).
- Code: this folder. Static HTML, 7 root *.html pages + assets/js/components.js.
- Tailwind 3.4.19. Build: in _dev\build run `npm run build:css` → assets/css/tailwind.min.css.
- Hosting: Vercel, likely auto-deploys from GitHub websitedemoh/feelytalk main. Any push to main = LIVE.
- Chrome is signed in to the Google account owning feelytalk.com in Search Console. Check both Domain and https://www. URL-prefix properties.
Rules: read-only; no edits, builds, commits, or GSC actions. If GSC access fails, note it and continue. Also check canonicals, sitemap URLs, and internal links all use https://www.
Output: seo/audit.md + prioritized fix list (Impact H/M/L, Effort S/M/L), then wait for me.
