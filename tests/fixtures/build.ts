/**
 * Fixture stories for templates that have no live content yet (T3, T7–T12) and for edge cases:
 * a series with several products (filters, ItemList, hasVariant), a priced product (Offer), a series without products (empty state).
 * Built only with INCLUDE_FIXTURES=1 (npm run build:fixtures); excluded from the sitemap, noindex.
 *   npx tsx tests/fixtures/build.ts
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { bullets, doc, heading, para, story, storyLink, type SeedStory } from '../../scripts/lib/stories';

const out = join(import.meta.dirname);
for (const f of readdirSync(out)) if (f.endsWith('.json')) rmSync(join(out, f));

const F = (slug: string) => `__fixtures__/${slug}`;
const faq = (seed: string) => ({ _uid: `${seed}-faq`, component: 'faq', heading: 'Häufige Fragen', items: [
  { _uid: `${seed}-q1`, component: 'faq_item', question: 'Wie wähle ich die richtige Größe?', answer: 'Anhand von Förderstrom, Förderhöhe und Medium. Das Typenschild der vorhandenen Pumpe genügt für eine erste Einschätzung.' },
  { _uid: `${seed}-q2`, component: 'faq_item', question: 'Ist eine Revision möglich?', answer: 'Das hängt von Serie, Baujahr und Zustand ab. Wir prüfen es nach Eingang der Typenschilddaten.' },
  { _uid: `${seed}-q3`, component: 'faq_item', question: 'Welche Unterlagen benötigen Sie?', answer: 'Typenschild oder Foto, Betriebsdaten und das Fördermedium.' },
] });
const links = (seed: string, heading: string, items: [string, string, string?][]) => ({ _uid: `${seed}-rel`, component: 'related_links', heading, links: items.map(([label, slug, description], i) => ({ _uid: `${seed}-l${i}`, component: 'link_item', label, link: storyLink(slug), description })) });
const asset = (name: string) => ({ filename: `https://a.storyblok.com/f/000000/fixture/${name}`, alt: name });
const spec = (group: string, label: string, value: string, unit?: string, value_num?: number, i = 0) => ({ _uid: `s-${label}-${i}`, component: 'spec_row', group, label, value, ...(unit ? { unit } : {}), ...(value_num !== undefined ? { value_num } : {}) });

const stories: SeedStory[] = [];
const dated = (s: SeedStory, iso: string): SeedStory => ({ ...s, ...({ created_at: iso, first_published_at: iso, published_at: iso } as object) });

/* ----- brand / series / products (edge cases) ----- */
stories.push(story(F('pumpen/marken/testmarke'), 'Testmarke', {
  component: 'page_brand', brand_name: 'Testmarke', h1: 'Testmarke Pumpen – Serien, Einsatzbereiche und Revision', nav_title: 'Testmarke',
  seo_title: 'Testmarke Pumpen: Serien und Revision', seo_description: 'Fixture für das Marken-Template mit Muttergesellschaft, Hersteller-URL und Serien-Raster.',
  intro: 'Testmarke ist eine erfundene Marke für Template-Tests. Diese Seite prüft Hersteller-Schema, Serien-Raster und FAQ.',
  manufacturer_url: 'https://example.com/testmarke', same_as: 'https://example.com/profil-a\nhttps://example.com/profil-b', parent_company: 'Xylem', parent_company_url: 'https://example.com/xylem',
  body_text: doc(para('Fließtext der Marken-Seite.')), revision_text: 'Eine Revision kann je nach Zustand der Pumpe den Austausch von Verschleißteilen umfassen.',
  faq: [faq('brand')],
}));
stories.push(story(F('pumpen/marken/testmarke/testserie-serie'), 'Testserie-Serie', {
  component: 'page_series', series_name: 'Testserie', h1: 'Testmarke Testserie – Tauchmotorpumpen für Test', nav_title: 'Testserie-Serie',
  seo_title: 'Testmarke Testserie: Tauchmotorpumpen', seo_description: 'Fixture für das Serien-Template mit drei Produkten, Filtern, Downloads und Kennbereichen.',
  intro: 'Die Testserie besteht aus drei Test-Artikeln. Sie prüft Produktliste, Filter und Kennbereiche.', pump_type: 'tauchmotorpumpen', segments: ['landwirtschaft'], applications: ['entwaesserung'],
  use_case_line: 'Tauchmotorpumpen für Template-Tests', body_text: doc(para('Beschreibung der Testserie.')), highlights: 'Erstes Merkmal\nZweites Merkmal',
  flow_max_m3h: 30, head_max_m: 18, power_min_kw: 0.55, power_max_kw: 2.2, temp_max_c: 40, materials: 'Gusseisen, Edelstahl', catalogue_count: 3,
  downloads: [{ _uid: 'dl1', component: 'download_list', heading: 'Downloads', items: [{ _uid: 'dl1a', component: 'download_item', label: 'Datenblatt herunterladen (PDF)', file: asset('datenblatt.pdf'), kind: 'datenblatt' }, { _uid: 'dl1b', component: 'download_item', label: 'Kennlinie ohne Datei', kind: 'kennlinie' }] }],
  faq: [faq('series')],
}));
stories.push(story(F('pumpen/marken/testmarke/leere-serie'), 'Leere-Serie', {
  component: 'page_series', series_name: 'Leere', h1: 'Testmarke Leere Serie – noch ohne Produkte', nav_title: 'Leere-Serie',
  seo_title: 'Testmarke Leere Serie: Kreiselpumpen', seo_description: 'Fixture für eine Serie ohne Produkte: Leerzustand, ProductGroup ohne hasVariant, keine leere ItemList.',
  intro: 'Diese Serie hat noch keine Produktseiten. Sie prüft den Leerzustand.', pump_type: 'kreiselpumpen', use_case_line: 'Kreiselpumpen ohne Produkte', body_text: doc(para('Beschreibung.')),
}));
const product = (slug: string, name: string, power: number, flow: number, head: number, extra: object = {}) => story(F(`pumpen/marken/testmarke/testserie-serie/${slug}`), name, {
  component: 'page_product', article_number: name, name, nav_title: name, h1: `Testmarke ${name} – Tauchmotorpumpe für Test`,
  seo_title: `Testmarke ${name} – Tauchmotorpumpe`, seo_description: `Fixture-Produkt ${name} mit Leistung, Förderstrom und Förderhöhe.`, intro: `Die Testmarke ${name} ist ein Fixture-Produkt.`,
  short_description: `Die Testmarke ${name} ist eine Tauchmotorpumpe der Testserie für Template-Tests. Sie hat eine Motorleistung von ${power} kW. Dieser Text prüft die Kurzbeschreibung, die Kennwert-Leiste, die gruppierte Datentabelle und die Verknüpfung zu Serie und Marke. Für die Auslegung im Bestand senden Sie uns Typenschild oder Betriebsdaten.`,
  key_facts: [{ _uid: `${slug}-k1`, component: 'key_fact', label: 'Förderstrom max.', value: String(flow).replace('.', ','), unit: 'm³/h' }, { _uid: `${slug}-k2`, component: 'key_fact', label: 'Motorleistung', value: String(power).replace('.', ','), unit: 'kW' }],
  specs: [spec('Hydraulik', 'Förderstrom max.', String(flow), 'm³/h', flow, 1), spec('Hydraulik', 'Förderhöhe max.', String(head), 'm', head, 2), spec('Motor/Elektrik', 'Motorleistung', String(power).replace('.', ','), 'kW', power, 3), spec('Werkstoffe', 'Pumpengehäuse', 'Gusseisen', undefined, undefined, 4), spec('Anschlüsse & Abmessungen', 'Druckanschluss', 'DN 50', undefined, undefined, 5)],
  flow_max_m3h: flow, head_max_m: head, power_kw: power, voltage: '230/400 V', material: 'Gusseisen',
  downloads: [{ _uid: `${slug}-dl`, component: 'download_list', items: [{ _uid: `${slug}-dli`, component: 'download_item', label: 'Datenblatt herunterladen (PDF)', file: asset(`${slug}.pdf`) }] }],
  ...extra,
});
stories.push(product('tp-100', 'TP 100', 0.55, 10, 8));
stories.push(product('tp-200', 'TP 200', 1.1, 20, 12, { price: 1499, availability: 'InStock', gtin: '04012345678901' }));
stories.push(product('tp-300', 'TP 300', 2.2, 30, 18, { voltage: '400 V', material: 'Edelstahl' }));

