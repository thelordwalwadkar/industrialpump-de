import { globalIds, type Builder } from './shared';

/** T13: ContactPage whose mainEntity is the Organization. */
export const buildContact: Builder = (ctx) => ({
  pageType: 'ContactPage',
  pageExtra: { mainEntity: { '@id': globalIds(ctx.site.siteUrl).organization } },
});
