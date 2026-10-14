import type { PageStory, SeoMeta } from './types';
import { DESCRIPTION_MAX, TITLE_MAX, fitSentences } from './text';
import { absoluteUrl, isFixture, pathOf, type Site } from './storyblok';

export function buildSeo(site: Site, story: PageStory): SeoMeta {
  const c = story.content;
  const h1 = c.h1 || story.name;
  const title = c.seo_title || h1;
  const description = c.seo_description || fitSentences(c.intro ?? site.config.default_description ?? '', DESCRIPTION_MAX);
  if (title.length > TITLE_MAX) throw new Error(`<title> too long (${title.length}/${TITLE_MAX}) on ${story.full_slug}: "${title}"`);
  if (!description || description.length > DESCRIPTION_MAX) throw new Error(`meta description invalid (${description.length}/${DESCRIPTION_MAX}) on ${story.full_slug}`);
  const ogType = c.component === 'page_blog_post' || c.component === 'page_knowledge' ? 'article' : c.component === 'page_product' ? 'product' : 'website';
  return { title, description, canonical: absoluteUrl(pathOf(story)), // PUBLIC_STAGING=1 marks a public test deployment: never indexed, so it cannot compete with or confuse the real domain.
    noindex: Boolean(c.noindex) || isFixture(story) || process.env.PUBLIC_STAGING === '1', ogType };
}

export { DESCRIPTION_MAX, TITLE_MAX, fitSentences };
