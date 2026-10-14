/**
 * Controlled vocabulary used to connect series across brands (internal-linking signal) and to point at the
 * planned topic pages. A planned page is linked ONLY once its story exists (see linking.ts).
 */
export interface TaxonomyTerm { slug: string; label: string; path: string; image?: string }

export const PUMP_TYPES: TaxonomyTerm[] = [
  { slug: 'kreiselpumpen', label: 'Kreiselpumpen', path: '/pumpen/pumpentypen/kreiselpumpen', image: '/img/types/kreiselpumpen.webp' },
  { slug: 'mehrstufige-pumpen', label: 'Mehrstufige Pumpen', path: '/pumpen/pumpentypen/mehrstufige-pumpen', image: '/img/types/mehrstufige-pumpen.webp' },
  { slug: 'blockpumpen', label: 'Blockpumpen', path: '/pumpen/pumpentypen/blockpumpen', image: '/img/types/blockpumpen.webp' },
  { slug: 'tauchmotorpumpen', label: 'Tauchmotorpumpen', path: '/pumpen/pumpentypen/tauchmotorpumpen', image: '/img/types/tauchmotorpumpen.webp' },
  { slug: 'druckerhoehungsanlagen', label: 'Druckerhöhungsanlagen', path: '/pumpen/pumpentypen/druckerhoehungsanlagen', image: '/img/types/druckerhoehungsanlagen.webp' },
];

export const SEGMENTS: TaxonomyTerm[] = [
  { slug: 'gebaeudetechnik-hvac', label: 'Gebäudetechnik / HVAC', path: '/pumpen/branchen/gebaeudetechnik-hvac' },
  { slug: 'wasseraufbereitung', label: 'Wasseraufbereitung', path: '/pumpen/branchen/wasseraufbereitung' },
  { slug: 'wassertransport', label: 'Wassertransport', path: '/pumpen/branchen/wassertransport' },
  { slug: 'landwirtschaft', label: 'Landwirtschaft', path: '/pumpen/branchen/landwirtschaft' },
];

export const APPLICATIONS: TaxonomyTerm[] = [
  { slug: 'entwaesserung', label: 'Entwässerung', path: '/pumpen/anwendungen/entwaesserung' },
  { slug: 'abwasser', label: 'Abwasser', path: '/pumpen/anwendungen/abwasser' },
];

export const termLabel = (list: TaxonomyTerm[], slug: string): string => list.find((t) => t.slug === slug)?.label ?? slug;
export const findTerm = (list: TaxonomyTerm[], slug: string): TaxonomyTerm | undefined => list.find((t) => t.slug === slug);

/** One-sentence, general definition per pump type (used on the home page and as a first orientation). */
export const TYPE_BLURB: Record<string, string> = {
  kreiselpumpen: 'Kreiselpumpen fördern Flüssigkeiten über ein Laufrad und sind der Standard für Wasser bei mittleren Förderhöhen.',
  'mehrstufige-pumpen': 'Mehrstufige Pumpen schalten mehrere Laufräder hintereinander und erzeugen hohe Drücke bei überschaubarem Förderstrom.',
  blockpumpen: 'Blockpumpen haben einen direkt angeflanschten Motor und benötigen wenig Platz.',
  tauchmotorpumpen: 'Tauchmotorpumpen arbeiten im Medium selbst und fördern Wasser aus Schächten, Gruben und Behältern.',
  druckerhoehungsanlagen: 'Druckerhöhungsanlagen fassen Pumpen, Behälter und Steuerung zusammen und halten den Druck konstant.',
};
