/**
 * Idempotent content seeding: creates (or updates) folders + stories so that the Storyblok folder tree equals the URL tree.
 *   npm run sb:seed            → plan only
 *   npm run sb:seed -- --apply → writes (needs STORYBLOK_OAUTH_TOKEN + STORYBLOK_SPACE_ID), publishes each story
 * A story that has children becomes a folder + start page (is_startpage) so /pumpen/marken/lowara and /pumpen/marken/lowara/diwa-serie coexist.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mapi, readConfig } from './lib/mapi';

interface Seed { name: string; slug: string; full_slug: string; position?: number; content: Record<string, unknown> }
const apply = process.argv.includes('--apply');
const dir = join(process.cwd(), 'storyblok', 'content');
const seeds = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as Seed);
const slugs = new Set(seeds.map((s) => s.full_slug));
const hasChildren = (slug: string) => seeds.some((s) => s.full_slug.startsWith(`${slug}/`));
// parents first, so every folder exists before its children
seeds.sort((a, b) => a.full_slug.split('/').length - b.full_slug.split('/').length || a.full_slug.localeCompare(b.full_slug));

console.log(`${seeds.length} stories, ${seeds.filter((s) => hasChildren(s.full_slug)).length} of them are folders with a start page.`);
const cfg = readConfig();
if (!apply || !cfg) {
  console.log(apply ? 'Missing STORYBLOK_OAUTH_TOKEN / STORYBLOK_SPACE_ID - nothing sent.' : 'Plan only (use --apply to write).');
  for (const s of seeds) console.log(`  ${hasChildren(s.full_slug) ? 'folder+root' : 'story      '} /${s.full_slug}`);
  process.exit(apply ? 1 : 0);
}

// Existing stories by full_slug (folder roots come back with a trailing slash).
const byFull = new Map<string, { id: number; is_folder: boolean }>();
for (let page = 1; ; page++) {
  const r = (await mapi(cfg, 'GET', `/stories?per_page=100&page=${page}`)).stories as { id: number; full_slug: string; is_folder: boolean }[];
  for (const s of r) byFull.set(s.full_slug.replace(/\/$/, '') + (s.is_folder ? '#folder' : ''), { id: s.id, is_folder: s.is_folder });
  if (r.length < 100) break;
}

const folderId = async (full: string): Promise<number | undefined> => {
  const parts = full.split('/').slice(0, -1);
  let parent: number | undefined;
  for (let i = 1; i <= parts.length; i++) {
    const path = parts.slice(0, i).join('/');
    const hit = byFull.get(`${path}#folder`);
    if (hit) { parent = hit.id; continue; }
    const created = (await mapi(cfg, 'POST', '/stories', { story: { name: path.split('/').pop(), slug: path.split('/').pop(), is_folder: true, parent_id: parent ?? 0 } })).story as { id: number };
    byFull.set(`${path}#folder`, { id: created.id, is_folder: true }); parent = created.id; console.log(`folder   /${path}`);
  }
  return parent;
};

for (const s of seeds) {
  const asFolder = hasChildren(s.full_slug) && slugs.has(s.full_slug);
  const parent = asFolder ? await folderId(`${s.full_slug}/x`) : await folderId(s.full_slug);
  const payload = { story: { name: s.name, slug: s.slug, parent_id: parent ?? 0, is_startpage: asFolder, content: s.content, position: s.position }, publish: 1 };
  const hit = byFull.get(s.full_slug);
  if (hit) { await mapi(cfg, 'PUT', `/stories/${hit.id}`, payload); console.log(`updated  /${s.full_slug}`); }
  else { await mapi(cfg, 'POST', '/stories', payload); console.log(`created  /${s.full_slug}`); }
}
