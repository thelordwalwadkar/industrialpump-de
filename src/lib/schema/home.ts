import { globalIds, type Builder } from './shared';

/** T1: the full Organization + WebSite nodes are emitted on the home page (see assembleGraph). */
export const buildHome: Builder = (ctx) => ({
  pageType: 'WebPage',
  pageExtra: { about: { '@id': globalIds(ctx.site.siteUrl).organization } },
});
