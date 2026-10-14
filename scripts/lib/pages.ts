/** Static pages: global settings, home, hubs, conversion pages and the legal skeletons (all placeholders for client facts). */
import { BRANDS } from '../../content-src/copy';
import { bullets, ctaBlok, doc, heading, link, para, story, storyLink, urlLink, type SeedStory } from './stories';
import { createHash } from 'node:crypto';

const uid = (s: string) => createHash('md5').update(s).digest('hex').slice(0, 12);
const P = (label: string) => `[[PLATZHALTER: ${label}]]`;
const navItem = (label: string, slug: string) => ({ _uid: uid(`nav-${label}-${slug}`), component: 'nav_item', label, link: storyLink(slug) });

export function configStory(): SeedStory {
  return story('config', 'config', {
    component: 'config',
    // ASSUMPTION A-07: the display name is taken from the sister brand "Industrial Pump Group". Confirm or replace.
    site_name: 'Industrial Pump Group',
    legal_name: P('Firmenname (juristisch)'), legal_form: P('Rechtsform'),
    street: P('Straße und Hausnummer'), postal_code: P('PLZ'), city: P('Ort'), country_code: 'DE',
    phone: P('Telefon'), email: P('E-Mail'), opening_hours: P('Öffnungszeiten'), vat_id: P('USt-IdNr.'),
    social: '', map_embed_url: '', authorised_dealer_brands: '',
    default_description: 'Industriepumpen für Gebäudetechnik, Wasserversorgung und Entwässerung: Auswahl, Angebot und Revision.',
    header_nav: [navItem('Pumpen', 'pumpen'), navItem('Marken', 'pumpen/marken')],
    footer_groups: [
      { _uid: uid('fg-pumpen'), component: 'nav_group', label: 'Pumpen', items: [navItem('Alle Pumpen', 'pumpen'), ...BRANDS.map((b) => navItem(b.name, `pumpen/marken/${b.slug}`))] },
      { _uid: uid('fg-firma'), component: 'nav_group', label: 'Unternehmen', items: [navItem('Angebot anfordern', 'angebot'), navItem('Kontakt', 'kontakt')] },
      { _uid: uid('fg-recht'), component: 'nav_group', label: 'Rechtliches', items: [navItem('Impressum', 'impressum'), navItem('Datenschutz', 'datenschutz'), navItem('AGB', 'agb')] },
    ],
  });
}

export function homeStory(): SeedStory {
  const intro = 'Für Gebäudetechnik, Wasserversorgung und Entwässerung: Pumpen von Lowara, SAER, Ebara und Flygt nach Serie und Pumpentyp. Senden Sie uns Typenschild oder Betriebsdaten, wir prüfen, welche Pumpe passt.';
  const headline = 'Industriepumpen';
  const card = (title: string, text: string, slug: string) => ({ _uid: uid(`card-${slug}`), component: 'card', title, text, link: storyLink(slug) });
  return story('home', 'Startseite', {
    component: 'page_home', h1: headline, intro, nav_title: 'Startseite',
    seo_title: 'Industriepumpen: Auswahl, Angebot und Revision',
    seo_description: 'Industriepumpen von Lowara, SAER, Ebara und Flygt nach Serie und Pumpentyp. Typenschild senden, Angebot oder Revision direkt anfragen.',
    hero: [{ _uid: uid('hero'), component: 'hero', headline, subline: intro, primary_label: 'Pumpe finden', primary_link: storyLink('pumpen'), secondary_label: 'Angebot anfordern', secondary_link: storyLink('angebot') }],
    // Tiles whose target page does not exist yet are hidden automatically and appear once the page is published.
    // The hero link list shows the cards whose target page exists; the others appear as soon as their page is published.
    tiles: [{ _uid: uid('tiles'), component: 'card_grid', heading: 'Pumpen entdecken', cards: [
      card('Marken', 'Lowara, SAER, Ebara und Flygt', 'pumpen/marken'),
      card('Pumpentypen', 'Kreiselpumpen, mehrstufige Pumpen, Tauchmotorpumpen und mehr', 'pumpen/pumpentypen'),
      card('Branchen', 'Pumpen nach Einsatzbereich', 'pumpen/branchen'),
      card('Anwendungen', 'Pumpen nach Aufgabe', 'pumpen/anwendungen'),
      { _uid: uid('card-revision'), component: 'card', title: 'Revision', text: 'Instandsetzung statt Neukauf', link: urlLink('/angebot?anliegen=revision') },
      card('Pumpenschule', 'Grundlagen und Kurse', 'ueber-uns/pumpenschule'),
      card('Angebot', 'Angebot für Pumpe oder Ersatzteil anfordern', 'angebot'),
    ] }],
    body: [{ _uid: uid('home-services'), component: 'card_grid', heading: 'Wobei wir helfen', cards: [
      { _uid: uid('sv1'), component: 'card', title: 'Pumpen', text: 'Pumpen nach Marke, Serie und Pumpentyp. Senden Sie uns das Typenschild, wir prüfen die passende Pumpe.', link: storyLink('pumpen'), image: { filename: '/img/services/verkauf.webp', alt: '' } },
      { _uid: uid('sv2'), component: 'card', title: 'Revision', text: 'Je nach Zustand umfasst eine Revision den Austausch von Verschleißteilen wie Gleitringdichtungen und Lagern.', link: urlLink('/angebot?anliegen=revision'), image: { filename: '/img/services/revision.webp', alt: '' } },
      { _uid: uid('sv3'), component: 'card', title: 'Ersatzteile', text: 'Ersatzteile für Pumpen der Marken im Katalog. Die Verfügbarkeit hängt von Serie, Baujahr und Ausführung ab.', link: urlLink('/angebot?anliegen=ersatzteile'), image: { filename: '/img/services/ersatzteile.webp', alt: '' } },
    ] }],
    revision: [ctaBlok('home-revision', 'Revision statt Neukauf prüfen', 'Eine Revision kann je nach Zustand der Pumpe den Austausch von Verschleißteilen wie Gleitringdichtungen und Lagern umfassen. Senden Sie uns das Typenschild, wir prüfen den Umfang mit Ihnen.', 'Revision anfragen', urlLink('/angebot?anliegen=revision'), 'overhaul')],
    brands: [{ _uid: uid('brands'), component: 'logo_strip', heading: 'Marken im Katalog' }],
    references: [ctaBlok('home-referenzen', 'Referenzen', 'Eingesetzte Pumpen und Revisionen aus der Praxis.', 'Referenzen ansehen', storyLink('referenzen'))],
    school: [ctaBlok('home-schule', 'Pumpenschule', 'Grundlagen, Kurse und Datenblätter rund um Pumpen.', 'Zur Pumpenschule', storyLink('ueber-uns/pumpenschule'))],
    contact: [ctaBlok('home-kontakt', 'Fragen zu Auswahl oder Ersatz?', 'Schreiben Sie uns. Für ein konkretes Angebot nutzen Sie das Angebotsformular.', 'Kontakt aufnehmen', storyLink('kontakt'))],
  });
}

