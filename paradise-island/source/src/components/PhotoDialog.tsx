import { useEffect } from 'react';
import { galleryIds, imageUrl, media, type ImageId } from '../data/content';
import { Modal } from './Modal';
import { Eyebrow } from './Primitives';

export function PhotoDialog({ id, onChange, onClose }: { id: ImageId; onChange: (id: ImageId) => void; onClose: () => void }) {
  const step = (delta: number) => onChange(galleryIds[(galleryIds.indexOf(id) + delta + galleryIds.length) % galleryIds.length]);
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [id]);
  return <Modal label="Fotografias da ilha" onClose={onClose} className="lightbox"><button className="close-button" aria-label="Fechar imagem" onClick={onClose}>✕</button><img src={imageUrl(id, 1920)} alt={media[id].alt} width="1920" height="1072" /><div className="lightbox-bottom"><div aria-live="polite"><Eyebrow>{media[id].category}</Eyebrow><h2>{media[id].title}</h2><p>{galleryIds.indexOf(id) + 1} de {galleryIds.length} · Imagem ilustrativa</p></div><div><button className="round-button" onClick={() => step(-1)} aria-label="Imagem anterior">←</button><button className="round-button" onClick={() => step(1)} aria-label="Próxima imagem">→</button></div></div></Modal>;
}
