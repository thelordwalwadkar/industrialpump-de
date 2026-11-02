import type { PageBase } from './types';

/** True when the editor content already ends in its own CTA band: the template's default quote CTA is then left out, so a page never shows two CTA bands in a row. */
export const hasOwnCta = (c: PageBase): boolean => JSON.stringify(c.body ?? []).includes('"component":"cta_band"');
