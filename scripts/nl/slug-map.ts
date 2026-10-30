/**
 * The single German URL plan for every page of industrialpumps.nl that is replicated.
 *   npx tsx scripts/nl/slug-map.ts → content-src/slug-map.json  { nlPath: { de: "/pumpen/…", skip?: reason, noindex?: reason } }
 * German, lowercase, ASCII slugs built from the main search term of each page (see docs/CONTENT-GLOSSARY.md).
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'content-src', 'nl');
const nlPaths = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')).path as string).sort();

const FIXED: Record<string, string> = {
  '/': '/', '/algemene-voorwaarden': '/agb', '/privacy-en-cookieverklaring': '/datenschutz', '/contact': '/kontakt', '/offerte': '/angebot',
  '/bel-mij-terug': '/rueckruf', '/vervangende-pomp': '/ersatzpumpe', '/veelgestelde-vragen': '/haeufige-fragen',
  '/pompen': '/pumpen', '/pompen/merken': '/pumpen/marken', '/pompen/pomptypen': '/pumpen/pumpentypen', '/pompen/segmenten': '/pumpen/branchen', '/pompen/toepassingen': '/pumpen/anwendungen',
  '/revisie': '/revision', '/meer-ipg': '/ueber-uns', '/meer-ipg/over-ipg': '/ueber-uns/unternehmen', '/meer-ipg/nieuws': '/ueber-uns/blog', '/meer-ipg/cases': '/ueber-uns/referenzen',
  '/meer-ipg/pompschool': '/ueber-uns/pumpenschule', '/meer-ipg/vacatures': '/ueber-uns/karriere', '/pomp-kenniscentrum': '/pumpenwissen',
};
const LEAF: Record<string, Record<string, string>> = {
  pomptypen: { 'api-pompen': 'api-pumpen', 'api-610-pompen': 'api-610-pumpen', blokpompen: 'blockpumpen', bronpompen: 'brunnenpumpen', 'canned-motor-pompen': 'spaltrohrmotorpumpen', centrifugaalpompen: 'kreiselpumpen', 'centrifugaalpompen-werking': 'funktionsweise', 'chemienorm-pompen-iso-5199': 'chemienormpumpen-iso-5199', dompelpompen: 'tauchmotorpumpen', 'hydrofoor-units': 'druckerhoehungsanlagen', 'inline-pompen': 'inlinepumpen', insteekpompen: 'eintauchpumpen', kunststofpompen: 'kunststoffpumpen', lobbenpompen: 'drehkolbenpumpen', meertrapspompen: 'mehrstufige-pumpen', membraanpompen: 'membranpumpen', 'mixed-flow-pompen': 'halbaxialpumpen', 'mixers-en-voortstuwers': 'ruehrwerke-und-stroemungserzeuger', slurrypompen: 'feststoffpumpen', 'splitcase-pompen': 'axial-geteilte-pumpen', 'total-pump-units': 'komplettaggregate', 'verticale-turbinepompen': 'vertikale-turbinenpumpen', waternormpompen: 'normpumpen-en-733', wormpompen: 'exzenterschneckenpumpen' },
  segmenten: { agro: 'landwirtschaft', 'chemische-industrie': 'chemische-industrie', 'farmaceutische-industrie': 'pharmaindustrie', huishoudelijk: 'haushalt', hvac: 'gebaeudetechnik-hvac', 'industriele-pompen': 'stahlindustrie', 'industriele-pompen-voor-waterbehandeling': 'wasseraufbereitung', 'maritiem-offshore': 'maritim-und-offshore', papierindustrie: 'papierindustrie', 'pompen-voor-de-olie-en-gas-industrie': 'oel-und-gasindustrie', 'power-supply': 'energieversorgung', voedingsindustrie: 'lebensmittelindustrie', 'water-transport': 'wassertransport' },
  toepassingen: { afvalwater: 'abwasser', bagger: 'nassbaggerei', 'boiler-feed': 'kesselspeisung', brandblus: 'loeschwasser', desalinatie: 'meerwasserentsalzung', drainage: 'entwaesserung', drinkwater: 'trinkwasser', koelwater: 'kuehlwasser', proceswater: 'prozesswasser' },
  revisie: { 'alle-pomprevisies': 'pumpenrevision', 'api-pompen-revisie': 'api-pumpen-revision', 'balcke-durr-pompen': 'balcke-duerr-pumpen-revision', 'boilerfeedpompen-revisie': 'kesselspeisepumpen-revision', 'cellenradsluis-revisie': 'zellenradschleusen-revision', 'chemienormpompen-revisie': 'chemienormpumpen-revision', 'duurzaam-en-circulair': 'nachhaltig-und-zirkulaer', 'inspectie-op-locatie': 'inspektion-vor-ort', 'koelwaterpompen-revisie': 'kuehlwasserpumpen-revision', 'kunststofpompen-revisie': 'kunststoffpumpen-revision', 'mixed-flow-pompen-revisie': 'halbaxialpumpen-revision', pomponderdelen: 'ersatzteile', 'preventief-onderhoud': 'vorbeugende-wartung', 'splitcase-pompen-revisie': 'axial-geteilte-pumpen-revision', 'tandwielkasten-revisie': 'getriebe-revision', 'verticale-turbinepompen-revisie': 'vertikale-turbinenpumpen-revision', 'waternormpompen-revisie': 'normpumpen-revision', 'wormpompen-revisie': 'exzenterschneckenpumpen-revision' },
  'pomp-kenniscentrum': { 'belangrijkste-componenten-van-pompen': 'wichtigste-pumpenkomponenten', cavitatie: 'kavitation', 'geschiedenis-van-pompen': 'geschichte-der-pumpen', 'hydraulische-efficientie': 'hydraulischer-wirkungsgrad', 'inleiding-tot-pomptechnologie': 'einfuehrung-in-die-pumpentechnik', pompkrommen: 'pumpenkennlinien', 'wet-van-bernoulli': 'bernoulli-gleichung' },
  pompschool: { asafdichtingen: 'gleitringdichtungen', 'assen-en-lagers': 'wellen-und-lager', 'basiskennis-pompen': 'grundlagen', cursussen: 'kurse', 'inspectie-en-onderhoud': 'inspektion-und-wartung', 'kleppen-en-afsluiters': 'armaturen-und-ventile' },
  vacatures: { 'allround-pompmonteur': 'allround-pumpenmonteur', 'junior-account-manager': 'junior-account-manager', 'startend-pompmonteur': 'pumpenmonteur-berufseinsteiger', 'technisch-binnendienst-medewerker': 'technischer-innendienst' },
  cases: { 'aeb-amsterdam': 'aeb-amsterdam', 'hoogheemraadschap-hollands-noorderkwartier': 'hhnk', kesbeke: 'kesbeke', rietlanden: 'rietlanden-terminals', 'scholle-ipn-sig': 'scholle-ipn', 'svitzer-nederland': 'svitzer', waternet: 'waternet' },
  nieuws: {
    'blog-cavitatie-bij-industriele-pompen': 'kavitation-bei-industriepumpen', 'blog-energiezuinige-pompen': 'energieeffiziente-pumpen', 'blog-leidingspanning-vijand-voor-pompsystemen': 'rohrleitungsspannungen-in-pumpensystemen', 'blog-mechanical-seals': 'gleitringdichtungen-grundlagen',
    'blog-onderhoud-van-lowara-pompen': 'wartung-von-lowara-pumpen', 'blog-reviseren-of-nieuw-kopen-5-checkpoints-voor-een-slimme-keuze': 'revision-oder-neukauf-5-pruefpunkte', 'blog-verdringerpompen-wormpompen-versus-schroefpompen': 'verdraengerpumpen-exzenterschnecken-und-schraubenspindelpumpen',
    'blog-waarom-het-tijd-is-om-uw-oude-beregeningspomp-te-vervangen-met-een-nieuwe-saer-pomp': 'alte-beregnungspumpe-durch-saer-pumpe-ersetzen', 'blog-wanneer-is-revisie-van-een-lowara-pomp-rendabeler-dan-vervanging': 'wann-lohnt-die-revision-einer-lowara-pumpe',
    'de-kaderrichtlijn-water-krw': 'wasserrahmenrichtlinie-2027', 'een-week-samen-in-nederland': 'eine-woche-gemeinsam-in-den-niederlanden', 'flygt-bibo-alpha': 'flygt-bibo-alpha', 'flygt-concertor-6030-een-nieuwe-standaard-in-intelligente-afvalwaterpompen': 'flygt-concertor-6030-intelligente-abwasserpumpen',
    'ipg-organiseert-dag-van-de-duurzaamheid-op-10-oktober-2024': 'tag-der-nachhaltigkeit-10-oktober-2024', 'ipg-xylem': 'ipg-und-xylem', 'jong-talent-enthousiast-maken-voor-techniek-tijdens-de-doe-dag': 'junge-talente-fuer-technik-begeistern', 'meertrapspomp-revisie': 'revision-mehrstufiger-pumpen',
    'nieuwe-locatie-voor-ipg': 'neuer-standort', 'nieuwe-website': 'neue-website', 'officiele-importeur-van-saer': 'offizieller-importeur-von-saer', 'ontzorgen-van-pompbehoeftes-in-nederland': 'pumpenbedarf-sorgenfrei-abdecken', 'optimaliseer-uw-energiebesparing-met-de-nieuwste-ie-motoren': 'energie-sparen-mit-ie-motoren',
    'revisie-verticale-pompgemaalpomp': 'revision-vertikaler-pumpwerkspumpen', 'scam-actie': 'warnung-vor-betrugsmasche', siccast: 'siccast-verschleissschutz', 'succesvol-inspiratie-event-dag-van-de-duurzaamheid-bij-ipg': 'inspirationsevent-tag-der-nachhaltigkeit', 'wereldwijd-verbonden-lokaal-versterkt': 'weltweit-vernetzt-lokal-stark', 'wereldwijde-kennis-lokale-service': 'weltweites-wissen-lokaler-service',
  },
};
const SECTION: Record<string, string> = { pomptypen: '/pumpen/pumpentypen', segmenten: '/pumpen/branchen', toepassingen: '/pumpen/anwendungen', revisie: '/revision', 'pomp-kenniscentrum': '/pumpenwissen', pompschool: '/ueber-uns/pumpenschule', vacatures: '/ueber-uns/karriere', cases: '/ueber-uns/referenzen', nieuws: '/ueber-uns/blog' };
const SKIP: Record<string, string> = {
  '/meer-ipg/nieuws/copy-of-ipg-organiseert-dag-van-de-duurzaamheid-op-10-oktober-2024': 'Duplikat (Kopie) des Beitrags „Tag der Nachhaltigkeit“',
  '/meer-ipg/nieuws/wereldwijd-verbonden-lokaal-versterkt-1': 'Duplikat: englische Fassung eines vorhandenen Beitrags',
};
/** Pages that talk about the Dutch company, Dutch customers, Dutch jobs or events: translated, but noindex until the client decides. */
const NL_SPECIFIC = /^\/meer-ipg\/(vacatures\/|nieuws\/(nieuwe-locatie|scam-actie|nieuwe-website|jong-talent|een-week|ipg-organiseert|succesvol|wereldwijd|wereldwijde|officiele|ontzorgen|de-kaderrichtlijn|ipg-xylem))|^\/meer-ipg\/cases\/|^\/vervangende-pomp$|^\/bel-mij-terug$/;

