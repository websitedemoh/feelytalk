# _dev – tooling and reference files (not needed to host the site)

You can delete this whole folder before deploying. Nothing in the site depends on it.

- `build/` – Tailwind CSS build. Run `npm install` once, then `npm run build:css` whenever you add or change
  Tailwind classes in the HTML or in `assets/js/components.js`. It rewrites `assets/css/tailwind.min.css`.
  (Colours and fonts live in `assets/css/site.css`; the Tailwind config only points at those CSS variables.)
- `verification-cdn-build/` – screenshots taken before the Tailwind CDN was removed (reference only).
- `build/make-webp.js` (`npm run webp` in `build/`) – recreates the `.webp` twin of every JPG/PNG in `assets/img`. Run it after you replace photos.
- `IMAGE-PROMPTS.md` – a ready-to-paste AI prompt for every photo slot, with sizes and aspect ratios.
- `prompt-helper.html` – local-only checklist for generating the photos by hand: one card per image with a Copy button and a done tick. Re-create it with `node build/make-prompt-helper.js` if you edit `IMAGE-PROMPTS.md`.
- `build/gen-images.js` – optional automatic generator using the Gemini API (needs a billed `GEMINI_API_KEY`).
- `image-map.json` / `image-map-contact-sheet.jpg` – which generated image went into which slot. `old-images-backup/` holds the previous mockup crops. `TODO-IMAGES.md` lists the placeholders to regenerate.
- `motion/` – Home hero animation (GIF + filmstrip). `final-screens/` – full-page screenshots of every page at 1440 and 390.
- Motion lives in the `MOTION` block at the end of `assets/css/site.css` and in `assets/js/motion.js` (scroll reveal + nav shadow).
- `build/check-overlap.js` (`npm run check:overlap`) – layout audit: 6 pages x 6 widths x (rest, float-peak). Reports overlaps, faces/hands covered, clipping, text collisions and horizontal scroll. Writes `overlap-report.txt`; add `--shots` to save hero screenshots to `hero-shots/`. Run it again after any layout or photo change.
