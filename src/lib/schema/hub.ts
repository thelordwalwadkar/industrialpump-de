import { itemListNode, type Builder } from './shared';
import { navTitle } from '../breadcrumbs';
import { pathOf } from '../storyblok';

/** T2: CollectionPage + ItemList of the child pages (no ItemList when there are none). */
export const buildHub: Builder = (ctx) => {
  const list = itemListNode(ctx, 'itemlist', ctx.site.children(ctx.story).map((c) => ({ name: navTitle(c), path: pathOf(c) })));
  return { pageType: 'CollectionPage', pageExtra: list ? { mainEntity: { '@id': ctx.id('itemlist') } } : {}, nodes: list ? [list] : [] };
};
