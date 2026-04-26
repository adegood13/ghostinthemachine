# Source assets

Original-quality image uploads kept here as source-of-truth. These files are
**outside** `public/` on purpose, so they are not deployed to the site.

When the site needs a new optimized variant of one of these, run the
optimization script (or open this folder in any image editor) and write the
output to `public/images/`.

Current source files:

- `Andrew.png` — host headshot, Andrew DeGood (4:5 portrait)
- `liz.png` — host headshot, Liz Short (4:5 portrait)
- `cover-art.png` — show banner / hero artwork (16:9 landscape)

The optimized web variants currently in use:

- `public/images/hosts/andrew.jpg` (800x1000, ~50 KB)
- `public/images/hosts/liz.jpg` (800x1000, ~65 KB)
- `public/images/cover-art.jpg` (1600x1600 centre crop, ~220 KB)
- `public/images/og-default.jpg` (1200x630 centre crop, ~90 KB)
- `public/images/banner.jpg` (1920w, ~180 KB)

To regenerate them, run from the repo root:

```bash
node -e "
const sharp = require('sharp');
(async () => {
  await sharp('assets/source/Andrew.png').resize({ width: 800, height: 1000, fit: 'cover', position: 'top' }).jpeg({ quality: 82, mozjpeg: true }).toFile('public/images/hosts/andrew.jpg');
  await sharp('assets/source/liz.png').resize({ width: 800, height: 1000, fit: 'cover', position: 'top' }).jpeg({ quality: 82, mozjpeg: true }).toFile('public/images/hosts/liz.jpg');
  await sharp('assets/source/cover-art.png').resize({ width: 1600, height: 1600, fit: 'cover', position: 'centre' }).jpeg({ quality: 86, mozjpeg: true }).toFile('public/images/cover-art.jpg');
  await sharp('assets/source/cover-art.png').resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' }).jpeg({ quality: 85, mozjpeg: true }).toFile('public/images/og-default.jpg');
  await sharp('assets/source/cover-art.png').resize({ width: 1920 }).jpeg({ quality: 84, mozjpeg: true }).toFile('public/images/banner.jpg');
})();
"
```

`sharp` is already a transitive dependency of Astro, so no extra install needed.
