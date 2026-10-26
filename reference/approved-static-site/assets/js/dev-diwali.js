/* dev-diwali page: interactive components */
class DCLogic { constructor(){ this.props = {}; this.state = null; } setState(p){ this.state = Object.assign({}, this.state || {}, typeof p === 'function' ? p(this.state) : p); scheduleRender(); } forceUpdate(){ scheduleRender(); } }
let __pending = false; function scheduleRender(){ if (__pending) return; __pending = true; requestAnimationFrame(() => { __pending = false; render(); }); }
class Component extends DCLogic {
componentWillUnmount() { if (this.io) this.io.disconnect(); if (this.onScr) { window.removeEventListener('scroll', this.onScr); window.removeEventListener('resize', this.onScr); } if (this.stRO) this.stRO.disconnect(); }
initScrollStage(el) {
if (!el || this.stage === el) return;
this.stage = el;
const pin = el.querySelector('.tuc-pin'), wrap = el.querySelector('.tuc-sheetwrap'), sheet = wrap && wrap.firstElementChild, ink = el.querySelector('.tuc-ink'), seal = el.querySelector('.tuc-seal'), ribbon = el.querySelector('.tuc-ribbon');
if (!pin || !wrap || !sheet) return;
let full = 0, H = 0, top = 0, runway = 0, cur = 0, target = 0, raf = 0;
const clamp = (v) => Math.max(0, Math.min(1, v));
const measure = () => {
const vh = window.innerHeight || 800;
full = sheet.scrollHeight || sheet.offsetHeight; H = full + 48;
const hd = document.querySelector('.tuc-hdr'), sm = window.innerWidth <= 700, mat = sm ? 12 : 22; const hb = (sm || !hd) ? mat + 6 : mat + hd.offsetHeight + 10; top = Math.max(hb, (vh - H) / 2); runway = Math.round(vh * 1.35);
pin.style.height = H + 'px'; pin.style.top = top + 'px'; el.style.height = (H + runway) + 'px';
apply(cur);
};
const apply = (p) => {
const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
const h = full * e;
wrap.style.height = h.toFixed(1) + 'px';
sheet.style.transform = 'translateY(' + (-(full - h) / 2).toFixed(1) + 'px)';
if (ink) ink.style.opacity = clamp((p - 0.06) / 0.4).toFixed(3);
const so = clamp(1 - p * 5);
if (seal) { seal.style.opacity = so.toFixed(3); seal.style.transform = 'translate(-50%,-50%) scale(' + (0.85 + 0.15 * so).toFixed(3) + ')'; }
if (ribbon) ribbon.style.opacity = so.toFixed(3);
};
const read = () => {
const vh = window.innerHeight || 800;
const rc = el.getBoundingClientRect(), pr = pin.getBoundingClientRect();
const opening = clamp((top - rc.top) / (runway * 0.75));
const closing = clamp((pr.bottom - vh * 0.06) / (vh * 0.45));
target = Math.min(opening, closing);
};
const tick = () => { raf = 0; read(); cur += (target - cur) * 0.14; if (Math.abs(target - cur) < 0.002) cur = target; apply(cur); if (cur !== target) raf = requestAnimationFrame(tick); };
this.onScr = () => { if (!raf) raf = requestAnimationFrame(tick); };
window.addEventListener('scroll', this.onScr, { passive: true }); window.addEventListener('resize', () => { measure(); this.onScr(); });
if (typeof ResizeObserver !== 'undefined' && ink) { this.stRO = new ResizeObserver(() => measure()); this.stRO.observe(ink); }
measure(); read(); cur = target; apply(cur);
setTimeout(() => { measure(); this.onScr(); }, 500); setTimeout(() => { measure(); this.onScr(); }, 1500);
}
renderVals() {
return {
dlOn: this.state && this.state.on ? 'is-on' : '',
scrollCls: this.state && this.state.scroll ? 'is-open' : '',
scrollExpanded: this.state && this.state.scroll ? 'true' : 'false',
setScrollStage: (el) => this.initScrollStage(el),
setDl: (el) => { if (!el || this.io) return; if (typeof IntersectionObserver === 'undefined') { this.setState({ on: true }); return; } this.io = new IntersectionObserver((es) => { const v = es.some((e) => e.isIntersecting); if (!this.state || this.state.on !== v) this.setState({ on: v }); }, { threshold: 0.6 }); this.io.observe(el); }
};
}
}
const comp = new Component();
let wired = false;
function render(){
  const v = comp.renderVals();
  const el = document.getElementById('tuc-dl');
  if (el) el.classList.toggle('is-on', v.dlOn === 'is-on');
  document.querySelectorAll('[data-scroll]').forEach(x => x.classList.toggle('is-open', v.scrollCls === 'is-open'));
  if (!wired) { wired = true; if (el) v.setDl(el); v.setScrollStage(document.getElementById('tuc-scroll-stage')); }
}
render();
if (comp.componentDidMount) comp.componentDidMount();
