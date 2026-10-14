/**
 * German copy for brand and series pages. Source: the existing product texts of industrialpumps.nl (English feed),
 * translated and tightened (sachlich, no superlatives). Claims taken over from the old texts that need the
 * manufacturer's confirmation are listed in `verify` and end up in docs/CLAIMS-TO-VERIFY.md.
 */
import type { PumpTypeSlug } from './types';

export interface BrandDef {
  slug: string; name: string; manufacturerKey: string; parent?: string;
  title: string; description: string; intro: string; body: string[]; revision: string;
  faqExtra?: [string, string][];
}

export interface SeriesDef {
  key: string; brand: string; group: string; name: string; pumpType: PumpTypeSlug;
  segments: string[]; applications: string[];
  title: string; description: string; h1: string; intro: string; useCase: string; body: string[]; highlights: string[];
  typeShort: string; useShort: string; productNote?: string; imageSource: string; sample: string; verify?: string[];
}

const WT = ['wasseraufbereitung', 'wassertransport'];
const HVAC = 'gebaeudetechnik-hvac';

export const BRANDS: BrandDef[] = [
  {
    slug: 'lowara', name: 'Lowara', manufacturerKey: 'Lowara', parent: 'Xylem',
    title: 'Lowara Pumpen: Serien, Einsatzbereiche und Revision',
    description: 'Lowara-Pumpen im Überblick: Serien für Druckerhöhung, Gebäudetechnik und Entwässerung, Einsatzbereiche und Revision. Angebot anfordern.',
    intro: 'Lowara ist eine Pumpenmarke von Xylem mit italienischer Herkunft und vor allem für Edelstahl-Kreiselpumpen, mehrstufige Pumpen und Tauchmotorpumpen bekannt. Diese Seite zeigt die Serien aus unserem Katalog, ihre Einsatzbereiche und die Möglichkeiten zur Revision.',
    body: [
      'Lowara gehört zur Xylem-Gruppe. Das Programm reicht von mehrstufigen Kreiselpumpen für Druckerhöhung und Wasserversorgung über Blockpumpen bis zu Tauchmotorpumpen für Entwässerung und Schmutzwasser. In den Katalogdaten ist als Herkunftsland Italien angegeben.',
      'Die Serien unterscheiden sich vor allem in Pumpentyp, Werkstoff und Leistungsbereich. Die mehrstufigen Serien SV und HM decken Druckerhöhung und Anwendungen der Gebäudetechnik ab. Die Blockpumpen CEA und BG fördern sauberes Wasser bei mäßigen Förderhöhen, die Kreiselpumpen der ESH-Serie bedienen Druckerhöhung und Wasserversorgung in Industrie und Gewerbe. Für Entwässerung und Schmutzwasser stehen die Tauchmotorpumpen DOC, DOMO und DIWA zur Verfügung.',
      'Wenn Sie eine vorhandene Lowara-Pumpe ersetzen möchten, hilft das Typenschild: Aus Typ, Förderstrom und Förderhöhe lässt sich die passende Serie zuordnen.',
    ],
    revision: 'Eine Revision kann je nach Zustand der Pumpe den Austausch von Verschleißteilen wie Gleitringdichtungen und Lagern umfassen. Den genauen Umfang legen wir nach Prüfung der Pumpe mit Ihnen fest. Welche Teile im Einzelfall verfügbar sind, hängt von Serie, Baujahr und Ausführung ab.',
  },
  {
    slug: 'saer', name: 'SAER', manufacturerKey: 'SAER',
    title: 'SAER Pumpen: Serien, Einsatzbereiche und Revision',
    description: 'SAER-Pumpen im Überblick: Kreiselpumpen der Serien IR, IRX und M sowie Druckerhöhungsanlagen TR, Einsatzbereiche und Revision. Angebot anfordern.',
    intro: 'SAER ist ein italienischer Hersteller von Kreiselpumpen für Wasserversorgung, Gebäudetechnik und Landwirtschaft. Diese Seite zeigt die SAER-Serien aus unserem Katalog, ihre Einsatzbereiche und die Möglichkeiten zur Revision.',
    body: [
      'Im Katalog sind SAER-Kreiselpumpen mit stirnseitigem Sauganschluss (IR-, IR-M- und IRX-Serie) sowie die Kreiselpumpen der M-Serie geführt. Dazu kommen die Druckerhöhungsanlagen der TR-Serie, die Pumpen, Druckbehälter und Steuerung zu einer Einheit zusammenfassen.',
      'Die IR-Serien unterscheiden sich vor allem im Werkstoff: Die IR-Serie nutzt Gusseisen, die IR-M-Serie Bronze und die IRX-Serie Edelstahl 316. Typische Einsatzbereiche laut Katalogdaten sind Wasseraufbereitung, Wassertransport, Gebäudetechnik und Landwirtschaft.',
      'Zur Auswahl benötigen wir Förderstrom, Förderhöhe und Fördermedium. Bei einem Ersatz genügt in der Regel das Typenschild der vorhandenen Pumpe.',
    ],
    revision: 'Eine Revision kann je nach Zustand der Pumpe den Austausch von Verschleißteilen wie Gleitringdichtungen und Lagern umfassen. Den genauen Umfang legen wir nach Prüfung der Pumpe mit Ihnen fest. Welche Teile im Einzelfall verfügbar sind, hängt von Serie, Baujahr und Ausführung ab.',
  },
  {
    slug: 'ebara', name: 'Ebara', manufacturerKey: 'Ebara',
    title: 'Ebara Pumpen: Serien, Einsatzbereiche und Revision',
    description: 'Ebara-Pumpen im Überblick: Tauchmotorpumpen Optima, Best One und DW sowie Kreiselpumpen, Einsatzbereiche und Revision. Angebot anfordern.',
    intro: 'Ebara ist ein japanischer Pumpenhersteller mit einem breiten Programm für Wasserversorgung, Gebäudetechnik und Entwässerung. Diese Seite zeigt die Ebara-Serien aus unserem Katalog, ihre Einsatzbereiche und die Möglichkeiten zur Revision.',
    body: [
      'Im Katalog sind von Ebara zwei Gruppen geführt: Tauchmotorpumpen für Entwässerung und Schmutzwasser (Optima, Best One, DW) und Kreiselpumpen für Wasserversorgung, Gebäudetechnik und gewerbliche Anwendungen (CDX, DWO, JEX/JESX, AGA/AGC).',
      'Die Tauchmotorpumpen der Best-One-Serie bestehen laut Katalog aus Edelstahl 304; die DW-Serie ist für Wasser mit höherem Schmutzanteil ausgelegt, die Ausführung DW VOX mit Vortex-Laufrad für Feststoffe. Bei den Kreiselpumpen unterscheiden sich die Serien in Förderhöhe, Werkstoff und Ansaugverhalten.',
      'Zur Auswahl benötigen wir Förderstrom, Förderhöhe und Fördermedium. Bei einem Ersatz genügt in der Regel das Typenschild der vorhandenen Pumpe.',
    ],
    revision: 'Eine Revision kann je nach Zustand der Pumpe den Austausch von Verschleißteilen wie Gleitringdichtungen und Lagern umfassen. Den genauen Umfang legen wir nach Prüfung der Pumpe mit Ihnen fest. Welche Teile im Einzelfall verfügbar sind, hängt von Serie, Baujahr und Ausführung ab.',
  },
  {
    slug: 'flygt', name: 'Flygt', manufacturerKey: 'Flygt', parent: 'Xylem',
    title: 'Flygt Pumpen: Serien, Einsatzbereiche und Revision',
    description: 'Flygt-Pumpen im Überblick: Tauchmotorpumpen der Ready-Serie für Entwässerung und Wasserhaltung, Einsatzbereiche und Revision. Angebot anfordern.',
    intro: 'Flygt ist eine Marke von Xylem und vor allem für Tauchmotorpumpen und Rührwerke bekannt. Diese Seite zeigt die Flygt-Serie aus unserem Katalog, ihre Einsatzbereiche und die Möglichkeiten zur Revision.',
    body: [
      'Flygt gehört zur Xylem-Gruppe und steht für Tauchmotorpumpen, die in Abwasser- und Entwässerungsanwendungen zum Einsatz kommen. In unserem Katalog ist die Ready-Serie geführt: Tauchmotorpumpen für Entwässerung und Wasserhaltung.',
      'Die Katalogdaten der Ready-Serie enthalten bisher nur wenige technische Werte. Technische Daten, Kennlinien und Ausführungen nennen wir Ihnen auf Anfrage nach Datenblatt des Herstellers.',
    ],
    revision: 'Eine Revision kann je nach Zustand der Pumpe den Austausch von Verschleißteilen wie Gleitringdichtungen und Lagern umfassen. Den genauen Umfang legen wir nach Prüfung der Pumpe mit Ihnen fest. Welche Teile im Einzelfall verfügbar sind, hängt von Serie, Baujahr und Ausführung ab.',
  },
];

