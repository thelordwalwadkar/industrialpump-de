/**
 * Internal-linking engine. Every link on the site is derived from two things only:
 *   1. the folder tree (parent / children / siblings), and
 *   2. the shared vocabulary in taxonomy.ts (pump type, Branche, Anwendung) that connects series across brands.
 * Nothing is wired by hand, so a new brand, series or product is linked the moment it exists.
 * Links to planned topic pages (Pumpentypen, Branchen, Anwendungen) appear automatically once those stories exist.
 */
import type { PageBrand, PageProduct, PageSeries, PageStory, SbAsset } from './types';
import { pathOf, type Site } from './storyblok';
import { navTitle } from './breadcrumbs';
import { fmtValue } from './format';
import { withQuery } from './links';
import { APPLICATIONS, PUMP_TYPES, SEGMENTS, findTerm, termLabel, type TaxonomyTerm } from './taxonomy';

export interface LinkCard { title: string; href: string; text?: string; meta?: string; reason?: string; image?: SbAsset; kicker?: string; kind?: 'logo' }

type SeriesStory = PageStory<PageSeries>;
type BrandStory = PageStory<PageBrand>;
type ProductStory = PageStory<PageProduct>;

const isSeries = (s: PageStory): s is SeriesStory => s.content.component === 'page_series';
const isBrand = (s: PageStory): s is BrandStory => s.content.component === 'page_brand';
const isProduct = (s: PageStory): s is ProductStory => s.content.component === 'page_product';

export const ancestorOf = (site: Site, story: PageStory, test: (s: PageStory) => boolean): PageStory | undefined => {
  const parts = story.full_slug.split('/');
  for (let i = parts.length - 1; i >= 1; i--) { const hit = site.byFull.get(parts.slice(0, i).join('/')); if (hit && test(hit)) return hit; }
  return undefined;
};
export const brandOf = (site: Site, story: PageStory): BrandStory | undefined => (isBrand(story) ? story : (ancestorOf(site, story, isBrand) as BrandStory | undefined));
export const seriesOf = (site: Site, story: PageStory): SeriesStory | undefined => (isSeries(story) ? story : (ancestorOf(site, story, isSeries) as SeriesStory | undefined));
export const parentOf = (site: Site, story: PageStory): PageStory | undefined => {
  const parts = story.full_slug.split('/');
  for (let i = parts.length - 1; i >= 1; i--) { const hit = site.byFull.get(parts.slice(0, i).join('/')); if (hit) return hit; }
  return story.full_slug === 'home' ? undefined : site.byFull.get('home');
};

export const seriesChildren = (site: Site, brand: PageStory): SeriesStory[] => site.children(brand).filter(isSeries);
export const productChildren = (site: Site, series: PageStory): ProductStory[] => site.children(series).filter(isProduct);

/** "Förderstrom bis 240 m³/h · Förderhöhe bis 110 m" – only values that exist in the data. */
export function seriesRangeLine(s: PageSeries): string | undefined {
  const parts = [fmtValue(s.flow_max_m3h, 'm³/h') && `Förderstrom bis ${fmtValue(s.flow_max_m3h, 'm³/h')}`, fmtValue(s.head_max_m, 'm') && `Förderhöhe bis ${fmtValue(s.head_max_m, 'm')}`].filter(Boolean);
  return parts.length ? parts.join(' · ') : undefined;
}

export function cardFor(story: PageStory, site?: Site): LinkCard {
  const c = story.content;
  const base = { title: navTitle(story), href: pathOf(story) };
  if (c.component === 'page_series') return { ...base, title: `${c.series_name}-Serie`, text: c.use_case_line, meta: seriesRangeLine(c), image: c.image, kicker: site ? brandOf(site, story)?.content.brand_name : undefined };
  if (c.component === 'page_brand') { const n = site ? seriesChildren(site, story).length : 0; return { ...base, title: c.brand_name, text: c.intro && firstSentence(c.intro), meta: n ? `${n} ${n === 1 ? 'Serie' : 'Serien'}` : undefined, image: c.logo, kind: 'logo' as const }; }
  if (c.component === 'page_product') return { ...base, title: c.name, text: c.short_description && firstSentence(c.short_description), image: c.image };
  return { ...base, text: c.intro && firstSentence(c.intro) };
}
const firstSentence = (t: string): string => (t.match(/^[^.!?]+[.!?]/)?.[0] ?? t).trim();

export const childCards = (site: Site, story: PageStory): LinkCard[] => site.children(story).map((c) => cardFor(c, site));

/* ---------- related series (cross-brand, taxonomy-scored) ---------- */
function reasonFor(a: PageSeries, b: PageSeries): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  if (a.pump_type && a.pump_type === b.pump_type) { score += 3; reasons.push(`Pumpentyp: ${termLabel(PUMP_TYPES, a.pump_type)}`); }
  const apps = (a.applications ?? []).filter((x) => (b.applications ?? []).includes(x));
  if (apps.length) { score += 2 * apps.length; reasons.push(`Anwendung: ${apps.map((x) => termLabel(APPLICATIONS, x)).join(', ')}`); }
  const segs = (a.segments ?? []).filter((x) => (b.segments ?? []).includes(x));
  if (segs.length) { score += segs.length; reasons.push(`Branche: ${segs.map((x) => termLabel(SEGMENTS, x)).join(', ')}`); }
  return { score, reasons };
}

