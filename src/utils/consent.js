// Cookie consent and ad/analytics tracking.
// Google Tag Manager (which carries Google Analytics, Google Ads and the Meta Pixel) is loaded ONLY after the
// visitor chooses "Accept". With "Only essential", or before any choice, nothing is sent to Google or Meta.
export const GTM_ID = 'GTM-M4FVNKG7';
const KEY = 'tuc-consent'; // 'all' | 'essential'
export const OPEN_EVENT = 'tuc:consent-open';

export function readChoice() {
  try { const v = window.localStorage.getItem(KEY); return v === 'all' || v === 'essential' ? v : null; } catch { return null; }
}

function dl() { window.dataLayer = window.dataLayer || []; return window.dataLayer; }
function gtag() { dl().push(arguments); } // eslint-disable-line prefer-rest-params

let loaded = false;
export function loadTags() {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  gtag('consent', 'default', { ad_storage: 'granted', analytics_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
  dl().push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(s);
}

export function saveChoice(choice) {
  try { window.localStorage.setItem(KEY, choice); } catch { /* private mode: choice lasts for this visit */ }
  if (choice === 'all') loadTags();
  else if (loaded) {
    // switching from Accept to Only essential: stop new cookies now, and reload so no tags stay running
    gtag('consent', 'update', { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.location.reload();
  }
}

/** Queue an event for Tag Manager. Never include names, emails or phone numbers. */
export function track(event, params = {}) {
  if (typeof window === 'undefined') return;
  dl().push({ event, page_path: window.location.pathname, ...params });
}

/** Counts taps on WhatsApp, call and email links anywhere on the page. */
export function initLinkTracking() {
  const onClick = (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const where = a.closest('footer') ? 'footer' : a.closest('#reserve') ? 'reserve' : a.closest('form, .tuc-intro') ? 'contact' : 'page';
    if (href.includes('wa.me/')) track('whatsapp_click', { link_location: where });
    else if (href.startsWith('tel:')) track('call_click', { link_location: where });
    else if (href.startsWith('mailto:')) track('email_click', { link_location: where });
    else if (href === '#cookie-settings') { e.preventDefault(); window.dispatchEvent(new Event(OPEN_EVENT)); }
  };
  document.addEventListener('click', onClick, true);
  return () => document.removeEventListener('click', onClick, true);
}
