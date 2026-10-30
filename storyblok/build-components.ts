/**
 * Storyblok component model (single source). Run `npm run sb:components` to (re)write storyblok/components/*.json.
 * Editor-facing descriptions are German. Content types restrict which bloks they accept.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { APPLICATIONS, PUMP_TYPES, SEGMENTS } from '../src/lib/taxonomy';

type Field = Record<string, unknown>;
interface Def {
  name: string; display_name: string; root?: boolean; nestable?: boolean;
  fields: Record<string, Field>;
  tabs?: Record<string, { display_name: string; keys: string[] }>;
}

const opts = (list: { slug: string; label: string }[]) => list.map((o) => ({ name: o.label, value: o.slug }));
const text = (description: string, extra: Field = {}): Field => ({ type: 'text', description, ...extra });
const area = (description: string, extra: Field = {}): Field => ({ type: 'textarea', description, ...extra });
const rich = (description: string): Field => ({ type: 'richtext', description, rich_markdown: false });
const num = (description: string, extra: Field = {}): Field => ({ type: 'number', description, ...extra });
const bool = (description: string): Field => ({ type: 'boolean', description, default_value: false });
const option = (description: string, list: { name: string; value: string }[], extra: Field = {}): Field => ({ type: 'option', source: 'self', options: list, description, ...extra });
const options = (description: string, list: { name: string; value: string }[]): Field => ({ type: 'options', source: 'self', options: list, description });
const asset = (description: string): Field => ({ type: 'asset', filetypes: ['images'], description });
const link = (description: string, extra: Field = {}): Field => ({ type: 'multilink', description, email_link_type: true, asset_link_type: true, ...extra });
const bloks = (description: string, whitelist: string[], extra: Field = {}): Field => ({ type: 'bloks', restrict_components: true, component_whitelist: whitelist, description, ...extra });

const BODY_SLOT = ['rich_text', 'card_grid', 'cta_band', 'faq', 'spec_table', 'download_list', 'steps', 'related_links', 'image_text', 'image_block', 'data_table', 'button_row'];

/** SEO + common fields shared by every page type. */
const common = (): Record<string, Field> => ({
  h1: text('Haupt-Überschrift (genau ein H1 pro Seite). Enthält das Hauptthema.', { required: true }),
  intro: area('Einleitung in höchstens zwei Sätzen: Was ist das und für wen? Wird als Zitat-Antwort gelesen.', { required: true, max_length: 320 }),
  nav_title: text('Kurzname für Brotkrumen, Navigation und Karten (z. B. „DIWA-Serie“).'),
  seo_title: text('Seitentitel für Google, höchstens 60 Zeichen.', { max_length: 60, required: true }),
  seo_description: area('Meta-Beschreibung, höchstens 155 Zeichen.', { max_length: 155, required: true }),
  noindex: bool('Nur für Sonderfälle: Seite von der Suche ausschließen. Rechtstexte bleiben indexierbar.'),
});
const seoTab = { seo: { display_name: 'SEO', keys: ['seo_title', 'seo_description', 'noindex'] } };
const bodySlot = (): Record<string, Field> => ({ body: bloks('Optionale Zusatz-Bausteine. Die Pflicht-Abschnitte sind im Template fest eingebaut.', BODY_SLOT) });
const ctaSlot = (): Record<string, Field> => ({ cta: bloks('Optionales Abschluss-Banner. Ohne Eintrag erscheint der Standard-CTA des Templates.', ['cta_band'], { maximum: 1 }) });
const faq = (): Record<string, Field> => ({ faq: bloks('FAQ-Block (3–5 Fragen). Erzeugt auch FAQPage-Daten.', ['faq'], { maximum: 1 }) });

