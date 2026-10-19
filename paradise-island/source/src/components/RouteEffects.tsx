import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { scrollToSection } from './navigation';
import { decodeAnchor } from './anchor.mjs';
export function RouteEffects() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const titles: Record<string, string> = { '/': 'Um outro ritmo', '/ilha': 'Explore a ilha', '/acomodacoes': 'Acomodações', '/experiencias': 'Experiências', '/gastronomia': 'Gastronomia', '/galeria': 'Galeria', '/reservas': 'Planejar estadia' };
  const title = `${titles[location.pathname] || (location.pathname.startsWith('/acomodacoes/') ? 'Seu refúgio particular' : 'Página não encontrada')} — Paradise Island`;
  useEffect(() => {
    document.title = title;
    const descriptions: Record<string, string> = { '/': 'Uma ilha, outro ritmo. Explore as acomodações e experiências do Paradise Island, um resort fictício.', '/ilha': 'Explore os ambientes do Paradise Island em uma vista aérea ilustrativa e descubra hospedagem, mar, spa e gastronomia.', '/acomodacoes': 'Conheça os bangalôs e villas privativas do resort fictício Paradise Island.', '/experiencias': 'Bem-estar, atividades náuticas, praia, piscina e celebrações: conheça as experiências do Paradise Island.', '/gastronomia': 'Alta culinária, frutos do mar e menu degustação em uma atmosfera pé na areia.', '/galeria': 'Explore as imagens ilustrativas do Paradise Island por ambiente.', '/reservas': 'Organize suas preferências de estadia em uma consulta local demonstrativa, sem envio de dados.' };
    document.querySelector('meta[name="description"]')?.setAttribute('content', descriptions[location.pathname] || 'Paradise Island — experiência de portfólio de um resort fictício.');
    const timeout = window.setTimeout(() => {
      const hash = decodeAnchor(location.hash);
      const target = hash ? document.getElementById(hash) : null;
      if (target) scrollToSection(target, navigationType !== 'POP');
      else if (navigationType !== 'POP') { window.scrollTo({ top: 0, behavior: 'instant' }); document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true }); }
    }, 20);
    return () => clearTimeout(timeout);
  }, [location.key, location.pathname, location.hash, navigationType]);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }); }, { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(el => { if (!reduced.matches) el.classList.add('reveal-ready'); observer.observe(el); });
    const revealAll = () => { if (reduced.matches) document.querySelectorAll('.reveal-ready').forEach(el => el.classList.add('visible')); };
    reduced.addEventListener('change', revealAll);
    return () => { observer.disconnect(); reduced.removeEventListener('change', revealAll); };
  }, [location.pathname]);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const photos = document.querySelectorAll<HTMLElement>(
      '.island-editorial-photo, .stay-photo, .experience-image, .pool-photo, .gallery-teaser>a'
    );
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('photo-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    photos.forEach(photo => {
      photo.classList.add('photo-reveal-ready');
      observer.observe(photo);
    });
    // Keyboard navigation must never leave a focused photo hidden.
    const revealFocused = (event: FocusEvent) => {
      const photo = (event.target as Element)?.closest('.photo-reveal-ready');
      if (photo) { photo.classList.add('photo-revealed'); observer.unobserve(photo); }
    };
    const revealAll = () => {
      if (reduced.matches || document.body.dataset.motionPaused === 'true') {
        photos.forEach(photo => { photo.classList.add('photo-revealed'); observer.unobserve(photo); });
      }
    };
    const pauseObserver = new MutationObserver(revealAll);
    pauseObserver.observe(document.body, { attributes: true, attributeFilter: ['data-motion-paused'] });
    reduced.addEventListener('change', revealAll);
    document.addEventListener('focusin', revealFocused);
    revealAll();
    return () => {
      observer.disconnect(); pauseObserver.disconnect();
      reduced.removeEventListener('change', revealAll);
      document.removeEventListener('focusin', revealFocused);
    };
  }, [location.pathname]);
  return <div className="sr-only" aria-live="polite" aria-atomic="true" key={location.pathname}>{location.pathname === '/' ? 'Início' : title}</div>;
}