export const SERIES: SeriesDef[] = [
  /* ---------------- Lowara ---------------- */
  {
    key: 'lowara-sv', brand: 'lowara', group: 'GROUP149', name: 'SV', pumpType: 'mehrstufige-pumpen', segments: [HVAC, ...WT], applications: [],
    h1: 'Lowara SV-Serie – Mehrstufige vertikale Kreiselpumpen',
    title: 'Lowara SV-Serie: Mehrstufige vertikale Kreiselpumpen',
    description: 'Lowara SV: mehrstufige vertikale Kreiselpumpen für Druckerhöhung, Wasserversorgung und Gebäudetechnik. Kennbereiche, Artikel, Angebot anfordern.',
    intro: 'Die Lowara SV-Serie umfasst mehrstufige Kreiselpumpen in vertikaler Bauweise für Druckerhöhung, Wasserversorgung und Anwendungen der Gebäudetechnik. Sie arbeiten platzsparend und lassen sich je nach Werkstoffausführung auch für aggressive Medien auslegen.',
    useCase: 'Mehrstufige vertikale Kreiselpumpen für Druckerhöhung und Wasserversorgung',
    body: [
      'Die SV-Serie steht für vertikal aufgebaute, mehrstufige Kreiselpumpen von Lowara. Mehrere Laufräder in Reihe erzeugen hohe Förderhöhen bei geringer Aufstellfläche. Typische Aufgaben sind Druckerhöhung, Wasserversorgung und Anwendungen der Gebäudetechnik.',
      'Nach Herstellerangaben sind die Pumpen für einfache Installation und Wartung ausgelegt: Der Pumpenteil ist gut zugänglich, und der Motor lässt sich einfach demontieren.',
    ],
    highlights: ['Vertikale, platzsparende Bauweise', 'Hohe Förderhöhen durch mehrere Stufen', 'Druckerhöhung, Wasserversorgung, Gebäudetechnik', 'Gut zugänglicher Pumpenteil, einfache Motormontage (Herstellerangabe)'],
    typeShort: 'Mehrstufige Kreiselpumpe', useShort: 'Druckerhöhung und Wasserversorgung',
    productNote: 'Die Artikelbezeichnung enthält Baugröße, Stufenzahl sowie Werkstoff- und Motorausführung.',
    imageSource: '/Images/ipg_ecom/Lowara/Lowara-SV.jpg', sample: '15SV02F022T/D',
    verify: ['„Geeignet für aggressive und korrosive Flüssigkeiten“ (alte Website): hängt von der Werkstoffausführung ab, vor Veröffentlichung mit dem Hersteller bestätigen.'],
  },
  {
    key: 'lowara-hm', brand: 'lowara', group: 'GROUP148', name: 'HM', pumpType: 'mehrstufige-pumpen', segments: [HVAC, ...WT], applications: [],
    h1: 'Lowara HM-Serie – Mehrstufige horizontale Kreiselpumpen',
    title: 'Lowara HM-Serie: Mehrstufige horizontale Kreiselpumpen',
    description: 'Lowara HM: mehrstufige horizontale Kreiselpumpen für Druckerhöhung, Wasseraufbereitung und Gebäudetechnik. Kennbereiche, Artikel, Angebot anfordern.',
    intro: 'Die Lowara HM-Serie umfasst mehrstufige Kreiselpumpen in horizontaler Bauweise für Druckerhöhung, Wasseraufbereitung, Wassertransport und Anwendungen der Gebäudetechnik. Die kompakten Pumpen eignen sich für beengte Aufstellorte.',
    useCase: 'Mehrstufige horizontale Kreiselpumpen für Druckerhöhung und Gebäudetechnik',
    body: [
      'Die HM-Serie von Lowara besteht aus horizontal aufgestellten, mehrstufigen Kreiselpumpen. Die Mehrstufigkeit liefert hohe Drücke bei überschaubarem Förderstrom; typische Anwendungen sind Druckerhöhung sowie Anlagen der Wasseraufbereitung, des Wassertransports und der Gebäudetechnik.',
      'Die Pumpen haben kompakte Abmessungen und lassen sich dadurch auch an engen oder schwer zugänglichen Stellen installieren. Nach Herstellerangaben sind sie auf einfache Installation und Wartung ausgelegt.',
    ],
    highlights: ['Horizontale, kompakte Bauweise', 'Hohe Drücke durch mehrere Stufen', 'Druckerhöhung, Wasseraufbereitung, Gebäudetechnik', 'Für enge Aufstellorte geeignet'],
    typeShort: 'Mehrstufige Kreiselpumpe', useShort: 'Druckerhöhung und Gebäudetechnik',
    imageSource: '/Images/ipg_ecom/Lowara/Lowara-HM.jpg', sample: '1HM02P03T5RVBE',
    verify: ['„Beste Effizienzklasse“ und „geringe Geräuschentwicklung“ (USP der alten Website) nicht übernommen, da nicht belegt.'],
  },
  {
    key: 'lowara-esh', brand: 'lowara', group: 'GROUP147', name: 'ESH', pumpType: 'kreiselpumpen', segments: [HVAC, ...WT], applications: [],
    h1: 'Lowara ESH-Serie – Kreiselpumpen für Druckerhöhung und Wasserversorgung',
    title: 'Lowara ESH-Serie: Kreiselpumpen für Wasserversorgung',
    description: 'Lowara ESH (ESHE, ESHS, ESHF): Kreiselpumpen für Druckerhöhung und Wasserversorgung in Industrie und Gewerbe. Kennbereiche, Angebot anfordern.',
    intro: 'Die Lowara ESH-Serie umfasst Kreiselpumpen in den Ausführungen ESHE, ESHS und ESHF für Druckerhöhung und Wasserversorgung in Industrie und Gewerbe. Die Pumpen sind laut Katalog aus Edelstahl AISI 316 gefertigt.',
    useCase: 'Kreiselpumpen für Druckerhöhung und Wasserversorgung in Industrie und Gewerbe',
    body: [
      'Die ESH-Serie von Lowara ist in mehreren Ausführungen und Leistungsgrößen erhältlich (ESHE, ESHS, ESHF), sodass sich für unterschiedliche Förderströme und Förderhöhen eine passende Pumpe finden lässt. Typische Einsatzgebiete sind Druckerhöhung und Wasserversorgung in industriellen und gewerblichen Anlagen.',
      'Als Werkstoff nennt der Katalog Edelstahl AISI 316, der die Pumpen widerstandsfähig gegen Korrosion macht. Zusätzlich sind laut Katalog eine Drehzahlregelung und eine Zulassung für Trinkwasser vorgesehen; welche Ausführung diese Merkmale bietet, klären wir vor der Bestellung anhand des Datenblatts.',
    ],
    highlights: ['Edelstahl AISI 316 (Katalogangabe)', 'Drehzahlregelung bei entsprechender Ausführung', 'Zulassung für Trinkwasser bei entsprechender Ausführung (bitte prüfen)', 'Druckerhöhung und Wasserversorgung'],
    typeShort: 'Kreiselpumpe', useShort: 'Druckerhöhung und Wasserversorgung',
    imageSource: '/Images/ipg_ecom/Lowara/Lowara-ESHE.jpg', sample: 'ESHE 25-125/07/S25RSNA',
    verify: [
      'Die alte Website nennt die ESHE-Serie „vertikale mehrstufige Kreiselpumpe“. Das widerspricht den Katalogdaten (Pumpentyp „Kreiselpumpe“); nicht übernommen.',
      '„Integrierter Frequenzumrichter“ und „Anti-Blockiersystem“ (alte Website) nicht übernommen. „Drehzahlregelung“ und „Trinkwasserzulassung“ stehen nur als USP in den Daten: Ausführung und Zulassung vor Veröffentlichung belegen.',
    ],
  },
  {
    key: 'lowara-cea', brand: 'lowara', group: 'GROUP145', name: 'CEA', pumpType: 'blockpumpen', segments: [HVAC, ...WT], applications: [],
    h1: 'Lowara CEA-Serie – Edelstahl-Blockpumpen für Wasserversorgung',
    title: 'Lowara CEA-Serie: Edelstahl-Blockpumpen',
    description: 'Lowara CEA und CEAM: Blockpumpen aus Edelstahl AISI 304 oder 316 für Wasserversorgung und Gebäudetechnik. Kennbereiche, Angebot anfordern.',
    intro: 'Die Lowara CEA-Serie umfasst Blockpumpen mit Hydraulik aus Edelstahl AISI 304 oder AISI 316 für Wasserverteilung, Gebäudetechnik und gewerbliche Anwendungen. Die Pumpen fördern bei mäßigen Förderhöhen und laufen leise.',
    useCase: 'Blockpumpen aus Edelstahl für Wasserversorgung und Gebäudetechnik',
    body: [
      'Die CEA-Serie (mit der Variante CEAM) besteht aus Kreiselpumpen in Blockbauweise, bei denen der Motor direkt an die Pumpe angeflanscht ist. Der Katalog nennt Edelstahl AISI 304 oder AISI 316 als Werkstoff, der die Pumpen korrosionsbeständig und langlebig macht.',
      'Typische Aufgaben sind die Wasserverteilung, die Wasserversorgung von Gebäuden und gewerbliche Anwendungen mit konstantem Druck. Die Pumpen sind laut Hersteller auf laufruhigen, schwingungsarmen Betrieb ausgelegt. Es gibt Ausführungen mit unterschiedlichen Förderströmen und Förderhöhen.',
    ],
    highlights: ['Blockbauweise, Motor direkt angeflanscht', 'Edelstahl AISI 304 oder AISI 316 (Katalogangabe)', 'Förderhöhe bis 30 m (Katalogangabe)', 'Wasserverteilung und Gebäudeversorgung'],
    typeShort: 'Blockpumpe', useShort: 'Wasserverteilung und Gebäudeversorgung',
    imageSource: '/Images/ipg_ecom/Lowara/Lowara-CEA.jpg', sample: 'CEA80/5/D',
  },
  {
    key: 'lowara-bg', brand: 'lowara', group: 'GROUP146', name: 'BG', pumpType: 'blockpumpen', segments: ['landwirtschaft', HVAC, ...WT], applications: [],
    h1: 'Lowara BG-Serie – Selbstansaugende Blockpumpen',
    title: 'Lowara BG-Serie: Selbstansaugende Blockpumpen',
    description: 'Lowara BG und BGM: selbstansaugende Blockpumpen für sauberes Wasser und nicht aggressive Medien. Kennbereiche, Artikel, Angebot anfordern.',
    intro: 'Die Lowara BG-Serie (BG und BGM) umfasst selbstansaugende Blockpumpen für sauberes Wasser und nicht aggressive Flüssigkeiten. Sie kommen in Wasserversorgung, Gebäudetechnik, Landwirtschaft und industriellen Prozessen zum Einsatz.',
    useCase: 'Selbstansaugende Blockpumpen für sauberes Wasser',
    body: [
      'Die BG-Serie von Lowara besteht aus selbstansaugenden Kreiselpumpen in Blockbauweise für die Förderung von sauberem Wasser und nicht aggressiven Medien. Sie ist in mehreren Ausführungen verfügbar und deckt damit unterschiedliche Aufgaben in Wasseraufbereitung, Wassertransport, Gebäudetechnik und industriellen Prozessen ab.',
      'Der Hersteller nennt einen effizienten Motor, kompakte Abmessungen und eine einfache Installation und Wartung. In den Katalogdaten ist als Herkunftsland Italien angegeben.',
    ],
    highlights: ['Selbstansaugend', 'Sauberes Wasser und nicht aggressive Medien', 'Kompakte Abmessungen', 'Wasserversorgung, Gebäudetechnik, Landwirtschaft'],
    typeShort: 'Selbstansaugende Blockpumpe', useShort: 'sauberes Wasser',
    imageSource: '/Images/ipg_ecom/Lowara/Lowara-BG.jpg', sample: 'BG3/A',
  },
  {
    key: 'lowara-doc', brand: 'lowara', group: 'GROUP143', name: 'DOC', pumpType: 'tauchmotorpumpen', segments: ['landwirtschaft', ...WT], applications: ['entwaesserung'],
    h1: 'Lowara DOC-Serie – Tauchmotorpumpen für die Entwässerung',
    title: 'Lowara DOC-Serie: Tauchmotorpumpen für Entwässerung',
    description: 'Lowara DOC: kompakte Tauchmotorpumpen für Wasser in Kellern, Schächten und kleinen Entwässerungsaufgaben. Kennbereiche, Angebot anfordern.',
    intro: 'Die Lowara DOC-Serie umfasst kompakte Tauchmotorpumpen zur Entwässerung, etwa in Kellern, Schächten und bei kleinen Entwässerungsaufgaben. Die Pumpen schalten selbsttätig und können mit integriertem Niveauschalter geliefert werden.',
    useCase: 'Kompakte Tauchmotorpumpen für Schächte, Keller und kleine Entwässerungen',
    body: [
      'Die DOC-Serie von Lowara besteht aus kompakten Tauchmotorpumpen für die Förderung von Wasser, zum Beispiel aus Kellern, Schächten und kleinen Entwässerungsstellen. Die robuste Bauweise erleichtert die Installation in unterschiedlichen Umgebungen.',
      'Der Katalog nennt überwiegend Edelstahl AISI 304 sowie Technopolymer als Werkstoffe, einen Betrieb mit automatischer Niveausteuerung und Pumpen für niedrige Wasserstände. Die Förderstrom- und Förderhöhenangaben der alten Website weichen voneinander ab; maßgeblich sind die Kennbereiche in der Tabelle und das Datenblatt des einzelnen Artikels.',
    ],
    highlights: ['Kompakte, robuste Bauweise', 'Automatischer Betrieb, mit Niveauschalter lieferbar', 'Edelstahl AISI 304 und Technopolymer (Katalogangabe)', 'Pumpen für niedrige Wasserstände'],
    typeShort: 'Tauchmotorpumpe', useShort: 'Entwässerung von Schächten und Kellern',
    productNote: 'Ausführungen mit Niveauschalter schalten selbsttätig.',
    imageSource: '/Images/ipg_ecom/Lowara/Lowara-DOC.jpg', sample: 'DOC3/A 40 50',
    verify: ['Leistungsangaben der alten Website widersprechen sich (10 vs. 14 m³/h, 7 vs. 11 m): nur Kennbereiche aus den Produktdaten verwendet.', 'Hinweise auf Haushalte und Klärgruben (alte Website) nicht übernommen, da die Seite sich an gewerbliche Kunden richtet.'],
  },
  {
    key: 'lowara-domo', brand: 'lowara', group: 'GROUP142', name: 'DOMO', pumpType: 'tauchmotorpumpen', segments: ['landwirtschaft', ...WT], applications: ['abwasser', 'entwaesserung'],
    h1: 'Lowara DOMO-Serie – Tauchmotorpumpen für Schmutz- und Abwasser',
    title: 'Lowara DOMO-Serie: Tauchmotorpumpen für Schmutzwasser',
    description: 'Lowara DOMO: Tauchmotorpumpen für Schmutz- und Abwasser mit doppelter Gleitringdichtung, 0,3 bis 7,5 kW. Kennbereiche, Angebot anfordern.',
    intro: 'Die Lowara DOMO-Serie umfasst Tauchmotorpumpen für die Förderung von Schmutz- und Abwasser in gewerblichen Anwendungen. Der Leistungsbereich reicht nach Herstellerangabe von 0,3 bis 7,5 kW.',
    useCase: 'Tauchmotorpumpen für Schmutz- und Abwasser',
    body: [
      'Die DOMO-Serie von Lowara ist für die Entsorgung von Schmutz- und Abwasser ausgelegt. Sie bietet eine große Auswahl an Modellen im Leistungsbereich von 0,3 bis 7,5 kW und eignet sich für gewerbliche Anwendungen.',
      'Die Pumpen sind laut Hersteller mit einer doppelten Gleitringdichtung ausgestattet, die vor Leckage schützt und die Lebensdauer verlängert. Die Angaben zum Werkstoff weichen zwischen Beschreibung und Katalogdaten ab; Gehäuse- und Laufradwerkstoff des gewählten Artikels finden Sie in den technischen Daten.',
    ],
    highlights: ['Schmutz- und Abwasser', '0,3 bis 7,5 kW (Herstellerangabe)', 'Doppelte Gleitringdichtung (Herstellerangabe)', 'Gewerbliche Anwendungen'],
    typeShort: 'Tauchmotorpumpe', useShort: 'Schmutz- und Abwasser',
    imageSource: '/Images/ipg_ecom/Lowara/Lowara-DOMO.jpg', sample: 'DOMO 10/B',
    verify: ['Die alte Website nennt „Edelstahl“, die Produktdaten nennen Gusseisen EN-GJL-250 für Gehäuse und Laufrad: Werkstoffaussage vor Veröffentlichung klären.'],
  },
  {
    key: 'lowara-diwa', brand: 'lowara', group: 'GROUP144', name: 'DIWA', pumpType: 'tauchmotorpumpen', segments: ['landwirtschaft', ...WT], applications: ['entwaesserung'],
    h1: 'Lowara DIWA-Serie – Tauchmotorpumpen für leicht verschmutztes Wasser',
    title: 'Lowara DIWA-Serie: Tauchmotorpumpen für Entwässerung',
    description: 'Lowara DIWA: Tauchmotorpumpen für sauberes und leicht verschmutztes Wasser, Entwässerung und Hochwasserschutz. Kennbereiche, Angebot anfordern.',
    intro: 'Die Lowara DIWA-Serie umfasst Tauchmotorpumpen für sauberes und leicht verschmutztes Wasser, etwa für die Entwässerung von Schächten und Baugruben und für den Hochwasserschutz. Ausführungen mit Schwimmerschalter schalten selbsttätig.',
    useCase: 'Tauchmotorpumpen für leicht verschmutztes Wasser und Entwässerung',
    body: [
      'Die DIWA-Serie von Lowara ist für professionelle Anwender in vielen Einsatzfeldern ausgelegt: Entwässerung, Förderung von sauberem und leicht verschmutztem Wasser sowie Hochwasserschutz. Die Serie umfasst Modelle mit unterschiedlichem Förderstrom, unterschiedlicher Förderhöhe und unterschiedlichem Durchgang.',
      'Der Katalog nennt eine robuste Ausführung, überwiegend in Edelstahl AISI 304, sowie thermoplastische Bauteile. Welche Werkstoffe ein einzelner Artikel verwendet, steht in dessen technischen Daten; bei DIWA 07/B bestehen Pumpengehäuse und Laufrad aus Gusseisen.',
    ],
    highlights: ['Sauberes und leicht verschmutztes Wasser', 'Mit Schwimmerschalter selbsttätig schaltend', 'Robuste Ausführung, überwiegend Edelstahl AISI 304 (Katalogangabe)', 'Entwässerung und Hochwasserschutz'],
    typeShort: 'Tauchmotorpumpe', useShort: 'leicht verschmutztes Wasser',
    productNote: 'Sie arbeitet tragbar oder fest installiert und schaltet bei Ausführungen mit Schwimmerschalter selbsttätig.',
    imageSource: '/Images/ipg_ecom/Lowara/Lowara-DIWA.jpg', sample: 'DIWA 07/B',
  },

  /* ---------------- SAER ---------------- */
  {
    key: 'saer-ir', brand: 'saer', group: 'GROUP136', name: 'IR', pumpType: 'kreiselpumpen', segments: ['landwirtschaft', HVAC, ...WT], applications: [],
    h1: 'SAER IR-Serie – Kreiselpumpen aus Gusseisen',
    title: 'SAER IR-Serie: Kreiselpumpen aus Gusseisen',
    description: 'SAER IR: Kreiselpumpen aus Gusseisen für Wasseraufbereitung, Wassertransport, Gebäudetechnik und Bewässerung. Kennbereiche, Angebot anfordern.',
    intro: 'Die SAER IR-Serie umfasst Kreiselpumpen aus Gusseisen für Wasseraufbereitung, Wassertransport, Gebäudetechnik und Bewässerung. Nach Herstellerangabe sind die Pumpen vollständig neu konstruiert und wartungsfreundlich aufgebaut.',
    useCase: 'Kreiselpumpen aus Gusseisen für Wasserversorgung und Bewässerung',
    body: [
      'Die IR-Serie von SAER besteht aus Kreiselpumpen für unterschiedliche Aufgaben: Wasseraufbereitung, Bewässerung landwirtschaftlicher Flächen und industrielle Anwendungen. Die Pumpen sind nach Herstellerangaben vollständig neu konstruiert und auf hohe Leistung und Effizienz ausgelegt.',
      'Der kompakte Aufbau eignet sich für beengte Aufstellorte. Die Pumpen sind laut Hersteller wartungsfreundlich, sodass sich Wartung und Instandsetzung ohne Spezialwerkzeug durchführen lassen. Nach Herstellerangabe erreicht die größte Baugröße der gesamten IR-Baureihe bis zu 1.600 m³/h und 100 m Förderhöhe; im Katalog sind kleinere Baugrößen geführt.',
    ],
    highlights: ['Gusseisen-Ausführung', 'Kompakter Aufbau', 'Wasseraufbereitung, Bewässerung, industrielle Anwendungen', 'Wartungsfreundlich (Herstellerangabe)'],
    typeShort: 'Kreiselpumpe', useShort: 'Wasserversorgung und Bewässerung',
    imageSource: '/Images/ipg_ecom/SAER/SAER-IR.jpg', sample: 'IR50-200SB',
    verify: ['„Größte Pumpe der Serie: 1.600 m³/h und 100 m“ (alte Website): für die gesamte IR-Baureihe vom Hersteller bestätigen lassen.', 'Wartung „ohne besondere Kenntnisse“ (alte Website) nicht übernommen.'],
  },
  {
    key: 'saer-ir-m', brand: 'saer', group: 'GROUP138', name: 'IR-M', pumpType: 'blockpumpen', segments: ['landwirtschaft', HVAC, ...WT], applications: [],
    h1: 'SAER IR-M-Serie – Blockpumpen aus Bronze',
    title: 'SAER IR-M-Serie: Blockpumpen aus Bronze',
    description: 'SAER IR-M: Blockpumpen aus Bronze für Wasseraufbereitung, Wassertransport und Gebäudetechnik. Kennbereiche, Artikel, Angebot anfordern.',
    intro: 'Die SAER IR-M-Serie umfasst Blockpumpen in Bronzeausführung für Wasseraufbereitung, Wassertransport, Gebäudetechnik und Bewässerung. Sie baut auf der IR-Serie auf, der Motor ist direkt an die Pumpe angeflanscht.',
    useCase: 'Blockpumpen aus Bronze für Wasseraufbereitung und Wassertransport',
    body: [
      'Die IR-M-Serie ist die Blockausführung der SAER IR-Serie mit Pumpengehäuse aus Bronze. Der Hersteller beschreibt sie als Pumpe für hohe Leistung und Effizienz. Bronze ist ein bewährter Werkstoff für Wasser mit erhöhten Anforderungen an die Korrosionsbeständigkeit.',
      'Die Pumpen sind für Wasseraufbereitung, Bewässerung und industrielle Anwendungen vorgesehen. Technische Daten wie Förderstrom, Förderhöhe und Motorleistung nennt die Tabelle der Kennbereiche; für den einzelnen Artikel gilt das Datenblatt.',
    ],
    highlights: ['Blockbauweise, Motor direkt angeflanscht', 'Pumpengehäuse aus Bronze', 'Wasseraufbereitung, Bewässerung, industrielle Anwendungen'],
    typeShort: 'Blockpumpe', useShort: 'Wasseraufbereitung und Wassertransport',
    imageSource: '/Images/ipg_ecom/SAER/SAER-IR-M.jpg', sample: 'IR80-160E-M',
  },
  {
    key: 'saer-irx', brand: 'saer', group: 'GROUP137', name: 'IRX', pumpType: 'blockpumpen', segments: ['landwirtschaft', HVAC, ...WT], applications: [],
    h1: 'SAER IRX-Serie – Blockpumpen aus Edelstahl 316',
    title: 'SAER IRX-Serie: Blockpumpen aus Edelstahl 316',
    description: 'SAER IRX: Blockpumpen aus Edelstahl 316 für Wasseraufbereitung, Wassertransport und Gebäudetechnik. Kennbereiche, Artikel, Angebot anfordern.',
    intro: 'Die SAER IRX-Serie umfasst Blockpumpen aus Edelstahl 316 für Wasseraufbereitung, Wassertransport, Gebäudetechnik und Bewässerung. Der Motor ist direkt an die Pumpe angeflanscht.',
    useCase: 'Blockpumpen aus Edelstahl 316 für Wasseraufbereitung und Wassertransport',
    body: [
      'Die IRX-Serie ist die Edelstahlausführung der SAER IR-Serie. Pumpengehäuse und Laufrad bestehen aus Edelstahl 316, was die Pumpen besonders widerstandsfähig gegen Korrosion macht. Die Bauform ist ein Block: Motor und Pumpe bilden eine Einheit.',
      'Die Pumpen sind für Wasseraufbereitung, Bewässerung und industrielle Anwendungen vorgesehen. Ob Edelstahl 316 für Ihr Medium geeignet ist, hängt von dessen Zusammensetzung und Temperatur ab; senden Sie uns dazu Ihre Betriebsdaten.',
    ],
    highlights: ['Blockbauweise, Motor direkt angeflanscht', 'Gehäuse und Laufrad aus Edelstahl 316', 'Wasseraufbereitung, Bewässerung, industrielle Anwendungen'],
    typeShort: 'Blockpumpe', useShort: 'Wasseraufbereitung und Wassertransport',
    imageSource: '/Images/ipg_ecom/SAER/SAER-IRX.jpg', sample: 'IRX40-200B',
  },
  {
    key: 'saer-m', brand: 'saer', group: 'GROUP139', name: 'M', pumpType: 'kreiselpumpen', segments: ['landwirtschaft'], applications: [],
    h1: 'SAER M-Serie – Kreiselpumpen für sauberes Wasser',
    title: 'SAER M-Serie: Kreiselpumpen für sauberes Wasser',
    description: 'SAER M (M50 bis M200): Kreiselpumpen für sauberes oder leicht verschmutztes Wasser in Landwirtschaft, Bauwesen und Industrie. Angebot anfordern.',
    intro: 'Die SAER M-Serie umfasst Kreiselpumpen für sauberes oder leicht verschmutztes Wasser in Landwirtschaft, Bauwesen und Industrie. Die Baureihe reicht im Katalog von M50 bis M200.',
    useCase: 'Kreiselpumpen für sauberes oder leicht verschmutztes Wasser',
    body: [
      'Die M-Serie von SAER besteht aus Kreiselpumpen, die nach Herstellerangaben aus Gusseisen und Edelstahl gefertigt sind. Sie eignen sich für die Förderung von sauberem Wasser und Flüssigkeiten mit geringem Feststoffanteil, etwa aus Brunnen und Behältern, für Bewässerung und Entwässerung.',
      'Größere Baugrößen (M150, M200) sind für den gewerblichen und industriellen Einsatz ausgelegt, unter anderem für Wasseraufbereitung, Wassertransport, Kälte- und Klimatechnik. Die Pumpen haben einen einfachen Aufbau mit zuverlässiger Wellendichtung und lassen sich leicht installieren und warten.',
    ],
    highlights: ['Sauberes oder leicht verschmutztes Wasser', 'Gusseisen und Edelstahl (Herstellerangabe)', 'Bewässerung, Entwässerung, Wassertransport', 'Einfache Installation und Wartung'],
    typeShort: 'Kreiselpumpe', useShort: 'sauberes oder leicht verschmutztes Wasser',
    imageSource: '/Images/ipg_ecom/SAER/SAER-M-50-60-70-80.jpg', sample: 'M80',
    verify: ['„Privatsektor“ (alte Website) nicht übernommen. Katalog führt die TR-Druckerhöhungsanlagen in derselben Datengruppe: als eigene Serie abgetrennt.'],
  },
  {
    key: 'saer-tr', brand: 'saer', group: 'GROUP139', name: 'TR', pumpType: 'druckerhoehungsanlagen', segments: [HVAC], applications: [],
    h1: 'SAER TR-Serie – Druckerhöhungsanlagen für Gebäude und Anlagen',
    title: 'SAER TR-Serie: Druckerhöhungsanlagen',
    description: 'SAER TR: Druckerhöhungsanlagen mit Edelstahlbehälter und Steuerung für Gebäude, Krankenhäuser und Industrieanlagen. Kennbereiche, Angebot anfordern.',
    intro: 'Die SAER TR-Serie umfasst Druckerhöhungsanlagen für den Wasserbedarf von Gebäuden und Anlagen, zum Beispiel Büros, Krankenhäuser und Industriebetriebe. Jede Anlage besteht aus Pumpen, Edelstahlbehälter und Steuerung.',
    useCase: 'Druckerhöhungsanlagen mit Pumpen, Edelstahlbehälter und Steuerung',
    body: [
      'Die Druckerhöhungsanlagen der TR-Serie sind für den Wasserbedarf von Gebäuden und Anlagen vorgesehen, etwa Büros, Krankenhäusern und Industriebetrieben. Mit Pumpen und Drucksensoren halten sie den Wasserdruck konstant.',
      'Die Anlagen sind in mehreren Ausführungen erhältlich und lassen sich an den Bedarf des Betreibers anpassen. Der Edelstahlbehälter gleicht den Druck aus und stellt auch in Spitzenzeiten ausreichend Wasser bereit. Nach Herstellerangabe sind die Anlagen einfach zu installieren und zu warten.',
    ],
    highlights: ['Pumpen, Edelstahlbehälter und Steuerung in einer Einheit', 'Konstanter Wasserdruck', 'Für Büros, Krankenhäuser und Industrieanlagen'],
    typeShort: 'Druckerhöhungsanlage', useShort: 'konstanten Wasserdruck in Gebäuden',
    imageSource: '/Images/ipg_ecom/SAER/SAER-TR.jpg', sample: 'TR 5',
    verify: ['Branche „Gebäudetechnik / HVAC“ aus der Beschreibung („Wasserbedarf von Gebäuden“) abgeleitet; die Produktdaten enthalten keine Branchenangabe.'],
  },

  /* ---------------- Flygt ---------------- */
  {
    key: 'flygt-ready', brand: 'flygt', group: 'GROUP151', name: 'Ready', pumpType: 'tauchmotorpumpen', segments: ['landwirtschaft', ...WT], applications: ['entwaesserung', 'abwasser'],
    h1: 'Flygt Ready-Serie – Tauchmotorpumpen für Entwässerung und Wasserhaltung',
    title: 'Flygt Ready-Serie: Tauchmotorpumpen für Entwässerung',
    description: 'Flygt Ready: Tauchmotorpumpen für Entwässerung, Wasserhaltung und Wassertransport. Kennbereiche, Artikel, Angebot anfordern.',
    intro: 'Die Flygt Ready-Serie umfasst Tauchmotorpumpen für Entwässerung, Grundwasserabsenkung und Anwendungen des Wassertransports. Der Katalog führt die Ausführungen Ready 4, Ready 8 und Ready 8S, teils mit Schwimmerschalter.',
    useCase: 'Tauchmotorpumpen für Entwässerung und Wasserhaltung',
    body: [
      'Die Ready-Serie von Flygt besteht aus Tauchmotorpumpen, die für anspruchsvolle Aufgaben im Wassermanagement ausgelegt sind, zum Beispiel Entwässerung und Grundwasserabsenkung. Nach Herstellerangaben sind die Pumpen leicht zu installieren und zu warten und lassen sich an die Anforderungen der Anwendung anpassen.',
      'Für die Ready-Serie liegen im Katalog bisher nur wenige technische Werte vor (Spannung, Leistung, Frequenz). Kennlinien und weitere Daten nennen wir Ihnen auf Anfrage aus dem Datenblatt des Herstellers.',
    ],
    highlights: ['Entwässerung und Grundwasserabsenkung', 'Ready 4, Ready 8 und Ready 8S, teils mit Schwimmerschalter', 'Leicht zu installieren (Herstellerangabe)'],
    typeShort: 'Tauchmotorpumpe', useShort: 'Entwässerung und Wasserhaltung',
    imageSource: '/Images/ipg_ecom/Flygt/Flygt-Ready-series.png', sample: 'Ready 4',
    verify: ['Technologie-Aussagen der alten Website („Adaptive N“, „SmartRun“) nicht übernommen, da in den Produktdaten nicht belegt.', 'Verschleiß- und Korrosionsbeständigkeit („für raue Bedingungen“) nicht übernommen.'],
  },

  /* ---------------- Ebara ---------------- */
  {
    key: 'ebara-optima', brand: 'ebara', group: 'GROUP153', name: 'Optima', pumpType: 'tauchmotorpumpen', segments: ['landwirtschaft', ...WT], applications: ['entwaesserung'],
    h1: 'Ebara Optima-Serie – Kompakte Tauchmotorpumpen für die Entwässerung',
    title: 'Ebara Optima-Serie: Kompakte Tauchmotorpumpen',
    description: 'Ebara Optima: kompakte Tauchmotorpumpen für Entwässerung und Wasserversorgung. Ausführungen Optima, Optima A und Optima MS. Angebot anfordern.',
    intro: 'Die Ebara Optima-Serie umfasst kompakte Tauchmotorpumpen für Entwässerung und Wasserversorgung. Der Katalog führt die Ausführungen Optima, Optima A und Optima MS.',
    useCase: 'Kompakte Tauchmotorpumpen für Entwässerung und Wasserversorgung',
    body: [
      'Die Optima-Serie von Ebara besteht aus Tauchmotorpumpen zur Förderung von Wasser in Entwässerung und Wasserversorgung. Sie ist in mehreren Modellen mit unterschiedlichen Förderströmen und Leistungen erhältlich.',
      'Als Werkstoffe nennt der Katalog unter anderem Edelstahl und Bronze, die Pumpen gegen Korrosion und Verschleiß beständig machen. Die technischen Daten des gewählten Artikels, etwa Schutzart, Freier Durchgang und Gewicht, finden Sie in der Tabelle.',
    ],
    highlights: ['Kompakte Bauweise', 'Entwässerung und Wasserversorgung', 'Edelstahl und Bronze (Katalogangabe)'],
    typeShort: 'Tauchmotorpumpe', useShort: 'Entwässerung',
    imageSource: '/Images/ipg_ecom/Ebara/Ebara-Optima.png', sample: 'Optima MS',
    verify: ['Aussage zum Hersteller („führender Hersteller“) nicht übernommen.'],
  },
  {
    key: 'ebara-best-one', brand: 'ebara', group: 'GROUP154', name: 'Best One', pumpType: 'tauchmotorpumpen', segments: ['landwirtschaft', ...WT], applications: ['entwaesserung'],
    h1: 'Ebara Best One-Serie – Tragbare Tauchmotorpumpen aus Edelstahl',
    title: 'Ebara Best One-Serie: Tauchmotorpumpen aus Edelstahl',
    description: 'Ebara Best One: tragbare Tauchmotorpumpen aus Edelstahl 304 für sauberes und leicht verschmutztes Wasser. Ausführungen MS, A und Vox. Angebot anfordern.',
    intro: 'Die Ebara Best One-Serie umfasst tragbare Tauchmotorpumpen aus Edelstahl 304 für sauberes und leicht verschmutztes Wasser. Der Katalog führt die Ausführungen MS, A, Vox und Vox A.',
    useCase: 'Tragbare Tauchmotorpumpen aus Edelstahl 304',
    body: [
      'Die Best-One-Serie von Ebara besteht aus tragbaren Tauchmotorpumpen, die laut Katalog vollständig aus Edelstahl 304 gefertigt sind. Sie fördern sauberes und leicht verschmutztes Wasser, zum Beispiel bei der Entwässerung von Kellern und Schächten oder bei der Ableitung von Regenwasser.',
      'Die Ausführungen unterscheiden sich in Förderstrom und Förderhöhe. Die Vox-Ausführungen haben ein Vortex-Laufrad; der Freie Durchgang des gewählten Artikels steht in den technischen Daten.',
    ],
    highlights: ['Tragbar, vollständig Edelstahl 304 (Katalogangabe)', 'Sauberes und leicht verschmutztes Wasser', 'Keller- und Schachtentwässerung, Regenwasser'],
    typeShort: 'Tauchmotorpumpe', useShort: 'Entwässerung von Schächten und Kellern',
    imageSource: '/Images/ipg_ecom/Ebara/Ebara-Best-One-MS.png', sample: 'Best One Vox',
    verify: ['Anwendungen „Pool“ und „Garten“ (alte Website) nicht übernommen (privater Bereich).'],
  },
  {
    key: 'ebara-dw', brand: 'ebara', group: 'GROUP155', name: 'DW', pumpType: 'tauchmotorpumpen', segments: ['landwirtschaft', ...WT], applications: ['abwasser', 'entwaesserung'],
    h1: 'Ebara DW-Serie – Tauchmotorpumpen für Wasser mit höherem Schmutzanteil',
    title: 'Ebara DW-Serie: Tauchmotorpumpen für Schmutzwasser',
    description: 'Ebara DW und DW VOX: Tauchmotorpumpen für Wasser mit höherem Schmutzanteil, Baugruben und Grundwasserabsenkung. Kennbereiche, Angebot anfordern.',
    intro: 'Die Ebara DW-Serie (DW und DW VOX) umfasst Tauchmotorpumpen für Wasser mit relativ hohem Schmutzanteil, etwa für Abwasser, Baugruben, Kellerentwässerung und Grundwasserabsenkung. Die Pumpen sind vollständig tauchfähig.',
    useCase: 'Tauchmotorpumpen für Wasser mit höherem Schmutzanteil',
    body: [
      'Die DW-Serie von Ebara ist für Wasser mit relativ hohem Schmutzanteil ausgelegt. Die Pumpen haben ein Laufrad aus Edelstahl und sind in unterschiedlichen Leistungen und Förderströmen erhältlich; sie eignen sich für kleine und große Anwendungen.',
      'Die Ausführung DW VOX hat ein Vortex-Laufrad und kann Abwasser mit Feststoffen bis zu einem Durchmesser von 50 mm fördern. Bei beiden Ausführungen ist der Freie Durchgang des gewählten Artikels in den technischen Daten angegeben.',
    ],
    highlights: ['Wasser mit höherem Schmutzanteil', 'Laufrad aus Edelstahl (Katalogangabe)', 'DW VOX: Vortex-Laufrad, Feststoffe bis 50 mm', 'Baugruben, Kellerentwässerung, Grundwasserabsenkung'],
    typeShort: 'Tauchmotorpumpe', useShort: 'Schmutzwasser und Grundwasserabsenkung',
    imageSource: '/Images/ipg_ecom/Ebara/Ebara-DW-series.png', sample: 'DW 200 T',
  },
  {
    key: 'ebara-cdx', brand: 'ebara', group: 'GROUP158', name: 'CDX', pumpType: 'kreiselpumpen', segments: ['landwirtschaft', HVAC, ...WT], applications: [],
    h1: 'Ebara CDX-Serie – Kreiselpumpen aus Edelstahl',
    title: 'Ebara CDX-Serie: Kreiselpumpen aus Edelstahl',
    description: 'Ebara CDX und CDXM: Kreiselpumpen aus Edelstahl für Industrie, Landwirtschaft und Gebäudetechnik. Kennbereiche, Artikel, Angebot anfordern.',
    intro: 'Die Ebara CDX-Serie (CDX und CDXM) umfasst Kreiselpumpen aus Edelstahl für saubere und leicht verschmutzte Flüssigkeiten in Industrie, Landwirtschaft und Gebäudetechnik. Pumpengehäuse, Laufrad und Welle bestehen aus Edelstahl.',
    useCase: 'Kreiselpumpen aus Edelstahl für Industrie und Gebäudetechnik',
    body: [
      'Die CDX-Serie von Ebara besteht aus kompakten, robust gebauten Kreiselpumpen. Pumpengehäuse, Laufrad und Motorwelle sind laut Katalog aus korrosionsbeständigem Edelstahl, was den Einsatz auch bei anspruchsvollen Medien erleichtert.',
      'Eine mechanische Wellendichtung dichtet gegen Leckage ab. Die Pumpen fördern sauberes und leicht verschmutztes Wasser; für aggressive Medien muss die Werkstoffbeständigkeit im Einzelfall geprüft werden.',
    ],
    highlights: ['Gehäuse, Laufrad und Welle aus Edelstahl (Katalogangabe)', 'Mechanische Wellendichtung', 'Industrie, Landwirtschaft, Gebäudetechnik'],
    typeShort: 'Kreiselpumpe', useShort: 'Industrie und Gebäudetechnik',
    imageSource: '/Images/ipg_ecom/Ebara/Ebara-CDX.png', sample: 'CDX 70/07 IE3',
    verify: ['„Einsatz mit aggressiven Chemikalien“ (alte Website) nicht übernommen: hängt vom Medium ab.'],
  },
  {
    key: 'ebara-dwo', brand: 'ebara', group: 'GROUP159', name: 'DWO', pumpType: 'kreiselpumpen', segments: ['landwirtschaft', HVAC, ...WT], applications: [],
    h1: 'Ebara DWO-Serie – Kreiselpumpen für hohe Förderhöhen',
    title: 'Ebara DWO-Serie: Kreiselpumpen für hohe Förderhöhen',
    description: 'Ebara DWO: Kreiselpumpen aus Edelstahl für industrielle Anwendungen mit hohen Förderhöhen und Drücken. Kennbereiche, Angebot anfordern.',
    intro: 'Die Ebara DWO-Serie umfasst Kreiselpumpen aus Edelstahl für industrielle Anwendungen mit höheren Förderhöhen und Drücken. Sie fördern sauberes und leicht verschmutztes Wasser mit Feststoffen bis 2,5 mm.',
    useCase: 'Kreiselpumpen aus Edelstahl für hohe Förderhöhen und Drücke',
    body: [
      'Die DWO-Serie von Ebara ist für industrielle Anwendungen ausgelegt, bei denen höhere Förderhöhen und Drücke gefordert sind. Die Pumpen haben eine robuste Konstruktion mit einem Laufrad mit rückwärtsgekrümmten Schaufeln.',
      'Laut Katalog sind Pumpengehäuse, Laufrad und Welle aus korrosionsbeständigem Edelstahl. Die Pumpen eignen sich für sauberes Wasser und leicht verschmutztes Wasser mit Feststoffen bis 2,5 mm. Maximaler Betriebsdruck und weitere Daten finden Sie in den technischen Daten des Artikels.',
    ],
    highlights: ['Hohe Förderhöhen und Drücke', 'Feststoffe bis 2,5 mm (Katalogangabe)', 'Edelstahl (Katalogangabe)'],
    typeShort: 'Kreiselpumpe', useShort: 'hohe Förderhöhen',
    imageSource: '/Images/ipg_ecom/Ebara/Ebara-DWO.png', sample: 'DWO 400 T',
    verify: ['Produktdaten von DWO 400 T: Spannung „230 V“ bei Typbezeichnung „T“ und 3 kW; Daten vor Veröffentlichung gegen das Datenblatt prüfen.'],
  },
  {
    key: 'ebara-jex-jesx', brand: 'ebara', group: 'GROUP156', name: 'JEX/JESX', pumpType: 'kreiselpumpen', segments: ['landwirtschaft', HVAC, ...WT], applications: [],
    h1: 'Ebara JEX/JESX-Serie – Selbstansaugende Kreiselpumpen',
    title: 'Ebara JEX/JESX-Serie: Selbstansaugende Kreiselpumpen',
    description: 'Ebara JEX und JESX: einstufige Kreiselpumpen (Jetpumpen) für sauberes oder leicht verschmutztes Wasser. Kennbereiche, Artikel, Angebot anfordern.',
    intro: 'Die Ebara JEX/JESX-Serie umfasst einstufige Kreiselpumpen, teilweise als Jetpumpen ausgeführt, für sauberes oder leicht verschmutztes Wasser. Die Serie ist für industrielle und gewerbliche Anwendungen vorgesehen.',
    useCase: 'Einstufige Kreiselpumpen (Jetpumpen) für sauberes Wasser',
    body: [
      'Die Baureihen JEX und JESX von Ebara sind einstufige Kreiselpumpen für die Förderung sauberer oder leicht verschmutzter Flüssigkeiten. Sie sind auf Zuverlässigkeit, Effizienz und einfache Handhabung ausgelegt.',
      'Beide Baureihen haben einen Motor mit geringem Energieverbrauch und lassen sich dank kompakter Bauweise und gutem Zugang zu den Innenteilen einfach installieren und warten. In den Katalogdaten sind mehrere Artikel als Jetpumpen geführt.',
    ],
    highlights: ['Einstufige Kreiselpumpen, teilweise als Jetpumpen', 'Sauberes oder leicht verschmutztes Wasser', 'Kompakte Bauweise'],
    typeShort: 'Kreiselpumpe', useShort: 'sauberes oder leicht verschmutztes Wasser',
    imageSource: '/Images/ipg_ecom/Ebara/Ebara-JESX-series.png', sample: 'JEX 120',
    verify: ['„Leichte Chemikalien und Öle“ (alte Website) nicht übernommen. Die Produktdaten führen JESX teils als „Tauchpumpe“ und teils als „Kreiselpumpe“: Einordnung vor Veröffentlichung klären.'],
  },
  {
    key: 'ebara-aga-agc', brand: 'ebara', group: 'GROUP157', name: 'AGA/AGC', pumpType: 'kreiselpumpen', segments: ['landwirtschaft', HVAC, ...WT], applications: [],
    h1: 'Ebara AGA/AGC-Serie – Selbstansaugende Kreiselpumpen',
    title: 'Ebara AGA/AGC-Serie: Selbstansaugende Kreiselpumpen',
    description: 'Ebara AGA und AGC: selbstansaugende Kreiselpumpen für Industrie, Gewerbe und Gebäudetechnik. Kennbereiche, Artikel, Angebot anfordern.',
    intro: 'Die Ebara AGA/AGC-Serie umfasst selbstansaugende Kreiselpumpen für industrielle und gewerbliche Anwendungen, unter anderem in der Gebäudetechnik und im Wassertransport. Sie sind als Einphasen- und Dreiphasenausführung erhältlich.',
    useCase: 'Selbstansaugende Kreiselpumpen für Industrie und Gebäudetechnik',
    body: [
      'Die AGA/AGC-Serie von Ebara besteht aus selbstansaugenden Kreiselpumpen in mehreren Größen und Leistungen. Der Hersteller nennt Anwendungen in der Gebäudetechnik, im Wasser- und Abwasserbereich, in der Lebensmittelverarbeitung und in der chemischen Verfahrenstechnik.',
      'Die Pumpen sind als Einphasen- und Dreiphasenausführung erhältlich und nach Herstellerangaben einfach zu installieren und zu warten. Welche Werkstoffe ein einzelner Artikel verwendet, steht in dessen technischen Daten.',
    ],
    highlights: ['Selbstansaugend', 'Einphasen- und Dreiphasenausführung', 'Gebäudetechnik, Wassertransport, industrielle Anwendungen'],
    typeShort: 'Selbstansaugende Kreiselpumpe', useShort: 'Industrie und Gebäudetechnik',
    imageSource: '/Images/ipg_ecom/Ebara/Ebara-AGA-AGC-series.png', sample: 'AGC 300 T',
    verify: ['„Laufrad und Diffusor aus Edelstahl“ (alte Website) nicht übernommen: Produktdaten nennen Messing-Laufrad und Gusseisen-Gehäuse (AGC 300 T).', 'Einsatz in Lebensmittel- und Chemieverfahrenstechnik (alte Website): vom Hersteller bestätigen lassen.'],
  },
];

