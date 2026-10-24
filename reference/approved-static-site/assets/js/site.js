/* Unfound Chapter: shared behaviour (sticky header state, star orbit on hover) */
(function(){var r=document.documentElement,last=0,c=null;function f(){var y=window.scrollY||0,s=y>40;if(s!==c){var first=c===null;c=s;r.classList.toggle('tuc-scrolled',s);if(!first)setTimeout(function(){window.dispatchEvent(new Event('resize'))},380);}r.classList.toggle('tuc-hide',y>160&&y>last+2?true:(y<last-2||y<=160)?false:r.classList.contains('tuc-hide'));last=y;}window.addEventListener('scroll',f,{passive:true});f();})();

(function(){
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
var NS='http://www.w3.org/2000/svg', STAR='M0.15 -8.75 L2.24 -2.31 L9.23 -1.82 L3.85 2.08 L5.84 8.77 L-0.15 5.20 L-5.59 8.52 L-3.85 2.38 L-9.33 -2.02 L-2.29 -2.31Z', BM='M-1.55 -2.7H1.55V2.9L0 1.75L-1.55 2.9Z';
function eligible(el){
  if (el.closest('.tuc-logo') || el.dataset.tucOrbit === 'off') return false;
  var r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.width < 520 && r.height < 90;
}
function orbit(el){
  if (el._tucOrbiting) return; el._tucOrbiting = true;
  var inHead = !!el.closest('.tuc-hdr,.tuc-head');
  var pad = 7, dur = 1100, t0 = 0;
  var onDark = !!el.closest('.tuc-priv,.tuc-foot,.tuc-hdr,.tuc-dlband,.tuc-journal');
  var col = '#B89B65';
  var svg = document.createElementNS(NS,'svg');
  svg.setAttribute('aria-hidden','true');
  svg.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:9996;overflow:visible;transition:opacity .5s ease';
  var trace = document.createElementNS(NS,'rect');
  trace.setAttribute('fill','none'); trace.setAttribute('stroke',col); trace.setAttribute('stroke-width','0.8');
  trace.setAttribute('stroke-opacity', onDark ? '0.8' : '0.65');
  var star = document.createElementNS(NS,'g');
  star.innerHTML = '<path d="'+STAR+'" fill="none" stroke="'+col+'" stroke-width="1.6" stroke-linejoin="round"></path><path d="'+BM+'" fill="'+col+'"></path>';
  svg.appendChild(trace); svg.appendChild(star); document.body.appendChild(svg);
  function frame(ts){
    if (!t0) t0 = ts;
    var p = Math.min(1, (ts - t0) / dur), e = p < .5 ? 2*p*p : 1 - Math.pow(-2*p+2,2)/2;
    var r = el.getBoundingClientRect(), w = r.width + pad*2, h = r.height + pad*2;
    var rad = Math.min(h/2, (parseFloat(getComputedStyle(el).borderTopLeftRadius)||0) + pad, 16);
    svg.setAttribute('width', w + 20); svg.setAttribute('height', h + 20);
    svg.style.transform = 'translate(' + (r.left - pad - 10) + 'px,' + (r.top - pad - 10) + 'px)';
    var hd = document.querySelector('.tuc-hdr') || document.querySelector('.tuc-head');
    var cut = inHead || !hd ? 0 : Math.max(0, hd.getBoundingClientRect().bottom - (r.top - pad - 10));
    svg.style.clipPath = cut > 0 ? 'inset(' + cut + 'px 0 0 0)' : 'none';
    trace.setAttribute('x',10); trace.setAttribute('y',10); trace.setAttribute('width',w); trace.setAttribute('height',h);
    trace.setAttribute('rx',rad); trace.setAttribute('ry',rad);
    var L = 2*(w - 2*rad) + 2*(h - 2*rad) + 2*Math.PI*rad;
    trace.setAttribute('stroke-dasharray', L); trace.setAttribute('stroke-dashoffset', L*(1-e));
    // star position along the rounded rect, starting top centre, clockwise
    var d = (e * L + (w/2 - rad)) % L, x, y, sx = w - 2*rad, sy = h - 2*rad, q = Math.PI*rad/2;
    var segs = [sx, q, sy, q, sx, q, sy, q], k = 0;
    while (k < 7 && d > segs[k]) { d -= segs[k]; k++; }
    var a;
    if (k === 0) { x = rad + d; y = 0; }
    else if (k === 1) { a = -Math.PI/2 + d/rad; x = w - rad + rad*Math.cos(a); y = rad + rad*Math.sin(a); }
    else if (k === 2) { x = w; y = rad + d; }
    else if (k === 3) { a = d/rad; x = w - rad + rad*Math.cos(a); y = h - rad + rad*Math.sin(a); }
    else if (k === 4) { x = w - rad - d; y = h; }
    else if (k === 5) { a = Math.PI/2 + d/rad; x = rad + rad*Math.cos(a); y = h - rad + rad*Math.sin(a); }
    else if (k === 6) { x = 0; y = h - rad - d; }
    else { a = Math.PI + d/rad; x = rad + rad*Math.cos(a); y = rad + rad*Math.sin(a); }
    star.setAttribute('transform','translate(' + (x + 10) + ' ' + (y + 10) + ') rotate(' + (e*360) + ') scale(0.62)');
    if (p < 1) requestAnimationFrame(frame);
    else { svg.style.opacity = '0'; setTimeout(function(){ svg.remove(); el._tucOrbiting = false; }, 520); }
  }
  requestAnimationFrame(frame);
}
// mouse / trackpad: orbit on hover. Touch and pen: orbit once on tap, as feedback (no fake hover).
document.addEventListener('pointerover', function(ev){
  if (ev.pointerType && ev.pointerType !== 'mouse') return;
  var el = ev.target.closest && ev.target.closest('a,button');
  if (!el || (ev.relatedTarget && el.contains(ev.relatedTarget))) return;
  if (eligible(el)) orbit(el);
});
document.addEventListener('focusin', function(ev){
  var el = ev.target.closest && ev.target.closest('a,button');
  if (el && el.matches(':focus-visible') && eligible(el)) orbit(el);
});
document.addEventListener('pointerdown', function(ev){
  if (ev.pointerType === 'mouse') return;
  var el = ev.target.closest && ev.target.closest('a,button');
  if (el && eligible(el)) orbit(el);
}, { passive: true });
})();

