import { useEffect, useRef } from 'react';
import RawHtml from './RawHtml.jsx';
import { html } from '../content/index.js';

const utcLabel = (d = new Date()) => `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;

/**
 * "Golden hour, around the world": section markup is static; the globe/sky engine (about 95 KB,
 * including the land and coastline data) is code-split and loaded when the browser is idle or the
 * section approaches the viewport, whichever comes first. Nothing visual changes once it runs.
 */
export default function GoldenHour() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const setUtc = (label) => root.querySelectorAll('.tuc-utc').forEach((el) => { el.textContent = `${label} UTC`; });
    setUtc(utcLabel());

    let engine = null;
    let cancelled = false;
    let idleId = 0;
    let timeoutId = 0;
    const section = root.querySelector('.tuc-gh');

    const load = () => {
      if (engine || cancelled || load.started) return;
      load.started = true;
      io && io.disconnect();
      import('../features/golden-hour/engine.js')
        .then(({ GoldenHourEngine }) => {
          if (cancelled) return;
          engine = new GoldenHourEngine({ onUtc: setUtc });
          engine.mount(root);
        })
        .catch((err) => {
          // The section keeps its static text and legend if the engine cannot load (e.g. offline).
          console.error('[golden hour] engine failed to load', err);
        });
    };

    // Start after the page has finished loading (so it never competes with first paint), as soon as the
    // section is near the viewport or the browser is idle, whichever comes first.
    const idle = (fn, timeout) => ('requestIdleCallback' in window
      ? (idleId = window.requestIdleCallback(fn, { timeout }))
      : (timeoutId = window.setTimeout(fn, 200)));
    const io = typeof IntersectionObserver !== 'undefined' && section
      ? new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) idle(load, 600); }, { rootMargin: '400px 0px' })
      : null;
    const start = () => {
      if (cancelled) return;
      if (io) io.observe(section);
      idle(load, 4000);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('load', start);
      if (io) io.disconnect();
      if (idleId && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
      clearTimeout(timeoutId);
      if (engine) {
        engine.destroy();
        // fresh canvases drop the engine's pointer/keyboard listeners (matters for React StrictMode remounts)
        root.querySelectorAll('canvas').forEach((c) => c.replaceWith(c.cloneNode(false)));
      }
    };
  }, []);

  return <RawHtml ref={ref} html={html.homeGoldenHour} />;
}
