import { useEffect, useRef } from 'react';
import { DAYS, STOPS } from '../content/itinerary-walk.js';
import { buildPanorama, H } from './walkArt.js';
import { prefersReducedMotion } from '../utils/star.js';

const PANO = buildPanorama(STOPS);
const DAY = Object.fromEntries(DAYS.map((d) => [d.id, d]));
const PDF = '/docs/The-Unfound-Chapter-Dev-Deepawali-Itinerary.pdf';

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => {
  const x = hex(a); const y = hex(b);
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
};
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/**
 * The itinerary as a walk along the river. Without script, or with reduced motion, it is a plain list of
 * stops. With script the list becomes cards over a pinned stage: scrolling down moves the camera along the
 * panorama, the sky follows the time of day, and each stop's card is revealed as its scene arrives.
 */
export default function ItineraryWalk() {
  const ref = useRef(null);

  useEffect(() => {
    const walk = ref.current;
    if (!walk || prefersReducedMotion()) return undefined;
    const stage = walk.querySelector('.iw-stage');
    const pano = walk.querySelector('.iw-pano');
    const far = walk.querySelector('.iw-far');
    const stars = walk.querySelector('.iw-stars');
    const cards = [...walk.querySelectorAll('.iw-stop')];
    const pct = walk.querySelector('.iw-pct');
    const bar = walk.querySelector('.iw-bar i');
    const ticks = [...walk.querySelectorAll('.iw-day')];
    const n = STOPS.length;
    walk.classList.add('is-live');
    document.documentElement.classList.add('iw-on');

    const header = document.querySelector('.tuc-hdr');
    const art = walk.querySelector('.iw-art');
    let vw = 0; let scale = 1; let raf = 0; let last = -1; let hdr = 0;
    const measure = () => {
      vw = stage.clientWidth;
      // keep the days and the drawing clear of the (sticky) header
      hdr = header ? Math.max(0, Math.min(header.getBoundingClientRect().bottom, 200)) : 0;
      stage.style.setProperty('--hdr', `${Math.round(hdr)}px`);
      const boxH = art.clientHeight;
      const phone = vw <= 700;
      // a scene is about one screen wide on a laptop, a little wider than the screen on a phone
      scale = Math.min(boxH / H, (vw * (phone ? 2 : 1)) / 900);
      const h = `${Math.round(H * scale)}px`;
      [pano, far, stars].forEach((el) => { el.style.height = h; });
      pano.style.width = `${PANO.width * scale}px`;
      far.style.width = `${(PANO.width * 0.6 + 1800) * scale}px`;
      stars.style.width = `${PANO.width * scale}px`;
    };
    const frame = () => {
      raf = 0;
      if (header) {
        const hb = Math.round(Math.max(0, Math.min(header.getBoundingClientRect().bottom, 200)));
        if (Math.abs(hb - hdr) > 2) { hdr = hb; stage.style.setProperty('--hdr', `${hb}px`); }
      }
      const total = walk.offsetHeight - window.innerHeight;
      const p = clamp(-walk.getBoundingClientRect().top / Math.max(1, total), 0, 1);
      const t = p * (n - 1);
      const i = Math.floor(t); const k = t - i; const j = Math.min(n - 1, i + 1);
      const a = STOPS[i].sky; const b = STOPS[j].sky;
      const night = a[2] + (b[2] - a[2]) * k;
      stage.style.setProperty('--sky-top', mix(a[0], b[0], k));
      stage.style.setProperty('--sky-bot', mix(a[1], b[1], k));
      stage.style.setProperty('--night', night.toFixed(3));
      stage.style.setProperty('--ink', mix('#B08F57', '#E6CC94', clamp(night * 1.15, 0, 1)));
      // buildings are filled with the sky's own horizon colour (paper by day), a shade deeper at night
      const bot = mix(a[1], b[1], k);
      const botHex = `#${bot.slice(4, -1).split(',').map((v) => (+v).toString(16).padStart(2, '0')).join('')}`;
      stage.style.setProperty('--fill', mix(botHex, '#17223D', clamp(night * 0.6, 0, 1)));
      // camera: scene i is centred at t = i
      const cx = (t + 0.5) * 900 * scale;
      const x = clamp(cx - vw / 2, 0, PANO.width * scale - vw);
      pano.style.transform = `translate3d(${-x}px,0,0)`;
      stars.style.transform = `translate3d(${-x * 0.2}px,0,0)`;
      far.style.transform = `translate3d(${-x * 0.45}px,0,0)`;
      pct.textContent = `${Math.round(p * 100)}%`;
      bar.style.transform = `scaleX(${p})`;
      const active = Math.round(t);
      if (active !== last) {
        last = active;
        cards.forEach((c, ci) => { c.classList.toggle('is-on', ci === active); c.classList.toggle('is-past', ci < active); });
        const day = STOPS[active].day;
        ticks.forEach((d) => d.classList.toggle('is-on', d.dataset.day === day));
        stage.dataset.scene = STOPS[active].scene;
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const onResize = () => { measure(); last = -1; onScroll(); };
    measure();
    frame();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
      walk.classList.remove('is-live');
      document.documentElement.classList.remove('iw-on');
    };
  }, []);

  let prevDay = null;
  return (
    <>
      <section className="iw-intro" aria-labelledby="iw-title">
        <p className="iw-eyebrow">Dev Deepawali · Varanasi · 23 to 25 November 2026</p>
        <h1 id="iw-title">Walk the <em>three days</em></h1>
        <p className="iw-lead">Stroll along the river, from the moment you arrive to the night the ghats are lit, one stop at a time.</p>
        <p className="iw-hint" aria-hidden="true"><span>Scroll to walk</span><i /></p>
        <a className="iw-skip" href="#iw-end">Skip to the summary</a>
      </section>

      <section className="iw-walk" ref={ref} style={{ '--n': STOPS.length }} aria-label="The itinerary, stop by stop">
        <div className="iw-stage">
          <div className="iw-sky" aria-hidden="true" />
          <div className="iw-art" aria-hidden="true">
            <svg className="iw-stars" viewBox={`0 0 ${PANO.width} ${H}`} preserveAspectRatio="xMinYMin meet" dangerouslySetInnerHTML={{ __html: PANO.stars }} />
            <svg className="iw-far" viewBox={`0 0 ${PANO.width * 0.6 + 1800} ${H}`} preserveAspectRatio="xMinYMin meet"><g className="iw-ln" fill="none" dangerouslySetInnerHTML={{ __html: PANO.far }} /></svg>
            <svg className="iw-pano" viewBox={`0 0 ${PANO.width} ${H}`} preserveAspectRatio="xMinYMin meet"><g className="iw-ln" fill="none" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: PANO.near }} /></svg>
          </div>
          <div className="iw-hud" aria-hidden="true">
            <div className="iw-days">
              {DAYS.map((d) => <span key={d.id} className="iw-day" data-day={d.id}>{d.label}<b>{d.title}</b></span>)}
            </div>
            <div className="iw-bar"><i /></div>
            <span className="iw-pct">0%</span>
          </div>
          <ol className="iw-stops">
            {STOPS.map((s, i) => {
              const d = DAY[s.day];
              const first = prevDay !== s.day;
              prevDay = s.day;
              return (
                <li key={i} className={`iw-stop${first ? ' is-first' : ''}`} data-scene={s.scene}>
                  <p className="iw-when"><span>{d.label} · {d.date}</span><b>{s.time}</b></p>
                  <h2>{s.title}</h2>
                  <p className="iw-text">{s.text}</p>
                  <span className="iw-num" aria-hidden="true">{String(i + 1).padStart(2, '0')} / {STOPS.length}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="iw-end" id="iw-end" aria-labelledby="iw-end-title">
        <p className="iw-eyebrow">Three days · Two nights · Limited to 10 guests</p>
        <h2 id="iw-end-title">The journey is <em>the destination.</em></h2>
        <ul className="iw-sum">
          {DAYS.map((d) => (
            <li key={d.id}><span>{d.label}</span><b>{d.title}</b><small>{d.date}</small></li>
          ))}
        </ul>
        <div className="iw-ctas">
          <a className="iw-btn iw-btn-solid" href={PDF} download>Download the itinerary</a>
          <a className="iw-btn" href="contact.html?journey=dev-diwali#tuc-enquiry">Enquire</a>
        </div>
        <a className="iw-back" href="dev-diwali.html">Back to Dev Deepawali</a>
      </section>
    </>
  );
}
