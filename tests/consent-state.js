// Most tests run as a visitor who has already answered the cookie notice ("Only essential"),
// so the notice does not cover the page. The consent tests start without it.
const value = JSON.stringify({ analytics: false, ads: false, lang: 'en', at: '2026-10-30T10:00:00.000Z', version: '2026-10-30' });
const ls = [{ name: 'tuc-consent-v2', value }];
export const CHOSEN = { cookies: [], origins: [{ origin: 'http://127.0.0.1:4175', localStorage: ls }, { origin: 'http://127.0.0.1:4176', localStorage: ls }] };
