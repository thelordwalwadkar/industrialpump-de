/**
 * Catalogue row (English/Dutch workbook) → German technical-data rows + machine-readable numbers.
 * Rules: only values present in the data are emitted; nothing is estimated; empty / "n.v." cells are skipped.
 * Allowed transformations (documented in docs/ASSUMPTIONS.md): l/s → m³/h (×3.6), kPa → bar (÷100), decimal comma, unit labels.
 */
import { fmtNumber } from '../../src/lib/format';
import { materialCategory, translate } from './de-vocab';

export type Group = 'Hydraulik' | 'Motor/Elektrik' | 'Werkstoffe' | 'Anschlüsse & Abmessungen';
export interface Row { group: Group; label: string; value: string; unit?: string; value_num?: number }
export interface Mapped {
  rows: Row[];
  flow_max_m3h?: number;
  head_max_m?: number;
  power_kw?: number;
  temp_max_c?: number;
  voltage?: string;
  material?: string;
  warnings: string[];
}
export type Raw = Record<string, unknown>;

const s = (v: unknown): string => (v === undefined || v === null ? '' : String(v).trim());
const isEmpty = (v: string) => v === '' || /^(n\.?\s?v\.?|-|–|null|undefined)$/i.test(v);
// No sign handling on purpose: in this data a hyphen is always a range separator ("36-59 m"), never a minus.
const numbers = (v: string): number[] => (v.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;
const de = (n: number, d: 1 | 2 = 1): string => fmtNumber(n, d) ?? String(n);
/** English-style decimals in free text → German ("65.4%" → "65,4 %"). */
const deText = (t: string): string => t.replace(/(\d)\.(\d)/g, '$1,$2').replace(/(\d)\s*%/g, '$1 %').replace(/m3\/h/gi, 'm³/h').replace(/m&sup3;/g, 'm³');

export function mapSpecs(raw: Raw): Mapped {
  const rows: Row[] = [];
  const warnings: string[] = [];
  const out: Mapped = { rows, warnings };
  const get = (k: string) => { const v = s(raw[k]); return isEmpty(v) ? '' : v; };
  const add = (group: Group, label: string, value: string, unit?: string, value_num?: number) => {
    if (!value) return;
    rows.push({ group, label, value, ...(unit ? { unit } : {}), ...(value_num !== undefined ? { value_num } : {}) });
  };
  const addNum = (group: Group, label: string, n: number | undefined, unit: string, digits: 1 | 2 = 1) => {
    if (n === undefined || Number.isNaN(n)) return;
    add(group, label, de(n, digits), unit, n);
  };
  const tr = (field: string, v: string, dict: 'material' | 'misc' = 'misc') => {
    const t = translate(v, dict);
    if (!t.known) warnings.push(`untranslated value [${field}]: "${v}"`);
    return t.text;
  };

  /* ---------- Hydraulik ---------- */
  const flow = get('Flow Range');
  if (flow) {
    const m = /^\s*(-?\d+(?:\.\d+)?)\s*(?:[-–]\s*(-?\d+(?:\.\d+)?))?\s*([^\d\s].*)?$/.exec(flow);
    const unit = (m?.[3] ?? '').trim().toLowerCase().replace('m3/h', 'm³/h');
    const factor = unit === 'm³/h' ? 1 : unit === 'l/s' ? 3.6 : unit === 'l/min' ? 0.06 : undefined;
    if (!m || factor === undefined) warnings.push(`flow range not parsed: "${flow}"`);
    else {
      const a = Number(m[1]) * factor;
      const b = m[2] !== undefined ? Number(m[2]) * factor : undefined;
      const max = round(b ?? a, 1);
      const min = b !== undefined ? round(a, 1) : undefined;
      if (min !== undefined && min > 0) addNum('Hydraulik', 'Förderstrom min.', min, 'm³/h');
      addNum('Hydraulik', 'Förderstrom max.', max, 'm³/h');
      out.flow_max_m3h = max;
    }
  }

  const headRange = numbers(get('Head'));
  const maxDelivery = numbers(get('Maximum delivery head'))[0];
  const minHead = numbers(get('Minimal header'))[0];
  let headMax: number | undefined;
  let headMin: number | undefined;
  if (headRange.length) {
    headMin = headRange.length > 1 ? Math.min(...headRange) : undefined;
    headMax = Math.max(...headRange);
    if (maxDelivery !== undefined && Math.abs(maxDelivery - headMax) > 0.05) {
      warnings.push(`head conflict: Head range ${get('Head')} vs. max delivery head ${get('Maximum delivery head')} (range used)`);
    }
  } else {
    headMax = maxDelivery;
    headMin = minHead;
  }
  addNum('Hydraulik', 'Förderhöhe max.', headMax, 'm');
  if (headMin !== undefined && headMax !== undefined && headMin < headMax) addNum('Hydraulik', 'Förderhöhe min.', headMin, 'm');
  out.head_max_m = headMax;

  const temp = numbers(get('Maximum Liquid Temperature'))[0];
  addNum('Hydraulik', 'Medientemperatur max.', temp, '°C');
  out.temp_max_c = temp;

  const pressure = get('Max working pressure');
  if (pressure) {
    const kpa = /^\s*(\d+(?:\.\d+)?)\s*kpa\s*$/i.exec(pressure);
    const bar = /^\s*(\d+(?:\.\d+)?)\s*bar\s*$/i.exec(pressure);
    if (kpa) addNum('Hydraulik', 'Max. Betriebsdruck', round(Number(kpa[1]) / 100, 2), 'bar', 2);
    else if (bar) addNum('Hydraulik', 'Max. Betriebsdruck', Number(bar[1]), 'bar');
    else add('Hydraulik', 'Max. Betriebsdruck', pressure.replace(/^PN\s*/i, 'PN '));
  }
  const shut = /^\s*(\d+(?:\.\d+)?)\s*kpa\s*$/i.exec(get('Shut-off pressure'));
  if (shut) addNum('Hydraulik', 'Nullförderdruck', round(Number(shut[1]) / 100, 2), 'bar', 2);

  const npsh = get('NPSH');
  if (npsh) { const n = numbers(npsh); add('Hydraulik', 'NPSH', n.length > 1 ? `${de(n[0]!)} – ${de(n[1]!)}` : de(n[0]!), 'm', n.length === 1 ? n[0] : undefined); }
  const bep = get('Best efficiency point');
  if (bep) add('Hydraulik', 'Bestpunkt (BEP)', deText(bep));
  const eff = numbers(get('Efficiency'))[0];
  addNum('Hydraulik', 'Wirkungsgrad', eff, '%');
  const hyd = numbers(get('Hydraulic efficiency'))[0];
  addNum('Hydraulik', 'Hydraulischer Wirkungsgrad', hyd, '%');
  const stages = numbers(get('Number of stages'))[0];
  if (stages !== undefined) add('Hydraulik', 'Stufenzahl', String(stages), undefined, stages);
  const impDia = numbers(get('Impeller diameter'))[0];
  addNum('Hydraulik', 'Laufraddurchmesser', impDia, 'mm');
  const impType = get('Type Impeller');
  if (impType) add('Hydraulik', 'Laufradform', tr('Type Impeller', impType));
  const free = numbers(get('Free passage'))[0];
  addNum('Hydraulik', 'Freier Durchgang', free, 'mm');
  const norm = get('Standard compliance');
  if (norm) add('Hydraulik', 'Prüfnorm', norm.replace(/UNI EN /i, '').replace(/\s*-\s*/, ', ').replace(/grade\s*/i, 'Klasse ').replace(/Klasse\s*3B/i, 'Klasse 3B'));
  const fluid = get('Fluid properties');
  if (fluid) add('Hydraulik', 'Auslegungsmedium', deText(fluid).replace(/^Water at/i, 'Wasser bei').replace(/density\s*=?\s*/i, 'Dichte ').replace(/°C/g, ' °C').replace(/\s{2,}/g, ' '));
  const density = get('Density') || get('Fluid density');
  if (density) add('Hydraulik', 'Dichte des Mediums', deText(density).replace(/\s*kg\/m³?/, ''), 'kg/m³', numbers(density)[0]);
  const elev = numbers(get('Max installation elevation'))[0];
  if (elev !== undefined) add('Hydraulik', 'Max. Aufstellhöhe', de(elev), 'm', elev);
  if (get('Float').toLowerCase() === 'yes') add('Hydraulik', 'Schwimmerschalter', 'ja');

  /* ---------- Motor / Elektrik ---------- */
  const power = numbers(get('Power'))[0];
  addNum('Motor/Elektrik', 'Motorleistung', power, 'kW', 2);
  out.power_kw = power;
  const shaft = numbers(get('Shaft power'))[0];
  addNum('Motor/Elektrik', 'Wellenleistung', shaft, 'kW', 2);

  const volt = numbers(get('Voltage'))[0];
  if (volt !== undefined) add('Motor/Elektrik', 'Spannung', de(volt), 'V', volt);
  const alt1 = get('Rated voltage alternative 1');
  const alt2 = get('Rated voltage alternative 2');
  if (alt1) add('Motor/Elektrik', volt !== undefined || alt2 ? 'Nennspannung (Variante 1)' : 'Nennspannung', alt1.replace(/\s*Volt$/i, '').replace(/\s*-\s*/, '–').replace(/\s*V$/i, '') , 'V');
  if (alt2) add('Motor/Elektrik', 'Nennspannung (Variante 2)', alt2.replace(/\s*Volt$/i, '').replace(/\s*-\s*/, '–').replace(/\s*V$/i, ''), 'V');
  const hz = numbers(get('Frequency'))[0];
  if (hz !== undefined) add('Motor/Elektrik', 'Frequenz', String(hz), 'Hz', hz);
  const phases = numbers(get('Phases'))[0];
  if (phases !== undefined) add('Motor/Elektrik', 'Phasen', String(phases), undefined, phases);

  const cur = numbers(get('Current'))[0];
  addNum('Motor/Elektrik', 'Nennstrom', cur, 'A', 2);
  const c1 = numbers(get('Nominal Current alternative 1'))[0];
  const c2 = numbers(get('Nominal Current alternative 2'))[0];
  if (c1 !== undefined) addNum('Motor/Elektrik', alt1 ? 'Nennstrom (Variante 1)' : 'Nennstrom', c1, 'A', 2);
  if (c2 !== undefined) addNum('Motor/Elektrik', alt2 ? 'Nennstrom (Variante 2)' : 'Nennstrom', c2, 'A', 2);
  const rpm = numbers(get('RPM'))[0];
  if (rpm !== undefined) add('Motor/Elektrik', 'Drehzahl', de(rpm), 'min⁻¹', rpm);
  const poles = numbers(get('Number of poles'))[0];
  if (poles !== undefined) add('Motor/Elektrik', 'Polzahl', String(poles), undefined, poles);
  const ip = get('Degree of protection');
  if (ip && /^IP\s*[0-9X]/i.test(ip)) add('Motor/Elektrik', 'Schutzart', ip.replace(/\s+/g, '').toUpperCase());
  else if (ip) warnings.push(`degree of protection incomplete: "${ip}"`);
  const ins = get('Insulation class');
  if (ins) add('Motor/Elektrik', 'Isolationsklasse', ins.replace(/\s*\/\s*/, ' / '));
  const ie = get('Efficiency class') || get('Engine efficiency class');
  if (ie) add('Motor/Elektrik', 'Wirkungsgradklasse', ie);
  const e100 = numbers(get('Efficiency at 100% load'))[0];
  addNum('Motor/Elektrik', 'Motorwirkungsgrad bei Volllast', e100, '%');
  const duty = get('Type of duty');
  if (duty) add('Motor/Elektrik', 'Betriebsart', tr('Type of duty', duty));
  const pf = numbers(get('Power factor'))[0];
  if (pf !== undefined) add('Motor/Elektrik', 'Leistungsfaktor cos φ', de(pf, 2), undefined, pf);
  const ia = numbers(get('Starting current ratio'))[0];
  if (ia !== undefined) add('Motor/Elektrik', 'Anzugsstrom-Verhältnis Ia/In', de(ia), undefined, ia);
  const ma = numbers(get('Locked rotor torque ratio'))[0];
  if (ma !== undefined) add('Motor/Elektrik', 'Anzugsmoment-Verhältnis Ma/Mn', de(ma), undefined, ma);
  const mk = numbers(get('Max torque ratio'))[0];
  if (mk !== undefined) add('Motor/Elektrik', 'Kippmoment-Verhältnis Mk/Mn', de(mk), undefined, mk);
  const mn = numbers(get('Nominal motor torque'))[0];
  addNum('Motor/Elektrik', 'Nennmoment', mn, 'Nm');
  const sf = numbers(get('Service factor'))[0];
  if (sf !== undefined) add('Motor/Elektrik', 'Betriebsfaktor', de(sf), undefined, sf);
  const frame = get('Motor frame size') || get('Frame size');
  if (frame) add('Motor/Elektrik', 'Motorbaugröße', frame);
  const cooling = get('Cooling');
  if (cooling) add('Motor/Elektrik', 'Kühlart', cooling.replace(/^IEC/i, 'IC'));
  const tb = get('Terminal box position');
  if (tb) add('Motor/Elektrik', 'Klemmenkasten', tr('Terminal box position', tb));
  const rot = get('Sense of rotation');
  if (rot) add('Motor/Elektrik', 'Drehrichtung', tr('Sense of rotation', rot));
  const engine = get('Engine description');
  if (engine) add('Motor/Elektrik', 'Motortyp', engine);
  const prot = get('Motor protection');
  if (prot) add('Motor/Elektrik', 'Motorschutz', tr('Motor protection', prot));
  const spl = numbers(get('Sound pressure level'))[0];
  if (spl !== undefined) add('Motor/Elektrik', 'Schalldruckpegel', de(spl), 'dB(A)', spl);

  /* Filter field: voltage option (deterministic rule, see docs/ASSUMPTIONS.md) */
  const joined = `${get('Voltage')} ${alt1} ${alt2}`;
  if (/230\s*\/\s*400/.test(joined) || (/22\d/.test(alt1) && /(38\d|400|415)/.test(alt2))) out.voltage = '230/400 V';
  else if (volt === 230) out.voltage = '230 V';
  else if (volt === 400) out.voltage = '400 V';

  /* ---------- Werkstoffe ---------- */
  const house1 = get('Pump housing material');
  const house2 = get('Pump housing material #2');
  const house = house1 || house2;
  if (house) {
    add('Werkstoffe', 'Pumpengehäuse', tr('Pump housing material', house, 'material'));
    out.material = materialCategory(house);
    if (!out.material) warnings.push(`housing material has no filter category: "${house}"`);
    if (house1 && house2 && house2.toLowerCase() !== house1.toLowerCase()) add('Werkstoffe', 'Gehäuse, Werkstoffangabe', tr('Pump housing material #2', house2, 'material'));
  }
  const imp = get('Impeller material');
  if (imp) add('Werkstoffe', 'Laufrad', tr('Impeller material', imp, 'material'));
  const shaftMat = get('Shaft material');
  if (shaftMat) add('Werkstoffe', 'Welle', tr('Shaft material', shaftMat, 'material'));
  const seal = get('Mechanical seal material');
  if (seal) add('Werkstoffe', /^[A-Z0-9]{5,8}$/.test(seal) ? 'Gleitringdichtung (Code)' : 'Gleitringdichtung', /^[A-Z0-9]{5,8}$/.test(seal) ? seal : tr('Mechanical seal material', seal, 'material'));
  const sf2 = get('Seal face material');
  if (sf2) add('Werkstoffe', 'Gleitring', tr('Seal face material', sf2, 'material'));
  const seat = get('Seal seat material');
  if (seat) add('Werkstoffe', 'Gegenring', tr('Seal seat material', seat, 'material'));
  const rubber = get('Seal rubber material');
  if (rubber) add('Werkstoffe', 'Elastomere der Dichtung', tr('Seal rubber material', rubber, 'material'));
  const spring = get('Spring and bellows material');
  if (spring) add('Werkstoffe', 'Feder und Balg', tr('Spring and bellows material', spring, 'material'));
  const gasket = get('Gasket material');
  if (gasket) add('Werkstoffe', 'Flachdichtung', tr('Gasket material', gasket, 'material'));
  const coat = get('Coating');
  if (coat) add('Werkstoffe', 'Beschichtung', tr('Coating', coat));
  const brgDesign = get('Bearing design') || get('Bearing type');
  if (brgDesign) {
    const t = translate(brgDesign);
    add('Werkstoffe', 'Lagerung', t.known ? t.text : deText(brgDesign).replace(/^DE:/, 'Antriebsseite:').replace(/\/\s*NDE:/, '/ Gegenseite:'));
  }
  const brgType = get('Bearing type');
  if (brgType && get('Bearing design') && brgType !== get('Bearing design')) add('Werkstoffe', 'Lagertyp', deText(brgType).replace(/^DE:/, 'Antriebsseite:').replace(/\/\s*NDE:/, '/ Gegenseite:'));

  /* ---------- Anschlüsse & Abmessungen ---------- */
  const pc = get('Pressure connection');
  const tc = get('Type connection');
  const size = numbers(get('Discharge connection size'))[0];
  if (pc) add('Anschlüsse & Abmessungen', 'Druckanschluss', pc.replace(/^DN\s*/i, 'DN '));
  else if (tc === 'DN' && size !== undefined) add('Anschlüsse & Abmessungen', 'Druckanschluss', `DN ${size}`);
  else if (tc === 'BSP' && size !== undefined) add('Anschlüsse & Abmessungen', 'Druckanschluss', `DN ${size}, BSP-Gewinde`);
  else if (tc) add('Anschlüsse & Abmessungen', 'Anschlussart', /ISO 228/i.test(tc) ? 'Gewinde nach UNI ISO 228' : tc);
  const suc = numbers(get('Suction connection size'))[0];
  if (suc !== undefined) add('Anschlüsse & Abmessungen', 'Sauganschluss', `${get('Suction connection type') || 'DN'} ${suc}`);
  const nd = get('Nominal diameter');
  if (nd && nd.replace(/\s/g, '').toUpperCase() !== pc.replace(/\s/g, '').toUpperCase()) add('Anschlüsse & Abmessungen', 'Nennweite', nd.replace(/"/g, '″').replace(/^DN\s*/i, 'DN '));
  const flange = get('Flange standard');
  if (flange) add('Anschlüsse & Abmessungen', 'Flanschnorm', flange);
  const cable = get('Cable entry');
  if (cable) add('Anschlüsse & Abmessungen', 'Kabeleinführung', cable.replace(/\s*[x×]\s*/, ' × '));
  const mounting = get('Mounting');
  if (mounting) add('Anschlüsse & Abmessungen', 'Bauart', tr('Mounting', mounting));
  const design = get('Design');
  if (design) add('Anschlüsse & Abmessungen', 'Ausführung', tr('Design', design));
  const weight = numbers(get('Product Weight'))[0];
  if (weight !== undefined) addNum('Anschlüsse & Abmessungen', 'Gewicht', round(weight, weight < 10 ? 2 : 1), 'kg', 2);
  const dims = get('Dimensions');
  if (dims) {
    if (dims.startsWith('{')) warnings.push('dimensions given as drawing letters (JSON) - omitted, see datasheet');
    else {
      const t = deText(dims).replace(/Length:/i, 'Länge:').replace(/Width:/i, 'Breite:').replace(/Height:/i, 'Höhe:').replace(/(\d)\s*x\s*(\d)/gi, '$1 × $2');
      add('Anschlüsse & Abmessungen', 'Abmessungen', t);
    }
  }

  if (out.flow_max_m3h === undefined) warnings.push('no flow range');
  if (out.power_kw === undefined) warnings.push('no motor power');
  if (headMax === undefined) warnings.push('no head');
  return out;
}

/** Key facts strip: up to four headline values, only from data that exists. */
export function keyFacts(m: Mapped): { label: string; value: string; unit?: string }[] {
  const pick = (label: string) => m.rows.find((r) => r.label === label);
  const f = [pick('Förderstrom max.'), pick('Förderhöhe max.'), pick('Motorleistung'), pick('Spannung') ?? pick('Nennspannung (Variante 1)') ?? pick('Nennspannung')];
  return f.filter((r): r is Row => Boolean(r)).map((r) => ({ label: r.label === 'Motorleistung' ? 'Motorleistung' : r.label, value: r.value, ...(r.unit ? { unit: r.unit } : {}) }));
}
