import { faqNode, type Builder } from './shared';

/** T17: WebPage that is the FAQPage (all questions of the page's FAQ bloks). */
export const buildFaqPage: Builder = (ctx) => {
  const faq = faqNode(ctx, undefined);
  return { pageType: 'WebPage', pageExtra: faq ? { mainEntity: { '@id': ctx.id('faq') } } : {}, nodes: faq ? [faq] : [] };
};
