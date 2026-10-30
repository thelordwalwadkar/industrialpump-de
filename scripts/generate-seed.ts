/**
 * Builds the complete seed: storyblok/content/*.json (one story per page) from the catalogue workbooks + German copy.
 *   npm run content:generate
 * Scope of this run: structure pages, brand pages, series pages and ONE template product per series. No mass product import.
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { aggregate, loadCatalogue, type CatalogueProduct } from './lib/catalogue';
import { BRANDS, SERIES } from '../content-src/copy';
import { DESCRIPTION_MAX, TITLE_MAX } from '../src/lib/text';
import { configStory, conversionStories, homeStory, hubStories, legalStories } from './lib/pages';
import { nlStories } from './lib/nl-stories';
import { brandStory, productStory, seriesStory, wordCount, type SeedStory } from './lib/stories';

const outDir = join(process.cwd(), 'storyblok', 'content');
const { products, problems } = await loadCatalogue();
const errors: string[] = [];
const notes: string[] = [];

/** Sample product per series: the named one, unless its data carries a conflict - then the best clean alternative. */
function pickSample(key: string, named: string, list: CatalogueProduct[]): CatalogueProduct {
  const preferred = list.find((p) => p.name === named);
  const clean = (p: CatalogueProduct) => p.mapped.warnings.filter((w) => !w.startsWith('dimensions given')).length === 0;
  if (preferred && clean(preferred)) return preferred;
  const candidates = list.filter(clean).sort((a, b) => b.mapped.rows.length - a.mapped.rows.length);
  const best = candidates[0] ?? preferred ?? list[0]!;
  if (best !== preferred) notes.push(`${key}: sample "${named}" has data conflicts (${preferred?.mapped.warnings.join('; ') ?? 'not found'}) → used "${best.name}"`);
  return best;
}

const stories: SeedStory[] = [configStory(), homeStory(), ...hubStories(), ...conversionStories(), ...legalStories()];
BRANDS.forEach((b, i) => stories.push(brandStory(b, i + 1)));

const sampleLog: string[] = [];
SERIES.forEach((def, i) => {
  const list = products.filter((p) => p.seriesKey === def.key);
  if (!list.length) { errors.push(`series ${def.key}: no products in the workbook`); return; }
  const brand = BRANDS.find((b) => b.slug === def.brand)!;
  stories.push(seriesStory(def, aggregate(list), i + 1));
  const sample = pickSample(def.key, def.sample, list);
  stories.push(productStory(brand, def, sample));
  sampleLog.push(`${def.key} → ${sample.name} (${sample.mapped.rows.length} Datenzeilen, ${list.length} Artikel in der Serie)`);
});

/* ---------- pages migrated from industrialpumps.nl (translated) ---------- */
const nl = nlStories(new Map(stories.map((s) => [s.full_slug, s])));
stories.push(...nl.stories);
errors.push(...nl.report.errors);

/* ---------- validation (the seed must satisfy the success criteria before it is written) ---------- */
const titles = new Map<string, string>();
const descs = new Map<string, string>();
for (const s of stories) {
  const c = s.content as Record<string, any>;
  if (s.full_slug === 'config') continue;
  const t = String(c.seo_title ?? ''), d = String(c.seo_description ?? '');
  if (!t || t.length > TITLE_MAX) errors.push(`${s.full_slug}: seo_title length ${t.length}`);
  if (!d || d.length > DESCRIPTION_MAX) errors.push(`${s.full_slug}: seo_description length ${d.length}`);
  if (titles.has(t)) errors.push(`${s.full_slug}: duplicate seo_title with ${titles.get(t)}`); else titles.set(t, s.full_slug);
  if (descs.has(d)) errors.push(`${s.full_slug}: duplicate seo_description with ${descs.get(d)}`); else descs.set(d, s.full_slug);
  if (c.component === 'page_product') { const w = wordCount(c.short_description); if (w < 60 || w > 120) errors.push(`${s.full_slug}: short_description has ${w} words (60-120)`); }
}
if (errors.length) { console.error(`\n${errors.length} validation error(s):\n - ${errors.join('\n - ')}`); process.exit(1); }

/* ---------- write ---------- */
mkdirSync(outDir, { recursive: true });
for (const f of readdirSync(outDir)) if (f.endsWith('.json')) rmSync(join(outDir, f));
for (const s of stories) writeFileSync(join(outDir, `${s.full_slug.replace(/\//g, '__')}.json`), JSON.stringify(s, null, 2) + '\n');

