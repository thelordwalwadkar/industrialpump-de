/** Breadcrumb = folder tree. Never hard-coded: every level is the story that sits at that path prefix. */
import type { CrumbItem, PageStory } from './types';
import { isFixture, pathOf, type Site } from './storyblok';

export const navTitle = (s: PageStory): string => s.content.nav_title || s.content.h1 || s.name;

export function crumbsFor(site: Site, story: PageStory): CrumbItem[] {
  const crumbs: CrumbItem[] = [{ name: 'Startseite', path: '/' }];
  if (story.full_slug === 'home') return crumbs;
  const parts = story.full_slug.split('/');
  for (let i = 1; i <= parts.length; i++) {
    const slug = parts.slice(0, i).join('/');
    const hit = site.byFull.get(slug);
    if (!hit) {
      // Fixtures live under a virtual root; real content must have every ancestor (folder = URL = breadcrumb).
      if (isFixture(story) || slug === '__fixtures__') continue;
      throw new Error(`Breadcrumb gap: "${slug}" has no story but "${story.full_slug}" lives below it.`);
    }
    crumbs.push({ name: navTitle(hit), path: pathOf(hit) });
  }
  return crumbs;
}