/* ----- T3 topic ----- */
stories.push(story(F('topic-pumpentyp'), 'Tauchmotorpumpen', {
  component: 'page_topic', topic_kind: 'pumpentyp', tag: 'tauchmotorpumpen', h1: 'Tauchmotorpumpen', nav_title: 'Tauchmotorpumpen',
  seo_title: 'Tauchmotorpumpen: Auswahl und Einsatz', seo_description: 'Fixture für das Themen-Template: Tauchmotorpumpen, Herausforderungen, passende Serien, technische Hinweise und FAQ.',
  intro: 'Tauchmotorpumpen arbeiten im Medium und fördern Wasser aus Schächten, Gruben und Behältern. Diese Seite prüft das Themen-Template.',
  challenges: doc(para('Typische Herausforderungen sind Feststoffe, schwankende Wasserstände und der Schutz vor Trockenlauf.')),
  related: [links('topic', 'Passende Anwendungen und Marken', [['Lowara Pumpen', 'pumpen/marken/lowara', 'Serien für Entwässerung'], ['Nicht vorhandene Seite', 'pumpen/anwendungen/gibt-es-nicht']])],
  technical_notes: doc(heading(3, 'Freier Durchgang'), para('Der freie Durchgang nennt die größte Feststoffgröße, die die Pumpe passieren kann.')),
  faq: [faq('topic')],
}));

