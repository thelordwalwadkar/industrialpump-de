/**
 * Extracts every non-webshop page of industrialpumps.nl listed in docs/REPLICATION-INVENTORY.csv into ordered content blocks.
 *   npx tsx scripts/nl/extract.ts            → content-src/nl/<id>.json  (+ image list)
 * Blocks: h (heading), p (paragraph, inline **bold** and [text](href)), list, table, img, faq, cta (button/link), form (flag only).
 * Navigation, footer, cookie/chat widgets and the contact-form tables are dropped.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';

const ORIGIN = 'https://industrialpumps.nl';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const outDir = join(process.cwd(), 'content-src', 'nl');
mkdirSync(outDir, { recursive: true });

export type Block =
  | { t: 'h'; l: number; text: string }
  | { t: 'p'; text: string }
  | { t: 'list'; ordered: boolean; items: string[] }
  | { t: 'table'; rows: string[][] }
  | { t: 'img'; src: string; alt: string }
  | { t: 'faq'; q: string; a: string }
  | { t: 'cta'; text: string; href: string }
  | { t: 'form' };

const rows = readFileSync(join(process.cwd(), 'docs', 'REPLICATION-INVENTORY.csv'), 'utf8').replace(/^﻿/, '').split(/\r?\n/).slice(1).filter(Boolean)
  .map((l) => l.slice(1, -1).split('";"'))
  .map(([path, type, template, schema, dePath, words, _inSitemap, status, note, title]) => ({ path: path!, type: type!, template: template!, schema: schema!, dePath: dePath!, words: Number(words), status: status!, note: note!, title: title! }))
  .filter((r) => r.status !== 'nicht übernehmen');

const clean = (s: string) => s.replace(/ /g, ' ').replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'svg', 'header', 'footer', 'nav', 'iframe', 'form', 'select', 'button', 'input', 'textarea']);
const SKIP_CLASS = /(cookie|searchbox|breadcrumb|language|chat|leadinfo|mc-header|formtable|cybot|skip-link)/i;
const NOISE_IMG = /(\/design\/|\/Structure\/|stars\.png|boog\.png|logosheader|ipg_logo|footerlogo|favicon|icon)/i;

/** Inline text with **bold** and [text](href) markup; <br> becomes a newline. */
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

