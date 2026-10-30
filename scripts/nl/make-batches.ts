/** Groups the pages to translate into batches of ≈ 9,000 words, keeping each section together. → content-src/batches.json */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const nlDir = join(process.cwd(), 'content-src', 'nl');
const slug = JSON.parse(readFileSync(join(process.cwd(), 'content-src', 'slug-map.json'), 'utf8')) as Record<string, { de?: string }>;
const pages = readdirSync(nlDir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).map((f) => {
  const p = JSON.parse(readFileSync(join(nlDir, f), 'utf8'));
  return { id: f.replace(/\.json$/, ''), path: p.path as string, words: p.words as number };
}).filter((p) => slug[p.path]?.de);

const group = (p: { path: string }) => {
  const s = p.path.split('/').filter(Boolean);
  if (s[0] === 'pompen') return `pompen/${s[1] ?? ''}`;
  if (s[0] === 'meer-ipg') return `meer-ipg/${s[1] ?? ''}`;
  return s.length <= 1 ? 'misc' : s[0]!;
};
const order = ['misc', 'pompen/', 'pompen/pomptypen', 'pompen/segmenten', 'pompen/toepassingen', 'pompen/merken', 'revisie', 'pomp-kenniscentrum', 'meer-ipg/', 'meer-ipg/over-ipg', 'meer-ipg/pompschool', 'meer-ipg/cases', 'meer-ipg/vacatures', 'meer-ipg/nieuws'];
const rank = (p: { path: string }) => { const g = group(p); const i = order.indexOf(g); return i === -1 ? 0 : i; };
pages.sort((a, b) => rank(a) - rank(b) || a.path.localeCompare(b.path));

const batches: { n: number; words: number; ids: string[] }[] = [];
let cur: { n: number; words: number; ids: string[] } = { n: 1, words: 0, ids: [] };
let lastGroup = '';
for (const p of pages) {
  const g = group(p);
  const bigEnough = cur.words >= 9000 || (cur.words >= 5000 && g !== lastGroup);
  if (cur.ids.length && bigEnough) { batches.push(cur); cur = { n: batches.length + 1, words: 0, ids: [] }; }
  cur.ids.push(p.id); cur.words += p.words; lastGroup = g;
}
if (cur.ids.length) batches.push(cur);
writeFileSync(join(process.cwd(), 'content-src', 'batches.json'), JSON.stringify(batches, null, 1));
console.log(`${pages.length} pages in ${batches.length} batches`);
for (const b of batches) console.log(`batch ${String(b.n).padStart(2)}: ${String(b.ids.length).padStart(2)} pages, ${String(b.words).padStart(5)} words | ${b.ids[0]} … ${b.ids[b.ids.length - 1]}`);
