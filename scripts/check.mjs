/**
 * Definition-of-done checks against a running build (npm run preview) or dev server.
 *   CHECK_URL=http://localhost:4173/ npm run check
 *
 * - widths 390, 768, 1440, 1920: console errors, horizontal overflow
 * - axe-core (critical + serious) in live, still (reduced motion) and no-WebGL modes
 * - phone number / GPA scan of the rendered text
 * - screenshots of every chapter, desktop and mobile, into /screenshots
 */
import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const { AxeBuilder } = await import('@axe-core/playwright');

const BASE = process.env.CHECK_URL ?? 'http://localhost:4173/';
const CHAPTERS = ['gate', 'lounge', 'boarding', 'takeoff', 'climb', 'cruise', 'descent', 'contact'];
const report = { base: BASE, widths: [], axe: [], privacy: [], screenshots: [] };
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function open(ctxOpts, query = '') {
  const ctx = await browser.newContext(ctxOpts);
  await ctx.addInitScript(() => sessionStorage.setItem('altitude-boarded', '1'));
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE + query, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  return { ctx, page, errors };
}

async function scrollThrough(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(60);
  }
}

// 1. widths
for (const width of [390, 768, 1440, 1920]) {
  const { ctx, page, errors } = await open({ viewport: { width, height: width < 800 ? 844 : 960 } });
  await scrollThrough(page);
  const overflow = await page.evaluate(() => {
    const w = document.documentElement.clientWidth;
    const out = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > w + 1 && getComputedStyle(el).position !== 'fixed' && r.width > 0) {
        if (!el.closest('.room-outer, .ops-board-wrap, .draw-labels, .route-svg, .lounge-stage, .cabin-cut, .descent-stage')) out.push(el.className || el.tagName);
      }
    });
    return { scrollWidth: document.documentElement.scrollWidth, clientWidth: w, offenders: [...new Set(out)].slice(0, 8) };
  });
  await writeFile('screenshots/check-report.json', JSON.stringify(report, null, 2));
  report.widths.push({ width, consoleErrors: errors, ...overflow, horizontalScroll: overflow.scrollWidth > overflow.clientWidth });
  await ctx.close();
}

// 2. axe in three modes
for (const [label, opts, query] of [
  ['live desktop', { viewport: { width: 1440, height: 900 } }, ''],
  ['reduced motion desktop', { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }, ''],
  ['no WebGL desktop', { viewport: { width: 1440, height: 900 } }, '?nowebgl'],
  ['mobile', { ...devices['iPhone 13'] }, ''],
]) {
  const { ctx, page } = await open(opts, query);
  await scrollThrough(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  const bad = res.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  report.axe.push({
    mode: label,
    criticalOrSerious: bad.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0]?.target })),
    moderateOrMinor: res.violations.filter((v) => !bad.includes(v)).map((v) => v.id),
  });
  // privacy scan on the fully rendered text
  // visible text plus every link target; SVG coordinates are not text
  const text = await page.evaluate(
    () => document.body.innerText + ' ' + [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).join(' '),
  );
  report.privacy.push({
    mode: label,
    // Vietnamese mobile and landline formats: +84 / 0 followed by 9–10 digits, with optional separators
    phoneLike: (text.match(/(?:\+84|\b0)(?:[\s.-]?\d){9,10}\b/g) || []).slice(0, 5),
    gpa: /\bGPA\b|\b[0-9]\.[0-9]{1,2}\s*\/\s*4(\.0)?\b/i.test(text),
  });
  await ctx.close();
}

// 3. manifest
{
  const { ctx, page } = await open({ viewport: { width: 1440, height: 900 } }, '?nowebgl#manifest');
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  report.axe.push({ mode: 'flight manifest', criticalOrSerious: res.violations.filter((v) => ['critical', 'serious'].includes(v.impact)).map((v) => v.id) });
  await page.screenshot({ path: 'screenshots/manifest-desktop.png', timeout: 120000 }).catch((e) => console.error('manifest screenshot', e.message));
  await ctx.close();
}

// 4. screenshots of every chapter
for (const [kind, opts] of [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['mobile', { ...devices['iPhone 13'] }],
]) {
  const { ctx, page } = await open(opts);
  for (const id of CHAPTERS) {
    const y = await page.evaluate((cid) => {
      const el = document.getElementById(cid);
      if (!el) return 0;
      const top = el.getBoundingClientRect().top + scrollY;
      const sticky = el.offsetHeight > innerHeight * 1.5;
      const offsets = { lounge: 0.62, takeoff: 0.55, climb: 0.08, cruise: 0.35, descent: 0.45 };
      return top + (sticky ? (el.offsetHeight - innerHeight) * (offsets[cid] ?? 0.3) : innerHeight * (offsets[cid] ?? 0) * 0.5);
    }, id);
    await page.evaluate((yy) => window.scrollTo(0, yy), id === 'lounge' ? y + 1 : y);
    if (id === 'lounge' && kind === 'desktop') {
      const wrap = await page.evaluate(() => {
        const el = document.querySelector('.gl');
        return el ? el.getBoundingClientRect().top + scrollY + (el.offsetHeight - innerHeight) * 0.62 : null;
      });
      if (wrap) await page.evaluate((yy) => window.scrollTo(0, yy), wrap);
    }
    await page.waitForTimeout(2200);
    const path = `screenshots/${String(CHAPTERS.indexOf(id) + 1).padStart(2, '0')}-${id}-${kind}.png`;
    await page.screenshot({ path, timeout: 120000 }).catch((e) => console.error('screenshot', path, e.message));
    report.screenshots.push(path);
  }
  await ctx.close();
}

await browser.close();
await writeFile('screenshots/check-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
