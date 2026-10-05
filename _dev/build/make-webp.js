/* Re-creates the .webp twin of every .jpg/.png in assets/img (run after swapping in new photos). */
const fs = require('fs'), path = require('path'), sharp = require('sharp');
const dir = path.join(__dirname, '../../assets/img');
(async () => {
  for (const f of fs.readdirSync(dir)) {
    const ext = path.extname(f).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
    const out = path.join(dir, f.slice(0, -ext.length) + '.webp');
    await sharp(path.join(dir, f)).webp(ext === '.png' ? { quality: 82, alphaQuality: 90, effort: 6 } : { quality: 78, effort: 6 }).toFile(out);
    console.log('webp', path.basename(out));
  }
})();
