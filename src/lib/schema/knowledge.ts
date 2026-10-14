import type { Article, DigitalDocument, TechArticle } from 'schema-dts';
import type { PageKnowledge } from '../types';
import { clean, globalIds, type Builder } from './shared';

/** T9: Article (TechArticle for technical topics) + one DigitalDocument per download that has a file. */
export const buildKnowledge: Builder = (ctx) => {
  const c = ctx.story.content as PageKnowledge;
  const org = { '@id': globalIds(ctx.site.siteUrl).organization };
  const article: Article | TechArticle = clean({
    '@type': c.tech ? 'TechArticle' : 'Article',
    '@id': ctx.id('article'),
    headline: ctx.h1,
    description: ctx.description,
    inLanguage: 'de-DE',
    author: c.author ? { '@type': 'Person', name: c.author } : org,
    publisher: org,
    datePublished: ctx.story.first_published_at ?? ctx.story.created_at,
    dateModified: ctx.story.published_at ?? ctx.story.updated_at,
    mainEntityOfPage: { '@id': ctx.id('webpage') },
  });
  const docs: DigitalDocument[] = (c.downloads ?? []).flatMap((d) => d.items ?? []).filter((i) => i.file?.filename).map((i, n) => clean({
    '@type': 'DigitalDocument' as const, '@id': ctx.id(`document-${n + 1}`), name: i.label, url: i.file!.filename, inLanguage: 'de-DE',
  }));
  return { pageType: 'WebPage', pageExtra: { mainEntity: { '@id': ctx.id('article') } }, nodes: [article, ...docs] };
};