export function hubStories(): SeedStory[] {
  return [
    story('pumpen', 'Pumpen', {
      component: 'page_hub', h1: 'Pumpen', nav_title: 'Pumpen',
      seo_title: 'Pumpen nach Marke, Serie und Pumpentyp',
      seo_description: 'Pumpenkatalog nach Marke und Serie: Kennbereiche, Artikel und Angebot für Lowara, SAER, Ebara und Flygt.',
      intro: 'Der Pumpenkatalog ist nach Marke und Serie geordnet. Zu jeder Serie finden Sie Kennbereiche, Artikel und die Möglichkeit, ein Angebot anzufordern.',
      child_heading: 'Pumpen nach Marke',
      body_text: doc(
        heading(2, 'So finden Sie die passende Pumpe'),
        para('Für die Auswahl brauchen wir vier Angaben: Förderstrom, Förderhöhe, Fördermedium und Medientemperatur. Bei einem Ersatz genügt das Typenschild der vorhandenen Pumpe.'),
        para('Senden Sie uns diese Daten über das ', link('Angebotsformular', '/angebot'), '. Wir ordnen Ihnen die passende Serie zu und nennen die infrage kommenden Artikel.'),
        heading(2, 'Welcher Pumpentyp passt zu welcher Aufgabe?'),
        para('Der Katalog umfasst fünf Pumpentypen. Die folgende Übersicht hilft bei der ersten Einordnung; die konkrete Auswahl richtet sich nach den Betriebsdaten.'),
        bullets([
          'Kreiselpumpen fördern Flüssigkeiten über ein Laufrad und sind der Standard für Wasser bei mittleren Förderhöhen.',
          'Mehrstufige Pumpen schalten mehrere Laufräder hintereinander und erzeugen hohe Drücke bei überschaubarem Förderstrom.',
          'Blockpumpen haben einen direkt angeflanschten Motor und benötigen wenig Platz.',
          'Tauchmotorpumpen arbeiten im Medium selbst und fördern Wasser aus Schächten, Gruben und Behältern.',
          'Druckerhöhungsanlagen fassen Pumpen, Behälter und Steuerung zusammen und halten den Druck konstant.',
        ]),
        para('Förderstrom, Förderhöhe und die Beschaffenheit des Mediums entscheiden danach über Serie und Werkstoff. Bei einer Ersatzbeschaffung ist das Typenschild der vorhandenen Pumpe der schnellste Weg zur passenden Lösung.'),
      ),
      body: [{ _uid: uid('pumpen-brands'), component: 'logo_strip', heading: 'Marken im Katalog' }],
    }, 1),
    story('pumpen/marken', 'Marken', {
      component: 'page_hub', h1: 'Pumpen nach Hersteller', nav_title: 'Marken',
      seo_title: 'Pumpen nach Hersteller: Lowara, SAER, Ebara, Flygt',
      seo_description: 'Pumpenmarken im Katalog: Lowara, SAER, Ebara und Flygt mit Serien, Einsatzbereichen und Hinweisen zur Revision.',
      intro: 'Wir führen Pumpen von vier Herstellern: Lowara, SAER, Ebara und Flygt. Jede Marke hat eine eigene Seite mit Serien, Einsatzbereichen und Hinweisen zur Revision.',
      child_heading: 'Marken',
      body_text: doc(
        para('Lowara und Flygt gehören zur Xylem-Gruppe. SAER und Ebara sind eigenständige Hersteller. Innerhalb jeder Marke sind die Pumpen nach Serien geordnet; jede Serie zeigt ihre Kennbereiche und die Artikel des Katalogs.'),
        para('Wenn Sie nicht wissen, welche Marke zu Ihrer Anlage passt, ', link('senden Sie uns das Typenschild', '/angebot'), '. Wir prüfen, welche Serie infrage kommt.'),
        heading(2, 'So ist der Katalog aufgebaut'),
        para('Der Weg führt von der Marke über die Serie zum einzelnen Artikel. Auf der Markenseite sehen Sie alle Serien mit Einsatzbereichen, auf der Serienseite die Kennbereiche, die Artikel und vergleichbare Serien anderer Marken. Die Artikelseite nennt die technischen Daten und übernimmt Marke, Serie und Artikelnummer in die Angebotsanfrage.'),
        heading(2, 'Ersatzteile und Revision'),
        para('Für jede Marke können Sie Ersatzteile und eine Revision anfragen. Ob und in welchem Umfang das möglich ist, hängt von Serie, Baujahr und Ausführung der Pumpe ab; das Typenschild genügt für eine erste Einschätzung.'),
      ),
    }, 1),
  ];
}

