import type { Builder } from './shared';

/** T14: plain WebPage - breadcrumb and the page node are all that legal pages need. */
export const buildLegal: Builder = () => ({ pageType: 'WebPage' });
