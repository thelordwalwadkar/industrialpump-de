/**
 * Post-build step for hosting under a sub-path (GitHub Pages project sites: https://owner.github.io/repo/).
 * Astro prefixes its own asset URLs when `base` is set; this adds the prefix to the root-absolute links and
 * images that content and templates write by hand ("/pumpen", "/img/hero.webp", "/angebot").
 * No-op without PUBLIC_BASE_PATH, so the production build for the real domain is untouched.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const base = (process.env.PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');
if (!base || base === '/') { console.log('rebase: no PUBLIC_BASE_PATH, nothing to do'); process.exit(0); }
const dir = join(process.cwd(), 'dist');
const bare = base.replace(/^\//, '');
let files = 0;
let rewrites = 0;

// prefix "/x" but never "//x" (protocol-relative) and never a path that already starts with the base
const prefix = (rest: string) => (rest === bare || rest.startsWith(`${bare}/`) ? `/${rest}` : `${base}/${rest}`);

function walk(d: string) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!/\.(html|css|xml|txt)$/.test(f) || f === 'robots.txt' || f.startsWith('sitemap')) continue;
    let s = readFileSync(p, 'utf8');
    const before = s;
    if (f.endsWith('.html')) {
      s = s.replace(/(\s(?:href|src|action|poster|data-src)=")\/(?!\/)([^"]*)"/g, (_m, attr: string, rest: string) => { rewrites++; return `${attr}${prefix(rest)}"`; });
    } else if (f.endsWith('.css')) {
      s = s.replace(/url\((['"]?)\/(?!\/)([^)'"]*)\1\)/g, (_m, q: string, rest: string) => { rewrites++; return `url(${q}${prefix(rest)}${q})`; });
    }
    if (s !== before) { writeFileSync(p, s); files++; }
  }
}
walk(dir);
console.log(`rebase: ${rewrites} root-absolute URLs prefixed with ${base} in ${files} files`);
