// Cookie consent and ad/analytics tracking, using Google Consent Mode (advanced).
// Google Tag Manager loads on every page from the snippet in each page's <head>, with all consent set to
// "denied" until the visitor chooses. "Accept" grants it; "Only essential" keeps it denied. While denied,
// Google tags send only cookie-free pings, and Meta tags must be set in Tag Manager to require ad_storage.
import { track as vercelTrack } from '@vercel/analytics';

export const GTM_ID = 'GTM-M4FVNKG7';
const KEY = 'tuc-consent'; // 'all' | 'essential'
export const OPEN_EVENT = 'tuc:consent-open';

export function readChoice() {
  try { const v = window.localStorage.getItem(KEY); return v === 'all' || v === 'essential' ? v : null; } catch { return null; }
}

function dl() { window.dataLayer = window.dataLayer || []; return window.dataLayer; }
function gtag() { dl().push(arguments); } // eslint-disable-line prefer-rest-params

const ALL = (v) => ({ ad_storage: v, analytics_storage: v, ad_user_data: v, ad_personalization: v });

export function saveChoice(choice) {
  try { window.localStorage.setItem(KEY, choice); } catch { /* private mode: choice lasts for this visit */ }
  gtag('consent', 'update', ALL(choice === 'all' ? 'granted' : 'denied'));
  dl().push({ event: choice === 'all' ? 'consent_granted' : 'consent_denied' });
}

/** Queue an event for Tag Manager. Never include names, emails or phone numbers. */
export function track(event, params = {}) {
  if (typeof window === 'undefined') return;
  dl().push({ event, page_path: window.location.pathname, ...params });
  try { vercelTrack(event, params); } catch { /* counted only on Vercel Pro; ignored otherwise */ }
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
