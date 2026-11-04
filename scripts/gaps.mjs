/** Lists every [TO CONFIRM], [PLACEHOLDER] and [DRAFT FOR OWNER REVIEW] left in the content and source. */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const roots = ['src'];
const patterns = [/\bconfirm\(/g, /\bplaceholder\(/g, /\bdraft\(/g, /\[(TO CONFIRM|PLACEHOLDER|DRAFT FOR OWNER REVIEW)[^\]]*\]/g];
const hits = [];
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.(ts|tsx)$/.test(e.name)) {
      const lines = (await readFile(p, 'utf8')).split('\n');
      lines.forEach((line, i) => {
        if (/^\s*(\/?\*|\/\/)/.test(line) || line.includes('MarkerKind')) return;
        for (const re of patterns) {
          re.lastIndex = 0;
          const m = re.exec(line);
          if (m) hits.push(`${p}:${i + 1}  ${line.trim().slice(0, 150)}`);
        }
      });
    }
  }
}
for (const r of roots) await walk(r);
const unique = [...new Set(hits)];
console.log(unique.join('\n'));
console.log(`\n${unique.length} marked items. Empty links in src/content/site.ts are hidden in production and shown as [TO CONFIRM] in review mode.`);