export function conversionStories(): SeedStory[] {
  return [
    story('angebot', 'Angebot anfordern', {
      component: 'page_contact', form_kind: 'angebot', h1: 'Angebot für Pumpen, Ersatzteile und Revision anfordern', nav_title: 'Angebot anfordern',
      seo_title: 'Angebot für Pumpen, Ersatzteile und Revision anfordern',
      seo_description: 'Angebot anfordern: Typenschild oder Betriebsdaten senden, wir prüfen die passende Pumpe, das Ersatzteil oder die Revision.',
      intro: 'Senden Sie uns Typenschild oder Betriebsdaten Ihrer Pumpe. Wir prüfen, welche Pumpe oder welche Revision passt, und melden uns mit einem Angebot.',
      form_intro: 'Pflichtfelder sind mit * gekennzeichnet. Wenn Sie von einer Produktseite kommen, sind Marke, Serie und Artikelnummer bereits eingetragen.',
      body: [{ _uid: uid('angebot-body'), component: 'rich_text', content: doc(para('Allgemeine Fragen? Nutzen Sie das ', link('Kontaktformular', '/kontakt'), '. Eine Übersicht der Pumpen finden Sie im ', link('Pumpenkatalog', '/pumpen'), '.')) }],
    }),
    story('kontakt', 'Kontakt', {
      component: 'page_contact', form_kind: 'kontakt', h1: 'Kontakt', nav_title: 'Kontakt',
      seo_title: 'Kontakt zu Industrial Pump Group',
      seo_description: 'Kontakt für Fragen zu Pumpen, Ersatzteilen und Revision. Für ein konkretes Angebot nutzen Sie das Angebotsformular.',
      intro: 'Schreiben Sie uns, wenn Sie Fragen zu Pumpen, Ersatzteilen oder einer Revision haben. Für ein konkretes Angebot nutzen Sie bitte das Angebotsformular.',
      body: [{ _uid: uid('kontakt-body'), component: 'rich_text', content: doc(para('Sie suchen eine bestimmte Pumpe? Starten Sie im ', link('Pumpenkatalog', '/pumpen'), ' oder fordern Sie direkt ein ', link('Angebot', '/angebot'), ' an.')) }],
    }),
  ];
}