/* ---------- docs derived from the seed ---------- */
const claims = SERIES.filter((s) => s.verify?.length);
writeFileSync(join(process.cwd(), 'docs', 'CLAIMS-TO-VERIFY.md'), [
  '# Aussagen aus der bestehenden Website, die vor Veröffentlichung geprüft werden müssen',
  '',
  'Die deutschen Serientexte wurden aus den bestehenden englischen Produkttexten übersetzt und sachlich gekürzt. Folgende Punkte wurden entweder bewusst **nicht übernommen** (Widerspruch zu den Produktdaten oder nicht belegt) oder sind **übernommen, aber vom Hersteller zu bestätigen**.',
  '',
  ...claims.flatMap((s) => [`## ${BRANDS.find((b) => b.slug === s.brand)!.name} ${s.name}-Serie`, '', ...s.verify!.map((v) => `- ${v}`), '']),
].join('\n'));

const placeholders = new Map<string, Set<string>>();
for (const s of stories) {
  const json = JSON.stringify(s.content);
  for (const m of json.matchAll(/\[\[PLATZHALTER: ([^\]]+)\]\]/g)) {
    const k = m[1]!.replace(/\s+(Lowara|SAER|Ebara|Flygt)(\s+\S+)?$/, ' [Marke/Serie]');
    (placeholders.get(k) ?? placeholders.set(k, new Set()).get(k)!).add(s.full_slug === 'home' ? '/' : `/${s.full_slug}`);
  }
}
writeFileSync(join(process.cwd(), 'docs', 'PLACEHOLDERS.md'), [
  '# Offene Kundenangaben (automatisch aus den Seed-Stories erzeugt)',
  '',
  'Jeder Platzhalter ist auf der Seite sichtbar markiert und wird in den strukturierten Daten übersprungen.',
  '',
  '| Angabe | Seiten |', '|---|---|',
  ...[...placeholders.entries()].sort().map(([k, v]) => `| ${k} | ${v.size > 4 ? `${v.size} Seiten (z. B. ${[...v].slice(0, 2).join(', ')})` : [...v].join(', ')} |`),
  '',
].join('\n'));

console.log(`${stories.length} stories written to storyblok/content/`);
console.log(`  brands ${BRANDS.length}, series ${SERIES.length}, template products ${SERIES.length}, static ${stories.length - BRANDS.length - SERIES.length * 2}`);
if (problems.length) console.log('catalogue notes:\n  - ' + problems.join('\n  - '));
if (notes.length) console.log('sample substitutions:\n  - ' + notes.join('\n  - '));
console.log('samples:\n  ' + sampleLog.join('\n  '));

/* ---------- migration reports ---------- */
const r = nl.report;
const NL = '\n';
const table = (rows: { page: string; text: string }[]) => ['| Seite | Aussage |', '|---|---|', ...rows.map((x) => `| ${x.page} | ${x.text.split('|').join('/')} |`)];
const doc = (file: string, lines: string[]) => writeFileSync(join(process.cwd(), 'docs', file), lines.join(NL) + NL);
doc('NL-CLAIMS-TO-VERIFY.md', ['# Aus industrialpumps.nl übernommene Aussagen: Freigabe nötig', '', 'Automatisch aus den Übersetzungsnotizen erzeugt. Jede Aussage wurde wortgetreu übersetzt; der Kunde muss bestätigen, dass sie für Deutschland gilt (Zertifikate, Händlerstatus, Referenzen, Zahlen).', '', ...table(r.claims)]);
doc('NL-SPECIFIC.md', ['# Niederlande-spezifische Angaben', '', 'Diese Angaben stehen im niederländischen Original und wurden übernommen, gelten aber ggf. nicht für Deutschland. Seiten, die komplett NL-spezifisch sind, sind auf noindex gesetzt.', '', ...table(r.nlSpecific)]);
doc('MIGRATION-REPORT.md', [
  '# Migrationsbericht (automatisch erzeugt)', '',
  `Übersetzte Seiten als Story: ${nl.stories.length}, an bestehende Seiten angehängt: ${r.appended.length}, bestehende Seiten ohne NL-Text: ${r.skippedExisting.length}, noch nicht übersetzt: ${r.missing.length}.`, '',
  '## Noch nicht übersetzt', ...r.missing.map((x) => `- ${x}`), '',
  '## An bestehende Seiten angehängt', ...r.appended.map((x) => `- ${x}`), '',
  '## Bestehende Seiten, NL-Text nicht übernommen', ...r.skippedExisting.map((x) => `- ${x}`), '',
  '## Links ohne deutsches Ziel (Link entfernt, Text bleibt)', ...r.unresolvedLinks.map((x) => `- ${x}`),
]);
console.log(`NL migration: ${nl.stories.length} new stories, ${r.appended.length} appended, ${r.missing.length} still missing, ${r.unresolvedLinks.length} unresolved links`);

