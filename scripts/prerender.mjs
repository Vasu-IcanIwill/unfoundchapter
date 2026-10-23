// Build step 3 of 3: put the server-rendered markup into each built page, fill in the site URL,
// preload the above-the-fold fonts, and write sitemap.xml + robots.txt.
import { readFileSync, writeFileSync, readdirSync, rmSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const ssrDir = resolve(root, '.ssr');

// Optional .env / .env.local / .env.production for local builds (Vercel injects env vars directly).
for (const f of ['.env', '.env.local', '.env.production', '.env.production.local']) {
  const p = resolve(root, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
let siteUrl = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
if (!siteUrl && process.env.VERCEL_PROJECT_PRODUCTION_URL) siteUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
if (!siteUrl) console.warn('[prerender] SITE_URL is not set: canonical, og:url, og:image and sitemap.xml are left out. See .env.example.');

const ssrEntry = readdirSync(ssrDir).find((f) => /^entry-server\.(m?js)$/.test(f));
const { render } = await import(pathToFileURL(resolve(ssrDir, ssrEntry)).href);

// Images referenced only from page markup are emitted by the SSR build: copy any the client build lacks.
const clientAssets = new Set(readdirSync(resolve(dist, 'assets')));
let copied = 0;
if (existsSync(resolve(ssrDir, 'assets'))) {
  for (const f of readdirSync(resolve(ssrDir, 'assets'))) {
    if (/\.(m?js|css|map)$/.test(f) || clientAssets.has(f)) continue;
    copyFileSync(resolve(ssrDir, 'assets', f), resolve(dist, 'assets', f));
    copied += 1;
  }
}
console.log(`[prerender] copied ${copied} markup-only assets`);
const assets = readdirSync(resolve(dist, 'assets'));
// Fonts needed for each page's first screen (header wordmark and nav, headline, lead text).
const HEADER_FONTS = ['montserrat-latin-600-normal'];
const PAGE_FONTS = {
  index: [...HEADER_FONTS, 'brygada-1918-latin-400-normal', 'roxie-rossa', 'italianno-latin-400-normal'],
  'dev-diwali': [...HEADER_FONTS, 'brygada-1918-latin-400-italic', 'montserrat-latin-400-normal'],
  contact: [...HEADER_FONTS, 'brygada-1918-latin-400-normal', 'italianno-latin-400-normal'],
  terms: [...HEADER_FONTS, 'brygada-1918-latin-400-normal', 'brygada-1918-latin-400-italic'],
  privacy: [...HEADER_FONTS, 'brygada-1918-latin-400-normal', 'brygada-1918-latin-400-italic'],
  404: [...HEADER_FONTS, 'brygada-1918-latin-400-normal', 'italianno-latin-400-normal'],
};
// Measured with Lighthouse (median of 3 runs, mobile): the home page does best with its CSS inlined and
// four fonts preloaded; the lighter pages do best with linked (cacheable) CSS and only the two header fonts.
const PAGE_DELIVERY = { index: { inlineCss: true, fonts: 4 } };
const DEFAULT_DELIVERY = { inlineCss: false, fonts: 2 };
const delivery = (name) => PAGE_DELIVERY[name] || DEFAULT_DELIVERY;
const preloadFor = (name) => (PAGE_FONTS[name] || []).slice(0, Number(process.env.TUC_PRELOAD_LIMIT || delivery(name).fonts))
  .map((key) => assets.find((f) => f.startsWith(`${key}-`) && f.endsWith('.woff2')))
  .filter(Boolean)
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
  .join('\n    ');

// The stylesheets are small (about 12 KB per page before compression), so they are inlined into each page:
// no render-blocking CSS request before the first paint.
const inlineCss = (html) => html.replace(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/g, (_, href) => {
  const css = readFileSync(resolve(dist, href.slice(1)), 'utf8');
  return `<style>${css}</style>`;
});

const pages = ['index', 'dev-diwali', 'contact', 'terms', 'privacy', '404'];
for (const name of pages) {
  const file = resolve(dist, `${name}.html`);
  let html = readFileSync(file, 'utf8');
  const app = render(name);
  if (!html.includes('<!--app-html-->')) throw new Error(`${name}.html: missing <!--app-html--> marker`);
  let extra = '';
  if (name === 'index') {
    const map = (app.match(/src="(\/assets\/worldmap-[^"]+\.svg)"/) || [])[1];
    if (map) extra = `\n    <link rel="preload" href="${map}" as="image" fetchpriority="high" />`;
  }
  html = html.replace('<!--app-html-->', app).replace('<!--preload-fonts-->', preloadFor(name) + extra);
  const inline = process.env.TUC_INLINE_CSS ? process.env.TUC_INLINE_CSS !== '0' : delivery(name).inlineCss;
  if (inline) html = inlineCss(html);
  if (name === 'index') html = html.replace('<!--preload-fonts-->', '');
  if (siteUrl) html = html.split('%SITE_URL%').join(siteUrl);
  else html = html.replace(/\s*<link rel="canonical"[^>]*>/, '').replace(/\s*<meta property="og:url"[^>]*>/, '').replace(/\s*<meta property="og:image(:\w+)?"[^>]*>/g, '');
  if (html.includes('%SITE_URL%')) throw new Error(`${name}.html: unresolved %SITE_URL%`);
  writeFileSync(file, html);
  console.log(`[prerender] ${name}.html (${(app.length / 1024).toFixed(1)} KB of markup)`);
}

const urls = ['/', '/dev-diwali.html', '/contact.html', '/terms.html', '/privacy.html'];
if (siteUrl) {
  const today = new Date().toISOString().slice(0, 10);
  writeFileSync(resolve(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${siteUrl}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
}
writeFileSync(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''}`);
rmSync(ssrDir, { recursive: true, force: true });
console.log(`[prerender] done${siteUrl ? ` for ${siteUrl}` : ''}`);
