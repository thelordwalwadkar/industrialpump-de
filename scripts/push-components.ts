/**
 * Pushes storyblok/components/*.json to the space (create or update by name - never duplicates).
 *   npm run sb:push            → plan only (no credentials needed)
 *   npm run sb:push -- --apply → writes to the space (needs STORYBLOK_OAUTH_TOKEN + STORYBLOK_SPACE_ID)
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mapi, readConfig } from './lib/mapi';

const apply = process.argv.includes('--apply');
const dir = join(process.cwd(), 'storyblok', 'components');
const local = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')).component as { name: string });
console.log(`${local.length} component schemas found locally.`);

const cfg = readConfig();
if (!apply || !cfg) {
  console.log(apply ? 'Missing STORYBLOK_OAUTH_TOKEN / STORYBLOK_SPACE_ID - nothing sent.' : 'Plan only (use --apply to write).');
  for (const c of local) console.log(`  would create/update: ${c.name}`);
  process.exit(apply ? 1 : 0);
}

const existing = new Map<string, number>(((await mapi(cfg, 'GET', '/components')).components as { name: string; id: number }[]).map((c) => [c.name, c.id]));
for (const c of local) {
  const id = existing.get(c.name);
  if (id) { await mapi(cfg, 'PUT', `/components/${id}`, { component: c }); console.log(`updated  ${c.name}`); }
  else { await mapi(cfg, 'POST', '/components', { component: c }); console.log(`created  ${c.name}`); }
}
