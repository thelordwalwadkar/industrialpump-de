import type { PageTopic, RelatedLinks } from '../types';
import { faqNode, itemListNode, type Builder, type Ctx } from './shared';
import { resolveLink } from '../links';

/** Existing internal links of related_links bloks → {name, path} (dead or external links never enter the schema). */
export function relatedItems(ctx: Ctx, bloks: RelatedLinks[] | undefined): { name: string; path: string }[] {
  return (bloks ?? []).flatMap((b) => b.links ?? []).flatMap((l) => {
    const r = resolveLink(ctx.site, l.link);
    return r && r.internal && r.exists ? [{ name: l.label, path: r.href.split('#')[0]! }] : [];
  });
}

/** T3: WebPage about a Thing (the topic) + ItemList of linked pump types / series + FAQPage. */
export const buildTopic: Builder = (ctx) => {
  const c = ctx.story.content as PageTopic;
  const list = itemListNode(ctx, 'itemlist', relatedItems(ctx, c.related));
  const faq = faqNode(ctx, c.faq);
  return {
    pageType: 'WebPage',
    pageExtra: { about: { '@type': 'Thing', name: c.nav_title || ctx.h1 }, ...(list ? { mainEntity: { '@id': ctx.id('itemlist') } } : {}) },
    nodes: [list, faq].filter((n) => n !== undefined),
  };
};
