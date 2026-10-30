import type { JobPosting } from 'schema-dts';
import type { PageJob, Faq, RichTextBlok } from '../types';
import { clean, globalIds, type Builder } from './shared';

const plain = (doc: unknown): string => {
  const out: string[] = [];
  (function walk(n: any) { if (!n) return; if (typeof n.text === 'string') out.push(n.text); (n.content ?? []).forEach(walk); })(doc);
  return out.join(' ');
};

/** T15: JobPosting. Only known values are emitted: no datePosted, location or employment type is invented. */
export const buildJob: Builder = (ctx) => {
  const c = ctx.story.content as PageJob;
  const body = (c.body ?? []).filter((b): b is RichTextBlok => b.component === 'rich_text').map((b) => plain(b.content)).join(' ').replace(/\s+/g, ' ').trim();
  const faqText = (c.body ?? []).filter((b): b is Faq => b.component === 'faq').flatMap((f) => f.items ?? []).map((i) => i.question + ' ' + i.answer).join(' ');
  const job: JobPosting = clean({
    '@type': 'JobPosting',
    '@id': ctx.id('job'),
    title: c.job_title || ctx.h1,
    // open client facts ([[PLATZHALTER: …]]) must not reach the structured data, and one of them would drop the whole string
    description: [ctx.description, body, faqText].filter(Boolean).join(' ').replace(/\[\[PLATZHALTER:[^\]]*\]\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 5000),
    datePosted: c.date_posted,
    validThrough: c.valid_through,
    employmentType: c.employment_type,
    hiringOrganization: { '@type': 'Organization', name: ctx.site.config.site_name, sameAs: `${ctx.site.siteUrl}/` },
    jobLocation: c.location_note && !c.location_note.includes('[[PLATZHALTER') ? { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: c.location_note, addressCountry: 'DE' } } : undefined,
    url: ctx.url,
    inLanguage: 'de-DE',
  });
  return { pageType: 'WebPage', pageExtra: { mainEntity: { '@id': ctx.id('job') } }, nodes: [job] };
};
void globalIds;
