import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { galleryIds, imageUrl, media, type ImageId } from '../data/content';
import { Media } from '../components/Media';
import { Modal } from '../components/Modal';
import { Eyebrow } from '../components/Primitives';
import RubberSegment from '../components/references/RubberSegment';
import CircularCarousel from '../components/references/CircularCarousel';

export function Gallery() {
  const [filter, setFilter] = useState('Todos');
  const [opened, setOpened] = useState<ImageId | null>(null);
  const [cinema, setCinema] = useState(false);
  const reduced = useReducedMotion();
  const ids = galleryIds.filter(id => filter === 'Todos' || media[id].category === filter);
  const step = (delta: number) => setOpened(current => ids[(ids.indexOf(current!) + delta + ids.length) % ids.length]);
  useEffect(() => {
    if (!opened) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); } };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [opened, filter]);
  return <><section className="gallery-heading container"><Eyebrow>GALERIA / UM OLHAR MAIS DEMORADO</Eyebrow><h1>Guarde o que<br />faz você <em>sentir.</em></h1><p>Paisagens, detalhes e momentos da ilha. Uma coleção de inspirações para a sua próxima pausa.</p></section><section className="container gallery-section" aria-label="Fotografias do resort"><div className="gallery-toolbar"><RubberSegment items={['Todos', 'Estadia', 'Mar', 'Bem-estar', 'Sabores']} value={filter} onChange={(value: string) => { setFilter(value); setCinema(false); }} trackColor="#e8e2d6" thumbColor="#173e37" textColor="#173e37" activeTextColor="#fffaf1" size="md" radius={3} inset={3} equalSlots={false} stretch={25} squash={1} speed={1} glide={25} draggable={true} disabled={false} className="gallery-filter" aria-label="Filtrar galeria por ambiente" /><span aria-live="polite">{ids.length} imagens</span></div><div className="gallery-grid">{ids.map(id => <button key={id} className="gallery-item" onClick={() => setOpened(id)} aria-label={`Ampliar: ${media[id].title}`}><Media id={id} sizes="(max-width: 640px) 90vw, 45vw" /><span><small>{media[id].category}</small>{media[id].title}<span aria-hidden="true">↗</span></span></button>)}</div><div className="cinema-invitation"><div><Eyebrow>UM OUTRO PONTO DE VISTA</Eyebrow><h2>A ilha em <em>movimento.</em></h2></div><button className="button outline" onClick={() => setCinema(x => !x)} aria-expanded={cinema} aria-controls="cinema">{cinema ? 'Fechar vista circular' : 'Abrir vista circular'} <span aria-hidden="true">{cinema ? '−' : '+'}</span></button></div>{cinema && <div id="cinema" className="circular-showcase"><CircularCarousel items={ids.map(id => ({ src: imageUrl(id, 640), alt: media[id].alt, title: media[id].title, subtitle: media[id].category }))} preset="cylinder" intro="none" cardWidth={260} aspectRatio={1.3} speed={0} captions={true} gap={24} tilt={-3} curve={reduced ? 0 : 0.25} perspective={3200} autoplay="off" interval={8} direction="left" momentum={0.15} snap={true} pauseOnHover={true} focusOnClick={true} draggable={true} parallax={reduced ? 0 : 0.05} stretch={0} fadeColor="#f4efe6" depthFade={0.18} innerShade={0.1} cornerRadius={4} onChange={() => {}} onItemClick={(_item: unknown, index: number) => setOpened(ids[index])} className="" style={{}} /><p className="fine-print">Arraste ou use as setas do teclado. Enter amplia a imagem selecionada. As imagens acima oferecem os mesmos destinos.</p></div>}</section>{opened && <Modal label="Visualização ampliada da galeria" className="lightbox" onClose={() => setOpened(null)}><button className="close-button" aria-label="Fechar imagem" onClick={() => setOpened(null)}>✕</button><img src={imageUrl(opened, 1920)} alt={media[opened].alt} width="1920" height="1072" /><div className="lightbox-bottom"><div aria-live="polite"><Eyebrow>{media[opened].category}</Eyebrow><h2>{media[opened].title}</h2><p>{ids.indexOf(opened) + 1} de {ids.length} · Imagens ilustrativas{opened === 'detalhes' ? ' · Cena de atmosfera, sem oferta de café flutuante' : ''}</p></div><div><button className="round-button" aria-label="Imagem anterior" onClick={() => step(-1)}>←</button><button className="round-button" aria-label="Próxima imagem" onClick={() => step(1)}>→</button></div></div></Modal>}</>;
}
