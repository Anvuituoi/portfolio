/**
 * Keyboard-only run through the whole site: Tab order, focus visibility, lounge object
 * open/close with Enter/Escape, case-study dialog focus trap and Escape.
 *   CHECK_URL=http://localhost:4173/ node scripts/keyboard.mjs
 */
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = process.env.CHECK_URL ?? 'http://localhost:4173/';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const results = {};

for (const [mode, opts] of [
  ['live', { viewport: { width: 1440, height: 900 } }],
  ['reduced', { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }],
]) {
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript(() => sessionStorage.setItem('altitude-boarded', '1'));
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const stops = [];
  for (let i = 0; i < 90; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(mode === 'live' ? 120 : 30);
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        label: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 60),
        tag: el.tagName,
        inView: r.bottom > 0 && r.top < innerHeight && r.width > 0,
        outline: cs.outlineStyle !== 'none' || cs.boxShadow !== 'none',
      };
    });
    if (!info) break;
    stops.push(info);
    if (info.label.startsWith('Flight Manifest (plain text)')) break;
  }
  results[mode] = {
    tabStops: stops.length,
    reachedContact: stops.some((s) => s.label.startsWith('Email')),
    notInView: stops.filter((s) => !s.inView).map((s) => s.label),
    noFocusStyle: stops.filter((s) => !s.outline).map((s) => s.label),
    order: stops.map((s) => s.label),
  };

  // Lounge object with Enter, then Escape (live only: pinned room)
  if (mode === 'live') {
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
    const btn = page.locator('.room-hit').first();
    await btn.focus();
    await page.waitForTimeout(1200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(900);
    const opened = await page.evaluate(() => ({ expanded: document.querySelector('.room-hit')?.getAttribute('aria-expanded'), focus: document.activeElement?.textContent?.slice(0, 40) }));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
    const closed = await page.evaluate(() => ({ expanded: document.querySelector('.room-hit')?.getAttribute('aria-expanded'), focusBack: document.activeElement?.classList.contains('room-hit') }));
    results.lounge = { opened, closed };
  }

  // Case study dialog
  const open = page.locator('.wpt-open').nth(1);
  await open.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  const dlg = await page.evaluate(() => ({ hash: location.hash, focus: document.activeElement?.id, inDialog: !!document.activeElement?.closest('[role=dialog]') }));
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
  const trapped = await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  const after = await page.evaluate(() => ({ hash: location.hash, dialog: !!document.querySelector('[role=dialog]'), focus: document.activeElement?.className }));
  results[`${mode}-dialog`] = { dlg, trapped, after };
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
