/**
 * Renders the authored still frames used when live 3D is off (reduced motion, no WebGL, phones)
 * and as the hero poster shown before the 3D chunk loads.
 *
 *   npm run dev            # in another terminal (or set POSTER_URL)
 *   npm run posters
 *
 * Frames are rendered from the real scene with a transparent background (the sky is DOM),
 * then encoded to WebP with alpha into public/posters.
 */
import { createRequire } from 'node:module';
// Playwright may be installed globally (CI images, cloud sandboxes) or locally.
const { chromium } = createRequire(import.meta.url)('playwright');
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.POSTER_URL ?? 'http://localhost:5173/';
const OUT = new URL('../public/posters/', import.meta.url);
const FRAMES = {
  gate: 0,
  boarding: 2.6,
  takeoff: 3.78,
  climb: 4.5,
  cruise: 5.55,
  descent: 6.5,
  contact: 7.55,
};
const SIZES = { d: [1600, 1000, 1], m: [430, 932, 2] };

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const [variant, [w, h, dpr]] of Object.entries(SIZES)) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  for (const [name, t] of Object.entries(FRAMES)) {
    await page.goto(`${BASE}?poster=${t}`);
    await page.waitForFunction(() => window.__posterReady === true, null, { timeout: 90000 });
    const png = await page.screenshot({ omitBackground: true });
    const file = new URL(`${name}-${variant}.webp`, OUT);
    await sharp(png).resize(variant === 'm' ? 860 : 1600).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(file.pathname);
    console.log('wrote', file.pathname);
  }
  await page.close();
}
await browser.close();
