export const homeSections: Record<string, string> = {
  '/': 'inicio', '/ilha': 'ilha', '/acomodacoes': 'acomodacoes',
  '/experiencias': 'experiencias', '/gastronomia': 'gastronomia', '/galeria': 'galeria',
};

export function scrollToSection(target: HTMLElement, smooth = true) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.dataset.motionPaused === 'true';
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: 'start', behavior: smooth && !reduced ? 'smooth' : 'instant' });
}
