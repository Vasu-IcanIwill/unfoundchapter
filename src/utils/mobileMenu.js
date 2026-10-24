/**
 * Phone menu: the two-line button on the left of the header opens a panel that slides in from the left
 * with every header link. Esc, the close button, the backdrop or choosing a link closes it; focus stays
 * inside while open and returns to the button. Returns a cleanup function.
 */
export function initMobileMenu() {
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
