/** UN/CEFACT common codes where one exists; everything else is published as readable unitText. */
const UNIT_CODES: Record<string, string> = {
  kW: 'KWT', m: 'MTR', mm: 'MMT', kg: 'KGM', '°C': 'CEL', V: 'VLT', A: 'AMP', Hz: 'HTZ', bar: 'BAR', kPa: 'KPA', W: 'WTT', 'l/s': 'G51', Nm: 'NEW', dB: '2N',
};
export function unitProps(unit?: string): { unitCode?: string; unitText?: string } {
  if (!unit) return {};
  const code = UNIT_CODES[unit];
  return code ? { unitCode: code } : { unitText: unit };
}