/* ----- T7 service ----- */
const steps = (seed: string) => ({ _uid: `${seed}-steps`, component: 'steps', heading: 'Ablauf der Revision', items: [
  { _uid: `${seed}-s1`, component: 'step', title: 'Typenschild und Zustand erfassen', text: 'Sie senden uns Typenschild und Fotos der Pumpe.' },
  { _uid: `${seed}-s2`, component: 'step', title: 'Prüfung', text: 'Wir prüfen den Zustand und legen den Umfang fest.' },
  { _uid: `${seed}-s3`, component: 'step', title: 'Angebot', text: 'Sie erhalten ein Angebot für die Instandsetzung.' },
] });
stories.push(story(F('service-revision'), 'Pumpenrevision', {
  component: 'page_service', service_kind: 'revision', service_type: 'Pumpenrevision', h1: 'Pumpenrevision', nav_title: 'Pumpenrevision',
  seo_title: 'Pumpenrevision: Ablauf und Leistungsumfang', seo_description: 'Fixture für das Leistungs-Template (Revision): Ablauf als nummerierte Schrittfolge, Leistungsumfang, abgedeckte Marken und FAQ.',
  intro: 'Eine Revision stellt eine gebrauchte Pumpe instand, statt sie zu ersetzen. Diese Seite prüft das Leistungs-Template in der Overhaul-Farbe.',
  steps: [steps('rev')], included: doc(bullets(['Prüfung der Pumpe', 'Austausch von Verschleißteilen', 'Funktionsprüfung'])),
  covered: [links('cov', 'Abgedeckte Marken', [['Lowara Pumpen', 'pumpen/marken/lowara'], ['Ebara Pumpen', 'pumpen/marken/ebara']])], faq: [faq('rev')],
}));
stories.push(story(F('service-wartung'), 'Vorbeugende Wartung', {
  component: 'page_service', service_kind: 'wartung', service_type: 'Vorbeugende Wartung', h1: 'Vorbeugende Wartung', nav_title: 'Vorbeugende Wartung',
  seo_title: 'Vorbeugende Wartung für Pumpen', seo_description: 'Fixture für das Leistungs-Template (Wartung) in der Primärfarbe: Intro, Leistungsumfang und CTA.',
  intro: 'Vorbeugende Wartung erkennt Verschleiß, bevor die Pumpe ausfällt. Diese Seite prüft das Leistungs-Template in der Primärfarbe.', included: doc(para('Regelmäßige Inspektion und Austausch von Verschleißteilen.')),
}));

/* ----- T8 course ----- */
stories.push(story(F('kurs'), 'Pumpengrundlagen', {
  component: 'page_course', h1: 'Kurs Pumpengrundlagen', nav_title: 'Pumpengrundlagen', seo_title: 'Kurs Pumpengrundlagen für Instandhalter', seo_description: 'Fixture für das Kurs-Template: Lernziele, Zielgruppe, Dauer, Format und Anmeldung.',
  intro: 'Der Kurs vermittelt die Grundlagen von Kreiselpumpen. Diese Seite prüft das Kurs-Template.', goals: doc(bullets(['Aufbau einer Kreiselpumpe', 'Kennlinie lesen'])), audience: 'Instandhaltung und Betrieb', duration: '1 Tag', mode: 'onsite', level: 'Einsteiger', dates: 'Termine nach Vereinbarung',
}));

