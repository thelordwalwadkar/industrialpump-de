/** One graph per page. The builder is chosen by content type - there is no per-page schema code. */
import type { Graph } from 'schema-dts';
import type { PageComponent, PageStory } from '../types';
import type { Site } from '../storyblok';
import { assembleGraph, makeCtx, type Builder } from './shared';
import { buildHome } from './home';
import { buildHub } from './hub';
import { buildTopic } from './topic';
import { buildBrand } from './brand';
import { buildSeries } from './series';
import { buildProduct } from './product';
import { buildService } from './service';
import { buildCourse } from './course';
import { buildKnowledge } from './knowledge';
import { buildBlogPost } from './blog';
import { buildCaseStudy } from './case-study';
import { buildListing } from './listing';
import { buildContact } from './contact';
import { buildLegal } from './legal';
import { buildJob } from './job';
import { buildAbout } from './about';
import { buildFaqPage } from './faq-page';

export const SCHEMA_BUILDERS: Record<PageComponent, Builder> = {
  page_home: buildHome,
  page_hub: buildHub,
  page_topic: buildTopic,
  page_brand: buildBrand,
  page_series: buildSeries,
  page_product: buildProduct,
  page_service: buildService,
  page_course: buildCourse,
  page_knowledge: buildKnowledge,
  page_blog_post: buildBlogPost,
  page_case_study: buildCaseStudy,
  page_listing: buildListing,
  page_contact: buildContact,
  page_legal: buildLegal,
  page_job: buildJob,
  page_about: buildAbout,
  page_faq: buildFaqPage,
};

export function buildGraph(site: Site, story: PageStory): Graph {
  const ctx = makeCtx(site, story);
  const result = SCHEMA_BUILDERS[story.content.component](ctx);
  return assembleGraph(ctx, result, story.content.component === 'page_home');
}
