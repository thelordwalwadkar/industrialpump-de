import type { Service } from 'schema-dts';
import type { PageTopic, RelatedLinks } from '../types';
import { clean, faqNode, globalIds, itemListNode, type Builder, type Ctx } from './shared';
import { resolveLink } from '../links';
import { seriesWithTag } from '../linking';

/** Existing internal links of related_links bloks → {name, path} (dead or external links never enter the schema). */
export function relatedItems(ctx: Ctx, bloks: RelatedLinks[] | undefined): { name: string; path: string }[] {
  return (bloks ?? []).flatMap((b) => b.links ?? []).flatMap((l) => {
    const r = resolveLink(ctx.site, l.link);
    return r && r.internal && r.exists ? [{ name: l.label, path: r.href.split('#')[0]! }] : [];
  });
}

/**
 * T3 (pump type / Branche / Anwendung): CollectionPage + ItemList of the linked pages and series + Service (the topic as a solution) + FAQPage.
 */
export const buildTopic: Builder = (ctx) => {
  const c = ctx.story.content as PageTopic;
  const items = [...relatedItems(ctx, c.related), ...(c.tag ? seriesWithTag(ctx.site, c.tag).map((s) => ({ name: s.title, path: s.href })) : [])];
  const list = itemListNode(ctx, 'itemlist', items);
  const service: Service = clean({
    '@type': 'Service',
    '@id': ctx.id('service'),
    name: c.nav_title || ctx.h1,
    serviceType: c.service_type,
    description: ctx.description,
    provider: { '@id': globalIds(ctx.site.siteUrl).organization },
    areaServed: { '@type': 'Country', name: 'Deutschland' },
  });
  return {
    pageType: 'CollectionPage',
    pageExtra: { about: { '@id': ctx.id('service') }, ...(list ? { mainEntity: { '@id': ctx.id('itemlist') } } : {}) },
    nodes: [list, service, faqNode(ctx, c.faq)].filter((n) => n !== undefined),
  };
};
