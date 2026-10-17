import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Media } from '../components/Media';
import { Arrow, Eyebrow, TextLink } from '../components/Primitives';
import { scrollToSection } from '../components/navigation';
import { services } from '../data/content';
import { IslandName, IslandMarquee, CircularMemories, DriftingMemories } from '../components/AnimatedShowcases';
import SquishSwitch from '../components/references/SquishSwitch';

function ExperienceCarousel() {
  const items = [services[2], services[3], services[1], services[5]];
  const [active, setActive] = useState(0);
  const current = items[active];
  const [start, setStart] = useState<number | null>(null);
  const change = (delta: number) => setActive(i => (i + delta + items.length) % items.length);
  return <section id="experiencias" className="experience-feature container" aria-label="Carrossel de experiências"><div className="experience-image" onTouchStart={e => setStart(e.touches[0].clientX)} onTouchEnd={e => { if (start !== null && Math.abs(e.changedTouches[0].clientX - start) > 55) change(e.changedTouches[0].clientX < start ? 1 : -1); setStart(null); }}><motion.div className="experience-photo-motion" key={current.image} initial={{ opacity: 0.4, scale: 1.025 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55, ease: "easeOut" }}><Media id={current.image} /></motion.div><span className="image-corner">PARADISE, À SUA MANEIRA</span></div><div className="experience-copy"><Eyebrow>04 / EXPERIÊNCIAS</Eyebrow><div aria-live="polite" aria-atomic="true"><span className="mini-label">{current.eyebrow.split('/')[1]}</span><h2>{current.title}</h2><p>{current.description}</p><TextLink to={current.href}>Descobrir experiência</TextLink></div><div className="carousel-controls"><span className="slide-count">0{active + 1}<small> / 0{items.length}</small></span><div className="slide-bars">{items.map((item, i) => <button key={item.id} aria-label={`Ver ${item.title}`} aria-pressed={i === active} onClick={() => setActive(i)} />)}</div><button className="round-button" onClick={() => change(-1)} aria-label="Experiência anterior">←</button><button className="round-button" onClick={() => change(1)} aria-label="Próxima experiência">→</button></div></div></section>;
}

export function Sunset() {
  const [night, setNight] = useState(false);
  return <section id="gastronomia" className={`sunset-section ${night ? 'night' : ''}`} aria-label="O pôr do sol"><Media id={night ? 'jantar' : 'sunset'} sizes="100vw" /><div className="sunset-shade" /><div className="sunset-content"><Eyebrow>06 / A HORA DOURADA</Eyebrow><h2>Alguns instantes<br />pedem para <em>ficar.</em></h2><p>O céu muda de cor. A conversa desacelera.<br />E o dia encontra seu mais bonito desfecho.</p><TextLink light to="/gastronomia">Viver os sabores da ilha</TextLink></div><div className="sunset-control"><span>Entardecer</span><SquishSwitch checked={night} onChange={setNight} ariaLabel="Mostrar atmosfera noturna" label="" width={64} height={36} radius={18} speed={50} stretch={12} hoverScale={1} colorDuration={320} disabled={false} trackColor="#ffffff50" trackOnColor="#d9c6a6" thumbColor="#fffaf1" thumbOnColor="#173e37" className="" id="atmosfera" /><span>Noite</span><small>Duas cenas, uma passagem editorial.</small></div></section>;
}

export function Home() {
  return <>
    <section id="inicio" className="hero" aria-labelledby="hero-title"><Media id="aerea" priority sizes="100vw" /><div className="hero-overlay" /><div className="hero-content"><Eyebrow>UM REFÚGIO. UM NOVO HORIZONTE.</Eyebrow><IslandName /><p>Entre o verde e o azul, descubra<br />o luxo de viver em outro ritmo.</p><Link className="button glass" to="/ilha">Explore a ilha <Arrow diagonal /></Link></div><div className="hero-bottom"><a href="#paraiso" onClick={e => { e.preventDefault(); const target = document.getElementById("paraiso"); if (target) scrollToSection(target); }} className="scroll-cue"><span>↓</span> DEIXE A ILHA REVELAR-SE</a><span className="hero-coordinate">NATUREZA, TEMPO E PRESENÇA<span>PARADISE ISLAND · RESORT & RETREAT</span></span><span className="hero-page">01 <small>/ 08</small></span></div></section>
    <IslandMarquee />
    <section id="paraiso" className="intro-section container"><div className="intro-kicker"><Eyebrow>01 / O PARAÍSO</Eyebrow><span className="ornament" aria-hidden="true">✳</span></div><div data-reveal><h2>Há lugares que você visita.<br />E lugares que <em>ficam em você.</em></h2><div className="intro-bottom"><p>O som do mar. A sombra das palmeiras. O tempo que, enfim, volta a ser seu. Paradise Island é um convite para trocar a pressa pela presença e descobrir uma forma mais leve de estar no mundo.</p><TextLink to="/ilha">Encontre o seu lugar</TextLink></div></div></section>
    <CircularMemories />
    <section id="ilha" className="island-section"><div className="section-heading container" data-reveal><div><Eyebrow>02 / EXPLORE A ILHA</Eyebrow><h2>Cada caminho,<br /><em>uma descoberta.</em></h2></div><p>Do primeiro mergulho à última luz do dia.<br />Escolha um ambiente e deixe-se levar.</p></div><div className="island-editorial-photo"><Media id="aerea" sizes="100vw" /><span className="image-caption">PARADISE ISLAND</span></div></section>
    <section id="acomodacoes" className="stay-section container" data-reveal><div className="stay-heading"><Eyebrow>03 / ACOMODAÇÕES</Eyebrow><h2>Um refúgio para<br />chamar de <em>seu.</em></h2><p>Madeira, luz natural e o oceano como companhia. Espaços que convidam a ficar — e a simplesmente ser.</p><TextLink to="/acomodacoes">Conhecer as acomodações</TextLink></div><Link to="/acomodacoes/bangalos-villas-privativas" className="stay-photo"><Media id="villa" /><span className="stay-photo-caption"><span>Bangalôs & Villas<small>PRIVACIDADE · VISTA PARA O MAR · PISCINA PRIVATIVA</small></span><span className="round-button pale" aria-hidden="true">↗</span></span></Link><div className="stay-note"><span>01</span><p>Abra as portas.<br />Deixe o mundo lá fora.</p></div></section>
    <DriftingMemories />
    <ExperienceCarousel />
    <section className="pool-section"><div className="pool-heading container" data-reveal><Eyebrow>05 / ENTRE O MAR E A PISCINA</Eyebrow><h2>O horizonte<br />é o seu <em>único limite.</em></h2><TextLink to="/experiencias#praia-piscina">Descobrir praia & piscina</TextLink></div><div className="pool-photo"><Media id="piscina" sizes="100vw" /><span>O TEMPO PASSA DIFERENTE POR AQUI.</span></div></section>
    <Sunset />
    <section id="galeria" className="gallery-teaser container" data-reveal><div><Eyebrow>07 / MEMÓRIAS ANTES DA VIAGEM</Eyebrow><h2>Um olhar<br />para o <em>essencial.</em></h2><TextLink to="/galeria">Percorrer a galeria</TextLink></div><Link to="/galeria" aria-label="Abrir galeria: spa"><Media id="spa" /></Link><Link to="/galeria" aria-label="Abrir galeria: detalhes da ilha"><Media id="detalhes" /></Link></section>
  </>;
}
