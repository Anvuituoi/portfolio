// usage: node scripts/shot.cjs url out.png [w h]
const { chromium } = require('playwright');
(async () => {
  const [url, out, w = 1440, h = 900] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  p.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); });
  p.on('pageerror', (e) => console.log('pageerror:', e.message));
  await p.goto(url);
  await p.waitForFunction(() => window.__posterReady === true, null, { timeout: 60000 }).catch(() => console.log('timeout'));
  await p.screenshot({ path: out });
  await b.close();
})();
