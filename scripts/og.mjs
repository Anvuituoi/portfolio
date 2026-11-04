/** Builds public/og.jpg (1200×630) from the gate poster, the sky palette and the wordmark. */
import sharp from 'sharp';
const W = 1200, H = 630;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8D6D2"/><stop offset=".55" stop-color="#E5E4E2"/><stop offset="1" stop-color="#EFEEEB"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#s)"/></svg>`;
const words = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<text x="56" y="70" font-family="Georgia, serif" font-size="22" letter-spacing="7" fill="#3A0F34">ALTITUDE</text>
<text x="56" y="540" font-family="Georgia, serif" font-size="64" fill="#3A0F34">BEYOND THE ORDINARY.</text>
<text x="56" y="584" font-family="monospace" font-size="16" letter-spacing="2" fill="#3A0F34">LÂM VŨ AN · CHADD LAM · AVIATION &amp; BUSINESS | TECHNOLOGY &amp; INNOVATION | CULTURE &amp; SOCIAL IMPACT</text>
</svg>`;
const plane = await sharp('public/posters/gate-d.webp').resize(1000).toBuffer();
await sharp(Buffer.from(svg))
  .composite([{ input: plane, top: 0, left: 170 }, { input: Buffer.from(words) }])
  .jpeg({ quality: 82 })
  .toFile('public/og.jpg');
console.log('wrote public/og.jpg');
