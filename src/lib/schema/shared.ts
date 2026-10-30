import type { BreadcrumbList, FAQPage, Graph, ImageObject, ItemList, Organization, Thing, WebPage, WebSite } from 'schema-dts';
import type { CrumbItem, Faq, PageStory, SbAsset } from '../types';
import { absoluteUrl, pathOf, type Site } from '../storyblok';
import { crumbsFor } from '../breadcrumbs';
import { buildSeo } from '../seo';
import { hasPlaceholder } from '../format';

export interface Ctx {
  site: Site;
  story: PageStory;
  path: string;
  url: string;
  h1: string;
  description: string;
  crumbs: CrumbItem[];
  /** Stable @id for a node of this page: `{url}#fragment`. */
  id: (fragment: string) => string;
  /** Stable @id of a node on another (existing) page. */
  idOf: (path: string, fragment: string) => string;
}
export interface BuilderResult {
  /** schema.org subtype of the page node; defaults to WebPage. */
  pageType?: 'WebPage' | 'CollectionPage' | 'ContactPage' | 'AboutPage';
  pageExtra?: Record<string, unknown>;
  nodes?: Thing[];
}
export type Builder = (ctx: Ctx) => BuilderResult;

export const globalIds = (siteUrl: string) => ({ organization: `${siteUrl}/#organization`, website: `${siteUrl}/#website` });

export function makeCtx(site: Site, story: PageStory): Ctx {
  const path = pathOf(story);
  const url = absoluteUrl(path);
  const seo = buildSeo(site, story);
  return {
    site, story, path, url,
    h1: story.content.h1 || story.name,
    description: seo.description,
    crumbs: crumbsFor(site, story),
    id: (fragment) => `${url}#${fragment}`,
    idOf: (p, fragment) => `${absoluteUrl(p)}#${fragment}`,
  };
}

/** Removes unknown values: undefined, null, '', empty arrays/objects and anything still holding an editor placeholder. */
export function clean<T>(value: T): T {
  const walk = (v: unknown): unknown => {
    if (v === undefined || v === null) return undefined;
    if (typeof v === 'string') return v.trim() === '' || hasPlaceholder(v) ? undefined : v;
    if (Array.isArray(v)) { const a = v.map(walk).filter((x) => x !== undefined); return a.length ? a : undefined; }
    if (typeof v === 'object') {
      const o = Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, walk(x)]).filter(([, x]) => x !== undefined));
      const keys = Object.keys(o);
      // an object that only carries '@type' (or nothing) says nothing → drop
      return keys.length === 0 || (keys.length === 1 && keys[0] === '@type') ? undefined : o;
    }
    return v;
  };
  return (walk(value) ?? {}) as T;
}

export const imageObject = (asset: SbAsset, url: string): ImageObject | undefined =>
  asset?.filename ? { '@type': 'ImageObject', '@id': `${url}#primaryimage`, url: asset.filename, ...(asset.alt ? { caption: asset.alt } : {}) } : undefined;

/** Local assets (/img/…) become absolute URLs; Storyblok assets are already absolute. */
export const assetUrl = (siteUrl: string, f?: string): string | undefined => (f ? (f.startsWith('/') ? `${siteUrl}${f}` : f) : undefined);

const lines = (s?: string): string[] => (s ?? '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);

export function organizationNode(site: Site): Organization {
  const c = site.config;
  const ids = globalIds(site.siteUrl);
  const hasAddress = c.street && c.city && !hasPlaceholder(c.street) && !hasPlaceholder(c.city);
  return clean({
    '@type': 'Organization',
    '@id': ids.organization,
    name: c.site_name,
    legalName: c.legal_name,
    url: `${site.siteUrl}/`,
    logo: assetUrl(site.siteUrl, c.logo?.filename),
    email: c.email,
    vatID: c.vat_id,
    address: hasAddress ? { '@type': 'PostalAddress', streetAddress: c.street, postalCode: c.postal_code, addressLocality: c.city, addressCountry: c.country_code ?? 'DE' } : undefined,
    contactPoint: c.phone && !hasPlaceholder(c.phone) ? { '@type': 'ContactPoint', telephone: c.phone, contactType: 'sales', areaServed: 'DE', availableLanguage: 'de' } : undefined,
    sameAs: lines(c.social),
  }) as Organization;
}

export const websiteNode = (site: Site): WebSite => ({
  '@type': 'WebSite',
  '@id': globalIds(site.siteUrl).website,
  url: `${site.siteUrl}/`,
  name: site.config.site_name,
  inLanguage: 'de-DE',
  publisher: { '@id': globalIds(site.siteUrl).organization },
});

export function breadcrumbNode(ctx: Ctx): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    '@id': ctx.id('breadcrumb'),
    itemListElement: ctx.crumbs.map((c, i, all) => ({
      '@type': 'ListItem' as const,
      position: i + 1,
      name: c.name,
      // the current page is the last crumb: no `item`
      ...(i < all.length - 1 ? { item: absoluteUrl(c.path) } : {}),
    })),
  };
}

export function webPageNode(ctx: Ctx, r: BuilderResult): WebPage {
  const s = ctx.story;
  return clean({
    '@type': r.pageType ?? 'WebPage',
    '@id': ctx.id('webpage'),
    url: ctx.url,
    name: ctx.h1,
    description: ctx.description,
    inLanguage: 'de-DE',
    isPartOf: { '@id': globalIds(ctx.site.siteUrl).website },
    breadcrumb: { '@id': ctx.id('breadcrumb') },
    datePublished: s.first_published_at ?? s.created_at,
    dateModified: s.published_at ?? s.updated_at,
    ...r.pageExtra,
  }) as WebPage;
}

export function faqNode(ctx: Ctx, faqs: Faq[] | undefined): FAQPage | undefined {
  const inBody = ((ctx.story.content as { body?: { component: string }[] }).body ?? []).filter((b): b is Faq => b.component === 'faq');
  const items = [...(faqs ?? []), ...inBody].flatMap((f) => f.items ?? []).filter((i) => i.question && i.answer && !hasPlaceholder(i.answer));
  if (!items.length) return undefined;
  return {
    '@type': 'FAQPage',
    '@id': ctx.id('faq'),
    mainEntity: items.map((i) => ({ '@type': 'Question' as const, name: i.question, acceptedAnswer: { '@type': 'Answer' as const, text: i.answer } })),
  };
}

export function itemListNode(ctx: Ctx, fragment: string, items: { name: string; path: string }[]): ItemList | undefined {
  if (!items.length) return undefined;
  return {
    '@type': 'ItemList',
    '@id': ctx.id(fragment),
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem' as const, position: i + 1, name: it.name, url: absoluteUrl(it.path) })),
  };
}

/** Final per-page graph: Organization + WebSite (full nodes on the home page, references elsewhere), page node, breadcrumb, template nodes. */
export function assembleGraph(ctx: Ctx, r: BuilderResult, includeGlobals: boolean): Graph {
  const own = r.nodes ?? [];
  const hasFaq = own.some((n) => [(n as { '@type'?: unknown } | undefined)?.['@type']].flat().includes('FAQPage'));
  const nodes = [
    ...(includeGlobals ? [organizationNode(ctx.site), websiteNode(ctx.site)] : []),
    webPageNode(ctx, r),
    breadcrumbNode(ctx),
    ...own,
    ...(hasFaq ? [] : [faqNode(ctx, undefined)]),
  ].filter((n): n is Thing => Boolean(n));
  return { '@context': 'https://schema.org', '@graph': nodes.map((n) => clean(n)) as Thing[] } as Graph;
}
