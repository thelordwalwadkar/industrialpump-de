import type { Product } from 'schema-dts';
import type { PageProduct } from '../types';
import { assetUrl, clean, type Builder } from './shared';
import { brandOf, seriesOf } from '../linking';
import { pathOf } from '../storyblok';
import { toNumber } from '../format';
import { unitProps } from './units';
import { PUMP_TYPES, termLabel } from '../taxonomy';

/**
 * T6: WebPage (mainEntity → Product) + Product. `offers` only with a real price; never ratings or reviews.
 * additionalProperty = one PropertyValue per visible spec row that carries a machine-readable value.
 */
const AVAILABILITY = {
  InStock: 'https://schema.org/InStock',
  OutOfStock: 'https://schema.org/OutOfStock',
  PreOrder: 'https://schema.org/PreOrder',
  BackOrder: 'https://schema.org/BackOrder',
  LimitedAvailability: 'https://schema.org/LimitedAvailability',
} as const;

export const buildProduct: Builder = (ctx) => {
  const c = ctx.story.content as PageProduct;
  const brand = brandOf(ctx.site, ctx.story);
  const series = seriesOf(ctx.site, ctx.story);
  const price = toNumber(c.price);

  const properties = [...(c.specs ?? [])].flatMap((row) => {
    const num = toNumber((row as { value_num?: unknown }).value_num);
    const value = num ?? (row.value && !/^\s*$/.test(row.value) ? row.value : undefined);
    return value === undefined ? [] : [{ '@type': 'PropertyValue' as const, name: row.label, value, ...(num !== undefined ? unitProps(row.unit) : {}) }];
  });

  const product: Product = clean({
    '@type': 'Product',
    '@id': ctx.id('product'),
    name: `${brand?.content.brand_name ?? ''} ${c.name}`.trim(),
    sku: c.article_number,
    mpn: c.article_number,
    gtin: c.gtin,
    description: c.short_description,
    url: ctx.url,
    image: assetUrl(ctx.site.siteUrl, c.image?.filename),
    category: series?.content.pump_type ? termLabel(PUMP_TYPES, series.content.pump_type) : undefined,
    brand: brand ? { '@type': 'Brand', name: brand.content.brand_name } : undefined,
    manufacturer: brand ? { '@id': ctx.idOf(pathOf(brand), 'manufacturer') } : undefined,
    isVariantOf: series ? { '@id': ctx.idOf(pathOf(series), 'productgroup') } : undefined,
    additionalProperty: properties,
    offers: price !== undefined
      ? { '@type': 'Offer', price, priceCurrency: 'EUR', availability: AVAILABILITY[c.availability as keyof typeof AVAILABILITY], url: ctx.url, seller: { '@id': `${ctx.site.siteUrl}/#organization` } }
      : undefined,
  });
  return { pageType: 'WebPage', pageExtra: { mainEntity: { '@id': ctx.id('product') } }, nodes: [product] };
};
