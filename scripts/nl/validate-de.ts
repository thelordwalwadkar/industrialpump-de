/**
 * Validates translated pages in content-src/de/*.json against their Dutch source in content-src/nl/.
 *   npx tsx scripts/nl/validate-de.ts            → all files
 *   npx tsx scripts/nl/validate-de.ts <id> <id>  → only these ids
 * Exit code 1 when any error is found. Warnings never fail.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const nlDir = join(process.cwd(), 'content-src', 'nl');
const deDir = join(process.cwd(), 'content-src', 'de');
const slugMap = JSON.parse(readFileSync(join(process.cwd(), 'content-src', 'slug-map.json'), 'utf8')) as Record<string, { de?: string; skip?: string }>;
const ids = process.argv.slice(2).length ? process.argv.slice(2) : (existsSync(deDir) ? readdirSync(deDir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')) : []);

const TOKENS = new Set(['{{TELEFON}}', '{{EMAIL}}', '{{ADRESSE}}']);
const DUTCH = /\b(het|een|voor|niet|zijn|naar|bij|onze|wij|uw|ook|worden|kunnen|deze|door|met de|van de|voor de|op de|in de|dat|zoals|meer|alle|veel|geen|maar|omdat)\b/gi;
const GERMAN_HINT = /\b(und|der|die|das|nicht|für|mit|von|ist|sind|werden|auf|zu|bei|oder|Sie|wir|unsere)\b/g;
const errors: string[] = [];
const warnings: string[] = [];
const err = (id: string, m: string) => errors.push(`${id}: ${m}`);
const warn = (id: string, m: string) => warnings.push(`${id}: ${m}`);

type Block = { t: string; [k: string]: any };
const textOf = (b: Block): string => (b.t === 'h' || b.t === 'p' ? b.text : b.t === 'list' ? (b.items ?? []).join(' ') : b.t === 'faq' ? `${b.q} ${b.a}` : b.t === 'cta' ? b.text : b.t === 'table' ? (b.rows ?? []).flat().join(' ') : b.t === 'img' ? b.alt ?? '' : '');
const count = (bl: Block[], t: string) => bl.filter((b) => b.t === t).length;

for (const id of ids) {
  const dePath = join(deDir, `${id}.json`);
  const nlPath = join(nlDir, `${id}.json`);
  if (!existsSync(dePath)) { err(id, 'missing German file'); continue; }
  if (!existsSync(nlPath)) { err(id, 'no Dutch source with this id'); continue; }
  let de: any, nl: any;
  try { de = JSON.parse(readFileSync(dePath, 'utf8')); } catch (e) { err(id, `invalid JSON: ${(e as Error).message}`); continue; }
  nl = JSON.parse(readFileSync(nlPath, 'utf8'));

  for (const k of ['id', 'seo_title', 'seo_description', 'h1', 'intro', 'blocks', 'notes']) if (de[k] === undefined) err(id, `missing field "${k}"`);
  if (de.id !== id) err(id, `id field "${de.id}" != file name`);
  if (typeof de.seo_title === 'string' && (de.seo_title.length > 60 || de.seo_title.length < 15)) err(id, `seo_title length ${de.seo_title.length} (15–60)`);
  if (typeof de.seo_description === 'string' && (de.seo_description.length > 155 || de.seo_description.length < 60)) err(id, `seo_description length ${de.seo_description.length} (60–155)`);
  if (typeof de.intro === 'string' && de.intro.length > 400) warn(id, `intro is long (${de.intro.length} chars)`);
  const n = de.notes ?? {};
  for (const k of ['dropped', 'claims', 'nl_specific']) if (!Array.isArray(n[k])) err(id, `notes.${k} must be an array`);
  if (!Array.isArray(de.blocks)) { err(id, 'blocks must be an array'); continue; }

  const nlB: Block[] = nl.blocks;
  const deB: Block[] = de.blocks;
  for (const [i, b] of deB.entries()) {
    if (!['h', 'p', 'list', 'table', 'img', 'faq', 'cta', 'form'].includes(b.t)) err(id, `block ${i}: unknown type "${b.t}"`);
    if ((b.t === 'h' || b.t === 'p') && !String(b.text ?? '').trim()) err(id, `block ${i}: empty text`);
    if (b.t === 'list' && !(Array.isArray(b.items) && b.items.length)) err(id, `block ${i}: empty list`);
    if (b.t === 'faq' && !(b.q && b.a)) err(id, `block ${i}: faq without q/a`);
    if (b.t === 'img' && !b.src) err(id, `block ${i}: img without src`);
  }
  // structure must follow the source (a few declared drops allowed)
  const dropped = (n.dropped ?? []).length;
  for (const t of ['faq', 'table', 'img', 'list', 'cta']) {
    const a = count(nlB, t), b = count(deB, t);
    if (b > a) err(id, `${t}: ${b} in German vs ${a} in source (blocks must not be invented)`);
    if (a - b > dropped + (t === 'img' || t === 'cta' ? 2 : 0)) err(id, `${t}: ${a} in source but only ${b} in German (declare drops in notes.dropped)`);
  }
  const wNl = nlB.reduce((s, b) => s + textOf(b).split(/\s+/).filter(Boolean).length, 0);
  const wDe = deB.reduce((s, b) => s + textOf(b).split(/\s+/).filter(Boolean).length, 0);
  if (wNl > 120 && (wDe < wNl * 0.6 || wDe > wNl * 1.5)) warn(id, `word count ${wDe} vs source ${wNl} (ratio ${(wDe / wNl).toFixed(2)}): check for omissions`);
  if (wNl > 120 && wDe < wNl * 0.45) err(id, `German text is much shorter than the source (${wDe} vs ${wNl} words): content missing`);

  // language checks
  const all = [de.h1, de.intro, de.seo_title, de.seo_description, ...deB.map(textOf)].join(' \n ');
  const du = (all.match(DUTCH) ?? []).length, ge = (all.match(GERMAN_HINT) ?? []).length;
  if (du > 6 && du * 2 > ge) err(id, `looks partly Dutch (${du} Dutch vs ${ge} German function words)`);
  if (/\[\[/.test(all)) err(id, 'contains "[[": placeholders are added by the build, not by the translation');
  for (const t of all.match(/\{\{[A-Z]+\}\}/g) ?? []) if (!TOKENS.has(t)) err(id, `unknown token ${t}`);
  if (/\b0\d{2,3}[ -]?\d{3}[ -]?\d{3,4}\b|@[a-z0-9-]+\.(nl|com)|\b\d{4} ?[A-Z]{2}\b/.test(all)) err(id, 'Dutch phone number / e-mail / postcode left in text: use {{TELEFON}}, {{EMAIL}}, {{ADRESSE}}');
  if (/Hier klicken|Klicken Sie hier|^Mehr erfahren$/im.test(all)) warn(id, 'weak CTA wording');
  if (!/^[A-ZÄÖÜ0-9]/.test(de.h1 ?? '')) warn(id, 'h1 should start with a capital letter');

  // links: hrefs must be unchanged copies of source hrefs (the build remaps them)
  const hrefs = (s: string) => [...s.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]!);
  const nlLinks = new Set(nlB.flatMap((b) => hrefs(textOf(b))).concat(nlB.filter((b) => b.t === 'cta').map((b) => b.href)));
  for (const b of deB) for (const h of [...hrefs(textOf(b)), ...(b.t === 'cta' ? [b.href] : [])]) {
    if (!h) { err(id, 'cta without href'); continue; }
    if (!nlLinks.has(h)) err(id, `link target "${h}" does not exist in the Dutch source`);
  }
  void slugMap;
}

console.log(`validate-de: ${ids.length} file(s) checked`);
if (warnings.length) { console.log(`\n${warnings.length} warning(s):`); warnings.slice(0, 30).forEach((w) => console.log('  ! ' + w)); }
if (errors.length) { console.error(`\n${errors.length} error(s):`); errors.slice(0, 80).forEach((e) => console.error('  ✗ ' + e)); process.exit(1); }
console.log('validate-de: 0 errors');
