// Most tests run as a visitor who has already answered the cookie notice ("Only essential"),
// so the notice does not cover the page. The consent tests below start without it.
const ls = [{ name: 'tuc-consent', value: 'essential' }];
export const CHOSEN = { cookies: [], origins: [{ origin: 'http://127.0.0.1:4175', localStorage: ls }, { origin: 'http://127.0.0.1:4176', localStorage: ls }] };
