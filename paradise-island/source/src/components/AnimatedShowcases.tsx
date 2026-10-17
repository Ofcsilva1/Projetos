import { useRef, useState } from 'react';
import { useInView } from 'motion/react';
import EchoText from './references/EchoText';
import ScrollVelocity from './references/ScrollVelocity';
import LogoLoop from './references/LogoLoop';
import CircularCarousel from './references/CircularCarousel';
import DriftWall from './references/DriftWall';
import { galleryIds, imageUrl, media, type ImageId } from '../data/content';
import { Eyebrow, TextLink } from './Primitives';
import { useMotionSettings } from './MotionSettings';
import { PhotoDialog } from './PhotoDialog';
import { useElementWidth } from './useElementWidth';

export function IslandName() {
  const { stopped } = useMotionSettings();
  return <h1 id="hero-title" className="echo-island-name">{stopped ? <>Paradise<br /><em>Island.</em></> : <><EchoText text="Paradise" mode="both" trail="auto" echoes={6} offset={16} lag={0.14} duration={1500} blur={0.3} fade={0.72} tint="#d4be8e" fontSize="inherit" fontWeight={400} clickBurst={false} direction="left" /><br /><em><EchoText text="Island." mode="both" trail="auto" echoes={6} offset={14} lag={0.16} duration={1800} blur={0.2} fade={0.72} tint="#d4be8e" fontSize="inherit" fontWeight={400} clickBurst={false} direction="right" /></em></>}</h1>;
}

export function IslandMarquee() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: '100px' });
  const { stopped } = useMotionSettings();
  const text = 'Villas privativas · Spa & bem-estar · O oceano à mesa';
  return <div className="island-marquee" ref={ref}><span className="sr-only">{text}. Praia, piscina e experiências na ilha.</span><div aria-hidden="true">{!stopped && visible ? <ScrollVelocity texts={[text, 'Praia & piscina · Descobertas pelo azul · Paradise Island']} velocity={35} numCopies={4} gap={45} separator="✳" fontSize="clamp(30px, 4.4vw, 66px)" fontWeight={400} pauseOnHover skewWithVelocity={6} scaleWithVelocity={0.05} fadeEdges /> : <div className="static-marquee">{text}</div>}</div></div>;
}

export function CircularMemories() {
  const { stopped, paused, toggle } = useMotionSettings();
  const [opened, setOpened] = useState<ImageId | null>(null);
  const [focused, setFocused] = useState(false);
  const { ref: stageRef, width } = useElementWidth<HTMLDivElement>();
  const mobile = width < 700;
  const cardWidth = mobile ? Math.max(260, width * 0.86) : Math.min(820, Math.max(400, width * 0.36));
  return <section className="home-circular" aria-label="Carrossel circular de fotos da ilha"><div className="container section-heading"><div><Eyebrow>A ILHA EM PERSPECTIVA</Eyebrow><h2>Um giro pelo<br /><em>seu próximo refúgio.</em></h2></div><div><p>Arraste as paisagens. Escolha um instante.<br />Entre mais perto da ilha.</p><button className="motion-inline" onClick={toggle} aria-pressed={paused}>{paused ? '▶ Retomar animações' : 'Ⅱ Pausar animações'}</button></div></div><div className="home-circular-stage" ref={stageRef} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}><CircularCarousel items={galleryIds.map(id => ({ src: imageUrl(id, 1280), alt: media[id].alt, title: media[id].title, subtitle: media[id].category }))} preset={mobile ? "panorama" : "cylinder"} intro={stopped ? 'none' : 'rise'} cardWidth={cardWidth} aspectRatio={1.45} speed={9} captions captionSpace={140} gap={mobile ? 20 : 38} tilt={mobile ? 0 : -4} curve={0.85} perspective={5000} autoplay={stopped || focused ? 'off' : 'drift'} interval={8} direction="left" momentum={0.45} snap pauseOnHover focusOnClick draggable parallax={stopped ? 0 : 0.12} stretch={stopped ? 0 : 0.18} fadeColor="#e7e9de" depthFade={0.16} innerShade={0.12} cornerRadius={12} onChange={() => {}} onItemClick={(_item: unknown, index: number) => setOpened(galleryIds[index])} className="landing-circular" style={{}} paused={stopped} /><p className="fine-print">Use as setas ou arraste. Selecione uma imagem para ampliar.</p></div>{opened && <PhotoDialog id={opened} onChange={setOpened} onClose={() => setOpened(null)} />}</section>;
}

export function DriftingMemories() {
  const { stopped, paused, toggle } = useMotionSettings();
  const [opened, setOpened] = useState<ImageId | null>(null);
  const { ref: wallRef, width: wallWidth } = useElementWidth<HTMLDivElement>();
  return <section className="drift-story" aria-label="Mural animado de fotografias"><div className="drift-story-copy container"><Eyebrow>DEIXE OS OLHOS VIAJAREM</Eyebrow><h2>Uma ilha inteira<br />em <em>movimento.</em></h2><p>O verde que acolhe. O azul que convida.<br />Um mosaico de lugares para sentir.</p><TextLink to="/galeria">Explorar todas as imagens</TextLink><button className="motion-inline" onClick={toggle} aria-pressed={paused}>{paused ? '▶ Retomar animações' : 'Ⅱ Pausar animações'}</button></div><div className="drift-story-wall" ref={wallRef}><div className="drift-visual" aria-hidden="true"><DriftWall items={galleryIds.map(id => ({ image: imageUrl(id, 640), title: media[id].title, id, href: undefined }))} columns={wallWidth < 600 ? 3 : 4} tileWidth={wallWidth < 600 ? 190 : 280} tileHeight={wallWidth < 600 ? 145 : 205} gap={18} tilt={12} turn={-12} roll={-7} perspective={1300} depth={90} speed={34} variance={0.32} parallax={0.35} pauseOnHover lift={40} fade={0.45} dim={1} overlayColor="#173e37" radius={10} grayscale={false} className="resort-drift-wall" style={{}} paused={stopped} onItemClick={(item: { id: ImageId }) => setOpened(item.id)} /></div><div className="drift-photo-controls" role="group" aria-label="Fotos do mural">{galleryIds.map((id, index) => <button key={id} onClick={() => setOpened(id)} aria-label={`Ampliar: ${media[id].title}`}><img src={imageUrl(id, 640)} alt="" loading="lazy" /><span>{String(index + 1).padStart(2, "0")}</span></button>)}</div></div>{opened && <PhotoDialog id={opened} onChange={setOpened} onClose={() => setOpened(null)} />}</section>;
}

const fictionalBrands = ['BRISA', 'oceanic', 'SOLARA', 'maré', 'BOTÂNICA'];
export function FictionalLogoLoop() {
  const { stopped } = useMotionSettings();
  const logos = fictionalBrands.map((name, index) => ({ node: <span className={`concept-logo concept-logo-${index}`}><span aria-hidden="true">{['✳', '≈', '☼', '◒', '❋'][index]}</span>{name}</span>, ariaLabel: `${name}, marca fictícia` }));
  return <section className="concept-brands"><Eyebrow>UNIVERSO PARADISE</Eyebrow><p>Marcas conceituais criadas para esta experiência.</p>{stopped ? <div className="static-logos">{logos.map((item, index) => <div key={index}>{item.node}</div>)}</div> : <LogoLoop logos={logos} speed={45} logoHeight={55} gap={80} pauseOnHover fadeOut fadeOutWidth={0.1} scaleOnHover draggable intro={false} muted={0} ariaLabel="Loop de marcas fictícias do projeto" />}</section>;
}
