/**
 * Optimises the original images (assets-src/ipg-nl, downloaded from industrialpumps.nl on 14 Oct 2026) into public/img/*.webp.
 *   npm run images
 * Originals stay out of public/ so they are never shipped.
 */
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const src = join(process.cwd(), 'assets-src', 'ipg-nl');
const out = join(process.cwd(), 'public', 'img');
let total = 0;
const log: string[] = [];

async function make(from: string, to: string, opts: { width: number; height?: number; quality?: number; fit?: 'inside' | 'cover' | 'contain' }) {
  const dest = join(out, to);
  mkdirSync(join(dest, '..'), { recursive: true });
  const info = await sharp(join(src, from))
    .resize({ width: opts.width, height: opts.height, fit: opts.fit ?? 'inside', withoutEnlargement: true })
    .webp({ quality: opts.quality ?? 82, effort: 5 })
    .toFile(dest);
  total += info.size;
  log.push(`${to.padEnd(42)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} kB`);
}

// Product / series photos (white or transparent background)
for (const f of readdirSync(join(src, 'ipg_ecom', 'Lowara')).map((x) => `Lowara/${x}`)
  .concat(readdirSync(join(src, 'ipg_ecom', 'SAER')).map((x) => `SAER/${x}`))
  .concat(readdirSync(join(src, 'ipg_ecom', 'Ebara')).map((x) => `Ebara/${x}`))
  .concat(readdirSync(join(src, 'ipg_ecom', 'Flygt')).map((x) => `Flygt/${x}`))) {
  await make(`ipg_ecom/${f}`, `products/${basename(f, extname(f)).toLowerCase()}.webp`, { width: 720, height: 540 });
}

// Hero: refinery under blue sky (desktop + mobile crops)
await make('Homepage/header_background.png', 'hero.webp', { width: 1920, quality: 66 });
await make('Homepage/header_background.png', 'hero-m.webp', { width: 900, quality: 66 });
await make('design/boog.png', 'curve.webp', { width: 1600, quality: 70 });

// Logos
await make('design/ipg_logo_xs.png', 'logo-white.webp', { width: 480, quality: 90 });
await make('design/ipg_logo_blauw.png', 'logo-navy.webp', { width: 480, quality: 90 });
const brands: Record<string, string> = { lowara: 'merken/_0006_ipg-01-lowara.png', saer: 'merken/saer-logo.png', ebara: 'merken/_0017_ipg-01-ebara.png', flygt: 'merken/_0015_ipg-01-flygt.png' };
for (const [k, f] of Object.entries(brands)) await make(f, `brands/${k}.webp`, { width: 360, quality: 90 });

// Service photos and pump-type photos
await make('Homepage/pompen-verkoop.png', 'services/verkauf.webp', { width: 900 });
await make('Homepage/pomprevisie.png', 'services/revision.webp', { width: 900 });
await make('Homepage/pomponderdelen.png', 'services/ersatzteile.webp', { width: 900 });
await make('pomptypes/hydrofoor-unit.png', 'types/druckerhoehungsanlagen.webp', { width: 640 });
await make('pomptypes/dompelpomp2.png', 'types/tauchmotorpumpen.webp', { width: 640 });
await make('pomptypes/meertraps-2.jpg', 'types/mehrstufige-pumpen.webp', { width: 900 });
await make('pomptypes/End-suction-2.jpg', 'types/kreiselpumpen.webp', { width: 900 });
await make('pomptypes/Blokpompen-bg.png', 'types/blockpumpen.webp', { width: 900 });

console.log(log.join('\n'));
console.log(`\n${log.length} images, ${(total / 1024 / 1024).toFixed(1)} MB total`);
void statSync;
