/** Gate 2: the Storyblok model covers every template's required fields, filter fields are numeric/option, whitelists point at real components. */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'storyblok', 'components');
const comps = new Map<string, { schema: Record<string, any>; is_root: boolean }>();
for (const f of readdirSync(dir)) { const c = JSON.parse(readFileSync(join(dir, f), 'utf8')).component; comps.set(c.name, c); }
const errors: string[] = [];

const REQUIRED: Record<string, string[]> = {
  page_home: ['hero', 'tiles', 'revision', 'brands', 'references', 'school', 'contact'],
  page_hub: ['intro', 'child_heading', 'body_text', 'cta'],
  page_topic: ['topic_kind', 'challenges', 'related', 'technical_notes', 'faq', 'cta'],
  page_brand: ['brand_name', 'body_text', 'revision_text', 'faq', 'cta', 'manufacturer_url', 'parent_company', 'logo'],
  page_series: ['series_name', 'pump_type', 'flow_max_m3h', 'head_max_m', 'power_min_kw', 'power_max_kw', 'temp_max_c', 'materials', 'downloads', 'faq', 'use_case_line'],
  page_product: ['article_number', 'name', 'short_description', 'image', 'gallery', 'key_facts', 'specs', 'flow_max_m3h', 'head_max_m', 'power_kw', 'voltage', 'material', 'downloads', 'gtin', 'price', 'availability'],
  page_service: ['service_kind', 'steps', 'included', 'covered', 'faq', 'cta'],
  page_course: ['goals', 'audience', 'duration', 'dates'],
  page_knowledge: ['article', 'downloads', 'related'],
  page_blog_post: ['article', 'author', 'related'],
  page_case_study: ['customer', 'situation', 'solution', 'result', 'products'],
  page_listing: ['listing_kind', 'per_page'],
  page_contact: ['form_kind'],
  page_legal: ['text', 'legal_kind'],
  config: ['site_name', 'legal_name', 'street', 'phone', 'email', 'opening_hours', 'vat_id', 'logo', 'social', 'header_nav', 'footer_groups'],
};
for (const [name, keys] of Object.entries(REQUIRED)) {
  const c = comps.get(name);
  if (!c) { errors.push(`missing content type ${name}`); continue; }
  for (const k of keys) if (!c.schema[k]) errors.push(`${name}: field "${k}" missing`);
  if (name !== 'config' && !['h1', 'intro', 'seo_title', 'seo_description'].every((k) => c.schema[k])) errors.push(`${name}: common SEO fields missing`);
}
const product = comps.get('page_product')!.schema;
for (const k of ['flow_max_m3h', 'head_max_m', 'power_kw']) if (product[k]?.type !== 'number') errors.push(`page_product.${k} must be a number field`);
for (const k of ['voltage', 'material', 'availability']) if (product[k]?.type !== 'option') errors.push(`page_product.${k} must be an option list`);
for (const [name, c] of comps) for (const [k, f] of Object.entries<any>(c.schema)) for (const w of f.component_whitelist ?? []) if (!comps.has(w)) errors.push(`${name}.${k}: whitelist names unknown component ${w}`);

console.log(`verify-model: ${comps.size} components, ${[...comps.values()].filter((c) => c.is_root).length} content types`);
if (errors.length) { console.error(errors.map((e) => '  ✗ ' + e).join('\n')); process.exit(1); }
console.log('verify-model: 0 errors');