function extract(html: string, path: string) {
  const { document } = parseHTML(html);
  const main = document.querySelector('main') ?? document.body;
  const blocks: Block[] = [];
  const push = (b: Block) => {
    const last = blocks[blocks.length - 1];
    if (last && JSON.stringify(last) === JSON.stringify(b)) return; // responsive markup repeats nodes
    blocks.push(b);
  };
  let hasForm = false;

  (function walk(el: Element) {
    for (const c of el.children) {
      const tag = c.tagName.toLowerCase();
      const cls = c.getAttribute('class') ?? '';
      if (tag === 'form' || /formtable/.test(cls)) { hasForm = true; continue; }
      // content headings live in <header class="cta-paragraph__header"> or <h1 class="cta-paragraph__header">: never skip those
      if (/cta-paragraph__(header|subheader)\b/.test(cls)) {
        const inner = c.querySelector('h1,h2,h3,h4,h5');
        const level = /^h[1-6]$/.test(tag) ? Number(tag[1]) : inner ? Number(inner.tagName[1]) : /subheader/.test(cls) ? 3 : 2;
        const text = clean(inline(c)); if (text) push({ t: 'h', l: level, text }); continue;
      }
      if (SKIP_TAGS.has(tag) || SKIP_CLASS.test(cls)) continue;
      if (/\bfaq__item\b/.test(cls)) {
        const q = clean(inline(c.querySelector('.faq__question, .faq__title') ?? c));
        const a = clean(inline(c.querySelector('.faq__content') ?? c));
        if (q && a) push({ t: 'faq', q, a });
        continue;
      }
      if (/^h[1-6]$/.test(tag)) { const text = clean(inline(c)); if (text) push({ t: 'h', l: Number(tag[1]), text }); continue; }
      if (/cta-paragraph__(header|subheader)\b/.test(cls) && !/^(p|ul|ol)$/.test(tag)) {
        const text = clean(inline(c)); if (text) push({ t: 'h', l: /subheader/.test(cls) ? 3 : 2, text }); continue;
      }
      if (tag === 'p') { const text = clean(inline(c)); if (text) push({ t: 'p', text }); continue; }
      if (tag === 'ul' || tag === 'ol') {
        const items = [...c.children].filter((x) => x.tagName.toLowerCase() === 'li').map((li) => clean(inline(li))).filter(Boolean);
        if (items.length) push({ t: 'list', ordered: tag === 'ol', items });
        continue;
      }
      if (tag === 'table') {
        const trs = [...c.querySelectorAll('tr')].map((tr) => [...tr.querySelectorAll('th,td')].map((td) => clean(inline(td))));
        const r = trs.filter((x) => x.some(Boolean));
        if (r.length) push({ t: 'table', rows: r });
        continue;
      }
      if (tag === 'img') { const src = imageSrc(c); if (src) push({ t: 'img', src, alt: clean(c.getAttribute('alt') ?? '') }); continue; }
      if (tag === 'a' && /\bbtn\b|cta-paragraph__btn/.test(cls + ' ' + (c.querySelector('[class*="btn"]')?.getAttribute('class') ?? ''))) {
        const text = clean(inline(c)); const href = c.getAttribute('href') ?? '';
        if (text && href && !href.startsWith('#') && !href.startsWith('javascript')) push({ t: 'cta', text, href });
        continue;
      }
      walk(c);
    }
  })(main);
  if (hasForm) blocks.push({ t: 'form' });

  const meta = (name: string, attr = 'name') => document.querySelector(`meta[${attr}="${name}"]`)?.getAttribute('content')?.trim() ?? '';
  const title = clean(document.querySelector('title')?.textContent ?? '');
  const h1 = blocks.find((b): b is Extract<Block, { t: 'h' }> => b.t === 'h' && b.l === 1)?.text ?? '';
  const words = blocks.reduce((s, b) => s + (b.t === 'h' || b.t === 'p' ? b.text.split(/\s+/).length : b.t === 'list' ? b.items.join(' ').split(/\s+/).length : b.t === 'faq' ? (b.q + ' ' + b.a).split(/\s+/).length : 0), 0);
  return { path, title, description: meta('description'), h1, ogImage: meta('og:image', 'property'), blocks, words };
}

const idOf = (p: string) => (p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '__'));

async function get(url: string): Promise<string> {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.ok) return await r.text();
    await new Promise((res) => setTimeout(res, 1500 * (i + 1)));
  }
  throw new Error(`fetch failed: ${url}`);
}

const images = new Set<string>();
const report: string[] = [];
let done = 0;
const queue = [...rows];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const r = queue.shift()!;
    try {
      const html = await get(ORIGIN + r.path);
      const page = extract(html, r.path);
      page.blocks.forEach((b) => { if (b.t === 'img') images.add(b.src); });
      writeFileSync(join(outDir, `${idOf(r.path)}.json`), JSON.stringify({ ...page, kind: r.type, template: r.template, schema: r.schema, dePath: r.dePath }, null, 1));
      report.push(`${page.words > 0 ? 'ok ' : 'EMPTY'} ${String(page.words).padStart(5)}w ${String(page.blocks.length).padStart(3)} blocks (inventory ${r.words}w) ${r.path}`);
    } catch (e) { report.push(`FAIL ${r.path} ${(e as Error).message}`); }
    done++;
  }
}));
writeFileSync(join(outDir, '_images.json'), JSON.stringify([...images].sort(), null, 1));
console.log(report.sort().join('\n'));
console.log(`\n${done} pages processed, ${images.size} distinct images referenced`);
