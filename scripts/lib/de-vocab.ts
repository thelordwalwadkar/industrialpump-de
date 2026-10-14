/**
 * EN/NL → DE vocabulary for catalogue values (materials, designs, seals …). Unknown values are never guessed:
 * they are kept verbatim and reported as an "untranslated value" warning in docs/import-report.md.
 */
const MATERIALS: Record<string, string> = {
  'cast iron': 'Gusseisen',
  'cast iron en-gjl-250': 'Gusseisen EN-GJL-250',
  'cast iron g20': 'Gusseisen G20',
  bronze: 'Bronze',
  brass: 'Messing',
  'stainless steel 316': 'Edelstahl 316',
  'stainless steel aisi 316': 'Edelstahl AISI 316',
  'stainless steel aisi 316 (1.4401)': 'Edelstahl AISI 316 (1.4401)',
  'stainless steel aisi 304': 'Edelstahl AISI 304',
  'stainless steel aisi 431': 'Edelstahl AISI 431',
  'stainless steel aisi 431 (1.4057)': 'Edelstahl AISI 431 (1.4057)',
  'aisi 304': 'Edelstahl AISI 304',
  'aisi 303': 'Edelstahl AISI 303',
  'carbon steel g20mn5': 'Kohlenstoffstahl G20Mn5',
  'thermoplastic resin': 'Thermoplast',
  'ppe+ps glass fibre reinforced': 'PPE+PS, glasfaserverstärkt',
  'ppe+ps glass fiber reinforced': 'PPE+PS, glasfaserverstärkt',
  'ppe+ps glass fiber reinforced ': 'PPE+PS, glasfaserverstärkt',
  'silicon carbide': 'Siliziumkarbid',
  'graphite and ceramic': 'Graphit und Keramik',
  'graphite/ceramic': 'Graphit / Keramik',
  'carbon graphite and ceramic': 'Kohlegraphit und Keramik',
  'carbon impregnated with resin': 'Kohle, harzimprägniert',
  'carbon/ceramic/nbr': 'Kohle / Keramik / NBR',
  'carbon/silicon carbide/nbr': 'Kohle / Siliziumkarbid / NBR',
  'ceramic/carbon/nbr': 'Keramik / Kohle / NBR',
  'rubber epdm': 'EPDM',
  'alumina oxide': 'Aluminiumoxid',
  'aramidic fiber': 'Aramidfaser',
};

const MISC: Record<string, string> = {
  'closed channel impeller': 'Geschlossenes Kanalrad',
  'vortex impeller': 'Vortex-Laufrad',
  'radial ball bearing with permanent grease': 'Radialkugellager mit Dauerschmierung',
  'at top': 'oben',
  'cw / ccw': 'rechts / links',
  'clockwise from the drive end': 'rechts, vom Antriebsende gesehen',
  'close coupled': 'Blockbauweise',
  s1: 'S1',
  without: 'ohne',
  italië: 'Italien',
  'submersible dry type / pole pairs 1': 'Tauchmotor, Trockenläufer-Ausführung / Polpaarzahl 1',
  'submersible dry type / 50 hz / pole pairs 1': 'Tauchmotor, Trockenläufer-Ausführung / 50 Hz / Polpaarzahl 1',
  'submersible sewage pumps': 'Tauchmotor-Abwasserpumpen',
  standard: 'Standard',
  'painting cycles c3 durability medium': 'Lackierung nach C3, mittlere Schutzdauer',
};

export interface TranslateResult { text: string; known: boolean }

const norm = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();

/** Translates a (possibly comma-separated) value; `known` is false when any part had no entry. */
export function translate(value: unknown, dict: 'material' | 'misc' = 'misc'): TranslateResult {
  const raw = String(value ?? '').trim();
  if (!raw) return { text: '', known: true };
  const table = dict === 'material' ? { ...MATERIALS, ...MISC } : { ...MISC, ...MATERIALS };
  const whole = table[norm(raw)];
  if (whole) return { text: whole, known: true };
  const parts = raw.split(/\s*,\s*/);
  if (parts.length > 1) {
    const out = parts.map((p) => table[norm(p)]);
    if (out.every(Boolean)) return { text: out.join(', '), known: true };
  }
  return { text: raw, known: false };
}

/** Housing-material category for the series filter (an option list, never free text). */
export function materialCategory(value: string): string | undefined {
  const v = value.toLowerCase();
  if (/stainless|aisi\s*3|edelstahl/.test(v)) return 'Edelstahl';
  if (/bronze/.test(v) && !/cast iron/.test(v)) return 'Bronze';
  if (/cast iron|gusseisen/.test(v)) return 'Gusseisen';
  if (/brass|messing/.test(v)) return 'Messing';
  if (/thermoplastic|ppe/.test(v)) return 'Thermoplast';
  if (/carbon steel/.test(v)) return 'Stahlguss';
  return undefined;
}
