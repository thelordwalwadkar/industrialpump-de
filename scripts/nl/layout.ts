/**
 * Records the page layout of industrialpumps.nl (rows, columns, carousels, icons) for every migrated page, so the German
 * pages can be laid out like the originals. Block extraction is identical to extract.ts; each block additionally gets
 * the row and column it sits in.
 *   npx tsx scripts/nl/layout.ts   → content-src/nl-layout/<id>.json  { blocks, lay: [{ r, c }], rows: { r: { kind, cls, cols: { c: { icon } } } } }
 * Also prints a coverage report: visible text of the live page that is NOT in the extracted blocks.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';

const ORIGIN = 'https://industrialpumps.nl';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const outDir = join(process.cwd(), 'content-src', 'nl-layout');
mkdirSync(outDir, { recursive: true });

type Block = Record<string, unknown> & { t: string };
type Ctx = { r: number | null; c: number | null };
interface Row { kind: 'row' | 'grid' | 'carousel'; cls: string; cols: Record<number, { icon?: string }> }

const slugMap = JSON.parse(readFileSync(join(process.cwd(), 'content-src', 'slug-map.json'), 'utf8')) as Record<string, { de?: string }>;
const only = process.argv.slice(2);
const paths = only.length ? only : Object.entries(slugMap).filter(([, v]) => v.de).map(([k]) => k);
const idOf = (p: string) => (p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '__'));

const clean = (s: string) => s.replace(/ /g, ' ').replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'svg', 'header', 'footer', 'nav', 'iframe', 'form', 'select', 'button', 'input', 'textarea']);
const SKIP_CLASS = /(cookie|searchbox|breadcrumb|language|chat|leadinfo|mc-header|formtable|cybot|skip-link)/i;
const NOISE_IMG = /(\/design\/|\/Structure\/|stars\.png|boog\.png|logosheader|ipg_logo|footerlogo|favicon|icon)/i;
const hasClass = (cls: string, name: string) => cls.split(/\s+/).includes(name);
const INLINE = new Set(['a', 'strong', 'b', 'em', 'i', 'span', 'u', 'sup', 'sub', 'br', 'small', 'mark', 'font']);

function inline(el: Element): string {
  let out = '';
  for (const n of el.childNodes) {
    if (n.nodeType === 3) { out += n.textContent ?? ''; continue; }
    if (n.nodeType !== 1) continue;
    const e = n as Element; const tag = e.tagName.toLowerCase();
    if (SKIP_TAGS.has(tag)) continue;
    if (tag === 'br') out += '\n';
    else if (tag === 'a') { const t = clean(inline(e)); const h = e.getAttribute('href') ?? ''; out += t && h && !h.startsWith('#') && !h.startsWith('javascript') ? `[${t}](${h})` : t; }
    else if (tag === 'strong' || tag === 'b') { const t = clean(inline(e)); out += t ? `**${t}**` : ''; }
    else out += inline(e);
  }
  return out;
}
function imageSrc(img: Element): string | undefined {
  const raw = img.getAttribute('src') ?? img.getAttribute('data-src') ?? '';
  const m = /Image=([^&]+)/.exec(raw);
  const p = decodeURIComponent(m ? m[1]! : raw);
  if (!p || p.startsWith('data:') || NOISE_IMG.test(p)) return undefined;
  return p.startsWith('/') ? p : undefined;
}

function extract(html: string) {
  const { document } = parseHTML(html);
  const main = document.querySelector('main') ?? document.body;
  const blocks: Block[] = []; const lay: Ctx[] = []; const rows: Record<number, Row> = {};
  let rowN = 0, colN = 0;
  const push = (b: Block, ctx: Ctx) => {
    const last = blocks[blocks.length - 1];
    if (last && JSON.stringify(last) === JSON.stringify(b)) return;
    blocks.push(b); lay.push({ ...ctx });
  };
  (function walk(el: Element, ctx: Ctx) {
    // Text that sits directly in a container (no <p>) is collected as a paragraph, so no visible text is lost.
    let run = '';
    const flush = () => {
      const t = clean(run); run = '';
      if (t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length >= 2) push({ t: 'p', text: t }, ctx);
    };
    for (const node of el.childNodes) {
      if (node.nodeType === 3) { run += node.textContent ?? ''; continue; }
      if (node.nodeType !== 1) continue;
      const c = node as Element;
      const tag = c.tagName.toLowerCase();
      const cls = c.getAttribute('class') ?? '';
      const isBtn = tag === 'a' && /\bbtn\b|cta-paragraph__btn/.test(cls + ' ' + (c.querySelector('[class*="btn"]')?.getAttribute('class') ?? ''));
      if (INLINE.has(tag) && !isBtn && !SKIP_CLASS.test(cls) && !/cta-paragraph__(header|subheader)/.test(cls) && !c.querySelector('p,h1,h2,h3,h4,h5,h6,ul,ol,table,img,div,section,article,figure')) {
        run += inline({ childNodes: [c] } as unknown as Element);
        continue;
      }
      flush();
      let here = ctx;
      // a row is the outermost layout container; nested containers inside a column stay in that column
      if (ctx.r === null && (hasClass(cls, 'multicolumn') || hasClass(cls, 'AdvancedGrid'))) {
        const r = ++rowN;
        rows[r] = { kind: c.querySelector('.carousel') || /carousel/.test(cls) ? 'carousel' : hasClass(cls, 'AdvancedGrid') ? 'grid' : 'row', cls: cls.replace(/\S*--\d+\S*/g, '').replace(/\s+/g, ' ').trim(), cols: {} };
        here = { r, c: null };
      } else if (ctx.r !== null && ctx.c === null && (hasClass(cls, 'multicolumn__item') || hasClass(cls, 'AdvancedGrid__column'))) {
        const col = ++colN; rows[ctx.r]!.cols[col] = {};
        const icon = c.querySelector('.cta-paragraph__icon i');
        if (icon) rows[ctx.r]!.cols[col]!.icon = (icon.getAttribute('class') ?? '').split(/\s+/).find((x) => x.startsWith('fa-')) ?? undefined;
        here = { r: ctx.r, c: col };
      }
      if (tag === 'form' || /formtable/.test(cls)) continue;
      if (/cta-paragraph__(header|subheader)\b/.test(cls)) {
        const inner = c.querySelector('h1,h2,h3,h4,h5');
        const level = /^h[1-6]$/.test(tag) ? Number(tag[1]) : inner ? Number(inner.tagName[1]) : /subheader/.test(cls) ? 3 : 2;
        const text = clean(inline(c)); if (text) push({ t: 'h', l: level, text }, here); continue;
      }
      if (SKIP_TAGS.has(tag) || SKIP_CLASS.test(cls)) continue;
      if (/\bfaq__item\b/.test(cls)) {
        const q = clean(inline(c.querySelector('.faq__question, .faq__title') ?? c));
        const a = clean(inline(c.querySelector('.faq__content') ?? c));
        if (q && a) push({ t: 'faq', q, a }, here);
        continue;
      }
      if (/^h[1-6]$/.test(tag)) { const text = clean(inline(c)); if (text) push({ t: 'h', l: Number(tag[1]), text }, here); continue; }
      if (tag === 'p') { const text = clean(inline(c)); if (text) push({ t: 'p', text }, here); continue; }
      if (tag === 'ul' || tag === 'ol') {
        const items = [...c.children].filter((x) => x.tagName.toLowerCase() === 'li').map((li) => clean(inline(li))).filter(Boolean);
        if (items.length) push({ t: 'list', ordered: tag === 'ol', items }, here);
        continue;
      }
      if (tag === 'table') {
        const trs = [...c.querySelectorAll('tr')].map((tr) => [...tr.querySelectorAll('th,td')].map((td) => clean(inline(td))));
        const r = trs.filter((x) => x.some(Boolean));
        if (r.length) push({ t: 'table', rows: r }, here);
        continue;
      }
      if (tag === 'img') { const src = imageSrc(c); if (src) push({ t: 'img', src, alt: clean(c.getAttribute('alt') ?? '') }, here); continue; }
      if (tag === 'a' && /\bbtn\b|cta-paragraph__btn/.test(cls + ' ' + (c.querySelector('[class*="btn"]')?.getAttribute('class') ?? ''))) {
        const text = clean(inline(c)); const href = c.getAttribute('href') ?? '';
        if (text && href && !href.startsWith('#') && !href.startsWith('javascript')) push({ t: 'cta', text, href }, here);
        continue;
      }
      walk(c, here);
    }
    flush();
  })(main, { r: null, c: null });

  // coverage: every visible text leaf of the content area must appear in the extracted text
  document.querySelectorAll('script,style,noscript,svg,header,footer,nav,form,button,select,textarea').forEach((n) => n.remove());
  main.querySelectorAll('*').forEach((n) => { const cls = n.getAttribute('class') ?? ''; if (SKIP_CLASS.test(cls) || /formtable/.test(cls)) n.remove(); });
  const norm = (s: string) => s.replace(/\*\*|\[|\]\([^)]*\)/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().toLowerCase();
  const have = norm(blocks.map((b) => [b.text, b.q, b.a, ...(Array.isArray(b.items) ? b.items : []), ...(Array.isArray(b.rows) ? (b.rows as string[][]).flat() : [])].filter(Boolean).join(' ')).join(' '));
  const missing = new Set<string>();
  const walker = document.createTreeWalker(main, 4);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = norm(n.textContent ?? '');
    if (t.split(' ').length >= 3 && !have.includes(t)) missing.add((n.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 140));
  }
  return { blocks, lay, rows, missing: [...missing] };
}

