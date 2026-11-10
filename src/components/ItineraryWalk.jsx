import { useEffect, useRef } from 'react';
import { DAYS, STOPS } from '../content/itinerary-walk.js';
import { prefersReducedMotion } from '../utils/star.js';

const DAY = Object.fromEntries(DAYS.map((d) => [d.id, d]));
const PDF = '/docs/The-Unfound-Chapter-Dev-Deepawali-Itinerary.pdf';
const src = (name, w) => `/walk/${name}-${w}.webp`;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * The itinerary as a walk through real photographs. Without script, or with reduced motion, it is a list of
 * photo cards. With script the stage is pinned: scrolling walks the camera forward into each photograph,
 * and the next place fades in ahead of you as you pass through, with its card rising alongside.
 */
export default function ItineraryWalk() {
  const ref = useRef(null);

  useEffect(() => {
    const walk = ref.current;
    if (!walk || prefersReducedMotion()) return undefined;
    const stage = walk.querySelector('.iw-stage');
    const scenes = [...walk.querySelectorAll('.iw-stop')];
    const imgs = scenes.map((s) => s.querySelector('.iw-photo img'));
    const cards = scenes.map((s) => s.querySelector('.iw-card'));
    const pct = walk.querySelector('.iw-pct');
    const bar = walk.querySelector('.iw-bar i');
    const ticks = [...walk.querySelectorAll('.iw-day')];
    const header = document.querySelector('.tuc-hdr');
    const n = STOPS.length;
    walk.classList.add('is-live');
    document.documentElement.classList.add('iw-on');
    imgs.forEach((im) => { if (im) im.loading = 'eager'; });

    // A photo that would have to be enlarged a lot to fill the screen is shown sharp at (close to) its own size,
    // framed over a blurred copy of itself; large photos fill the screen.
    const framed = new Array(n).fill(false);
    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const W = stage.clientWidth; const Hs = stage.clientHeight;
      const phone = W <= 700;
      const top = (header ? clamp(header.getBoundingClientRect().bottom, 0, 200) : 0) + (phone ? 52 : 70);
      scenes.forEach((sc, j) => {
        const [nw, nh] = STOPS[j].size;
        const stretch = Math.max((W * dpr) / nw, (Hs * dpr) / nh);
        framed[j] = stretch > 1.35;
        sc.classList.toggle('is-framed', framed[j]);
        const im = imgs[j];
        if (!framed[j]) { im.style.width = ''; im.style.height = ''; im.style.left = ''; im.style.top = ''; return; }
        // as large as the space allows without enlarging the photo beyond 1.2x its real pixels
        const boxW = phone ? W - 28 : W * 0.5;
        const boxH = phone ? Math.max(160, Hs - top - cards[j].offsetHeight - 40) : Hs - top - 60;
        const k = Math.min(boxW / nw, boxH / nh, 1.2 / dpr);
        const w = Math.round(nw * k);
        const h = Math.round((w * nh) / nw);
        im.style.width = `${w}px`;
        im.style.height = `${h}px`;
        im.style.left = phone ? `${Math.round((W - w) / 2)}px` : `${Math.round(W * 0.47 + (W * 0.5 - w) / 2)}px`;
        im.style.top = `${Math.round(top + (boxH - h) / 2)}px`;
      });
    };

    let raf = 0; let lastDay = '';
    const frame = () => {
      raf = 0;
      if (header) stage.style.setProperty('--hdr', `${Math.round(clamp(header.getBoundingClientRect().bottom, 0, 200))}px`);
      const total = walk.offsetHeight - window.innerHeight;
      const p = clamp(-walk.getBoundingClientRect().top / Math.max(1, total));
      const x = p * (n - 1);
      scenes.forEach((sc, j) => {
        const d = x - j;
        // fade in over the scene before (we walk into it), stay, then be covered by the next one
        const op = d < 0 ? clamp((d + 0.62) / 0.3) : (d > 1 ? 0 : 1);
        sc.style.visibility = op > 0 ? 'visible' : 'hidden';
        sc.style.opacity = op.toFixed(3);
        if (op > 0 && imgs[j]) {
          // walking forward: the photograph grows towards its focus point, faster as we pass through
          const s = framed[j]
            ? (d < 0.5 ? 1 + 0.05 * clamp(d + 0.6, 0, 1.1) : 1.055 + 0.3 * (d - 0.5))
            : (d < 0.5 ? 1 + 0.12 * clamp(d + 0.6, 0, 1.1) : 1.132 + 0.45 * (d - 0.5));
          imgs[j].style.transform = `scale(${s.toFixed(4)})`;
        }
        const c = cards[j];
        const cv = clamp(1 - (Math.abs(d) - 0.28) / 0.14);
        c.style.opacity = cv.toFixed(3);
        c.style.transform = `translate3d(0,${(d * -60).toFixed(1)}px,0)`;
        c.style.pointerEvents = cv > 0.5 ? 'auto' : 'none';
      });
      pct.textContent = `${Math.round(p * 100)}%`;
      bar.style.transform = `scaleX(${p})`;
      const day = STOPS[Math.round(x)].day;
      if (day !== lastDay) { lastDay = day; ticks.forEach((t) => t.classList.toggle('is-on', t.dataset.day === day)); }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const onResize = () => { layout(); onScroll(); };
    layout();
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

  return (
    <>
      <section className="iw-intro" aria-labelledby="iw-title">
        <p className="iw-eyebrow">Dev Deepawali · Varanasi · 23 to 25 November 2026</p>
        <h1 id="iw-title">Walk the <em>three days</em></h1>
        <p className="iw-lead">From the moment you arrive to the night the ghats are lit, step by step, place by place.</p>
        <p className="iw-hint" aria-hidden="true"><span>Scroll to walk</span><i /></p>
        <a className="iw-skip" href="#iw-end">Skip to the summary</a>
      </section>

      <section className="iw-walk" ref={ref} style={{ '--n': STOPS.length }} aria-label="The itinerary, place by place">
        <div className="iw-stage">
          <ol className="iw-stops">
            {STOPS.map((s, i) => {
              const d = DAY[s.day];
              return (
                <li key={i} className="iw-stop" style={{ '--focus': s.focus, zIndex: i + 1 }}>
                  <figure className="iw-photo">
                    <span className="iw-blur" aria-hidden="true" style={{ backgroundImage: `url(${src(s.photo, s.w[0])})` }} />
                    <img
                      src={src(s.photo, s.w[0])}
                      srcSet={s.w.map((w) => `${src(s.photo, w)} ${w}w`).join(', ')}
                      sizes="100vw"
                      alt={s.alt}
                      loading={i < 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={i === 0 ? 'high' : undefined}
                    />
                  </figure>
                  <div className="iw-card">
                    <p className="iw-when"><span>{d.label} · {d.date}</span><b>{s.time}</b></p>
                    <h2>{s.title}</h2>
                    <p className="iw-text">{s.text}</p>
                    {s.extras ? (
                      <div className="iw-extras">
                        {s.extras.map((e) => <img key={e.photo} src={src(e.photo, 480)} alt={e.alt} loading="lazy" decoding="async" />)}
                      </div>
                    ) : null}
                    <span className="iw-num" aria-hidden="true">{String(i + 1).padStart(2, '0')} / {STOPS.length}</span>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="iw-hud" aria-hidden="true">
            <div className="iw-days">
              {DAYS.map((d) => <span key={d.id} className="iw-day" data-day={d.id}>{d.label}<b>{d.title}</b></span>)}
            </div>
            <div className="iw-bar"><i /></div>
            <span className="iw-pct">0%</span>
          </div>
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
