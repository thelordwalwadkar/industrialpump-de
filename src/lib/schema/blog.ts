import type { BlogPosting } from 'schema-dts';
import type { PageBlogPost } from '../types';
import { clean, globalIds, type Builder } from './shared';

/** T10: BlogPosting. Author is a Person only when a name is stored, otherwise the Organization. */
export const buildBlogPost: Builder = (ctx) => {
  const c = ctx.story.content as PageBlogPost;
  const org = { '@id': globalIds(ctx.site.siteUrl).organization };
  const post: BlogPosting = clean({
    '@type': 'BlogPosting',
    '@id': ctx.id('article'),
    headline: ctx.h1,
    description: ctx.description,
    inLanguage: 'de-DE',
    image: c.image?.filename,
    author: c.author ? { '@type': 'Person', name: c.author } : org,
    publisher: org,
    datePublished: ctx.story.first_published_at ?? ctx.story.created_at,
    dateModified: ctx.story.published_at ?? ctx.story.updated_at,
    mainEntityOfPage: { '@id': ctx.id('webpage') },
  });
  return { pageType: 'WebPage', pageExtra: { mainEntity: { '@id': ctx.id('article') } }, nodes: [post] };
};
