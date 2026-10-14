import { itemListNode, type Builder } from './shared';
import { navTitle } from '../breadcrumbs';
import { pathOf } from '../storyblok';

/** T12: CollectionPage + ItemList of the child stories (first listing page; pagination pages repeat the template). */
export const buildListing: Builder = (ctx) => {
  const list = itemListNode(ctx, 'itemlist', ctx.site.children(ctx.story).map((c) => ({ name: navTitle(c), path: pathOf(c) })));
  return { pageType: 'CollectionPage', pageExtra: list ? { mainEntity: { '@id': ctx.id('itemlist') } } : {}, nodes: list ? [list] : [] };
};
