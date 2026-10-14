// Minimal static server for built output (extensionless URLs → .html, like a static host with clean URLs).
//   node scripts/serve-static.mjs dist-fixtures 4333
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.cwd(), process.argv[2] ?? 'dist');
const port = Number(process.env.PORT ?? process.argv[3] ?? 4321);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };

createServer((req, res) => {
  const base = process.env.BASE ?? '';
  let path = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (base && (path === base || path.startsWith(`${base}/`))) path = path.slice(base.length) || '/';
  const safe = normalize(path).replace(/^[\\/]+/, '');
  const candidates = [join(root, safe), join(root, `${safe}.html`), join(root, safe, 'index.html')];
  const hit = candidates.find((p) => p.startsWith(root) && existsSync(p) && statSync(p).isFile());
  if (!hit) {
    const nf = join(root, '404.html');
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    res.end(existsSync(nf) ? readFileSync(nf) : 'not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(hit)] ?? 'application/octet-stream' });
  res.end(readFileSync(hit));
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} on http://127.0.0.1:${port}`));
