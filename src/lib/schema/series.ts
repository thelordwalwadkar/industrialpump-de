import type { ProductGroup } from 'schema-dts';
import type { PageSeries } from '../types';
import { assetUrl, clean, faqNode, itemListNode, type Builder } from './shared';
import { brandOf, productChildren } from '../linking';
import { navTitle } from '../breadcrumbs';
import { pathOf } from '../storyblok';
import { toNumber } from '../format';
import { unitProps } from './units';
import { PUMP_TYPES, termLabel } from '../taxonomy';

/** T5: CollectionPage + ProductGroup (+ hasVariant / ItemList only when product pages exist). */
export const buildSeries: Builder = (ctx) => {
  const c = ctx.story.content as PageSeries;
  const brand = brandOf(ctx.site, ctx.story);
  const brandPath = brand ? pathOf(brand) : undefined;
  const products = productChildren(ctx.site, ctx.story);

  const prop = (name: string, value: unknown, unit: string) => {
    const v = toNumber(value);
    return v === undefined ? undefined : { '@type': 'PropertyValue' as const, name, value: v, ...unitProps(unit) };
  };
  const group: ProductGroup = clean({
    '@type': 'ProductGroup',
    '@id': ctx.id('productgroup'),
    name: `${brand?.content.brand_name ?? ''} ${c.series_name}-Serie`.trim(),
    productGroupID: `${brand ? pathOf(brand).split('/').pop() : ''}-${ctx.story.slug}`,
    description: c.intro,
    url: ctx.url,
    image: assetUrl(ctx.site.siteUrl, c.image?.filename),
    category: c.pump_type ? termLabel(PUMP_TYPES, c.pump_type) : undefined,
    brand: brand ? { '@type': 'Brand', name: brand.content.brand_name } : undefined,
    manufacturer: brandPath ? { '@id': ctx.idOf(brandPath, 'manufacturer') } : undefined,
    hasVariant: products.map((p) => ({ '@id': ctx.idOf(pathOf(p), 'product') })),
    additionalProperty: [
      prop('Förderstrom max. (Katalogbereich)', c.flow_max_m3h, 'm³/h'),
      prop('Förderhöhe max. (Katalogbereich)', c.head_max_m, 'm'),
      prop('Motorleistung min.', c.power_min_kw, 'kW'),
      prop('Motorleistung max.', c.power_max_kw, 'kW'),
    ].filter((p): p is NonNullable<typeof p> => p !== undefined),
  });
  const list = itemListNode(ctx, 'itemlist', products.map((p) => ({ name: navTitle(p), path: pathOf(p) })));
  const faq = faqNode(ctx, c.faq);
  return {
    pageType: 'CollectionPage',
    pageExtra: { mainEntity: { '@id': ctx.id('productgroup') } },
    nodes: [group, list, faq].filter((n) => n !== undefined),
  };
};
