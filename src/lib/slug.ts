/** German-safe ASCII slug. ä→ae, ö→oe, ü→ue, ß→ss; every other separator becomes a hyphen. Shared by site code and scripts. */
export function slugify(input: string): string {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Series slug: `{seriesname}-serie`. */
export const seriesSlug = (seriesName: string): string => `${slugify(seriesName)}-serie`;