export function relatedSeries(site: Site, series: SeriesStory, opts: { scope: 'same-brand' | 'cross-brand'; max: number }): LinkCard[] {
  const myBrand = brandOf(site, series)?.full_slug;
  return site.pages
    .filter(isSeries)
    .filter((o) => o.full_slug !== series.full_slug && (brandOf(site, o)?.full_slug === myBrand) === (opts.scope === 'same-brand'))
    .map((o) => ({ o, ...reasonFor(series.content, o.content) }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || x.o.name.localeCompare(y.o.name, 'de', { numeric: true }))
    .slice(0, opts.max)
    .map(({ o, reasons }) => ({ ...cardFor(o, site), text: undefined, reason: reasons.join(' · '), meta: seriesRangeLine(o.content) }));
}

/** Same-series siblings, nearest motor power first. */
export function relatedProducts(site: Site, product: ProductStory, max = 3): LinkCard[] {
  const series = seriesOf(site, product);
  if (!series) return [];
  const p0 = Number(product.content.power_kw ?? NaN);
  return productChildren(site, series)
    .filter((p) => p.full_slug !== product.full_slug)
    .sort((a, b) => (Number.isNaN(p0) ? 0 : Math.abs(Number(a.content.power_kw ?? 1e9) - p0) - Math.abs(Number(b.content.power_kw ?? 1e9) - p0)) || a.name.localeCompare(b.name, 'de', { numeric: true }))
    .slice(0, max)
    .map((p) => cardFor(p, site));
}

/* ---------- taxonomy → topic pages (only when they exist) ---------- */
export interface TopicLink { term: TaxonomyTerm; kind: 'Pumpentyp' | 'Branche' | 'Anwendung'; exists: boolean }
export function topicLinksFor(site: Site, series: PageSeries): TopicLink[] {
  const out: TopicLink[] = [];
  const add = (list: TaxonomyTerm[], slug: string | undefined, kind: TopicLink['kind']) => { const t = slug && findTerm(list, slug); if (t) out.push({ term: t, kind, exists: site.has(t.path) }); };
  add(PUMP_TYPES, series.pump_type, 'Pumpentyp');
  (series.applications ?? []).forEach((s) => add(APPLICATIONS, s, 'Anwendung'));
  (series.segments ?? []).forEach((s) => add(SEGMENTS, s, 'Branche'));
  return out;
}

/** Aggregated Einsatzbereiche of all series of a brand (for the brand page). */
export function brandTopics(site: Site, brand: BrandStory): TopicLink[] {
  const seen = new Map<string, TopicLink>();
  for (const s of seriesChildren(site, brand)) for (const t of topicLinksFor(site, s.content)) seen.set(`${t.kind}:${t.term.slug}`, t);
  return [...seen.values()];
}

/* ---------- conversion ---------- */
export function quoteHref(site: Site, story: PageStory, anliegen?: 'neue-pumpe' | 'ersatzpumpe' | 'revision' | 'ersatzteile'): string {
  const brand = brandOf(site, story)?.content.brand_name;
  const series = seriesOf(site, story);
  const product = isProduct(story) ? story.content.article_number : undefined;
  return withQuery('/angebot', { anliegen, marke: brand, serie: series ? `${series.content.series_name}-Serie` : undefined, artikel: product });
}

/* ---------- catalogue-wide groupings ---------- */
/** All series grouped by pump type - the "Pumpe finden" entry point on the home page. Excludes fixtures. */
export function seriesByPumpType(site: Site): { term: TaxonomyTerm; series: LinkCard[] }[] {
  const all = site.pages.filter(isSeries).filter((s) => !s.full_slug.startsWith('__fixtures__'));
  return PUMP_TYPES.map((term) => ({
    term,
    series: all
      .filter((s) => s.content.pump_type === term.slug)
      .sort((a, b) => a.full_slug.localeCompare(b.full_slug, 'de', { numeric: true }))
      .map((s) => ({ ...cardFor(s, site), text: undefined })),
  })).filter((g) => g.series.length > 0);
}

/** Series of the catalogue that carry a given taxonomy tag (pump type, Branche or Anwendung) - used by topic pages. */
export function seriesWithTag(site: Site, tag: string): LinkCard[] {
  return site.pages.filter(isSeries)
    .filter((s) => s.content.pump_type === tag || (s.content.segments ?? []).includes(tag) || (s.content.applications ?? []).includes(tag))
    .map((s) => ({ ...cardFor(s, site), text: undefined }));
}

/** Other brands (siblings of a brand page) for lateral links. */
export function siblingBrands(site: Site, brand: BrandStory, max = 5): LinkCard[] {
  return site.pages.filter(isBrand).filter((b) => b.full_slug !== brand.full_slug && !b.full_slug.startsWith('__fixtures__')).slice(0, max).map((b) => cardFor(b, site));
}
