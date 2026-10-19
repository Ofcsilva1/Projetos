import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Media } from './Media';
import { Modal } from './Modal';
import { Arrow, DrawCircle, Eyebrow } from './Primitives';
import { nav, type ImageId } from '../data/content';
import SpecularButton from './references/SpecularButton';
import { FictionalLogoLoop } from './AnimatedShowcases';
import { useMotionSettings } from './MotionSettings';
import { homeSections, scrollToSection } from './navigation';

export function Brand() {
  return <span className="brand"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 39V15m0 0Q10 0 5 19q10-6 19-4m0 0Q38-1 44 18q-12-4-20-3m0 0Q10 10 9 29m15-14q14-4 15 13M12 40h24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg><span>PARADISE ISLAND<small>RESORT & RETREAT</small></span></span>;
}

export function Layout() {
  const [menu, setMenu] = useState(false);
  const [preview, setPreview] = useState<ImageId>('aerea');
  const [scrolled, setScrolled] = useState(false);
  const [homeActive, setHomeActive] = useState('/');
  const headerRef = useRef<HTMLElement>(null);
  const { paused, stopped, toggle } = useMotionSettings();
  const location = useLocation();
  const navigation = [{ href: '/', label: 'Início' }, ...nav];
  const active = location.pathname === '/' ? homeActive : location.pathname.startsWith('/acomodacoes') ? '/acomodacoes' : location.pathname;
  const top = () => { const target = document.getElementById(location.pathname === '/' ? 'inicio' : 'conteudo'); if (target) scrollToSection(target); };
  const destination = (path: string) => location.pathname === '/' && homeSections[path] ? { pathname: '/', hash: `#${homeSections[path]}` } : path;
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const observer = new ResizeObserver(() => document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`));
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (location.pathname !== '/') return;
    const update = () => {
      const offset = (headerRef.current?.getBoundingClientRect().height || 90) + 80;
      let current = '/';
      Object.entries(homeSections).forEach(([path, id]) => { const section = document.getElementById(id); if (section && section.getBoundingClientRect().top <= offset) current = path; });
      setHomeActive(current);
    };
    update(); window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [location.pathname]);
  useEffect(() => { const scroll = () => setScrolled(window.scrollY > 350); scroll(); window.addEventListener('scroll', scroll, { passive: true }); return () => window.removeEventListener('scroll', scroll); }, []);
  useEffect(() => { setMenu(false); }, [location.pathname]);
  return <>
    <a className="skip-link" href="#conteudo" onClick={event => { event.preventDefault(); document.getElementById('conteudo')?.focus(); }}>Ir para o conteúdo</a>
    <header ref={headerRef} className={`header header-white ${scrolled ? 'solid' : ''}`}>
      <div className="header-main-row">
        <Link className="brand-link" to="/" aria-label="Paradise Island, início"><Brand /></Link>
        <nav className="header-nav-elastic" aria-label="Navegação principal">
          <div className="header-rubber header-links">
            {navigation.map(item => <Link key={item.href} to={destination(item.href)} className="header-section-link" aria-current={active === item.href ? (location.pathname === item.href ? 'page' : 'location') : undefined}>
              {active === item.href && <motion.span className="header-link-active" layoutId="header-active-link" transition={stopped ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 34 }} aria-hidden="true" />}
              <span className="header-link-label">{item.label}</span>
            </Link>)}
          </div>
        </nav>
        <div className="header-actions"><button className="motion-toggle" onClick={toggle} aria-label={paused ? 'Retomar animações' : 'Pausar animações'} aria-pressed={paused} title={paused ? 'Retomar animações' : 'Pausar animações'}>{paused ? '▶' : 'Ⅱ'}</button><button className="menu-toggle" onClick={() => setMenu(true)} aria-expanded={menu} aria-label="Abrir menu"><span /><span /><span className="menu-label">Menu</span></button></div>
      </div>
    </header>
    {menu && <Modal label="Menu principal" onClose={() => setMenu(false)} className="menu-modal"><div className="menu-top"><Brand /><button className="close-button" onClick={() => setMenu(false)} aria-label="Fechar menu">✕</button></div><div className="menu-body"><nav aria-label="Todos os destinos">{nav.map((item, i) => <Link key={item.href} to={destination(item.href)} aria-current={active === item.href ? "location" : undefined} onClick={() => setMenu(false)} onFocus={() => setPreview(item.image)} onMouseEnter={() => setPreview(item.image)}><small>0{i + 1}</small>{item.label}<Arrow diagonal /></Link>)}<Link to="/reservas" onClick={() => setMenu(false)}>Planejar estadia <Arrow /></Link></nav><div className="menu-preview"><Media id={preview} /><span>Descubra um outro ritmo.</span></div></div><p className="menu-note">Um resort fictício. Uma experiência para imaginar.</p></Modal>}
    <main id="conteudo" tabIndex={-1}><motion.div key={location.pathname} initial={{ opacity: stopped ? 1 : 0, y: stopped ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: stopped ? 0 : 0.25, ease: 'easeOut' }}><Outlet /></motion.div></main>
    <section className="invitation"><Eyebrow>O SEU PRÓXIMO CAPÍTULO</Eyebrow><h2>Permita-se<br />ficar um pouco <DrawCircle>mais.</DrawCircle></h2><Link className="button cream" to="/reservas">Planejar minha estadia <Arrow diagonal /></Link><p>Uma consulta demonstrativa para imaginar sua próxima pausa.</p></section>
    <FictionalLogoLoop />
    <footer className="footer"><div className="footer-top"><Link to="/" aria-label="Voltar ao início"><Brand /></Link><p>O luxo de estar presente.<br />A liberdade de apenas ser.</p><nav aria-label="Rodapé">{nav.map(item => <Link key={item.href} to={item.href}>{item.label}</Link>)}</nav><div className="fictional-contact"><span>CONTATOS ILUSTRATIVOS</span><p>+55 (81) 99999-9999<br />contato@paradiseislandresort.com</p><p>Recepção 24h · briefing fictício<br />Atol das Ilhas Paradisíacas, Brasil</p></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Paradise Island</span><span>Resort fictício · Projeto de portfólio · Imagens ilustrativas</span><button className="text-button" onClick={top}>Voltar ao topo ↑</button></div></footer>
    {scrolled && <div className="back-to-top"><SpecularButton size="sm" radius={26} tint="#173e37" tintOpacity={1} textColor="#ffffff" lineColor="#dccba4" baseColor="#78998c" intensity={1.8} glow={1.5} speed={0.45} autoAnimate={!stopped} followMouse={!stopped} onClick={top} aria-label="Voltar ao início da página">↑ <span>Início</span></SpecularButton></div>}
  </>;
}