async function get(url: string): Promise<string> {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.ok) return await r.text();
    await new Promise((res) => setTimeout(res, 1500 * (i + 1)));
  }
  throw new Error(`fetch failed: ${url}`);
}

const report: string[] = [];
const queue = [...paths];
let changed = 0;
await Promise.all(Array.from({ length: only.length ? 1 : 2 }, async () => {
  while (queue.length) {
    const p = queue.shift()!;
    try {
      const page = extract(await get(ORIGIN + p));
      const stored = JSON.parse(readFileSync(join(process.cwd(), 'content-src', 'nl', `${idOf(p)}.json`), 'utf8')) as { blocks: Block[] };
      const same = JSON.stringify(stored.blocks) === JSON.stringify(page.blocks);
      if (!same) changed++;
      writeFileSync(join(outDir, `${idOf(p)}.json`), JSON.stringify({ path: p, same, ...page }, null, 1));
      const nRows = Object.keys(page.rows).length;
      const multi = Object.values(page.rows).filter((r) => Object.keys(r.cols).length > 1).length;
      report.push(`${same ? '   ' : 'CHG'} rows ${String(nRows).padStart(3)} (multi-col ${String(multi).padStart(2)}) missing ${String(page.missing.length).padStart(2)}  ${p}${page.missing.length ? '\n      - ' + page.missing.slice(0, 6).join('\n      - ') : ''}`);
    } catch (e) { report.push(`FAIL ${p} ${(e as Error).message}`); }
  }
}));
writeFileSync(join(outDir, '_report.txt'), report.sort().join('\n'));
console.log(`${paths.length} pages, ${changed} changed since the first extraction; report: content-src/nl-layout/_report.txt`);
