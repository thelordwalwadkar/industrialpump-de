/** Loads the two product workbooks (shop feed + spec sheet), joins them on ProductNumber and assigns series, slugs and German specs. */
import ExcelJS from 'exceljs';
import { join } from 'node:path';
import { slugify } from '../../src/lib/slug';
import { SERIES, type SeriesDef } from '../../content-src/copy';
import { mapSpecs, type Mapped, type Raw } from './spec-map';

export interface CatalogueProduct {
  row: number;
  internalNumber: string;
  name: string;
  brandName: string;
  groupId: string;
  seriesKey?: string;
  slug: string;
  imageSource?: string;
  raw: Raw;
  feed: Raw;
  mapped: Mapped;
  problems: string[];
}

async function readSheet(file: string): Promise<{ header: string[]; rows: Raw[] }> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  const ws = wb.worksheets[0]!;
  const seen: Record<string, number> = {};
  const header = (ws.getRow(1).values as unknown[]).slice(1).map((v) => {
    const h = String((v as { text?: string } | null)?.text ?? v ?? '').trim();
    seen[h] = (seen[h] ?? 0) + 1;
    return seen[h]! > 1 ? `${h} #${seen[h]}` : h; // the sheet has two "Pump housing material" columns
  });
  const rows: Raw[] = [];
  ws.eachRow((row, i) => {
    if (i === 1) return;
    const vals = (row.values as unknown[]).slice(1);
    const o: Raw = {};
    header.forEach((h, k) => {
      let v = vals[k] as unknown;
      if (v && typeof v === 'object') {
        const x = v as { text?: string; result?: unknown; richText?: { text: string }[] };
        v = x.text ?? x.result ?? (x.richText ? x.richText.map((t) => t.text).join('') : String(v));
      }
      if (v !== undefined && v !== null && String(v).trim() !== '') o[h] = v;
    });
    o.__row = i;
    rows.push(o);
  });
  return { header, rows };
}

export function seriesKeyFor(brandName: string, groupId: string, name: string): string | undefined {
  if (brandName === 'SAER' && groupId === 'GROUP140') return 'saer-m';
  if (brandName === 'SAER' && groupId === 'GROUP139') return /^TR\b/i.test(name.trim()) ? 'saer-tr' : 'saer-m';
  return SERIES.find((s) => s.group === groupId)?.key;
}

export async function loadCatalogue(inputsDir = join(process.cwd(), 'inputs')): Promise<{ products: CatalogueProduct[]; problems: string[] }> {
  const feed = await readSheet(join(inputsDir, 'IPG-Products.xlsx'));
  const specs = await readSheet(join(inputsDir, 'Schemas Eng - CLaude.xlsx'));
  const feedBy = new Map(feed.rows.map((r) => [String(r.ProductNumber).trim(), r]));
  const problems: string[] = [];
  const products: CatalogueProduct[] = [];
  const slugsBySeries = new Map<string, Map<string, string>>();

  for (const raw of specs.rows) {
    const num = String(raw.ProductNumber ?? '').trim();
    const name = String(raw.ProductName ?? '').trim();
    const f = feedBy.get(num);
    const pr: string[] = [];
    if (!num) pr.push('missing ProductNumber');
    if (!name) pr.push('missing ProductName');
    if (!f) pr.push('no matching row in the shop feed (IPG-Products.xlsx)');
    const brandName = String(raw.Manufacturer ?? '').trim();
    const groupId = String(f?.PrimaryGroup ?? '').trim();
    const seriesKey = seriesKeyFor(brandName, groupId, name);
    if (!seriesKey) pr.push(`no series for group "${groupId}" (${brandName})`);
    let slug = slugify(name);
    if (seriesKey && slug) {
      const used = (slugsBySeries.get(seriesKey) ?? new Map<string, string>());
      slugsBySeries.set(seriesKey, used);
      if (used.has(slug)) {
        const variant = slugify(`${name} ${num}`);
        problems.push(`slug collision in ${seriesKey}: "${name}" (${num}) vs "${used.get(slug)}" → "${variant}"`);
        slug = variant;
      }
      used.set(slug, `${name} (${num})`);
    }
    const mapped = mapSpecs(raw);
    products.push({
      row: Number(raw.__row), internalNumber: num, name, brandName, groupId, seriesKey, slug,
      imageSource: f?.ProductImageLarge ? String(f.ProductImageLarge) : undefined, raw, feed: f ?? {}, mapped, problems: pr,
    });
  }
  return { products, problems };
}

export interface SeriesAggregate { count: number; flowMax?: number; headMax?: number; powerMin?: number; powerMax?: number; tempMax?: number; materials: string[] }
const MATERIAL_ORDER = ['Gusseisen', 'Bronze', 'Edelstahl', 'Messing', 'Thermoplast', 'Stahlguss'];

export function aggregate(products: CatalogueProduct[]): SeriesAggregate {
  const nums = (f: (p: CatalogueProduct) => number | undefined) => products.map(f).filter((n): n is number => typeof n === 'number' && !Number.isNaN(n));
  const max = (a: number[]) => (a.length ? Math.max(...a) : undefined);
  const min = (a: number[]) => (a.length ? Math.min(...a) : undefined);
  const mats = [...new Set(products.map((p) => p.mapped.material).filter((m): m is string => Boolean(m)))].sort((a, b) => MATERIAL_ORDER.indexOf(a) - MATERIAL_ORDER.indexOf(b));
  return {
    count: products.length,
    flowMax: max(nums((p) => p.mapped.flow_max_m3h)),
    headMax: max(nums((p) => p.mapped.head_max_m)),
    powerMin: min(nums((p) => p.mapped.power_kw)),
    powerMax: max(nums((p) => p.mapped.power_kw)),
    tempMax: max(nums((p) => p.mapped.temp_max_c)),
    materials: mats,
  };
}

export const seriesByKey = (key: string): SeriesDef => {
  const s = SERIES.find((x) => x.key === key);
  if (!s) throw new Error(`Unknown series key ${key}`);
  return s;
};
