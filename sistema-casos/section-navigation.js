// Only allowlisted section/step names belong in the URL or history state.
const names = { list: 'casos', form: 'cadastro', agenda: 'agenda', tasks: 'pendencias' };
export function readSectionRoute(hash) {
  const match = /^#(casos|cadastro|agenda|pendencias)(?:\/etapa-([1-8]))?$/.exec(hash);
  const view = match ? Object.keys(names).find(key => names[key] === match[1]) : 'list';
  return { view, step: view === 'form' ? Number(match?.[2] || 1) : 1 };
}
export function setupSectionNavigation({ apply, isVisible }) {
  const scope = crypto.randomUUID();
  let index = 0, reverting = false;
  let current = readSectionRoute(location.hash);
  const url = route => `${location.pathname}#${names[route.view]}${route.view === 'form' ? '/etapa-' + route.step : ''}`;
  const state = () => ({ nexoNavigation: scope, index });
  function write(route, replace = false) {
    current = route;
    if (!replace) index++;
    history[replace ? 'replaceState' : 'pushState'](state(), '', url(route));
  }
  write(current, true);
  window.addEventListener('popstate', event => {
    if (reverting) { reverting = false; return; }
    const target = readSectionRoute(location.hash);
    const knownEntry = event.state?.nexoNavigation === scope;
    const targetIndex = knownEntry ? event.state.index : index + 1;
    if (isVisible() && apply(target) === false) {
      if (knownEntry && targetIndex !== index) {
        reverting = true;
        history.go(index - targetIndex);
      } else history.replaceState(state(), '', url(current));
      return;
    }
    index = targetIndex;
    write(target, true);
  });
  return {
    enter() { current = readSectionRoute(location.hash); apply(current, true); write(current, true); },
    update(view, step = 1, replace = false) {
      if (!isVisible()) return;
      const next = { view, step: view === 'form' ? step : 1 };
      if (next.view === current.view && next.step === current.step) return;
      write(next, replace);
    }
  };
}
