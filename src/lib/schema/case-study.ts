import type { Article } from 'schema-dts';
import type { PageCaseStudy } from '../types';
import { clean, globalIds, type Builder } from './shared';
import { relatedItems } from './topic';
import { absoluteUrl } from '../storyblok';

/** T11: Article about the products/services used (existing links only). Verified facts only - no numbers are generated. */
export const buildCaseStudy: Builder = (ctx) => {
  const c = ctx.story.content as PageCaseStudy;
  const org = { '@id': globalIds(ctx.site.siteUrl).organization };
  const article: Article = clean({
    '@type': 'Article',
    '@id': ctx.id('article'),
    headline: ctx.h1,
    description: ctx.description,
    inLanguage: 'de-DE',
    author: org,
    publisher: org,
    datePublished: ctx.story.first_published_at ?? ctx.story.created_at,
    dateModified: ctx.story.published_at ?? ctx.story.updated_at,
    about: relatedItems(ctx, c.products).map((p) => ({ '@type': 'Thing' as const, name: p.name, url: absoluteUrl(p.path) })),
    mainEntityOfPage: { '@id': ctx.id('webpage') },
  });
  return { pageType: 'WebPage', pageExtra: { mainEntity: { '@id': ctx.id('article') } }, nodes: [article] };
};
