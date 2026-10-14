/** German number formatting for visible text; machine-readable values keep dot decimals. */
const nf = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });

export function toNumber(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

export function fmtNumber(v: unknown, digits: 1 | 2 = 1): string | undefined {
  const n = toNumber(v);
  return n === undefined ? undefined : (digits === 2 ? nf2 : nf).format(n);
}

/** `fmtValue(7.5,'kW')` → "7,5 kW". Returns undefined when the value is unknown (never "0"). */
export function fmtValue(v: unknown, unit?: string, digits: 1 | 2 = 1): string | undefined {
  const s = fmtNumber(v, digits);
  return s === undefined ? undefined : unit ? `${s} ${unit}` : s;
}

export function fmtDate(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' }).format(d);
}

/** True when the string still contains an editor placeholder. */
export const hasPlaceholder = (s: unknown): boolean => typeof s === 'string' && s.includes('[[PLATZHALTER');
