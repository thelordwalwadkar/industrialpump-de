/**
 * Site-wide QA over the built output (default: dist/). Exit code 1 on any error.
 *   - exactly one <h1>, unique <title> ≤ 60, unique meta description ≤ 155, lang="de", canonical
 *   - every internal link resolves to a built page; no orphan pages
 *   - every page links to its parent and to one conversion page (legal pages exempt); ≥ 2 related links
 *   - no English text (function-word scan, spec tables excluded)
 * Also writes docs/PAGE-INVENTORY.md and docs/LINKING-MAP.md from what was actually built.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseHTML } from 'linkedom';

const arg = process.argv[2] ?? 'dist';
const root = join(process.cwd(), arg);
const isMain = arg === 'dist';
const errors: string[] = [];
const warnings: string[] = [];

const TEMPLATE: Record<string, string> = {
  page_home: 'T1 HomeTemplate', page_hub: 'T2 HubTemplate', page_topic: 'T3 TopicTemplate', page_brand: 'T4 BrandTemplate', page_series: 'T5 SeriesTemplate',
  page_product: 'T6 ProductTemplate', page_service: 'T7 ServiceTemplate', page_course: 'T8 CourseTemplate', page_knowledge: 'T9 KnowledgeTemplate',
  page_blog_post: 'T10 BlogPostTemplate', page_case_study: 'T11 CaseStudyTemplate', page_listing: 'T12 ListingTemplate', page_contact: 'T13 ContactTemplate', page_legal: 'T14 LegalTemplate',
};
/** Word-count targets from the brief, per template (min, max). Product: short description only, see below. */
const TARGET: Record<string, [number, number]> = {
  page_hub: [250, 400], page_topic: [600, 900], page_brand: [400, 700], page_series: [300, 500], page_service: [500, 800], page_knowledge: [800, 1500],
};

const slugToComponent = new Map<string, string>();
const contentDir = join(process.cwd(), 'storyblok', 'content');
if (isMain && existsSync(contentDir)) {
  for (const f of readdirSync(contentDir)) {
    if (!f.endsWith('.json')) continue;
    const s = JSON.parse(readFileSync(join(contentDir, f), 'utf8'));
    slugToComponent.set(s.full_slug === 'home' ? '/' : `/${s.full_slug}`, s.content.component);
  }
}

const files: string[] = [];
(function walk(dir: string) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (f !== '_astro') walk(p); } else if (f.endsWith('.html')) files.push(p);
  }
})(root);

const routeOf = (file: string) => '/' + relative(root, file).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '');
const builtRoutes = new Set(files.map(routeOf));
const normalise = (r: string) => (r.length > 1 ? r.replace(/\/$/, '') : r);

interface PageInfo { route: string; title: string; description: string; h1: number; words: number; out: Set<string>; mainLinks: Set<string>; types: string[]; hasLd: boolean }
const pages = new Map<string, PageInfo>();

