/**
 * Compares the layout extraction (content-src/nl-layout) with the blocks that were translated (content-src/nl) and lists
 * the blocks that are new (text the first extraction missed).
 *   npx tsx scripts/nl/new-blocks.ts → content-src/nl-layout/_new-blocks.json  [{ id, index, block, prev }]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type Block = Record<string, unknown> & { t: string };
const dir = join(process.cwd(), 'content-src');
const key = (b: Block) => JSON.stringify(b);

/** Longest-common-subsequence alignment; returns for every index of `b` the matching index in `a` (or -1). */
export function align(a: string[], b: string[]): number[] {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
  const map = new Array<number>(m).fill(-1);
  for (let i = 0, j = 0; i < n && j < m;) {
    if (a[i] === b[j]) { map[j] = i; i++; j++; } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) i++; else j++;
  }
  return map;
}

if (process.argv[1]?.endsWith('new-blocks.ts')) {
  const out: { id: string; index: number; block: Block; prev: Block | null }[] = [];
  const dropped: { id: string; block: Block }[] = [];
  for (const f of readdirSync(join(dir, 'nl-layout')).filter((x) => x.endsWith('.json') && !x.startsWith('_'))) {
    const id = f.replace(/\.json$/, '');
    const now = (JSON.parse(readFileSync(join(dir, 'nl-layout', f), 'utf8')) as { blocks: Block[] }).blocks;
    const old = (JSON.parse(readFileSync(join(dir, 'nl', f), 'utf8')) as { blocks: Block[] }).blocks.filter((b) => b.t !== 'form');
    const map = align(old.map(key), now.map(key));
    map.forEach((m, j) => { if (m < 0) out.push({ id, index: j, block: now[j]!, prev: j > 0 ? now[j - 1]! : null }); });
    const used = new Set(map.filter((m) => m >= 0));
    old.forEach((b, i) => { if (!used.has(i)) dropped.push({ id, block: b }); });
  }
  writeFileSync(join(dir, 'nl-layout', '_new-blocks.json'), JSON.stringify(out, null, 1));
  const words = out.reduce((s, x) => s + JSON.stringify(x.block).split(/\s+/).length, 0);
  console.log(`${out.length} new blocks on ${new Set(out.map((x) => x.id)).size} pages (~${words} words); ${dropped.length} old blocks no longer on the live site`);
  for (const d of dropped.slice(0, 10)) console.log('  gone:', d.id, JSON.stringify(d.block).slice(0, 120));
}
