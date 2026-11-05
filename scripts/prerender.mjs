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
const DEFAULT_DELIVERY = { inlineCss: true, fonts: 2 }; // inlined everywhere: a page never shows unstyled if one CSS request fails
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

// Structured data (schema.org JSON-LD) so search engines understand the brand and the trip.
// Facts here must match the visible pages; update both together.
function jsonLd(name) {
  const org = {
    '@type': 'TravelAgency',
    '@id': `${siteUrl}/#org`,
    name: 'Unfound Chapter',
    legalName: 'Bitmartian Softech Private Limited',
    url: `${siteUrl}/`,
    logo: `${siteUrl}/logo-512.png`,
    image: `${siteUrl}/og-uc.png`,
    description: 'Luxury private journeys across India, planned by hand for a small circle of guests.',
    slogan: 'Curated journeys · Meaningful experiences',
    email: 'hello@unfoundchapter.com',
    telephone: '+91 91477 46406',
    taxID: '08AALCB9623J1Z8',
    areaServed: { '@type': 'Country', name: 'India' },
  };
  const website = { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`, name: 'Unfound Chapter', inLanguage: 'en-IN', publisher: { '@id': `${siteUrl}/#org` } };
  const graph = name === 'index' ? [org, website] : [org];
  if (name === 'dev-diwali') {
    const url = `${siteUrl}/dev-diwali.html`;
    graph.push({
      '@type': 'TouristTrip',
      '@id': `${url}#trip`,
      name: 'Dev Deepawali (Dev Diwali) in Varanasi, 2026',
      description: 'Three days and two nights in Varanasi for Dev Deepawali on Kartik Purnima, limited to 10 guests: a stay at Om Vilas Resort, the Ganga Aarti by boat, ten courses at Aangan, and ghat to ghat with high tea on the waters as the city lights up.',
      url,
      image: `${siteUrl}/og-uc.png`,
      inLanguage: 'en-IN',
      touristType: 'Small group',
      departureTime: '2026-11-23',
      arrivalTime: '2026-11-25',
      provider: { '@id': `${siteUrl}/#org` },
      itinerary: {
        '@type': 'ItemList',
        numberOfItems: 3,
        itemListElement: [
          { '@type': 'ListItem', position: 1, item: { '@type': 'TouristDestination', name: 'Day 1 · Monday 23 November · Arrival', description: 'Check in at Om Vilas and henna at the resort, a temple visit and guided heritage walk, the laser show, the Ganga Aarti by boat, ten courses at Aangan, and the Shayan Aarti with VIP entry.' } },
          { '@type': 'ListItem', position: 2, item: { '@type': 'TouristDestination', name: 'Day 2 · Tuesday 24 November · Dev Deepawali', description: 'A slow morning at the resort, then boarding at 4 PM for ghat to ghat with chai and Banarasi chaat, and high tea on the waters as the city lights up.' } },
          { '@type': 'ListItem', position: 3, item: { '@type': 'TouristDestination', name: 'Day 3 · Wednesday 25 November · Farewell', description: 'Time in the old market for a Banarasi silk, then a private transfer to the airport or station.' } },
        ],
      },
      offers: {
        '@type': 'Offer',
        url: `${siteUrl}/contact.html?journey=dev-diwali`,
        priceCurrency: 'INR',
        availability: 'https://schema.org/LimitedAvailability',
        validThrough: '2026-11-09',
        seller: { '@id': `${siteUrl}/#org` },
      },
    });
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Dev Deepawali in Varanasi', item: url },
      ],
    });
  }
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  return `    <script type="application/ld+json">${json}</script>\n  `;
}

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
  if (siteUrl && name !== '404') html = html.replace('</head>', `${jsonLd(name)}</head>`);
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
