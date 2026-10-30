import { globalIds, type Builder } from './shared';

/** T16: AboutPage whose subject is the Organization. */
export const buildAbout: Builder = (ctx) => ({
  pageType: 'AboutPage',
  pageExtra: { about: { '@id': globalIds(ctx.site.siteUrl).organization }, mainEntity: { '@id': globalIds(ctx.site.siteUrl).organization } },
});
