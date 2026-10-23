/*
 * Approved page markup, kept byte-for-byte from the signed-off site and rendered by React components.
 * The illustrations, sketches and inline styles are hand-tuned (and several phone CSS rules match the
 * inline style text exactly), so they are stored as static HTML fragments instead of being re-typed as JSX.
 * They are trusted, build-time content: no user input ever reaches dangerouslySetInnerHTML.
 */
import frameHtml from './frame.html?raw';
import ddFrameHtml from './dd-frame.html?raw';
import homeMap from './home-map.html?raw';
import homeHeader from './home-header.html?raw';
import homeHero from './home-hero.html?raw';
import homeGoldenHour from './home-golden-hour.html?raw';
import homeStrip from './home-strip.html?raw';
import homeJourneys from './home-journeys.html?raw';
import homeChapters from './home-chapters.html?raw';
import homePrivileges from './home-privileges.html?raw';
import homeClosing from './home-closing.html?raw';
import homeFooter from './home-footer.html?raw';
import ddHeader from './dd-header.html?raw';
import ddHero from './dd-hero.html?raw';
import ddItinerary from './dd-itinerary.html?raw';
import ddDownload from './dd-download.html?raw';
import ddReserve from './dd-reserve.html?raw';
import ddFooter from './dd-footer.html?raw';

import { withFontFallbacks } from '../utils/fonts.js';
import worldmapUrl from '../assets/img/worldmap.svg';
import dinnerPng from '../assets/img/dinner.png';
import dinner360 from '../assets/img/dinner-360.webp';
import dinner640 from '../assets/img/dinner-640.webp';
import dinner900 from '../assets/img/dinner-900.webp';

// Page links become root-relative so they also work from the 404 page at any depth. URLs are unchanged.
// The faint world map behind the hero is the largest element on the first screen (LCP): fetch it first.
const PAGE_LINKS = [
  ['href="index.html#', 'href="/#'],
  ['href="index.html"', 'href="/"'],
  ['href="dev-diwali.html', 'href="/dev-diwali.html'],
  ['href="contact.html', 'href="/contact.html'],
  ['href="terms.html', 'href="/terms.html'],
  ['href="privacy.html', 'href="/privacy.html'],
];

// keep the original 900 x 853 proportions whichever responsive size the browser picks
const lockRatio = (attrs) => attrs.replace('height: auto;', 'height: auto; aspect-ratio: 900 / 853;');

function prep(html) {
  let out = html;
  for (const [a, b] of PAGE_LINKS) out = out.split(a).join(b);
  out = out.replace('src="%%IMG_WORLDMAP%%"', `src="${worldmapUrl}" width="1800" height="710" fetchpriority="high"`);
  // Dinner sketch: responsive WebP with the original PNG as fallback, intrinsic size to prevent layout shift.
  out = out.replace(
    /<img src="%%IMG_DINNER%%"([^>]*)>/,
    (_, attrs) =>
      `<picture><source type="image/webp" srcset="${dinner360} 360w, ${dinner640} 640w, ${dinner900} 900w" sizes="(max-width: 700px) 86vw, 320px">` +
      `<img src="${dinnerPng}" width="900" height="853" loading="lazy" decoding="async"${lockRatio(attrs)}></picture>`,
  );
  if (out.includes('%%')) throw new Error('Unfilled placeholder in page markup');
  return withFontFallbacks(out);
}

// Header used on contact / terms / privacy / 404: the home header, with in-page anchors pointing home.
const pagesHeader = prep(homeHeader).replace('href="#journeys"', 'href="/#journeys"').replace('href="#privileges"', 'href="/#privileges"');

export const html = {
  frame: prep(frameHtml),
  ddFrame: prep(ddFrameHtml),
  homeMap: prep(homeMap),
  homeHeader: prep(homeHeader),
  pagesHeader,
  homeHero: prep(homeHero),
  homeGoldenHour: prep(homeGoldenHour),
  homeStrip: prep(homeStrip),
  homeJourneys: prep(homeJourneys),
  homeChapters: prep(homeChapters),
  homePrivileges: prep(homePrivileges),
  homeClosing: prep(homeClosing),
  homeFooter: prep(homeFooter),
  ddHeader: prep(ddHeader),
  ddHero: prep(ddHero),
  ddItinerary: prep(ddItinerary),
  ddDownload: prep(ddDownload),
  ddReserve: prep(ddReserve),
  ddFooter: prep(ddFooter),
};