const map: Record<string, { de?: string; skip?: string; noindex?: string }> = {};
for (const p of nlPaths) {
  if (SKIP[p]) { map[p] = { skip: SKIP[p] }; continue; }
  let de = FIXED[p];
  const parts = p.split('/').filter(Boolean);
  if (!de) {
    const [a, b, c, d] = parts;
    if (a === 'pompen' && b === 'merken') de = d ? `/pumpen/marken/${c}/${d}` : `/pumpen/marken/${c}`; // brand and brand-series slugs keep the manufacturer's own names
    else if (a === 'pompen' && SECTION[b!]) { const l1 = LEAF[b!]![c!]; de = d ? `${SECTION[b!]}/${l1}/${LEAF[b!]![d]}` : `${SECTION[b!]}/${l1}`; }
    else if (a === 'meer-ipg' && SECTION[b!]) de = `${SECTION[b!]}/${LEAF[b!]![c!]}`;
    else if (SECTION[a!]) de = `${SECTION[a!]}/${LEAF[a!]![b!]}`;
  }
  if (!de || /undefined/.test(de)) { map[p] = { skip: `NO GERMAN SLUG: ${p}` }; continue; }
  map[p] = { de, ...(NL_SPECIFIC.test(p) ? { noindex: 'Niederlande-spezifischer Inhalt: Freigabe durch den Kunden abwarten' } : {}) };
}
const bad = Object.entries(map).filter(([, v]) => v.skip?.startsWith('NO GERMAN'));
const dupes = Object.values(map).filter((v) => v.de).map((v) => v.de!).filter((d, i, a) => a.indexOf(d) !== i);
writeFileSync(join(process.cwd(), 'content-src', 'slug-map.json'), JSON.stringify(map, null, 1));
console.log(`${nlPaths.length} NL pages → ${Object.values(map).filter((v) => v.de).length} German pages, ${Object.values(map).filter((v) => v.skip && !v.skip.startsWith('NO')).length} skipped as duplicates, ${Object.values(map).filter((v) => v.noindex).length} noindex (NL-specific)`);
if (bad.length) { console.error('MISSING SLUGS:', bad.map(([k]) => k).join('\n')); process.exit(1); }
if (dupes.length) { console.error('DUPLICATE GERMAN PATHS:', dupes); process.exit(1); }
