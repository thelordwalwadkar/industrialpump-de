import type { Course } from 'schema-dts';
import type { PageCourse } from '../types';
import { clean, globalIds, type Builder } from './shared';

const MODE: Record<string, string> = { onsite: 'Präsenz', online: 'Online', blended: 'Blended Learning' };

/** T8: Course. CourseInstance is only added when structured dates exist (the `dates` field is free text → none emitted). */
export const buildCourse: Builder = (ctx) => {
  const c = ctx.story.content as PageCourse;
  const course: Course = clean({
    '@type': 'Course',
    '@id': ctx.id('course'),
    name: ctx.h1,
    description: ctx.description,
    url: ctx.url,
    inLanguage: 'de',
    educationalLevel: c.level,
    courseMode: c.mode ? MODE[c.mode] : undefined,
    provider: { '@id': globalIds(ctx.site.siteUrl).organization },
  });
  return { pageType: 'WebPage', pageExtra: { mainEntity: { '@id': ctx.id('course') } }, nodes: [course] };
};
