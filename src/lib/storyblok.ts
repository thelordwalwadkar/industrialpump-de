/**
 * Single content gateway.
 *  - STORYBLOK_TOKEN set  → live Storyblok (CDN API, EU region) through the official @storyblok/astro client.
 *  - no token             → local seed stories in storyblok/content/*.json (identical story shape).
 * Everything else in the codebase only talks to `getSite()`.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ConfigContent, PageComponent, PageContent, PageStory, Story } from './types';

export const SITE_URL = ((import.meta.env?.PUBLIC_SITE_URL as string | undefined) || process.env.PUBLIC_SITE_URL || 'https://industrialpumpgroup.de').replace(/\/$/, '');
const INCLUDE_FIXTURES = (process.env.INCLUDE_FIXTURES ?? import.meta.env?.INCLUDE_FIXTURES) === '1';
export const FIXTURE_PREFIX = '__fixtures__';

const PAGE_COMPONENTS: ReadonlySet<string> = new Set<PageComponent>([
  'page_home', 'page_hub', 'page_topic', 'page_brand', 'page_series', 'page_product', 'page_service',
  'page_course', 'page_knowledge', 'page_blog_post', 'page_case_study', 'page_listing', 'page_contact', 'page_legal', 'page_job', 'page_about', 'page_faq',
]);

export interface Site {
  siteUrl: string;
  config: ConfigContent;
  pages: PageStory[];
  byFull: Map<string, PageStory>;
  byPath: Map<string, PageStory>;
  has(path: string): boolean;
  children(story: Story): PageStory[];
}

export const pathOf = (story: Story): string => (story.full_slug === 'home' ? '/' : `/${story.full_slug}`);
export const isFixture = (story: Story): boolean => story.full_slug.startsWith(`${FIXTURE_PREFIX}/`);
export const absoluteUrl = (path: string): string => `${SITE_URL}${path === '/' ? '/' : path}`;

const normalise = (s: Story): Story => ({ ...s, full_slug: s.full_slug.replace(/^\/+|\/+$/g, ''), slug: s.slug || s.full_slug.split('/').pop() || '' });

function readLocal(dir: string): Story[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => normalise(JSON.parse(readFileSync(join(dir, f), 'utf8')) as Story));
}

async function readLive(): Promise<Story[]> {
  const { useStoryblokApi } = await import('@storyblok/astro');
  const api = useStoryblokApi();
  const preview = process.env.PREVIEW === '1';
  const stories = (await api.getAll('cdn/stories', { version: preview ? 'draft' : 'published', per_page: 100 })) as unknown as (Story & { is_folder?: boolean })[];
  return stories.filter((s) => !s.is_folder).map(normalise);
}

let sitePromise: Promise<Site> | undefined;

async function buildSite(): Promise<Site> {
  const token = process.env.PREVIEW === '1' ? process.env.STORYBLOK_PREVIEW_TOKEN : process.env.STORYBLOK_TOKEN;
  let all = token ? await readLive() : readLocal(join(process.cwd(), 'storyblok', 'content'));
  if (INCLUDE_FIXTURES) all = all.concat(readLocal(join(process.cwd(), 'tests', 'fixtures')));

  const config = all.find((s) => s.full_slug === 'config')?.content as ConfigContent | undefined;
  if (!config) throw new Error('Story "config" (global settings) is missing.');

  const pages = all.filter((s): s is PageStory => PAGE_COMPONENTS.has(s.content.component));
  const byFull = new Map(pages.map((p) => [p.full_slug, p]));
  const byPath = new Map(pages.map((p) => [pathOf(p), p]));

  const childCache = new Map<string, PageStory[]>();
  const naturalSort = (a: PageStory, b: PageStory) =>
    (a.position ?? 0) - (b.position ?? 0) || a.name.localeCompare(b.name, 'de', { numeric: true, sensitivity: 'base' });

  return {
    siteUrl: SITE_URL,
    config,
    pages,
    byFull,
    byPath,
    has: (path) => byPath.has(path.split(/[?#]/)[0]!.replace(/(.)\/$/, '$1')),
    children(story) {
      const hit = childCache.get(story.full_slug);
      if (hit) return hit;
      const prefix = story.full_slug === 'home' ? '' : `${story.full_slug}/`;
      const kids = pages
        .filter((p) => p.full_slug !== 'home' && p.full_slug.startsWith(prefix) && p.full_slug !== story.full_slug && !p.full_slug.slice(prefix.length).includes('/'))
        .sort(naturalSort);
      childCache.set(story.full_slug, kids);
      return kids;
    },
  };
}

// Static builds read once; the SSR preview build re-reads per request so editors always see their draft.
export const getSite = (): Promise<Site> => (process.env.PREVIEW === '1' ? buildSite() : (sitePromise ??= buildSite()));
export type { PageContent };