const REVIEW = 'Entwurf: Dieser Text muss vor der Veröffentlichung rechtlich geprüft und mit den Angaben des Unternehmens vervollständigt werden.';
export function legalStories(): SeedStory[] {
  const legal = (slug: string, name: string, kind: string, title: string, desc: string, intro: string, text: unknown): SeedStory =>
    story(slug, name, { component: 'page_legal', legal_kind: kind, h1: name, nav_title: name, seo_title: title, seo_description: desc, intro, review_note: REVIEW, text });
  return [
    legal('impressum', 'Impressum', 'impressum', 'Impressum | Industrial Pump Group', 'Anbieterkennzeichnung nach § 5 DDG: Unternehmen, Anschrift, Vertretung, Kontakt und Registerangaben.', 'Angaben zum Anbieter dieser Website nach § 5 DDG.', doc(
      heading(2, 'Angaben nach § 5 DDG'), para(P('Firmenname und Rechtsform')), para(`${P('Straße und Hausnummer')}, ${P('PLZ und Ort')}`),
      heading(2, 'Vertreten durch'), para(P('Geschäftsführer')),
      heading(2, 'Kontakt'), para(`Telefon: ${P('Telefon')}`), para(`E-Mail: ${P('E-Mail')}`),
      heading(2, 'Registereintrag'), para(P('Registergericht und Handelsregisternummer')),
      heading(2, 'Umsatzsteuer-ID'), para(`Umsatzsteuer-Identifikationsnummer nach § 27a UStG: ${P('USt-IdNr.')}`),
      heading(2, 'Verantwortlich für den Inhalt'), para(`Verantwortlich nach § 18 Abs. 2 MStV: ${P('Name und Anschrift')}`),
      heading(2, 'Streitbeilegung'), para(P('Angabe zur Teilnahme an Verbraucherstreitbeilegungsverfahren nach VSBG')),
    )),
    legal('datenschutz', 'Datenschutz', 'datenschutz', 'Datenschutzerklärung | Industrial Pump Group', 'Datenschutzerklärung nach Art. 13 DSGVO: Verantwortlicher, Zwecke, Rechtsgrundlagen, Speicherdauer und Ihre Rechte.', 'Hier erfahren Sie, welche personenbezogenen Daten beim Besuch dieser Website und bei Anfragen verarbeitet werden.', doc(
      heading(2, 'Verantwortlicher'), para(P('Name, Anschrift und Kontaktdaten des Verantwortlichen')),
      heading(2, 'Datenschutzbeauftragter'), para(P('Kontakt des Datenschutzbeauftragten, falls benannt')),
      heading(2, 'Besuch der Website'), para(`Beim Aufruf der Website verarbeitet der Hosting-Anbieter technische Daten (Server-Logfiles). ${P('Hosting-Anbieter, Art der Logfiles, Rechtsgrundlage und Speicherdauer')}`),
      heading(2, 'Kontakt- und Angebotsformular'), para('Wir verarbeiten die Angaben aus dem Kontakt- und Angebotsformular, um Ihre Anfrage zu bearbeiten. Die Einwilligung geben Sie mit dem Absenden des Formulars.'),
      bullets([`Rechtsgrundlage: ${P('Art. 6 Abs. 1 DSGVO – bitte rechtlich festlegen')}`, `Empfänger und Auftragsverarbeiter: ${P('z. B. E-Mail-Dienst, CRM')}`, `Speicherdauer: ${P('Speicherdauer')}`]),
      heading(2, 'Cookies und ähnliche Technologien'), para('Diese Website verwendet nur technisch notwendige Speicherungen. Ihre Auswahl im Cookie-Hinweis speichern wir lokal in Ihrem Browser. Externe Inhalte wie Karten laden wir erst nach Ihrer Einwilligung (§ 25 TDDDG).'),
      heading(2, 'Ihre Rechte'), para('Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21). Eine erteilte Einwilligung können Sie jederzeit widerrufen (Art. 7 Abs. 3).'),
      para(`Beschwerderecht bei der Aufsichtsbehörde (Art. 77 DSGVO): ${P('zuständige Aufsichtsbehörde')}`),
      heading(2, 'Übermittlung in Drittländer'), para(P('Angaben zu Drittlandübermittlungen')),
    )),
    legal('agb', 'AGB', 'agb', 'Allgemeine Geschäftsbedingungen | Industrial Pump Group', 'Allgemeine Geschäftsbedingungen für Lieferungen und Leistungen: Geltungsbereich, Vertragsschluss, Lieferung, Mängelhaftung.', 'Diese Bedingungen regeln Lieferungen und Leistungen gegenüber gewerblichen Kunden.', doc(
      ...['Geltungsbereich', 'Vertragsschluss', 'Preise und Zahlung', 'Lieferung', 'Eigentumsvorbehalt', 'Mängelhaftung', 'Haftung', 'Schlussbestimmungen'].flatMap((h, i) => [heading(2, `§ ${i + 1} ${h}`), para(P(`Text zu „${h}“ (rechtlich zu liefern)`))]),
    )),
  ];
}
