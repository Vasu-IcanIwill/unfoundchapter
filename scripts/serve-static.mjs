// Tiny static server used by the tests. With --vercel it applies the "headers" rules from vercel.json
// (an emulation for local checks; confirm the real headers on Vercel with: curl -I https://<site>/...).
// Usage: node scripts/serve-static.mjs <dir> <port> [--vercel]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGzip } from 'node:zlib';

const [dirArg = 'dist', portArg = '4175', flag] = process.argv.slice(2);
const root = resolve(dirArg);
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.otf': 'font/otf', '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.ico': 'image/x-icon' };
let rules = [];
let redirects = [];
if (flag === '--vercel') {
  const cfg = JSON.parse(readFileSync(join(projectRoot, 'vercel.json'), 'utf8'));
  rules = (cfg.headers || []).map((r) => ({ re: new RegExp(`^${r.source.replace(/\(\.\*\)/g, '(.*)')}$`), headers: r.headers }));
  redirects = cfg.redirects || [];
}
createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const path = decodeURIComponent(url.pathname);
  for (const r of redirects) if (r.source === path) { res.writeHead(r.permanent ? 308 : 307, { Location: r.destination }); return res.end(); }
  let file = normalize(join(root, path));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  let status = 200;
  try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); await stat(file); }
  catch { status = 404; file = join(root, '404.html'); }
  const headers = { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' };
  for (const r of rules) if (r.re.test(path)) for (const h of r.headers) headers[h.key] = h.value; // later rules win
  try { await stat(file); } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
  const compressible = /^(text|application\/(javascript|json|xml)|image\/svg)/.test(headers['Content-Type']);
  if (compressible && /gzip/.test(req.headers['accept-encoding'] || '')) {
    headers['Content-Encoding'] = 'gzip';
    res.writeHead(status, headers);
    createReadStream(file).pipe(createGzip()).pipe(res);
  } else {
    res.writeHead(status, headers);
    createReadStream(file).pipe(res);
  }
}).listen(Number(portArg), '127.0.0.1', () => console.log(`serving ${root} on http://127.0.0.1:${portArg}${flag ? ' (vercel headers)' : ''}`));
