/* Native HTML interactions; React Bits shader adapters are loaded only when needed. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const mobileMenu = matchMedia('(max-width: 960px)');
  const menu = document.querySelector('#main-navigation');
  const menuToggle = document.querySelector('.menu-toggle');

  const setMenu = open => {
    menu.hidden = mobileMenu.matches && !open;
    menuToggle.setAttribute('aria-expanded', String(open));
  };
  const adaptMenu = () => { menuToggle.hidden = !mobileMenu.matches; setMenu(false); };
  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  mobileMenu.addEventListener('change', adaptMenu);
  menu.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || !mobileMenu.matches) return;
    setMenu(false);
    const heading = document.querySelector(link.hash)?.querySelector('h2');
    if (heading) { heading.setAttribute('tabindex','-1'); heading.focus({preventScroll:true}); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileMenu.matches && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false); menuToggle.focus();
    }
  });
  adaptMenu();

  const projects = [...document.querySelectorAll('[data-project]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  document.querySelector('.projects-toolbar').hidden = false;
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    let count = 0;
    projects.forEach(project => {
      const show = button.dataset.filter === 'all' || project.dataset.category === button.dataset.filter;
      project.hidden = !show;
      if (show) count++;
    });
    document.querySelector('.supporting-projects').hidden = !projects.some(project => project.classList.contains('project-card') && !project.hidden);
    document.querySelector('#project-count').textContent = `${count} ${count === 1 ? 'projeto' : 'projetos'}`;
  }));

  document.querySelectorAll('.material-folder').forEach(folder => {
    folder.addEventListener('toggle', () => {
      const label = folder.querySelector('.folder-action');
      label.firstChild.textContent = folder.open ? 'Fechar pasta ' : 'Abrir pasta ';
    });
  });

  // SplitText rise: same staggered character entrance, using the native Animation API.
  const name = document.querySelector('#nome');
  let index = 0;
  const splitNode = node => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        [...child.textContent].forEach(char => {
          if (/\s/.test(char)) { fragment.append(document.createTextNode(char)); return; }
          const part = document.createElement('span');
          part.className = 'split-char'; part.textContent = char;
          part.setAttribute('aria-hidden','true'); part.dataset.order = String(index++);
          fragment.append(part);
        });
        child.replaceWith(fragment);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') splitNode(child);
    });
  };
  splitNode(name);
  let nameAnimations = [];
  let userEnabled = true;
  try { userEnabled = localStorage.getItem('caique-effects') !== 'off'; } catch {}
  const effectsToggle = document.querySelector('#effects-toggle');
  const replay = document.querySelector('#replay-name');
  const controls = document.querySelector('.effects-controls');
  const glow = document.querySelector('.glow-cursor');
  let glowCleanup;
  const enabled = () => userEnabled && !reduced.matches;
  const animateName = () => {
    nameAnimations.forEach(animation => animation.cancel()); nameAnimations = [];
    if (!enabled() || typeof name.animate !== 'function') return;
    nameAnimations = [...name.querySelectorAll('.split-char')].map(part => part.animate([
      {opacity:0, transform:'translate3d(0,40px,0)'},
      {opacity:1, transform:'translate3d(0,0,0)'}
    ], {duration:850, delay:Number(part.dataset.order)*55, easing:'cubic-bezier(.16,1,.3,1)', fill:'backwards'}));
  };
  replay.addEventListener('click', animateName);

  const fallbackGlow = () => {
    const orb = document.createElement('span'); orb.className = 'cursor-orb'; glow.append(orb);
    let frame = 0, x = 0, y = 0;
    const move = event => {
      x = event.clientX; y = event.clientY;
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0; orb.style.transform = `translate3d(${x}px,${y}px,0)`; orb.style.opacity = '1';
      });
    };
    const leave = () => { orb.style.opacity = '0'; };
    window.addEventListener('pointermove',move,{passive:true});
    document.documentElement.addEventListener('pointerleave',leave);
    glow.dataset.renderer = 'css';
    return () => { cancelAnimationFrame(frame); window.removeEventListener('pointermove',move); document.documentElement.removeEventListener('pointerleave',leave); orb.remove(); };
  };
  const updateEffects = () => {
    glowCleanup?.(); glowCleanup = null;
    document.documentElement.classList.toggle('effects-paused', !enabled());
    document.dispatchEvent(new CustomEvent('portfolio-effectschange', {detail:{enabled:enabled()}}));
    controls.hidden = false;
    effectsToggle.setAttribute('aria-pressed', String(enabled()));
    effectsToggle.firstChild.textContent = reduced.matches ? 'Movimento reduzido ' : enabled() ? 'Efeitos ligados ' : 'Efeitos pausados ';
    effectsToggle.disabled = reduced.matches; replay.disabled = !enabled();
    if (!enabled()) { nameAnimations.forEach(animation => animation.cancel()); glow.hidden = true; return; }
    if (!finePointer.matches) { glow.hidden = true; return; }
    glow.hidden = false;
    try {
      glowCleanup = window.PortfolioEffects?.createGlowCursor(glow, {color:'#d2d2d6',secondaryColor:'#d2d2d6'});
      if (glowCleanup) glow.dataset.renderer = 'webgl';
      else glowCleanup = fallbackGlow();
    } catch { glowCleanup = fallbackGlow(); }

  };
  effectsToggle.addEventListener('click', () => {
    userEnabled = !userEnabled;
    try { localStorage.setItem('caique-effects', userEnabled ? 'on' : 'off'); } catch {}
    updateEffects();
  });
  reduced.addEventListener('change',updateEffects);
  finePointer.addEventListener('change',updateEffects);
  animateName(); updateEffects();
  window.addEventListener('pagehide', () => { glowCleanup?.(); });
  window.addEventListener('pageshow', event => { if (event.persisted) updateEffects(); });
})();
