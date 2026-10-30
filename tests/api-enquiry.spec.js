import { test, expect } from '@playwright/test';
import handler from '../api/enquiry.js';

// Unit tests for the enquiry function (no browser): Resend is replaced by a stub.
function call(body, { key = 're_test', ip = '203.0.113.' + Math.floor(Math.random() * 250) } = {}) {
  if (key) process.env.RESEND_API_KEY = key; else delete process.env.RESEND_API_KEY;
  const res = { code: 0, json: null, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(j) { this.json = j; return this; } };
  return handler({ method: 'POST', body, headers: { 'x-forwarded-for': ip } }, res).then(() => res);
}
const GOOD = { chapter: 'We write your chapter: Dev Deepawali', name: 'Asha Sharma', email: 'asha@example.com', phone: '+91 9876543210', travellers: '2', dates: '23 to 25 November 2026', message: 'Vegetarian' };

test.describe('/api/enquiry', () => {
  let sent;
  test.beforeEach(() => {
    sent = [];
    globalThis.fetch = async (url, opts) => { sent.push({ url, body: JSON.parse(opts.body), auth: opts.headers.Authorization }); return new Response('{"id":"x"}', { status: 200 }); };
  });

  test('without a Resend key it steps aside (503) so the site uses its backups', async () => {
    const r = await call(GOOD, { key: null });
    expect(r.code).toBe(503);
    expect(sent).toHaveLength(0);
  });

  test('sends the enquiry to the studio and a thank-you to the guest', async () => {
    const r = await call(GOOD);
    expect(r.code).toBe(200);
    expect(r.json).toEqual({ ok: true, confirmed: true });
    expect(sent).toHaveLength(2);
    const [studio, guest] = sent.map((s) => s.body);
    expect(studio.to).toEqual(['unfoundchapter@gmail.com']);
    expect(studio.reply_to).toBe('asha@example.com');
    expect(studio.text).toContain('Vegetarian');
    expect(guest.to).toEqual(['asha@example.com']);
    expect(guest.subject).toBe('Thank you for contacting Unfound Chapter');
    expect(guest.text).toContain('Dear Asha,');
    expect(guest.text).toContain('within the next 12 to 24 hours');
    expect(guest.text).toContain('We are excited to host you on your next journey.');
    expect(guest.text).not.toContain('Vegetarian'); // the guest email never repeats what was typed
    expect(sent[0].auth).toBe('Bearer re_test');
  });

  test('escapes HTML in names', async () => {
    await call({ ...GOOD, name: '<b>Asha</b> Sharma' });
    expect(sent[1].body.html).toContain('&lt;b&gt;Asha&lt;/b&gt;');
    expect(sent[0].body.html).not.toContain('<b>Asha');
  });

  test('rejects bad input, ignores bots, limits repeat senders', async () => {
    expect((await call({ ...GOOD, email: 'nope' })).code).toBe(400);
    expect((await call({ ...GOOD, phone: '12345' })).code).toBe(400);
    const bot = await call({ ...GOOD, company: 'Spam Ltd' });
    expect(bot.code).toBe(200);
    expect(sent).toHaveLength(0);
    let last;
    for (let i = 0; i < 6; i += 1) last = await call(GOOD, { ip: '198.51.100.7' });
    expect(last.code).toBe(429);
  });
});
