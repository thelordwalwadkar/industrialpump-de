/**
 * Batch product importer.
 *   npm run import:dry                 → validate EVERY row, write docs/import-report.md (default, touches nothing)
 *   npm run import:apply               → create/update stories in Storyblok (needs STORYBLOK_OAUTH_TOKEN + STORYBLOK_SPACE_ID)
 *   options: --batch=50  --limit=N  --series=lowara-diwa
 * Idempotent: a product is identified by its full_slug (brand/series/article) → existing stories are updated, never duplicated.
 * NOT run with --apply in the first build (see docs/PROGRESS.md).
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadCatalogue, type CatalogueProduct } from './lib/catalogue';
import { mapi, readConfig } from './lib/mapi';
import { BRANDS, SERIES } from '../content-src/copy';
import { productStory } from './lib/stories';
import { seriesSlug } from '../src/lib/slug';

const args = new Map(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k!, v ?? 'true']; }));
const apply = args.has('apply');
const batchSize = Number(args.get('batch') ?? 50);
const limit = args.has('limit') ? Number(args.get('limit')) : undefined;
const onlySeries = args.get('series');

const { products: all, problems } = await loadCatalogue();
let products = onlySeries ? all.filter((p) => p.seriesKey === onlySeries) : all;
if (limit) products = products.slice(0, limit);

/* ---------- validation ---------- */
interface Issue { row: number; product: string; level: 'error' | 'warning'; msg: string }
const issues: Issue[] = [];
const add = (p: CatalogueProduct, level: Issue['level'], msg: string) => issues.push({ row: p.row, product: `${p.name || '(no name)'} [${p.internalNumber}]`, level, msg });
const seenNumbers = new Map<string, CatalogueProduct>();
const seenSlugs = new Map<string, CatalogueProduct>();

for (const p of products) {
  p.problems.forEach((m) => add(p, 'error', m));
  if (p.internalNumber && seenNumbers.has(p.internalNumber)) add(p, 'error', `duplicate product number (also row ${seenNumbers.get(p.internalNumber)!.row})`);
  seenNumbers.set(p.internalNumber, p);
  const def = SERIES.find((s) => s.key === p.seriesKey);
  if (p.seriesKey && !def) add(p, 'error', `series "${p.seriesKey}" has no definition in content-src/copy.ts`);
  if (def) {
    const full = `${def.brand}/${seriesSlug(def.name)}/${p.slug}`;
    if (seenSlugs.has(full)) add(p, 'error', `URL not unique: /pumpen/marken/${full} (also row ${seenSlugs.get(full)!.row})`);
    seenSlugs.set(full, p);
  }
  if (!p.slug) add(p, 'error', 'slug is empty after slugify');
  const m = p.mapped;
  for (const w of m.warnings) {
    const level: Issue['level'] = 'warning'; // missing / conflicting spec values are warnings by rule: the row is simply omitted from the page
    add(p, level, w);
  }
  if (!p.imageSource) add(p, 'warning', 'no image path in the shop feed');
  const unit = m.rows.filter((r) => r.value_num !== undefined && Number.isNaN(r.value_num));
  if (unit.length) add(p, 'error', `non-numeric machine value in ${unit.map((r) => r.label).join(', ')}`);
}

