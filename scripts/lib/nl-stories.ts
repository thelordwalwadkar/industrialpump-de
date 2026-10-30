/**
 * Turns the translated pages of industrialpumps.nl (content-src/de/*.json) into Storyblok seed stories.
 * Called from generate-seed.ts. Pure: reads files, returns stories + a report.
 *
 * Mapping: every translated block becomes a blok in the page's `body` slot (rich_text / image_block / data_table / faq / button_row).
 * Article-like types (knowledge, blog) put their first run of text into `article`, the rest into `body`.
 * Pages that already exist in the hand-built seed (home, hubs, brands, series, forms, legal) keep their structure;
 * the translated text is appended to their `body` (legal and form pages are not appended: Dutch legal text must not be reused).
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { APPLICATIONS, PUMP_TYPES, SEGMENTS } from '../../src/lib/taxonomy';
import { DESCRIPTION_MAX, fitSentences, TITLE_MAX } from '../../src/lib/text';
import { storyId, uuidOf, type SeedStory } from './stories';

type Node = Record<string, any>;
type Block =
  | { t: 'h'; l: number; text: string }
  | { t: 'p'; text: string }
  | { t: 'list'; ordered: boolean; items: string[] }
  | { t: 'table'; rows: string[][] }
  | { t: 'img'; src: string; alt: string }
  | { t: 'faq'; q: string; a: string }
  | { t: 'cta'; text: string; href: string }
  | { t: 'form' };
interface DePage { id: string; seo_title: string; seo_description: string; h1: string; intro: string; blocks: Block[]; notes?: { dropped?: string[]; claims?: string[]; nl_specific?: string[] } }
interface NlPage { path: string; kind: string; template: string }
interface SlugEntry { de?: string; skip?: string; noindex?: string }

const root = process.cwd();
const readJson = <T>(...p: string[]): T => JSON.parse(readFileSync(join(root, ...p), 'utf8')) as T;
const md5 = (s: string) => createHash('md5').update(s).digest('hex');
const uid = (s: string) => md5(s).slice(0, 12);
const idOf = (p: string) => (p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '__'));
const TOKENS: Record<string, string> = { TELEFON: 'Telefon', EMAIL: 'E-Mail', ADRESSE: 'Anschrift' };

const BRAND_NAMES: Record<string, string> = { duchting: 'Düchting', homa: 'HOMA', saer: 'SAER', 'sterling-sihi': 'Sterling SIHI' };

/** "Lowara CO: Blockpumpen …" → "CO"; falls back to the upper-cased URL slug when the heading does not start with the brand. */
function seriesName(h1: string, dePath: string, fallback: string): string {
  const brand = dePath.split('/')[3]!.toLowerCase();
  const head = h1.split(':')[0]!.trim();
  const m = new RegExp('^' + brand.replace('-', '[ -]') + '\\s+(.+)$', 'i').exec(head);
  return m && m[1]!.length <= 20 ? m[1]! : fallback;
}

/** Pump type (taxonomy key) of the migrated series pages; ASSUMPTION: borehole pumps are filed under submersible pumps. */
const SERIES_PUMP_TYPE: Record<string, string> = {
  'co-serie': 'blockpumpen', 'dl-dlv-serie': 'tauchmotorpumpen', 'e-ixp-serie': 'kreiselpumpen', 'scuba-serie': 'tauchmotorpumpen',
  'svi-serie': 'mehrstufige-pumpen', 'tdb-tdv-serie': 'mehrstufige-pumpen', 'cm-cmp-serie': 'kreiselpumpen', 'fs-98-serie': 'tauchmotorpumpen',
  'l-in-line-serie': 'kreiselpumpen', 'mbsh-serie': 'mehrstufige-pumpen', 'mk-serie': 'mehrstufige-pumpen', 'nca-serie': 'kreiselpumpen',
  'ncb-serie': 'kreiselpumpen', 'ncbk-serie': 'kreiselpumpen', 'nr-151-nr-152-serie': 'tauchmotorpumpen',
};

/** The content model allows 320 characters: cut at a sentence end, or at a word boundary when the first sentence is already too long. */
function fitIntro(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= 320) return t;
  const sentences = fitSentences(t, 320);
  return sentences || t.slice(0, 319).replace(/\s+\S*$/, '') + '…';
}

export interface NlReport {
  translated: number; missing: string[]; unresolvedLinks: string[]; appended: string[]; skippedExisting: string[]; errors: string[];
  claims: { page: string; text: string }[]; nlSpecific: { page: string; text: string }[];
}

