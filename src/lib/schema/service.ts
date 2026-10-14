import type { Service } from 'schema-dts';
import type { PageService } from '../types';
import { clean, faqNode, globalIds, type Builder } from './shared';

/** T7: Service + WebPage (+ FAQPage). `hasOfferCatalog` is intentionally not emitted until real sub-services are modelled. */
export const buildService: Builder = (ctx) => {
  const c = ctx.story.content as PageService;
  const service: Service = clean({
    '@type': 'Service',
    '@id': ctx.id('service'),
    name: ctx.h1,
    serviceType: c.service_type,
    description: ctx.description,
    url: ctx.url,
    provider: { '@id': globalIds(ctx.site.siteUrl).organization },
    areaServed: { '@type': 'Country', name: 'Deutschland' },
  });
  const faq = faqNode(ctx, c.faq);
  return { pageType: 'WebPage', pageExtra: { mainEntity: { '@id': ctx.id('service') } }, nodes: [service, faq].filter((n) => n !== undefined) };
};
