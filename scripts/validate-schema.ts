/**
 * JSON-LD validator over a built site (default: dist/).  Exit code 1 on any error.
 *   1. valid JSON, exactly one @graph per page            4. BreadcrumbList == visible breadcrumb
 *   2. every @id reference resolves                       5. Product sku == article number visible on the page
 *   3. required properties per type; no empty/null/TODO   6. (type-check against schema-dts happens at compile time: npm run check)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseHTML } from 'linkedom';

const root = join(process.cwd(), process.argv[2] ?? 'dist');
const errors: string[] = [];
const err = (page: string, msg: string) => errors.push(`${page}: ${msg}`);

const files: string[] = [];
(function walk(dir: string) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (f !== '_astro') walk(p); } else if (f.endsWith('.html')) files.push(p);
  }
})(root);

type Node = Record<string, any>;
interface PageData { rel: string; graph: Node[]; doc: Document; url?: string }
const pages: PageData[] = [];
const definedIds = new Set<string>();

for (const file of files) {
  const rel = '/' + relative(root, file).replace(/\\/g, '/').replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
  const { document } = parseHTML(readFileSync(file, 'utf8'));
  const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
  const blocks = [...document.querySelectorAll('script[type="application/ld+json"]')];
  if (rel === '/404' || (blocks.length === 0 && /noindex/.test(robots) && !rel.startsWith('/__fixtures__'))) continue; // error pages carry no schema by design
  if (blocks.length !== 1) { err(rel, `expected exactly one JSON-LD block, found ${blocks.length}`); continue; }
  let json: Node;
  try { json = JSON.parse(blocks[0]!.textContent ?? ''); } catch (e) { err(rel, `invalid JSON: ${(e as Error).message}`); continue; }
  if (json['@context'] !== 'https://schema.org' || !Array.isArray(json['@graph'])) { err(rel, 'missing @context or @graph array'); continue; }
  const graph = json['@graph'] as Node[];
  graph.forEach((n) => { if (typeof n['@id'] === 'string') definedIds.add(n['@id']); });
  pages.push({ rel, graph, doc: document, url: graph.find((n) => /Page$/.test(String(n['@type'])))?.url });
}

const typesOf = (n: Node): string[] => (Array.isArray(n['@type']) ? n['@type'] : [n['@type']]).map(String);
const has = (n: Node, k: string) => n[k] !== undefined && n[k] !== null && n[k] !== '';

/** Recursively reject empty, null, TODO and placeholder values. */
function scan(page: string, v: unknown, path: string) {
  if (v === null) { err(page, `null at ${path}`); return; }
  if (typeof v === 'string') {
    if (v.trim() === '') err(page, `empty string at ${path}`);
    if (/TODO|\[\[PLATZHALTER|PLACEHOLDER/i.test(v)) err(page, `placeholder text at ${path}: "${v.slice(0, 50)}"`);
  } else if (Array.isArray(v)) {
    if (v.length === 0) err(page, `empty array at ${path}`);
    v.forEach((x, i) => scan(page, x, `${path}[${i}]`));
  } else if (typeof v === 'object') {
    for (const [k, x] of Object.entries(v as Node)) scan(page, x, `${path}.${k}`);
  }
}

/** Collects { "@id": … } references (objects whose only key is @id). */
function refs(v: unknown, out: string[] = []): string[] {
  if (Array.isArray(v)) v.forEach((x) => refs(x, out));
  else if (v && typeof v === 'object') {
    const o = v as Node;
    if (Object.keys(o).length === 1 && typeof o['@id'] === 'string') out.push(o['@id']);
    else Object.values(o).forEach((x) => refs(x, out));
  }
  return out;
}

const REQUIRED: Record<string, string[]> = {
  Organization: ['name', 'url'],
  WebSite: ['url', 'name', 'inLanguage'],
  WebPage: ['url', 'name', 'isPartOf', 'breadcrumb'],
  CollectionPage: ['url', 'name', 'isPartOf', 'breadcrumb'],
  ContactPage: ['url', 'name', 'isPartOf', 'breadcrumb', 'mainEntity'],
  BreadcrumbList: ['itemListElement'],
  ItemList: ['itemListElement', 'numberOfItems'],
  FAQPage: ['mainEntity'],
  Brand: ['name'],
  ProductGroup: ['name', 'productGroupID', 'brand', 'manufacturer'],
  Product: ['name', 'sku', 'mpn', 'brand', 'manufacturer', 'isVariantOf'],
  Service: ['name', 'provider', 'areaServed'],
  Course: ['name', 'provider', 'inLanguage'],
  Article: ['headline', 'author', 'publisher'],
  TechArticle: ['headline', 'author', 'publisher'],
  BlogPosting: ['headline', 'author', 'publisher'],
  JobPosting: ['title', 'description', 'hiringOrganization'],
  AboutPage: ['url', 'name', 'isPartOf', 'breadcrumb', 'about'],
  DigitalDocument: ['name', 'url'],
};

for (const page of pages) {
  const { rel, graph, doc } = page;
  const local = new Set(graph.map((n) => n['@id']).filter(Boolean));
  const hostOk = (id: string) => local.has(id) || definedIds.has(id);

  graph.forEach((n, i) => scan(rel, n, `@graph[${i}]`));

  const kinds = new Set(graph.flatMap(typesOf));
  if (!kinds.has('BreadcrumbList')) err(rel, 'no BreadcrumbList');
  if (![...kinds].some((k) => /Page$|Product|Service|Course|Article|BlogPosting|CollectionPage|ProductGroup/.test(k))) err(rel, 'no page-type specific node');

  for (const n of graph) {
    for (const t of typesOf(n)) {
      // A manufacturer's website is only emitted when the client supplied it, so only the global Organization must carry a url.
      const required = (REQUIRED[t] ?? []).filter((k) => !(t === 'Organization' && /#manufacturer$/.test(String(n['@id'])) && k === 'url'));
      for (const key of required) if (!has(n, key)) err(rel, `${t}${n['@id'] ? ` (${n['@id']})` : ''} lacks required property "${key}"`);
    }
    if (typesOf(n).includes('Product')) {
      for (const bad of ['aggregateRating', 'review']) if (bad in n) err(rel, `Product must not carry ${bad}`);
      if (n.offers && (!has(n.offers, 'price') || !has(n.offers, 'priceCurrency'))) err(rel, 'Product.offers without real price');
      const visible = doc.querySelector('.product-id .num')?.textContent?.trim();
      if (!visible) err(rel, 'product page shows no article number');
      else if (n.sku !== visible) err(rel, `sku "${n.sku}" != visible article number "${visible}"`);
    }
    if (typesOf(n).includes('ItemList') && n.numberOfItems !== (n.itemListElement ?? []).length) err(rel, `ItemList numberOfItems ${n.numberOfItems} != ${(n.itemListElement ?? []).length}`);
    if (typesOf(n).includes('FAQPage')) (n.mainEntity ?? []).forEach((q: Node, i: number) => { if (!q.acceptedAnswer?.text) err(rel, `FAQ question ${i + 1} has no answer text`); });
    if (typesOf(n).includes('CollectionPage') && n.mainEntity?.['@id'] && !hostOk(n.mainEntity['@id'])) err(rel, 'CollectionPage.mainEntity unresolved');
    for (const r of refs(n)) if (!hostOk(r)) err(rel, `unresolved @id reference ${r}`);
  }

  // Every @id belongs to this page or is a global node
  for (const id of local) {
    const s = String(id);
    const base = s.split('#')[0]!;
    const isGlobal = /\/#(organization|website)$/.test(s);
    if (!isGlobal && page.url && base !== page.url) err(rel, `@id "${s}" does not belong to ${page.url}`);
  }

  // Breadcrumb == visible breadcrumb
  const bc = graph.find((n) => typesOf(n).includes('BreadcrumbList'));
  const visible = [...doc.querySelectorAll('nav.crumbs li')].map((li) => ({ name: li.textContent?.trim() ?? '', href: li.querySelector('a')?.getAttribute('href') ?? undefined }));
  if (bc) {
    const items = (bc.itemListElement ?? []) as Node[];
    if (visible.length === 0) {
      if (!(items.length === 1 && rel === '/')) err(rel, 'schema BreadcrumbList present but no visible breadcrumb');
    } else if (visible.length !== items.length) err(rel, `breadcrumb length: schema ${items.length} vs visible ${visible.length}`);
    else items.forEach((it, i) => {
      const v = visible[i]!;
      if (it.name !== v.name) err(rel, `breadcrumb ${i + 1} name: schema "${it.name}" vs visible "${v.name}"`);
      // With sub-path hosting the schema URLs carry the base path while the HTML is rebased later (scripts/rebase.ts).
      const basePath = (process.env.PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');
      const rawPath = it.item ? new URL(it.item).pathname : undefined;
      const want = rawPath && basePath && rawPath.startsWith(basePath) ? rawPath.slice(basePath.length) || '/' : rawPath;
      if ((want ?? undefined) !== (v.href ?? undefined)) err(rel, `breadcrumb ${i + 1} link: schema "${want}" vs visible "${v.href}"`);
      if (i === items.length - 1 && it.item) err(rel, 'last breadcrumb item must not carry a URL');
    });
  }

  // canonical == page url
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (page.url && canonical && canonical !== page.url && !/\/seite\/\d+$/.test(canonical)) err(rel, `canonical ${canonical} != WebPage.url ${page.url}`);
}

console.log(`validate-schema: ${pages.length} pages with JSON-LD checked in ${relative(process.cwd(), root)}/`);
if (errors.length) {
  console.error(`\n${errors.length} schema error(s):`);
  errors.slice(0, 60).forEach((e) => console.error('  ✗ ' + e));
  if (errors.length > 60) console.error(`  … and ${errors.length - 60} more`);
  process.exit(1);
}
console.log('validate-schema: 0 errors');
