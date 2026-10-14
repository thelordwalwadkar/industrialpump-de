import type { Brand, Organization } from 'schema-dts';
import type { PageBrand } from '../types';
import { assetUrl, clean, faqNode, itemListNode, type Builder } from './shared';
import { seriesChildren } from '../linking';
import { navTitle } from '../breadcrumbs';
import { pathOf } from '../storyblok';

const lines = (s?: string) => (s ?? '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);

/**
 * T4: CollectionPage whose `about` is the manufacturer Organization (#manufacturer) + Brand + ItemList of series.
 * No authorised-dealer or partnership claim is ever emitted from here.
 */
export const buildBrand: Builder = (ctx) => {
  const c = ctx.story.content as PageBrand;
  const manufacturer: Organization = clean({
    '@type': 'Organization',
    '@id': ctx.id('manufacturer'),
    name: c.brand_name,
    url: c.manufacturer_url,
    sameAs: lines(c.same_as),
    parentOrganization: c.parent_company ? { '@type': 'Organization', name: c.parent_company, url: c.parent_company_url } : undefined,
  });
  const brand: Brand = clean({ '@type': 'Brand', '@id': ctx.id('brand'), name: c.brand_name, logo: assetUrl(ctx.site.siteUrl, c.logo?.filename), url: c.manufacturer_url });
  const series = itemListNode(ctx, 'itemlist', seriesChildren(ctx.site, ctx.story).map((s) => ({ name: navTitle(s), path: pathOf(s) })));
  const faq = faqNode(ctx, c.faq);
  return {
    pageType: 'CollectionPage',
    pageExtra: { about: { '@id': ctx.id('manufacturer') }, ...(series ? { mainEntity: { '@id': ctx.id('itemlist') } } : {}) },
    nodes: [manufacturer, brand, series, faq].filter((n) => n !== undefined),
  };
};