(function(){
/**
 * Phone menu: the two-line button on the left of the header opens a panel that slides in from the left
 * with every header link. Esc, the close button, the backdrop or choosing a link closes it; focus stays
 * inside while open and returns to the button. Returns a cleanup function.
 */
function initMobileMenu() {
  if (typeof document === 'undefined') return () => {};
  const btn = document.querySelector('.tuc-menu-btn');
  const head = btn && btn.closest('.tuc-head');
  if (!btn || !head) return () => {};
  const menu = document.createElement('div');
  menu.id = 'tuc-menu';
  menu.className = 'tuc-menu';
  menu.hidden = true;
  menu.innerHTML = '<div class="tuc-menu-scrim" data-close></div>'
    + '<nav class="tuc-menu-panel" role="dialog" aria-modal="true" aria-label="Menu">'
    + '<button type="button" class="tuc-menu-close" aria-label="Close menu" data-close data-tuc-orbit="off">'
    + '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 3l12 12M15 3L3 15" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></button>'
    + '<ul class="tuc-menu-list"></ul>'
    + '<p class="tuc-menu-foot">Unfound Chapter</p></nav>';
  const list = menu.querySelector('.tuc-menu-list');
  head.querySelectorAll('.tuc-nav-l a, .tuc-nav-r a').forEach((a) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    if (a === document.querySelector('.tuc-nav-r a:last-child')) link.className = 'is-cta';
    li.appendChild(link);
    list.appendChild(li);
  });
  document.body.appendChild(menu);
  const panel = menu.querySelector('.tuc-menu-panel');
  let timer = 0;
  const focusables = () => Array.from(panel.querySelectorAll('a, button'));

  function open() {
    clearTimeout(timer);
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    document.documentElement.classList.add('tuc-menu-lock');
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    const first = list.querySelector('a');
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 60);
  }
  function close(restoreFocus) {
    if (menu.hidden) return;
    menu.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    document.documentElement.classList.remove('tuc-menu-lock');
    timer = setTimeout(() => { menu.hidden = true; }, 360);
    if (restoreFocus) btn.focus({ preventScroll: true });
  }
  const onBtn = () => (menu.hidden ? open() : close(true));
  const onMenuClick = (e) => {
    if (e.target.closest('[data-close]')) close(true);
    else if (e.target.closest('a')) close(false);
  };
  const onKey = (e) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
    if (e.key === 'Tab') {
      const f = focusables();
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  };
  const mq = window.matchMedia('(max-width: 700px)');
  const onMq = () => { if (!mq.matches) close(false); };
  btn.addEventListener('click', onBtn);
  menu.addEventListener('click', onMenuClick);
  document.addEventListener('keydown', onKey);
  if (mq.addEventListener) mq.addEventListener('change', onMq);
  return () => {
    clearTimeout(timer);
    btn.removeEventListener('click', onBtn);
    menu.removeEventListener('click', onMenuClick);
    document.removeEventListener('keydown', onKey);
    if (mq.removeEventListener) mq.removeEventListener('change', onMq);
    document.documentElement.classList.remove('tuc-menu-lock');
    menu.remove();
  };
}

initMobileMenu();
})();
