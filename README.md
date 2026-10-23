# Unfound Chapter

Website for Unfound Chapter: private journeys across India and the Dev Diwali group trip to Varanasi (23 to 25 November 2026).

Built with React 19 and Vite 8 as a multi-page site. Every page is prerendered to static HTML at build time and then hydrated, so the existing `.html` URLs keep working and search engines see the full content.

## Pages

| URL | Page |
| --- | --- |
| `/` | Home (hero, golden hour globe, notepad, chapters, privileges) |
| `/dev-diwali.html` | Dev Diwali in Varanasi group trip |
| `/contact.html` | Enquiry form (`?journey=own`, `?journey=dev-diwali` preselect a chapter) |
| `/terms.html` | Terms and cancellation (draft) |
| `/privacy.html` | Privacy (draft) |
| `/404.html` | Not found |

## Run it

Requires Node.js 20.19 or later.

```bash
npm install
npm run dev        # local development server
npm run build      # production build into dist/
npm run serve:prod # serve dist/ with the same headers as vercel.json, on port 4175
```

## Configuration

Copy `.env.example` to `.env` (or set these in Vercel > Project > Settings > Environment Variables):

- `SITE_URL`: the public address, for example `https://www.example.com`. Used for canonical links, Open Graph tags and `sitemap.xml`. On Vercel it falls back to the production domain.
- `VITE_ENQUIRY_ENDPOINT`: a form service URL that accepts a POST of the enquiry form. Optional.
- `VITE_ENQUIRY_EMAIL`: if there is no endpoint, the form opens an email to this address. Optional.

With neither set, the form validates but tells the visitor online enquiries are not switched on yet. Never put secrets in these variables; anything starting with `VITE_` is visible in the browser.

## Deploy on Vercel

Import this repository in Vercel (framework preset: Vite). `vercel.json` already sets the build command, the `dist` output folder and the caching headers:

- `/assets/*` (content-hashed files): `public, max-age=31536000, immutable`
- everything else, including HTML: `public, max-age=0, must-revalidate`

Or from a terminal in this folder: `npx vercel` for a preview, `npx vercel --prod` for production.

## Tests

```bash
npx playwright install chromium   # first time only
npm test                          # functional tests and visual comparison
```

`tests/visual.spec.js` compares each page at 1440x900, 768x1024 and 390x844 against `reference/approved-static-site`. The SEO test expects `SITE_URL` to be set at build time.

## Still to be supplied

- Phone numbers and WhatsApp link (currently `[PHONE 1]`, `[PHONE 2]`)
- An enquiry endpoint or email address
- The bracketed details in the terms and privacy drafts
- A commercial licence for the Roxie Rossa font (current licence is personal use)