/* ---------- report ---------- */
const errors = issues.filter((i) => i.level === 'error');
const warnings = issues.filter((i) => i.level === 'warning');
const kinds = new Map<string, number>();
for (const w of warnings) { const k = w.msg.replace(/"[^"]*"/g, '"…"').replace(/\(also row \d+\)/, '').replace(/:\s.*$/, ''); kinds.set(k, (kinds.get(k) ?? 0) + 1); }
const untranslated = new Map<string, number>();
for (const w of warnings) if (w.msg.startsWith('untranslated')) untranslated.set(w.msg, (untranslated.get(w.msg) ?? 0) + 1);

const perSeries = SERIES.map((s) => {
  const list = products.filter((p) => p.seriesKey === s.key);
  const complete = list.filter((p) => p.mapped.flow_max_m3h !== undefined && p.mapped.head_max_m !== undefined && p.mapped.power_kw !== undefined).length;
  return `| ${BRANDS.find((b) => b.slug === s.brand)!.name} ${s.name} | ${list.length} | ${complete} | ${list.filter((p) => issues.some((i) => i.row === p.row && i.level === 'warning')).length} |`;
});

const report = [
  '# Product import report',
  '',
  `Mode: **${apply ? 'APPLY' : 'dry run (nothing written)'}** · rows checked: **${products.length}** · batch size: ${batchSize}`,
  '',
  `- Blocking errors: **${errors.length}**`,
  `- Warnings (value omitted from page, never written as 0): **${warnings.length}** on ${new Set(warnings.map((w) => w.row)).size} rows`,
  `- Slug collisions resolved by appending the product number: **${problems.length}**`,
  '',
  '## Result per series',
  '',
  '| Series | Rows | With flow + head + power | Rows with warnings |', '|---|---|---|---|',
  ...perSeries,
  '',
  '## Warning types',
  '',
  ...[...kinds.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `- ${n} × ${k}`),
  '',
  '## Untranslated values (kept verbatim; add to scripts/lib/de-vocab.ts)',
  '',
  ...(untranslated.size ? [...untranslated.entries()].map(([k, n]) => `- ${k} (${n}×)`) : ['- none']),
  '',
  '## Slug collisions',
  '',
  ...(problems.length ? problems.map((p) => `- ${p}`) : ['- none']),
  '',
  '## Blocking errors',
  '',
  ...(errors.length ? errors.slice(0, 200).map((e) => `- row ${e.row} ${e.product}: ${e.msg}`) : ['- none']),
  '',
  '## Not imported by design',
  '',
  '- **Prices** (`ProductPrice` in the NL shop feed): validity, currency basis and VAT for the German market are unknown. No `offers` schema is produced until a real price is supplied.',
  '- **Marketing USPs** of the old shop (e.g. "Trustworthy", "Fast delivery"): unverifiable, not imported.',
  '- **HS code, country of origin, related-product ids**: not technical data; available in `inputs/` if needed later.',
  '- **Images**: only the old shop image path is stored in `image_source`; the files must be uploaded to Storyblok assets.',
  '',
].join('\n');
writeFileSync(join(process.cwd(), 'docs', 'import-report.md'), report);
console.log(`import: ${products.length} rows · ${errors.length} blocking errors · ${warnings.length} warnings → docs/import-report.md`);

if (errors.length) { console.error('Blocking errors present: fix them before --apply.'); process.exit(1); }
if (!apply) process.exit(0);

/* ---------- apply ---------- */
const cfg = readConfig();
if (!cfg) { console.error('--apply needs STORYBLOK_OAUTH_TOKEN and STORYBLOK_SPACE_ID.'); process.exit(1); }
const existing = new Map<string, number>();
for (let page = 1; ; page++) {
  const r = (await mapi(cfg, 'GET', `/stories?per_page=100&page=${page}&starts_with=pumpen/marken`)).stories as { id: number; full_slug: string }[];
  r.forEach((s) => existing.set(s.full_slug.replace(/\/$/, ''), s.id));
  if (r.length < 100) break;
}
let done = 0;
for (let i = 0; i < products.length; i += batchSize) {
  for (const p of products.slice(i, i + batchSize)) {
    const def = SERIES.find((s) => s.key === p.seriesKey)!;
    const brand = BRANDS.find((b) => b.slug === def.brand)!;
    const s = productStory(brand, def, p);
    const parent = existing.get(`pumpen/marken/${brand.slug}/${seriesSlug(def.name)}`);
    if (!parent) { console.error(`series folder missing for ${s.full_slug}: run npm run sb:seed first`); process.exit(1); }
    const payload = { story: { name: s.name, slug: s.slug, parent_id: parent, content: s.content }, publish: 0 }; // created as drafts
    const id = existing.get(s.full_slug);
    if (id) await mapi(cfg, 'PUT', `/stories/${id}`, payload); else await mapi(cfg, 'POST', '/stories', payload);
    done++;
  }
  console.log(`batch ${i / batchSize + 1}: ${done}/${products.length}`);
}
