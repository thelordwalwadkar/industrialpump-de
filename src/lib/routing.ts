/** full_slug → content type → template. The only place that knows which template renders which content type. */
import type { PageComponent, PageStory } from './types';
import type { Site } from './storyblok';
import HomeTemplate from '../templates/HomeTemplate.astro';
import HubTemplate from '../templates/HubTemplate.astro';
import TopicTemplate from '../templates/TopicTemplate.astro';
import BrandTemplate from '../templates/BrandTemplate.astro';
import SeriesTemplate from '../templates/SeriesTemplate.astro';
import ProductTemplate from '../templates/ProductTemplate.astro';
import ServiceTemplate from '../templates/ServiceTemplate.astro';
import CourseTemplate from '../templates/CourseTemplate.astro';
import KnowledgeTemplate from '../templates/KnowledgeTemplate.astro';
import BlogPostTemplate from '../templates/BlogPostTemplate.astro';
import CaseStudyTemplate from '../templates/CaseStudyTemplate.astro';
import ListingTemplate from '../templates/ListingTemplate.astro';
import ContactTemplate from '../templates/ContactTemplate.astro';
import LegalTemplate from '../templates/LegalTemplate.astro';

export const TEMPLATES = {
  page_home: HomeTemplate,
  page_hub: HubTemplate,
  page_topic: TopicTemplate,
  page_brand: BrandTemplate,
  page_series: SeriesTemplate,
  page_product: ProductTemplate,
  page_service: ServiceTemplate,
  page_course: CourseTemplate,
  page_knowledge: KnowledgeTemplate,
  page_blog_post: BlogPostTemplate,
  page_case_study: CaseStudyTemplate,
  page_listing: ListingTemplate,
  page_contact: ContactTemplate,
  page_legal: LegalTemplate,
} satisfies Record<PageComponent, unknown>;

/** The catch-all route param: the home story is the root (`undefined`), every other story is its full_slug. */
export const slugParam = (story: PageStory): string | undefined => (story.full_slug === 'home' ? undefined : story.full_slug);

/** Pagination for listing pages: how many pages a listing story needs. */
export function listingPageCount(site: Site, story: PageStory): number {
  if (story.content.component !== 'page_listing') return 1;
  const per = Math.max(1, Number(story.content.per_page ?? 10) || 10);
  return Math.max(1, Math.ceil(site.children(story).length / per));
}

/** Revision pages get the overhaul accent: everything under /revision plus every service page of kind revision. */
export const sectionOf = (story: PageStory): 'revision' | undefined => {
  const c = story.content;
  const byKind = c.component === 'page_service' && (c.service_kind === 'revision' || c.service_kind === 'revision-typ');
  return byKind || story.full_slug === 'revision' || story.full_slug.startsWith('revision/') ? 'revision' : undefined;
};
