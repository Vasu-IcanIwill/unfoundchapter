import { useEffect, useRef, useState } from 'react';
import { ENQUIRY_ENDPOINT, ENQUIRY_EMAIL } from '../utils/env.js';
import { attachHandwriting, alignToRules } from '../utils/handwriting.js';
import { COUNTRIES, countryOf, digitsHint, phoneError, cleanPhone } from '../utils/countries.js';

const JOURNEY_FROM_QUERY = { own: 'own', diy: 'own', 'dev-diwali': 'dev-diwali', group: 'dev-diwali' };
const JOURNEY_LABEL = { own: 'Write your own chapter', 'dev-diwali': 'We write your chapter: Dev Deepawali' };
const CHOICES = [
  { value: 'own', title: <>Write your own <span className="tuc-cw">chapter</span></>, note: 'A private journey, planned around you' },
  { value: 'dev-diwali', title: <>We write your <span className="tuc-cw">chapter</span></>, note: 'Dev Deepawali in Varanasi, 23 to 25 November 2026' },
];
const EMPTY = { journey: '', name: '', email: '', cc: 'IN', phone: '', travellers: '', from: '', to: '', message: '', consent: false };
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Today as YYYY-MM-DD in the visitor's own time zone (for the date pickers' minimum). */
export function todayISO(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const prettyDate = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const TIMEOUT_MS = 15000;
const FAILED = <>That did not go through. Please message us on <a href="https://wa.me/919147746406" target="_blank" rel="noopener">WhatsApp at +91 91477 46406</a> or write to <a href="mailto:hello@unfoundchapter.com">hello@unfoundchapter.com</a>.</>;

function validate(v, today) {
  const e = {};
  if (!v.journey) e.journey = 'Choose one of the chapters.';
  if (!v.name.trim()) e.name = 'Enter your name.';
  const email = v.email.trim();
  if (!email) e.email = 'Enter your email.';
  else if (!EMAIL_RE.test(email)) e.email = 'Check the email address.';
  const c = countryOf(v.cc);
  if (!v.phone) e.phone = 'Enter your phone or WhatsApp number.';
  else if (!/^\d+$/.test(v.phone) || v.phone.length < c.min || v.phone.length > c.max) e.phone = phoneError(c);
  if (v.journey !== 'dev-diwali') {
    if (v.from && v.from < today) e.dates = 'Choose dates from today onwards.';
    else if (v.to && !v.from) e.dates = 'Choose a start date too.';
    else if (v.to && v.to < v.from) e.dates = 'The end date must be on or after the start date.';
  }
  if (!v.consent) e.consent = 'Please tick the box so we can reply to you.';
  return e;
}

/** Enquiry form. Sends to VITE_ENQUIRY_ENDPOINT, or opens an email to VITE_ENQUIRY_EMAIL; otherwise says it was not sent. */
export default function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ kind: 'idle', text: '' });
  const formRef = useRef(null);
  // set after hydration so the prerendered page never carries a stale build date
  const [today, setToday] = useState('');
  useEffect(() => { setToday(todayISO()); }, []);

  // ?journey=own | dev-diwali | ... preselects the chapter (after hydration, so server and client markup match)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('journey');
    if (q && JOURNEY_FROM_QUERY[q]) setValues((v) => ({ ...v, journey: JOURNEY_FROM_QUERY[q] }));
  }, []);

  // cursive "handwriting" ink over the text fields
  const inkRef = useRef(null);
  useEffect(() => {
    inkRef.current = attachHandwriting(formRef.current);
    const unalign = alignToRules(formRef.current);
    return () => { unalign(); inkRef.current.destroy(); inkRef.current = null; };
  }, []);
  useEffect(() => { if (inkRef.current) inkRef.current.sync(); }, [values]);

  // "We write your chapter" (Dev Deepawali) switches to the short form; the grid fades in afresh on the switch
  const short = values.journey === 'dev-diwali';
  const wasShort = useRef(short);
  useEffect(() => {
    if (wasShort.current === short) return;
    wasShort.current = short;
    const grid = formRef.current && formRef.current.querySelector('.tuc-grid');
    if (!grid) return;
    grid.classList.remove('tuc-swap');
    void grid.offsetWidth;
    grid.classList.add('tuc-swap');
  }, [short]);

  const set = (name) => (ev) => {
    let value = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
    setValues((v) => {
      const next = { ...v, [name]: name === 'phone' ? cleanPhone(value, countryOf(v.cc)) : value };
      if (name === 'cc') next.phone = cleanPhone(v.phone, countryOf(value));
      if (name === 'from' && next.to && value && next.to < value) next.to = '';
      return next;
    });
    const key = name === 'from' || name === 'to' ? 'dates' : name === 'cc' ? 'phone' : name;
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function onSubmit(ev) {
    ev.preventDefault();
    if (status.kind === 'sending') return;
    const found = validate(values, today || todayISO());
    setErrors(found);
    setStatus({ kind: 'idle', text: '' });
    if (Object.keys(found).length) {
      requestAnimationFrame(() => {
        const first = formRef.current && formRef.current.querySelector('.tuc-err');
        if (first) first.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
      return;
    }
    const label = JOURNEY_LABEL[values.journey];
    if (ENQUIRY_ENDPOINT) {
      setStatus({ kind: 'sending', text: 'Sending...' });
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      try {
        const body = new FormData(formRef.current);
        body.set('chapter', label);
        body.set('phone', `+${countryOf(values.cc).dial} ${values.phone}`);
        if (values.journey === 'dev-diwali') { body.delete('from'); body.delete('to'); body.set('dates', '23 to 25 November 2026'); }
        if (!values.message.trim()) body.delete('message');
        body.set('_subject', `New enquiry: ${label}`);
        body.set('_template', 'table');
        body.set('_captcha', 'false');
        body.set('_replyto', values.email.trim());
        const res = await fetch(ENQUIRY_ENDPOINT, { method: 'POST', body, headers: { Accept: 'application/json' }, signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setValues(EMPTY);
        setStatus({ kind: 'sent', text: 'Thank you. A planner will write to you within one working day.' });
      } catch (err) {
        setStatus({ kind: 'error', text: FAILED });
      } finally {
        clearTimeout(timer);
      }
    } else if (ENQUIRY_EMAIL) {
      const text = [
        `Chapter: ${label}`, `Name: ${values.name.trim()}`, `Email: ${values.email.trim()}`, `Phone: +${countryOf(values.cc).dial} ${values.phone}`,
        `Travellers: ${values.travellers}`,
        values.journey === 'dev-diwali' ? 'Dates: 23 to 25 November 2026' : `Dates: ${values.from ? `${prettyDate(values.from)} to ${prettyDate(values.to) || 'open'}` : 'not decided'}`,
        ...(values.message.trim() ? [`Message: ${values.message.trim()}`] : []),
      ].join('\n');
      window.location.href = `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(`Enquiry: ${label}`)}&body=${encodeURIComponent(text)}`;
      setStatus({ kind: 'sent', text: 'Your email app should open with your enquiry ready to send.' });
    } else {
      setStatus({ kind: 'error', text: FAILED });
    }
  }

  const country = countryOf(values.cc);
  const err = (key, id) => (errors[key] ? <p className="tuc-err" id={id}>{errors[key]}</p> : null);

  return (
    <form id="tuc-enquiry" ref={formRef} className="tuc-sheet" data-journey={values.journey || undefined} noValidate onSubmit={onSubmit}>
      <fieldset className="tuc-field tuc-choice" aria-describedby={errors.journey ? 'err-journey' : undefined}>
        <legend>Which <span className="tuc-cw tuc-cw-sm">chapter</span></legend>
        {CHOICES.map((c) => (
          <label key={c.value}>
            <input type="radio" name="journey" value={c.value} checked={values.journey === c.value} onChange={set('journey')} />
            <span><b>{c.title}</b><em>{c.note}</em></span>
          </label>
        ))}
        {err('journey', 'err-journey')}
      </fieldset>
      <div className="tuc-grid">
        <label className="tuc-field"><span>Your name</span>
          <input name="name" autoComplete="name" required value={values.name} onChange={set('name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined} />
          {err('name', 'err-name')}
        </label>
        <label className="tuc-field"><span>Email</span>
          <input name="email" type="email" autoComplete="email" required value={values.email} onChange={set('email')} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'err-email' : undefined} />
          {err('email', 'err-email')}
        </label>
        <div className="tuc-field" role="group" aria-labelledby="lbl-phone"><span id="lbl-phone">Phone or WhatsApp</span>
          <div className="tuc-phone">
            <select name="cc" aria-label="Country code" autoComplete="tel-country-code" value={values.cc} onChange={set('cc')}>
              {COUNTRIES.map((c) => <option key={c.iso} value={c.iso}>+{c.dial} {c.name}</option>)}
            </select>
            <input name="phone" type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={country.max} autoComplete="tel-national" required placeholder={digitsHint(country)} aria-label={`Phone or WhatsApp number, ${digitsHint(country)}`} value={values.phone} onChange={set('phone')} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'err-phone' : undefined} />
          </div>
          {err('phone', 'err-phone')}
        </div>
        <label className="tuc-field"><span>Travellers</span>
          <select name="travellers" value={values.travellers} onChange={set('travellers')}>
            <option value="">Select</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5 to 8</option><option>More than 8</option>
          </select>
        </label>
        <fieldset className="tuc-field tuc-wide tuc-dates" aria-describedby={errors.dates ? 'err-dates' : undefined}>
          <legend>Preferred dates</legend>
          <div className="tuc-range">
            <label><span>From</span>
              <input name="from" type="date" min={today || undefined} value={values.from} onChange={set('from')} aria-invalid={!!errors.dates} />
            </label>
            <label><span>To</span>
              <input name="to" type="date" min={values.from || today || undefined} value={values.to} onChange={set('to')} aria-invalid={!!errors.dates} />
            </label>
          </div>
          {err('dates', 'err-dates')}
        </fieldset>
        <div className="tuc-field tuc-fixed"><span>Dates</span><p>23 to 25 November 2026</p></div>
        <label className="tuc-field tuc-msg"><span>Anything we should know?</span>
          <textarea name="message" rows={3} placeholder="Optional" value={values.message} onChange={set('message')} />
        </label>
      </div>
      <label className="tuc-consent">
        <input type="checkbox" name="consent" required checked={values.consent} onChange={set('consent')} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'err-consent' : undefined} />
        <span>I agree that Unfound Chapter may use these details to reply to my enquiry, as described in the <a href="/privacy.html">privacy policy</a>.</span>
      </label>
      {err('consent', 'err-consent')}
      <div className="tuc-actions">
        <button type="submit" className="tuc-send" disabled={status.kind === 'sending'}>Request invite</button>
        <p className="tuc-status" role="status" aria-live="polite">{status.text}</p>
      </div>
    </form>
  );
}
