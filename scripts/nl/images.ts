/**
 * Downloads every image referenced by the extracted pages and optimises it to WebP.
 *   npx tsx scripts/nl/images.ts
 * Output: public/img/nl/<name>.webp (max 1280 px wide) + content-src/image-map.json { "<nl src>": { file, width, height } }.
 * Originals are cached in assets-src/nl-pages/ (git-ignored) so a rerun does not hit the server again.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const ORIGIN = 'https://industrialpumps.nl';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const root = process.cwd();
const cache = join(root, 'assets-src', 'nl-pages');
const out = join(root, 'public', 'img', 'nl');
mkdirSync(cache, { recursive: true });
mkdirSync(out, { recursive: true });

const list: string[] = JSON.parse(readFileSync(join(root, 'content-src', 'nl', '_images.json'), 'utf8'));
const mapPath = join(root, 'content-src', 'image-map.json');
const map: Record<string, { file: string; width: number; height: number }> = existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, 'utf8')) : {};

const slugOf = (src: string) => src.replace(/^\/Files\/(Images\/)?/i, '').replace(/\.[a-z0-9]+$/i, '')
  .normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const used = new Set<string>();
const failed: string[] = [];
let ok = 0, bytes = 0;
const queue = list.filter((s) => !map[s]);

await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) {
    const src = queue.shift()!;
    let name = slugOf(src) || 'bild'; let n = 2; const base = name;
    while (used.has(name)) name = `${base}-${n++}`;
    used.add(name);
    try {
      const raw = join(cache, name + '.bin');
      let buf: Buffer;
      if (existsSync(raw)) buf = readFileSync(raw);
      else {
        const res = await fetch(ORIGIN + encodeURI(decodeURI(src)), { headers: { 'User-Agent': UA } });
        if (!res.ok) throw new Error(String(res.status));
        buf = Buffer.from(await res.arrayBuffer());
        writeFileSync(raw, buf);
      }
      if (/\.svg$/i.test(src)) {
        writeFileSync(join(out, name + '.svg'), buf);
        map[src] = { file: `/img/nl/${name}.svg`, width: 800, height: 600 };
      } else {
        const info = await sharp(buf, { animated: false }).rotate().resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(join(out, name + '.webp'));
        bytes += info.size;
        map[src] = { file: `/img/nl/${name}.webp`, width: info.width, height: info.height };
      }
      ok++;
    } catch (e) { failed.push(`${src}: ${(e as Error).message}`); }
  }
}));

writeFileSync(mapPath, JSON.stringify(Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b))), null, 1));
console.log(`${ok} images processed (${(bytes / 1048576).toFixed(1)} MB webp), ${failed.length} failed, ${Object.keys(map).length}/${list.length} mapped`);
if (failed.length) console.log(failed.join('\n'));