export function nlStories(existing: Map<string, SeedStory>): { stories: SeedStory[]; report: NlReport } {
  const slugMap = readJson<Record<string, SlugEntry>>('content-src', 'slug-map.json');
  const imageMap = readJson<Record<string, { file: string; width: number; height: number }>>('content-src', 'image-map.json');
  const newsDates = readJson<Record<string, string>>('content-src', 'news-dates.json');
  const report: NlReport = { translated: 0, missing: [], unresolvedLinks: [], appended: [], skippedExisting: [], errors: [], claims: [], nlSpecific: [] };
  const dePath = (nl: string) => slugMap[nl]?.de;
  const unresolved = new Set<string>();

  /* ---------- link handling ---------- */
  /** Dutch href → German href, or null when the link must be dropped (webshop, mailto, files, skipped pages). */
  function mapHref(href: string, page: string): string | null {
    if (/^mailto:|^tel:/i.test(href)) return null;
    if (/^https?:\/\//i.test(href)) {
      if (/industrialpumps\.nl|industrialpumpgroup\.(nl|de)/i.test(href)) {
        const u = new URL(href); const d = dePath(u.pathname.replace(/\/+$/, '') || '/');
        return d ? d + u.hash : null;
      }
      return href;
    }
    const clean = href.split('#')[0]!.split('?')[0]!.replace(/\/+$/, '') || '/';
    const hash = href.includes('#') ? '#' + href.split('#')[1] : '';
    const d = dePath(clean);
    if (d) return d + hash;
    unresolved.add(`${page}: ${href}`);
    return null;
  }

  /* ---------- inline markup → rich-text nodes ---------- */
  function inline(src: string, page: string): Node[] {
    const text = src.replace(/\{\{(TELEFON|EMAIL|ADRESSE)\}\}/g, (_m, k: string) => `[[PLATZHALTER: ${TOKENS[k]}]]`);
    const out: Node[] = [];
    const pushText = (t: string, marks: Node[]) => {
      // bold segments inside a run; newlines become hard breaks
      t.split(/(\*\*[^*]+\*\*)/).forEach((seg) => {
        if (!seg) return;
        const bold = /^\*\*[^*]+\*\*$/.test(seg);
        const body = bold ? seg.slice(2, -2) : seg;
        body.split('\n').forEach((line, i) => {
          if (i > 0) out.push({ type: 'hard_break' });
          if (line) out.push({ type: 'text', text: line, ...(bold || marks.length ? { marks: [...marks, ...(bold ? [{ type: 'bold' }] : [])] } : {}) });
        });
      });
    };
    const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
    let last = 0; let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (m.index > last) pushText(text.slice(last, m.index), []);
      const href = mapHref(m[2]!, page);
      pushText(m[1]!, href ? [{ type: 'link', attrs: { href, linktype: 'url', ...(/^https?:/.test(href) ? { target: '_blank' } : {}) } }] : []);
      last = m.index + m[0].length;
    }
    if (last < text.length) pushText(text.slice(last), []);
    return out.length ? out : [{ type: 'text', text: ' ' }];
  }
  const plain = (s: string) => s.replace(/\{\{(TELEFON|EMAIL|ADRESSE)\}\}/g, (_m, k: string) => `[[PLATZHALTER: ${TOKENS[k]}]]`).replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*/g, '');

  /* ---------- blocks → bloks ---------- */
  function toBloks(blocks: Block[], seed: string, page: string, fallbackAlt: string): { runs: Node[]; bloks: Node[] } {
    const bloks: Node[] = [];
    let n = 0;
    let rich: Node[] = [];
    const flush = () => { if (rich.length) { bloks.push({ _uid: uid(`${seed}-${n++}`), component: 'rich_text', content: { type: 'doc', content: rich } }); rich = []; } };
    let faq: { q: string; a: string }[] = [];
    const flushFaq = () => {
      if (!faq.length) return;
      // the content model caps one FAQ blok at 8 items: longer lists become several bloks
      for (let from = 0; from < faq.length; from += 8) {
        const part = faq.slice(from, from + 8);
        bloks.push({ _uid: uid(`${seed}-${n++}`), component: 'faq', heading: from === 0 ? 'Häufige Fragen' : 'Weitere Fragen', items: part.map((f, i) => ({ _uid: uid(`${seed}-${n}-f${from + i}`), component: 'faq_item', question: plain(f.q), answer: plain(f.a) })) });
      }
      faq = [];
    };
    let btns: { text: string; href: string }[] = [];
    const flushBtns = () => {
      if (!btns.length) return;
      bloks.push({ _uid: uid(`${seed}-${n++}`), component: 'button_row', buttons: btns.map((b, i) => ({ _uid: uid(`${seed}-${n}-b${i}`), component: 'link_item', label: plain(b.text), link: { fieldtype: 'multilink', linktype: 'url', url: b.href, cached_url: b.href } })) });
      btns = [];
    };
    for (const b of blocks) {
      if (b.t === 'h' && b.l === 1) continue;
      if (b.t === 'form') continue;
      if (b.t === 'faq') { flush(); flushBtns(); faq.push(b); continue; }
      if (b.t === 'cta') {
        const href = mapHref(b.href, page); if (!href) continue;
        flush(); flushFaq(); btns.push({ text: b.text, href }); continue;
      }
      flushFaq(); flushBtns();
      if (b.t === 'h') rich.push({ type: 'heading', attrs: { level: Math.min(Math.max(b.l, 2), 4) }, content: inline(b.text, page) });
      else if (b.t === 'p') rich.push({ type: 'paragraph', content: inline(b.text, page) });
      else if (b.t === 'list') rich.push({ type: b.ordered ? 'ordered_list' : 'bullet_list', content: b.items.map((i) => ({ type: 'list_item', content: [{ type: 'paragraph', content: inline(i, page) }] })) });
      else if (b.t === 'table') {
        flush();
        const [head, ...rows] = b.rows;
        bloks.push({ _uid: uid(`${seed}-${n++}`), component: 'data_table', table: {
          fieldtype: 'table',
          thead: (head ?? []).map((v, i) => ({ _uid: uid(`${seed}-th${i}`), component: '_table_head', value: plain(v) })),
          tbody: rows.map((r, ri) => ({ _uid: uid(`${seed}-tr${ri}`), component: '_table_row', body: r.map((v, ci) => ({ _uid: uid(`${seed}-td${ri}-${ci}`), component: '_table_col', value: plain(v) })) })),
        } });
      } else if (b.t === 'img') {
        const im = imageMap[b.src]; if (!im) continue;
        flush();
        bloks.push({ _uid: uid(`${seed}-${n++}`), component: 'image_block', image: { filename: im.file, alt: plain(b.alt) || fallbackAlt, width: im.width, height: im.height } });
      }
    }
    flush(); flushFaq(); flushBtns();
    return { runs: [], bloks };
  }

  /* ---------- type mapping ---------- */
  const TAGS = new Set([...PUMP_TYPES, ...SEGMENTS, ...APPLICATIONS].map((t) => t.slug));
  function mapType(path: string, nl: NlPage): { component: string; extra: Node } {
    const tpl = nl.template;
    const last = path.split('/').pop()!;
    if (tpl.startsWith('T1 ')) return { component: 'page_home', extra: {} };
    if (tpl.startsWith('T2 ')) return { component: 'page_hub', extra: {} };
    if (tpl.startsWith('T3 ')) {
      const kind = path.startsWith('/pumpen/branchen') ? 'branche' : path.startsWith('/pumpen/anwendungen') ? 'anwendung' : 'pumpentyp';
      return { component: 'page_topic', extra: { topic_kind: kind, ...(TAGS.has(last) ? { tag: last } : {}), ...(nl.kind.includes('Unterseite') ? {} : {}) } };
    }
    if (tpl.startsWith('T4/T5')) return { component: 'page_series', extra: { series_name: last.replace(/-serie$/, '').toUpperCase() } };
    if (tpl.startsWith('T4 ')) return { component: 'page_brand', extra: { brand_name: last } };
    if (tpl.startsWith('T7 ')) {
      const kind = path === '/revision' || path === '/revision/pumpenrevision' ? 'revision' : path === '/ersatzpumpe' ? 'leistung' : 'revision-typ';
      return { component: 'page_service', extra: { service_kind: kind } };
    }
    if (tpl.startsWith('T8 ')) return { component: 'page_course', extra: {} };
    if (tpl.startsWith('T9 ')) return { component: 'page_knowledge', extra: { tech: true } };
    if (tpl.startsWith('T10 ')) return { component: 'page_blog_post', extra: {} };
    if (tpl.startsWith('T11 ')) return { component: 'page_case_study', extra: {} };
    if (tpl.startsWith('T12 ')) return { component: 'page_listing', extra: { listing_kind: path.includes('referenzen') || path.includes('cases') ? 'referenzen' : path.includes('blog') || path.includes('nieuws') ? 'blog' : undefined, per_page: 12 } };
    if (tpl.startsWith('T13 ')) return { component: 'page_contact', extra: { form_kind: path.includes('angebot') || path.includes('offerte') ? 'angebot' : path.includes('rueckruf') || path.includes('bel-mij') ? 'rueckruf' : 'kontakt' } };
    if (tpl.startsWith('T14 ')) return { component: 'page_legal', extra: {} };
    if (tpl.includes('About')) return { component: 'page_about', extra: {} };
    if (tpl.includes('Job')) return { component: 'page_job', extra: {} };
    if (tpl.includes('FAQ')) return { component: 'page_faq', extra: {} };
    return { component: 'page_hub', extra: {} };
  }

  const stories: SeedStory[] = [];
  const NO_APPEND = new Set(['page_legal', 'page_contact']);
  let position = 0;

  for (const [nlPath, entry] of Object.entries(slugMap)) {
    position++;
    if (!entry.de) continue;
    const id = idOf(nlPath);
    const dePage = join(root, 'content-src', 'de', `${id}.json`);
    if (!existsSync(dePage)) { report.missing.push(nlPath); continue; }
    const de = readJson<DePage>('content-src', 'de', `${id}.json`);
    const nl = readJson<NlPage>('content-src', 'nl', `${id}.json`);
    report.translated++;
    const full = entry.de === '/' ? 'home' : entry.de.replace(/^\//, '');
    const { component, extra } = mapType(nlPath, nl);
    const h1 = de.h1.trim();
    const { bloks } = toBloks(de.blocks, full, nlPath, h1);
    for (const c of de.notes?.claims ?? []) report.claims.push({ page: entry.de, text: c });
    for (const c of de.notes?.nl_specific ?? []) report.nlSpecific.push({ page: entry.de, text: c });

    const present = existing.get(full);
    if (present) {
      if (NO_APPEND.has(String(present.content.component))) { report.skippedExisting.push(`${entry.de} (${present.content.component}: bestehende Seite bleibt, niederländischer Text nicht übernommen)`); continue; }
      const c = present.content as Node;
      c.body = [...(c.body ?? []), ...bloks];
      report.appended.push(`${entry.de} (+${bloks.length} Bloks)`);
      continue;
    }

    const content: Node = {
      component, h1, nav_title: h1.length <= 38 ? h1 : undefined, seo_title: de.seo_title.trim(), seo_description: de.seo_description.trim(), intro: fitIntro(de.intro),
      ...(entry.noindex ? { noindex: true } : {}), ...extra,
    };
    if (component === 'page_brand') content.brand_name = BRAND_NAMES[extra.brand_name] ?? extra.brand_name.split('-').map((w: string) => w[0]!.toUpperCase() + w.slice(1)).join(' ');
    if (component === 'page_brand') content.revision_text = `Für ${content.brand_name}-Pumpen können Sie Ersatzteile und eine Revision anfragen. Ob und in welchem Umfang das möglich ist, hängt von Serie, Baujahr und Ausführung ab; das Typenschild genügt für eine erste Einschätzung.`;
    if (component === 'page_series') {
      content.series_name = seriesName(h1, entry.de, extra.series_name);
      content.pump_type = SERIES_PUMP_TYPE[full.split('/').pop()!] ?? 'kreiselpumpen';
      content.use_case_line = (h1.includes(':') ? h1.split(':').slice(1).join(':').trim() : de.intro.split(/(?<=\.)\s/)[0]!).slice(0, 120);
    }
    if (component === 'page_job') content.job_title = h1;
    if (component === 'page_case_study') content.customer = h1;
    if (component === 'page_blog_post' || component === 'page_knowledge' || component === 'page_case_study') {
      const date = newsDates[nlPath]; if (date) content.publication_date = date;
    }
    if (component === 'page_blog_post' || component === 'page_knowledge') {
      // first run of text → article; everything after it stays in body
      const first = bloks[0]?.component === 'rich_text' ? bloks.shift()! : undefined;
      content.article = first ? first.content : { type: 'doc', content: [] };
      content.body = bloks;
      if (component === 'page_blog_post') { const img = bloks.findIndex((b) => b.component === 'image_block'); if (img === 0) { content.image = bloks.shift()!.image; } }
    } else content.body = bloks;
    for (const k of Object.keys(content)) if (content[k] === undefined) delete content[k];

    stories.push({ id: storyId(full), uuid: uuidOf(full), name: h1, slug: full.split('/').pop()!, full_slug: full, position, content });
  }

  report.unresolvedLinks = [...unresolved].sort();
  // SEO field limits
  for (const s of stories) {
    const c = s.content as Node;
    if (!c.seo_title || c.seo_title.length > TITLE_MAX) report.errors.push(`${s.full_slug}: seo_title length ${String(c.seo_title ?? '').length}`);
    if (!c.seo_description || c.seo_description.length > DESCRIPTION_MAX) report.errors.push(`${s.full_slug}: seo_description length ${String(c.seo_description ?? '').length}`);
  }
  return { stories, report };
}
