/** Story builders: turn copy + catalogue data into Storyblok story JSON. Pure functions, shared by generate-seed.ts and import-products.ts. */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fmtNumber } from '../../src/lib/format';
import { fitSentences } from '../../src/lib/text';
import { seriesSlug, slugify } from '../../src/lib/slug';
import { BRANDS, PUMP_TYPE_NOTES, type BrandDef, type SeriesDef } from '../../content-src/copy';
import { keyFacts } from './spec-map';
import type { CatalogueProduct, SeriesAggregate } from './catalogue';

/* ---------- ids & rich text ---------- */
const hash = (s: string) => createHash('md5').update(s).digest('hex');
export const storyId = (fullSlug: string): number => parseInt(hash(fullSlug).slice(0, 8), 16);
export const uuidOf = (fullSlug: string): string => { const h = hash(fullSlug); return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`; };
const uidOf = (seed: string): string => hash(seed).slice(0, 12);

type Node = Record<string, unknown>;
const text = (t: string, marks?: Node[]): Node => ({ type: 'text', text: t, ...(marks ? { marks } : {}) });
export const para = (...c: (string | Node)[]): Node => ({ type: 'paragraph', content: c.map((x) => (typeof x === 'string' ? text(x) : x)) });
export const heading = (level: number, t: string): Node => ({ type: 'heading', attrs: { level }, content: [text(t)] });
export const bullets = (items: string[]): Node => ({ type: 'bullet_list', content: items.map((i) => ({ type: 'list_item', content: [para(i)] })) });
export const link = (t: string, href: string): Node => text(t, [{ type: 'link', attrs: { href, linktype: 'url' } }]);
export const doc = (...nodes: Node[]): Node => ({ type: 'doc', content: nodes });

export const storyLink = (fullSlug: string): Node => ({ fieldtype: 'multilink', linktype: 'story', id: uuidOf(fullSlug), cached_url: fullSlug, url: '' });
export const urlLink = (url: string): Node => ({ fieldtype: 'multilink', linktype: 'url', url, cached_url: url });

export interface SeedStory { id: number; uuid: string; name: string; slug: string; full_slug: string; position?: number; is_startpage?: boolean; content: Node }
export function story(fullSlug: string, name: string, content: Node, position?: number): SeedStory {
  return { id: storyId(fullSlug), uuid: uuidOf(fullSlug), name, slug: fullSlug.split('/').pop()!, full_slug: fullSlug, ...(position !== undefined ? { position } : {}), content };
}

/** Optimised local photo (public/img/products/<name>.webp, built by `npm run images`) from the old shop image path. */
export function productImage(sourcePath: string | undefined, alt: string): { filename: string; alt: string } | undefined {
  if (!sourcePath) return undefined;
  const rel = `/img/products/${basename(sourcePath).replace(/.[^.]+$/, '').toLowerCase()}.webp`;
  if (!existsSync(join(process.cwd(), 'public', rel))) throw new Error(`image missing: ${rel} (from ${sourcePath}) - run npm run images`);
  return { filename: rel, alt };
}

/* ---------- bloks ---------- */
const faqBlok = (seed: string, heading: string, qa: [string, string][]): Node => ({
  _uid: uidOf(seed), component: 'faq', heading,
  items: qa.map(([question, answer], i) => ({ _uid: uidOf(`${seed}-${i}`), component: 'faq_item', question, answer })),
});
const ctaBlok = (seed: string, heading: string, textLine: string, label: string, link: Node, variant: 'primary' | 'overhaul' = 'primary'): Node => ({
  _uid: uidOf(seed), component: 'cta_band', heading, text: textLine, button_label: label, button_link: link, variant,
});
export const wordCount = (s: string): number => (s.trim().match(/[\p{L}\p{N}][\p{L}\p{N}.,/%°³²\-–+]*/gu) ?? []).length;

/* ---------- brand ---------- */
export function brandStory(brand: BrandDef, position: number): SeedStory {
  const full = `pumpen/marken/${brand.slug}`;
  const faq: [string, string][] = [
    [`Sind Ersatzteile für ${brand.name}-Pumpen verfügbar?`, 'Das hängt von Serie, Baujahr und Ausführung ab. Senden Sie uns Typenschild oder ein Foto der Pumpe, dann prüfen wir die Verfügbarkeit.'],
    [`Kann ich eine ältere ${brand.name}-Serie durch ein aktuelles Modell ersetzen?`, 'Das ist je nach Serie möglich. Entscheidend sind Förderstrom, Förderhöhe, Anschlussmaße und Motordaten der vorhandenen Pumpe. Anhand des Typenschilds prüfen wir, welches Modell passt.'],
    [`Wie lang ist die Lieferzeit für ${brand.name}-Pumpen?`, `[[PLATZHALTER: Lieferzeit ${brand.name}]]`],
  ];
  return story(full, brand.name, {
    component: 'page_brand', brand_name: brand.name, h1: `${brand.name} Pumpen – Serien, Einsatzbereiche und Revision`, nav_title: brand.name,
    seo_title: brand.title, seo_description: brand.description, intro: brand.intro,
    ...(brand.parent ? { parent_company: brand.parent } : {}),
    body_text: doc(...brand.body.map((b) => para(b))),
    logo: { filename: `/img/brands/${brand.slug}.webp`, alt: brand.name },
    revision_text: brand.revision,
    faq: [faqBlok(`${full}-faq`, `Häufige Fragen zu ${brand.name}-Pumpen`, faq)],
  }, position);
}

/* ---------- series ---------- */
export function seriesStory(def: SeriesDef, agg: SeriesAggregate, position: number): SeedStory {
  const full = `pumpen/marken/${def.brand}/${seriesSlug(def.name)}`;
  const notes = PUMP_TYPE_NOTES[def.pumpType];
  const brand = BRANDS.find((b) => b.slug === def.brand)!;
  const name = `${def.name}-Serie`;
  const faq: [string, string][] = [
    [`Wie finde ich den passenden Artikel der ${name}?`, `Senden Sie uns das Typenschild Ihrer vorhandenen Pumpe oder Ihre Betriebsdaten: Förderstrom, Förderhöhe, Medium und Temperatur. Daraus ordnen wir den passenden Artikel der ${name} zu.`],
    [`Sind Ersatzteile und eine Revision für die ${name} möglich?`, `Ersatzteile und die Revision von ${brand.name}-Pumpen können Sie über das Angebotsformular anfragen. Welche Teile im Einzelfall verfügbar sind, hängt von Baujahr und Ausführung ab.`],
    [`Wie lang ist die Lieferzeit für Artikel der ${name}?`, `[[PLATZHALTER: Lieferzeit ${brand.name} ${def.name}]]`],
  ];
  const num = (n?: number) => (n === undefined ? undefined : n);
  return story(full, name, {
    component: 'page_series', series_name: def.name, h1: def.h1, nav_title: name,
    seo_title: def.title, seo_description: def.description, intro: def.intro,
    pump_type: def.pumpType, segments: def.segments, applications: def.applications,
    use_case_line: def.useCase, body_text: doc(...def.body.map((b) => para(b))), highlights: def.highlights.join('\n'),
    image_source: def.imageSource,
    image: productImage(def.imageSource, `${brand.name} ${name}`),
    ...(num(agg.flowMax) !== undefined ? { flow_max_m3h: agg.flowMax } : {}),
    ...(num(agg.headMax) !== undefined ? { head_max_m: agg.headMax } : {}),
    ...(num(agg.powerMin) !== undefined ? { power_min_kw: agg.powerMin } : {}),
    ...(num(agg.powerMax) !== undefined ? { power_max_kw: agg.powerMax } : {}),
    ...(num(agg.tempMax) !== undefined ? { temp_max_c: agg.tempMax } : {}),
    ...(agg.materials.length ? { materials: agg.materials.join(', ') } : {}),
    catalogue_count: agg.count,
    body: [{ _uid: uidOf(`${full}-notes`), component: 'rich_text', content: doc(heading(2, notes.heading), ...notes.paragraphs.map((p) => para(p)), bullets(notes.bullets)) }],
    faq: [faqBlok(`${full}-faq`, `Häufige Fragen zur ${name}`, faq)],
  }, position);
}

/* ---------- product ---------- */
export function productShortDescription(brand: BrandDef, series: SeriesDef, p: CatalogueProduct): string {
  const m = p.mapped;
  const parts: string[] = [];
  const power = m.power_kw !== undefined ? `eine Motorleistung von ${fmtNumber(m.power_kw, 2)} kW` : undefined;
  const flow = m.flow_max_m3h !== undefined ? `einen Förderstrom bis ${fmtNumber(m.flow_max_m3h)} m³/h` : undefined;
  const head = m.head_max_m !== undefined ? `eine Förderhöhe bis ${fmtNumber(m.head_max_m)} m` : undefined;
  const data = [power, flow, head].filter(Boolean) as string[];
  parts.push(`Die ${brand.name} ${p.name} ist eine ${series.typeShort} der ${series.name}-Serie für ${series.useShort}.`);
  parts.push(data.length ? `Laut Katalogdaten hat dieser Artikel ${data.length > 1 ? data.slice(0, -1).join(', ') + ' und ' + data[data.length - 1] : data[0]}.` : 'Technische Werte zu diesem Artikel nennen wir Ihnen auf Anfrage aus dem Datenblatt des Herstellers.');
  if (series.productNote) parts.push(series.productNote);
  parts.push(`Für die Auslegung im Bestand senden Sie uns Typenschild oder Betriebsdaten; wir prüfen, ob die ${p.name} Ihre Fördermenge und Förderhöhe abdeckt.`);
  parts.push('Maßgeblich sind die Angaben im Datenblatt des Herstellers.');
  let out = parts.join(' ');
  if (wordCount(out) < 60) out = out.replace('Maßgeblich sind', `Weitere Artikel und die Kennbereiche der ${series.name}-Serie finden Sie auf der Serienseite. Maßgeblich sind`);
  return out;
}

export function productSeoTitle(brand: BrandDef, series: SeriesDef, p: CatalogueProduct): string {
  const base = `${brand.name} ${p.name} – ${series.typeShort}`;
  const long = `${base} für ${series.useShort}`;
  return long.length <= 60 ? long : base.length <= 60 ? base : `${brand.name} ${p.name}`.slice(0, 60);
}

export function productStory(brand: BrandDef, series: SeriesDef, p: CatalogueProduct, position = 0): SeedStory {
  const full = `pumpen/marken/${brand.slug}/${seriesSlug(series.name)}/${p.slug}`;
  const m = p.mapped;
  const short = productShortDescription(brand, series, p);
  const dataLine = [m.power_kw !== undefined && `Motorleistung ${fmtNumber(m.power_kw, 2)} kW`, m.flow_max_m3h !== undefined && `Förderstrom bis ${fmtNumber(m.flow_max_m3h)} m³/h`, m.head_max_m !== undefined && `Förderhöhe bis ${fmtNumber(m.head_max_m)} m`].filter(Boolean).join(', ');
  const desc = fitSentences(`${brand.name} ${p.name}: ${series.typeShort} der ${series.name}-Serie${dataLine ? `. ${dataLine}` : ''}. Angebot anfordern.`, 155);
  const facts = keyFacts(m).map((f, i) => ({ _uid: uidOf(`${full}-kf-${i}`), component: 'key_fact', ...f, label: f.label.startsWith('Nennspannung') ? 'Spannung' : f.label }));
  return story(full, p.name, {
    component: 'page_product', article_number: p.name, name: p.name, nav_title: p.name,
    h1: `${brand.name} ${p.name} – ${series.typeShort} für ${series.useShort}`,
    seo_title: productSeoTitle(brand, series, p), seo_description: desc, intro: short.split('. ')[0]! + '.',
    short_description: short,
    ...(p.imageSource ? { image_source: p.imageSource, image: productImage(p.imageSource, `${brand.name} ${p.name}`) } : {}),
    internal_item_number: p.internalNumber,
    key_facts: facts,
    specs: m.rows.map((r, i) => ({ _uid: uidOf(`${full}-spec-${i}`), component: 'spec_row', group: r.group, label: r.label, value: r.value, ...(r.unit ? { unit: r.unit } : {}), ...(r.value_num !== undefined ? { value_num: r.value_num } : {}) })),
    ...(m.flow_max_m3h !== undefined ? { flow_max_m3h: m.flow_max_m3h } : {}),
    ...(m.head_max_m !== undefined ? { head_max_m: m.head_max_m } : {}),
    ...(m.power_kw !== undefined ? { power_kw: m.power_kw } : {}),
    ...(m.voltage ? { voltage: m.voltage } : {}),
    ...(m.material ? { material: m.material } : {}),
  }, position);
}

/* ---------- misc ---------- */
export { ctaBlok, faqBlok, slugify };
