// POST /api/enquiry: the website's own enquiry sender (Vercel Function).
// Sends two emails through Resend (resend.com):
//   1. the enquiry to the studio inbox, with Reply-To set to the guest;
//   2. a confirmation to the guest, thanking them by name.
// Settings (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY  required; until it is set this answers 503 and the website falls back to its backups
//   ENQUIRY_TO      where enquiries go          (default unfoundchapter@gmail.com)
//   ENQUIRY_FROM    sender, on a domain verified in Resend (default "Unfound Chapter <hello@unfoundchapter.com>")
// The guest confirmation never repeats what the visitor typed beyond their first name, so the form can't be
// used to send arbitrary text to strangers. A hidden "company" field and a per-address limit stop bots.

const TO = process.env.ENQUIRY_TO || 'unfoundchapter@gmail.com';
const FROM = process.env.ENQUIRY_FROM || 'Unfound Chapter <hello@unfoundchapter.com>';
const REPLY_TO_STUDIO = 'hello@unfoundchapter.com';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const LIMIT = 5; // enquiries per IP address per hour (best effort: per running instance)
const seen = new Map();

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clip = (s, n) => String(s ?? '').trim().slice(0, n);

function tooMany(ip) {
  const now = Date.now();
  const list = (seen.get(ip) || []).filter((t) => now - t < 3600_000);
  list.push(now);
  seen.set(ip, list);
  return list.length > LIMIT;
}

async function send(payload) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 300)}`);
}

function studioEmail(f) {
  const rows = [['Chapter', f.chapter], ['Name', f.name], ['Email', f.email], ['Phone or WhatsApp', f.phone], ['Travellers', f.travellers || 'Not given'], ['Dates', f.dates || 'Not decided'], ['Anything we should know', f.message || '']];
  const html = `<div style="font-family:Arial,sans-serif;color:#1B2B4A"><h2 style="font-weight:400">New enquiry: ${esc(f.chapter)}</h2>
<table cellpadding="8" style="border-collapse:collapse;font-size:14px">${rows.map(([k, v]) => `<tr><td style="border-bottom:1px solid #E6DCC8;color:#96745A;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="border-bottom:1px solid #E6DCC8;white-space:pre-wrap">${esc(v)}</td></tr>`).join('')}</table>
<p style="font-size:12px;color:#6E5440">Reply to this email to write to the guest directly.</p></div>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  return { from: FROM, to: [TO], reply_to: f.email, subject: `New enquiry: ${f.chapter}, ${f.name}`, html, text };
}

function guestEmail(f) {
  const first = esc(f.name.split(/\s+/)[0].slice(0, 40));
  const text = `Dear ${f.name.split(/\s+/)[0].slice(0, 40)},

Thank you for contacting Unfound Chapter. We have received your enquiry, and a planner will get back to you within the next 12 to 24 hours.

We are excited to host you on your next journey.

If anything is urgent, message us on WhatsApp at +91 91477 46406, or simply reply to this email.

Warm regards,
Unfound Chapter
Private journeys across India
hello@unfoundchapter.com · +91 91477 46406

Unfound Chapter is a brand of Bitmartian Softech Private Limited.
You are receiving this one email because this address was used on the enquiry form at unfoundchapter.com.`;
  const html = `<!doctype html><html><body style="margin:0;background:#F7F4EE">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4EE;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FCFAF4;border:1px solid #E2D3B5">
<tr><td style="background:#1B2B4A;padding:26px 32px;text-align:center;font-family:Georgia,serif;letter-spacing:4px;font-size:14px;color:#ECCDA1">UNFOUND CHAPTER</td></tr>
<tr><td style="padding:34px 32px 10px;font-family:Georgia,serif;color:#1B2B4A">
<p style="margin:0 0 6px;font-size:13px;letter-spacing:3px;color:#96745A">THANK YOU</p>
<p style="margin:0 0 20px;font-size:24px;line-height:1.3">Dear ${first},</p>
<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#454B50">Thank you for contacting Unfound Chapter. We have received your enquiry, and a planner will get back to you within the next 12 to 24 hours.</p>
<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#454B50">We are excited to host you on your next journey.</p>
<p style="margin:0 0 26px;font-size:16px;line-height:1.7;color:#454B50">If anything is urgent, message us on <a href="https://wa.me/919147746406" style="color:#96745A">WhatsApp at +91 91477 46406</a>, or simply reply to this email.</p>
<p style="margin:0;font-size:16px;line-height:1.7;color:#1B2B4A">Warm regards,<br>Unfound Chapter</p>
</td></tr>
<tr><td style="padding:24px 32px 30px;font-family:Arial,sans-serif;font-size:12px;line-height:1.7;color:#6E5440;border-top:1px solid #EFE6D4">
Private journeys across India<br><a href="mailto:hello@unfoundchapter.com" style="color:#6E5440">hello@unfoundchapter.com</a> · <a href="tel:+919147746406" style="color:#6E5440">+91 91477 46406</a><br>
<span style="color:#9A8A78">Unfound Chapter is a brand of Bitmartian Softech Private Limited. You are receiving this one email because this address was used on the enquiry form at unfoundchapter.com.</span>
</td></tr></table></td></tr></table></body></html>`;
  return { from: FROM, to: [f.email], reply_to: REPLY_TO_STUDIO, subject: 'Thank you for contacting Unfound Chapter', html, text };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });
  if (!process.env.RESEND_API_KEY) return res.status(503).json({ ok: false, error: 'not_configured' });

  const b = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch { return {}; } })() : (req.body || {});
  if (b.company) return res.status(200).json({ ok: true }); // honeypot: bots fill the hidden field
  const f = {
    chapter: clip(b.chapter, 80), name: clip(b.name, 100), email: clip(b.email, 200), phone: clip(b.phone, 30),
    travellers: clip(b.travellers, 20), dates: clip(b.dates, 80), message: clip(b.message, 2000),
  };
  if (!f.chapter || !f.name || !EMAIL_RE.test(f.email) || !/^\+\d{1,4} \d{5,14}$/.test(f.phone)) {
    return res.status(400).json({ ok: false, error: 'invalid' });
  }
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (tooMany(ip)) return res.status(429).json({ ok: false, error: 'rate_limited' });

  try {
    await send(studioEmail(f));
  } catch (e) {
    console.error('enquiry to studio failed', e.message);
    return res.status(502).json({ ok: false, error: 'send_failed' });
  }
  let confirmed = true;
  try { await send(guestEmail(f)); } catch (e) { confirmed = false; console.error('guest confirmation failed', e.message); }
  return res.status(200).json({ ok: true, confirmed });
}
