// Comportamento de apresentação. As regras analíticas permanecem em app.js.
(() => {
 const sidebar = document.querySelector('.sidebar');
 const toggle = document.getElementById('menu-toggle');
 const mobile = matchMedia('(max-width: 900px)');
 const main = document.getElementById('main');
 const summary = document.getElementById('persistent-summary');
 let summaryObserver;

 function closeMenu(returnFocus = false) {
  sidebar.removeAttribute('data-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir navegação');
  if (returnFocus) toggle.focus();
 }
 toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  sidebar.toggleAttribute('data-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar navegação' : 'Abrir navegação');
  if (open) sidebar.querySelector('[data-tab]').focus({ preventScroll: true });
 });
 document.querySelectorAll('[data-tab]').forEach(button => {
  button.addEventListener('click', () => {
   const wasMobile = mobile.matches;
   closeMenu();
   if (wasMobile) main.focus({ preventScroll: true });
   main.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
 });
 document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && sidebar.hasAttribute('data-open')) closeMenu(true);
 });
 mobile.addEventListener('change', () => { closeMenu(); observeKpis(); });

 function observeKpis() {
  summaryObserver?.disconnect();
  summary.hidden = true;
  const kpis = document.querySelector('.kpis');
  if (!kpis || mobile.matches) return;
  summaryObserver = new IntersectionObserver(([entry]) => {
   summary.hidden = entry.isIntersecting || entry.boundingClientRect.bottom > 0;
  });
  summaryObserver.observe(kpis);
 }
 new MutationObserver(observeKpis).observe(document.getElementById('content'), { childList: true });
 observeKpis();
})();
