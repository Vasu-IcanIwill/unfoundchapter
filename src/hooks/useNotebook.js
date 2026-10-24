import { useEffect } from 'react';
import { prefersReducedMotion } from '../utils/star.js';

const DUR = 900; // one full page turn, ms
/**
 * "Two ways to begin" notepad, read like a book (pages turn right to left).
 * Page turns are driven frame by frame: each leaf rotates on its left edge, shows its paper back as it
 * passes the spine, shades itself as it lifts and casts a shadow on the page underneath.
 *  - the indigo cover opens by itself when the whole notepad is on screen (or, if taller than the screen,
 *    when its top reaches the header) and the visitor has paused there for 650ms,
 *  - a click on the right half turns forward (cover > page 1 > page 2); a click on the left half turns back,
 *  - the page can be dragged with a finger or the mouse: it follows the pointer and either completes the
 *    turn (past 30% of the way, or on a quick flick) or falls back,
 *  - hovering the turn corner lifts the page slightly, inviting a turn,
 *  - once the notepad has left the screen completely it closes again, ready to open afresh,
 *  - the hidden page is aria-hidden + inert; keyboard users get focus moved to the new page's button.
 */
export default function useNotebook(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    const nb = root && root.querySelector('.tuc-nb');
    if (!nb) return undefined;
    const cover = nb.querySelector('.tuc-nb-cover');
    const p1 = nb.querySelector('.tuc-nb-p1');
    const p2 = nb.querySelector('.tuc-nb-p2');
    const stack = nb.querySelector('.tuc-nb-stack') || nb;
    const animated = !prefersReducedMotion() && typeof IntersectionObserver !== 'undefined';
    const timers = new Set();
    const later = (fn, ms) => {
      const t = setTimeout(() => { timers.delete(t); fn(); }, ms);
      timers.add(t);
      return t;
    };
    const cancel = (t) => { if (t) { clearTimeout(t); timers.delete(t); } return 0; };
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    // ---- leaves: build back faces and shade layers once; per-frame work is transform + opacity only
    const leaves = (animated && cover ? [cover, p1] : [p1]).filter(Boolean);
    const under = new Map([[cover, p1], [p1, p2]]);
    const st = new Map();
    const made = [];
    const shadeOf = (face, cls) => {
      const s = document.createElement('div');
      s.className = 'tuc-nb-shade ' + cls;
      s.setAttribute('aria-hidden', 'true');
      face.appendChild(s);
      made.push(s);
      return s;
    };
    [p1, p2, cover].forEach((leaf) => {
      if (!leaf) return;
      const face = leaf.firstElementChild;
      st.set(leaf, { deg: 0, tok: 0, front: null, back: null, cast: face ? shadeOf(face, 'nb-cast') : null });
    });
    leaves.forEach((leaf) => {
      const s = st.get(leaf);
      s.front = shadeOf(leaf.firstElementChild, 'nb-own');
      const b = document.createElement('div');
      b.className = 'tuc-nb-backface' + (leaf === cover ? ' is-cover' : '');
      b.setAttribute('aria-hidden', 'true');
      leaf.appendChild(b);
      made.push(b);
      s.back = shadeOf(b, 'nb-own nb-rev');
    });
    nb.classList.add('nb-3d');

    function paint(leaf, deg) {
      const s = st.get(leaf);
      s.deg = deg;
      leaf.style.transform = deg ? `rotateY(${deg.toFixed(2)}deg)` : '';
      leaf.style.visibility = deg <= -179.5 ? 'hidden' : '';
      const k = Math.sin((-deg / 180) * Math.PI);
      s.front.style.opacity = (k * 0.85).toFixed(3);
      s.back.style.opacity = (k * 0.85).toFixed(3);
      const u = under.get(leaf);
      if (u && st.get(u)) st.get(u).cast.style.opacity = (Math.max(0, k) * 0.6).toFixed(3);
    }
    const BASE_Z = new Map([[p2, 1], [p1, 2], [cover, 3]]);
    function settleZ(leaf) { leaf.style.zIndex = st.get(leaf).deg < -90 ? '0' : String(BASE_Z.get(leaf)); }
    function lift(leaf) { leaf.style.zIndex = String(20 + BASE_Z.get(leaf)); leaf.style.visibility = ''; }

    let busy = 0;
    function tween(leaf, to, dur, delay = 0) {
      return new Promise((res) => {
        const s = st.get(leaf);
        const my = ++s.tok;
        const from = s.deg;
        if (!animated || dur <= 0) { paint(leaf, to); settleZ(leaf); res(); return; }
        const t0 = performance.now() + delay;
        lift(leaf);
        const step = (now) => {
          if (s.tok !== my) { res(); return; }
          if (now < t0) { requestAnimationFrame(step); return; }
          const k = Math.min(1, (now - t0) / dur);
          paint(leaf, from + (to - from) * ease(k));
          if (k < 1) requestAnimationFrame(step); else { settleZ(leaf); res(); }
        };
        requestAnimationFrame(step);
      });
    }

    // ---- page state (0 = closed under the cover, 1 = page 1, 2 = page 2)
    let page = animated ? 0 : 1;
    let manualClosed = false;
    let timer = 0;
    let settle = 0;
    let raf = 0;
    let peekFrom = 0;
    let peekDeg = 0;

    let updateDock = () => {};
    let turnStart = () => {};
    let turnEnd = () => {};
    function setAria(n, focus) {
      nb.setAttribute('data-page', String(Math.max(1, n)));
      nb.classList.toggle('is-open', n >= 1);
      const on = n === 2 ? p2 : p1;
      const off = n === 2 ? p1 : p2;
      on.removeAttribute('aria-hidden');
      on.inert = false;
      off.setAttribute('aria-hidden', 'true');
      off.inert = true;
      if (cover) { cover.inert = n >= 1; if (n >= 1) cover.setAttribute('aria-hidden', 'true'); else cover.removeAttribute('aria-hidden'); }
      updateDock();
      if (focus) {
        const b = on.querySelector('.tuc-nb-turn');
        if (b) later(() => b.focus({ preventScroll: true }), DUR * 0.7);
      }
    }
    const targetOf = (leaf, n) => ((leaf === cover ? n >= 1 : n >= 2) ? -180 : 0);

    async function goTo(n, { focus = false, instant = false } = {}) {
      n = clamp(n, animated && cover ? 0 : 1, 2);
      if (n === page && !instant) return;
      const fwd = n > page;
      page = n;
      peekDeg = 0;
      nb.style.setProperty('--nb-peek', '0');
      nb.classList.remove('nb-lifted');
      peekFrom = window.scrollY;
      setAria(n, focus);
      const order = fwd ? leaves : [...leaves].reverse();
      const moving = order.filter((l) => st.get(l).deg !== targetOf(l, n));
      busy++;
      turnStart();
      await Promise.all(moving.map((l, k) => tween(l, targetOf(l, n), instant ? 0 : DUR * Math.max(0.35, Math.abs(targetOf(l, n) - st.get(l).deg) / 180), k * 150)));
      busy--;
      turnEnd();
    }
    if (animated && cover) { paint(cover, 0); settleZ(cover); }
    paint(p1, 0); settleZ(p1);
    setAria(page, false);
    if (!animated) nb.classList.add('is-open');

    // ---- clicks: right half forward, left half back; the turn buttons for keyboards
    let dragged = false;
    const onClick = (e) => {
      if (dragged) { dragged = false; return; }
      const b = e.target.closest('.tuc-nb-turn');
      if (b) { goTo(b.getAttribute('data-nb') === 'next' ? 2 : 1, { focus: e.detail === 0 }); return; }
      if (e.target.closest('a, button, input, select, textarea, label')) return;
      if (busy) return;
      const r = stack.getBoundingClientRect();
      const right = e.clientX >= r.left + r.width / 2;
      if (page === 0) { if (right) { timer = cancel(timer); manualClosed = false; goTo(1); } return; }
      if (page === 1) {
        if (right) goTo(2);
        else if (animated && cover) { manualClosed = true; goTo(0); }
      } else if (!right) goTo(1);
    };
    nb.addEventListener('click', onClick);

    // ---- cursor shows which way a click will turn; with a mouse the page edge lifts a little
    let hoverDir = '';
    const onMove = (e) => {
      if (drag && drag.on) return;
      const r = stack.getBoundingClientRect();
      const right = e.clientX >= r.left + r.width / 2;
      const dir = page === 0 ? (right ? 'next' : 'none') : page === 1 ? (right ? 'next' : animated && cover ? 'prev' : 'none') : (right ? 'none' : 'prev');
      stack.classList.toggle('nb-go-next', dir === 'next');
      stack.classList.toggle('nb-go-prev', dir === 'prev');
      stack.classList.toggle('nb-go-none', dir === 'none');
      if (e.pointerType === 'mouse' && animated && dir !== hoverDir) {
        hoverDir = dir;
        if (!busy && page === 0 && cover) tween(cover, dir === 'next' ? -7 : 0, 280);
      }
    };
    const onLeave = () => {
      hoverDir = '';
      if (animated && !busy && page === 0 && cover && st.get(cover).deg !== 0) tween(cover, 0, 280);
    };
    stack.addEventListener('pointermove', onMove);
    stack.addEventListener('pointerleave', onLeave);

    // corner hover on page 1: the page lifts slightly to invite a turn
    const nextBtn = p1.querySelector('.tuc-nb-turn[data-nb="next"]');
    const cornerIn = (e) => { if (e.pointerType === 'mouse' && animated && !busy && page === 1 && !peekDeg) tween(p1, -9, 260); };
    const cornerOut = (e) => { if (e.pointerType === 'mouse' && animated && !busy && page === 1 && !peekDeg) tween(p1, 0, 260); };
    if (nextBtn) { nextBtn.addEventListener('pointerenter', cornerIn); nextBtn.addEventListener('pointerleave', cornerOut); }

    // ---- drag / swipe: the page follows the pointer
    let drag = null;
    const onDown = (e) => {
      if (!animated || busy || e.button > 0 || e.target.closest('a, button, input, select, textarea, label')) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, on: false, lx: e.clientX, lt: performance.now(), v: 0, deg: 0, pr: 0 };
    };
    const onDragMove = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.on) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
        let leaf = null, dir = 0;
        if (dx < 0) { leaf = page === 0 ? cover : page === 1 ? p1 : null; dir = 1; }
        else { leaf = page === 2 ? p1 : page === 1 && cover ? cover : null; dir = -1; }
        if (!leaf) { drag = null; return; }
        drag.on = true; drag.leaf = leaf; drag.dir = dir; drag.sx = e.clientX; drag.start = st.get(leaf).deg;
        st.get(leaf).tok++; lift(leaf); timer = cancel(timer);
        try { stack.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
      }
      const now = performance.now(), span = stack.clientWidth * 0.95;
      drag.v = ((e.clientX - drag.lx) / Math.max(1, now - drag.lt)) * -drag.dir;
      drag.lx = e.clientX; drag.lt = now;
      drag.pr = clamp(((e.clientX - drag.sx) / span) * -drag.dir, 0, 1);
      const startPr = drag.dir === 1 ? -drag.start / 180 : 1 + drag.start / 180;
      const pr = clamp(startPr + drag.pr, 0, 1);
      drag.deg = drag.dir === 1 ? -pr * 180 : -180 + pr * 180;
      if (!drag.raf) drag.raf = requestAnimationFrame(() => { if (drag) { drag.raf = 0; paint(drag.leaf, drag.deg); } });
    };
    const onUp = async (e) => {
      const d = drag;
      drag = null;
      if (!d || !d.on || (e && e.pointerId !== d.id)) return;
      cancelAnimationFrame(d.raf);
      paint(d.leaf, d.deg);
      dragged = true; later(() => { dragged = false; }, 0);
      const commit = d.pr > 0.3 || d.v > 0.45;
      const from = page;
      const to = commit ? page + d.dir : page;
      if (commit && to === 0) manualClosed = true;
      if (commit) {
        page = to; peekDeg = 0; nb.style.setProperty('--nb-peek', '0'); peekFrom = window.scrollY; setAria(to, false);
      }
      const end = targetOf(d.leaf, commit ? to : from);
      busy++;
      turnStart();
      await tween(d.leaf, end, Math.max(240, (DUR * Math.abs(end - d.deg)) / 180));
      busy--;
      turnEnd();
    };
    stack.addEventListener('pointerdown', onDown);
    stack.addEventListener('pointermove', onDragMove);
    stack.addEventListener('pointerup', onUp);
    stack.addEventListener('pointercancel', onUp);

    // ---- controls under the notepad: counter, dots, previous / auto-play / next, progress, delay
    const dock = root.querySelector('.tuc-nb-dock');
    const minPage = animated && cover ? 0 : 1;
    const offDock = [];
    let auto = false;
    let hoverNb = false;
    let touching = false;
    let autoT = 0;
    let remaining = 4000;
    let delay = 4000;
    let started = 0;
    let stopAuto = () => {};
    let armAuto = () => {};
    let resumeAuto = () => {};
    let holdAuto = () => {};
    if (dock) {
      const pad = (v) => String(v).padStart(2, '0');
      const count = dock.querySelector('.tuc-nb-count');
      const dots = [...dock.querySelectorAll('.tuc-nb-dot')];
      const prevB = dock.querySelector('[data-act="prev"]');
      const nextB = dock.querySelector('[data-act="next"]');
      const playB = dock.querySelector('[data-act="play"]');
      const playTx = dock.querySelector('.tuc-nb-playtx');
      const track = dock.querySelector('.tuc-nb-track');
      const bar = dock.querySelector('.tuc-nb-bar');
      const chips = [...dock.querySelectorAll('.tuc-nb-chip')];
      const total = 3 - minPage;
      if (minPage === 1 && dots[0]) dots[0].hidden = true;
      updateDock = () => {
        const i = page - minPage;
        count.innerHTML = `${pad(i + 1)} <span>/ ${pad(total)}</span>`;
        dots.forEach((d, k) => d.setAttribute('aria-current', String(k === page)));
        prevB.disabled = page <= minPage;
        const last = page >= 2;
        nextB.setAttribute('aria-label', last ? 'Start over' : 'Next page');
      };
      const on = (el, ev, fn, opt) => { if (!el) return; el.addEventListener(ev, fn, opt); offDock.push(() => el.removeEventListener(ev, fn, opt)); };
      const goNext = () => { if (page >= 2) { if (minPage === 0) manualClosed = true; return goTo(minPage); } return goTo(page + 1); };
      const goPrev = () => goTo(page - 1);
      const userTurn = (fn) => () => { if (busy) return; timer = cancel(timer); if (fn === goPrev && page === 1 && minPage === 0) manualClosed = true; fn(); };
      on(prevB, 'click', userTurn(goPrev));
      on(nextB, 'click', userTurn(goNext));
      dots.forEach((d) => on(d, 'click', () => { if (busy) return; timer = cancel(timer); const n = +d.getAttribute('data-go'); if (n === 0) manualClosed = true; goTo(n); }));
      // auto-play: turns every few seconds, pauses while hovered, touched or turning, and starts over at the end
      const barRun = (state) => { bar.style.animationPlayState = state; };
      stopAuto = () => { clearTimeout(autoT); autoT = 0; bar.style.animation = 'none'; };
      resumeAuto = () => {
        if (!auto || hoverNb || touching || busy || autoT || document.hidden) return;
        started = performance.now();
        barRun('running');
        autoT = setTimeout(() => { autoT = 0; goNext(); }, remaining);
      };
      armAuto = () => {
        clearTimeout(autoT); autoT = 0; remaining = delay;
        bar.style.animation = 'none'; void bar.offsetWidth;
        bar.style.animation = `tucNbFill ${delay}ms linear forwards paused`;
        resumeAuto();
      };
      holdAuto = () => {
        barRun('paused');
        if (!autoT) return;
        clearTimeout(autoT); autoT = 0;
        remaining = Math.max(0, remaining - (performance.now() - started));
      };
      const setAuto = (v) => {
        auto = v;
        playB.setAttribute('aria-pressed', String(v));
        playTx.textContent = v ? 'Pause' : 'Auto-play';
        track.classList.toggle('on', v);
        if (v) { timer = cancel(timer); manualClosed = false; armAuto(); } else stopAuto();
      };
      on(playB, 'click', () => setAuto(!auto));
      chips.forEach((c) => on(c, 'click', () => {
        delay = +c.getAttribute('data-d');
        chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
        if (auto && !busy) armAuto();
      }));
      turnStart = () => { if (auto) { clearTimeout(autoT); autoT = 0; bar.style.animation = 'none'; } };
      turnEnd = () => { if (auto && !busy) armAuto(); };
      on(nb, 'pointerenter', (e) => { if (e.pointerType === 'mouse') { hoverNb = true; holdAuto(); } });
      on(nb, 'pointerleave', (e) => { if (e.pointerType === 'mouse') { hoverNb = false; resumeAuto(); } });
      on(stack, 'pointerdown', () => { touching = true; holdAuto(); });
      const up = () => { if (touching) { touching = false; resumeAuto(); } };
      on(window, 'pointerup', up);
      on(window, 'pointercancel', up);
      on(document, 'visibilitychange', () => (document.hidden ? holdAuto() : resumeAuto()));
      // arrow keys while focus is in the notepad or its controls
      const onKey = (e) => {
        if (!nb.contains(document.activeElement) && !dock.contains(document.activeElement)) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); userTurn(goNext)(); }
        else if (e.key === 'ArrowLeft' && page > minPage) { e.preventDefault(); userTurn(goPrev)(); }
      };
      on(document, 'keydown', onKey);
      stopAuto.setAuto = setAuto;
      updateDock();
    }

    const cleanupBase = () => {
      offDock.forEach((fn) => fn());
      clearTimeout(autoT);
      nb.removeEventListener('click', onClick);
      stack.removeEventListener('pointermove', onMove);
      stack.removeEventListener('pointerleave', onLeave);
      stack.removeEventListener('pointerdown', onDown);
      stack.removeEventListener('pointermove', onDragMove);
      stack.removeEventListener('pointerup', onUp);
      stack.removeEventListener('pointercancel', onUp);
      if (nextBtn) { nextBtn.removeEventListener('pointerenter', cornerIn); nextBtn.removeEventListener('pointerleave', cornerOut); }
      timers.forEach(clearTimeout);
      timers.clear();
      made.forEach((m) => m.remove());
      [cover, p1, p2].forEach((l) => { if (l) { l.style.transform = ''; l.style.visibility = ''; l.style.zIndex = ''; } });
      nb.classList.remove('nb-3d');
    };
    if (!animated) return cleanupBase;
    nb.classList.add('nb-ready');

    function headTop() {
      const hd = document.querySelector('.tuc-head');
      return hd ? Math.max(0, hd.getBoundingClientRect().bottom) : 0;
    }
    function fully() {
      const r = nb.getBoundingClientRect();
      const vh = window.innerHeight;
      const top = headTop();
      if (r.height <= vh - top - 24) return r.top >= top - 40 && r.bottom <= vh + 2;
      return r.top <= top + 40 && r.top >= top - 160;
    }
    function gone() {
      const r = nb.getBoundingClientRect();
      return r.bottom < headTop() || r.top > window.innerHeight;
    }
    function check() {
      raf = 0;
      if (page >= 1 || manualClosed) {
        if (gone()) { if (auto && stopAuto.setAuto) stopAuto.setAuto(false); if (page >= 1) goTo(0, { instant: true }); manualClosed = false; }
        return;
      }
      if (fully()) {
        if (!timer) timer = later(() => { timer = 0; if (page === 0 && !manualClosed && fully()) goTo(1); }, 650);
      } else {
        timer = cancel(timer);
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    check();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
      cleanupBase();
    };
  }, [rootRef]);
}
