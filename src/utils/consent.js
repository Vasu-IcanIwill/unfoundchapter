// Cookie consent, Google Analytics and ad tracking, built to the DPDP Act 2023 and Rules 2025:
// consent is asked per purpose (Analytics, Advertising), nothing optional runs before a choice, the choice is
// recorded with the notice version and time, and it can be changed or withdrawn at any time ("Cookie settings").
//
// Google Analytics 4 (gtag.js) is loaded ONLY after the visitor allows Analytics.
// Google Tag Manager carries the advertising tags (Meta Pixel, Google Ads). It loads ONLY after the visitor allows
// Advertising: from the <head> snippet on return visits, or from loadAdvertising() at the moment they allow it.
import { GA_ID } from './env.js';
import { track as vercelTrack } from '@vercel/analytics';

export const GTM_ID = 'GTM-M4FVNKG7';
export const NOTICE_VERSION = '2026-10-30';
const KEY = 'tuc-consent-v2';
const OLD_KEY = 'tuc-consent';
export const OPEN_EVENT = 'tuc:consent-open';

/** { analytics: boolean, ads: boolean, lang, at, version } or null if the visitor has not chosen (or the notice changed). */
export function readChoice() {
  try {
    const c = JSON.parse(window.localStorage.getItem(KEY) || 'null');
    return c && c.version === NOTICE_VERSION ? c : null;
  } catch { return null; }
}

function dl() { window.dataLayer = window.dataLayer || []; return window.dataLayer; }
function gtag() { dl().push(arguments); } // eslint-disable-line prefer-rest-params
const state = (on) => (on ? 'granted' : 'denied');

let gaLoaded = false;
/** Loads Google Analytics, with Google signals and ad personalisation switched off. */
export function loadAnalytics() {
  if (gaLoaded || !GA_ID || typeof document === 'undefined') return;
  gaLoaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
}

/** Loads Google Tag Manager (Meta Pixel, Google Ads), once, after Advertising is allowed. */
export function loadAdvertising() {
  if (typeof document === 'undefined' || window.__tucGtm) return;
  window.__tucGtm = true;
  dl().push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(s);
}

export function applyChoice(c) {
  gtag('consent', 'update', {
    analytics_storage: state(c.analytics),
    ad_storage: state(c.ads),
    ad_user_data: state(c.ads),
    ad_personalization: state(c.ads),
  });
  if (c.analytics) loadAnalytics();
  if (c.ads) loadAdvertising();
}

export function saveChoice({ analytics, ads, lang = 'en' }) {
  const prev = readChoice();
  const c = { analytics: !!analytics, ads: !!ads, lang, at: new Date().toISOString(), version: NOTICE_VERSION };
  try { window.localStorage.setItem(KEY, JSON.stringify(c)); window.localStorage.removeItem(OLD_KEY); } catch { /* private mode: lasts this visit */ }
  applyChoice(c);
  dl().push({ event: 'consent_choice', consent_analytics: c.analytics, consent_ads: c.ads, consent_version: NOTICE_VERSION });
  // withdrawing a consent that was given: reload so no tag already running keeps going
  if (prev && ((prev.analytics && !c.analytics) || (prev.ads && !c.ads))) window.location.reload();
}

/** Queue an event for Tag Manager, and for Google Analytics if allowed. Never include names, emails or phone numbers. */
export function track(event, params = {}) {
  if (typeof window === 'undefined') return;
  const p = { page_path: window.location.pathname, ...params };
  dl().push({ event, ...p });
  if (gaLoaded) gtag('event', event, p);
  try { vercelTrack(event, params); } catch { /* counted only on Vercel Pro; ignored otherwise */ }
}

/** Counts taps on WhatsApp, call and email links anywhere on the page. */
export function initLinkTracking() {
  const onClick = (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (a.closest('.tuc-consent-bar')) return;
    const where = a.closest('footer') ? 'footer' : a.closest('#reserve') ? 'reserve' : a.closest('form, .tuc-intro') ? 'contact' : 'page';
    if (href.includes('wa.me/')) track('whatsapp_click', { link_location: where });
    else if (href.startsWith('tel:')) track('call_click', { link_location: where });
    else if (href.startsWith('mailto:')) track('email_click', { link_location: where });
    else if (href === '#cookie-settings') { e.preventDefault(); window.dispatchEvent(new Event(OPEN_EVENT)); }
  };
  document.addEventListener('click', onClick, true);
  return () => document.removeEventListener('click', onClick, true);
}