/** Shared, generic engineering guidance per pump type (no product claims). Rendered on series pages as "Auswahlhinweise". */
export const PUMP_TYPE_NOTES: Record<PumpTypeSlug, { heading: string; paragraphs: string[]; bullets: string[] }> = {
  'mehrstufige-pumpen': {
    heading: 'Auswahlhinweise für mehrstufige Pumpen',
    paragraphs: ['Bei mehrstufigen Pumpen addieren sich die Förderhöhen der einzelnen Stufen. Die Auslegung beginnt deshalb mit dem geforderten Förderstrom und dem benötigten Enddruck.'],
    bullets: [
      'Betriebspunkt: Er ergibt sich aus dem Schnittpunkt von Pumpen- und Anlagenkennlinie und sollte in der Nähe des Bestpunkts liegen.',
      'NPSH: Der NPSH-Wert der Anlage muss den NPSH-Bedarf der Pumpe mit Sicherheitszuschlag übersteigen, sonst droht Kavitation.',
      'Werkstoff: Er richtet sich nach Fördermedium, Temperatur und Zusammensetzung.',
      'Drehzahlregelung: Ein Frequenzumrichter passt Förderstrom und Druck an wechselnden Bedarf an.',
    ],
  },
  kreiselpumpen: {
    heading: 'Auswahlhinweise für Kreiselpumpen',
    paragraphs: ['Für die Auswahl einer Kreiselpumpe sind Förderstrom, Förderhöhe und Fördermedium die Grundlage. Danach werden Werkstoff, Dichtung und Motorleistung festgelegt.'],
    bullets: [
      'Betriebspunkt: Er ergibt sich aus dem Schnittpunkt von Pumpen- und Anlagenkennlinie und sollte in der Nähe des Bestpunkts liegen.',
      'NPSH: Der NPSH-Wert der Anlage muss den NPSH-Bedarf der Pumpe mit Sicherheitszuschlag übersteigen, sonst droht Kavitation.',
      'Medium: Temperatur, Feststoffanteil und chemische Zusammensetzung bestimmen Werkstoff und Wellendichtung.',
      'Ersatz: Beim Austausch einer vorhandenen Pumpe sind Anschlussmaße, Drehzahl und Motordaten des Typenschilds maßgeblich.',
    ],
  },
  blockpumpen: {
    heading: 'Auswahlhinweise für Blockpumpen',
    paragraphs: ['Bei Blockpumpen ist der Motor direkt an die Pumpe angeflanscht. Das spart Platz und vereinfacht die Aufstellung; Motor und Hydraulik werden als Einheit ausgewählt.'],
    bullets: [
      'Betriebspunkt: Er ergibt sich aus dem Schnittpunkt von Pumpen- und Anlagenkennlinie und sollte in der Nähe des Bestpunkts liegen.',
      'NPSH: Der NPSH-Wert der Anlage muss den NPSH-Bedarf der Pumpe mit Sicherheitszuschlag übersteigen, sonst droht Kavitation.',
      'Medium: Werkstoff und Wellendichtung müssen zu Temperatur und Zusammensetzung des Mediums passen.',
      'Ersatz: Beim Austausch sind Anschlussmaße, Drehzahl und elektrische Daten des Typenschilds maßgeblich.',
    ],
  },
  tauchmotorpumpen: {
    heading: 'Auswahlhinweise für Tauchmotorpumpen',
    paragraphs: ['Tauchmotorpumpen arbeiten im Medium und fördern es direkt aus Schacht, Grube oder Behälter. Entscheidend sind Förderstrom, Förderhöhe und die Beschaffenheit des Mediums.'],
    bullets: [
      'Freier Durchgang: Er gibt die größte Feststoffgröße an, die die Pumpe passieren kann.',
      'Niveausteuerung: Schwimmerschalter oder Niveaugeber schalten die Pumpe selbsttätig und schützen vor Trockenlauf.',
      'Einbau: Eintauchtiefe, Kühlung des Motors und Aufstellart (tragbar oder fest installiert) beachten.',
      'Explosionsgefährdete Bereiche: Hier ist eine Ausführung nach ATEX (2014/34/EU) erforderlich; bitte vor der Auswahl prüfen.',
    ],
  },
  druckerhoehungsanlagen: {
    heading: 'Auswahlhinweise für Druckerhöhungsanlagen',
    paragraphs: ['Eine Druckerhöhungsanlage wird nach dem Spitzenbedarf und dem erforderlichen Netzdruck ausgelegt. Für Trinkwasser-Installationen gilt DIN 1988-500 für Druckerhöhungsanlagen mit drehzahlgeregelten Pumpen.'],
    bullets: [
      'Förderstrom: Der Spitzenvolumenstrom des Gebäudes oder der Anlage bestimmt die Pumpengröße.',
      'Druck: Vordruck, geodätische Höhe und Leitungsverluste ergeben den benötigten Enddruck.',
      'Behälter: Das Behältervolumen beeinflusst die Schalthäufigkeit der Pumpen.',
      'Betrieb: Anzahl der Pumpen und Reserve richten sich nach der geforderten Ausfallsicherheit.',
    ],
  },
};