const DEFS: Def[] = [
  /* ---------- content types (templates) ---------- */
  { name: 'page_home', display_name: 'T1 · Startseite', root: true,
    fields: { ...common(), service_type: text('Leistungsart für das Service-Schema der Startseite.'), hero: bloks('Hero mit Kernaussage und zwei Buttons (Pumpe finden / Angebot anfordern).', ['hero'], { maximum: 1 }), tiles: bloks('Einstiegs-Kacheln: Pumpentypen, Branchen, Anwendungen, Marken.', ['card_grid'], { maximum: 1 }), revision: bloks('Revision-Teaser (Overhaul-Farbe).', ['cta_band'], { maximum: 1 }), brands: bloks('Marken-Leiste (wird automatisch aus den Marken-Seiten gebaut).', ['logo_strip'], { maximum: 1 }), references: bloks('Referenzen-Teaser.', ['cta_band'], { maximum: 1 }), school: bloks('Pumpenschule-Teaser.', ['cta_band'], { maximum: 1 }), contact: bloks('Kontakt-CTA.', ['cta_band'], { maximum: 1 }), body: bloks('Optionale Zusatz-Bausteine.', BODY_SLOT) },
    tabs: seoTab },
  { name: 'page_hub', display_name: 'T2 · Hub / Übersicht', root: true,
    fields: { ...common(), service_type: text('Optional: Leistungsart, wenn die Übersicht als Service ausgezeichnet werden soll.'), child_heading: text('Überschrift über dem Raster der Unterseiten.'), body_text: rich('Optionaler Text unter dem Raster.'), ...bodySlot(), ...ctaSlot() }, tabs: seoTab },
  { name: 'page_topic', display_name: 'T3 · Thema (Branche / Anwendung / Pumpentyp)', root: true,
    fields: { ...common(), service_type: text('Leistungsart für das Service-Schema, z. B. „Pumpen für die Trinkwasserversorgung“.'), topic_kind: option('Art des Themas.', [{ name: 'Branche', value: 'branche' }, { name: 'Anwendung', value: 'anwendung' }, { name: 'Pumpentyp', value: 'pumpentyp' }], { required: true }), tag: text('Taxonomie-Schlüssel (z. B. „tauchmotorpumpen“). Passende Serien werden automatisch verlinkt.'), challenges: rich('Typische Herausforderungen.'), related: bloks('Passende Pumpentypen / Anwendungen (Querverweise).', ['related_links']), technical_notes: rich('Technische Hinweise.'), ...faq(), ...bodySlot(), ...ctaSlot() }, tabs: seoTab },
  { name: 'page_brand', display_name: 'T4 · Marke (Hersteller)', root: true,
    fields: { ...common(), brand_name: text('Markenname exakt wie beim Hersteller (z. B. „Lowara“).', { required: true }), manufacturer_url: text('Offizielle Website des Herstellers (nur wenn bekannt).'), same_as: area('Offizielle Profile des Herstellers, eine URL pro Zeile (optional).'), parent_company: text('Muttergesellschaft, z. B. „Xylem“ (optional).'), parent_company_url: text('Website der Muttergesellschaft (optional).'), logo: asset('Logo der Marke.'), body_text: rich('Wofür der Hersteller bekannt ist – sachlich und überprüfbar.'), revision_text: area('Ein Absatz zur Revision von Pumpen dieser Marke.', { required: true }), ...faq(), ...bodySlot(), ...ctaSlot() }, tabs: seoTab },
  { name: 'page_series', display_name: 'T5 · Serie', root: true,
    fields: { ...common(), series_name: text('Serienname ohne „-Serie“ (z. B. „DIWA“). Der URL-Slug lautet „diwa-serie“.', { required: true }), pump_type: option('Pumpentyp (verbindet Serien markenübergreifend).', opts(PUMP_TYPES), { required: true }), segments: options('Branchen (aus den Produktdaten).', opts(SEGMENTS)), applications: options('Anwendungen.', opts(APPLICATIONS)), use_case_line: text('Eine Zeile zum Einsatz, erscheint in den Karten der Marken-Seite.', { required: true }), body_text: rich('Beschreibung der Serie.'), highlights: area('Merkmale, eine Zeile pro Punkt.'), image: asset('Serienbild.'), image_source: text('Quellpfad des Bildes im Altsystem (für die Asset-Migration).'), flow_max_m3h: num('Förderstrom max. in m³/h (aus den Produktdaten).'), head_max_m: num('Förderhöhe max. in m.'), power_min_kw: num('Kleinste Motorleistung in kW.'), power_max_kw: num('Größte Motorleistung in kW.'), temp_max_c: num('Max. Medientemperatur in °C.'), materials: text('Werkstoffe der Serie.'), catalogue_count: num('Anzahl Artikel im Katalog.'), downloads: bloks('Datenblatt / Kennlinie der Serie.', ['download_list'], { maximum: 1 }), ...faq(), ...bodySlot(), ...ctaSlot() }, tabs: seoTab },
  { name: 'page_product', display_name: 'T6 · Produkt (L3)', root: true,
    fields: { ...common(), article_number: text('Artikel-/Modellbezeichnung des Herstellers (wird zu SKU, MPN und URL).', { required: true }), name: text('Produktname (z. B. „DIWA 07/B“).', { required: true }), short_description: area('Kurzbeschreibung, 60–120 Wörter.', { required: true }), image: asset('Produktbild.'), image_source: text('Quellpfad des Bildes im Altsystem.'), gallery: { type: 'multiasset', filetypes: ['images'], description: 'Weitere Bilder.' }, highlights: area('Merkmale, eine Zeile pro Punkt.'), key_facts: bloks('Genau bis zu 4 Kennwerte für die Kennwert-Leiste.', ['key_fact'], { maximum: 4 }), specs: bloks('Technische Daten, gruppiert (Hydraulik, Motor/Elektrik, Werkstoffe, Anschlüsse & Abmessungen). Leere Werte weglassen.', ['spec_row']), flow_max_m3h: num('Förderstrom max. in m³/h (Zahl, für Filter und Schema).'), head_max_m: num('Förderhöhe max. in m (Zahl).'), power_kw: num('Motorleistung in kW (Zahl).'), voltage: option('Spannung (Filter).', ['230 V', '400 V', '230/400 V', '400/690 V'].map((v) => ({ name: v, value: v }))), material: option('Werkstoff Gehäuse (Filter).', ['Gusseisen', 'Edelstahl', 'Bronze', 'Thermoplast', 'Messing', 'Stahlguss'].map((v) => ({ name: v, value: v }))), downloads: bloks('Datenblatt, Kennlinie, Handbuch.', ['download_list'], { maximum: 1 }), gtin: text('GTIN/EAN (optional).'), price: num('Preis in EUR – nur ausfüllen, wenn ein verbindlicher Preis vorliegt. Erzeugt sonst kein Angebots-Schema.'), availability: option('Verfügbarkeit (nur mit Preis).', ['InStock', 'OutOfStock', 'PreOrder', 'BackOrder', 'LimitedAvailability'].map((v) => ({ name: v, value: v }))), internal_item_number: text('Interne Artikelnummer (nicht öffentlich ausgespielt).'), ...bodySlot(), ...ctaSlot() }, tabs: seoTab },
  { name: 'page_service', display_name: 'T7 · Leistung / Revision', root: true,
    fields: { ...common(), service_kind: option('Art der Leistung. Revision-Seiten nutzen die Overhaul-Farbe.', [{ name: 'Revision', value: 'revision' }, { name: 'Revision nach Pumpentyp', value: 'revision-typ' }, { name: 'Wartung', value: 'wartung' }, { name: 'Inspektion', value: 'inspektion' }, { name: 'Leistung', value: 'leistung' }], { required: true }), service_type: text('Leistungsart für Schema, z. B. „Pumpenrevision“.'), steps: bloks('Ablauf (nur echte Schrittfolgen).', ['steps'], { maximum: 1 }), included: rich('Was enthalten ist.'), covered: bloks('Abgedeckte Pumpentypen / Marken.', ['related_links']), ...faq(), ...bodySlot(), ...ctaSlot() }, tabs: seoTab },
  { name: 'page_course', display_name: 'T8 · Kurs', root: true,
    fields: { ...common(), goals: rich('Lernziele.'), audience: text('Zielgruppe.'), duration: text('Dauer.'), mode: option('Format.', [{ name: 'Präsenz', value: 'onsite' }, { name: 'Online', value: 'online' }, { name: 'Blended Learning', value: 'blended' }]), level: text('Niveau.'), dates: area('Termine (nur reale Termine).'), ...bodySlot(), ...ctaSlot() }, tabs: seoTab },
  { name: 'page_knowledge', display_name: 'T9 · Wissensartikel', root: true,
    fields: { ...common(), publication_date: text('Veröffentlichungsdatum (JJJJ-MM-TT). Wird für das Artikel-Schema genutzt.'), article: rich('Artikeltext. Zwischenüberschriften (H2) erzeugen das Inhaltsverzeichnis.'), author: text('Autor (optional, sonst Organisation).'), tech: bool('Technischer Artikel (TechArticle).'), downloads: bloks('Downloads.', ['download_list'], { maximum: 1 }), related: bloks('Verwandte Themen.', ['related_links'], { maximum: 1 }), ...bodySlot() }, tabs: seoTab },
  { name: 'page_blog_post', display_name: 'T10 · Blogbeitrag', root: true,
    fields: { ...common(), publication_date: text('Veröffentlichungsdatum (JJJJ-MM-TT). Wird für das BlogPosting-Schema genutzt.'), article: rich('Beitragstext.'), author: text('Autor (optional, sonst Organisation).'), image: asset('Titelbild.'), related: bloks('Verwandte Beiträge.', ['related_links'], { maximum: 1 }), ...bodySlot() }, tabs: seoTab },
  { name: 'page_case_study', display_name: 'T11 · Referenz / Fallstudie', root: true,
    fields: { ...common(), publication_date: text('Veröffentlichungsdatum (JJJJ-MM-TT), falls bekannt.'), customer: text('Kunde – nur mit Freigabe.'), situation: rich('Ausgangslage.'), solution: rich('Lösung.'), result: rich('Ergebnis – nur belegte Zahlen.'), products: bloks('Eingesetzte Produkte (Links).', ['related_links'], { maximum: 1 }), ...bodySlot() }, tabs: seoTab },
  { name: 'page_listing', display_name: 'T12 · Liste (Blog / Referenzen)', root: true,
    fields: { ...common(), listing_kind: option('Art der Liste.', [{ name: 'Blog', value: 'blog' }, { name: 'Referenzen', value: 'referenzen' }]), per_page: num('Einträge pro Seite.', { default_value: '10' }), ...bodySlot(), ...ctaSlot() }, tabs: seoTab },
  { name: 'page_contact', display_name: 'T13 · Kontakt / Angebot', root: true,
    fields: { ...common(), form_kind: option('Welches Formular.', [{ name: 'Kontakt', value: 'kontakt' }, { name: 'Angebot anfordern', value: 'angebot' }, { name: 'Rückruf', value: 'rueckruf' }], { required: true }), default_anliegen: text('Vorbelegung „Anliegen“ im Angebotsformular, z. B. ersatzpumpe.'), form_intro: area('Text über dem Formular.'), ...bodySlot() }, tabs: seoTab },
  { name: 'page_job', display_name: 'T15 · Stellenanzeige (JobPosting)', root: true,
    fields: { ...common(), job_title: text('Berufsbezeichnung für das JobPosting-Schema.'), employment_type: option('Anstellungsart.', [{ name: 'Vollzeit', value: 'FULL_TIME' }, { name: 'Teilzeit', value: 'PART_TIME' }, { name: 'Werkstudent/Praktikum', value: 'INTERN' }]), date_posted: text('Veröffentlichungsdatum der Stelle (JJJJ-MM-TT). Ohne Datum wird es nicht ausgegeben.'), valid_through: text('Bewerbungsschluss (JJJJ-MM-TT), optional.'), location_note: text('Einsatzort (Ort, Land). Ohne Angabe wird kein Ort ausgegeben.'), ...faq(), ...bodySlot() }, tabs: seoTab },
  { name: 'page_about', display_name: 'T16 · Über uns / Unternehmen (AboutPage)', root: true,
    fields: { ...common(), ...faq(), ...bodySlot(), ...ctaSlot() }, tabs: seoTab },
  { name: 'page_faq', display_name: 'T17 · FAQ-Seite (FAQPage)', root: true,
    fields: { ...common(), ...bodySlot(), ...ctaSlot() }, tabs: seoTab },
  { name: 'page_legal', display_name: 'T14 · Rechtstext', root: true,
    fields: { ...common(), legal_kind: option('Art des Rechtstextes.', [{ name: 'Impressum', value: 'impressum' }, { name: 'Datenschutz', value: 'datenschutz' }, { name: 'AGB', value: 'agb' }]), text: rich('Volltext.'), review_note: area('Interner Hinweis (wird sichtbar angezeigt, bis er geleert wird), z. B. „Rechtlich prüfen lassen“.') }, tabs: seoTab },
  { name: 'config', display_name: 'Globale Einstellungen', root: true,
    fields: { site_name: text('Marken-/Seitenname, z. B. für Titel und Schema.', { required: true }), legal_name: text('Juristischer Firmenname.'), legal_form: text('Rechtsform.'), street: text('Straße und Hausnummer.'), postal_code: text('PLZ.'), city: text('Ort.'), country_code: text('Ländercode, z. B. DE.', { default_value: 'DE' }), phone: text('Telefon.'), email: text('E-Mail.'), opening_hours: text('Öffnungszeiten.'), vat_id: text('USt-IdNr.'), register_number: text('Handelsregister-/KvK-Nummer.'), postal_address: text('Postanschrift, falls abweichend von der Hausanschrift.'), footer_about: area('Kurztext über dem Footer.'), footer_usps: area('Vorteile im Footer, eine Zeile pro Punkt.'), logo: asset('Logo.'), social: area('Social-Profile, eine URL pro Zeile (sameAs).'), map_embed_url: text('Karten-Embed-URL (lädt erst nach Einwilligung).'), authorised_dealer_brands: area('Marken, für die offizieller Händlerstatus belegt ist, eine pro Zeile. Ohne Eintrag wird nie ein Händlerstatus behauptet.'), default_description: area('Standard-Meta-Beschreibung.'), header_nav: bloks('Hauptnavigation.', ['nav_item']), footer_groups: bloks('Footer-Spalten.', ['nav_group']) } },

  /* ---------- nestable bloks ---------- */
  { name: 'hero', display_name: 'Hero', nestable: true, fields: { headline: text('Eine klare Kernaussage (H1).', { required: true }), subline: area('Unterzeile.'), primary_label: text('Button 1, z. B. „Pumpe finden“.'), primary_link: link('Ziel Button 1.'), secondary_label: text('Button 2, z. B. „Angebot anfordern“.'), secondary_link: link('Ziel Button 2.'), image: asset('Bild.') } },
  { name: 'rich_text', display_name: 'Text', nestable: true, fields: { content: rich('Fließtext.') } },
  { name: 'card', display_name: 'Karte', nestable: true, fields: { title: text('Titel.', { required: true }), text: area('Kurztext.'), link: link('Ziel.'), meta: text('Zusatzzeile, z. B. Kennwerte.'), image: asset('Bild.') } },
  { name: 'card_grid', display_name: 'Karten-Raster', nestable: true, fields: { heading: text('Überschrift.'), intro: area('Einleitung.'), cards: bloks('Karten. Karten mit noch nicht vorhandenem Ziel werden automatisch ausgeblendet.', ['card']) } },
  { name: 'cta_band', display_name: 'CTA-Banner', nestable: true, fields: { heading: text('Überschrift.', { required: true }), text: area('Text.'), button_label: text('Beschriftung sagt, was passiert (z. B. „Angebot anfordern“).', { required: true }), button_link: link('Ziel.'), variant: option('Farbe: Revision-Banner nutzen „overhaul“.', [{ name: 'Primär', value: 'primary' }, { name: 'Overhaul (Revision)', value: 'overhaul' }]) } },
  { name: 'faq_item', display_name: 'FAQ-Frage', nestable: true, fields: { question: text('Frage.', { required: true }), answer: area('Antwort (Klartext).', { required: true }) } },
  { name: 'faq', display_name: 'FAQ', nestable: true, fields: { heading: text('Überschrift.'), items: bloks('3–5 Fragen.', ['faq_item'], { maximum: 8 }) } },
  { name: 'spec_row', display_name: 'Datenzeile', nestable: true, fields: { group: option('Gruppe.', ['Hydraulik', 'Motor/Elektrik', 'Werkstoffe', 'Anschlüsse & Abmessungen'].map((v) => ({ name: v, value: v }))), label: text('Merkmal.', { required: true }), value: text('Angezeigter Wert (deutsches Zahlenformat, z. B. „7,5“).', { required: true }), unit: text('Einheit, z. B. „kW“.'), value_num: num('Maschinenlesbarer Wert (Punkt als Dezimaltrenner) für das Schema. Leer lassen bei Text.') } },
  { name: 'spec_table', display_name: 'Datentabelle', nestable: true, fields: { heading: text('Überschrift.'), rows: bloks('Zeilen.', ['spec_row']) } },
  { name: 'key_fact', display_name: 'Kennwert', nestable: true, fields: { label: text('Bezeichnung.', { required: true }), value: text('Wert.', { required: true }), unit: text('Einheit.') } },
  { name: 'download_item', display_name: 'Download', nestable: true, fields: { label: text('Beschriftung, z. B. „Datenblatt herunterladen (PDF)“.', { required: true }), file: { type: 'asset', filetypes: ['pdfs', 'images'], description: 'Datei. Ohne Datei wird der Eintrag nicht angezeigt.' }, kind: option('Art.', [{ name: 'Datenblatt', value: 'datenblatt' }, { name: 'Kennlinie', value: 'kennlinie' }, { name: 'Handbuch', value: 'handbuch' }, { name: 'Sonstiges', value: 'sonstiges' }]) } },
  { name: 'download_list', display_name: 'Downloads', nestable: true, fields: { heading: text('Überschrift.'), items: bloks('Dateien.', ['download_item']) } },
  { name: 'step', display_name: 'Schritt', nestable: true, fields: { title: text('Schritt.', { required: true }), text: area('Beschreibung.') } },
  { name: 'steps', display_name: 'Ablauf', nestable: true, fields: { heading: text('Überschrift.'), items: bloks('Nur echte Reihenfolgen (z. B. Revisionsablauf).', ['step']) } },
  { name: 'logo_strip', display_name: 'Marken-Leiste', nestable: true, fields: { heading: text('Überschrift. Die Marken kommen automatisch aus den Marken-Seiten.') } },
  { name: 'link_item', display_name: 'Link', nestable: true, fields: { label: text('Sprechender Linktext (kein „hier klicken“).', { required: true }), link: link('Ziel.'), description: text('Kurzbeschreibung.') } },
  { name: 'related_links', display_name: 'Verwandte Links', nestable: true, fields: { heading: text('Überschrift.'), links: bloks('Links. Links auf noch nicht vorhandene Seiten werden automatisch ausgeblendet.', ['link_item']) } },
  { name: 'image_text', display_name: 'Bild + Text', nestable: true, fields: { image: asset('Bild.'), text: rich('Text.'), side: option('Bildseite.', [{ name: 'Rechts', value: 'right' }, { name: 'Links', value: 'left' }]) } },
  { name: 'image_block', display_name: 'Bild', nestable: true, fields: { image: asset('Bild.'), caption: text('Bildunterschrift (optional). Der Alt-Text steht im Bildfeld.') } },
  { name: 'data_table', display_name: 'Tabelle', nestable: true, fields: { heading: text('Überschrift (optional).'), table: { type: 'table', description: 'Tabelle mit Kopfzeile.' } } },
  { name: 'button_row', display_name: 'Buttons', nestable: true, fields: { buttons: bloks('Buttons mit sprechender Beschriftung („Angebot anfordern“, nicht „Hier klicken“).', ['link_item']) } },
  { name: 'nav_item', display_name: 'Navigationspunkt', nestable: true, fields: { label: text('Beschriftung.', { required: true }), link: link('Ziel.') } },
  { name: 'nav_group', display_name: 'Navigationsgruppe', nestable: true, fields: { label: text('Gruppenname.', { required: true }), items: bloks('Punkte.', ['nav_item']) } },
];

const out = join(import.meta.dirname, 'components');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const d of DEFS) {
  const schema: Record<string, Field> = {};
  const keys = Object.keys(d.fields);
  keys.forEach((k, i) => { schema[k] = { ...d.fields[k], pos: i }; });
  for (const [tab, t] of Object.entries(d.tabs ?? {})) schema[`tab-${tab}`] = { type: 'tab', display_name: t.display_name, keys: t.keys };
  const component = { name: d.name, display_name: d.display_name, is_root: Boolean(d.root), is_nestable: Boolean(d.nestable), schema };
  writeFileSync(join(out, `${d.name}.json`), JSON.stringify({ component }, null, 2) + '\n');
}
console.log(`${DEFS.length} component schemas written to storyblok/components/`);
