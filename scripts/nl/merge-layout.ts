/**
 * Merges the German translation with the layout of the Dutch original:
 *   - every German block gets the row/column of its Dutch counterpart (alignment by block type and image source),
 *   - text the first extraction missed is inserted from content-src/nl-layout/_new-blocks-de.json.
 *   npx tsx scripts/nl/merge-layout.ts → content-src/de-final/<id>.json  (translation + `lay`), report on stdout
 * The translation files in content-src/de/ are not changed, so the merge can be re-run at any time.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { align } from './new-blocks';

type Block = Record<string, unknown> & { t: string };
type Lay = { r: number | null; c: number | null };
const dir = join(process.cwd(), 'content-src');
const out = join(dir, 'de-final');
mkdirSync(out, { recursive: true });
const read = <T>(...p: string[]): T => JSON.parse(readFileSync(join(dir, ...p), 'utf8')) as T;

const newBlocks = read<{ id: string; index: number; block: Block }[]>('nl-layout', '_new-blocks.json');
const newDe = read<Record<string, string>>('nl-layout', '_new-blocks-de.json');
// key "<id>#<index in the layout extraction>" → German text
const added = new Map<string, string>();
newBlocks.forEach((x, i) => { if (newDe[String(i)]) added.set(`${x.id}#${x.index}`, newDe[String(i)]!); });

const token = (b: Block) => (b.t === 'img' ? `img:${String(b.src)}` : b.t === 'h' ? 'h' : b.t);
let pages = 0, inserted = 0, unaligned = 0;
for (const f of readdirSync(join(dir, 'de')).filter((x) => x.endsWith('.json'))) {
  const id = f.replace(/\.json$/, '');
  const de = read<{ blocks: Block[] } & Record<string, unknown>>('de', f);
  const layPath = join(dir, 'nl-layout', f);
  if (!existsSync(layPath)) { writeFileSync(join(out, f), JSON.stringify({ ...de, lay: de.blocks.map(() => ({ r: null, c: null })) }, null, 1)); continue; }
  const L = read<{ blocks: Block[]; lay: Lay[] }>('nl-layout', f);
  const old = read<{ blocks: Block[] }>('nl', f).blocks.filter((b) => b.t !== 'form');

  const nToO = align(old.map((b) => JSON.stringify(b)), L.blocks.map((b) => JSON.stringify(b)));   // layout index → old index
  const oToN = new Map<number, number>(); nToO.forEach((o, n) => { if (o >= 0) oToN.set(o, n); });
  const dToO = align(old.map(token), de.blocks.map(token));                                          // German index → old index

  // position of each German block in the layout sequence; unaligned blocks stay right after their predecessor
  const items: { pos: number; block: Block; lay: Lay }[] = [];
  let last = -1, lastLay: Lay = { r: null, c: null };
  de.blocks.forEach((b, k) => {
    const n = dToO[k]! >= 0 ? oToN.get(dToO[k]!) : undefined;
    if (n !== undefined) { last = n; lastLay = L.lay[n]!; items.push({ pos: n, block: b, lay: lastLay }); }
    else { unaligned++; items.push({ pos: last + 0.5, block: b, lay: lastLay }); }
  });
  L.blocks.forEach((b, n) => {
    const text = added.get(`${id}#${n}`);
    if (nToO[n]! < 0 && text) { inserted++; items.push({ pos: n, block: { t: b.t === 'h' ? 'h' : 'p', ...(b.t === 'h' ? { l: b.l } : {}), text }, lay: L.lay[n]! }); }
  });
  items.sort((a, b) => a.pos - b.pos);
  writeFileSync(join(out, f), JSON.stringify({ ...de, blocks: items.map((x) => x.block), lay: items.map((x) => x.lay) }, null, 1));
  pages++;
}
console.log(`${pages} pages merged, ${inserted} missing blocks inserted, ${unaligned} German blocks without a Dutch counterpart (kept in place)`);