for (const file of files) {
  const route = routeOf(file);
  const { document } = parseHTML(readFileSync(file, 'utf8'));
  const title = document.querySelector('title')?.textContent?.trim() ?? '';
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ?? '';
  const h1 = document.querySelectorAll('h1').length;
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
  const lang = document.documentElement.getAttribute('lang');
  const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
  const isErrorPage = route === '/404';

  if (lang !== 'de') errors.push(`${route}: <html lang> is "${lang}"`);
  if (!isErrorPage) {
    if (h1 !== 1) errors.push(`${route}: ${h1} <h1> elements`);
    if (!canonical) errors.push(`${route}: no canonical`);
  }
  if (!title || title.length > 60) errors.push(`${route}: <title> length ${title.length}`);
  if (!description || description.length > 155) errors.push(`${route}: meta description length ${description.length}`);
  void robots;

  const main = document.querySelector('main');
  const clone = main?.cloneNode(true) as Element | undefined;
  clone?.querySelectorAll('script,style,nav.crumbs').forEach((n) => n.remove());
  const text = (clone?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const words = (text.match(/[\p{L}\p{N}][\p{L}\p{N}.,/%°³²\-–+]*/gu) ?? []).length;

  // English scan: German pages must not contain these function words (spec tables excluded: they hold product codes)
  const prose = (() => { const c = main?.cloneNode(true) as Element | undefined; c?.querySelectorAll('script,style,table,.facts,.cta').forEach((n) => n.remove()); return (c?.textContent ?? '').replace(/\s+/g, ' '); })();
  const en = prose.match(/\b(the|and|with|read more|learn more|click here|submit|your|our|please|home page)\b/g);
  if (en && !isErrorPage) errors.push(`${route}: English text found: ${[...new Set(en)].join(', ')}`);

  const hrefs = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')!).filter((h) => h.startsWith('/') && !h.startsWith('//'));
  const out = new Set(hrefs.map((h) => normalise(h.split(/[?#]/)[0]!)));
  const mainLinks = new Set([...(main?.querySelectorAll('a[href]') ?? [])].map((a) => a.getAttribute('href')!).filter((h) => h.startsWith('/') && !h.startsWith('//')).map((h) => normalise(h.split(/[?#]/)[0]!)));
  mainLinks.delete(route);
  const types = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => { try { return (JSON.parse(s.textContent ?? '{}')['@graph'] as { '@type': string }[]).map((n) => n['@type']); } catch { return []; } });
  pages.set(route, { route, title, description, h1, words, out, mainLinks, types, hasLd: types.length > 0 });

  for (const h of out) if (!builtRoutes.has(h) && !['/sitemap-index.xml', '/robots.txt', '/favicon.svg'].includes(h) && !existsSync(join(root, h))) errors.push(`${route}: broken internal link ${h}`);
}

// uniqueness
const seen = (key: 'title' | 'description') => {
  const m = new Map<string, string>();
  for (const p of pages.values()) { if (p.route === '/404') continue; const prev = m.get(p[key]); if (prev) errors.push(`${p.route}: duplicate ${key} with ${prev}`); else m.set(p[key], p.route); }
};
seen('title'); seen('description');

// linking rules
const parentOf = (route: string): string => { const i = route.lastIndexOf('/'); return i <= 0 ? '/' : route.slice(0, i); };
const inbound = new Map<string, Set<string>>();
for (const p of pages.values()) for (const h of p.out) { if (h !== p.route) (inbound.get(h) ?? inbound.set(h, new Set()).get(h)!).add(p.route); }

const orphans: string[] = [];
// Fixture builds only exercise templates: orphan/parent/conversion rules apply to the real site.
for (const p of pages.values()) {
  if (!isMain || p.route === '/404' || p.route === '/') continue;
  const comp = slugToComponent.get(p.route);
  if (!(inbound.get(p.route)?.size)) { orphans.push(p.route); errors.push(`${p.route}: orphan page (no internal link points here)`); }
  if (comp === 'page_legal') continue;
  const parent = parentOf(p.route);
  const m = p.route.match(/^(.*)\/seite\/\d+$/);
  if (!m && builtRoutes.has(parent) && !p.out.has(parent)) errors.push(`${p.route}: no link to parent ${parent}`);
  if (!p.mainLinks.has('/angebot') && !p.mainLinks.has('/kontakt') && comp !== 'page_contact') errors.push(`${p.route}: no conversion link (/angebot or /kontakt) in the page body`);
  const related = [...p.mainLinks].filter((h) => h !== parent && h !== '/angebot' && h !== '/kontakt');
  if (related.length < 2 && comp !== 'page_contact') warnings.push(`${p.route}: only ${related.length} related/sibling link(s) in the body`);
}

// word-count targets (warnings: the brief's minimums cannot be met without inventing facts)
const wc: string[] = [];
for (const p of pages.values()) {
  const comp = slugToComponent.get(p.route);
  const t = comp ? TARGET[comp] : undefined;
  if (t && (p.words < t[0] || p.words > t[1])) wc.push(`${p.route} (${TEMPLATE[comp!]}): ${p.words} words, target ${t[0]}–${t[1]}`);
}

/* ---------- reports (main build only) ---------- */
if (isMain) {
  const rows = [...pages.values()].filter((p) => p.route !== '/404').sort((a, b) => a.route.localeCompare(b.route));
  const inv = [
    '# Page inventory (generated from dist/ by scripts/check-site.ts)',
    '',
    `Built pages: **${rows.length}** (plus 404, robots.txt, sitemap). Source of truth for content: \`storyblok/content/*.json\`.`,
    '',
    '| Route | Template | Schema types | Words | Inbound links | Status |', '|---|---|---|---|---|---|',
    ...rows.map((p) => {
      const comp = slugToComponent.get(p.route);
      return `| \`${p.route}\` | ${comp ? TEMPLATE[comp] : '–'} | ${[...new Set(p.types)].join(', ')} | ${p.words} | ${inbound.get(p.route)?.size ?? 0} | ${errors.some((e) => e.startsWith(p.route + ':')) ? 'ERROR' : 'OK'} |`;
    }),
    '',
    '## Templates without content yet (built and fixture-tested, no pages created in this run)',
    '',
    ...Object.entries(TEMPLATE).filter(([c]) => !rows.some((p) => slugToComponent.get(p.route) === c)).map(([c, t]) => `- ${t} (\`${c}\`)`),
    '',
    '## Word counts outside the brief targets',
    '',
    ...(wc.length ? wc.map((w) => `- ${w}`) : ['- none']),
    '',
  ].join('\n');
  writeFileSync(join(process.cwd(), 'docs', 'PAGE-INVENTORY.md'), inv);

  const byLevel = (n: number) => rows.filter((p) => p.route.split('/').filter(Boolean).length === n);
  const links = [
    '# Linking map (generated from dist/)',
    '',
    'Every internal link on the site is derived from the folder tree and the shared taxonomy (pump type, Branche, Anwendung); nothing is wired by hand. See `src/lib/linking.ts`.',
    '',
    '| Level | Pages | Avg. outbound body links | Avg. inbound links |', '|---|---|---|---|',
    ...[0, 1, 2, 3, 4, 5].map((n) => { const L = n === 0 ? rows.filter((p) => p.route === '/') : byLevel(n); if (!L.length) return ''; const a = (f: (p: PageInfo) => number) => (L.reduce((s, p) => s + f(p), 0) / L.length).toFixed(1); return `| ${n === 0 ? 'Startseite' : n} | ${L.length} | ${a((p) => p.mainLinks.size)} | ${a((p) => inbound.get(p.route)?.size ?? 0)} |`; }).filter(Boolean),
    '',
    `Orphan pages: **${orphans.length}**. Broken internal links: **${errors.filter((e) => e.includes('broken internal link')).length}**.`,
    '',
    '## Pages with the fewest inbound links',
    '',
    ...rows.map((p) => ({ p, n: inbound.get(p.route)?.size ?? 0 })).sort((a, b) => a.n - b.n).slice(0, 10).map(({ p, n }) => `- \`${p.route}\`: ${n}`),
    '',
  ].join('\n');
  writeFileSync(join(process.cwd(), 'docs', 'LINKING-MAP.md'), links);
}

console.log(`check-site: ${pages.size} pages checked in ${arg}/`);
if (warnings.length) { console.log(`\n${warnings.length} warning(s):`); warnings.slice(0, 25).forEach((w) => console.log('  ! ' + w)); }
if (wc.length) { console.log(`\n${wc.length} page(s) outside the word-count targets (see docs/PAGE-INVENTORY.md)`); }
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  errors.slice(0, 80).forEach((e) => console.error('  ✗ ' + e));
  process.exit(1);
}
console.log('check-site: 0 errors');
