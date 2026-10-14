/** Pure text helpers (no Astro/Vite dependency) shared by the site and the scripts. */
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

/** First sentence(s) of `text` that fit into `max` characters (word-safe, no ellipsis tricks). */
export function fitSentences(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const sentences = clean.match(/[^.!?]+[.!?]+/g) ?? [clean];
  let out = '';
  for (const s of sentences) { if ((out + s).trim().length > max) break; out = `${out}${s}`; }
  return out.trim();
}