/* ----- T9 knowledge ----- */
stories.push(dated(story(F('wissen-npsh'), 'NPSH erklärt', {
  component: 'page_knowledge', tech: true, author: 'Redaktion', h1: 'NPSH einfach erklärt', nav_title: 'NPSH erklärt', seo_title: 'NPSH einfach erklärt: Kavitation vermeiden', seo_description: 'Fixture für das Wissens-Template: Artikel mit Inhaltsverzeichnis, Download und verwandten Themen.',
  intro: 'Der NPSH-Wert beschreibt, wie viel Druckreserve am Pumpeneintritt vorhanden sein muss. Diese Seite prüft das Wissens-Template.',
  article: doc(heading(2, 'Was NPSH bedeutet'), para('Der NPSH-Wert der Anlage muss den NPSH-Bedarf der Pumpe übersteigen.'), heading(2, 'Kavitation vermeiden'), para('Zu geringe Druckreserve führt zu Dampfblasen und Schäden am Laufrad.'), heading(2, 'Praxis'), para('Prüfen Sie Zulaufhöhe, Leitungsverluste und Medientemperatur.')),
  downloads: [{ _uid: 'kn-dl', component: 'download_list', heading: 'Datenblätter', items: [{ _uid: 'kn-dli', component: 'download_item', label: 'Beispiel-Datenblatt (PDF)', file: asset('npsh.pdf') }] }],
  related: [links('kn', 'Verwandte Themen', [['Tauchmotorpumpen', '__fixtures__/topic-pumpentyp']])],
}), '2026-02-02T08:00:00.000Z'));

/* ----- T10 blog + T12 listing ----- */
stories.push(story(F('blog'), 'Blog', { component: 'page_listing', listing_kind: 'blog', per_page: 2, h1: 'Blog', nav_title: 'Blog', seo_title: 'Blog: Pumpen in der Praxis', seo_description: 'Fixture für das Listen-Template: drei Beiträge, zwei pro Seite, Seitennavigation.', intro: 'Beiträge rund um Auswahl, Betrieb und Revision von Pumpen. Diese Seite prüft das Listen-Template mit Paginierung.' }));
['Pumpe richtig auslegen', 'Gleitringdichtung prüfen', 'Revision oder Ersatz'].forEach((t, i) => {
  stories.push(dated(story(F(`blog/beitrag-${i + 1}`), t, {
    component: 'page_blog_post', h1: t, nav_title: t, author: i === 0 ? 'Redaktion' : undefined, seo_title: `${t}: Hinweise aus der Praxis`, seo_description: `Fixture-Beitrag ${i + 1} für das Blog-Template mit Autor, Datum und verwandten Beiträgen.`,
    intro: `Kurze Antwort auf die Kernfrage von Beitrag ${i + 1}. Diese Seite prüft das Blog-Template.`, article: doc(heading(2, 'Ausgangslage'), para('Fließtext des Beitrags.')),
    related: [links(`bp${i}`, 'Weiterlesen', [['Pumpenrevision', '__fixtures__/service-revision']])],
  }), `2026-0${i + 1}-1${i}T08:00:00.000Z`));
});

/* ----- T11 case study ----- */
stories.push(dated(story(F('referenz-test'), 'Referenz Test', {
  component: 'page_case_study', customer: '[[PLATZHALTER: Kundenname (nur mit Freigabe)]]', h1: 'Referenz: Revision einer Kreiselpumpe', nav_title: 'Referenz Test', seo_title: 'Referenz: Revision einer Kreiselpumpe', seo_description: 'Fixture für das Referenz-Template: Ausgangslage, Lösung, Ergebnis ohne erfundene Zahlen und eingesetzte Produkte.',
  intro: 'Eine Kreiselpumpe wurde instand gesetzt statt ersetzt. Diese Seite prüft das Referenz-Template.', situation: doc(para('Ausgangslage der Anlage.')), solution: doc(para('Instandsetzung der Pumpe.')), result: doc(para('Die Pumpe läuft wieder im Betrieb.')),
  products: [links('cs', 'Eingesetzte Produkte', [['DIWA-Serie', 'pumpen/marken/lowara/diwa-serie']])],
}), '2026-03-05T08:00:00.000Z'));

for (const s of stories) writeFileSync(join(out, `${s.full_slug.replace(/\//g, '__')}.json`), JSON.stringify(s, null, 2) + '\n');
mkdirSync(out, { recursive: true });
console.log(`${stories.length} fixture stories written to tests/fixtures/`);
